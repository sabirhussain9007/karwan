"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import { UserProfileProvider } from "@/context/UserProfileContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UserProfileProvider>{children}</UserProfileProvider>
    </SessionProvider>
  );
}
