from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view()),
    path('login/', views.LoginView.as_view()),
    path('logout/', views.LogoutView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('profile/', views.ProfileView.as_view()),
    path('change-password/', views.ChangePasswordView.as_view()),
    # Email verification
    path('send-verification-otp/', views.SendVerificationOTPView.as_view()),
    path('verify-email/', views.VerifyEmailOTPView.as_view()),
    # Password reset
    path('forgot-password/', views.ForgotPasswordView.as_view()),
    path('verify-reset-otp/', views.VerifyResetOTPView.as_view()),
    path('reset-password/', views.ResetPasswordView.as_view()),
    # Dev tools (DEBUG only)
    path('dev-emails/', views.DevEmailListView.as_view()),
    # Admin
    path('users/', views.AdminUserListView.as_view()),
    path('users/<uuid:pk>/', views.AdminUserDetailView.as_view()),
]
