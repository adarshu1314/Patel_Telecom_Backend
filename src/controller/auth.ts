import { Request, Response } from "express";
import prisma from "../utils/dbConnection";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


export const loginCustomer = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: { email },
      select: {
        customer_id: true,
        username: true,
        email: true,
        password: true,
      },
    });
    console.log(customer);
    console.log(customer?.password);
    console.log(password);

    if (!customer || !(await bcrypt.compare(password, customer.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ✅ Prisma → DTO
    const userDto: Request["user"] = {
      userId: customer.customer_id,
      email: customer.email,
      name: customer.username,
      role: "USER",
    };

    const token = jwt.sign(
      userDto,
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userDto,
    });

  } catch (error) {
    console.error("Customer login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    console.log("Request :" + req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await prisma.admin.findFirst({
      where: { email },
      select: {
        admin_id: true,
        username: true,
        email: true,
        password: true,
        roles: true,
      },
    });
    console.log(admin);
    console.log(password);
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ✅ Determine role from roles array
    const role: "ADMIN" | "SUPERADMIN" =
      admin.roles.includes("SUPERADMIN") ? "SUPERADMIN" : "ADMIN";

    const adminDto: Request["user"] = {
      userId: admin.admin_id,
      email: admin.email!,
      name: admin.username,
      role,
    };

    const token = jwt.sign(
      adminDto,
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: adminDto,
    });

  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // This will be protected by middleware in the future
    // For now, it's public
    res.json({
      success: true,
      message: 'Profile endpoint - will be protected by middleware'
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}