import { User } from "@shared/schema";
import 'express-session';

declare global {
  namespace Express {
    interface Request {
      partnerId?: string;
      dbUser?: User;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    loginNotification?: {
      streak: number;
      coinsAwarded: number;
      badgeUnlocked?: string;
      timestamp: number;
    };
    twitchState?: string;
  }
}

export {};
