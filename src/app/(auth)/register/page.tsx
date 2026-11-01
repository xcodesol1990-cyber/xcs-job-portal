import { RegisterForm } from "@/components/forms/register-form";
import { AuthCard } from "@/components/ui/auth-card";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your WorkWasl account"
      subtitle="Join top clients and independent professionals worldwide"
    >
      <RegisterForm />
    </AuthCard>
  );
}
