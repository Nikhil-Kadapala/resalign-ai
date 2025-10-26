from __future__ import annotations
from pydantic import BaseModel, Field
from typing import List, Optional

###################################################################### JD  #############################################################################
#                                                                 Structured Data 
############################################################# Pydantic Model Schemas ###################################################################

class Qualifications(BaseModel):
    """
    Pydantic model for qualifications required or preferred for the job.
    
    Contains education, experience, and skills required or preferred for the job.
    
    ### Usage:
    
    ```python
    qualifications = Qualifications(
        education="Bachelor's degree in Computer Science", 
        experience="3 years of experience in software development", 
        skills=["Python", "JavaScript", "React"]
    )
    ```
    """
    education: Optional[str] = Field(None, description="Education requirements")
    experience: Optional[str] = Field(None, description="Experience requirements")
    skills: Optional[List[str]] = Field(None, description="Skills requirements")
    
class SalaryRange(BaseModel):
    """
    Pydantic model for salary range offered for the job.
    
    Contains currency, lower limit, and upper limit of the compensation/salary range.
    
    ### Usage:
    
    ```python
    salary_range = SalaryRange(currency="USD", lower_limit=100000, upper_limit=120000)
    ```
    """
    currency: Optional[str] = Field(None, description="Currency of the compensation offered. E.g., USD, CAD, AUD, INR, GBP, etc.")
    lower_limit: Optional[int] = Field(None, description="lowest bound of the compensation/salary range")
    upper_limit: Optional[int] = Field(None, description="higher bound of the compensation/salary range")

class Benefits(BaseModel):
    """
    Pydantic model for benefits offered for the job.
    
    Contains relocation assistance, equity, PTO, health, dental, vision, 401k, free lunch, and other benefits offered for the job.
    
    ### Usage:
    
    ```python
    benefits = Benefits(
        relocation_assistance=True, equity=True, pto=True,
        health=True, dental=True, vision=True,
        _401k=True, free_lunch=True, other="Other benefits offered for the job"
    )
    ```
    """
    relocation_assistance: bool = Field(..., description="Whether relocation assistance is provided for the job")
    equity: bool = Field(..., description="Is Equity offered?")
    pto: bool = Field(..., description="Is PTO offered?")
    health: bool = Field(..., description="is health insurance offered?")
    dental: bool = Field(..., description="is dental covered?")
    vision: bool = Field(..., description="is vision covered?")
    four_oh_one_k: bool = Field(..., description="is 401k offered?")
    free_lunch: bool = Field(..., description="Is free lunch offered at office if it is an on-site job?")
    other: str = Field(..., description="what are the additional benefits offered if any?")
    
class OtherInformation(BaseModel):
    """
    Pydantic model for other information listed in the job description.
    
    Contains bonus qualifications, salary range, and benefits offered for the job.
    
    ### Usage:
    
    ```python
    other_information = OtherInformation(
        bonus_qualifications=["Bonus qualifications mentioned in the job description"],
        salary_range=SalaryRange(currency="USD", lower_limit=100000, upper_limit=120000),
        benefits=Benefits(
            relocation_assistance=True, equity=True, pto=True, 
            health=True, dental=True, vision=True, _401k=True, 
            free_lunch=True, other="Other benefits offered for the job"
        )
    )
    ```
    """
    bonus_qualifications: List[str] = Field(..., description="Bonus qualifications mentioned in the job description that are not mandatory but potentially beneficial")
    salary_range: Optional[SalaryRange] = Field(None, description="Salary range for the job")
    benefits: Benefits = Field(..., description="Benefits offered for the job")
       
class JDStructuredData(BaseModel):
    """
    Pydantic model for structured data extracted from the job description.
    
    Contains job title, company name, location, job type, work type, job duties, required qualifications, preferred qualifications, and other information.
    
    ### Usage:
    
    ```python
    jd_structured_data = JDStructuredData(
        job_title="Software Engineer",
        company_name="Google",
        location=["San Francisco, CA", "New York, NY"],
        job_type="Full-time",
        work_type="Remote",
        job_duties=["Develop software applications", "Debug code", "Write documentation"],
        required_qualifications=Qualifications(
            education="Bachelor's degree in Computer Science", 
            experience="3 years of experience in software development", 
            skills=["Python", "JavaScript", "React"]
        ),
        preferred_qualifications=Qualifications(
            education="Master's degree in Computer Science", 
            experience="5 years of experience in software development", 
            skills=["Python", "JavaScript", "React", "Node.js"]
        ),
        other_information=OtherInformation(
            bonus_qualifications=["Bonus qualifications mentioned in the job description"],
            salary_range=SalaryRange(currency="USD", lower_limit=100000, upper_limit=120000),
            benefits=Benefits(
                relocation_assistance=True, equity=True, pto=True, 
                health=True, dental=True, vision=True, _401k=True, 
                free_lunch=True, other="Other benefits offered for the job"
            )
        )
    )
    ```
    """
    job_title: str = Field(..., description="Title/Position/Role of the job. For example: Software Engineer, Data Scientist, etc.")
    company_name: str = Field(..., description="Name of the company hiring for the position")
    location: List[str] = Field(..., description="Location(s) where the job is offered at")
    employment_type: str = Field(..., description="Type of job. For example: Full-time, Part-time, Contract, Internship etc.")
    location_type: str = Field(..., description="Type of work. For example: Remote, On-site, Hybrid, etc.")
    job_duties: List[str] = Field(..., description="List of expected job duties to be performed by the candidate")
    required_qualifications: Qualifications = Field(..., description="Required qualifications for the job")
    preferred_qualifications: Qualifications = Field(..., description="Preferred qualifications for the job")
    other_information: OtherInformation = Field(..., description="Other information about the job")
    


#################################################################### Resume  ###########################################################################
#                                                                 Structured Data 
############################################################# Pydantic Model Schemas ###################################################################


class ContactInformation(BaseModel):
    """
    Pydantic model for contact information of the candidate.
    
    Contains name, email, phone, address, LinkedIn, GitHub, and portfolio URL of the candidate.
    
    ### Usage:
    
    ```python
    contact_information = ContactInformation(
        name="John Doe", 
        email="john.doe@example.com", 
        phone="1234567890", 
        address="123 Main St, Anytown, USA", 
        linkedin="https://www.linkedin.com/in/john-doe", 
        github="https://github.com/john-doe", 
        portfolio="https://john-doe.com"
    )
    ```
    """
    
    name: str = Field(..., description="Name of the candidate")
    email: str = Field(..., description="Email address of the candidate")
    phone: str = Field(..., description="Phone number of the candidate")
    address: str = Field(..., description="Address of the candidate")
    linkedin: str = Field(..., description="URL to the candidate's LinkedIn profile")
    github: str = Field(..., description="URL to the candidate's GitHub profile")
    portfolio: str = Field(..., description="URL to the candidate's portfolio website")

class Education(BaseModel):
    """
    Pydantic model for education history of the candidate.
    
    Contains degree, major, school, graduation date, GPA, and relevant coursework of the education.
    
    ### Usage:
    
    ```python
    education = Education(
        degree="BS/Bachelor's", 
        major="Computer Science", 
        school="University of Example", 
        graduation_date="01-2020", 
        gpa=3.5, 
        relevant_coursework=["Data Structures", "Algorithms", "Computer Architecture"]
    )
    ```
    """
    
    degree: str = Field(..., description="Degree of the education. For example: BS/Bachelor's, MS/Master's, PhD/Doctoral, MBA/Master of Business Administration, etc.")
    major: str = Field(..., description="Major of the education. For example: Computer Science, Business Administration, etc.")
    school: str = Field(..., description="Name of the school or university")
    graduation_date: str = Field(..., description="Graduation date of the education in MM-YYYY format")
    gpa: float | None = Field(None, description="GPA of the education")
    relevant_coursework: List[str] | None = Field(None, description="Relevant coursework of the education")

