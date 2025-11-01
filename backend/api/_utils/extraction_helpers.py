"""
Helper functions to process Reducto extraction data.
"""
import re
import logging
from typing import List, Set, Any, Dict
from api.types.extraction import ResumeStructuredData, JDStructuredData

logger = logging.getLogger(__name__)

def extract_skills_from_resume(resume: ResumeStructuredData) -> List[str]:
    """Extract all technical skills from resume."""
    skills = set()
    
    # From experience
    for exp in resume.experience:
        for tech in exp.technologies_used:
            skills.add(tech.item.strip())
    
    # From internships
    for intern in resume.internships:
        for tech in intern.tech_stack:
            skills.add(tech.item.strip())
    
    # From projects
    for project in resume.projects:
        for tech in project.tech_stack:
            skills.add(tech.item.strip())
    
    return sorted(list(skills))

def extract_skills_from_jd(jd: JDStructuredData) -> List[str]:
    """Extract required and preferred skills from JD."""
    skills = set()
    
    # Parse skills from requirements
    req_skills = jd.required_qualifications.skills.split(',')
    for skill in req_skills:
        if skill.strip():
            skills.add(skill.strip())
    
    # Parse skills from preferred qualifications
    pref_skills = jd.preferred_qualifications.skills.split(',')
    for skill in pref_skills:
        if skill.strip():
            skills.add(skill.strip())
    
    return sorted(list(skills))

def find_missing_skills(resume: ResumeStructuredData, jd: JDStructuredData) -> List[str]:
    """Find skills present in JD but missing from resume."""
    resume_skills = set(s.lower() for s in extract_skills_from_resume(resume))
    jd_skills = set(s.lower() for s in extract_skills_from_jd(jd))
    
    missing = jd_skills - resume_skills
    return sorted(list(missing))

def calculate_experience_years(resume: ResumeStructuredData) -> float:
    """Calculate total years of professional experience."""
    import re
    total_months = 0
    
    for exp in resume.experience:
        # Parse duration string (e.g., "2 years", "6 months", "1 year 3 months")
        duration = exp.duration.lower()
        
        if 'year' in duration:
            year_match = re.search(r'(\d+)\s*year', duration)
            if year_match:
                years = int(year_match.group(1))
                total_months += years * 12
        
        if 'month' in duration:
            month_match = re.search(r'(\d+)\s*month', duration)
            if month_match:
                months = int(month_match.group(1))
                total_months += months
    
    return round(total_months / 12, 1) if total_months > 0 else 0.0

def extract_education_level(resume: ResumeStructuredData) -> str:
    """Get highest education level."""
    education_hierarchy = {
        'phd': 5, 'doctoral': 5, 'doctorate': 5,
        'master': 4, 'ms': 4, 'mba': 4, 'ma': 4,
        'bachelor': 3, 'bs': 3, 'ba': 3, 'bsc': 3,
        'associate': 2,
        'diploma': 1
    }
    
    highest = ('None', 0)
    
    for edu in resume.education:
        for degree in edu.degree:
            degree_str = degree.item.lower()
            for key, level in education_hierarchy.items():
                if key in degree_str and level > highest[1]:
                    highest = (degree.item, level)
    
    return highest[0]

def format_resume_summary(resume: ResumeStructuredData) -> dict:
    """Create a formatted summary of resume for analysis."""
    return {
        "candidate_name": resume.contact_information.name,
        "current_title": resume.job_title,
        "total_experience_years": calculate_experience_years(resume),
        "education_level": extract_education_level(resume),
        "technical_skills": extract_skills_from_resume(resume),
        "total_projects": len(resume.projects),
        "certifications_count": len(resume.certifications),
        "has_internships": len(resume.internships) > 0,
        "summary": resume.summary
    }

def format_jd_summary(jd: JDStructuredData) -> dict:
    """Create a formatted summary of JD for analysis."""
    return {
        "role": jd.job_title,
        "locations": [loc.city for loc in jd.location],
        "job_type": jd.job_type,
        "work_type": jd.work_type,
        "required_skills": extract_skills_from_jd(jd),
        "required_education": jd.required_qualifications.education,
        "required_experience": jd.required_qualifications.experience,
        "total_responsibilities": len(jd.job_duties),
        "salary_info": jd.other_information.salary if jd.other_information.salary else "Not specified",
        "remote_friendly": "remote" in jd.work_type.lower()
    }


