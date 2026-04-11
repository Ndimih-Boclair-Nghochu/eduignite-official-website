# EduIgnite Production Bootstrap

This file documents the production backend commands and SQL seed order for a fresh PostgreSQL deployment.

## 1. Backend Commands

Run these in your hosted backend terminal with the production `DATABASE_URL` loaded:

```bash
python manage.py showmigrations --settings=config.settings.base
python manage.py migrate --settings=config.settings.base
python manage.py collectstatic --noinput --settings=config.settings.base
python manage.py check --settings=config.settings.base
```

If your host does not automatically expose `DATABASE_URL`, export it first:

```bash
export DATABASE_URL="your-postgres-connection-string"
```

On PowerShell:

```powershell
$env:DATABASE_URL="your-postgres-connection-string"
python manage.py showmigrations --settings=config.settings.base
python manage.py migrate --settings=config.settings.base
python manage.py collectstatic --noinput --settings=config.settings.base
python manage.py check --settings=config.settings.base
```

## 2. Seed Order

Seed data in this order:

1. `platform_settings`
2. `platform_fees`
3. `tutorial_links`
4. founder protection trigger
5. CEO and CTO accounts
6. first school
7. school settings
8. school-level users
9. student profile and parent links
10. academic setup (`subjects`, `sequences`)
11. fee setup (`fee_structures`)
12. optional bootstrap records for library, announcements, live classes, and community

## 3. Account Model Summary

The core account table is `public.users`.

Roles:

- `CEO`
- `CTO`
- `COO`
- `INV`
- `DESIGNER`
- `SCHOOL_ADMIN`
- `SUB_ADMIN`
- `TEACHER`
- `STUDENT`
- `PARENT`
- `BURSAR`
- `LIBRARIAN`

Relationships:

- One `School` has many `users`
- One student `users` row can have one `students_student` profile
- Parents connect to student profiles through `students_parentstudentlink`
- Teachers connect to subjects, grades, attendance sessions, and live classes
- Bursars process `fees_payment`
- Librarians issue `library_bookloan`
- School admins and sub-admins manage school data
- CEO and CTO are platform-wide founders with equal access

## 4. Founder Activation Flow

Founders are inserted with `password='!pending_activation'`.

They cannot sign in until they activate:

```http
POST /api/v1/auth/activate/
{
  "matricule": "EDU-CEO-0001",
  "new_password": "StrongPassword123!",
  "confirm_password": "StrongPassword123!"
}
```

Then they can log in using:

```http
POST /api/v1/auth/login/
{
  "matricule": "EDU-CEO-0001",
  "password": "StrongPassword123!"
}
```

## 5. SQL

Use [`PRODUCTION_BOOTSTRAP.sql`](./PRODUCTION_BOOTSTRAP.sql).