class Experience(BaseModel):
    """
    Pydantic model for work experience of the candidate.
    
    Contains employer, position, duration, responsibilities, achievements, technologies used, and team size managed of the work experience.
    
    ### Usage:
    
    ```python
    experience = Experience(
        employer="Google", 
        position="Software Engineer", 
        duration=3, 
        responsibilities=["Develop software applications", "Debug code", "Write documentation"], 
        achievements=["Achievement 1", "Achievement 2", "Achievement 3"], 
        technologies_used=["Python", "JavaScript", "React"], 
        team_size_managed=10
    )
    ```
    """
    
    employer: str = Field(..., description="Name of the company where the candidate is currently employed or the most recent employer")
    position: str = Field(..., description="Position or role at the current company or the most recent position")
    duration: float = Field(..., description="Duration at the current company in years")
    responsibilities: List[str] = Field(..., description="Description of the responsibilities carried out in the position")
    achievements: List[str] = Field(..., description="Achievements of the current position in the work experience")
    technologies_used: List[str] = Field(..., description="Technologies used in the work experience")
    team_size_managed: int = Field(..., description="Team size managed in the work experience")

class Internship(BaseModel):
    """
    Pydantic model for internship history of the candidate.
    
    Contains company, title, start date, end date, description, tech stack, and outcomes of the internship.
    
    ### Usage:
    
    ```python
    internship = Internship(
        company="Google", 
        title="Software Engineer Intern", 
        start_date="01-2020", 
        end_date="05-2020", 
        description="Developed software applications", 
        tech_stack=["Python", "JavaScript", "React"], 
        outcomes=["Achievement 1", "Achievement 2", "Achievement 3"]
    )
    ```
    """
    
    company: str = Field(..., description="Name of the company where the candidate interned")
    title: str = Field(..., description="Title of the internship")
    start_date: str = Field(..., description="Start date of the internship in MM-YYYY format")
    end_date: str | None = Field(None, description="End date of the internship in MM-YYYY format")
    description: str = Field(..., description="Description of the internship")
    tech_stack: List[str] = Field(..., description="Tech stack of the internship")
    outcomes: List[str] = Field(..., description="Outcomes of the internship")

class Project(BaseModel):
    """
    Pydantic model for projects worked on by the candidate.
    
    Contains name, start date, end date, description, tech stack, role, and outcomes of the project.
    
    ### Usage:
    
    ```python
    project = Project(
        name="Project 1", 
        start_date="01-2020", 
        end_date="05-2020", 
        description="Developed software applications", 
        tech_stack=["Python", "JavaScript", "React"], 
        role="Software Engineer", 
        outcomes=["Achievement 1", "Achievement 2", "Achievement 3"]
    )
    ```
    """
    name: str = Field(..., description="Name of the project")
    start_date: str = Field(..., description="Start date of the project in MM-YYYY format")
    end_date: str | None = Field(None, description="End date of the project in MM-YYYY format")
    description: str = Field(..., description="Description of the project")
    tech_stack: List[str] = Field(..., description="Tech stack of the project")
    role: str = Field(..., description="Role of the candidate in the project")
    outcomes: List[str] = Field(..., description="Outcomes of the project")

class Certification(BaseModel):
    """
    Pydantic model for certifications obtained by the candidate.
    
    Contains name, issuing organization, issue date, expiration date, credential ID, and credential URL of the certification.
    
    ### Usage:
    
    ```python
    certification = Certification(name="Certification 1", issuing_organization="Organization 1", issue_date="01-2020", expiration_date="05-2020", credential_id="1234567890", credential_url="https://certification.com/1234567890")
    ```
    """
    name: str = Field(..., description="Name of the certification")
    issuing_organization: str = Field(..., description="Issuing organization of the certification")
    issue_date: str = Field(..., description="Issue date of the certification in MM-YYYY format")
    expiration_date: str = Field(..., description="Expiration date of the certification in MM-YYYY format")
    credential_id: str = Field(..., description="Credential ID of the certification")
    credential_url: str = Field(..., description="Credential URL of the certification")
    
class ResearchAndPublication(BaseModel):
    title: str = Field(..., description="Title or name of the work/research published")
    url: str = Field(..., description="URL of the published work/research")
    
    
