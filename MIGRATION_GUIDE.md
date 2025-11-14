# Migration Guide: Monolithic to Agentic Architecture

This guide provides step-by-step instructions for migrating ResAlign AI from the current monolithic service architecture to an agentic framework with a public Python SDK.

---

## Table of Contents

1. [Pre-Migration Checklist](#pre-migration-checklist)
2. [Phase 1: Agent Infrastructure Setup](#phase-1-agent-infrastructure-setup)
3. [Phase 2: Service to Tool Migration](#phase-2-service-to-tool-migration)
4. [Phase 3: SDK Development](#phase-3-sdk-development)
5. [Phase 4: Integration Layer](#phase-4-integration-layer)
6. [Phase 5: Testing & Validation](#phase-5-testing--validation)
7. [Phase 6: Production Cutover](#phase-6-production-cutover)
8. [Rollback Procedures](#rollback-procedures)
9. [Monitoring & Debugging](#monitoring--debugging)

---

## Pre-Migration Checklist

### 1. Environment Setup

- [ ] Create LangSmith account and project
  ```bash
  # Sign up at https://smith.langchain.com/
  # Create new project: "resalign-prod"
  # Get API key from settings
  ```

- [ ] Set up environment variables
  ```bash
  # Add to backend/.env
  LANGSMITH_API_KEY=your_langsmith_key
  LANGSMITH_PROJECT=resalign-prod
  LANGCHAIN_TRACING_V2=true
  USE_AGENT_ORCHESTRATION=false  # Feature flag
  ```

- [ ] Install new dependencies
  ```bash
  cd backend
  pip install -r requirements-new.txt
  ```

- [ ] Verify installations
  ```bash
  python -c "import langgraph; print(langgraph.__version__)"
  python -c "import langsmith; print(langsmith.__version__)"
  ```

### 2. Backup Current System

- [ ] Create git branch for legacy code
  ```bash
  git checkout -b legacy/monolithic-analysis
  git push origin legacy/monolithic-analysis
  ```

- [ ] Export current database schema
  ```bash
  # From Supabase dashboard:
  # SQL Editor → Export Schema
  # Save to migrations/supabase/baseline_schema.sql
  ```

- [ ] Document current API response formats
  ```bash
  # Create baseline tests
  pytest tests/integration/ --record-mode=once
  ```

### 3. Create Development Branch

```bash
git checkout -b feature/agentic-migration
```

---

## Phase 1: Agent Infrastructure Setup

### Week 1: Base Agent Classes

#### Task 1.1: Create Base Agent Class

**File**: `backend/agents/base.py`

```python
"""
Base agent class for all ResAlign agents.
"""
from typing import Dict, Any, List, Optional
from abc import ABC, abstractmethod
from langchain_core.language_models import BaseChatModel
from langsmith import traceable

class BaseAgent(ABC):
    """Base class for all agents in the system."""
    
    def __init__(
        self,
        llm: BaseChatModel,
        name: str,
        description: str,
        tools: Optional[List] = None
    ):
        self.llm = llm
        self.name = name
        self.description = description
        self.tools = tools or []
    
    @traceable(name="agent_execute")
    @abstractmethod
    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the agent's main logic.
        
        Args:
            state: Current agent state
            
        Returns:
            Updated state after agent execution
        """
        pass
    
    def get_system_prompt(self) -> str:
        """Get the agent's system prompt."""
        return f"You are {self.name}. {self.description}"
```

**Checklist**:
- [ ] Create `backend/agents/` directory
- [ ] Implement `BaseAgent` class
- [ ] Add unit tests in `tests/unit/test_agents/test_base.py`
- [ ] Verify LangSmith tracing works

#### Task 1.2: Define Agent State

**File**: `backend/agents/state.py`

```python
"""
Agent state definitions for LangGraph workflows.
"""
from typing import TypedDict, List, Dict, Any, Optional

class AgentState(TypedDict):
    """State shared across all agent nodes."""
    
    # Input data
    resume: Dict[str, Any]
    jd: Dict[str, Any]
    user_id: str
    analysis_id: Optional[str]
    
    # Research data
    company_info: Optional[Dict]
    job_market_data: Optional[Dict]
    
    # Analysis results
    scores: Optional[Dict]
    overall_score: Optional[float]
    fit_classification: Optional[str]
    match_details: Optional[Dict]
    
    # Generated content
    fit_rationale: Optional[str]
    recommendations: Optional[List[str]]
    learning_resources: Optional[List[Dict]]
    
    # Workflow control
    skip_research: bool
    error: Optional[str]
    
    # Metadata
    progress: int
    current_stage: str
```

**Checklist**:
- [ ] Create `backend/agents/state.py`
- [ ] Define `AgentState` TypedDict
- [ ] Add type validation tests
- [ ] Document state fields

#### Task 1.3: Create Agent Tools Base

**File**: `backend/agents/tools/base.py`

```python
"""
Base tool class for agent actions.
"""
from typing import Any, Type
from pydantic import BaseModel
from langchain_core.tools import BaseTool as LangChainBaseTool
from langsmith import traceable

class ToolInput(BaseModel):
    """Base input schema for tools."""
    pass

class ToolOutput(BaseModel):
    """Base output schema for tools."""
    success: bool
    result: Any
    error: Optional[str] = None

class BaseTool(LangChainBaseTool):
    """Base class for all agent tools."""
    
    name: str
    description: str
    args_schema: Type[ToolInput]
    
    @traceable(name="tool_execute")
    def _run(self, **kwargs) -> ToolOutput:
        """Synchronous tool execution."""
        return self.execute(**kwargs)
    
    @traceable(name="tool_execute_async")
    async def _arun(self, **kwargs) -> ToolOutput:
        """Asynchronous tool execution."""
        return await self.execute_async(**kwargs)
    
    def execute(self, **kwargs) -> ToolOutput:
        """Implement tool logic here."""
        raise NotImplementedError
    
    async def execute_async(self, **kwargs) -> ToolOutput:
        """Async implementation of tool logic."""
        # Default: run sync version in thread pool
        import asyncio
        return await asyncio.to_thread(self.execute, **kwargs)
```

**Checklist**:
- [ ] Create `backend/agents/tools/` directory
- [ ] Implement `BaseTool` class
- [ ] Add unit tests for tool base class
- [ ] Document tool creation pattern

### Week 2: Convert Services to Tools

#### Task 2.1: Scoring Tool

**File**: `backend/agents/tools/scoring_tools.py`

```python
"""
Scoring tools for resume analysis.
"""
from typing import Dict, Any
from pydantic import BaseModel, Field
from .base import BaseTool, ToolOutput
from api.services.scorer import get_scoring_service
from api._types import ResumeStructuredData, JDStructuredData

class ScoreResumeInput(BaseModel):
    """Input for scoring tool."""
    resume: Dict[str, Any] = Field(description="Structured resume data")
    jd: Dict[str, Any] = Field(description="Structured job description data")

class ScoreResumeTool(BaseTool):
    """Tool for calculating resume-JD compatibility scores."""
    
    name = "score_resume"
    description = (
        "Calculate compatibility score between a resume and job description. "
        "Returns overall score and category breakdowns."
    )
    args_schema = ScoreResumeInput
    
    def execute(self, resume: Dict, jd: Dict) -> ToolOutput:
        """Execute scoring logic."""
        try:
            # Parse into Pydantic models
            resume_obj = ResumeStructuredData(**resume)
            jd_obj = JDStructuredData(**jd)
            
            # Use existing scorer service
            scorer = get_scoring_service()
            scores = scorer.calculate_scores(resume_obj, jd_obj)
            
            return ToolOutput(
                success=True,
                result=scores
            )
        except Exception as e:
            return ToolOutput(
                success=False,
                result={},
                error=str(e)
            )
```

**Checklist**:
- [ ] Implement `ScoreResumeTool`
- [ ] Add `MatchSkillsTool` (wraps matcher service)
- [ ] Add unit tests for scoring tools
- [ ] Test with LangSmith tracing

#### Task 2.2: Research Tools

**File**: `backend/agents/tools/research_tools.py`

```python
"""
Research tools for gathering external data.
"""
from pydantic import BaseModel, Field
from .base import BaseTool, ToolOutput
import httpx

class CompanyResearchInput(BaseModel):
    """Input for company research tool."""
    company_name: str = Field(description="Name of the company to research")

class CompanyResearchTool(BaseTool):
    """Tool for researching company information."""
    
    name = "research_company"
    description = (
        "Research company information including size, industry, culture, "
        "and recent news. Useful for contextualizing job fit."
    )
    args_schema = CompanyResearchInput
    
    def execute(self, company_name: str) -> ToolOutput:
        """Execute company research."""
        try:
            # TODO: Integrate with data sources
            # - LinkedIn Company API
            # - Crunchbase API
            # - Google News API
            
            # Placeholder implementation
            company_info = {
                "name": company_name,
                "industry": "Technology",
                "size": "1000-5000 employees",
                "culture": "Fast-paced, innovative",
            }
            
            return ToolOutput(success=True, result=company_info)
        except Exception as e:
            return ToolOutput(success=False, result={}, error=str(e))
```

**Checklist**:
- [ ] Implement `CompanyResearchTool`
- [ ] Implement `JobMarketTool`
- [ ] Add caching for research results
- [ ] Add unit tests

#### Task 2.3: Database Tools

**File**: `backend/agents/tools/database_tools.py`

```python
"""
Database query tools for agents.
"""
from typing import Dict, Any
from pydantic import BaseModel, Field
from .base import BaseTool, ToolOutput
from api.services.supabase import get_supabase_client

class FetchResumeInput(BaseModel):
    """Input for fetching resume."""
    resume_id: str = Field(description="UUID of the resume")
    user_id: str = Field(description="UUID of the user")

class FetchResumeTool(BaseTool):
    """Tool for fetching resume data from database."""
    
    name = "fetch_resume"
    description = "Fetch resume data from the database by ID"
    args_schema = FetchResumeInput
    
    async def execute_async(self, resume_id: str, user_id: str) -> ToolOutput:
        """Fetch resume from database."""
        try:
            supabase = get_supabase_client()
            resumes = await supabase.select(
                table="resumes",
                query_filter={"id": resume_id, "user_id": user_id}
            )
            
            if not resumes:
                return ToolOutput(
                    success=False,
                    result={},
                    error="Resume not found"
                )
            
            return ToolOutput(success=True, result=resumes[0])
        except Exception as e:
            return ToolOutput(success=False, result={}, error=str(e))
```

**Checklist**:
- [ ] Implement `FetchResumeTool`
- [ ] Implement `FetchJobTool`
- [ ] Implement `SaveAnalysisTool`
- [ ] Add unit tests with mock database

### Week 3: Build Agent Nodes

#### Task 3.1: Researcher Agent

**File**: `backend/agents/nodes/researcher.py`

```python
"""
Researcher agent for gathering external context.
"""
from typing import Dict, Any
from ..base import BaseAgent
from ..state import AgentState
from ..tools.research_tools import CompanyResearchTool, JobMarketTool

class ResearcherAgent(BaseAgent):
    """Agent responsible for researching company and job market data."""
    
    def __init__(self, llm):
        super().__init__(
            llm=llm,
            name="Researcher",
            description="I research companies and job market trends to provide context.",
            tools=[CompanyResearchTool(), JobMarketTool()]
        )
    
    async def execute(self, state: AgentState) -> AgentState:
        """
        Research company and job market data.
        
        Args:
            state: Current agent state with JD data
            
        Returns:
            Updated state with research results
        """
        # Skip research if flag is set
        if state.get("skip_research"):
            return state
        
        jd = state["jd"]
        company_name = jd.get("company", {}).get("name")
        
        if not company_name:
            return state
        
        # Use research tools
        company_tool = CompanyResearchTool()
        company_info = await company_tool._arun(company_name=company_name)
        
        # Update state
        state["company_info"] = company_info.result if company_info.success else None
        state["progress"] = 40
        state["current_stage"] = "research_complete"
        
        return state
```

**Checklist**:
- [ ] Implement `ResearcherAgent`
- [ ] Add system prompt template
- [ ] Add unit tests
- [ ] Test with LangSmith tracing

#### Task 3.2: Scorer Agent

**File**: `backend/agents/nodes/scorer.py`

```python
"""
Scorer agent for calculating compatibility scores.
"""
from typing import Dict, Any
from ..base import BaseAgent
from ..state import AgentState
from ..tools.scoring_tools import ScoreResumeTool, MatchSkillsTool
from api.services.scorer import get_scoring_service

class ScorerAgent(BaseAgent):
    """Agent responsible for scoring resume vs job description."""
    
    def __init__(self, llm):
        super().__init__(
            llm=llm,
            name="Scorer",
            description="I calculate compatibility scores between resumes and jobs.",
            tools=[ScoreResumeTool(), MatchSkillsTool()]
        )
    
    async def execute(self, state: AgentState) -> AgentState:
        """
        Calculate scores and determine fit.
        
        Args:
            state: Current agent state with resume and JD
            
        Returns:
            Updated state with scores and fit classification
        """
        resume = state["resume"]
        jd = state["jd"]
        
        # Use scoring tool
        score_tool = ScoreResumeTool()
        scores_result = await score_tool._arun(resume=resume, jd=jd)
        
        if not scores_result.success:
            state["error"] = scores_result.error
            return state
        
        scores = scores_result.result
        overall_score = scores.get("overall_score", 0)
        
        # Determine fit classification
        scorer = get_scoring_service()
        fit_classification = scorer.determine_fit_classification(overall_score)
        
        # Get match details for rationale generation
        match_tool = MatchSkillsTool()
        match_result = await match_tool._arun(resume=resume, jd=jd)
        
        # Update state
        state["scores"] = scores
        state["overall_score"] = overall_score
        state["fit_classification"] = fit_classification.value
        state["match_details"] = match_result.result if match_result.success else {}
        state["progress"] = 60
        state["current_stage"] = "scoring_complete"
        
        return state
```

**Checklist**:
- [ ] Implement `ScorerAgent`
- [ ] Add unit tests
- [ ] Test with mock LLM
- [ ] Verify LangSmith traces

#### Task 3.3: Analyzer & Recommender Agents

Follow similar pattern for:
- [ ] `AnalyzerAgent` - Generates fit rationale
- [ ] `RecommenderAgent` - Generates recommendations and learning resources

### Week 4: Build LangGraph Workflow

#### Task 4.1: Create Analysis Graph

**File**: `backend/agents/graph.py`

```python
"""
LangGraph workflow for resume analysis.
"""
from typing import Dict, Any
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from .state import AgentState
from .nodes.researcher import ResearcherAgent
from .nodes.scorer import ScorerAgent
from .nodes.analyzer import AnalyzerAgent
from .nodes.recommender import RecommenderAgent
from api.config import settings

def should_skip_research(state: AgentState) -> str:
    """Conditional edge: decide if research is needed."""
    if state.get("skip_research") or state.get("company_info"):
        return "scorer"
    return "researcher"

def create_analysis_graph() -> StateGraph:
    """
    Create the analysis workflow graph.
    
    Returns:
        Compiled LangGraph workflow
    """
    # Initialize LLM
    llm = ChatGoogleGenerativeAI(
        model=settings.LLM_MODEL,
        google_api_key=settings.GEMINI_API_KEY
    )
    
    # Initialize agents
    researcher = ResearcherAgent(llm)
    scorer = ScorerAgent(llm)
    analyzer = AnalyzerAgent(llm)
    recommender = RecommenderAgent(llm)
    
    # Build graph
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("researcher", researcher.execute)
    workflow.add_node("scorer", scorer.execute)
    workflow.add_node("analyzer", analyzer.execute)
    workflow.add_node("recommender", recommender.execute)
    
    # Add edges
    workflow.set_entry_point("researcher")
    workflow.add_edge("researcher", "scorer")
    workflow.add_edge("scorer", "analyzer")
    workflow.add_edge("analyzer", "recommender")
    workflow.add_edge("recommender", END)
    
    # Compile graph
    return workflow.compile()

# Global graph instance
analysis_graph = create_analysis_graph()
```

**Checklist**:
- [ ] Implement graph creation
- [ ] Add conditional edges
- [ ] Test graph execution
- [ ] Visualize graph with LangGraph Studio

#### Task 4.2: Integrate with API Route

**File**: `backend/api/routes/analyze.py` (REFACTOR)

```python
# Add at top of file
from agents.graph import analysis_graph
from agents.state import AgentState
from api.config import settings

# In analyze_sse_stream function, add feature flag:
async def generate_stream() -> AsyncGenerator[str, None]:
    try:
        # ... existing code ...
        
        # Feature flag: use agent orchestration or legacy flow
        if settings.USE_AGENT_ORCHESTRATION:
            # NEW: Agent-based analysis
            initial_state = AgentState(
                resume=resume.model_dump(),
                jd=jd.model_dump(),
                user_id=user_id,
                analysis_id=analysis_id,
                skip_research=False,
                progress=30,
                current_stage="starting"
            )
            
            # Run agent workflow
            final_state = await analysis_graph.ainvoke(initial_state)
            
            # Extract results from state
            overall_score = final_state["overall_score"]
            fit_classification = final_state["fit_classification"]
            # ... etc
        else:
            # EXISTING: Legacy service-based flow
            scores = scorer.calculate_scores(resume, jd)
            # ... existing code ...
```

**Checklist**:
- [ ] Add feature flag logic
- [ ] Test with flag enabled
- [ ] Compare results between old and new flows
- [ ] Ensure SSE streaming still works

---

## Phase 2: Service to Tool Migration

### Migration Pattern

For each service in `backend/api/services/`:

1. Create corresponding tool in `backend/agents/tools/`
2. Wrap service logic in tool's `execute()` method
3. Add unit tests for tool
4. Update agent to use tool instead of calling service directly
5. Keep service for backward compatibility during migration

### Services to Migrate

- [ ] `scorer.py` → `scoring_tools.py` ✅
- [ ] `matcher.py` → `matching_tools.py`
- [ ] `llm_service.py` → Keep as service (used by tools)
- [ ] `supabase.py` → Keep as service (used by database tools)
- [ ] `reducto.py` → Keep as service (used by extraction)
- [ ] `fit_rationale_service.py` → `llm_tools.py`
- [ ] `resume_recommendation_service.py` → `recommendation_tools.py`
- [ ] `learning_resource_service.py` → `learning_tools.py`

---

## Phase 3: SDK Development

### Week 5-6: Build Python SDK

See [sdk/README.md](sdk/README.md) for full SDK documentation.

#### Task 5.1: SDK Core

**File**: `sdk/resalign/client.py`

```python
"""
ResAlign AI Python SDK - Main Client
"""
import os
from typing import Optional
import httpx
from .auth import Auth
from .resources import Analyses, Resumes, Jobs
from .streaming import StreamingClient
from .exceptions import ResAlignError

class ResAlignClient:
    """
    Main entry point for ResAlign AI SDK.
    
    Example:
        >>> from resalign import ResAlignClient
        >>> client = ResAlignClient(api_key="your_key")
        >>> analysis = client.analyses.create(resume_id="...", jd_id="...")
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = "https://api.resalign.ai",
        timeout: int = 30
    ):
        """
        Initialize SDK client.
        
        Args:
            api_key: API key for authentication. If not provided,
                     reads from RESALIGN_API_KEY environment variable.
            base_url: Base URL for the API
            timeout: Request timeout in seconds
        """
        self.api_key = api_key or os.getenv("RESALIGN_API_KEY")
        if not self.api_key:
            raise ValueError(
                "API key required. Provide via api_key parameter or "
                "RESALIGN_API_KEY environment variable."
            )
        
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        
        # Initialize auth
        self.auth = Auth(api_key=self.api_key)
        
        # Initialize HTTP client
        self._client = httpx.Client(
            base_url=self.base_url,
            timeout=timeout,
            headers=self.auth.get_headers()
        )
        
        # Initialize resources
        self.analyses = Analyses(self)
        self.resumes = Resumes(self)
        self.jobs = Jobs(self)
        self.streaming = StreamingClient(self)
    
    def _request(
        self,
        method: str,
        path: str,
        **kwargs
    ) -> dict:
        """Make HTTP request to API."""
        try:
            response = self._client.request(method, path, **kwargs)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise ResAlignError(f"HTTP {e.response.status_code}: {e.response.text}")
        except Exception as e:
            raise ResAlignError(str(e))
    
    def close(self):
        """Close HTTP client."""
        self._client.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, *args):
        self.close()
```

**Checklist**:
- [ ] Implement core client
- [ ] Add authentication handling
- [ ] Add resource endpoints (analyses, resumes, jobs)
- [ ] Add streaming support
- [ ] Write comprehensive tests
- [ ] Add type hints and docstrings

#### Task 5.2: SDK Resources

Implement resource classes:
- [ ] `sdk/resalign/resources/analyses.py`
- [ ] `sdk/resalign/resources/resumes.py`
- [ ] `sdk/resalign/resources/jobs.py`

#### Task 5.3: Streaming Client

- [ ] `sdk/resalign/streaming/client.py` - SSE streaming support

#### Task 5.4: SDK Testing & Documentation

- [ ] Unit tests for all SDK components
- [ ] Integration tests against local API
- [ ] Example scripts in `sdk/examples/`
- [ ] Complete API reference documentation

#### Task 5.5: Publish to PyPI

- [ ] Test on TestPyPI
  ```bash
  python -m build
  twine upload --repository testpypi dist/*
  ```
- [ ] Install and test from TestPyPI
- [ ] Publish to production PyPI
- [ ] Create GitHub release

---

## Phase 4: Integration Layer

### Week 7: ATS Integrations

#### Task 7.1: Integration Base Class

**File**: `backend/integrations/base.py`

```python
"""
Base class for third-party integrations.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import httpx
from datetime import datetime, timedelta

class BaseIntegration(ABC):
    """Base class for all third-party integrations."""
    
    def __init__(
        self,
        api_key: str,
        base_url: str,
        rate_limit: int = 100,  # requests per minute
        timeout: int = 30
    ):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.rate_limit = rate_limit
        self.timeout = timeout
        
        # HTTP client
        self._client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=timeout,
            headers=self.get_auth_headers()
        )
        
        # Rate limiting
        self._request_times = []
    
    @abstractmethod
    def get_auth_headers(self) -> Dict[str, str]:
        """Get authentication headers for API requests."""
        pass
    
    async def _request(
        self,
        method: str,
        path: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Make rate-limited HTTP request."""
        # Rate limiting
        await self._check_rate_limit()
        
        # Make request with retry logic
        for attempt in range(3):
            try:
                response = await self._client.request(method, path, **kwargs)
                response.raise_for_status()
                self._request_times.append(datetime.now())
                return response.json()
            except httpx.HTTPStatusError as e:
                if attempt == 2:  # Last attempt
                    raise
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
    
    async def _check_rate_limit(self):
        """Enforce rate limiting."""
        now = datetime.now()
        cutoff = now - timedelta(minutes=1)
        
        # Remove old requests
        self._request_times = [
            t for t in self._request_times if t > cutoff
        ]
        
        # Wait if rate limit exceeded
        if len(self._request_times) >= self.rate_limit:
            sleep_time = 60 - (now - self._request_times[0]).seconds
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)
    
    @abstractmethod
    async def fetch_candidate(self, candidate_id: str) -> Dict[str, Any]:
        """Fetch candidate data from ATS."""
        pass
    
    @abstractmethod
    async def fetch_job(self, job_id: str) -> Dict[str, Any]:
        """Fetch job posting from ATS."""
        pass
    
    @abstractmethod
    def verify_webhook_signature(
        self,
        payload: bytes,
        signature: str
    ) -> bool:
        """Verify webhook signature."""
        pass
```

**Checklist**:
- [ ] Implement base integration class
- [ ] Add rate limiting
- [ ] Add retry logic
- [ ] Add webhook signature verification
- [ ] Write unit tests

#### Task 7.2: Ashby Integration

**File**: `backend/integrations/ats/ashby.py`

```python
"""
Ashby ATS integration.
"""
import hmac
import hashlib
from typing import Dict, Any
from ..base import BaseIntegration

class AshbyIntegration(BaseIntegration):
    """Integration with Ashby ATS."""
    
    def __init__(self, api_key: str, webhook_secret: str):
        super().__init__(
            api_key=api_key,
            base_url="https://api.ashbyhq.com",
            rate_limit=100
        )
        self.webhook_secret = webhook_secret
    
    def get_auth_headers(self) -> Dict[str, str]:
        """Ashby uses Basic auth."""
        return {
            "Authorization": f"Basic {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def fetch_candidate(self, candidate_id: str) -> Dict[str, Any]:
        """Fetch candidate from Ashby."""
        response = await self._request(
            "POST",
            "/candidate.info",
            json={"candidateId": candidate_id}
        )
        return self._transform_candidate(response)
    
    async def fetch_job(self, job_id: str) -> Dict[str, Any]:
        """Fetch job posting from Ashby."""
        response = await self._request(
            "POST",
            "/jobPosting.info",
            json={"jobPostingId": job_id}
        )
        return self._transform_job(response)
    
    def _transform_candidate(self, ashby_data: Dict) -> Dict:
        """Transform Ashby candidate data to internal format."""
        # Map Ashby fields to ResAlign format
        return {
            "external_id": ashby_data.get("id"),
            "name": ashby_data.get("name"),
            "email": ashby_data.get("email"),
            "resume_url": ashby_data.get("resumeFileHandle"),
            # ... more fields
        }
    
    def _transform_job(self, ashby_data: Dict) -> Dict:
        """Transform Ashby job data to internal format."""
        return {
            "external_id": ashby_data.get("id"),
            "title": ashby_data.get("title"),
            "description": ashby_data.get("description"),
            # ... more fields
        }
    
    def verify_webhook_signature(
        self,
        payload: bytes,
        signature: str
    ) -> bool:
        """Verify Ashby webhook signature."""
        expected = hmac.new(
            self.webhook_secret.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(signature, expected)
```

**Checklist**:
- [ ] Implement Ashby integration
- [ ] Implement Lever integration (`integrations/ats/lever.py`)
- [ ] Implement Greenhouse integration (`integrations/ats/greenhouse.py`)
- [ ] Add integration tests with mock HTTP
- [ ] Document setup process for each ATS

#### Task 7.3: Webhook Endpoint

**File**: `backend/api/routes/webhook.py`

```python
"""
Webhook endpoint for ATS integrations.
"""
from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from integrations.ats.ashby import AshbyIntegration
from integrations.ats.lever import LeverIntegration
from agents.graph import analysis_graph
from api.config import settings

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

@router.post("/ashby")
async def ashby_webhook(
    request: Request,
    background_tasks: BackgroundTasks
):
    """
    Receive webhooks from Ashby ATS.
    
    Triggered on:
    - New candidate application
    - Application status change
    - Interview completed
    """
    # Get payload and signature
    payload = await request.body()
    signature = request.headers.get("X-Ashby-Signature")
    
    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature")
    
    # Verify signature
    ashby = AshbyIntegration(
        api_key=settings.ASHBY_API_KEY,
        webhook_secret=settings.ASHBY_WEBHOOK_SECRET
    )
    
    if not ashby.verify_webhook_signature(payload, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    # Parse payload
    data = await request.json()
    event_type = data.get("type")
    
    if event_type == "application.created":
        # Trigger analysis workflow in background
        background_tasks.add_task(
            process_new_application,
            candidate_id=data["candidateId"],
            job_id=data["jobId"]
        )
    
    return {"status": "received"}

async def process_new_application(candidate_id: str, job_id: str):
    """Process new application from ATS."""
    # Fetch candidate and job data
    ashby = AshbyIntegration(...)
    candidate = await ashby.fetch_candidate(candidate_id)
    job = await ashby.fetch_job(job_id)
    
    # Run analysis workflow
    initial_state = {
        "resume": candidate["resume"],
        "jd": job,
        "user_id": "system",  # System-triggered analysis
        # ... other state fields
    }
    
    result = await analysis_graph.ainvoke(initial_state)
    
    # Send results back to Ashby
    await ashby.post_analysis_result(candidate_id, result)
```

**Checklist**:
- [ ] Implement webhook endpoint
- [ ] Add signature verification
- [ ] Add background task processing
- [ ] Test with ngrok + Ashby test webhooks
- [ ] Document webhook setup

---

## Phase 5: Testing & Validation

### Week 8: Comprehensive Testing

#### Unit Tests

```bash
# Run unit tests
pytest tests/unit/ -v

# With coverage
pytest tests/unit/ --cov=api --cov=agents --cov-report=html
```

**Checklist**:
- [ ] Agent unit tests (>80% coverage)
- [ ] Tool unit tests (>80% coverage)
- [ ] SDK unit tests (>80% coverage)
- [ ] Service unit tests (maintain existing)

#### Integration Tests

```bash
# Run integration tests
pytest tests/integration/ -v
```

**Checklist**:
- [ ] Agent workflow integration tests
- [ ] SDK → API integration tests
- [ ] ATS integration tests (with mocks)
- [ ] Database integration tests

#### End-to-End Tests

```bash
# Run E2E tests
pytest tests/e2e/ -v
```

**Checklist**:
- [ ] Full analysis flow (upload → analyze → results)
- [ ] Webhook flow (receive → process → callback)
- [ ] Streaming flow (SSE events)

#### Comparison Testing

Test that agent-based flow produces similar results to legacy flow:

```python
# tests/comparison/test_legacy_vs_agent.py
def test_analysis_results_match():
    """Compare legacy and agent-based analysis results."""
    
    # Run legacy flow
    legacy_result = run_legacy_analysis(resume, jd)
    
    # Run agent flow
    agent_result = run_agent_analysis(resume, jd)
    
    # Compare results
    assert abs(legacy_result.overall_score - agent_result.overall_score) < 5
    assert legacy_result.fit_classification == agent_result.fit_classification
    assert len(legacy_result.recommendations) > 0
    assert len(agent_result.recommendations) > 0
```

**Checklist**:
- [ ] Score comparison tests
- [ ] Performance comparison tests
- [ ] Output quality comparison
- [ ] Token usage comparison (LangSmith)

---

## Phase 6: Production Cutover

### Week 9-10: Gradual Rollout

#### Step 1: Deploy to Staging

```bash
# Deploy backend to staging
git push staging feature/agentic-migration

# Run smoke tests
pytest tests/e2e/ --env=staging
```

**Checklist**:
- [ ] Deploy to staging environment
- [ ] Run full test suite against staging
- [ ] Verify LangSmith traces
- [ ] Load test with locust

#### Step 2: Enable Feature Flag for Internal Users

```python
# In api/config.py, update:
USE_AGENT_ORCHESTRATION = os.getenv("USE_AGENT_ORCHESTRATION", "false").lower() == "true"

# Enable for specific user IDs
AGENT_BETA_USERS = os.getenv("AGENT_BETA_USERS", "").split(",")

# In analyze route:
use_agents = (
    settings.USE_AGENT_ORCHESTRATION or
    user_id in settings.AGENT_BETA_USERS
)
```

**Checklist**:
- [ ] Enable for internal team (add user IDs to AGENT_BETA_USERS)
- [ ] Monitor for 1 week
- [ ] Collect feedback
- [ ] Fix any issues

#### Step 3: Gradual Rollout (10% → 50% → 100%)

```python
# Percentage-based rollout
import hashlib

def should_use_agents(user_id: str, rollout_percentage: int) -> bool:
    """Determine if user should use agent flow."""
    if settings.USE_AGENT_ORCHESTRATION:
        return True
    
    # Hash user ID to get consistent assignment
    hash_val = int(hashlib.md5(user_id.encode()).hexdigest(), 16)
    bucket = hash_val % 100
    
    return bucket < rollout_percentage

# In analyze route:
use_agents = should_use_agents(user_id, rollout_percentage=10)  # Start with 10%
```

**Rollout Schedule**:
- [ ] Week 9, Day 1: 10% rollout
- [ ] Week 9, Day 3: 25% rollout (if no issues)
- [ ] Week 9, Day 5: 50% rollout (if no issues)
- [ ] Week 10, Day 2: 75% rollout (if no issues)
- [ ] Week 10, Day 5: 100% rollout

**Monitoring During Rollout**:
- Error rates (should stay < 1%)
- Response times (should stay < 10s for p95)
- LLM token usage (monitor costs)
- User-reported issues

#### Step 4: Remove Legacy Code

Once 100% rollout is stable for 1 week:

```bash
# Remove legacy code
git checkout main
git merge feature/agentic-migration

# Remove unused code
rm backend/api/routes/analyze_legacy.py
# Update routes to only use agent flow
```

**Checklist**:
- [ ] Remove feature flag
- [ ] Remove legacy analysis code
- [ ] Update documentation
- [ ] Publish SDK v1.0 to PyPI
- [ ] Announce migration completion

---

## Rollback Procedures

### If Issues Arise During Rollout

#### Immediate Rollback (< 5 minutes)

```bash
# Disable agent orchestration via environment variable
# In Cloud Run / hosting platform:
USE_AGENT_ORCHESTRATION=false

# Or reduce rollout percentage:
AGENT_ROLLOUT_PERCENTAGE=0

# Restart backend
```

#### Rollback to Previous Deployment

```bash
# Cloud Run rollback
gcloud run services update-traffic resalign-backend \
  --to-revisions PREVIOUS_REVISION=100

# Or redeploy from stable branch
git checkout legacy/monolithic-analysis
git push production HEAD:main --force
```

### Rollback Triggers

Immediately rollback if:
- Error rate > 5%
- p95 response time > 15s
- LLM API failures > 10%
- User-reported critical bugs > 3

---

## Monitoring & Debugging

### LangSmith Dashboards

Access at https://smith.langchain.com/

**Key Metrics**:
- Trace count per hour
- Average latency per agent
- Token usage per analysis
- Error rate by agent node
- Most expensive prompts

### Custom Metrics (Prometheus)

```python
# In observability/metrics.py
from prometheus_client import Counter, Histogram

analysis_total = Counter(
    "resalign_analysis_total",
    "Total number of analyses",
    ["flow_type"]  # "agent" or "legacy"
)

analysis_duration = Histogram(
    "resalign_analysis_duration_seconds",
    "Analysis duration",
    ["flow_type"]
)

# In analyze route:
with analysis_duration.labels(flow_type="agent").time():
    result = await analysis_graph.ainvoke(state)
analysis_total.labels(flow_type="agent").inc()
```

### Debugging Agent Workflows

```python
# Enable verbose logging
import logging
logging.getLogger("langgraph").setLevel(logging.DEBUG)
logging.getLogger("langsmith").setLevel(logging.DEBUG)

# Add breakpoints in agent nodes
import ipdb; ipdb.set_trace()

# View state at each step
print(f"State after researcher: {state}")
```

### Common Issues & Solutions

| Issue | Symptoms | Solution |
|-------|----------|----------|
| LLM API rate limits | 429 errors | Add exponential backoff, reduce concurrency |
| Slow agent execution | p95 > 15s | Parallelize independent agents, cache research |
| High token costs | LangSmith shows high usage | Optimize prompts, add caching |
| Incorrect scores | Scores differ from legacy | Review scorer tool logic, add logging |
| Webhook failures | 500 errors from ATS | Verify signature, check payload format |

---

## Success Criteria

### Technical Metrics

- ✅ All tests passing (unit, integration, E2E)
- ✅ Code coverage > 80%
- ✅ SDK published to PyPI
- ✅ Agent workflow matches legacy results (within 5% score difference)
- ✅ Response time p95 < 10s
- ✅ Error rate < 1%
- ✅ Zero production incidents during rollout

### Business Metrics

- ✅ At least 1 external developer using SDK
- ✅ At least 1 ATS integration live
- ✅ LangSmith providing actionable debugging insights
- ✅ Token costs within 20% of projections

### Phase 2 Readiness

- ✅ Agent framework can accommodate new nodes (voice interviewer)
- ✅ SDK can handle streaming voice transcriptions
- ✅ Infrastructure can scale to real-time voice processing

---

## Timeline Summary

| Week | Focus | Deliverables |
|------|-------|--------------|
| 1-2 | Agent infrastructure | Base classes, state, tools |
| 3-4 | Agent nodes & graph | Researcher, Scorer, Analyzer, Recommender agents |
| 5-6 | SDK development | Python SDK, PyPI package |
| 7 | ATS integrations | Ashby, Lever, Greenhouse |
| 8 | Testing | Unit, integration, E2E, comparison tests |
| 9-10 | Production rollout | Gradual rollout, monitoring, cleanup |

**Total Duration**: 10 weeks

---

## Next Steps

1. **Review this guide** with team and stakeholders
2. **Set up development environment** (LangSmith, etc.)
3. **Create project board** with tasks from this guide
4. **Begin Week 1 tasks** (base agent classes)
5. **Schedule weekly check-ins** to track progress

---

## Support & Questions

- **Technical Questions**: Open issue on GitHub
- **Architecture Discussions**: Schedule meeting with tech lead
- **Migration Blockers**: Escalate immediately to project manager

---

**Happy Migrating! 🚀**

This migration unlocks a new era of flexibility, extensibility, and intelligence for ResAlign AI. The agentic architecture will enable advanced features like voice interviewing, multi-step reasoning, and seamless integrations that weren't possible with the monolithic approach.

Let's build the future of career alignment together!

