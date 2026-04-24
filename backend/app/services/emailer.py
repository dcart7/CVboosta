from __future__ import annotations

import smtplib
from email.message import EmailMessage

from app.core.config import get_cors_origins, settings


def _build_reset_base_url() -> str | None:
    configured = (settings.password_reset_frontend_url or "").strip().rstrip("/")
    if configured:
        return configured
    for origin in get_cors_origins():
        normalized = (origin or "").strip().rstrip("/")
        if normalized.startswith("https://"):
            return normalized
    return None


def build_password_reset_link(token: str) -> str:
    base = _build_reset_base_url()
    if not base:
        return ""
    return f"{base}/reset-password?token={token}"


def send_password_reset_email(*, to_email: str, reset_link: str) -> bool:
    host = (settings.smtp_host or "").strip()
    if not host:
        # SMTP not configured; keep API flow successful to avoid email enumeration.
        print(f"[password-reset] SMTP_HOST missing. Link for {to_email}: {reset_link}")
        return False

    message = EmailMessage()
    message["From"] = settings.smtp_from_email
    message["To"] = to_email
    message["Subject"] = "Reset your CVboosta password"
    message.set_content(
        "We received a request to reset your CVboosta password.\n\n"
        f"Use this secure link to set a new password:\n{reset_link}\n\n"
        f"This link expires in {settings.password_reset_exp_minutes} minutes.\n"
        "If you did not request this, you can safely ignore this email.\n"
    )

    username = (settings.smtp_username or "").strip()
    # Gmail app-passwords are often copied with spaces; strip them safely.
    password = (settings.smtp_password or "").replace(" ", "")
    port = settings.smtp_port

    try:
        if settings.smtp_use_ssl:
            with smtplib.SMTP_SSL(host, port, timeout=20) as server:
                if username:
                    server.login(username, password)
                server.send_message(message)
            return True

        with smtplib.SMTP(host, port, timeout=20) as server:
            if settings.smtp_use_tls:
                server.starttls()
            if username:
                server.login(username, password)
            server.send_message(message)
        return True
    except Exception as exc:
        error_text = str(exc)
        print(
            "[password-reset] SMTP send failed:",
            {
                "to": to_email,
                "host": host,
                "port": port,
                "username_set": bool(username),
                "tls": settings.smtp_use_tls,
                "ssl": settings.smtp_use_ssl,
                "error": error_text,
            },
        )
        return False
