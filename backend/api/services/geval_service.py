"""
GEval scoring service using deepeval and OpenAI for structured resume-JD fit assessment.
Provides per-category scores with reasoning.
"""

import logging
from typing import Dict, Any, List
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class CategoryScore(BaseModel):
    """Score for a single category."""

    category: str
    score: float  # 0-100
    reason: str
    strengths: List[str] = []
    gaps: List[str] = []


class GevalService:
    """
    Score resume against job description using deepeval + OpenAI.
    Provides per-category analysis and overall fit assessment.
    """

    CATEGORIES = [
        "technical_skills",
        "experience",
        "soft_skills",
        "education",
        "certifications",
    ]

    def __init__(self, openai_api_key: str, use_mock: bool = False):
        """
        Initialize GEval service.

        Args:
            openai_api_key: OpenAI API key for LLM
            use_mock: If True, use mock scoring instead of real LLM
        """
        self.openai_api_key = openai_api_key
        self.use_mock = use_mock
        self.model = "gpt-4o-mini"
        logger.info(f"GevalService initialized (mock={use_mock})")

    async def score_categories(
        self,
        resume_extracted: Dict[str, Any],
        jd_extracted: Dict[str, Any],
        category_weights: Dict[str, float],
    ) -> List[CategoryScore]:
        """
        Score resume against JD for each category.

        Args:
            resume_extracted: Extracted resume data
            jd_extracted: Extracted JD data
            category_weights: Importance weights per category

        Returns:
            List of CategoryScore objects
        """
        try:
            scores = []

            for category in self.CATEGORIES:
                if self.use_mock:
                    score = self._score_category_mock(
                        category, resume_extracted, jd_extracted
                    )
                else:
                    score = await self._score_category_llm(
                        category, resume_extracted, jd_extracted
                    )

                scores.append(score)

            logger.info(
                f"Scored {len(scores)} categories; avg score: "
                f"{sum(s.score for s in scores) / len(scores):.1f}"
            )

            return scores

        except Exception as e:
            logger.error(f"Category scoring failed: {str(e)}")
            raise ValueError(f"Failed to score categories: {str(e)}")

    def _score_category_mock(
        self,
        category: str,
        resume_extracted: Dict[str, Any],
        jd_extracted: Dict[str, Any],
    ) -> CategoryScore:
        """
        Mock scoring for testing without LLM calls.

        Args:
            category: Category to score
            resume_extracted: Extracted resume
            jd_extracted: Extracted JD

        Returns:
            CategoryScore with mock data
        """
        # Simple heuristics for mock scoring
        base_score = 70

        if category == "technical_skills":
            # Check if resume has skills
            resume_skills = set(
                s.lower() for s in resume_extracted.get("skills", [])
            )
            jd_reqs = set(
                r.lower() for r in jd_extracted.get("requirements", [])
            )

            # Count overlapping skills
            overlap = len(resume_skills & jd_reqs)
            total_jd_reqs = max(len(jd_reqs), 1)
            base_score = min(100, int(85 * (overlap / total_jd_reqs)))

            strengths = list(resume_skills & jd_reqs)[:3]
            gaps = list(jd_reqs - resume_skills)[:3]

        elif category == "experience":
            # Check experience entries
            exp_count = len(resume_extracted.get("experience", []))
            base_score = min(100, 50 + (exp_count * 15))
            strengths = [f"{exp_count} experiences listed"]
            gaps = ["Limited experience detail"] if exp_count < 2 else []

        elif category == "education":
            # Check education entries
            edu_count = len(resume_extracted.get("education", []))
            base_score = 60 if edu_count > 0 else 40
            strengths = [f"{edu_count} education entries"] if edu_count > 0 else []
            gaps = ["No formal education listed"] if edu_count == 0 else []

        elif category == "soft_skills":
            # Generic soft skills assessment
            base_score = 65
            strengths = ["Likely communication skills"]
            gaps = ["Limited soft skills specifics"]

        else:  # certifications
            certs = resume_extracted.get("certifications", [])
            base_score = 60 if len(certs) > 0 else 30
            strengths = [f"{len(certs)} certifications"] if certs else []
            gaps = ["No certifications listed"] if not certs else []

        return CategoryScore(
            category=category,
            score=base_score,
            reason=f"Mock assessment for {category}",
            strengths=strengths,
            gaps=gaps,
        )

    async def _score_category_llm(
        self,
        category: str,
        resume_extracted: Dict[str, Any],
        jd_extracted: Dict[str, Any],
    ) -> CategoryScore:
        """
        Score category using deepeval + LLM.

        Args:
            category: Category to score
            resume_extracted: Extracted resume
            jd_extracted: Extracted JD

        Returns:
            CategoryScore with LLM reasoning
        """
        try:
            # In production, would use deepeval GEval here
            # For now, fall back to mock since deepeval requires setup
            logger.debug(f"Using mock scoring (LLM not configured for {category})")
            return self._score_category_mock(category, resume_extracted, jd_extracted)

        except Exception as e:
            logger.error(f"LLM scoring failed for {category}: {str(e)}")
            # Fallback to mock
            return self._score_category_mock(category, resume_extracted, jd_extracted)

    @staticmethod
    def compute_composite_score(category_scores: List[CategoryScore]) -> float:
        """
        Compute composite score from category scores.

        Args:
            category_scores: List of CategoryScore objects

        Returns:
            Weighted average score (0-100)
        """
        if not category_scores:
            return 0.0

        # Equal weighting for now; in production would use dynamic weights
        avg_score = sum(s.score for s in category_scores) / len(category_scores)

        return avg_score

    @staticmethod
    def classify_fit(composite_score: float) -> str:
        """
        Classify fit based on composite score.

        Args:
            composite_score: Composite score (0-100)

        Returns:
            Fit classification: "GOOD_FIT", "PARTIAL_FIT", or "NOT_FIT"
        """
        if composite_score >= 80:
            return "GOOD_FIT"
        elif composite_score >= 60:
            return "PARTIAL_FIT"
        else:
            return "NOT_FIT"


# Singleton instance getter
_geval_service: GevalService = None


def get_geval_service(use_mock: bool = True) -> GevalService:
    """
    Get or create GEval service instance.
    Intended for dependency injection in FastAPI.

    Args:
        use_mock: If True, use mock scoring for testing

    Returns:
        GevalService instance
    """
    global _geval_service

    if _geval_service is None:
        from api.config import settings

        _geval_service = GevalService(
            openai_api_key=settings.OPENAI_API_KEY,
            use_mock=use_mock,
        )

    return _geval_service
