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
    "restful api": "REST API",
    "rest api": "REST API",
    "rest": "REST",
    "django rest framework": "DRF",
    "drf": "DRF",
    "api gateways": "API Gateway",
    "api gateway": "API Gateway",
    "sqs": "SQS",
    "sns": "SNS",
    "ec2": "EC2",
    "aws": "AWS",
    "stripe": "Stripe",
    "paypal": "PayPal",
    "braintree": "Braintree",
    "shopify": "Shopify",
    "recurly": "Recurly",
    "ethoca": "Ethoca",
    "cdrn": "CDRN",
    "rdr": "RDR",
    "django": "Django",
    "python": "Python",
    "celery": "Celery",
    "sql": "SQL",
    "redis": "Redis",
    "elasticsearch": "Elasticsearch",
    "nosql": "NoSQL",
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
        for phrase in _split_phrases(str(item)):
            cleaned = phrase.strip()
            cleaned = re.sub(r"^[^A-Za-z0-9\\+\\#\\.]+|[^A-Za-z0-9\\+\\#\\.]+$", "", cleaned)
            cleaned = re.sub(r"\s+", " ", cleaned)
            if not cleaned:
                continue
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
            if key in _PHRASE_BLACKLIST:
                continue
            if key not in _WHITELIST:
                words = re.findall(r"[A-Za-z]+", key)
                if any(word in _VERB_WORDS for word in words):
                    continue
                if len(key) <= 4:
                    continue
            if key in STOPWORDS:
                continue
            if key in seen:
                continue
            if key not in _WHITELIST and _is_verb_phrase(cleaned):
                continue
            normalized = _WHITELIST_NORMALIZE.get(key, cleaned)
            norm_key = normalized.lower()
            if norm_key in seen:
                continue
            seen.add(norm_key)
            unique.append(normalized)
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
    for key in _WHITELIST:
        if key in lower:
            hits.append(_WHITELIST_NORMALIZE.get(key, key))
    return normalize_keywords(hits, limit=limit)
