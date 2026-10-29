import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SignUp Page",
  description: "Sistem Manajemen Aset dan Penunjang Pertamina HSE Training Center",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
