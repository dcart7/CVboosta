from __future__ import annotations

import re

from app.services.keyword_stopwords import STOPWORDS

_ALLOWED_SINGLE = {"c", "r"}
_VERB_PREFIXES = (
    "design",
    "develop",
    "maintain",
    "build",
    "implement",
    "create",
    "handle",
    "ensure",
    "optimize",
    "write",
    "collaborate",
    "lead",
    "support",
    "improve",
    "analyze",
)
_VERB_WORDS = {
    "design",
    "develop",
    "maintain",
    "build",
    "implement",
    "create",
    "handle",
    "ensure",
    "optimize",
    "write",
    "collaborate",
    "lead",
    "support",
    "improve",
    "analyze",
    "communicate",
    "working",
    "work",
    "reading",
    "read",
}
_PHRASE_BLACKLIST = {
    "friendly team",
    "flexible schedule",
    "work independently",
    "communicating challenges",
    "challenges and issues",
    "new features",
    "existing functionality",
    "web applications",
    "code quality",
    "technical documentation",
    "unit tests",
    "writing tests",
    "read and maintain",
    "well structured code",
    "high load on projects",
    "end implementation",
    "environment",
    "issues",
}
_WHITELIST = {
    "api",
    "apis",
    "rest",
    "restful",
    "rest api",
    "restful api",
    "django rest framework",
    "drf",
    "payment gateway",
    "payments",
    "payment systems",
    "billing",
    "subscriptions",
    "invoicing",
    "unit tests",
    "integration tests",
    "e2e tests",
    "test automation",
    "tdd",
    "ci",
    "ci/cd",
    "cd",
    "github actions",
    "gitlab ci",
    "jenkins",
    "security",
    "performance",
    "scalability",
    "reliability",
    "availability",
    "observability",
    "monitoring",
    "logging",
    "alerting",
    "sre",
    "slo",
    "sla",
    "python",
    "django",
    "flask",
    "fastapi",
    "async",
    "asyncio",
    "sqlalchemy",
    "pydantic",
    "celery",
    "pytest",
    "ruff",
    "black",
    "postgresql",
    "postgres",
    "mysql",
    "mariadb",
    "mongodb",
    "redis",
    "elasticsearch",
    "opensearch",
    "dynamodb",
    "bigquery",
    "snowflake",
    "sqlite",
    "nosql",
    "sql",
    "query optimization",
    "query optimisation",
    "docker",
    "kubernetes",
    "helm",
    "terraform",
    "ansible",
    "nginx",
    "apache",
    "aws",
    "ec2",
    "s3",
    "rds",
    "lambda",
    "cloudwatch",
    "eks",
    "api gateway",
    "api gateways",
    "sqs",
    "sns",
    "gcp",
    "gke",
    "cloud run",
    "azure",
    "linux",
    "bash",
    "git",
    "github",
    "gitlab",
    "typescript",
    "javascript",
    "node.js",
    "node",
    "express",
    "nest",
    "react",
    "next.js",
    "vite",
    "webpack",
    "c",
    "c++",
    "c#",
    ".net",
    ".net core",
    "java",
    "spring",
    "spring boot",
    "kotlin",
    "go",
    "golang",
    "rust",
    "kafka",
    "rabbitmq",
    "graphql",
    "oauth",
    "jwt",
    "openid",
    "oauth2",
    "saml",
    "grpc",
    "protobuf",
    "microservices",
    "distributed systems",
    "system design",
    "architecture",
    "design patterns",
    "clean architecture",
    "ddd",
    "event-driven",
    "event sourcing",
    "message queue",
    "webhooks",
    "websockets",
    "load balancing",
    "rate limiting",
    "caching",
    "cdn",
    "http",
    "https",
    "tcp",
    "udp",
    "ssl",
    "tls",
    "owasp",
    "auth",
    "authentication",
    "authorization",
    "encryption",
    "cryptography",
    "payment integrations",
    "payment systems integrations",
    "stripe",
    "shopify",
    "recurly",
    "paypal",
    "braintree",
    "chargeback",
    "chargeback management",
    "ethoca",
    "rdr",
    "cdrn",
    "high load",
}

