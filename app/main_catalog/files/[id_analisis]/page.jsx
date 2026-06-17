import { notFound } from "next/navigation";
import { requirePageUser } from "@/lib/auth";
import PageChrome from "@/components/PageChrome";
import LoadScreen from "@/components/LoadScreen";
import ConfirmPopup from "@/components/ConfirmPopup";
import AddFilePopup from "@/components/AddFilePopup";
import FilesAgGrid from "@/components/LazyFilesAgGrid";
import Link from "next/link";

export const metadata = {
  title: "IFC | Archivos"
};

export default async function FilesPage({ params }) {
  const { id_analisis: idAnalisis } = await params;
  const { supabase, user } = await requirePageUser();

  const { data, error } = await supabase
    .from("catAnalisis")
    .select("id_analisis")
    .eq("id_analisis", idAnalisis);

  if (error || !data?.length) notFound();

  return (
    <>
      <PageChrome userEmail={user.email ?? "[...]"}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="dashboard-grid grid_01" style={{ marginBottom: 0 }}>
            <p className="card search_at_table" style={{ lineHeight: 1.3 }}>
              &bull; Por seguridad los archivos estarán disponibles durante 10 minutos.
              <br />
              &bull; Al terminar el tiempo, recarga la pagina para seguir consultando.
              <br />
              &bull; Para compartirlos, descarguelos y envielos por algun otro medio.
            </p>
            <h3 id="id_analisis_div" style={{ alignSelf: "center", height: "100%", fontSize: 24 }} className="card">
              {idAnalisis}
            </h3>
            <Link id="returnHome" href="/main_catalog" className="func_button">
              Regresar al tablero
            </Link>
          </div>
        </div>

        <div id="bottomTables" className="card">
          <div className="dashboard-grid grid_02">
            <div className="card">
              <input className="search_at_table" id="search" placeholder="Buscar..." />
            </div>
            <button id="add-file" className="func_button">
              A&ntilde;adir archivo
            </button>
          </div>
          <div className="dashboard-grid">
            <FilesAgGrid idAnalisis={idAnalisis} />
          </div>
        </div>
      </PageChrome>
      <LoadScreen />
      <ConfirmPopup />
      <buttonddFilePopup idAnalisis={idAnalisis} />
    </>
  );
}









