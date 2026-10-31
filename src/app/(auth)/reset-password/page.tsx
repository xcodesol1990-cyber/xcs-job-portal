import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { AuthCard } from "@/components/ui/auth-card";

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Create new password"
      subtitle="Choose a secure password with at least 8 characters"
    >
      <Suspense fallback={<div className="text-center text-sm text-zinc-500">Loading form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}

