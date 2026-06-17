import Script from "next/script";

export default function ConfirmPopup() {
  return (
    <>
      <Script src="/utils/confirmPopup/confirmPopup.js" strategy="afterInteractive" />
      <div id="confirmPopup" className="confirm-overlay hide">
        <div className="confirm-content">
          <p id="confirmPopup-msg" />
          <div className="confirm-actions">
            <button id="confirmPopup-true" className="btn btn-accept-destructive">
              Aceptar
            </button>
            <button id="confirmPopup-false" className="btn btn-cancel">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