_WHITELIST_NORMALIZE = {
    # APIs & Specs
    "api": "API",
    "apis": "APIs",
    "rest": "REST",
    "restful": "RESTful",
    "rest api": "REST API",
    "restful api": "REST API",
    "graphql": "GraphQL",
    "grpc": "gRPC",
    "oauth": "OAuth",
    "oauth2": "OAuth2",
    "jwt": "JWT",
    "openid": "OpenID",
    "saml": "SAML",
    "protobuf": "Protobuf",
    
    # Python ecosystem
    "django": "Django",
    "python": "Python",
    "fastapi": "FastAPI",
    "flask": "Flask",
    "celery": "Celery",
    "sqlalchemy": "SQLAlchemy",
    "pydantic": "Pydantic",
    "pytest": "Pytest",
    "asyncio": "asyncio",
    "drf": "DRF",
    "django rest framework": "DRF",
    
    # Databases
    "sql": "SQL",
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "mysql": "MySQL",
    "mariadb": "MariaDB",
    "mongodb": "MongoDB",
    "redis": "Redis",
    "elasticsearch": "Elasticsearch",
    "opensearch": "OpenSearch",
    "dynamodb": "DynamoDB",
    "bigquery": "BigQuery",
    "snowflake": "Snowflake",
    "sqlite": "SQLite",
    "nosql": "NoSQL",
    
    # Infrastructure & DevOps
    "aws": "AWS",
    "ec2": "EC2",
    "s3": "S3",
    "rds": "RDS",
    "lambda": "Lambda",
    "eks": "EKS",
    "sqs": "SQS",
    "sns": "SNS",
    "gcp": "GCP",
    "gke": "GKE",
    "azure": "Azure",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "helm": "Helm",
    "terraform": "Terraform",
    "ansible": "Ansible",
    "nginx": "Nginx",
    "apache": "Apache",
    "ci/cd": "CI/CD",
    "ci": "CI",
    "cd": "CD",
    "github": "GitHub",
    "gitlab": "GitLab",
    
    # Frontend & Languages
    "typescript": "TypeScript",
    "javascript": "JavaScript",
    "node.js": "Node.js",
    "react": "React",
    "next.js": "Next.js",
    "vite": "Vite",
    "webpack": "Webpack",
    "css": "CSS",
    "html": "HTML",
    "java": "Java",
    "kotlin": "Kotlin",
    "golang": "Go",
    "go": "Go",
    "rust": "Rust",
    "c#": "C#",
    "c++": "C++",
    ".net": ".NET",
    ".net core": ".NET Core",
    
    # Tools & Misc
    "tdd": "TDD",
    "ruff": "Ruff",
    "black": "Black",
    "monitoring": "Monitoring",
    "logging": "Logging",
    "billing": "Billing",
    "subscriptions": "Subscriptions",
    "stripe": "Stripe",
    "paypal": "PayPal",
    "braintree": "Braintree",
    "shopify": "Shopify",
    "recurly": "Recurly",
    "ethoca": "Ethoca",
    "cdrn": "CDRN",
    "rdr": "RDR",
    "owasp": "OWASP",
    "sre": "SRE",
    "slo": "SLO",
    "sla": "SLA",
}

def _build_whitelist_pattern(key: str) -> re.Pattern[str]:
    """
    Build a safe match pattern for a whitelist keyword.
    Prevents false positives for short tokens (e.g. "go" in "ongoing").
    """
    escaped = re.escape(key.lower()).replace(r"\ ", r"\s+")
    # For very short alpha tokens, require word boundaries.
    if key.isalpha() and len(key) <= 3:
        return re.compile(rf"\b{escaped}\b")
    # For plain words / phrases, word boundaries are usually correct.
    if re.fullmatch(r"[a-z0-9 ]+", key.lower()):
        return re.compile(rf"\b{escaped}\b")
    # For tokens with punctuation (ci/cd, node.js, c++, c#), require non-alnum boundaries.
    return re.compile(rf"(?<![a-z0-9]){escaped}(?![a-z0-9])")


_WHITELIST_PATTERNS: dict[str, re.Pattern[str]] = {
    key: _build_whitelist_pattern(key) for key in _WHITELIST
}


def _split_phrases(text: str) -> list[str]:
    text = text.replace("/", " / ")
    parts = re.split(r"[,\n;/•|]+", text)
    chunks: list[str] = []
    for part in parts:
        piece = part.strip()
        if not piece:
            continue
        chunks.extend([p.strip() for p in re.split(r"\band\b", piece, flags=re.IGNORECASE)])
    return [c for c in chunks if c]


def _strip_verb_prefix(text: str) -> str:
    lowered = text.lower().strip()
    for verb in _VERB_PREFIXES:
        if lowered.startswith(verb + " "):
            return text[len(verb) + 1 :].strip()
    return text


def _is_verb_phrase(text: str) -> bool:
    lowered = text.lower().strip()
    return any(lowered.startswith(v + " ") for v in _VERB_PREFIXES)


