import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | PERTAMINA HSE Training Center",
  description: "Login to PERTAMINA HSE Training Center",
};

export default function SignIn() {
  return <SignInForm />;
}
