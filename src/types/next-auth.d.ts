import { SessionProviderProps } from "next-auth/react";

declare module "next-auth/react" {
  export declare function SessionProvider({
    children,
    ...props
  }: SessionProviderProps): React.ReactNode;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
  }
}
