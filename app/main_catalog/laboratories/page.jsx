import { requirePageUser } from "@/lib/auth";
import PageChrome from "@/components/PageChrome";
import LoadScreen from "@/components/LoadScreen";
import ConfirmPopup from "@/components/ConfirmPopup";
import CreateAnalisisPopup from "@/components/CreateAnalisisPopup";
import LaboratoriesAgGrid from "@/components/LazyLaboratoriesAgGrid";
import Link from "next/link"

export const metadata = {
  title: "IFC | Laboratorios"
};

export default async function LaboratoriesPage() {
  const { user } = await requirePageUser();

  return (
    <>
      <PageChrome userEmail={user.email ?? "[...]"}>
        <div id="bottomTables" className="card">
          <div className="dashboard-grid grid_01">
            <div className="card">
              <input className="search_at_table" id="search" placeholder="Buscar..." />
            </div>
            <button id="add-lab" className="func_button">
              A&ntilde;adir laboratorio
            </button>
            <Link id="returnHome" href="/main_catalog" className="func_button">
              Tablero analisis
            </Link>
          </div>
          <div className="dashboard-grid">
            <LaboratoriesAgGrid />
          </div>
        </div>
      </PageChrome>
      <LoadScreen />
      <ConfirmPopup />
      <CreateAnalisisPopup />
    </>
  );
}









