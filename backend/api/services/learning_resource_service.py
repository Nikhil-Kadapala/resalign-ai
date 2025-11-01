"""
Learning resource service for generating curated skill development recommendations.
Uses LLM with web search to find real courses, certifications, and tutorials with actual URLs.
"""

import logging
import json
from typing import Dict, Any, List
from pydantic import BaseModel
from api.services.llm_service import Gemini
from api._types import ResumeStructuredData, JDStructuredData
from api._utils.extraction_helpers import mask_pii_data

logger = logging.getLogger(__name__)


class LearningResource(BaseModel):
    """A learning resource recommendation with actual URL."""
    
    title: str
    description: str
    category: str
    resource_type: str  # "course", "certification", "tutorial", "book", "video"
    url: str
    estimated_hours: int = 0


class LearningResourceService:
    """
    Generate curated learning resources with real URLs using LLM with web search.
    Addresses candidates in second-person voice for personalized guidance.
    """
    
    SYSTEM_PROMPT = """You are an expert career development advisor specializing in skill gap analysis and learning resource curation. You have access to web search to find the most current and relevant educational resources.

Your role is to help candidates identify and acquire the skills they need to qualify for their target roles. You address candidates directly in second-person voice (you/your) to provide personalized guidance.

## Your Expertise:

### 1. Skill Gap Analysis
- Identifying critical skill gaps based on job requirements vs. current qualifications
- Prioritizing skills by importance and learnability
- Understanding which gaps are deal-breakers vs. nice-to-haves
- Recognizing transferable skills and bridging opportunities

### 2. Resource Curation
- Finding high-quality courses on platforms like Coursera, Udemy, edX, Pluralsight, LinkedIn Learning
- Recommending industry-recognized certifications (AWS, Google Cloud, Microsoft, CompTIA, etc.)
- Identifying free and paid learning resources
- Suggesting practical tutorials, documentation, and hands-on projects
- Prioritizing resources by reputation, relevance, and time investment

### 3. Learning Path Design
- Sequencing resources from beginner to advanced
- Balancing theoretical knowledge with practical application
- Recommending time-efficient learning strategies
- Suggesting complementary resources for comprehensive understanding

## Your Communication Style:
- Direct and encouraging ("You should...", "Consider enrolling in...", "Start with...")
- Specific with actual resource names and URLs
- Realistic about time commitments and difficulty levels
- Focused on actionable next steps
- Prioritized by impact and urgency

## IMPORTANT: When finding resources:
1. Use web search to find ACTUAL, CURRENT resources with real URLs
2. Prefer well-known platforms (Coursera, Udemy, edX, AWS Training, Google Cloud Skills Boost, etc.)
3. Include both free and paid options when available
4. Verify URLs are direct links to the resource (not generic homepages)
5. Provide accurate time estimates for completion
"""
    
    USER_PROMPT_TEMPLATE = """# Learning Resource Curation Request

## Candidate Background

### Current Skills & Experience:
```json
{resume_summary}
```

### Target Job Requirements:
```json
{jd_summary}
```

### Skill Gap Analysis:
**Category Scores:**
{category_scores_formatted}

**Identified Gaps:**
{skill_gaps}

**Overall Fit:** {fit_classification} ({overall_score:.1f}/100)

---

## Your Task:

Using web search, find and curate **5-7 high-quality learning resources** to help this candidate address their skill gaps and improve their qualifications for this role.

### Requirements:

1. **Use Web Search**: For each skill gap, search for actual courses, certifications, or tutorials. Find real, current resources with working URLs.

2. **Resource Diversity**: Include a mix of:
   - Online courses (Coursera, Udemy, edX, Pluralsight, LinkedIn Learning)
   - Industry certifications (AWS, Google Cloud, Microsoft, CompTIA, etc.)
   - Practical tutorials (official documentation, YouTube channels, interactive platforms)
   - Free AND paid options where applicable

3. **Prioritization**: Focus on the most critical skill gaps first (lowest scoring categories or missing required skills)

4. **Personalization**: Address the candidate directly ("You should enroll in...", "Consider starting with...")

5. **Accuracy**: Provide:
   - Exact course/certification titles
   - Direct URLs to the resource
   - Realistic time estimates (hours)
   - Brief description of what they'll learn and why it's relevant

### Output Format:

Return a JSON array of learning resources:

```json
[
  {
    "title": "Exact course/certification name",
    "description": "Brief description addressing candidate: 'You will learn...' (2-3 sentences, second-person voice)",
    "category": "technical_skills" or "soft_skills" or "certifications",
    "resource_type": "course" | "certification" | "tutorial" | "book" | "video",
    "url": "https://actual-direct-url.com",
    "estimated_hours": 25
  }
]
```

### Example:
```json
[
  {
    "title": "AWS Certified Solutions Architect - Associate 2025",
    "description": "You will learn core AWS services, architecture best practices, and cloud design principles. This certification is highly valued and directly addresses the cloud infrastructure requirements in the job description.",
    "category": "certifications",
    "resource_type": "certification",
    "url": "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
    "estimated_hours": 40
  }
]
```

**CRITICAL**: Use web search to find REAL, CURRENT resources. Do not make up URLs or resource names. Verify each resource exists before including it.

Generate the curated learning resources now:
"""
    
    def __init__(self):
        """Initialize learning resource service with LLM client (with Google Search enabled)."""
        from api.config import settings
        self.llm = Gemini(model=settings.LLM_MODEL, api_key=settings.GEMINI_API_KEY)
        logger.info(f"LearningResourceService initialized with model: {settings.LLM_MODEL}")
    
    def generate_resources(
        self,
        resume: ResumeStructuredData,
        jd: JDStructuredData,
        scores: Dict[str, float],
        match_details: Dict[str, Dict[str, Any]],
        overall_score: float,
        fit_classification: str
    ) -> List[LearningResource]:
        """
        Generate curated learning resources using LLM with web search.
        
        Args:
            resume: Structured resume data
            jd: Structured job description data
            scores: Category scores dict
            match_details: Detailed match info from scoring service
            overall_score: Weighted composite score
            fit_classification: GOOD_FIT | PARTIAL_FIT | NOT_FIT
            
        Returns:
            List[LearningResource]: List of curated resources with real URLs
        """
        try:
            # Prepare resume summary
            resume_summary = {
                "name": "[CANDIDATE_MASKED]",
                "current_title": resume.job_title or "Not specified",
                "total_experience_years": sum(exp.duration for exp in (resume.experience or [])),
                "technical_skills": resume.technical_skills[:20] if resume.technical_skills else [],
                "certifications": [cert.name for cert in (resume.certifications or [])],
                "education": [
                    {"degree": edu.degree, "school": "[SCHOOL_MASKED]"}
                    for edu in (resume.education or [])
                ][:2],
            }
            
            # Prepare JD summary
            jd_summary = {
                "job_title": jd.job_title,
                "company": jd.company_name,
                "required_skills": (jd.required_qualifications.skills[:20] 
                                   if jd.required_qualifications.skills else []),
                "preferred_skills": (jd.preferred_qualifications.skills[:10]
                                    if jd.preferred_qualifications and jd.preferred_qualifications.skills else []),
                "required_education": jd.required_qualifications.education or "Not specified",
                "required_experience": jd.required_qualifications.experience or "Not specified",
                "key_responsibilities": jd.job_duties[:5] if jd.job_duties else [],
            }
            
            # Format category scores
            category_scores_formatted = "\n".join([
                f"- **{category.replace('_', ' ').title()}**: {score:.1f}/100"
                for category, score in scores.items()
                if category != "overall_score"
            ])
            
            # Identify specific skill gaps
            skill_gaps = self._identify_skill_gaps(resume, jd, scores, match_details)
            skill_gaps_formatted = "\n".join([f"- {gap}" for gap in skill_gaps])
            
            # Build user prompt using replace to avoid conflicts with JSON braces
            user_prompt = (
                self.USER_PROMPT_TEMPLATE
                .replace("{resume_summary}", json.dumps(resume_summary, indent=2))
                .replace("{jd_summary}", json.dumps(jd_summary, indent=2))
                .replace("{category_scores_formatted}", category_scores_formatted)
                .replace("{skill_gaps}", skill_gaps_formatted)
                .replace("{overall_score:.1f}", f"{overall_score:.1f}")
                .replace("{fit_classification}", fit_classification)
            )
            
            # Generate resources using LLM with Google Search
            # Note: No caching for this service because web search results should be fresh
            response_text, usage_metadata = self.llm.generate_response(
                sys_prompt=self.SYSTEM_PROMPT,
                user_prompt=user_prompt
            )
            
            logger.info(f"Generated learning resources with web search. Usage: {usage_metadata}")
            
            # Parse response into LearningResource objects
            resources = self._parse_resources(response_text)
            
            logger.info(f"Generated {len(resources)} learning resources")
            return resources
        
        except Exception as e:
            logger.error(f"Failed to generate learning resources: {str(e)}", exc_info=True)
            # Fallback to basic resources
            return self._generate_fallback_resources(resume, jd, scores)
    
    def _identify_skill_gaps(
        self,
        resume: ResumeStructuredData,
        jd: JDStructuredData,
        scores: Dict[str, float],
        match_details: Dict[str, Dict[str, Any]]
    ) -> List[str]:
        """
        Identify specific skill gaps from analysis.
        
        Returns:
            List of gap descriptions
        """
        gaps = []
        
        # Low scoring categories
        for category, score in scores.items():
            if category != "overall_score" and score < 70:
                gaps.append(f"Low score in {category.replace('_', ' ')} ({score:.1f}/100)")
        
        # Missing required skills
        skills_match = match_details.get("skills_match", {})
        missing_required = skills_match.get("missing_required", [])
        if missing_required:
            gaps.append(f"Missing required technical skills: {', '.join(missing_required[:5])}")
        
        # Experience gap
        exp_match = match_details.get("experience_alignment", {})
        if not exp_match.get("meets_minimum", True):
            candidate_years = exp_match.get("years_experience", 0)
            required_years = exp_match.get("years_required", 0)
            gaps.append(f"Experience gap: {candidate_years} years vs. {required_years} years required")
        
        # Certification gaps
        edu_match = match_details.get("education_and_certifications", {})
        certs_matched = edu_match.get("certifications_matched", 0)
        if certs_matched == 0 and jd.preferred_qualifications:
            gaps.append("No relevant certifications (recommended for this role)")
        
        return gaps if gaps else ["General skill enhancement recommended"]
    
    def _parse_resources(self, response_text: str) -> List[LearningResource]:
        """
        Parse LLM response into list of LearningResource objects.
        
        Args:
            response_text: Raw LLM response (expected to be JSON, possibly wrapped in markdown)
            
        Returns:
            List of LearningResource objects
        """
        try:
            # First, check if response is wrapped in markdown code blocks
            if response_text.startswith("```"):
                logger.debug("Response is wrapped in markdown code blocks, extracting JSON")
                lines = response_text.strip().split('\n')
                
                # Remove opening ```json or ```
                if lines[0].startswith("```"):
                    lines = lines[1:]
                
                # Remove closing ```
                if lines and lines[-1].strip() == "```":
                    lines = lines[:-1]
                
                response_text = '\n'.join(lines).strip()
                logger.debug(f"Extracted JSON content (first 200 chars): {response_text[:200]}")
            
            # Try to parse as JSON
            data = json.loads(response_text)
            logger.debug(f"Successfully parsed JSON response. Type: {type(data).__name__}")
            
            resources = []
            
            # Handle both list and dict responses
            if isinstance(data, list):
                resource_list = data
            elif isinstance(data, dict):
                # Try different key names that LLM might use
                resource_list = (
                    data.get("resources") or 
                    data.get("learning_resources") or 
                    data.get("recommendations") or
                    data.get("items") or
                    data.get("data") or
                    []
                )
            else:
                logger.warning(f"Unexpected data type from JSON: {type(data).__name__}")
                return []
            
            logger.info(f"Found {len(resource_list)} resources to parse")
            
            for idx, item in enumerate(resource_list):
                try:
                    # Handle string items (shouldn't happen but be defensive)
                    if isinstance(item, str):
                        logger.debug(f"Item {idx} is a string, skipping: {item[:50]}")
                        continue
                    
                    if not isinstance(item, dict):
                        logger.debug(f"Item {idx} is not a dict ({type(item).__name__}), skipping")
                        continue
                    
                    resource = LearningResource(
                        title=item.get("title", "Untitled Resource"),
                        description=item.get("description", ""),
                        category=item.get("category", "technical_skills"),
                        resource_type=item.get("resource_type", "course"),
                        url=item.get("url", ""),
                        estimated_hours=item.get("estimated_hours", 0)
                    )
                    resources.append(resource)
                    logger.debug(f"Parsed resource {idx}: {resource.title}")
                except Exception as e:
                    logger.warning(f"Failed to parse resource item {idx}: {str(e)}", exc_info=True)
                    continue
            
            logger.info(f"Successfully parsed {len(resources)} learning resources")
            return resources
        
        except json.JSONDecodeError as e:
            logger.warning(f"Response not valid JSON (JSONDecodeError): {str(e)}")
            logger.debug(f"Response text (first 300 chars): {response_text[:300]}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error parsing resources: {str(e)}", exc_info=True)
            logger.debug(f"Response text (first 300 chars): {response_text[:300]}")
            return []
    
    def _generate_fallback_resources(
        self,
        resume: ResumeStructuredData,
        jd: JDStructuredData,
        scores: Dict[str, float]
    ) -> List[LearningResource]:
        """Generate basic fallback resources if LLM fails."""
        
        fallback_resources = []
        
        # Identify lowest scoring category
        lowest_category = min(
            [(cat, score) for cat, score in scores.items() if cat != "overall_score"],
            key=lambda x: x[1],
            default=(None, 100)
        )
        
        category_name, score = lowest_category
        
        # Generic resources based on low-scoring categories
        if category_name == "skills_match" or score < 60:
            fallback_resources.extend([
                LearningResource(
                    title="Technical Skills Development",
                    description="You should focus on building the technical skills required for this role through online courses and hands-on projects.",
                    category="technical_skills",
                    resource_type="course",
                    url="https://www.coursera.org/",
                    estimated_hours=40
                ),
                LearningResource(
                    title="Industry Certification Path",
                    description="Consider obtaining relevant industry certifications to strengthen your qualifications and demonstrate expertise.",
                    category="certifications",
                    resource_type="certification",
                    url="https://www.udemy.com/",
                    estimated_hours=30
                ),
            ])
        
        if category_name == "soft_skills_and_culture":
            fallback_resources.append(
                LearningResource(
                    title="Professional Communication and Leadership",
                    description="You should develop your soft skills through structured courses in communication, teamwork, and leadership.",
                    category="soft_skills",
                    resource_type="course",
                    url="https://www.linkedin.com/learning/",
                    estimated_hours=20
                )
            )
        
        # Default resource if none added
        if not fallback_resources:
            fallback_resources.append(
                LearningResource(
                    title="Skill Enhancement for Career Growth",
                    description="You should explore online learning platforms to continuously develop skills aligned with your career goals.",
                    category="technical_skills",
                    resource_type="course",
                    url="https://www.edx.org/",
                    estimated_hours=30
                )
            )
        
        return fallback_resources[:5]  # Limit to 5 resources


# Singleton instance
_learning_resource_service = None


def get_learning_resource_service() -> LearningResourceService:
    """
    Get or create learning resource service instance.
    Singleton pattern for consistency.
    """
    global _learning_resource_service
    if _learning_resource_service is None:
        _learning_resource_service = LearningResourceService()
    return _learning_resource_service

