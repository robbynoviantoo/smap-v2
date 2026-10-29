import { Suspense, type ReactNode } from "react";
import SouvenirWorkspace from "@/components/souvenirs/SouvenirWorkspace";

export default function SouvenirLayout({ children }: { children: ReactNode }) {
  return (
    <SouvenirWorkspace>
      <Suspense>{children}</Suspense>
    </SouvenirWorkspace>
  );
}
