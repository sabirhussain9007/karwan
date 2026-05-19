"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { isDisplayableAvatar } from "@/lib/avatar-utils";

const sizeClasses = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-24 w-24 text-3xl",
} as const;

type UserAvatarProps = {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: keyof typeof sizeClasses;
  className?: string;
};

export default function UserAvatar({
  src,
  name,
  email,
  size = "sm",
  className,
}: UserAvatarProps) {
  const initial =
    name?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase() || "?";

  const sizeClass = sizeClasses[size];

  if (isDisplayableAvatar(src)) {
    const isLocal = src!.startsWith("/");

    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-full bg-stone-800",
          sizeClass,
          className
        )}
      >
        {isLocal ? (
          <img
            src={src!}
            alt={name ? `${name} avatar` : "User avatar"}
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src={src!}
            alt={name ? `${name} avatar` : "User avatar"}
            fill
            className="object-cover"
            unoptimized
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-amber-600 font-bold text-white",
        sizeClass,
        className
      )}
    >
      {initial}
    </div>
  );
}
