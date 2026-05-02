import os
import glob
import re
import logging
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from django.conf import settings

from .models import PasswordResetOTP, EmailVerificationOTP, generate_otp
from .email_utils import send_otp_email, get_email_backend_info
from .serializers import (
    CustomTokenObtainPairSerializer, UserRegistrationSerializer,
    UserProfileSerializer, UserUpdateSerializer, ChangePasswordSerializer,
    ForgotPasswordSerializer, VerifyOTPSerializer, ResetPasswordWithOTPSerializer,
    AdminUserSerializer
)
from .permissions import IsAdmin

User = get_user_model()
logger = logging.getLogger(__name__)
OTP_EXPIRY_MINUTES = getattr(settings, 'OTP_EXPIRY_MINUTES', 15)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Send email verification OTP (only for students, admins/instructors are auto-verified)
            if not user.is_email_verified:
                otp_code = generate_otp()
                EmailVerificationOTP.objects.filter(user=user, is_used=False).update(is_used=True)
                EmailVerificationOTP.objects.create(user=user, otp=otp_code)
                send_otp_email(
                    user, otp_code,
                    'Verify Your EduFlow Email',
                    'emails/verify_email.html',
                    'emails/verify_email.txt'
                )
            refresh = RefreshToken.for_user(user)
            refresh['email'] = user.email
            refresh['role'] = user.role
            refresh['full_name'] = user.get_full_name()
            return Response({
                'message': 'Registration successful.',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserProfileSerializer(user, context={'request': request}).data,
            }, status=201)
        return Response(serializer.errors, status=400)


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data.get('refresh'))
            token.blacklist()
            return Response({'message': 'Logged out successfully.'})
        except TokenError:
            return Response({'error': 'Invalid token.'}, status=400)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserProfileSerializer(request.user, context={'request': request}).data)

    def patch(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserProfileSerializer(request.user, context={'request': request}).data)
        return Response(serializer.errors, status=400)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            if not request.user.check_password(serializer.validated_data['old_password']):
                return Response({'error': 'Current password is incorrect.'}, status=400)
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            return Response({'message': 'Password changed successfully.'})
        return Response(serializer.errors, status=400)


# ── Email Verification ──────────────────────────────────────────────────────────

class SendVerificationOTPView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.is_email_verified:
            return Response({'message': 'Email already verified.'})
        otp_code = generate_otp()
        EmailVerificationOTP.objects.filter(user=user, is_used=False).update(is_used=True)
        EmailVerificationOTP.objects.create(user=user, otp=otp_code)
        success, error = send_otp_email(
            user, otp_code,
            'Verify Your EduFlow Email',
            'emails/verify_email.html',
            'emails/verify_email.txt'
        )
        if not success:
            return Response({'error': f'Failed to send email: {error}'}, status=500)
        info = get_email_backend_info()
        return Response({
            'message': 'Verification OTP sent.',
            'delivery': info['mode'],
            'note': info['description'],
        })


class VerifyEmailOTPView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        otp_code = request.data.get('otp', '').strip()
        if not otp_code or len(otp_code) != 6:
            return Response({'error': 'Enter a valid 6-digit OTP.'}, status=400)
        expiry = timezone.now() - timedelta(minutes=OTP_EXPIRY_MINUTES)
        try:
            otp_obj = EmailVerificationOTP.objects.get(
                user=request.user, otp=otp_code,
                is_used=False, created_at__gte=expiry
            )
            otp_obj.is_used = True
            otp_obj.save()
            request.user.is_email_verified = True
            request.user.save()
            return Response({'message': 'Email verified successfully!'})
        except EmailVerificationOTP.DoesNotExist:
            return Response({'error': 'Invalid or expired OTP. Please request a new one.'}, status=400)


