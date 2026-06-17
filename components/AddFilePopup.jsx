import Script from "next/script";

export default function AddFilePopup({ idAnalisis }) {
  return (
    <>
      <Script src="/files/addFilePopup/addFilePopup.js" strategy="afterInteractive" />
      <div id="addFilePopup" className="confirm-overlay hide">
        <div className="formdisplay">
          <h3>Agregar un archivo a &quot;{idAnalisis}&quot;</h3>
          <div className="field-row">
            <input type="file" id="file_input" />
          </div>
          <div className="confirm-actions-editdesc">
            <button id="addFilePopup-true" className="btn btn-accept-constructive">
              Enviar
            </button>
            <button id="addFilePopup-false" className="btn btn-cancel">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

