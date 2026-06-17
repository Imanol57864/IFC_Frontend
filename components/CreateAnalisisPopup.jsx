import Script from "next/script";

export default function CreateAnalisisPopup() {
  return (
    <>
      <Script src="/laboratories/createAnalisisPopup/createAnalisisPopup.js" strategy="afterInteractive" />
      <div id="createAnalisisPopup" className="confirm-overlay hide">
        <div className="formdisplay">
          <h3 id="createAnalisisPopup-title" />
          <div className="analysis-code-box">
            <span className="analysis-code-label">C&oacute;digo de an&aacute;lisis</span>
            <div className="analysis-code-wrapper">
              <div id="createAnalisisPopup-codigo_lab" className="card analysis-prefix" />
              <input id="a_code_input" type="text" maxLength="3" placeholder="***" className="card analysis-suffix-input" />
              <span className="analysis-code-label">Ingresa 3 d&iacute;gitos para el an&aacute;lisis.</span>
            </div>
          </div>
          <div className="field-row">
            <span>Archivo</span>
            <input type="file" id="file_input" />
          </div>
          <div className="confirm-actions-editdesc">
            <button id="createAnalisisPopup-true" className="btn btn-accept-constructive">
              Enviar
            </button>
            <button id="createAnalisisPopup-false" className="btn btn-cancel">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

