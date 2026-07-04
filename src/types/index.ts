export type Role = "EMPLOYEE" | "HR";
export type LeaveType = "PAID" | "SICK" | "UNPAID";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: Role;
  designation: string | null;
  department: string | null;
}

export interface LeaveDTO {
  id: string;
  userId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  remarks: string | null;
  status: LeaveStatus;
  hrComment: string | null;
  createdAt: string;
  updatedAt: string;
  user?: UserDTO;
}

export interface PayrollDTO {
  id: string;
  userId: string;
  basic: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  updatedAt: string;
  user?: UserDTO;
}

export interface LeaveBalanceDTO {
  type: LeaveType;
  allocated: number;
  used: number;
  pending: number;
  remaining: number;
}
