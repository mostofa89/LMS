from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.conf import settings
from .models import User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        token['full_name'] = user.get_full_name()
        token['is_email_verified'] = user.is_email_verified
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserProfileSerializer(self.user).data
        return data


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    secret_key = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'role', 'password', 'password2', 'secret_key']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})

        role = attrs.get('role', 'student')
        secret_key = attrs.get('secret_key', '').strip()

        if role == 'admin':
            if secret_key != settings.ADMIN_REGISTRATION_KEY:
                raise serializers.ValidationError({'secret_key': 'Invalid admin registration key.'})
        elif role == 'instructor':
            if secret_key != settings.INSTRUCTOR_REGISTRATION_KEY:
                raise serializers.ValidationError({'secret_key': 'Invalid instructor registration key.'})

        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        validated_data.pop('secret_key', None)
        # Admins are auto email-verified
        if validated_data.get('role') in ('admin', 'instructor'):
            validated_data['is_email_verified'] = True
        if validated_data.get('role') == 'admin':
            validated_data['is_staff'] = True
        return User.objects.create_user(**validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'avatar', 'avatar_url', 'bio', 'phone',
            'expertise', 'linkedin_url', 'website_url', 'is_email_verified',
            'enrollment_date', 'date_joined', 'updated_at'
        ]
        read_only_fields = ['id', 'email', 'role', 'date_joined', 'updated_at', 'is_email_verified']

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'bio', 'phone',
                  'expertise', 'linkedin_url', 'website_url', 'avatar']


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({'new_password': 'Passwords do not match.'})
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(required=True, min_length=6, max_length=6)


class ResetPasswordWithOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(required=True, min_length=6, max_length=6)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({'new_password': 'Passwords do not match.'})
        return attrs


class AdminUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name',
                  'role', 'is_active', 'is_email_verified', 'date_joined']

    def get_full_name(self, obj):
        return obj.get_full_name()
