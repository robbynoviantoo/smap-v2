import OnboardingForm from "@/components/auth/OnboardingForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding & Ganti Password | PERTAMINA HSE Training Center",
  description: "Lengkapi data dan ganti password akun pertama kali",
};

export default function OnboardingPage() {
  return <OnboardingForm />;
}
