"""
Fit rationale service for generating AI-powered explanations of candidate fit.
Uses LLM to generate personalized rationales based on scoring analysis.
"""

import logging
import json
from typing import Dict, Any
from api.services.llm_service import Gemini
from api._types import ResumeStructuredData, JDStructuredData
from api._utils.extraction_helpers import mask_resume_structured_data, mask_pii_data

logger = logging.getLogger(__name__)


class FitRationaleService:
    """Generate AI-powered fit rationale using LLM with cached system prompt."""
    
    SYSTEM_PROMPT = """You are an expert career advisor and resume analyst specializing in evaluating candidate fit for job positions. Your role is to provide clear, actionable, and personalized explanations for why a candidate is or isn't a good fit for a specific role.

You have deep expertise in:
- Technical skill assessment and matching
- Career progression analysis
- Educational qualifications evaluation
- Achievement and impact recognition
- Soft skills and cultural fit assessment

Your explanations should be:
- Honest and constructive
- Specific with concrete examples from the data
- Balanced (highlighting both strengths and gaps)
- Actionable (suggesting areas for improvement when applicable)
- Professional yet encouraging
"""
    
    USER_PROMPT_TEMPLATE = """# Resume-Job Description Fit Analysis

## Scoring Methodology

Our analysis evaluates candidates across 5 key dimensions using a weighted scoring system:

### Category Weights:
1. **Skills Match** (35%) - Technical skills, technologies, and tools
2. **Experience Alignment** (25%) - Years of experience, relevant roles, and industry background
3. **Education & Certifications** (20%) - Degrees, certifications, and formal qualifications
4. **Achievements & Outcomes** (10%) - Measurable accomplishments and project outcomes
5. **Soft Skills & Culture** (10%) - Communication, leadership, teamwork, and cultural fit

### Fit Classification Thresholds:
- **GOOD_FIT**: Overall Score ≥ 80/100
  - Candidate meets or exceeds most requirements
  - Strong alignment across multiple dimensions
  - Ready to excel in the role with minimal onboarding

- **PARTIAL_FIT**: Overall Score 60-79/100
  - Candidate meets many core requirements
  - Some gaps in skills or experience
  - Could succeed with additional training or support

- **NOT_FIT**: Overall Score < 60/100
  - Significant gaps in critical requirements
  - Limited alignment with role expectations
  - Would require substantial development

---

## Candidate Analysis Data

### Resume Overview:
```json
{resume_summary}
```

### Job Description Overview:
```json
{jd_summary}
```

### Detailed Category Scores:

#### 1. Skills Match: {skills_score:.1f}/100
- **Matched Skills**: {skills_matched_items}
- **Missing Required Skills**: {skills_missing_required}
- **Total Required Skills**: {skills_total_required}
- **Match Rate**: {skills_matched}/{skills_total_required}

#### 2. Experience Alignment: {experience_score:.1f}/100
- **Candidate Experience**: {candidate_years} years
- **Required Experience**: {required_years} years
- **Preferred Experience**: {preferred_years} years
- **Meets Minimum**: {meets_minimum}
- **Relevant Role Keywords**: {relevant_roles}

#### 3. Education & Certifications: {education_score:.1f}/100
- **Degree Match**: {degree_match}
- **Certifications Matched**: {certs_matched}
- **Total Certifications**: {total_certs}

#### 4. Achievements & Outcomes: {achievements_score:.1f}/100
- **Total Achievements**: {total_achievements}
- **Matched Keywords**: {matched_achievement_keywords}
- **Alignment with Job Duties**: {achievements_matched}/{achievements_total_required}

#### 5. Soft Skills & Culture: {soft_skills_score:.1f}/100
- **Matched Soft Skills**: {soft_skills_matched_items}
- **Leadership Indicators**: {has_leadership}
- **Team Management Experience**: {has_team_management}

---

## Overall Assessment:
- **Composite Score**: {overall_score:.1f}/100
- **Fit Classification**: **{fit_classification}**

---

## Your Task:

Generate a comprehensive, personalized **fit rationale** (300-500 words) that explains WHY this candidate is classified as a **{fit_classification}** for this role.

Your rationale should:

1. **Opening Statement**: Start with a clear verdict on the candidate's fit level

2. **Strengths Analysis** (150-200 words):
   - Identify 2-3 strongest areas based on the scores above
   - Cite specific skills, experiences, or achievements from the data
   - Explain HOW these strengths align with job requirements
   - Use concrete examples (e.g., "The candidate's 5 years of Python experience directly matches the required backend development expertise")

3. **Gap Analysis** (100-150 words):
   - Identify the most critical gaps or weaknesses
   - Prioritize gaps by importance to the role
   - Be specific about what's missing (e.g., "Missing AWS and Kubernetes skills required for cloud infrastructure management")
   - For GOOD_FIT: Focus on minor improvements or growth areas
   - For PARTIAL_FIT: Focus on trainable gaps and development opportunities
   - For NOT_FIT: Focus on fundamental mismatches

4. **Contextual Insights** (50-100 words):
   - Consider the overall narrative (e.g., "While the candidate lacks direct experience, their strong foundation in X suggests quick adaptability")
   - Mention compensating factors if relevant (e.g., "Certifications compensate for shorter experience")
   - Address career trajectory or growth potential

5. **Closing Recommendation**:
   - GOOD_FIT: "Strong recommend for interview" + 1 area to probe
   - PARTIAL_FIT: "Conditional recommend" + specific conditions/support needed
   - NOT_FIT: "Not recommended unless X changes" + alternative role suggestions if possible

## Important Guidelines:
- Be specific and data-driven, not generic
- Maintain professional yet empathetic tone
- Balance honesty with encouragement
- Focus on the top 2-3 factors that most influenced the classification
- Avoid repeating the numerical scores (they're already visible)
- Write for hiring managers who will use this to make decisions

Generate the fit rationale now:
"""
    
    def __init__(self):
        """Initialize fit rationale service with LLM client."""
        from api.config import settings
        self.llm = Gemini(model=settings.LLM_MODEL, api_key=settings.GEMINI_API_KEY)
        self.cache_created = False
        logger.info(f"FitRationaleService initialized with model: {settings.LLM_MODEL}")
    
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
                    logger.info("System prompt cached successfully")
                else:
                    # Prompt is too small for caching, will use regular generation
                    self.cache_created = False
                    logger.info("System prompt too small for caching, will use regular generation")
            except Exception as e:
                logger.warning(f"Failed to create cache, will use regular generation: {str(e)}")
                self.cache_created = False
    
    def generate_rationale(
        self,
        resume: ResumeStructuredData,
        jd: JDStructuredData,
        scores: Dict[str, float],
        match_details: Dict[str, Dict[str, Any]],
        overall_score: float,
        fit_classification: str
    ) -> str:
        """
        Generate fit rationale using LLM.
        
        Args:
            resume: Structured resume data
            jd: Structured job description data
            scores: Category scores dict
            match_details: Detailed match info from FastMatcherService
            overall_score: Weighted composite score
            fit_classification: GOOD_FIT | PARTIAL_FIT | NOT_FIT
            
        Returns:
            str: Generated fit rationale (300-500 words)
        """
        try:
            # Prepare resume summary with PII masked
            resume_summary = {
                "name": "[CANDIDATE_MASKED]",
                "current_title": resume.job_title or "Not specified",
                "total_experience_years": sum(exp.duration for exp in (resume.experience or [])),
                "education_level": resume.education[0].degree if resume.education else "Not specified",
                "technical_skills": (resume.technical_skills[:10] if resume.technical_skills else []),
                "certifications_count": len(resume.certifications or []),
                "projects_count": len(resume.projects or []),
            }
            
            # Prepare JD summary
            jd_summary = {
                "job_title": jd.job_title,
                "company": jd.company_name,
                "location": jd.location if jd.location else [],
                "employment_type": jd.employment_type,
                "location_type": jd.location_type,
                "required_skills": (jd.required_qualifications.skills[:10] 
                                   if jd.required_qualifications.skills else []),
                "required_education": jd.required_qualifications.education or "Not specified",
                "required_experience": jd.required_qualifications.experience or "Not specified",
            }
            
            # Get detailed match info
            skills_match = match_details.get("skills_match", {})
            exp_match = match_details.get("experience_alignment", {})
            edu_match = match_details.get("education_and_certifications", {})
            achieve_match = match_details.get("achievements_and_outcomes", {})
            soft_match = match_details.get("soft_skills_and_culture", {})
            
            # Build user prompt with all data
            user_prompt = self.USER_PROMPT_TEMPLATE.format(
                # Resume & JD summaries
                resume_summary=json.dumps(resume_summary, indent=2),
                jd_summary=json.dumps(jd_summary, indent=2),
                
                # Skills match details
                skills_score=scores.get("skills_match", 0),
                skills_matched_items=skills_match.get("matched_items", []),
                skills_missing_required=skills_match.get("missing_required", []),
                skills_matched=skills_match.get("matched", 0),
                skills_total_required=skills_match.get("total_required", 1),
                
                # Experience details
                experience_score=scores.get("experience_alignment", 0),
                candidate_years=exp_match.get("years_experience", 0),
                required_years=exp_match.get("years_required", 0),
                preferred_years=exp_match.get("years_preferred", 0),
                meets_minimum=exp_match.get("meets_minimum", False),
                relevant_roles=exp_match.get("relevant_roles", 0),
                
                # Education details
                education_score=scores.get("education_and_certifications", 0),
                degree_match=edu_match.get("degree_match", False),
                certs_matched=edu_match.get("certifications_matched", 0),
                total_certs=edu_match.get("certifications_count", 0),
                
                # Achievements details
                achievements_score=scores.get("achievements_and_outcomes", 0),
                total_achievements=achieve_match.get("achievements_count", 0),
                matched_achievement_keywords=achieve_match.get("matched_items", []),
                achievements_matched=achieve_match.get("matched", 0),
                achievements_total_required=achieve_match.get("total_required", 1),
                
                # Soft skills details
                soft_skills_score=scores.get("soft_skills_and_culture", 0),
                soft_skills_matched_items=soft_match.get("matched_items", []),
                has_leadership="Yes" if any(exp.team_size_managed > 0 for exp in (resume.experience or [])) else "No",
                has_team_management="Yes" if any(exp.team_size_managed > 0 for exp in (resume.experience or [])) else "No",
                
                # Overall assessment
                overall_score=overall_score,
                fit_classification=fit_classification,
            )
            
            # Generate rationale using LLM with caching
            self._ensure_cache()
            
            if self.cache_created:
                rationale, usage_metadata = self.llm.generate_response_with_cache(
                    user_prompt=user_prompt
                )
                logger.info(f"Generated rationale using cached prompt. Usage: {usage_metadata}")
            else:
                rationale, usage_metadata = self.llm.generate_response(
                    sys_prompt=self.SYSTEM_PROMPT,
                    user_prompt=user_prompt
                )
                logger.info(f"Generated rationale without cache. Usage: {usage_metadata}")
            
            return rationale.strip()
        
        except Exception as e:
            logger.error(f"Failed to generate rationale: {str(e)}", exc_info=True)
            # Fallback to basic rationale
            return self._generate_fallback_rationale(overall_score, fit_classification)
    
    def _generate_fallback_rationale(self, overall_score: float, fit_classification: str) -> str:
        """Generate basic rationale if LLM fails."""
        if fit_classification == "GOOD_FIT":
            return (
                f"The candidate demonstrates strong alignment with the role requirements, "
                f"achieving an overall score of {overall_score:.1f}/100. This indicates excellent fit "
                f"across multiple dimensions including technical skills, experience, and qualifications. "
                f"The candidate's profile suggests they are well-prepared to excel in this role with minimal "
                f"onboarding. Key strengths appear to be in the areas that carry the highest weight in our "
                f"evaluation methodology, particularly technical skills and experience alignment."
            )
        elif fit_classification == "PARTIAL_FIT":
            return (
                f"The candidate shows moderate alignment with the role requirements, achieving an overall "
                f"score of {overall_score:.1f}/100. While there are some gaps in certain areas, the candidate "
                f"has a solid foundation and demonstrates competency in several key dimensions. With appropriate "
                f"support, training, or development opportunities, the candidate could succeed in this role. "
                f"The analysis suggests that the gaps are potentially addressable through targeted skill "
                f"development or on-the-job learning."
            )
        else:
            return (
                f"The candidate shows limited alignment with the role requirements, achieving an overall "
                f"score of {overall_score:.1f}/100. Significant gaps exist in critical areas that would "
                f"require substantial development before the candidate could succeed in this role. The analysis "
                f"indicates misalignment across multiple key dimensions, suggesting that this particular role "
                f"may not be the best match for the candidate's current skill set and experience level. "
                f"Alternative roles that better align with the candidate's strengths may be more appropriate."
            )


# Singleton instance
_fit_rationale_service = None


def get_fit_rationale_service() -> FitRationaleService:
    """
    Get or create fit rationale service instance.
    Singleton pattern for cache efficiency.
    """
    global _fit_rationale_service
    if _fit_rationale_service is None:
        _fit_rationale_service = FitRationaleService()
    return _fit_rationale_service

