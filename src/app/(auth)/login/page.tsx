import { LoginForm } from "@/components/forms/login-form";
import { AuthCard } from "@/components/ui/auth-card";

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back to WorkNest"
      subtitle="Sign in to your account or pick a demo persona below"
    >
      <LoginForm />
    </AuthCard>
  );
}
