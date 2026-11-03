import type { Metadata } from "next";
import { PaginaEnergia } from "@/components/paginas/PaginaEnergia";

export const metadata: Metadata = { title: "Energia · Sistema híbrido de energia" };

export default function Page() {
  return <PaginaEnergia />;
}
