import json
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from lms_core.models import Category, Course, Enrollment


class Command(BaseCommand):
    help = "Seed demo users, categories, courses, and enrollments from JSON"

    def add_arguments(self, parser):
        parser.add_argument(
            "--file",
            default="lms_core/fixtures/demo_data.json",
            help="Relative path (from backend/) to the seed JSON file",
        )

    def handle(self, *args, **options):
        user_model = get_user_model()
        seed_file = Path(options["file"])

        if not seed_file.exists():
            raise CommandError(f"Seed file not found: {seed_file}")

        with seed_file.open("r", encoding="utf-8") as f:
            payload = json.load(f)

        users = payload.get("users", [])
        categories = payload.get("categories", [])
        courses = payload.get("courses", [])
        enrollments = payload.get("enrollments", [])

        # Users
        for row in users:
            email = row["email"].lower().strip()
            password = row.pop("password", None)
            defaults = {**row}

            user, created = user_model.objects.update_or_create(email=email, defaults=defaults)
            if password:
                user.set_password(password)
                user.save(update_fields=["password"])

            self.stdout.write(
                self.style.SUCCESS(f"{'Created' if created else 'Updated'} user: {email}")
            )

        # Categories
        for row in categories:
            slug = row["slug"]
            category, created = Category.objects.update_or_create(slug=slug, defaults=row)
            self.stdout.write(
                self.style.SUCCESS(
                    f"{'Created' if created else 'Updated'} category: {category.name}"
                )
            )

        # Courses
        for row in courses:
            slug = row["slug"]
            instructor_email = row.pop("instructor_email")
            category_slug = row.pop("category_slug")

            try:
                instructor = user_model.objects.get(email=instructor_email)
            except user_model.DoesNotExist as exc:
                raise CommandError(f"Instructor not found: {instructor_email}") from exc

            try:
                category = Category.objects.get(slug=category_slug)
            except Category.DoesNotExist as exc:
                raise CommandError(f"Category not found: {category_slug}") from exc

            defaults = {
                **row,
                "instructor": instructor,
                "category": category,
            }
            course, created = Course.objects.update_or_create(slug=slug, defaults=defaults)
            self.stdout.write(
                self.style.SUCCESS(
                    f"{'Created' if created else 'Updated'} course: {course.title}"
                )
            )

        # Enrollments
        for row in enrollments:
            student_email = row.pop("student_email")
            course_slug = row.pop("course_slug")

            try:
                student = user_model.objects.get(email=student_email)
            except user_model.DoesNotExist as exc:
                raise CommandError(f"Student not found: {student_email}") from exc

            try:
                course = Course.objects.get(slug=course_slug)
            except Course.DoesNotExist as exc:
                raise CommandError(f"Course not found: {course_slug}") from exc

            enrollment, created = Enrollment.objects.update_or_create(
                student=student,
                course=course,
                defaults=row,
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f"{'Created' if created else 'Updated'} enrollment: "
                    f"{student.email} -> {course.slug}"
                )
            )

        self.stdout.write(self.style.SUCCESS("Demo data seeding complete."))
