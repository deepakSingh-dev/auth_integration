import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { authConfig } from "./auth.config";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    // Email/Password Authentication via API
    CredentialsProvider({
      credentials: {},
      async authorize({ email, password }) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        console.log("Making request to:", `${apiUrl}/api/auth/login`);
    
        try {
          const response = await fetch(`${apiUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
    
          if (!response.ok) {
            console.error("Failed to fetch user:", response.statusText);
            return null;
          }
          if (!user) {
            throw new Error("User not found.");
          }
          const { user, token, refreshToken } = await response.json();
          return { user, token, refreshToken };
        } catch (error) {
          console.error("Error during user authorization:", error);
          throw new Error("Internal server error.");
        }
      },
    }),
    

    //  Google Authentication
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    //  GitHub Authentication
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      console.log("🔍 JWT Callback Triggered", { token, user, account });

      //  OAuth-based login (Google/GitHub)
      if (account && user) {
        token.sub = user.id || user.sub;
        token.email = user.email;
        token.name = user.name;
        token.provider = account.provider;
  
        //  Fetching token from backend for OAuth users
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/oauth-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email, name: user.name, provider: account.provider }),
          });
  
          if (!response.ok) throw new Error("Failed to fetch OAuth token");
  
          const { token: accessToken } = await response.json();
          console.log("OAuth Token Received:", accessToken);
          token.accessToken = accessToken;
        } catch (error) {
          console.error("OAuth Token Fetch Error:", error);
        }
      }
  
      // Email/Password login
      if (user?.user) {
        token.sub = user.user.id;
        token.email = user.user.email;
        token.name = user.user.name;
        token.dataStatus = user.user?.dataStatus;
        token.accessToken = user.token;
        token.business = user.user?.business || undefined;
      }
  
      // Handle session updates
      if (trigger === "update" && session) {
        token.business = session.business;
      }
  
      console.log("🔑 Final Token in JWT Callback:", token);
      return token;
    },
  
    async session({ session, token }) {
      console.log("📡 Creating session from token:", token);
  
      if (token?.accessToken) {
        session.user.id = token.sub;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.dataStatus = token.dataStatus;
        session.business = token.business;
        session.accessToken = token.accessToken;
      }
  
      console.log("Final Session:", session);
      return session;
    },
  },  

  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
});