def clean_job_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace("\r\n", "\n")
    lines = text.split("\n")
    cleaned_lines: list[str] = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        i += 1
        if not line:
            continue
        lower = line.lower().strip()
        if lower.startswith("we offer"):
            break
        if lower.startswith("required languages"):
            break
        if re.fullmatch(r"[-•*;]+", line):
            continue
        line = re.sub(r"^\s*[-*•]+\s*", "", line)
        line = re.sub(r"^\s*#{1,6}\s*", "", line)
        line = re.sub(r"#+", "", line)
        line = line.replace(";", " ")
        line = line.replace("\t", " ")
        if cleaned_lines:
            prev = cleaned_lines[-1]
            if re.fullmatch(r"[A-Za-z]", prev):
                cleaned_lines[-1] = prev + line
                continue
            if prev.endswith("-"):
                cleaned_lines[-1] = prev[:-1] + line
                continue
        cleaned_lines.append(line)
    merged = " ".join(cleaned_lines)
    merged = re.sub(r"\s+", " ", merged).strip()
    return merged


def normalize_keywords(skills: list[str], limit: int = 30) -> list[str]:
    unique: list[str] = []
    seen: set[str] = set()
    for item in skills:
        if not item:
            continue
        # Preserve exact whitelist terms (especially punctuated ones like "CI/CD").
        raw = str(item).strip()
        raw_key = raw.lower()
        if raw_key in _WHITELIST:
            normalized = _WHITELIST_NORMALIZE.get(raw_key, raw)
            norm_key = normalized.lower()
            if norm_key not in seen:
                seen.add(norm_key)
                unique.append(normalized)
            if len(unique) >= limit:
                break
            continue
        for phrase in _split_phrases(str(item)):
            cleaned = phrase.strip()
            
            # Step 1: Check if it's a known tech term (Whitelist) before aggressive cleaning
            key = cleaned.lower()
            if key in _WHITELIST:
                normalized = _WHITELIST_NORMALIZE.get(key, cleaned)
                norm_key = normalized.lower()
                if norm_key not in seen:
                    seen.add(norm_key)
                    unique.append(normalized)
                    if len(unique) >= limit:
                        break
                continue

            # Step 2: Aggressive cleaning for non-whitelist terms
            # Remove start/end junk but keep important tech suffixes
            cleaned = re.sub(r"^[^A-Za-z0-9\\.]+|[^A-Za-z0-9\\+\\.\\#]+$", "", cleaned)
            
            # Remove absolute forbidden symbols
            cleaned = re.sub(r"[\$\%\^\!]", "", cleaned)
            
            # Prune repetitive symbols (##tation -> #tation, ++++ -> +)
            cleaned = re.sub(r"\+{2,}", "+", cleaned)
            cleaned = re.sub(r"\#{2,}", "#", cleaned)
            
            # If a word starts with a symbol, it's likely corruption (e.g., #tation)
            if cleaned.startswith(("#", "+", "&")):
                cleaned = cleaned.lstrip("#+&").strip()
            
            # Handle '&' - only keep if between words
            cleaned = re.sub(r"^\s*&\s*", "", cleaned)
            cleaned = re.sub(r"\s*&\s*$", "", cleaned)
            
            cleaned = re.sub(r"\s+", " ", cleaned).strip()
            
            if not cleaned:
                continue
            
            # Quality checks
            if _is_verb_phrase(cleaned):
                cleaned = _strip_verb_prefix(cleaned)
            
            if not re.search(r"[A-Za-z]", cleaned):
                continue
                
            if len(cleaned) < 2 and cleaned.lower() not in _ALLOWED_SINGLE:
                continue
                
            if len(cleaned.split()) > 5:
                continue
                
            if len(cleaned) > 40:
                continue

            key = cleaned.lower()
            if key in _PHRASE_BLACKLIST or key in STOPWORDS:
                continue
            
            # Final check against whitelist after cleaning
            if key in _WHITELIST:
                cleaned = _WHITELIST_NORMALIZE.get(key, cleaned)

            norm_key = cleaned.lower()
            if norm_key in seen:
                continue
            
            # Filter out non-whitelist words that contain verbs or are too short
            if norm_key not in _WHITELIST:
                words = re.findall(r"[A-Za-z]+", norm_key)
                if any(word in _VERB_WORDS for word in words):
                    continue
                if len(norm_key) <= 3: # Stricter for non-tech words
                    continue

            seen.add(norm_key)
            unique.append(cleaned)
            if len(unique) >= limit:
                break
        if len(unique) >= limit:
            break
    return unique


def extract_whitelist_keywords(text: str, limit: int = 30) -> list[str]:
    if not text:
        return []
    lower = text.lower()
    hits: list[str] = []
    for key, pattern in _WHITELIST_PATTERNS.items():
        if pattern.search(lower):
            hits.append(_WHITELIST_NORMALIZE.get(key, key))
    return normalize_keywords(hits, limit=limit)
