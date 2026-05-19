import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "./mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { applyNextAuthUrl } from "@/lib/auth/nextAuthUrl";

applyNextAuthUrl();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "test@example.com",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        try {
          await connectToDatabase();

          if (!credentials?.email || !credentials?.password) {
            throw new Error("Invalid credentials");
          }

          const user = await User.findOne({
            email: credentials.email.toLowerCase().trim(),
          }).select("+password");

          if (!user) {
            throw new Error("User not found");
          }

          if (!user.password) {
            throw new Error(
              "No password set for this account. Use forgot password to set one."
            );
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordCorrect) {
            throw new Error("Invalid email or password");
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || "user",
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "user";
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }

      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
