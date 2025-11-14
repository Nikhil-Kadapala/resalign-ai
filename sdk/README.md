# ResAlign AI Python SDK

[![PyPI version](https://badge.fury.io/py/resalign.svg)](https://badge.fury.io/py/resalign)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The official Python SDK for [ResAlign AI](https://resalign.ai) - Intelligent Resume Analysis & Career Alignment Platform.

## Features

- 🚀 **Easy to Use**: Simple, intuitive API for resume analysis
- 📊 **Real-Time Streaming**: Built-in support for SSE progress updates
- 🔒 **Type Safe**: Full type hints and Pydantic models
- ⚡ **Async Ready**: Support for both sync and async usage
- 🧪 **Well Tested**: Comprehensive test coverage
- 📖 **Documented**: Complete API reference and examples

## Installation

```bash
pip install resalign
```

For async support:
```bash
pip install resalign[async]
```

## Quick Start

### Basic Usage

```python
from resalign import ResAlignClient

# Initialize client
client = ResAlignClient(api_key="your_api_key")

# Upload resume
resume = client.resumes.upload("path/to/resume.pdf")

# Create job description
job = client.jobs.create(
    title="Senior Software Engineer",
    company="TechCorp",
    description="Looking for an experienced Python developer..."
)

# Run analysis
analysis = client.analyses.create(
    resume_id=resume.id,
    jd_id=job.id
)

print(f"Overall Score: {analysis.overall_score}/100")
print(f"Fit Classification: {analysis.fit_classification}")
print(f"Recommendations: {analysis.recommendations}")
```

### Streaming Analysis with Progress Updates

```python
from resalign import ResAlignClient

client = ResAlignClient(api_key="your_api_key")

# Stream analysis with real-time progress
for event in client.analyses.create(
    resume_id=resume_id,
    jd_id=jd_id,
    stream=True
):
    if event["event"] == "progress":
        print(f"{event['data']['progress']}% - {event['data']['message']}")
    elif event["event"] == "complete":
        result = event["data"]
        print(f"\nAnalysis Complete!")
        print(f"Overall Score: {result['overall_score']}")
        print(f"Fit: {result['fit_classification']}")
```

### Async Usage

```python
import asyncio
from resalign import ResAlignClient

async def analyze_candidate():
    client = ResAlignClient(api_key="your_api_key")
    
    # Upload resume asynchronously
    resume = await client.resumes.upload_async("resume.pdf")
    
    # Create job description
    job = await client.jobs.create_async(
        title="Data Scientist",
        description="..."
    )
    
    # Run analysis
    analysis = await client.analyses.create_async(
        resume_id=resume.id,
        jd_id=job.id
    )
    
    return analysis

# Run async function
result = asyncio.run(analyze_candidate())
```

### Batch Processing

```python
import asyncio
from resalign import ResAlignClient

async def analyze_batch(candidates):
    client = ResAlignClient(api_key="your_api_key")
    
    # Create analysis tasks for all candidates
    tasks = [
        client.analyses.create_async(
            resume_id=candidate.resume_id,
            jd_id=candidate.jd_id
        )
        for candidate in candidates
    ]
    
    # Run all analyses in parallel
    results = await asyncio.gather(*tasks)
    return results

# Process 100 candidates in parallel
candidates = load_candidates()
results = asyncio.run(analyze_batch(candidates))

for result in results:
    print(f"Score: {result.overall_score}")
```

## Authentication

Get your API key from the [ResAlign AI Dashboard](https://app.resalign.ai/settings/api-keys).

### Environment Variable (Recommended)

```bash
export RESALIGN_API_KEY="your_api_key"
```

```python
from resalign import ResAlignClient

# Automatically uses RESALIGN_API_KEY environment variable
client = ResAlignClient()
```

### Direct Initialization

```python
client = ResAlignClient(api_key="your_api_key")
```

## API Reference

### `ResAlignClient`

Main entry point for the SDK.

**Parameters:**
- `api_key` (str, optional): API key for authentication. If not provided, reads from `RESALIGN_API_KEY` environment variable.
- `base_url` (str, optional): Base URL for the API. Default: `https://api.resalign.ai`
- `timeout` (int, optional): Request timeout in seconds. Default: `30`

### Resources

#### `client.resumes`

**Methods:**
- `upload(file_path: str) -> Resume`: Upload a resume file
- `get(resume_id: str) -> Resume`: Retrieve a resume by ID
- `list(limit: int = 10, offset: int = 0) -> List[Resume]`: List user's resumes
- `delete(resume_id: str) -> None`: Delete a resume

#### `client.jobs`

**Methods:**
- `create(title: str, company: str, description: str, **kwargs) -> Job`: Create a job description
- `get(job_id: str) -> Job`: Retrieve a job by ID
- `list(limit: int = 10, offset: int = 0) -> List[Job]`: List user's jobs
- `delete(job_id: str) -> None`: Delete a job

#### `client.analyses`

**Methods:**
- `create(resume_id: str, jd_id: str, stream: bool = False) -> Analysis | Iterator`: Create an analysis
- `get(analysis_id: str) -> Analysis`: Retrieve an analysis by ID
- `list(limit: int = 10, offset: int = 0) -> List[Analysis]`: List user's analyses

### Models

#### `Analysis`

```python
class Analysis:
    id: str
    resume_id: str
    jd_id: str
    overall_score: float  # 0-100
    fit_classification: str  # "NOT_FIT", "GOOD_FIT", "GREAT_FIT"
    fit_rationale: str
    category_scores: Dict[str, float]
    recommendations: List[str]
    learning_resources: List[Dict]
    created_at: datetime
    completed_at: Optional[datetime]
```

#### `Resume`

```python
class Resume:
    id: str
    filename: str
    file_size: int
    status: str  # "processing", "completed", "error"
    extracted_data: Optional[Dict]
    created_at: datetime
```

#### `Job`

```python
class Job:
    id: str
    title: str
    company: str
    description: str
    extracted_data: Optional[Dict]
    created_at: datetime
```

## Error Handling

```python
from resalign import ResAlignClient, ResAlignError, AuthenticationError, ValidationError

client = ResAlignClient(api_key="your_api_key")

try:
    analysis = client.analyses.create(resume_id="...", jd_id="...")
except AuthenticationError as e:
    print(f"Authentication failed: {e}")
except ValidationError as e:
    print(f"Invalid input: {e}")
except ResAlignError as e:
    print(f"API error: {e}")
```

## Examples

See the [examples/](./examples/) directory for more usage examples:

- [basic_analysis.py](./examples/basic_analysis.py) - Simple resume analysis
- [batch_processing.py](./examples/batch_processing.py) - Analyze multiple candidates
- [streaming_analysis.py](./examples/streaming_analysis.py) - Real-time progress updates
- [integration_example.py](./examples/integration_example.py) - Integration with ATS systems

## Development

### Setup

```bash
git clone https://github.com/nikhil-kadapala/resalign-ai.git
cd resalign-ai/sdk
pip install -e ".[dev]"
```

### Running Tests

```bash
pytest
```

### Code Quality

```bash
# Format code
black resalign/

# Sort imports
isort resalign/

# Type checking
mypy resalign/

# Linting
flake8 resalign/
```

## Support

- **Documentation**: [https://docs.resalign.ai](https://docs.resalign.ai)
- **Issues**: [GitHub Issues](https://github.com/nikhil-kadapala/resalign-ai/issues)
- **Email**: support@alignai.cv
- **Twitter**: [@ResAlignAI](https://twitter.com/resalignai)

## Contributing

Contributions are welcome! Please read our [Contributing Guide](../CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history.

---

Made with ❤️ by the ResAlign AI team

