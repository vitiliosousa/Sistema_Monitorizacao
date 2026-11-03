import type { Metadata } from "next";
import { PaginaControlo } from "@/components/paginas/PaginaControlo";

export const metadata: Metadata = { title: "Controlo · Sistema híbrido de energia" };

export default function Page() {
  return <PaginaControlo />;
}
