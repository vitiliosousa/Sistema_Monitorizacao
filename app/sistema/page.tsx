import type { Metadata } from "next";
import { PaginaSistema } from "@/components/paginas/PaginaSistema";

export const metadata: Metadata = { title: "Sistema · Sistema híbrido de energia" };

export default function Page() {
  return <PaginaSistema />;
}
