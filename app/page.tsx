import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { LandingPage } from "@/components/landing/LandingPage";

export default async function RootPage() {
  const session = await getSession();

  // Already logged in — send to the right place
  if (session.isLoggedIn) {
    if (session.workspace.kind === "platform") redirect("/platform");
    else redirect("/app");
  }

  return <LandingPage />;
}
