"""
Email utility for EduFlow LMS.

In development (no SMTP configured):
  - Emails are saved as .html files in backend/sent_emails/
  - The /api/auth/dev-emails/ endpoint lists them so the frontend can show OTPs

In production (SMTP configured in .env):
  - Real emails are sent via Gmail SMTP
"""
import logging
import os
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings

logger = logging.getLogger(__name__)


def send_otp_email(user, otp, subject, html_template, txt_template, extra_ctx=None):
    """Send an OTP email. Returns (success: bool, error_msg: str|None)."""
    ctx = {
        'user': user,
        'otp': otp,
        'expiry_minutes': getattr(settings, 'OTP_EXPIRY_MINUTES', 15),
        'site_name': 'EduFlow LMS',
    }
    if extra_ctx:
        ctx.update(extra_ctx)

    try:
        html_content = render_to_string(html_template, ctx)
        txt_content = render_to_string(txt_template, ctx)

        msg = EmailMultiAlternatives(
            subject=subject,
            body=txt_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )
        msg.attach_alternative(html_content, 'text/html')
        msg.send(fail_silently=False)

        backend = settings.EMAIL_BACKEND
        if 'filebased' in backend:
            logger.info(f"[EMAIL-FILE] OTP {otp} saved to sent_emails/ for {user.email}")
        elif 'smtp' in backend:
            logger.info(f"[EMAIL-SMTP] OTP email sent to {user.email}")
        else:
            logger.info(f"[EMAIL] Sent via {backend} to {user.email}")

        return True, None

    except Exception as e:
        logger.error(f"[EMAIL-ERROR] Failed to send email to {user.email}: {e}")
        return False, str(e)


def get_email_backend_info():
    """Return info about the current email backend for the dev panel."""
    backend = settings.EMAIL_BACKEND
    if 'filebased' in backend:
        return {
            'mode': 'file',
            'description': 'Emails saved as files in sent_emails/ folder',
            'smtp_configured': False,
        }
    elif 'smtp' in backend:
        return {
            'mode': 'smtp',
            'description': f'Sending real emails via {settings.EMAIL_HOST}',
            'smtp_configured': True,
            'host_user': settings.EMAIL_HOST_USER,
        }
    elif 'console' in backend:
        return {
            'mode': 'console',
            'description': 'Emails printed to terminal only',
            'smtp_configured': False,
        }
    return {'mode': 'unknown', 'description': backend, 'smtp_configured': False}
