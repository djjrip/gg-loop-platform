import { User } from "@shared/schema";

declare global {
  namespace Express {
    interface Request {
      partnerId?: string;
      dbUser?: User;
    }
  }
}

export {};
