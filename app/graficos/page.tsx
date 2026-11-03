import type { Metadata } from "next";
import { PaginaGraficos } from "@/components/paginas/PaginaGraficos";

export const metadata: Metadata = { title: "Gráficos · Sistema híbrido de energia" };

export default function Page() {
  return <PaginaGraficos />;
}
