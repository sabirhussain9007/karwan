"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { isDisplayableAvatar } from "@/lib/avatar-utils";

type UserProfileContextValue = {
  avatar: string;
  name: string;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [avatar, setAvatar] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const refreshProfile = useCallback(async () => {
    if (status !== "authenticated") {
      setAvatar("");
      setName("");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/profile");
      if (!res.ok) return;

      const data = await res.json();
      setName(data.name ?? "");
      setAvatar(isDisplayableAvatar(data.avatar) ? data.avatar : "");
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return (
    <UserProfileContext.Provider
      value={{ avatar, name, loading, refreshProfile }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile must be used within UserProfileProvider");
  }
  return context;
}
