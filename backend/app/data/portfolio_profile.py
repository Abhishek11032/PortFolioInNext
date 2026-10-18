from typing import Any


PORTFOLIO_PROFILE: dict[str, Any] = {
    "name": "Abhishek Tiwari",
    "title": "Full Stack Developer",
    "professional_summary": (
        "Full Stack Developer with 2.5+ years of professional experience building SaaS, fintech, "
        "and business management applications. Focuses on responsive interfaces, secure backend "
        "systems, maintainable code, and performance."
    ),
    "professional_experience": [
        {
            "role": "Software Developer — Full Stack",
            "company": "Gowdanar Technosoft Pvt. Ltd.",
            "duration": "April 2024 – Present",
            "location": "Bengaluru, India",
            "details": (
                "Developing scalable applications for fintech, KYC, and enterprise business platforms. "
                "Builds responsive interfaces with React.js, Next.js, and TypeScript; develops REST APIs "
                "with Python, Django, and Django REST Framework; works on authentication, role-based "
                "permissions, database optimization, reporting, asynchronous processing, testing, "
                "AI-assisted document processing, and production deployments."
            ),
        }
    ],
    "education": {
        "qualification": "B.E. in Computer Science & Engineering",
        "institution": "Savitribai Phule Pune University",
        "years": "2019–2023",
        "cgpa": "7.29/10",
    },
    "skills": {
        "Frontend Development": ["React.js", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS"],
        "Backend Development": ["Python", "Django REST Framework", "FastAPI", "Node.js"],
        "Databases": ["PostgreSQL", "CockroachDB"],
        "Architecture and DevOps": ["REST APIs", "JWT", "Redis", "Celery", "Kafka", "Docker", "GCP"],
        "Generative AI": ["LangChain", "RAG", "OpenAI API", "Gemini API"],
    },
    "projects": [
        {
            "name": "Driver Drowsiness Detection System",
            "category": "College Project",
            "description": (
                "Built a real-time driver drowsiness detection system using Python and OpenCV. Used the "
                "Haar Cascade algorithm for face and eye detection. Monitored the Eye Aspect Ratio (EAR) "
                "to detect prolonged eye closure. Implemented audio and visual alerts for drowsiness. "
                "Optimized for low-latency real-time processing. Designed with potential applications in "
                "vehicle safety systems."
            ),
            "technologies": ["Python", "OpenCV", "Haar Cascade", "Eye Aspect Ratio (EAR)", "Computer Vision", "Real-Time Image Processing"],
            "features": [
                "Real-time face and eye detection.",
                "Eye-closure monitoring using Eye Aspect Ratio (EAR).",
                "Audio and visual alerts for detected drowsiness.",
                "Low-latency image processing.",
                "Potential application in driver monitoring and vehicle safety systems.",
            ],
        },
        {
            "name": "AI Resume Analyzer & Career Assistant",
            "category": "Personal Project",
            "description": (
                "Developed an AI-powered career assistance platform that analyzes resumes against job "
                "descriptions to evaluate skill alignment, keyword relevance, and qualification gaps. "
                "Built a FastAPI backend integrated with Google Gemini and OpenAI APIs to generate "
                "structured, validated resume analysis results. Implemented asynchronous processing "
                "with Celery and Redis, secure JWT-based APIs, and a Next.js dashboard displaying resume "
                "scores, matched and missing skills, strengths, weaknesses, and learning recommendations."
            ),
            "technologies": ["Next.js", "Python", "FastAPI", "Google Gemini", "OpenAI API", "PostgreSQL", "Celery", "Redis", "JWT", "Docker"],
            "features": [
                "Resume and job description matching with skill-gap and keyword analysis.",
                "AI-generated feedback, recommendations, and structured JSON validated with Pydantic.",
                "Celery and Redis tasks with status tracking, retries, and failure handling.",
                "JWT-protected APIs with user ownership checks.",
            ],
        },
        {
            "name": "MVKYC — Digital Identity & Verification Platform",
            "category": "Professional Work Project at GTPL",
            "description": (
                "Contributed to MVKYC, a digital identity and verification platform supporting KYC "
                "workflows and document verification. Worked on frontend development and backend API "
                "integration for verification processes and structured data handling."
            ),
            "technologies": ["React.js", "Next.js", "TypeScript", "Python", "Django REST Framework", "PostgreSQL", "REST APIs"],
            "features": [
                "KYC identity and document verification workflows.",
                "Responsive frontend development and backend API integration.",
                "Structured document and verification data handling.",
                "Maintainable application development.",
            ],
        },
        {
            "name": "MVBook — Business Management System",
            "category": "Professional / Work Project",
            "description": (
                "Contributed to a multi-tenant business management and accounting platform supporting "
                "sales, purchase, inventory, reporting, and financial workflows across organizations. "
                "Developed reusable, responsive frontend modules using React.js and TypeScript and secure "
                "REST APIs using Django REST Framework. Worked on JWT authentication, role-based access "
                "control, tenant-aware data isolation, database query optimization, asynchronous background "
                "processing, and AI-powered OCR workflows for business document extraction and validation."
            ),
            "technologies": ["React.js", "TypeScript", "Django REST Framework", "PostgreSQL", "Redis", "Celery", "Apache Kafka", "OpenAI API", "Docker", "GCP", "API Gateway", "JWT"],
            "features": [
                "Multi-tenant business and accounting workflows, including sales, purchase, inventory, and financial reporting.",
                "Reusable responsive frontend components and secure APIs with role-based access and tenant-aware data isolation.",
                "Database query optimization, caching, API performance improvements, and asynchronous tasks.",
                "Kafka event workflows and AI-assisted document OCR with structured extraction and validation.",
            ],
        },
    ],
    "contact": {
        "email": "abhishekt1132000@gmail.com",
        "linkedin": "https://www.linkedin.com/in/abhishek-tiwari1132",
    },
}
