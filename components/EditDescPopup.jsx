import Script from "next/script";

export default function EditDescPopup() {
  return (
    <>
      <Script src="/products/analisis/editdescPopup/editdescPopup.js" strategy="afterInteractive" />
      <div id="editdescPopup" className="confirm-overlay hide">
        <div className="formdisplay-editdesc">
          <h3>Editar descripci&oacute;n</h3>
          <div id="editdescPopup-form">
            {[
              ["desc_toptext", "Nombre del analisis"],
              ["desc_metodo", "Metodologia"],
              ["desc_respuesta", "Tiempo de respuesta"],
              ["desc_muestra_tipo", "Tipo de muestra"],
              ["desc_muestra_cantd", "Cantidad de muestra"]
            ].map(([id, label]) => (
              <div className="field-row" key={id}>
                <span>{label}</span>
                <textarea id={id} />
              </div>
            ))}
            <div className="field-row">
              <span>Acreditación</span>
              <select id="desc_acred">
                {["a", "a,b", "MrS", "Mna", "b", "c", "d", "e", "f"].map((value) => (
                  <option value={value} key={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-row">
              <span>Indicaciones especiales</span>
              <textarea id="desc_bottomtext" placeholder="Se agrega la indicacion de..." />
            </div>
          </div>
          <div className="confirm-actions-editdesc">
            <button id="editdescPopup-true" className="btn btn-accept-constructive">
              Enviar
            </button>
            <button id="editdescPopup-false" className="btn btn-cancel">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

