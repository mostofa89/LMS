from django.contrib import admin
from .models import Category, Course, Enrollment

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'instructor', 'category', 'level', 'status', 'enrollment_count', 'created_at']
    list_filter = ['status', 'level', 'category']
    search_fields = ['title', 'instructor__email']

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'status', 'progress', 'enrolled_at']
    list_filter = ['status', 'is_active']
