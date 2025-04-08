/* eslint-disable */
import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
  }

  interface Session {
    accessToken: string;
    user: {
      id: string;
      name: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    accessTokenExpires: number;
    refreshToken: string;
  }
}
