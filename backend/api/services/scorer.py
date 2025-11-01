"""
Scoring service for resume-JD matching analysis.
Calculates category-based scores and weighted composite score using FastMatcherService.
"""

import logging
from typing import Dict, Any
from api._types import ResumeStructuredData, JDStructuredData
from api.types.analysis import FitClassification
from api.services.matcher import get_matcher_service

logger = logging.getLogger(__name__)

CATEGORY_WEIGHTS = {
    "skills_match": 0.35,
    "experience_alignment": 0.25,
    "education_and_certifications": 0.20,
    "achievements_and_outcomes": 0.10,
    "soft_skills_and_culture": 0.10,
}


class ScoringService:
    """Calculate scoring for resume-JD analysis using matcher service."""

    def __init__(self):
        """Initialize scoring service with matcher dependency."""
        self.matcher = get_matcher_service()
        self.category_weights = CATEGORY_WEIGHTS
        logger.info(f"ScoringService initialized with weights: {self.category_weights}")

    def calculate_scores(
        self, resume: ResumeStructuredData, jd: JDStructuredData
    ) -> Dict[str, float]:
        """
        Calculate scores for all categories and weighted overall score.

        Args:
            resume: Extracted resume structured data
            jd: Extracted job description structured data

        Returns:
            Dict with all 5 category scores and overall_score:
            {
                "skills_match": 75.0,
                "experience_alignment": 80.0,
                "education_and_certifications": 60.0,
                "achievements_and_outcomes": 70.0,
                "soft_skills_and_culture": 65.0,
                "overall_score": 72.5
            }
        """
        try:
            # Get match results from matcher
            matches = self.matcher.calculate_matches(resume, jd)

            # Convert match percentages to scores (already 0-100)
            scores = {}
            for category, match_data in matches.items():
                scores[category] = match_data["match_percentage"]

            # Calculate weighted overall score
            overall_score = sum(
                scores.get(cat, 0) * weight
                for cat, weight in self.category_weights.items()
            )

            scores["overall_score"] = overall_score
            logger.info(f"Calculated scores: overall={overall_score:.1f}")

            return scores

        except Exception as e:
            logger.error(f"Score calculation failed: {str(e)}")
            raise

    def determine_fit_classification(self, overall_score: float) -> FitClassification:
        """
        Determine fit classification based on overall score.

        Args:
            overall_score: Overall composite score (0-100)

        Returns:
            FitClassification enum value (GOOD_FIT, PARTIAL_FIT, or NOT_FIT)
        """
        if overall_score >= 80:
            return FitClassification.GOOD_FIT
        elif overall_score >= 60:
            return FitClassification.PARTIAL_FIT
        else:
            return FitClassification.NOT_FIT

    def get_match_details(
        self, resume: ResumeStructuredData, jd: JDStructuredData
    ) -> Dict[str, Dict[str, Any]]:
        """
        Get detailed match information for all categories.

        Args:
            resume: Extracted resume structured data
            jd: Extracted job description structured data

        Returns:
            Dict with detailed match data per category including:
            - matched_items: List of matched elements
            - missing_required: List of missing required elements
            - match_percentage: Score 0-100
            - Additional metadata per category
        """
        try:
            return self.matcher.calculate_matches(resume, jd)
        except Exception as e:
            logger.error(f"Failed to get match details: {str(e)}")
            raise


def get_scoring_service() -> ScoringService:
    """
    Get or create scoring service instance.
    Intended for dependency injection in FastAPI.
    """
    return ScoringService()
