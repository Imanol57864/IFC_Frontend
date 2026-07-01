import { requirePageUser } from "@/lib/auth";
import PageChrome from "@/components/PageChrome";
import LoadScreen from "@/components/LoadScreen";
import ConfirmPopup from "@/components/ConfirmPopup";
import LaboratoriesAgGrid from "@/components/LazyLaboratoriesAgGrid";
import BackToDashboard from "@/components/BackToDashboard";
import { Panel, PanelToolbar } from "@/components/Panel";

export const metadata = {
  title: "IFC | Laboratorios"
};

export default async function LaboratoriesPage() {
  const { user, areaId } = await requirePageUser();
  
  return (
    <>
      <PageChrome userEmail={user.email ?? "[...]"} areaId={areaId}>
        <Panel id="bottomTables">
          <PanelToolbar columns="panel-grid-3">
            <div className="panel-control">
              <input className="search_at_table" id="search" placeholder="Buscar..." />
            </div>
            <button id="add-lab" className="btn-primary">
              A&ntilde;adir laboratorio
            </button>
            <BackToDashboard label="Tablero análisis" />
          </PanelToolbar>
          <div className="table-wrap">
            <LaboratoriesAgGrid />
          </div>
        </Panel>
      </PageChrome>
      <LoadScreen />
      <ConfirmPopup />
    </>
  );
}
