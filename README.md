<div align="center">

# 🧑‍💼 HRMS — Human Resource Management System

### _Every workday, perfectly aligned._

A full-stack HR platform for **employee onboarding, profile management, attendance
tracking, leave workflows, and salary structures** — with role-based access for
Admins, HR officers, and Employees.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss)

</div>

---

## ✨ Features

| Area | Highlights |
| --- | --- |
| 🔐 **Auth** | JWT login, first-login password change, email/password reset, role-based guards |
| 🧭 **Dashboard** | Per-role landing page, quick-access cards, merged recent activity feed |
| 🕑 **Attendance** | Check-in / check-out, daily & weekly views, monthly calendar, work + extra hours |
| 🌴 **Leave / Time-Off** | Calendar date-range apply, Paid / Sick / Unpaid, approval workflow with comments |
| 👥 **Admin Panel** | Employee grid with live status dots, attendance records, leave approvals |
| 👤 **Profile** | Private info (owner-editable), documents & resume tabs, view-only mode for others |
| 💰 **Salary** | Salary structure + components (Admin/HR only), server-computed amounts |
| 🆕 **Onboarding** | Auto-generated Employee IDs + one-time temporary passwords |

---

## 🏗️ Architecture

```
┌────────────────────────┐        HTTP / JWT        ┌────────────────────────┐         ┌───────────────┐
│   Frontend (Next.js)    │  ───────────────────►    │   Backend (Express)     │  ────►  │  Neon Postgres │
│   App Router · Tailwind │                          │   Prisma · JWT auth     │  Prisma │   (schema.prisma)
│   :3000                 │  ◄───────────────────    │   :5000                 │  ◄────  │               │
└────────────────────────┘        JSON { data }      └────────────────────────┘         └───────────────┘
```

- **Frontend** and **backend** are **two separate apps** and run independently.
- The frontend talks to the backend through a single API client using `NEXT_PUBLIC_API_URL`.
- Auth token is issued by the backend on login and stored client-side; every request carries it.

---

## 🧰 Tech Stack

**Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, lucide-react, react-day-picker
**Backend:** Node.js, Express 5, Prisma ORM, JWT, bcryptjs, Zod
**Database:** PostgreSQL (Neon)

---

## 📁 Project Structure

```
OdooXADAMAS/
├─ backend/                       # Express API (port 5000)
│  ├─ controllers/                # auth, attendance, user, salary, leave
│  ├─ middlewares/                # requireAuth (JWT), requireRole, error handler
│  ├─ services/ repositories/     # attendance business logic + data access
│  ├─ prisma/schema.prisma        # single source of truth for the DB
│  ├─ prisma/seed.js              # salary structures + profile enrichment
│  └─ index.js                    # route wiring
│
└─ frontend/                      # Next.js app (port 3000)
   ├─ app/
   │  ├─ (dash)/                  # authenticated shell + pages
   │  │  ├─ dashboard/            # My Dashboard  (all roles)
   │  │  ├─ admin/                # Admin Panel   (ADMIN / HR)
   │  │  ├─ onboard/              # Onboard Employee (ADMIN / HR)
   │  │  ├─ attendance/           # My Attendance
   │  │  ├─ leave/                # Leave / Time Off
   │  │  └─ profile/              # My Profile
   │  └─ login · change-password · reset-password · …
   ├─ components/                 # layout shell, admin, profile, leave, attendance, shared
   └─ lib/                        # api client, auth context, roles, formatting
```

---

## 🗄️ Data Models (`backend/prisma/schema.prisma`)

`User` · `Attendance` · `Leave` · `SalaryStructure` · `SalaryComponent` · `Document` · `Payroll`*

