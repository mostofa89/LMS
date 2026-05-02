@echo off
echo ============================================
echo  EduFlow LMS - Windows Setup
echo ============================================

cd /d "%~dp0backend"

echo.
echo [1/5] Creating virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ERROR: Python not found. Install Python 3.11 or 3.12 from python.org
    pause
    exit /b 1
)

echo.
echo [2/5] Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo [3/5] Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install packages.
    pause
    exit /b 1
)

echo.
echo [4/5] Running database migrations...
python manage.py migrate

echo.
echo [5/5] Creating demo data (admin, instructors, students)...
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@eduflow.com').exists():
    from lms_core.models import Category, Course, Enrollment
    from decimal import Decimal
    from django.utils.text import slugify
    admin = User.objects.create_superuser(email='admin@eduflow.com', password='Admin@123', first_name='Alex', last_name='Morgan')
    i1 = User.objects.create_user(email='sarah@eduflow.com', password='Pass@123', first_name='Sarah', last_name='Chen', role='instructor', expertise='Full Stack Development')
    i2 = User.objects.create_user(email='james@eduflow.com', password='Pass@123', first_name='James', last_name='Wilson', role='instructor', expertise='Data Science')
    students = [User.objects.create_user(email=f'student{i}@eduflow.com', password='Pass@123', first_name='Student', last_name=f'User{i}', role='student') for i in range(1,4)]
    cats = {}
    for name, icon in [('Web Development','web'),('Data Science','data'),('Mobile Dev','mobile')]:
        cats[name] = Category.objects.create(name=name, slug=slugify(name), icon=icon)
    for title, cat, inst, level, status, price, hours in [
        ('React and TypeScript Mastery', cats['Web Development'], i1, 'advanced', 'published', 49.99, 40),
        ('Python for Data Science', cats['Data Science'], i2, 'beginner', 'published', 39.99, 30),
        ('Node.js Backend Development', cats['Web Development'], i1, 'intermediate', 'published', 44.99, 35),
    ]:
        c = Course.objects.create(title=title, slug=slugify(title), category=cat, instructor=inst, level=level, status=status, price=Decimal(str(price)), duration_hours=hours, short_description=f'Learn {title}', description=f'Comprehensive course on {title}.')
        for s in students:
            Enrollment.objects.create(student=s, course=c)
    print('Demo data created!')
else:
    print('Demo data already exists, skipping.')
"

echo.
echo ============================================
echo  Setup complete!
echo.
echo  Demo accounts:
echo    Admin:      admin@eduflow.com   / Admin@123
echo    Instructor: sarah@eduflow.com   / Pass@123
echo    Student:    student1@eduflow.com / Pass@123
echo.
echo  To start the backend server, run:
echo    start_backend.bat
echo ============================================
pause
