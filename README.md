# MentorQue - Mentoring Call Scheduling System

A role-based mentoring call scheduling platform with three roles:
- User
- Mentor
- Admin

The core flow is:
1. User and Mentor add availability.
2. Admin views users, mentors, and recommendations.
3. Admin checks overlap between user/mentor slots.
4. Admin books a call.

## Features

- JWT-based authentication for User, Mentor, and Admin
- Strict RBAC route protection
- User profile update (tags + description)
- User availability management
- Mentor availability management
- Admin mentor metadata management (tags + description)
- Recommendation engine (tag overlap + description keyword scoring + call-type bonus)
- Availability overlap detection
- Admin-only booking creation with overlap validation
- Booking list view
- Dockerized backend + PostgreSQL setup

## Tech Stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT
- Containerization: Docker, Docker Compose

## Setup

### Docker (recommended)

```bash
# from project root
docker-compose up --build
```

Services:
- API: http://localhost:5000/api
- DB: localhost:5432

### Manual

Backend:

```bash
cd backend
npm install
npx prisma migrate dev --schema=src/prisma/schema.prisma
npm run dev
```

If your environment has no Prisma migration history, use:

```bash
npx prisma db push --schema=src/prisma/schema.prisma
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:
- http://localhost:5173

## API Endpoints

Auth:
- POST /api/auth/user/login
- POST /api/auth/mentor/login
- POST /api/auth/admin/login

User (USER role):
- GET /api/user/me
- POST /api/user/profile
- POST /api/user/availability
- GET /api/user/availability

Mentor (MENTOR role):
- GET /api/mentor/me
- POST /api/mentor/availability
- GET /api/mentor/availability

Admin (ADMIN role):
- GET /api/admin/users
- GET /api/admin/mentors
- PATCH /api/admin/mentors/:mentorId
- GET /api/admin/recommendations/:userId
- GET /api/admin/availability-overlap?userId=&mentorId=
- POST /api/admin/book
- GET /api/admin/bookings

## Test Credentials

Admin:
- Email: admin@example.com
- Password: admin123

Sample users:
- alice@example.com / password123
- bob@example.com / password123
- carol@example.com / password123

Sample mentors:
- sarah.mentor@example.com / mentor123
- michael.mentor@example.com / mentor123
- priya.mentor@example.com / mentor123

## Final Validation Checklist

- [x] User login
- [x] Mentor login
- [x] Admin login
- [x] Add availability (User/Mentor)
- [x] Recommendation system
- [x] Availability overlap
- [x] Booking system
- [x] RBAC restrictions
- [x] Docker backend and DB startup

## Notes

- Seed data is expected to be prepared already for this submission flow.
- Docker startup does not auto-run seed anymore; this avoids unintended reseeding in already prepared environments.
