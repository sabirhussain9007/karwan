import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectToDatabase from "./mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { syncOAuthUser } from "@/lib/auth/syncOAuthUser";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
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
              "This account uses Google sign-in. Please continue with Google."
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
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await syncOAuthUser({
            email: user.email,
            name: user.name,
            image: user.image,
          });
          return true;
        } catch (error) {
          console.error("Google sign-in sync error:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user && account) {
        if (account.provider === "google") {
          await connectToDatabase();
          const dbUser = await User.findOne({
            email: user.email?.toLowerCase().trim(),
          });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role || "user";
          }
        } else {
          token.id = user.id;
          token.role = (user as { role?: string }).role ?? "user";
        }
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
