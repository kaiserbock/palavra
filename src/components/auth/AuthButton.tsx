"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { UserCircle2, LogOut, LogIn } from "lucide-react";

export function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <UserCircle2 className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">{session.user?.name}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut()}
          className="h-8 px-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Sign out</span>
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => signIn()}
      className="h-8"
    >
      <LogIn className="h-4 w-4 mr-2" />
      Sign in
    </Button>
  );
}
