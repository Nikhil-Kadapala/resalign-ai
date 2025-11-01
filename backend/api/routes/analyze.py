"""
Schema-aware analysis endpoint with SSE progress streaming.
"""
import logging
import json
import asyncio
import io
from datetime import datetime, timezone
from typing import AsyncGenerator, List, Any
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from markitdown import MarkItDown

from api.services.supabase import get_supabase_client
from api.services.scorer import get_scoring_service
from api.services.resume_recommendation_service import get_resume_recommendation_service
from api.services.learning_resource_service import get_learning_resource_service
from api.services.fit_rationale_service import get_fit_rationale_service
from api._types import ResumeStructuredData, JDStructuredData
from api.types.analysis import AnalyzeRequestParams

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1", tags=["Analysis"])


@router.post("/analyze")
async def analyze_sse_stream(
    params: AnalyzeRequestParams = Depends()
):
    """
    Analyze resume against JD with real-time SSE progress streaming.
    
    Uses POST with Authorization header for secure token handling.
    Streams progress updates in Server-Sent Events format.
    
    Args:
        params: AnalyzeRequestParams containing:
            - resume_db_id: UUID of resume from request body
            - jd_db_id: UUID of JD from request body
            - user_id: Extracted from Authorization header JWT token
    
    Returns:
        StreamingResponse with SSE formatted progress updates
    """
    
    # Instantiate services directly
    supabase = get_supabase_client()
    scorer = get_scoring_service()
    user_id = params.user_id
    
    async def generate_stream() -> AsyncGenerator[str, None]:
        """Generate SSE formatted progress updates."""
        analysis_id = None
        
        try:
            # Check if analysis already exists and is completed
            existing_analyses = await supabase.select(
                table="analyses",
                query_filter={
                    "resume_id": params.resume_db_id,
                    "jd_id": params.jd_db_id,
                    "user_id": user_id
                }
            )
            
            if existing_analyses:
                existing_analysis = existing_analyses[0]
                if existing_analysis.get("status") == "completed" and existing_analysis.get("report"):
                    # Return existing completed analysis immediately
                    logger.info(f"Found existing completed analysis: {existing_analysis.get('id')}")
                    report = existing_analysis.get("report", {})
                    complete_data = {
                        "event": "complete",
                        "data": {
                            "analysis_id": existing_analysis.get("id"),
                            "overall_score": report.get("overall_score", 0),
                            "fit_classification": report.get("fit_classification", "NOT_FIT"),
                            "fit_rationale": report.get("fit_rationale", ""),
                            "category_scores": report.get("category_scores", {}),
                            "recommendations": report.get("recommendations", []),
                            "learning_resources": report.get("learning_resources", []),
                            "progress": 100,
                            "message": "Analysis complete!"
                        }
                    }
                    yield f"data: {json.dumps(complete_data)}\n\n"
                    yield "data: [DONE]\n\n"
                    return
            
            # ===== STAGE 1 (30%): "Starting Analysis" =====
            yield f"data: {json.dumps({'event': 'progress', 'data': {'stage': 'starting_analysis', 'progress': 30, 'message': 'Starting Analysis'}})}\n\n"
            
            logger.info(f"Creating analysis record for user: {user_id}")
            
            # Create analysis record in database
            analysis_record = await supabase.insert(
                table="analyses",
                data={
                    "user_id": user_id,
                    "resume_id": params.resume_db_id,
                    "jd_id": params.jd_db_id,
                    "status": "running"
                }
            )
            
            if not analysis_record:
                raise Exception("Failed to create analysis record")
            
            analysis_id = analysis_record.get("id")
            logger.info(f"Analysis record created: {analysis_id}")
            
            # Fetch resume and JD from database
            logger.info(f"Fetching resume and JD data for analysis")
            
            resumes = await supabase.select(
                table="resumes",
                query_filter={"id": params.resume_db_id, "user_id": user_id}
            )
            
            jds = await supabase.select(
                table="job_descriptions",
                query_filter={"id": params.jd_db_id, "user_id": user_id}
            )
            
            if not resumes or not jds:
                raise Exception("Resume or JD not found in database")
            
            # Parse extracted data back into Pydantic models
            resume_data = resumes[0].get("extracted_data", {})
            jd_data = jds[0].get("extracted_data", {})
            resume_storage_path = resumes[0].get("supabase_storage_path")
            
            resume = ResumeStructuredData(**resume_data)
            jd = JDStructuredData(**jd_data)
            
            logger.info("Resume and JD data loaded successfully")
            
            # Download and convert resume to markdown for recommendation service
            resume_markdown = ""
            try:
                if resume_storage_path:
                    logger.info(f"Downloading resume file from storage: {resume_storage_path}")
                    resume_bytes = await supabase.download_file(resume_storage_path)
                    
                    # Convert to markdown using MarkItDown
                    md = MarkItDown(enable_plugins=False)
                    result = md.convert(io.BytesIO(resume_bytes))
                    resume_markdown = result.text_content
                    logger.info(f"Resume converted to markdown: {len(resume_markdown)} characters")
                else:
                    logger.warning("No resume storage path found, proceeding without markdown")
            except Exception as md_error:
                logger.warning(f"Failed to convert resume to markdown (non-blocking): {str(md_error)}")
                # Continue without markdown - structured data is still available
            
            await asyncio.sleep(0.3)
            
            # ===== STAGE 2 (60%): "Calculating Scores" =====
            yield f"data: {json.dumps({'event': 'progress', 'data': {'stage': 'calculating_scores', 'progress': 60, 'message': 'Calculating Scores'}})}\n\n"
            
            logger.info("Calculating category scores")
            scores = scorer.calculate_scores(resume, jd)
            overall_score = scores.get("overall_score", 0)
            fit_classification = scorer.determine_fit_classification(overall_score)
            
            # Get detailed match information for rationale generation
            match_details = scorer.get_match_details(resume, jd)
            
            logger.info(f"Scores calculated: overall={overall_score:.1f}, fit={fit_classification.value}")
            await asyncio.sleep(0.3)
            
            # ===== STAGE 3 (65%): "Assessing Job Fit" =====
            yield f"data: {json.dumps({'event': 'progress', 'data': {'stage': 'assessing_job_fit', 'progress': 65, 'message': 'Assessing Job Fit'}})}\n\n"
            
            # Generate fit rationale first (needed by recommendation service)
            fit_rationale = ""
            try:
                logger.info("Generating fit rationale with LLM")
                fit_rationale_service = get_fit_rationale_service()
                fit_rationale = fit_rationale_service.generate_rationale(
                    resume=resume,
                    jd=jd,
                    scores=scores,
                    match_details=match_details,
                    overall_score=overall_score,
                    fit_classification=fit_classification.value
                )
                logger.info(f"Fit rationale generated: {len(fit_rationale)} characters")
            except Exception as rationale_error:
                logger.warning(f"Fit rationale generation failed (non-blocking): {str(rationale_error)}")
            
            await asyncio.sleep(0.3)
            
            # ===== STAGE 4 (80%): "Generating Personalized Recommendations" =====
            yield f"data: {json.dumps({'event': 'progress', 'data': {'stage': 'generating_recommendations', 'progress': 80, 'message': 'Generating Personalized Recommendations'}})}\n\n"
            
            # Run resume recommendations and learning resources in parallel
            recommendations_text: List[str] = []
            learning_resources: List[Any] = []
            
            try:
                logger.info("Generating resume recommendations and learning resources in parallel")
                
                # Define async tasks that wrap blocking LLM calls
                async def get_resume_recommendations():
                    # Wrap the blocking LLM call in a thread pool
                    resume_rec_service = get_resume_recommendation_service()
                    return await asyncio.to_thread(
                        resume_rec_service.generate_recommendations,
                        resume_markdown=resume_markdown or "Resume content not available in markdown format",
                        resume=resume,
                        jd=jd,
                        fit_rationale=fit_rationale,
                        scores=scores,
                        overall_score=overall_score,
                        fit_classification=fit_classification.value
                    )
                
                async def get_learning_resources():
                    # Wrap the blocking LLM call in a thread pool
                    learning_res_service = get_learning_resource_service()
                    return await asyncio.to_thread(
                        learning_res_service.generate_resources,
                        resume=resume,
                        jd=jd,
                        scores=scores,
                        match_details=match_details,
                        overall_score=overall_score,
                        fit_classification=fit_classification.value
                    )
                
                # Run both in parallel
                results = await asyncio.gather(
                    get_resume_recommendations(),
                    get_learning_resources(),
                    return_exceptions=True
                )
                
                # Extract results - ensure we always have valid lists
                if not isinstance(results[0], Exception) and results[0] is not None:
                    recommendations_text = results[0] if isinstance(results[0], list) else []
                    logger.info(f"Generated {len(recommendations_text)} resume recommendations")
                else:
                    logger.warning(f"Resume recommendations failed: {str(results[0]) if isinstance(results[0], Exception) else 'None returned'}")
                    recommendations_text = []  # Ensure empty list on failure
                
                if not isinstance(results[1], Exception) and results[1] is not None:
                    learning_resources = results[1] if isinstance(results[1], list) else []
                    logger.info(f"Generated {len(learning_resources)} learning resources")
                else:
                    logger.warning(f"Learning resources failed: {str(results[1]) if isinstance(results[1], Exception) else 'None returned'}")
                    learning_resources = []  # Ensure empty list on failure
                
            except Exception as rec_error:
                logger.warning(f"Recommendation generation failed (non-blocking): {str(rec_error)}")
                # Ensure we have valid empty lists
                recommendations_text = []
                learning_resources = []
            
            await asyncio.sleep(0.3)
            
            # ===== STAGE 5 (90%): "Saving Results" =====
            yield f"data: {json.dumps({'event': 'progress', 'data': {'stage': 'saving', 'progress': 90, 'message': 'Saving Results'}})}\n\n"
            
            logger.info(f"Updating analysis record: {analysis_id}")
            
            # Build report JSON
            report = {
                "overall_score": overall_score,
                "fit_classification": fit_classification.value,
                "fit_rationale": fit_rationale,
                "category_scores": {
                    cat: score for cat, score in scores.items()
                    if cat != "overall_score"
                },
                "recommendations": recommendations_text if recommendations_text else [],
                "learning_resources": [
                    lr.model_dump() if hasattr(lr, 'model_dump') else {
                        "title": getattr(lr, 'title', 'Unknown'),
                        "description": getattr(lr, 'description', ''),
                        "category": getattr(lr, 'category', 'technical_skills'),
                        "resource_type": getattr(lr, 'resource_type', 'course'),
                        "url": getattr(lr, 'url', ''),
                        "estimated_hours": getattr(lr, 'estimated_hours', 0)
                    }
                    for lr in (learning_resources if learning_resources else [])
                ]
            }
            
            # Update analysis record with report as JSONB
            await supabase.update(
                table="analyses",
                data={
                    "status": "completed",
                    "report": report,
                    "completed_at": datetime.now(timezone.utc).isoformat()
                },
                query_filter={"id": analysis_id}
            )
            
            logger.info(f"Analysis completed successfully: {analysis_id}")
            
            # ===== STAGE 6 (100%): "Complete" =====
            complete_data = {
                "event": "complete",
                "data": {
                    "analysis_id": analysis_id,
                    "overall_score": overall_score,
                    "fit_classification": fit_classification.value,
                    "fit_rationale": fit_rationale,
                    "category_scores": {
                        cat: score for cat, score in scores.items()
                        if cat != "overall_score"
                    },
                    "recommendations": recommendations_text if recommendations_text else [],
                    "learning_resources": [
                        lr.model_dump() if hasattr(lr, 'model_dump') else {
                            "title": getattr(lr, 'title', 'Unknown'),
                            "description": getattr(lr, 'description', ''),
                            "category": getattr(lr, 'category', 'technical_skills'),
                            "resource_type": getattr(lr, 'resource_type', 'course'),
                            "url": getattr(lr, 'url', ''),
                            "estimated_hours": getattr(lr, 'estimated_hours', 0)
                        }
                        for lr in (learning_resources if learning_resources else [])
                    ],
                    "progress": 100,
                    "message": "Analysis complete!"
                }
            }
            
            logger.info(f"Sending complete event with {len(recommendations_text)} recommendations and {len(learning_resources)} learning resources")
            logger.debug(f"Complete event data: {json.dumps(complete_data, indent=2)[:500]}...")  # Log first 500 chars
            
            yield f"data: {json.dumps(complete_data)}\n\n"
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}", exc_info=True)
            
            # Update analysis record with error if it was created
            if analysis_id:
                try:
                    await supabase.update(
                        table="analyses",
                        data={"status": "error", "error": str(e)},
                        query_filter={"id": analysis_id}
                    )
                except Exception as update_error:
                    logger.error(f"Failed to update error status: {str(update_error)}")
            
            error_data = {
                "event": "error",
                "data": {
                    "error": str(e),
                    "message": "Analysis failed. Please try again."
                }
            }
            yield f"data: {json.dumps(error_data)}\n\n"
            yield "data: [DONE]\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )