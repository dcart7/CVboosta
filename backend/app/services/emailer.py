from __future__ import annotations

import html
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
        f"Open this link to set a new password:\n<{reset_link}>\n\n"
        f"This link expires in {settings.password_reset_exp_minutes} minutes.\n"
        "If you did not request this, you can safely ignore this email.\n"
    )
    safe_link = html.escape(reset_link, quote=True)
    message.add_alternative(
        f"""
<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f6f7fb;color:#111827;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;">
      <tr><td style="padding:24px 24px 8px 24px;font-size:28px;font-weight:700;line-height:1.2;">Reset your CVboosta password</td></tr>
      <tr><td style="padding:0 24px 12px 24px;font-size:16px;line-height:1.55;color:#374151;">
        We received a request to reset your CVboosta password.
      </td></tr>
      <tr><td style="padding:8px 24px 12px 24px;">
        <a href="{safe_link}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:12px 18px;border-radius:10px;">
          Reset password
        </a>
      </td></tr>
      <tr><td style="padding:0 24px 8px 24px;font-size:14px;line-height:1.5;color:#6b7280;">
        This link expires in {settings.password_reset_exp_minutes} minutes.
      </td></tr>
      <tr><td style="padding:0 24px 20px 24px;font-size:14px;line-height:1.5;color:#6b7280;">
        If the button does not work, copy this link:<br/>
        <a href="{safe_link}" style="color:#2563eb;text-decoration:underline;word-break:break-all;">{safe_link}</a>
      </td></tr>
    </table>
  </body>
</html>
        """.strip(),
        subtype="html",
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
