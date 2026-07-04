import { PrismaClient, LeaveType, LeaveStatus, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.leave.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.user.deleteMany();

  const hr = await prisma.user.create({
    data: {
      name: "Meera Kulkarni",
      email: "meera.hr@company.com",
      role: Role.HR,
      designation: "HR Manager",
      department: "Human Resources",
    },
  });

  const parth = await prisma.user.create({
    data: {
      name: "Parth Shah",
      email: "parth.shah@company.com",
      role: Role.EMPLOYEE,
      designation: "Software Engineer Intern",
      department: "Engineering",
    },
  });

  const riya = await prisma.user.create({
    data: {
      name: "Riya Desai",
      email: "riya.desai@company.com",
      role: Role.EMPLOYEE,
      designation: "Frontend Developer",
      department: "Engineering",
    },
  });

  const arjun = await prisma.user.create({
    data: {
      name: "Arjun Mehta",
      email: "arjun.mehta@company.com",
      role: Role.EMPLOYEE,
      designation: "QA Engineer",
      department: "Engineering",
    },
  });

  await prisma.payroll.createMany({
    data: [
      { userId: parth.id, basic: 35000, allowances: 8000, deductions: 3200 },
      { userId: riya.id, basic: 42000, allowances: 9500, deductions: 4100 },
      { userId: arjun.id, basic: 38000, allowances: 7000, deductions: 3500 },
      { userId: hr.id, basic: 55000, allowances: 12000, deductions: 6000 },
    ],
  });

  await prisma.leave.createMany({
    data: [
      {
        userId: parth.id,
        type: LeaveType.PAID,
        startDate: new Date("2026-07-10"),
        endDate: new Date("2026-07-12"),
        days: 3,
        remarks: "Family function out of town.",
        status: LeaveStatus.PENDING,
      },
      {
        userId: parth.id,
        type: LeaveType.SICK,
        startDate: new Date("2026-06-02"),
        endDate: new Date("2026-06-02"),
        days: 1,
        remarks: "Fever.",
        status: LeaveStatus.APPROVED,
        hrComment: "Get well soon.",
      },
      {
        userId: riya.id,
        type: LeaveType.UNPAID,
        startDate: new Date("2026-06-20"),
        endDate: new Date("2026-06-21"),
        days: 2,
        remarks: "Personal work.",
        status: LeaveStatus.REJECTED,
        hrComment: "Sprint deadline conflict, please reschedule.",
      },
      {
        userId: arjun.id,
        type: LeaveType.PAID,
        startDate: new Date("2026-07-15"),
        endDate: new Date("2026-07-16"),
        days: 2,
        remarks: "Wedding in the family.",
        status: LeaveStatus.PENDING,
      },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
