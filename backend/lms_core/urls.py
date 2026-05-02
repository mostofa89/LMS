from django.urls import path
from . import views

urlpatterns = [
    # Categories
    path('categories/', views.CategoryListCreateView.as_view(), name='category_list'),
    path('categories/<uuid:pk>/', views.CategoryDetailView.as_view(), name='category_detail'),

    # Courses
    path('courses/', views.CourseListView.as_view(), name='course_list'),
    path('courses/create/', views.CourseCreateView.as_view(), name='course_create'),
    path('courses/<uuid:pk>/', views.CourseDetailView.as_view(), name='course_detail'),
    path('courses/<uuid:pk>/edit/', views.CourseUpdateDeleteView.as_view(), name='course_edit'),

    # Enrollments
    path('enroll/', views.EnrollView.as_view(), name='enroll'),
    path('enrollments/<uuid:pk>/unenroll/', views.UnenrollView.as_view(), name='unenroll'),
    path('enrollments/<uuid:pk>/progress/', views.UpdateProgressView.as_view(), name='update_progress'),
    path('my-enrollments/', views.MyEnrollmentsView.as_view(), name='my_enrollments'),
    path('admin/enrollments/', views.AdminEnrollmentListView.as_view(), name='admin_enrollments'),

    # Dashboard & Reports
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    path('reports/', views.ReportsView.as_view(), name='reports'),
]
