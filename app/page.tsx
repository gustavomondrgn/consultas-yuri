import { redirect } from "next/navigation";

// A raiz de /consultas não tem página própria — as consultas vivem em
// /consultas/<slug> (ex.: /consultas/compre-tempo). Quem cai aqui vai pro direct.
export default function Home() {
  redirect("https://instagram.com/oyuridosanjos");
}
