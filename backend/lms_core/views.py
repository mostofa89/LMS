from rest_framework import status, generics, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model
from django.db.models import Count

from .models import Category, Course, Enrollment
from .serializers import (
    CategorySerializer, CourseListSerializer, CourseDetailSerializer,
    CourseCreateUpdateSerializer, EnrollmentSerializer, EnrollRequestSerializer
)
from accounts.permissions import IsAdmin, IsAdminOrInstructor

User = get_user_model()


# ─── Categories ─────────────────────────────────────────────────────────────

class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdmin()]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdmin()]


# ─── Courses ─────────────────────────────────────────────────────────────────

class CourseListView(generics.ListAPIView):
    serializer_class = CourseListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'level', 'status', 'instructor']
    search_fields = ['title', 'description', 'instructor__first_name', 'instructor__last_name']
    ordering_fields = ['created_at', 'price', 'title']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == 'instructor':
            return Course.objects.filter(instructor=user)
        if user.is_authenticated and user.role == 'admin':
            return Course.objects.all()
        return Course.objects.filter(status='published')


class CourseDetailView(generics.RetrieveAPIView):
    serializer_class = CourseDetailSerializer
    queryset = Course.objects.all()
    permission_classes = [AllowAny]
    lookup_field = 'pk'


class CourseCreateView(APIView):
    permission_classes = [IsAdminOrInstructor]

    def post(self, request):
        serializer = CourseCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            # Instructors can only create for themselves
            instructor = request.user
            if request.user.role == 'admin':
                instructor_id = request.data.get('instructor')
                if instructor_id:
                    try:
                        instructor = User.objects.get(id=instructor_id, role='instructor')
                    except User.DoesNotExist:
                        return Response({'error': 'Instructor not found.'}, status=400)
            course = serializer.save(instructor=instructor)
            return Response(CourseDetailSerializer(course, context={'request': request}).data, status=201)
        return Response(serializer.errors, status=400)


class CourseUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CourseCreateUpdateSerializer
    queryset = Course.objects.all()

    def get_permissions(self):
        return [IsAdminOrInstructor()]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Course.objects.all()
        return Course.objects.filter(instructor=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = CourseCreateUpdateSerializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            course = serializer.save()
            return Response(CourseDetailSerializer(course, context={'request': request}).data)
        return Response(serializer.errors, status=400)


# ─── Enrollments ─────────────────────────────────────────────────────────────

class EnrollView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'student':
            return Response({'error': 'Only students can enroll in courses.'}, status=403)
        serializer = EnrollRequestSerializer(data=request.data)
        if serializer.is_valid():
            course_id = serializer.validated_data['course_id']
            try:
                course = Course.objects.get(id=course_id, status='published')
            except Course.DoesNotExist:
                return Response({'error': 'Course not found or not available.'}, status=404)

            if course.max_students and course.enrollment_count >= course.max_students:
                return Response({'error': 'Course is full.'}, status=400)

            enrollment, created = Enrollment.objects.get_or_create(
                student=request.user,
                course=course,
                defaults={'is_active': True}
            )
            if not created:
                if enrollment.is_active:
                    return Response({'error': 'Already enrolled.'}, status=400)
                enrollment.is_active = True
                enrollment.status = 'active'
                enrollment.save()

            return Response(EnrollmentSerializer(enrollment, context={'request': request}).data, status=201)
        return Response(serializer.errors, status=400)


class UnenrollView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            enrollment = Enrollment.objects.get(id=pk, student=request.user, is_active=True)
            enrollment.is_active = False
            enrollment.status = 'dropped'
            enrollment.save()
            return Response({'message': 'Unenrolled successfully.'})
        except Enrollment.DoesNotExist:
            return Response({'error': 'Enrollment not found.'}, status=404)


class MyEnrollmentsView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user, is_active=True).select_related('course')


class UpdateProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            enrollment = Enrollment.objects.get(id=pk, student=request.user, is_active=True)
            progress = request.data.get('progress', 0)
            if not 0 <= int(progress) <= 100:
                return Response({'error': 'Progress must be between 0 and 100.'}, status=400)
            enrollment.progress = progress
            if int(progress) == 100:
                from django.utils import timezone
                enrollment.status = 'completed'
                enrollment.completed_at = timezone.now()
            enrollment.save()
            return Response(EnrollmentSerializer(enrollment).data)
        except Enrollment.DoesNotExist:
            return Response({'error': 'Enrollment not found.'}, status=404)


# ─── Admin Enrollments ───────────────────────────────────────────────────────

class AdminEnrollmentListView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAdmin]
    queryset = Enrollment.objects.all().select_related('student', 'course')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'is_active', 'course', 'student']
    search_fields = ['student__email', 'student__first_name', 'course__title']


# ─── Dashboard ───────────────────────────────────────────────────────────────

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == 'admin':
            data = self._admin_dashboard()
        elif user.role == 'instructor':
            data = self._instructor_dashboard(user, request)
        else:
            data = self._student_dashboard(user, request)

        return Response(data)

    def _admin_dashboard(self):
        role_counts = User.objects.values('role').annotate(count=Count('id'))
        role_map = {r['role']: r['count'] for r in role_counts}

        recent_enrollments = Enrollment.objects.select_related('student', 'course').order_by('-enrolled_at')[:5]
        top_courses = Course.objects.filter(status='published').annotate(
            enroll_count=Count('enrollments', filter=__import__('django.db.models', fromlist=['Q']).Q(enrollments__is_active=True))
        ).order_by('-enroll_count')[:5]

        return {
            'total_users': User.objects.count(),
            'total_students': role_map.get('student', 0),
            'total_instructors': role_map.get('instructor', 0),
            'total_admins': role_map.get('admin', 0),
            'total_courses': Course.objects.count(),
            'published_courses': Course.objects.filter(status='published').count(),
            'draft_courses': Course.objects.filter(status='draft').count(),
            'total_enrollments': Enrollment.objects.count(),
            'active_enrollments': Enrollment.objects.filter(is_active=True, status='active').count(),
            'completed_enrollments': Enrollment.objects.filter(status='completed').count(),
            'recent_enrollments': EnrollmentSerializer(recent_enrollments, many=True).data,
            'top_courses': CourseListSerializer(top_courses, many=True).data,
        }

    def _instructor_dashboard(self, user, request):
        my_courses = Course.objects.filter(instructor=user)
        enrollments = Enrollment.objects.filter(course__instructor=user)
        return {
            'total_courses': my_courses.count(),
            'published_courses': my_courses.filter(status='published').count(),
            'draft_courses': my_courses.filter(status='draft').count(),
            'total_students': enrollments.filter(is_active=True).values('student').distinct().count(),
            'total_enrollments': enrollments.count(),
            'active_enrollments': enrollments.filter(status='active', is_active=True).count(),
            'completed_enrollments': enrollments.filter(status='completed').count(),
            'my_courses': CourseListSerializer(my_courses.order_by('-created_at')[:5], many=True, context={'request': request}).data,
            'recent_enrollments': EnrollmentSerializer(enrollments.order_by('-enrolled_at')[:5], many=True, context={'request': request}).data,
        }

    def _student_dashboard(self, user, request):
        enrollments = Enrollment.objects.filter(student=user)
        return {
            'total_enrollments': enrollments.count(),
            'active_enrollments': enrollments.filter(status='active', is_active=True).count(),
            'completed_enrollments': enrollments.filter(status='completed').count(),
            'my_enrollments': EnrollmentSerializer(
                enrollments.filter(is_active=True).select_related('course')[:5],
                many=True, context={'request': request}
            ).data,
        }


class ReportsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        from django.db.models import Count, Q
        from django.utils import timezone
        from datetime import timedelta

        # Enrollment trend last 7 days
        today = timezone.now().date()
        enrollment_trend = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            count = Enrollment.objects.filter(enrolled_at__date=day).count()
            enrollment_trend.append({'date': str(day), 'count': count})

        # Courses by category
        courses_by_category = list(
            Category.objects.annotate(count=Count('courses')).values('name', 'count')
        )

        # Users by role
        users_by_role = list(
            User.objects.values('role').annotate(count=Count('id'))
        )

        return Response({
            'enrollment_trend': enrollment_trend,
            'courses_by_category': courses_by_category,
            'users_by_role': users_by_role,
            'total_revenue': float(
                Course.objects.filter(enrollments__is_active=True)
                .aggregate(total=__import__('django.db.models', fromlist=['Sum']).Sum('price'))['total'] or 0
            ),
        })