# ── Password Reset ──────────────────────────────────────────────────────────────

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email'].lower().strip()
            try:
                user = User.objects.get(email__iexact=email, is_active=True)
                otp_code = generate_otp()
                PasswordResetOTP.objects.filter(user=user, is_used=False).update(is_used=True)
                PasswordResetOTP.objects.create(user=user, otp=otp_code)
                success, error = send_otp_email(
                    user, otp_code,
                    'Reset Your EduFlow Password',
                    'emails/password_reset_otp.html',
                    'emails/password_reset_otp.txt'
                )
                if not success:
                    return Response({'error': f'Could not send email: {error}'}, status=500)
                info = get_email_backend_info()
                return Response({
                    'message': 'OTP sent to your email address.',
                    'delivery': info['mode'],
                    'note': info['description'],
                })
            except User.DoesNotExist:
                # Prevent email enumeration — always return success message
                return Response({'message': 'If that email exists, an OTP has been sent.'})
        return Response(serializer.errors, status=400)


class VerifyResetOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email'].lower().strip()
            otp_code = serializer.validated_data['otp']
            expiry = timezone.now() - timedelta(minutes=OTP_EXPIRY_MINUTES)
            try:
                user = User.objects.get(email__iexact=email, is_active=True)
                PasswordResetOTP.objects.get(
                    user=user, otp=otp_code,
                    is_used=False, created_at__gte=expiry
                )
                return Response({'valid': True, 'message': 'OTP verified.'})
            except (User.DoesNotExist, PasswordResetOTP.DoesNotExist):
                return Response({'error': 'Invalid or expired OTP.'}, status=400)
        return Response(serializer.errors, status=400)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordWithOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email'].lower().strip()
            otp_code = serializer.validated_data['otp']
            expiry = timezone.now() - timedelta(minutes=OTP_EXPIRY_MINUTES)
            try:
                user = User.objects.get(email__iexact=email, is_active=True)
                otp_obj = PasswordResetOTP.objects.get(
                    user=user, otp=otp_code,
                    is_used=False, created_at__gte=expiry
                )
                user.set_password(serializer.validated_data['new_password'])
                user.save()
                otp_obj.is_used = True
                otp_obj.save()
                return Response({'message': 'Password reset successfully. Please login.'})
            except (User.DoesNotExist, PasswordResetOTP.DoesNotExist):
                return Response({'error': 'Invalid or expired OTP.'}, status=400)
        return Response(serializer.errors, status=400)


# ── Dev Email Viewer (only active when DEBUG=True) ──────────────────────────────

class DevEmailListView(APIView):
    """
    GET /api/auth/dev-emails/
    Returns list of OTPs from saved email files (only works in dev with file backend).
    Used by the frontend to show OTPs during development when SMTP is not configured.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        if not settings.DEBUG:
            return Response({'error': 'Not available in production.'}, status=403)

        info = get_email_backend_info()
        email_dir = getattr(settings, 'EMAIL_FILE_PATH', settings.BASE_DIR / 'sent_emails')

        emails = []
        try:
            files = sorted(glob.glob(str(email_dir / '*.log')), key=os.path.getmtime, reverse=True)
            for filepath in files[:20]:  # Last 20 emails
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()

                # Extract key fields
                to_match = re.search(r'^To:\s*(.+)$', content, re.MULTILINE)
                subject_match = re.search(r'^Subject:\s*(.+)$', content, re.MULTILINE)
                date_match = re.search(r'^Date:\s*(.+)$', content, re.MULTILINE)
                # Extract 6-digit OTP from body
                otp_match = re.search(r'\b(\d{6})\b', content)

                emails.append({
                    'filename': os.path.basename(filepath),
                    'to': to_match.group(1).strip() if to_match else 'Unknown',
                    'subject': subject_match.group(1).strip() if subject_match else 'Unknown',
                    'date': date_match.group(1).strip() if date_match else 'Unknown',
                    'otp': otp_match.group(1) if otp_match else None,
                })
        except Exception as e:
            logger.error(f"DevEmailListView error: {e}")

        return Response({
            'backend': info,
            'emails': emails,
            'email_dir': str(email_dir),
            'total': len(emails),
        })


# ── Admin ────────────────────────────────────────────────────────────────────────

class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminUserSerializer
    queryset = User.objects.all()
    filterset_fields = ['role', 'is_active']
    search_fields = ['email', 'first_name', 'last_name']


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminUserSerializer
    queryset = User.objects.all()
