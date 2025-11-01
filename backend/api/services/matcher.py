"""
Fast matching service for calculating qualification matches between resume and JD.
Optimized for low latency using set operations and minimal processing.
"""

import logging
import re
from typing import Dict, List, Set, Any
from api._types import ResumeStructuredData, JDStructuredData

logger = logging.getLogger(__name__)


class FastMatcherService:
    """
    Calculate number of matches per category with minimal latency.
    Uses set operations and cached normalization for speed.
    """

    def __init__(self):
        """Initialize the matcher service."""
        logger.info("FastMatcherService initialized")

    def calculate_matches(
        self, resume: ResumeStructuredData, jd: JDStructuredData
    ) -> Dict[str, Dict[str, Any]]:
        """
        Calculate matches across all categories.

        Args:
            resume: Extracted resume structured data
            jd: Extracted job description structured data

        Returns:
            Dict with match counts and percentages per category
        """
        try:
            results = {
                "skills_match": self._match_skills(resume, jd),
                "experience_alignment": self._match_experience(resume, jd),
                "education_and_certifications": self._match_education_certs(
                    resume, jd
                ),
                "achievements_and_outcomes": self._match_achievements(resume, jd),
                "soft_skills_and_culture": self._match_soft_skills(resume, jd),
            }

            logger.info(
                f"Match calculation complete: "
                f"skills={results['skills_match']['matched']}/{results['skills_match']['total_required']}, "
                f"experience={results['experience_alignment']['matched']}/{results['experience_alignment']['total_required']}"
            )

            return results

        except Exception as e:
            logger.error(f"Match calculation failed: {str(e)}")
            raise

    def _match_skills(
        self, resume: ResumeStructuredData, jd: JDStructuredData
    ) -> Dict[str, Any]:
        """
        Match technical skills (fastest using set operations).

        Compares:
        - Resume technical_skills + technologies_used in experience/projects
        - JD required + preferred qualifications.skills
        """
        # Collect all resume skills (case-insensitive)
        resume_skills = self._normalize_list(resume.technical_skills or [])

        # Add technologies from experience
        for exp in resume.experience or []:
            resume_skills.update(self._normalize_list(exp.technologies_used or []))

        # Add tech stack from internships
        for internship in resume.internships or []:
            resume_skills.update(self._normalize_list(internship.tech_stack or []))

        # Add tech stack from projects
        for project in resume.projects or []:
            resume_skills.update(self._normalize_list(project.tech_stack or []))

        # Collect JD required skills
        jd_required_skills = self._normalize_list(
            jd.required_qualifications.skills or []
        )

        # Collect JD preferred skills (optional)
        jd_preferred_skills = self._normalize_list(
            jd.preferred_qualifications.skills or []
        )

        # Calculate matches
        all_jd_skills = jd_required_skills | jd_preferred_skills
        total_matched = resume_skills & all_jd_skills

        total_required = len(all_jd_skills) if all_jd_skills else 1
        matched_count = len(total_matched)

        return {
            "matched": matched_count,
            "total_required": total_required,
            "match_percentage": (matched_count / total_required * 100)
            if total_required > 0
            else 0.0,
            "matched_items": sorted(list(total_matched)),
            "missing_required": sorted(list(jd_required_skills - resume_skills)),
        }

    def _match_experience(
        self, resume: ResumeStructuredData, jd: JDStructuredData
    ) -> Dict[str, Any]:
        """
        Match experience alignment.

        Compares:
        - Total years of experience (from resume.experience durations)
        - JD required/preferred experience (parsed from experience string)
        """
        # Calculate total resume experience
        total_years = sum(exp.duration for exp in (resume.experience or []))

        # Parse JD experience requirement (extract years from text)
        required_years = self._extract_years_from_text(
            jd.required_qualifications.experience or ""
        )
        preferred_years = self._extract_years_from_text(
            jd.preferred_qualifications.experience or ""
        )

        # Count position/role matches
        resume_positions = set()
        for exp in resume.experience or []:
            resume_positions.add(exp.position.lower())

        for internship in resume.internships or []:
            resume_positions.add(internship.title.lower())

        # Extract key experience terms from JD duties
        jd_duties_text = " ".join(jd.job_duties or []).lower()
        experience_keywords = self._extract_experience_keywords(jd_duties_text)

        # Check if resume has relevant experience
        matched_keywords = 0
        for keyword in experience_keywords:
            if any(keyword in pos for pos in resume_positions):
                matched_keywords += 1

        # Determine experience match level
        years_match = total_years >= required_years if required_years else True
        preferred_match = total_years >= preferred_years if preferred_years else True

        matched = 0
        total = 3  # Three criteria: years, role relevance, duties alignment

        if years_match:
            matched += 1
        if preferred_match:
            matched += 1
        if matched_keywords > 0:
            matched += 1

        return {
            "matched": matched,
            "total_required": total,
            "match_percentage": (matched / total * 100),
            "years_experience": total_years,
            "years_required": required_years,
            "years_preferred": preferred_years,
            "meets_minimum": years_match,
            "relevant_roles": matched_keywords,
        }

    def _match_education_certs(
        self, resume: ResumeStructuredData, jd: JDStructuredData
    ) -> Dict[str, Any]:
        """
        Match education and certifications.

        Compares:
        - Resume education degrees vs JD education requirement
        - Resume certifications vs JD preferred/required certs
        """
        # Extract degree levels from resume
        resume_degrees = set()
        for edu in resume.education or []:
            degree_level = self._normalize_degree(edu.degree)
            resume_degrees.add(degree_level)

        # Extract required degree from JD
        jd_required_degree = self._normalize_degree(
            jd.required_qualifications.education or ""
        )
        jd_preferred_degree = self._normalize_degree(
            jd.preferred_qualifications.education or ""
        )

        # Check degree match
        degree_match = False
        if jd_required_degree and jd_required_degree in resume_degrees:
            degree_match = True
        elif not jd_required_degree:  # No specific requirement
            degree_match = len(resume_degrees) > 0

        # Check certifications
        resume_cert_names = self._normalize_list(
            [cert.name for cert in (resume.certifications or [])]
        )

        # Extract certification keywords from JD
        jd_text = " ".join(
            [
                jd.required_qualifications.education or "",
                jd.preferred_qualifications.education or "",
                " ".join(jd.other_information.bonus_qualifications or []),
            ]
        )
        jd_cert_keywords = self._extract_cert_keywords(jd_text.lower())

        # Match certifications
        matched_certs = 0
        for cert_keyword in jd_cert_keywords:
            if any(cert_keyword in cert_name for cert_name in resume_cert_names):
                matched_certs += 1

        total_required = 1 + len(jd_cert_keywords)  # Degree + certs
        matched = (1 if degree_match else 0) + matched_certs

        return {
            "matched": matched,
            "total_required": total_required,
            "match_percentage": (matched / total_required * 100)
            if total_required > 0
            else 0.0,
            "degree_match": degree_match,
            "certifications_matched": matched_certs,
            "certifications_count": len(resume.certifications or []),
        }

    def _match_achievements(
        self, resume: ResumeStructuredData, jd: JDStructuredData
    ) -> Dict[str, Any]:
        """
        Match achievements and outcomes to JD duties.

        Compares:
        - Resume achievements from experience
        - Resume project outcomes
        - JD job duties and responsibilities
        """
        # Collect all achievements
        resume_achievements = []
        for exp in resume.experience or []:
            resume_achievements.extend(exp.achievements or [])

        for internship in resume.internships or []:
            resume_achievements.extend(internship.outcomes or [])

        for project in resume.projects or []:
            resume_achievements.extend(project.outcomes or [])

        # Add awards
        if resume.other_information:
            resume_achievements.extend(
                resume.other_information.awards_and_achievements or []
            )

        # Normalize achievements
        achievement_keywords = self._extract_keywords_from_list(resume_achievements)

        # Extract JD duties keywords
        jd_duties_keywords = self._extract_keywords_from_list(jd.job_duties or [])

        # Match keywords
        matched_keywords = achievement_keywords & jd_duties_keywords

        total_required = len(jd_duties_keywords) if jd_duties_keywords else 1
        matched = len(matched_keywords)

        return {
            "matched": matched,
            "total_required": total_required,
            "match_percentage": (matched / total_required * 100)
            if total_required > 0
            else 0.0,
            "achievements_count": len(resume_achievements),
            "matched_items": sorted(list(matched_keywords)),
        }

    def _match_soft_skills(
        self, resume: ResumeStructuredData, jd: JDStructuredData
    ) -> Dict[str, Any]:
        """
        Match soft skills and culture fit.

        Compares:
        - Resume soft_skills
        - JD implied soft skills from duties and qualifications
        """
        # Get resume soft skills
        resume_soft_skills = set()
        if resume.other_information:
            resume_soft_skills = self._normalize_list(
                resume.other_information.soft_skills or []
            )

        # Add leadership indicators
        if resume.other_information and resume.other_information.leadership:
            resume_soft_skills.add("leadership")

        # Check for team management
        for exp in resume.experience or []:
            if exp.team_size_managed > 0:
                resume_soft_skills.add("leadership")
                resume_soft_skills.add("team management")

        # Extract soft skills from JD
        jd_text = " ".join(
            [
                " ".join(jd.job_duties or []),
                jd.required_qualifications.experience or "",
                jd.preferred_qualifications.experience or "",
            ]
        ).lower()

        jd_soft_skills = self._extract_soft_skill_keywords(jd_text)

        # Match soft skills
        matched_skills = resume_soft_skills & jd_soft_skills

        total_required = len(jd_soft_skills) if jd_soft_skills else 1
        matched = len(matched_skills)

        return {
            "matched": matched,
            "total_required": total_required,
            "match_percentage": (matched / total_required * 100)
            if total_required > 0
            else 0.0,
            "matched_items": sorted(list(matched_skills)),
            "resume_soft_skills_count": len(resume_soft_skills),
        }

    # ===== Helper Methods for Fast Processing =====

    @staticmethod
    def _normalize_list(items: List[str]) -> Set[str]:
        """Convert list to lowercase set for fast lookup."""
        return {item.lower().strip() for item in items if item}

    @staticmethod
    def _extract_years_from_text(text: str) -> float:
        """Extract years from experience text (e.g., '3 years' -> 3.0)."""
        match = re.search(r"(\d+)\+?\s*(?:years?|yrs?)", text.lower())
        return float(match.group(1)) if match else 0.0

    @staticmethod
    def _normalize_degree(degree_text: str) -> str:
        """Normalize degree to standard level."""
        degree_lower = degree_text.lower()
        if any(
            term in degree_lower
            for term in ["phd", "ph.d", "doctoral", "doctorate"]
        ):
            return "phd"
        if any(
            term in degree_lower for term in ["master", "ms", "m.s", "mba", "ma", "m.a"]
        ):
            return "masters"
        if any(
            term in degree_lower for term in ["bachelor", "bs", "b.s", "ba", "b.a"]
        ):
            return "bachelors"
        if any(term in degree_lower for term in ["associate", "as", "a.s"]):
            return "associate"
        return degree_lower

    @staticmethod
    def _extract_experience_keywords(text: str) -> Set[str]:
        """Extract key experience terms."""
        keywords = {
            "engineer",
            "developer",
            "manager",
            "lead",
            "architect",
            "analyst",
            "designer",
            "consultant",
            "specialist",
            "scientist",
        }
        return {kw for kw in keywords if kw in text}

    @staticmethod
    def _extract_cert_keywords(text: str) -> Set[str]:
        """Extract certification keywords."""
        keywords = {
            "aws",
            "azure",
            "gcp",
            "cissp",
            "ccna",
            "pmp",
            "scrum",
            "certified",
            "certification",
            "cpa",
            "cfa",
            "comptia",
        }
        return {kw for kw in keywords if kw in text}

    @staticmethod
    def _extract_keywords_from_list(items: List[str]) -> Set[str]:
        """Extract meaningful keywords from a list of strings."""
        keywords = set()
        for item in items:
            # Extract words, filter out common stop words
            words = re.findall(r"\b[a-z]{3,}\b", item.lower())
            stop_words = {
                "the",
                "and",
                "for",
                "with",
                "this",
                "that",
                "from",
                "were",
                "been",
            }
            keywords.update(w for w in words if w not in stop_words)
        return keywords

    @staticmethod
    def _extract_soft_skill_keywords(text: str) -> Set[str]:
        """Extract soft skills from JD text."""
        soft_skill_terms = {
            "communication",
            "leadership",
            "teamwork",
            "collaboration",
            "problem solving",
            "analytical",
            "creative",
            "adaptable",
            "time management",
            "organized",
            "detail-oriented",
            "interpersonal",
            "presentation",
            "negotiation",
        }
        found_skills = set()
        for skill in soft_skill_terms:
            if skill in text:
                found_skills.add(skill)
        return found_skills


# Singleton instance
_matcher_service: FastMatcherService = None


def get_matcher_service() -> FastMatcherService:
    """
    Get or create matcher service instance.
    Singleton pattern for performance.
    """
    global _matcher_service
    if _matcher_service is None:
        _matcher_service = FastMatcherService()
    return _matcher_service
