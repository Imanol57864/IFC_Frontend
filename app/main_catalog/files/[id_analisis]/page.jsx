import { notFound } from "next/navigation";
import { requirePageUser } from "@/lib/auth";
import PageChrome from "@/components/PageChrome";
import LoadScreen from "@/components/LoadScreen";
import ConfirmPopup from "@/components/ConfirmPopup";
import AddFilePopup from "@/components/AddFilePopup";
import FilesAgGrid from "@/components/LazyFilesAgGrid";
import BackToDashboard from "@/components/BackToDashboard";
import { Panel, PanelToolbar } from "@/components/Panel";
import { canUseIam } from "@/lib/iam";

export const metadata = {
  title: "IFC | Archivos"
};

export default async function FilesPage({ params }) {
  const { supabase, user, areaId } = await requirePageUser();
  if (!canUseIam("files", "access_view", areaId)) notFound();
  const canViewAnalisis = canUseIam("analisis", "access_view", areaId);

  const { id_analisis: idAnalisis } = await params;
  const { data, error } = await supabase.from("catAnalisis").select("codigo_completo").eq("id_analisis", idAnalisis);
  if (error || !data?.length) notFound();
  const codigoDisplay = data[0].codigo_completo;

  return (
    <>
      <PageChrome userEmail={user.email ?? "[...]"} areaId={areaId}>
        <Panel className="page-intro">
          <PanelToolbar columns="panel-grid-3" className="mb-0">
            <p className="notice-card">
              &bull; Por seguridad los archivos estarán disponibles durante 10 minutos.
              <br />
              &bull; Al terminar el tiempo, recarga la página para seguir consultando.
              <br />
              &bull; Para compartirlos, descárgalos y envíalos por otro medio.
            </p>
            <h3 id="id_analisis_div" className="analysis-id-card">
              {codigoDisplay}
            </h3>
            {canViewAnalisis && <BackToDashboard/>}
          </PanelToolbar>
        </Panel>

        <Panel id="bottomTables">
          <PanelToolbar columns="panel-grid-2">
            <div className="panel-control">
              <input className="search_at_table" id="search" placeholder="Buscar..." />
            </div>
            <button id="add-file" className="btn-primary">
              A&ntilde;adir archivo
            </button>
          </PanelToolbar>
          <div className="table-wrap">
            <FilesAgGrid idAnalisis={idAnalisis} />
          </div>
        </Panel>
      </PageChrome>
      <LoadScreen />
      <ConfirmPopup />
      <AddFilePopup idAnalisis={codigoDisplay} />
    </>
  );
}
