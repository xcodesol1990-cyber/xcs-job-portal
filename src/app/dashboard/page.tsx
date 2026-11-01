import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardRedirectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const roles = session.user.roles ?? [];

  if (roles.includes("ADMIN")) {
    redirect("/admin");
  }
  if (roles.includes("CLIENT")) {
    redirect("/client");
  }
  if (roles.includes("FREELANCER")) {
    redirect("/freelancer");
  }

  redirect("/client");
}
