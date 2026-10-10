export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/studio", "/studio/:path*"],
};
