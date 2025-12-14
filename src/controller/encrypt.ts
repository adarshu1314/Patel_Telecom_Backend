import { Request, Response } from "express";
import bcrypt from "bcryptjs";

export const encryptText = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    const saltRounds = 10;
    const hashedText = await bcrypt.hash(text, saltRounds);

    res.json({
      success: true,
      original: text,
      hashed: hashedText,
    });

  } catch (error) {
    console.error("Encrypt error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};