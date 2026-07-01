import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import PageChrome from "@/components/PageChrome";
import LoadScreen from "@/components/LoadScreen";
import ConfirmPopup from "@/components/ConfirmPopup";
import CreateAnalisisPopup from "@/components/CreateAnalisisPopup";
import EditDescPopup from "@/components/EditDescPopup";
import CatalogAgGrid from "@/components/LazyCatalogAgGrid";
import CurrencyRateInputs from "@/components/CurrencyRateInputs";
import { Panel, PanelBody } from "@/components/Panel";
import { canUseIam } from "@/lib/iam";
import { notFound } from "next/navigation";

export const metadata = {
  title: "IFC | Análisis"
};

export default async function CatalogPage() {
  const { user, areaId } = await requirePageUser();
  if (!canUseIam("analisis", "access_view", areaId)) notFound();
  const canUseMoneyActions = canUseIam("analisis", "money_actions", areaId);
  const canUseReportActions = canUseIam("analisis", "report_actions", areaId);
  const canCreateUpdateAnalisis = canUseIam("analisis", "create_update_actions", areaId);
  const canViewLabs = canUseIam("labs", "access_view", areaId);

  return (
    <>
      <PageChrome userEmail={user.email ?? "[...]"} areaId={areaId}>
        <Panel>
          <PanelBody className="catalog-sticky-toolbar">
            <div className="catalog-topbar">
              <div className="catalog-primary-action">
                {canCreateUpdateAnalisis && <button id="create-analysis" type="button" className="btn-primary">Crear análisis</button>}
                {canViewLabs && <Link id="getLabView_btn" href="/main_catalog/laboratories" className="btn-secondary">Tablero Laboratorios</Link>}
              </div>
              <div className="toolbar-field catalog-search">
                <input className="search_at_table" id="search" placeholder="Búsqueda universal de cualquier palabra" />
              </div>

              {(canUseReportActions || canUseMoneyActions) && (
                <div className="catalog-command-cluster">
                  {canUseReportActions && <button id="download-pdf" className="btn-primary">PDF</button>}
                  {canUseMoneyActions && (
                    <div className="currency-actions">
                      <button id="btn_changeto_mxn" className="btn-secondary">MXN</button>
                      <button id="btn_changeto_usd" className="btn-secondary">USD</button>
                      <button id="btn_changeto_eur" className="btn-secondary">EUR</button>
                    </div>
                  )}
                </div>
              )}

              {canUseMoneyActions && <CurrencyRateInputs userId={user.id} />}
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
      <CreateAnalisisPopup />
      <EditDescPopup />
    </>
  );
}
