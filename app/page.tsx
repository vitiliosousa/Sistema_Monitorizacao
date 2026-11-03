import type { Metadata } from "next";
import { VisaoGeral } from "@/components/paginas/VisaoGeral";

export const metadata: Metadata = { title: "Visão geral · Sistema híbrido de energia" };

export default function Page() {
  return <VisaoGeral />;
}