def mask_pii_data(text: str) -> str:
    """
    Mask personally identifiable information in text before sending to AI services.
    
    Masks:
    - Email addresses (replaced with [EMAIL_MASKED])
    - Phone numbers (replaced with [PHONE_MASKED])
    - URLs/links (replaced with [URL_MASKED])
    - Social media profiles (replaced with [PROFILE_MASKED])
    - US street addresses (replaced with [ADDRESS_MASKED])
    - ZIP codes (replaced with [ZIP_MASKED])
    
    Args:
        text: Text containing potential PII
        
    Returns:
        Text with PII masked for safe AI processing
    """
    
    if not text:
        return text
    
    # Mask email addresses
    text = re.sub(
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        '[EMAIL_MASKED]',
        text
    )
    
    # Mask phone numbers (various formats)
    text = re.sub(
        r'(\+?1[-.\s]?)?(\([0-9]{3}\)|[0-9]{3})[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}',
        '[PHONE_MASKED]',
        text
    )
    
    # Mask US street addresses (pattern: number street)
    text = re.sub(
        r'\b\d+\s+[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Circle|Cir)',
        '[ADDRESS_MASKED]',
        text,
        flags=re.IGNORECASE
    )
    
    # Mask ZIP codes
    text = re.sub(r'\b\d{5}(-\d{4})?\b', '[ZIP_MASKED]', text)
    
    # Mask URLs
    text = re.sub(
        r'https?://[^\s]+|www\.[^\s]+',
        '[URL_MASKED]',
        text
    )
    
    # Mask LinkedIn, GitHub, and social media profiles
    text = re.sub(
        r'(?:linkedin\.com/in/|github\.com/|twitter\.com/|x\.com/)[^\s]+',
        '[PROFILE_MASKED]',
        text
    )
    
    logger.debug("Successfully masked PII from text")
    return text


def mask_resume_structured_data(resume) -> Dict[str, Any]:
    """
    Create a masked copy of structured resume data with PII removed.
    Safe for sending to external LLM APIs.
    
    Masks:
    - Contact information (name, email, phone, address, URLs)
    - Employer names
    - School names
    - Specific dates
    
    Keeps:
    - Job titles and positions
    - Technical skills
    - Soft skills
    - Accomplishments (without identifiers)
    - Technologies used
    - Duration (years/months without specific dates)
    
    Args:
        resume: ResumeStructuredData object
        
    Returns:
        Dict with masked resume data safe for LLM APIs
    """
    try:
        masked_data = {
            "job_title": resume.job_title,
            "technical_skills": resume.technical_skills or [],
            "soft_skills": resume.soft_skills or [],
            "languages": resume.languages or [],
            "summary": mask_pii_data(resume.summary) if resume.summary else "",
            "contact_information": {
                "name": "[CANDIDATE_NAME_MASKED]",
                "email": "[EMAIL_MASKED]",
                "phone": "[PHONE_MASKED]",
                "address": "[ADDRESS_MASKED]",
                "linkedin": "[LINKEDIN_MASKED]",
                "github": "[GITHUB_MASKED]",
                "portfolio": "[PORTFOLIO_MASKED]",
            },
            "experience": [
                {
                    "position": exp.position,
                    "duration": exp.duration,
                    "responsibilities": exp.responsibilities or [],
                    "achievements": [mask_pii_data(ach) for ach in (exp.achievements or [])],
                    "technologies_used": exp.technologies_used or [],
                    "team_size_managed": exp.team_size_managed,
                    "employer": "[COMPANY_NAME_MASKED]",
                }
                for exp in (resume.experience or [])
            ],
            "education": [
                {
                    "degree": edu.degree,
                    "major": edu.major,
                    "school": "[SCHOOL_NAME_MASKED]",
                    "graduation_date": "[DATE_MASKED]",
                    "gpa": edu.gpa,
                    "relevant_coursework": edu.relevant_coursework or [],
                }
                for edu in (resume.education or [])
            ],
            "projects": [
                {
                    "title": proj.title if hasattr(proj, 'title') else "Project",
                    "description": mask_pii_data(proj.description) if hasattr(proj, 'description') and proj.description else "",
                    "technologies_used": proj.technologies_used if hasattr(proj, 'technologies_used') else [],
                    "achievements": [mask_pii_data(ach) for ach in (proj.achievements if hasattr(proj, 'achievements') and proj.achievements else [])],
                    "project_url": "[URL_MASKED]" if hasattr(proj, 'project_url') and proj.project_url else None,
                }
                for proj in (resume.projects or [])
            ],
            "certifications": [
                {
                    "name": cert.name,
                    "issuer": "[ISSUER_MASKED]" if hasattr(cert, 'issuer') else None,
                    "issue_date": "[DATE_MASKED]" if hasattr(cert, 'issue_date') else None,
                    "expiry_date": "[DATE_MASKED]" if hasattr(cert, 'expiry_date') else None,
                }
                for cert in (resume.certifications or [])
            ],
        }
        
        logger.debug("Successfully masked structured resume data for LLM API")
        return masked_data
        
    except Exception as e:
        logger.warning(f"Error masking resume data: {str(e)}", exc_info=True)
        # Return minimized safe data if masking fails
        return {
            "job_title": resume.job_title,
            "technical_skills": resume.technical_skills or [],
            "soft_skills": resume.soft_skills or [],
            "experience_count": len(resume.experience or []),
            "education_count": len(resume.education or []),
            "projects_count": len(resume.projects or []),
            "certifications_count": len(resume.certifications or []),
        }