> \*`Payroll` exists in the schema but is unused by the current views — **SalaryStructure / SalaryComponent** is the source of truth for salary data.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A PostgreSQL database (a free [Neon](https://neon.tech) project works great)

### 1 · Backend

```bash
cd backend
npm install

# create backend/.env  (see below), then:
npx prisma generate
npx prisma db push        # syncs schema.prisma to the database
node prisma/seed.js       # seeds salary structures + profile data
npm run dev               # starts the API on http://localhost:5000
```

### 2 · Frontend

```bash
cd frontend
npm install

# create frontend/.env.local  (see below), then:
npm run dev               # starts the app on http://localhost:3000
```

Open **http://localhost:3000** → you'll land on the login screen, then the dashboard.

---

## 🔑 Environment Variables

**`backend/.env`**
```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
DIRECT_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
BACKEND_PORT=5000
JWT_SECRET="change-me-in-production"
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

> In production, point `NEXT_PUBLIC_API_URL` at your deployed backend URL — **not** `localhost`.

---

## 👤 Roles & Access

| Capability | ADMIN | HR | EMPLOYEE |
| --- | :---: | :---: | :---: |
| My Dashboard / Profile / Attendance / Apply Leave | ✅ | ✅ | ✅ |
| Admin Panel · Employee list · Onboard | ✅ | ✅ | — |
| Attendance records (all employees) | ✅ | ✅ | — |
| Leave approvals | ✅ | ✅ | — |
| Salary Info (view & edit) | ✅ | ✅ | — |

Access is enforced by one shared guard on both ends — `requireRole(...roles)` on the
backend and `useHasRole(...)` / `<RoleGate>` on the frontend.

---

## 📡 API Reference

All routes require a `Bearer <token>` header (issued by `POST /api/auth/login`).

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | public | Log in, receive JWT |
| `POST` | `/api/auth/create-employee` | ADMIN/HR | Onboard an employee |
| `GET`  | `/api/auth/preview-id` | ADMIN/HR | Preview auto-generated Employee ID |
| `GET`  | `/api/auth/me` | auth | Current user |
| `GET`  | `/api/attendance/:userId` | auth | Today / weekly / monthly bundle |
| `POST` | `/api/attendance/checkin` · `/checkout` | auth | Check in / out |
| `GET`  | `/api/admin/attendance` | ADMIN/HR | All-employee attendance (date filter) |
| `GET`  | `/api/users` | ADMIN/HR | Employee list + today's status |
| `GET`  | `/api/users/:id` | owner / ADMIN/HR | Full profile |
| `PUT`  | `/api/users/:id/private-info` | owner / ADMIN/HR | Update private info |
| `GET`  | `/api/salary-structure/:userId` | ADMIN/HR | Latest salary structure |
| `PUT`  | `/api/salary-structure/:userId` | ADMIN/HR | Create / update salary structure |
| `GET`  | `/api/leaves/me` | auth | Own leaves |
| `GET`  | `/api/leaves?status=PENDING` | ADMIN/HR | All leaves |
| `POST` | `/api/leaves` | auth | Apply for leave |
| `PATCH`| `/api/leaves/:id/status` | ADMIN/HR | Approve / reject (+ comment) |

---

## 🌱 Seed Data

`backend/prisma/seed.js` enriches the primary employees (`EMP-0001`…`EMP-0005`) with
realistic profile details and a full **salary structure** (Basic, HRA, allowances, PF,
professional tax). It's idempotent and leaves existing users, attendance, and leave
records intact. Re-run anytime:

```bash
cd backend && node prisma/seed.js
```

---

## 📦 Deployment Notes

- Deploy the **frontend** and **backend separately** — the backend is a long-running
  Express server (host it on Render / Railway / Fly), the frontend on Vercel.
- On Vercel, set the project **Root Directory to `frontend`** and add the
  `NEXT_PUBLIC_API_URL` environment variable pointing to your live backend.
- Run `prisma generate` + `prisma db push` against your production database before first boot.

---

<div align="center">

Built for the **Odoo × ADAMAS** hackathon 🚀

</div>
