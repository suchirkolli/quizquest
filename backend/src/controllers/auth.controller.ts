import { Request, Response } from "express";

export const registerUser = (req: Request, res: Response) => {
  const { email, password, displayName, role } = req.body;

  res.status(201).json({
    message: "Register route working",
    user: {
      email,
      displayName,
      role,
    },
  });
};

export const loginUser = (req: Request, res: Response) => {
  const { email } = req.body;

  res.status(200).json({
    message: "Login route working",
    token: "dummy-jwt-token",
    user: {
      email,
    },
  });
};