import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import PageChrome from "@/components/PageChrome";
import LoadScreen from "@/components/LoadScreen";
import ConfirmPopup from "@/components/ConfirmPopup";
import EditDescPopup from "@/components/EditDescPopup";
import CatalogAgGrid from "@/components/LazyCatalogAgGrid";
import CurrencyRateInputs from "@/components/CurrencyRateInputs";
import { Panel, PanelBody } from "@/components/Panel";

export const metadata = {
  title: "IFC | Análisis"
};

export default async function CatalogPage() {
  const { user } = await requirePageUser();

  return (
    <>
      <PageChrome userEmail={user.email ?? "[...]"}>
        <Panel>
          <PanelBody className="catalog-sticky-toolbar">
            <div className="catalog-topbar">
              <Link id="getLabView_btn" href="/main_catalog/laboratories" className="btn-primary catalog-primary-action">
                Tablero Laboratorios
              </Link>

              <div className="toolbar-field catalog-search">
                <input className="search_at_table" id="search" placeholder="Búsqueda universal de cualquier palabra" />
              </div>

              <div className="catalog-command-cluster">
                <button id="download-pdf" className="btn-primary">PDF</button>
                <div className="currency-actions">
                  <button id="btn_changeto_mxn" className="btn-secondary">MXN</button>
                  <button id="btn_changeto_usd" className="btn-secondary">USD</button>
                  <button id="btn_changeto_eur" className="btn-secondary">EUR</button>
                </div>
              </div>

              <CurrencyRateInputs userId={user.id} />
            </div>
          </PanelBody>

          <PanelBody className="table-panel">
            <div className="table-wrap">
              <CatalogAgGrid />
            </div>
          </PanelBody>
        </Panel>
      </PageChrome>
      <LoadScreen />
      <ConfirmPopup />
      <EditDescPopup />
    </>
  );
}
