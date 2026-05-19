import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { applyNextAuthUrl } from "@/lib/auth/nextAuthUrl";

applyNextAuthUrl();

export const dynamic = "force-dynamic";

const handler = NextAuth(authOptions);

type RouteContext = {
  params: Promise<{ nextauth?: string | string[] }>;
};

/** Next.js may pass catch-all params as string[] or a single combined string. */
function parseNextAuthSegments(
  raw: string | string[] | undefined
): string[] {
  if (!raw) return [];
  const parts = Array.isArray(raw) ? raw : [raw];
  return parts.flatMap((segment) => segment.split("/")).filter(Boolean);
}

async function authRoute(req: NextRequest, context: RouteContext) {
  const params = await context.params;
  const nextauth = parseNextAuthSegments(params.nextauth);

  return handler(req, {
    params: Promise.resolve({ nextauth }),
  });
}

export function GET(req: NextRequest, context: RouteContext) {
  return authRoute(req, context);
}

export function POST(req: NextRequest, context: RouteContext) {
  return authRoute(req, context);
}
