import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that REQUIRE auth. Everything else is public — including the new
// awareness layer (/discover, /result, /pledge, /city, /chat, /compare, /aha).
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/activities(.*)",
  "/goals(.*)",
  "/challenges(.*)",
  "/coach(.*)",
  "/simulator(.*)",
  "/profile(.*)",
  "/admin(.*)",
  "/api/admin(.*)",
  "/api/export(.*)",
  "/api/notifications(.*)",
  "/api/ocr(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
