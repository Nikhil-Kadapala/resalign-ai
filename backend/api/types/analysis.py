"""
Data models for analysis requests and responses.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Literal
from datetime import datetime
from enum import Enum
from fastapi import Body, Depends

from api._utils.auth import get_current_user_id


class AnalyzeRequestParams:
    """
    Dependency class for analyze request parameters.
    
    Extracts resume_db_id, jd_db_id from request body and user_id from JWT token.
    
    ### Usage:
    
    ```python
    @router.post("/analyze")
    async def analyze_endpoint(params: AnalyzeRequestParams = Depends()):
        resume_db_id = params.resume_db_id
        jd_db_id = params.jd_db_id
        user_id = params.user_id
    ```
    """
    
    def __init__(
        self,
        resume_db_id: str = Body(..., description="UUID of resume record from Supabase"),
        jd_db_id: str = Body(..., description="UUID of JD record from Supabase"),
        user_id: str = Depends(get_current_user_id),
    ):
        """
        Initialize analyze request parameters.
        
        Args:
            resume_db_id: UUID of resume stored in Supabase
            jd_db_id: UUID of job description stored in Supabase
            user_id: Authenticated user ID (extracted from JWT token)
        """
        self.resume_db_id = resume_db_id
        self.jd_db_id = jd_db_id
        self.user_id = user_id


class FitClassification(str, Enum):
    """Enum for fit classifications."""

    GOOD_FIT = "GOOD_FIT"
    PARTIAL_FIT = "PARTIAL_FIT"
    NOT_FIT = "NOT_FIT"


class CategoryScore(BaseModel):
    """Score for a single analysis category."""

    category: str
    score: float = Field(..., ge=0, le=100)
    reason: str
    weight: float = Field(..., ge=0, le=1)


class LearningResource(BaseModel):
    """Recommended learning resource."""

    title: str
    url: str
    type: Literal["course", "certification", "article", "book"]
    relevance: str


class AnalysisRequest(BaseModel):
    """Request to analyze resume against JD."""

    resume_id: str = Field(..., description="UUID of resume")
    jd_id: str = Field(..., description="UUID of job description")


class AnalysisResponse(BaseModel):
    """Complete analysis response."""

    analysis_id: str
    resume_id: str
    jd_id: str

    # Extraction results
    resume_extracted: Dict
    jd_extracted: Dict

    # Category analysis
    category_weights: Dict[str, float]
    category_scores: List[CategoryScore]

    # Overall assessment
    composite_score: float = Field(..., ge=0, le=100)
    fit_classification: FitClassification
    fit_rationale: str

    # Recommendations
    actionable_recommendations: List[str]
    learning_resources: List[LearningResource]

    # Metadata
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)
    processing_time_seconds: float


class AnalysisStatus(BaseModel):
    """Real-time status update during analysis."""

    analysis_id: str
    stage: Literal[
        "starting_analysis",
        "calculating_match_score",
        "assessing_job_fit",
        "generating_recommendations",
        "curating_learning_resources",
        "complete",
        "error",
    ]
    progress: float = Field(..., ge=0, le=100)
    message: str


class CategoryScoreExtended(BaseModel):
    """Extended score with strengths and gaps."""

    category: str
    score: float = Field(..., ge=0, le=100)
    reason: str
    strengths: List[str] = []
    gaps: List[str] = []
    weight: float = Field(..., ge=0, le=1)