class ResumeOtherInformation(BaseModel):
    awards_and_achievements: List[str] = Field(..., description="Awards and achievements of the candidate.For example: Employee of the Month, Best Project Award, Dean's List, Fellowships, etc.")
    research_and_publications: List[ResearchAndPublication] = Field(..., description="Research and publications of the candidate")
    volunteering: str = Field(..., description="Volunteering experience of the candidate")
    leadership: str = Field(..., description="Leadership experience of the candidate")
    soft_skills: List[str] = Field(..., description="Soft skills of the candidate")
    languages: List[str] = Field(..., description="Languages spoken by the candidate")
    
    
class ResumeStructuredData(BaseModel):
    """
    Pydantic model for structured data extracted from the resume.
    
    Contains summary, job title, contact information, education, experience, internships, projects, certifications, other information, and technical skills of the candidate.
    
    ### Usage:
    
    ```python
    resume_structured_data = ResumeStructuredData(
        summary="Summary of the resume",
        job_title="Software Engineer",
        contact_information=ContactInformation(
            name="John Doe", 
            email="john.doe@example.com", 
            phone="1234567890", 
            address="123 Main St, Anytown, USA", 
            linkedin="https://www.linkedin.com/in/john-doe", 
            github="https://github.com/john-doe", 
            portfolio="https://john-doe.com"
        ),
        education=[
            Education(
                degree="BS/Bachelor's", 
                major="Computer Science", 
                school="University of Example", 
                graduation_date="01-2020", 
                gpa=3.5, 
                relevant_coursework=["Data Structures", "Algorithms", "Computer Architecture"]
            )
        ],
        experience=[
            Experience(
                employer="Google", 
                position="Software Engineer", 
                duration=3, 
                responsibilities=["Develop software applications", "Debug code", "Write documentation"], 
                achievements=["Achievement 1", "Achievement 2", "Achievement 3"], 
                technologies_used=["Python", "JavaScript", "React"], 
                team_size_managed=10
            )
        ],
        internships=[
            Internship(
                company="Google", 
                title="Software Engineer Intern", 
                start_date="01-2020", 
                end_date="05-2020", 
                description="Developed software applications", 
                tech_stack=["Python", "JavaScript", "React"], 
                outcomes=["Achievement 1", "Achievement 2", "Achievement 3"]
            )
        ],
        projects=[
            Project(
                name="Project 1", 
                start_date="01-2020", 
                end_date="05-2020", 
                description="Developed software applications", 
                tech_stack=["Python", "JavaScript", "React"], 
                role="Software Engineer", 
                outcomes=["Achievement 1", "Achievement 2", "Achievement 3"]
            )
        ],
        certifications=[
            Certification(
                name="Certification 1", 
                issuing_organization="Organization 1", 
                issue_date="01-2020", 
                expiration_date="05-2020", 
                credential_id="1234567890", 
                credential_url="https://certification.com/1234567890"
            )
        ],
        other_information=OtherInformation(
            bonus_qualifications=["Bonus qualifications mentioned in the job description"], 
            salary_range=SalaryRange(currency="USD", lower_limit=100000, upper_limit=120000), 
            benefits=Benefits(
                relocation_assistance=True, equity=True, pto=True, 
                health=True, dental=True, vision=True, _401k=True, 
                free_lunch=True, other="Other benefits offered for the job"
            )
        ),
        technical_skills=["Python", "JavaScript", "React"]
    )
    ```
    """
    
    summary: str = Field(..., description="Summary of the resume")
    job_title: str = Field(..., description="Current Job title of the candidate or the position they are applying for")
    contact_information: ContactInformation = Field(..., description="Contact information of the candidate")
    education: List[Education] = Field(..., description="Education history of the candidate")
    experience: List[Experience] = Field(..., description="Work experience of the candidate")
    internships: List[Internship] = Field(..., description="Internship history of the candidate")
    projects: List[Project] = Field(..., description="Projects worked on by the candidate")
    certifications: List[Certification] = Field(..., description="Certifications obtained by the candidate")
    other_information: ResumeOtherInformation = Field(..., description="Other information of the candidate")
    technical_skills: List[str] = Field(..., description="Technical Skills of the candidate")