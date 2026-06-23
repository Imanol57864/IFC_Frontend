import PopupShell from "./PopupShell";

export default function ConfirmPopup() {
  return (
    <PopupShell id="confirmPopup" panelClassName="popup-panel popup-panel-sm" acceptLabel="Aceptar" acceptClassName="btn btn-accept-destructive">
      <p id="confirmPopup-msg" className="popup-message" />
      <div id="confirmPopup-validation" hidden>
        <label className="field-row" htmlFor="confirmPopup-input">
          <span>
            Para confirmar, escribe el nombre del <span id="confirmPopup-entity">elemento</span> exactamente como aparece:
          </span>
          <strong id="confirmPopup-expected" className="text-ifc-ink" />
          <input
            id="confirmPopup-input"
            type="text"
            autoComplete="off"
            spellCheck="false"
            aria-describedby="confirmPopup-expected"
          />
        </label>
      </div>
    </PopupShell>
  );
}
