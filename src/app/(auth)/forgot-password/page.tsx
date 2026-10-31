import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { AuthCard } from "@/components/ui/auth-card";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we'll send you instructions to reset your account"
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}

