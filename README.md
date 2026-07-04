# HRMS · Employee Leave & Payroll Module

A hackathon-ready module built with Next.js 15 (App Router), TypeScript, Tailwind CSS,
Prisma, and Neon Postgres.

## 1. Project Structure

```
hrms-leave-payroll/
├─ prisma/
│  ├─ schema.prisma          # User, Leave, Payroll models
│  └─ seed.ts                 # Sample data
├─ src/
│  ├─ app/
│  │  ├─ api/
│  │  │  ├─ users/route.ts
│  │  │  ├─ leaves/route.ts
│  │  │  ├─ leaves/[id]/route.ts
│  │  │  ├─ leaves/balance/route.ts
│  │  │  ├─ payroll/route.ts
│  │  │  └─ payroll/[userId]/route.ts
│  │  ├─ employee/leave/page.tsx
│  │  ├─ employee/payroll/page.tsx
│  │  ├─ hr/leave/page.tsx
│  │  ├─ hr/payroll/page.tsx
│  │  ├─ layout.tsx / page.tsx / providers.tsx / globals.css
│  ├─ components/
│  │  ├─ ui/                  # button, input, textarea, select, dialog, table, badge, card, popover, date-range-picker, skeleton, label
│  │  ├─ layout/navbar.tsx
│  │  ├─ leave/                # apply form, history table, balance card, status badge
│  │  ├─ hr/                   # leave table, action dialog, payroll table, edit salary dialog
│  │  └─ payroll/salary-card.tsx
│  ├─ context/user-context.tsx # simulated "logged in user" switcher
│  ├─ lib/                     # prisma client, utils, zod schemas
│  └─ types/index.ts
├─ .env.example
└─ package.json
```

## 2. Important Assumption: Authentication

The requirements didn't specify an auth flow, so this module ships with a **user
switcher** in the navbar instead of a login screen. It reads all seeded users from
`/api/users` and lets you switch between an HR account and employee accounts to
demo both roles instantly. Swap `useCurrentUser()` in `src/context/user-context.tsx`
for real session logic (NextAuth, Clerk, etc.) when you wire up authentication —
every API route already expects a `userId`, so the rest of the app doesn't change.

## 3. Terminal Commands (Installation Order)

```bash
# 1. Create the project folder and copy in all files from this delivery,
#    OR scaffold fresh and then overlay these files:
npx create-next-app@latest hrms-leave-payroll --typescript --tailwind --app --src-dir --no-eslint
cd hrms-leave-payroll

# 2. Install dependencies (if you started from scratch, otherwise `npm install` picks up package.json)
npm install @prisma/client @hookform/resolvers @radix-ui/react-dialog @radix-ui/react-label \
  @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-slot @radix-ui/react-tabs \
  class-variance-authority clsx date-fns lucide-react react-day-picker react-hook-form \
  sonner tailwind-merge zod

npm install -D prisma tsx autoprefixer

# 3. Set up environment variables
cp .env.example .env
# then paste your Neon connection strings into .env

# 4. Generate Prisma client & push schema to Neon
npx prisma generate
npx prisma db push

# 5. Seed sample data
npm run db:seed

# 6. Run the app
npm run dev
```

App runs at **http://localhost:3000** — it auto-redirects to the leave page for
whichever user is selected in the navbar switcher.

## 4. Environment Variables (`.env`)

```
DATABASE_URL="postgresql://<user>:<password>@<neon-host>/<db>?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://<user>:<password>@<neon-host>/<db>?sslmode=require"
```

Get both from your Neon project dashboard → Connection Details (pooled + direct).

## 5. Sample Seed Data

`prisma/seed.ts` creates:
- **1 HR user** — Meera Kulkarni
- **3 employees** — Parth Shah, Riya Desai, Arjun Mehta
- Payroll rows for all 4 users
- 4 sample leave requests across Pending / Approved / Rejected statuses

Re-run anytime with `npm run db:seed` (it clears and reseeds Leave/Payroll/User tables).

## 6. Feature Notes

- **Apply Leave**: type select (Paid/Sick/Unpaid), two-month range calendar picker,
  remarks textarea (min 10 chars), a **review summary dialog** before final submit,
  toast confirmation, and automatic leave-history + balance refresh.
- **Leave Balance**: computed server-side from allocated (Paid: 12, Sick: 8) minus
  approved and pending days — tune `LEAVE_ALLOCATION` in `src/lib/validations/leave.ts`.
- **HR Leave Approval**: search by employee name, filter by status/type,
  approve/reject with an optional comment dialog, and the table updates instantly
  (no full page reload) via local state patching after each PATCH call.
- **Employee Payroll**: read-only breakdown card (Basic, Allowances, Deductions,
  Net Salary computed live, never stored to avoid staleness).
- **HR Payroll**: table of all employees with an edit dialog that live-previews the
  projected net salary as HR types.
- **UX**: loading skeletons on every data fetch, empty states for no leaves/no
  payroll, Zod + React Hook Form validation with inline error messages, and a
  light corporate theme (white/slate background, blue primary accent, rounded-lg,
  soft shadows) defined via CSS variables in `globals.css`.

## 7. Extending

- Swap the day-count calculation in `src/app/api/leaves/route.ts` if you want to
  exclude weekends/holidays (currently counts calendar days inclusive).
- Add role-based route protection once real auth is in place (middleware.ts
  checking session role before allowing `/hr/*` routes).
