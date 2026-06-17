import { requirePageUser } from "@/lib/auth";
import { queryLabsNames, queryStaticInfo } from "@/lib/catalog";
import PageChrome from "@/components/PageChrome";
import LoadScreen from "@/components/LoadScreen";
import ConfirmPopup from "@/components/ConfirmPopup";
import EditDescPopup from "@/components/EditDescPopup";
import CatalogAgGrid from "@/components/LazyCatalogAgGrid";
import Link from "next/link"

export const metadata = {
  title: "IFC | Tablero general de analisis y reportes"
};

export default async function CatalogPage() {
  const { supabase, user } = await requirePageUser();
  const [labsNames, staticInfo] = await Promise.all([
    queryLabsNames(supabase),
    queryStaticInfo(supabase)
  ]);

  return (
    <>
      <PageChrome userEmail={user.email ?? "[...]"}>
        <div className="card">
          <div className="dashboard-section">
            <div className="dashboard-grid grid_01">
              <div className="card">
                <div className="searchable-dropdown">
                  <input type="text" id="labSearchInput" placeholder="Escribe o selecciona un laboratorio" autoComplete="off" />
                  <div id="labOptionsList" className="options-list hide">
                    {labsNames.map((item) => (
                      <div className="option-item" data-labname={item.nombre_lab} key={item.nombre_lab}>
                        <strong>{item.nombre_lab}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Link id="getLabView_btn" href="/main_catalog/laboratories" className="func_button">
                Gestionar Laboratorios
              </Link>
            </div>

            <div className="dashboard-grid grid_02">
              <div className="card">
                <div id="lab-title" className="lab-title">[...]</div>
                <div id="lab-country" className="lab-country">[...]</div>
                <div className="lab-info">
                  <span id="lab-info-location">[...]</span>
                  <br />
                  <span id="lab-info-contact">[...]</span>
                </div>
              </div>
              <div className="card">
                <div className="metric currency-metric">
                  <p id="lab-divisa">[...]</p>
                </div>
              </div>
              <div className="card">
                <div className="metric-grid">
                  {staticInfo.map((item) => (
                    <div className="metric" id={`estatico_${item.id}`} key={item.id}>
                      <h4>{item.marker}</h4>
                      <p>$ {Number(item.value || 0).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card table-card">
            <div id="bottomTables" className="dashboard-grid grid_03 hide">
              <div className="toolbar-field">
                <input className="search_at_table" id="search" placeholder="Buscar..." />
              </div>
              <button id="download-pdf" className="func_button">PDF</button>
              <div className="currency-actions">
                <button id="btn_changeto_mxn" className="func_button">MXN</button>
                <button id="btn_changeto_usd" className="func_button">USD</button>
                <button id="btn_changeto_eur" className="func_button">EUR</button>
              </div>
            </div>
            <div className="dashboard-grid">
              <CatalogAgGrid />
            </div>
          </div>
        </div>
      </PageChrome>
      <LoadScreen />
      <ConfirmPopup />
      <EditDescPopup />
    </>
  );
}









