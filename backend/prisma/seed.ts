import { PrismaClient, Role, AttendanceStatus, LeaveType, LeaveStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@axerfish.hrms" },
    update: {},
    create: {
      employeeId: "EMP-0001",
      name: "Asha Verma",
      email: "admin@axerfish.hrms",
      passwordHash: password,
      role: Role.ADMIN,
      department: "Human Resources",
      jobTitle: "HR Manager",
      manager: null,
      location: "Mumbai HQ",
      phone: "9876500001",
      isEmailVerified: true,
      dateOfJoining: new Date("2022-03-01"),
    },
  });

  const employeeData = [
    { employeeId: "EMP-0002", name: "Rohan Mehta", email: "rohan@axerfish.hrms", jobTitle: "Frontend Engineer" },
    { employeeId: "EMP-0003", name: "Priya Nair", email: "priya@axerfish.hrms", jobTitle: "Backend Engineer" },
    { employeeId: "EMP-0004", name: "Karan Shah", email: "karan@axerfish.hrms", jobTitle: "QA Engineer" },
    { employeeId: "EMP-0005", name: "Sneha Rao", email: "sneha@axerfish.hrms", jobTitle: "UI/UX Designer" },
  ];

  const employees = [];
  for (const e of employeeData) {
    const user = await prisma.user.upsert({
      where: { email: e.email },
      update: {},
      create: {
        employeeId: e.employeeId,
        name: e.name,
        email: e.email,
        passwordHash: password,
        role: Role.EMPLOYEE,
        department: "Engineering",
        jobTitle: e.jobTitle,
        manager: admin.name,
        location: "Mumbai HQ",
        phone: "98765" + e.employeeId.slice(-5),
        isEmailVerified: true,
        dateOfJoining: new Date("2023-06-15"),
      },
    });
    employees.push(user);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Rohan: checked in today, present
  await prisma.attendance.upsert({
    where: { userId_date: { userId: employees[0].id, date: today } },
    update: {},
    create: {
      userId: employees[0].id,
      date: today,
      status: AttendanceStatus.PRESENT,
      checkIn: new Date(new Date().setHours(9, 15, 0, 0)),
    },
  });

  // Priya: no attendance row today (shows as "absent, no leave applied")

  // Karan: on approved leave today
  await prisma.leave.create({
    data: {
      userId: employees[2].id,
      type: LeaveType.SICK,
      startDate: today,
      endDate: today,
      remarks: "Fever, resting at home",
      status: LeaveStatus.APPROVED,
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
  });

  // Sneha: pending leave request awaiting admin approval
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekEnd = new Date(nextWeek);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 2);

  await prisma.leave.create({
    data: {
      userId: employees[3].id,
      type: LeaveType.PAID,
      startDate: nextWeek,
      endDate: nextWeekEnd,
      remarks: "Family function out of town",
      status: LeaveStatus.PENDING,
    },
  });

  // Rohan: a past approved leave, for "recent activity" history
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 5);
  await prisma.leave.create({
    data: {
      userId: employees[0].id,
      type: LeaveType.PAID,
      startDate: lastWeek,
      endDate: lastWeek,
      remarks: "Personal errand",
      status: LeaveStatus.APPROVED,
      reviewedById: admin.id,
      reviewedAt: lastWeek,
    },
  });

  // Current payroll row for each employee
  for (const emp of employees) {
    await prisma.payroll.create({
      data: {
        userId: emp.id,
        baseSalary: 60000,
        allowances: 8000,
        deductions: 3000,
        netSalary: 65000,
        effectiveDate: new Date("2024-01-01"),
      },
    });
  }

  console.log("Seed complete:");
  console.log(`  Admin login: ${admin.email} / Password123!`);
  employees.forEach((e) => console.log(`  Employee login: ${e.email} / Password123!`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });