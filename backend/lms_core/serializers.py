from rest_framework import serializers
from django.utils.text import slugify
from .models import Category, Course, Enrollment
from accounts.serializers import UserProfileSerializer


class CategorySerializer(serializers.ModelSerializer):
    course_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon', 'course_count', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']

    def get_course_count(self, obj):
        return obj.courses.filter(status='published').count()

    def create(self, validated_data):
        validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)


class InstructorBriefSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    full_name = serializers.SerializerMethodField()
    email = serializers.EmailField()
    expertise = serializers.CharField()
    avatar_url = serializers.SerializerMethodField()

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None


class CourseListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    instructor_name = serializers.CharField(source='instructor.get_full_name', read_only=True)
    enrollment_count = serializers.IntegerField(read_only=True)
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'short_description', 'thumbnail_url',
            'category', 'category_name', 'instructor', 'instructor_name',
            'level', 'status', 'price', 'duration_hours',
            'enrollment_count', 'created_at'
        ]

    def get_thumbnail_url(self, obj):
        request = self.context.get('request')
        if obj.thumbnail and request:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None


class CourseDetailSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)
    instructor_detail = serializers.SerializerMethodField()
    enrollment_count = serializers.IntegerField(read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'short_description',
            'thumbnail', 'thumbnail_url', 'category', 'category_detail',
            'instructor', 'instructor_detail', 'level', 'status', 'price',
            'duration_hours', 'prerequisites', 'what_you_learn',
            'max_students', 'enrollment_count', 'is_enrolled',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def get_instructor_detail(self, obj):
        return InstructorBriefSerializer(obj.instructor, context=self.context).data

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'student':
            return obj.enrollments.filter(student=request.user, is_active=True).exists()
        return False

    def get_thumbnail_url(self, obj):
        request = self.context.get('request')
        if obj.thumbnail and request:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'title', 'description', 'short_description', 'thumbnail',
            'category', 'level', 'status', 'price', 'duration_hours',
            'prerequisites', 'what_you_learn', 'max_students'
        ]

    def create(self, validated_data):
        validated_data['slug'] = slugify(validated_data['title'])
        # Ensure unique slug
        slug = validated_data['slug']
        counter = 1
        while Course.objects.filter(slug=validated_data['slug']).exists():
            validated_data['slug'] = f"{slug}-{counter}"
            counter += 1
        return super().create(validated_data)


class EnrollmentSerializer(serializers.ModelSerializer):
    course_detail = CourseListSerializer(source='course', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_email = serializers.EmailField(source='student.email', read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'student_name', 'student_email',
            'course', 'course_detail', 'status', 'is_active',
            'progress', 'enrolled_at', 'completed_at'
        ]
        read_only_fields = ['id', 'enrolled_at']


class EnrollRequestSerializer(serializers.Serializer):
    course_id = serializers.UUIDField()


class DashboardSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_students = serializers.IntegerField()
    total_instructors = serializers.IntegerField()
    total_admins = serializers.IntegerField()
    total_courses = serializers.IntegerField()
    published_courses = serializers.IntegerField()
    draft_courses = serializers.IntegerField()
    total_enrollments = serializers.IntegerField()
    active_enrollments = serializers.IntegerField()
    completed_enrollments = serializers.IntegerField()
    recent_enrollments = EnrollmentSerializer(many=True)
    top_courses = CourseListSerializer(many=True)
