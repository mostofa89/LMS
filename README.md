# EduFlow — Full Stack LMS

A production-grade Learning Management System built with Django REST Framework and React + Tailwind CSS.

---

## Tech Stack

**Backend**
- Python 3.12 / Django 4.2
- Django REST Framework 3.15
- Simple JWT — access/refresh tokens, blacklisting
- SQLite (dev) / MySQL (production)
- django-cors-headers, django-filter, Pillow

**Frontend**
- React 18 + Vite
- Tailwind CSS 3 — fully custom design system
- React Router v6 — protected routes
- TanStack Query v5 — server state & caching
- React Hook Form — validated forms
- Recharts — admin analytics charts
- Zustand — auth state management
- Axios — JWT interceptors + auto token refresh

---

## Quick Start

### Option A — One-command scripts

```bash
# Terminal 1
./start_backend.sh    # auto-creates venv, installs deps, migrates, runs server

# Terminal 2
./start_frontend.sh   # installs npm deps and starts dev server
```

### Option B — Manual setup

#### Backend

```bash
cd backend

# Create & activate virtual environment
python3 -m venv venv
source venv/bin/activate          # Mac/Linux
# venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env .env.local   # edit as needed

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
```

API runs at **http://localhost:8000**

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**

---

## Environment Variables

### `backend/.env`
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Email — console backend (prints to terminal) for development
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# For production SMTP (Gmail example):
# EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USE_TLS=True
# EMAIL_HOST_USER=you@gmail.com
# EMAIL_HOST_PASSWORD=your-app-password
# DEFAULT_FROM_EMAIL=EduFlow LMS <noreply@yourdomain.com>

FRONTEND_URL=http://localhost:5173
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:8000/api
```

---

## Demo Credentials

| Role       | Email                     | Password   |
|------------|---------------------------|------------|
| Admin      | admin@eduflow.com         | Admin@123  |
| Instructor | sarah@eduflow.com         | Pass@123   |
| Instructor | james@eduflow.com         | Pass@123   |
| Student    | student1@eduflow.com      | Pass@123   |

### Load Demo Data

Demo JSON is available in `backend/lms_core/fixtures/demo_data.json`.

```bash
cd backend
python manage.py migrate
python manage.py seed_demo_data
```

This command creates/updates users, categories, courses, and enrollments from the JSON file.

---

## API Endpoints

### Auth (`/api/auth/`)
| Method     | Endpoint                            | Description              |
|------------|-------------------------------------|--------------------------|
| POST       | `register/`                         | Register new user        |
| POST       | `login/`                            | Login, returns JWT pair  |
| POST       | `logout/`                           | Blacklist refresh token  |
| POST       | `token/refresh/`                    | Refresh access token     |
| GET/PATCH  | `profile/`                          | View / update profile    |
| POST       | `change-password/`                  | Change password          |
| POST       | `forgot-password/`                  | Send reset email         |
| POST       | `reset-password/`                   | Reset with token         |
| GET        | `validate-reset-token/<token>/`     | Validate reset token     |
| GET        | `users/`                            | Admin: list all users    |
| PATCH/DELETE | `users/<id>/`                     | Admin: update/delete     |

### LMS (`/api/`)
| Method      | Endpoint                           | Description              |
|-------------|------------------------------------|--------------------------|
| GET/POST    | `categories/`                      | List / create categories |
| GET/PUT/DELETE | `categories/<id>/`              | Category CRUD            |
| GET         | `courses/`                         | List (filtered)          |
| POST        | `courses/create/`                  | Create course            |
| GET         | `courses/<id>/`                    | Course detail            |
| PATCH/DELETE | `courses/<id>/edit/`              | Update / delete          |
| POST        | `enroll/`                          | Enroll in course         |
| DELETE      | `enrollments/<id>/unenroll/`       | Unenroll                 |
| PATCH       | `enrollments/<id>/progress/`       | Update progress (0–100)  |
| GET         | `my-enrollments/`                  | Student enrollments      |
| GET         | `admin/enrollments/`               | Admin: all enrollments   |
| GET         | `dashboard/`                       | Role-aware dashboard     |
| GET         | `reports/`                         | Admin analytics          |

---

## Project Structure

```
eduflow/
├── backend/
│   ├── venv/                  ← Python virtual environment
│   ├── accounts/              ← Auth, users, JWT, password reset
│   │   ├── models.py          ← Custom User + PasswordResetToken
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── permissions.py     ← IsAdmin, IsInstructor, etc.
│   │   └── urls.py
│   ├── lms_core/              ← Courses, enrollments, dashboard
│   │   ├── models.py          ← Category, Course, Enrollment
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── middleware.py      ← Request logging
│   │   └── urls.py
│   ├── config/                ← Django project settings
│   ├── templates/emails/      ← HTML + text password reset emails
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/               ← axios.js, auth.js, courses.js
│   │   ├── components/
│   │   │   ├── layout/        ← Layout, Sidebar, Topbar
│   │   │   ├── course/        ← CourseCard
│   │   │   └── ui/            ← Badge, Modal, Spinner, StatCard
│   │   ├── pages/
│   │   │   ├── admin/         ← Users, Enrollments, Reports
│   │   │   ├── instructor/    ← ManageCourses, CourseForm
│   │   │   └── student/       ← MyLearning
│   │   └── store/authStore.js ← Zustand auth state
│   └── .env
├── .gitignore
├── start_backend.sh
├── start_frontend.sh
└── README.md
```

---

## Production Checklist

- [ ] Set `DEBUG=False`
- [ ] Generate a strong `SECRET_KEY` (50+ chars)
- [ ] Configure MySQL (`mysqlclient` + DB credentials in `.env`)
- [ ] Set up SMTP email (Gmail App Password or SendGrid)
- [ ] Run `python manage.py collectstatic`
- [ ] Serve with **gunicorn** behind **nginx**
- [ ] Build frontend: `npm run build` → serve `dist/` via nginx
- [ ] Set `CORS_ALLOWED_ORIGINS` to your production domain
- [ ] Enable HTTPS and set `SECURE_SSL_REDIRECT=True`
