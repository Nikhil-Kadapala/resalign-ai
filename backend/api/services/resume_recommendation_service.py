"""
Resume recommendation service for generating AI-powered actionable suggestions.
Provides personalized, second-person recommendations for resume formatting, structure, and content.
"""

import logging
import json
from typing import Dict, Any, List
from api.services.llm_service import Gemini
from api._types import ResumeStructuredData, JDStructuredData
from api._utils.extraction_helpers import mask_pii_data

logger = logging.getLogger(__name__)


class ResumeRecommendationService:
    """Generate AI-powered resume enhancement recommendations using LLM with cached system prompt."""
    
    SYSTEM_PROMPT = """You are an expert resume coach and career advisor with deep expertise in:
- Resume formatting and visual presentation best practices
- ATS (Applicant Tracking System) optimization techniques
- Section hierarchy and content organization strategies
- Impactful content writing using action verbs and quantifiable metrics
- Industry-specific resume standards across various fields
- Modern resume trends and hiring manager preferences

Your role is to provide actionable, specific, and personalized recommendations to help candidates improve their resumes. You address candidates directly in second-person voice (you/your) to create a personalized coaching experience.

## Your Expertise Areas:

### 1. Formatting & Structure
- Optimal section ordering based on candidate's experience level and career stage
- When to prioritize Projects over Experience (career changers, entry-level with strong portfolio)
- When to highlight Education (recent graduates, career transitions)
- Visual hierarchy, white space, and readability optimization
- ATS-friendly formatting (avoiding tables, columns, graphics that break parsing)

### 2. Content Enhancement
- STAR method (Situation-Task-Action-Result) for achievement statements
- Quantifiable metrics and impact demonstration (numbers, percentages, scale)
- Strong action verbs: Implemented, Delivered, Executed, Developed, Led, Architected, Optimized, Scaled, Engineered, Transformed, Launched, Spearheaded
- Removing weak verbs: Responsible for, Worked on, Helped with
- Tailoring content to match job description keywords

### 3. Industry Standards
- Technical roles: emphasizing projects, technical skills, measurable impact
- Leadership roles: highlighting team size, budget, strategic outcomes
- Entry-level: showcasing potential through projects, coursework, internships
- Career changers: bridging transferable skills and relevant experiences

## Your Communication Style:
- Direct and actionable ("You should...", "Consider...", "Add...")
- Specific with concrete examples
- Encouraging yet honest
- Focused on high-impact changes
- Prioritized by importance (most critical recommendations first)
"""
    
    USER_PROMPT_TEMPLATE = """# Resume Enhancement Analysis

## Candidate Context

### Current Resume (Markdown Format):
```markdown
{resume_markdown}
```

### Resume Structured Data:
```json
{resume_structured}
```

### Job Description:
```json
{jd_structured}
```

### Overall Fit Assessment:
- **Composite Score**: {overall_score:.1f}/100
- **Fit Classification**: {fit_classification}
- **Fit Rationale**: {fit_rationale}

### Category Scores:
{category_scores_formatted}

---

## Your Task:

Generate **5-8 actionable recommendations** to help this candidate improve their resume specifically for this job application. Address the candidate directly using second-person voice (e.g., "You should...", "Consider adding...", "Strengthen your...").

### Focus on these areas:

1. **Section Hierarchy & Organization** (2-3 recommendations):
   - Assess if current section order optimally showcases their strengths for THIS job
   - Recommend reordering if needed (e.g., Projects before Experience for career changers)
   - Suggest adding/removing sections based on job requirements
   - Provide specific rationale tied to their experience level and the target role

2. **Content Impact & Achievement Framing** (3-4 recommendations):
   - Identify 2-3 specific bullet points from their experience/projects that need stronger impact
   - Show HOW to reframe them with:
     * Strong action verbs (Implemented, Delivered, Led, Optimized, etc.)
     * Quantifiable metrics (numbers, percentages, scale)
     * Clear outcomes and business impact
   - Provide concrete before/after examples when possible
   - Focus on aligning content with job description keywords and requirements

3. **ATS Optimization & Formatting** (1-2 recommendations):
   - Identify formatting issues that might hurt ATS parsing
   - Recommend keyword additions to match job requirements
   - Suggest improvements to skills section for better keyword matching

### Important Guidelines:
- Be specific and actionable, not generic
- Reference actual content from their resume when giving examples
- Prioritize recommendations by impact (most important first)
- Each recommendation should be 2-4 sentences
- Use encouraging, coaching tone while being direct
- Focus on changes that align with the target job requirements

Generate the recommendations now as a JSON array:
"""
    
    def __init__(self):
        """Initialize resume recommendation service with LLM client."""
        from api.config import settings
        self.llm = Gemini(model=settings.LLM_MODEL, api_key=settings.GEMINI_API_KEY)
        self.cache_created = False
        logger.info(f"ResumeRecommendationService initialized with model: {settings.LLM_MODEL}")
    
    def _ensure_cache(self):
        """Create cached content for system prompt if not already created."""
        if not self.cache_created:
            try:
                cache_id = self.llm.create_cached_content(
                    system_prompt=self.SYSTEM_PROMPT,
                    ttl_hours=1  # Cache for 1 hour
                )
                if cache_id:
                    self.cache_created = True
                    logger.info("Resume recommendation system prompt cached successfully")
                else:
                    # Prompt is too small for caching, will use regular generation
                    self.cache_created = False
                    logger.info("System prompt too small for caching, will use regular generation")
            except Exception as e:
                logger.warning(f"Failed to create cache, will use regular generation: {str(e)}")
                self.cache_created = False
    
    def generate_recommendations(
        self,
        resume_markdown: str,
        resume: ResumeStructuredData,
        jd: JDStructuredData,
        fit_rationale: str,
        scores: Dict[str, float],
        overall_score: float,
        fit_classification: str
    ) -> List[str]:
        """
        Generate resume enhancement recommendations using LLM.
        
        Args:
            resume_markdown: Resume content in markdown format
            resume: Structured resume data
            jd: Structured job description data
            fit_rationale: Generated fit explanation
            scores: Category scores dict
            overall_score: Weighted composite score
            fit_classification: GOOD_FIT | PARTIAL_FIT | NOT_FIT
            
        Returns:
            List[str]: List of actionable recommendations in second-person voice
        """
        try:
            # Prepare structured data for prompt
            resume_data = {
                "name": "[CANDIDATE_MASKED]",
                "current_title": resume.job_title or "Not specified",
                "total_experience_years": sum(exp.duration for exp in (resume.experience or [])),
                "education": [
                    {"degree": edu.degree, "school": "[SCHOOL_MASKED]"}
                    for edu in (resume.education or [])
                ],
                "technical_skills": resume.technical_skills[:15] if resume.technical_skills else [],
                "certifications": [cert.name for cert in (resume.certifications or [])],
                "projects_count": len(resume.projects or []),
                "experience_count": len(resume.experience or []),
            }
            
            jd_data = {
                "job_title": jd.job_title,
                "company": jd.company_name,
                "required_skills": (jd.required_qualifications.skills[:15] 
                                   if jd.required_qualifications.skills else []),
                "required_education": jd.required_qualifications.education or "Not specified",
                "required_experience": jd.required_qualifications.experience or "Not specified",
                "key_responsibilities": jd.job_duties[:5] if jd.job_duties else [],
            }
            
            # Format category scores for readability
            category_scores_formatted = "\n".join([
                f"- **{category.replace('_', ' ').title()}**: {score:.1f}/100"
                for category, score in scores.items()
                if category != "overall_score"
            ])
            
            # Build user prompt
            user_prompt = self.USER_PROMPT_TEMPLATE.format(
                resume_markdown=resume_markdown[:3000],  # Limit markdown length to avoid token overflow
                resume_structured=json.dumps(resume_data, indent=2),
                jd_structured=json.dumps(jd_data, indent=2),
                fit_rationale=fit_rationale,
                overall_score=overall_score,
                fit_classification=fit_classification,
                category_scores_formatted=category_scores_formatted,
            )
            
            # Generate recommendations using LLM with caching
            self._ensure_cache()
            
            if self.cache_created:
                response_text, usage_metadata = self.llm.generate_response_with_cache(
                    user_prompt=user_prompt
                )
                logger.info(f"Generated recommendations using cached prompt. Usage: {usage_metadata}")
            else:
                response_text, usage_metadata = self.llm.generate_response(
                    sys_prompt=self.SYSTEM_PROMPT,
                    user_prompt=user_prompt
                )
                logger.info(f"Generated recommendations without cache. Usage: {usage_metadata}")
            
            # Check if response is valid before parsing
            if response_text is None:
                logger.warning("LLM returned None response, using fallback recommendations")
                return self._generate_fallback_recommendations(overall_score, fit_classification)
            
            # Parse response as JSON array or extract text recommendations
            recommendations = self._parse_recommendations(response_text)
            
            logger.info(f"Generated {len(recommendations)} resume recommendations")
            return recommendations
        
        except Exception as e:
            logger.error(f"Failed to generate resume recommendations: {str(e)}", exc_info=True)
            # Fallback to basic recommendations
            return self._generate_fallback_recommendations(overall_score, fit_classification)
    
    def _parse_recommendations(self, response_text: str) -> List[str]:
        """
        Parse LLM response into list of recommendations.
        
        Args:
            response_text: Raw LLM response
            
        Returns:
            List of recommendation strings
        """
        try:
            # Remove markdown code blocks if present
            if response_text.startswith("```"):
                # Extract content between triple backticks
                lines = response_text.strip().split('\n')
                # Remove opening ```json or ```
                if lines[0].startswith("```"):
                    lines = lines[1:]
                # Remove closing ```
                if lines and lines[-1].strip() == "```":
                    lines = lines[:-1]
                response_text = '\n'.join(lines).strip()
            
            # Try to parse as JSON
            recommendations = json.loads(response_text)
            
            if isinstance(recommendations, list):
                # Extract "recommendation" or "text" field if present
                result = []
                for rec in recommendations:
                    if isinstance(rec, dict):
                        if "recommendation" in rec:
                            result.append(str(rec["recommendation"]))
                        elif "text" in rec:
                            result.append(str(rec["text"]))
                        else:
                            result.append(str(rec))
                    else:
                        result.append(str(rec))
                return result if result else [response_text]
            elif isinstance(recommendations, dict):
                if "recommendations" in recommendations:
                    recs = recommendations["recommendations"]
                    if isinstance(recs, list):
                        return [str(r) if isinstance(r, str) else str(r.get("recommendation", r)) for r in recs]
                return [str(recommendations)]
        except json.JSONDecodeError:
            # If not JSON, split by numbered list or newlines
            logger.debug("Response not JSON, parsing as text")
            
            # Try to extract numbered recommendations
            lines = response_text.strip().split('\n')
            recommendations = []
            current_rec = []
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                    
                # Check if line starts with a number (1., 2., etc.)
                if line and line[0].isdigit() and '.' in line[:3]:
                    if current_rec:
                        recommendations.append(' '.join(current_rec))
                        current_rec = []
                    # Remove the number prefix
                    line = line.split('.', 1)[1].strip()
                    current_rec.append(line)
                elif current_rec:
                    current_rec.append(line)
            
            # Add last recommendation
            if current_rec:
                recommendations.append(' '.join(current_rec))
            
            return recommendations if recommendations else [response_text]
        
        return [response_text]
    
    def _generate_fallback_recommendations(self, overall_score: float, fit_classification: str) -> List[str]:
        """Generate basic recommendations if LLM fails."""
        if fit_classification == "GOOD_FIT":
            return [
                "You should quantify your achievements with specific metrics to make your impact more tangible to hiring managers.",
                "Consider adding more action verbs like 'Implemented', 'Optimized', or 'Led' at the start of your bullet points.",
                "Ensure your technical skills section prominently features the key technologies mentioned in the job description.",
            ]
        elif fit_classification == "PARTIAL_FIT":
            return [
                "You should strengthen your resume by adding more examples that directly address the required skills in the job description.",
                "Consider reordering your sections to highlight your most relevant experiences and projects first.",
                "Reframe your bullet points to emphasize measurable outcomes using numbers, percentages, or scale of impact.",
                "Add any relevant certifications or courses you've completed that align with the job requirements.",
            ]
        else:
            return [
                "You should focus on building projects or gaining experience in the key technologies required for this role.",
                "Consider obtaining certifications in the critical skills mentioned in the job description.",
                "Reframe your existing experience to emphasize transferable skills that apply to this position.",
                "Strengthen your resume's alignment with the job requirements by adding relevant coursework or personal projects.",
            ]


# Singleton instance
_resume_recommendation_service = None


def get_resume_recommendation_service() -> ResumeRecommendationService:
    """
    Get or create resume recommendation service instance.
    Singleton pattern for cache efficiency.
    """
    global _resume_recommendation_service
    if _resume_recommendation_service is None:
        _resume_recommendation_service = ResumeRecommendationService()
    return _resume_recommendation_service

