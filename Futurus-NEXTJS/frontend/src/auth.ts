import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import axios from "axios";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // If we already verified 2FA, the frontend will pass the user data to bypass the password check
        const creds = credentials as any;
        if (creds?.alreadyVerified === 'true' && creds?.user) {
          try {
            const user = JSON.parse(creds.user as string);
            return {
              id: user.id.toString(),
              name: user.username,
              email: user.email,
              image: user.image,
              accessToken: user.access_token,
            };
          } catch {
            return null;
          }
        }

        try {
          const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
          const res = await axios.post(
            `${apiUrl}/auth/login`,
            {
              username: credentials?.username,
              password: credentials?.password,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          // The backend uses a TransformInterceptor that wraps data in { success, message, data }
          const resData = res.data;
          const user = resData?.success && resData?.data ? resData.data : resData;

          // If the backend says 2FA is required, we return null but with a specific message could be tricky
          // For simplicity, we'll return null here and handle the 2FA logic in the login page components
          if (user && user.access_token) {
            const userData = user.user || user;
            return {
              id: userData.id.toString(),
              name: userData.username,
              email: userData.email,
              image: userData.image,
              accessToken: user.access_token,
            };
          }
          return null;
        } catch {
          // If the response is 2FA required (handled by the controller returning 200 but no token)
          // or if it's handled via a specific status code.
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).user.id = token.id;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
