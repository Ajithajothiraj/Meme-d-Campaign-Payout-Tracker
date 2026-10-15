
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: "brand" | "creator";
  };
}

export function protect(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Authentication token is required"
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      message: "JWT_SECRET is missing"
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as {
      userId: string;
      role: "brand" | "creator";
    };

    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();
  } catch {
    res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}


export function allowRoles(...roles: ("brand" | "creator")[]) {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        message: "Authentication required"
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        message: "You do not have permission to access this route"
      });
      return;
    }

    next();
  };
}
