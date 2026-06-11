import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: ({ token, req }) => {
      if (!token) {
        return false;
      }

      if (req.nextUrl.pathname.startsWith("/admin")) {
        return token.role === "ADMIN";
      }

      if (req.nextUrl.pathname.startsWith("/api/admin")) {
        return token.role === "ADMIN";
      }

      return true;
    },
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/signals/:path*",
    "/performance/:path*",
    "/pricing/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
