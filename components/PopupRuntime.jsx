"use client";

import { useEffect } from "react";

function resolvePopup(id, beforeAccept) {
  const modal = document.getElementById(id);
  const accept = document.getElementById(`${id}-true`);
  const cancel = document.getElementById(`${id}-false`);
  if (!modal || !accept || !cancel) return Promise.resolve(false);

  modal.classList.remove("hide");
  return new Promise((resolve) => {
    accept.onclick = () => {
      const value = beforeAccept?.();
      if (value === false) return;
      modal.classList.add("hide");
      resolve(value ?? true);
    };
    cancel.onclick = () => {
      modal.classList.add("hide");
      resolve(false);
    };
  });
}

function readDescriptionForm(rowData) {
  const elements = {};
  Object.entries(rowData || {}).forEach(([key, value]) => {
    const element = document.getElementById(key);
    if (element) {
      element.value = value ?? "";
      elements[key] = element;
    }
  });

  return () => {
    const values = {};
    Object.entries(elements).forEach(([key, element]) => {
      values[key] = element.value;
      element.value = "";
    });
    return values;
  };
}

export default function PopupRuntime() {
  useEffect(() => {
    window.confirmPopup = (message, expectedName, entity = "elemento") => {
      const text = document.getElementById("confirmPopup-msg");
      const validation = document.getElementById("confirmPopup-validation");
      const input = document.getElementById("confirmPopup-input");
      const expected = document.getElementById("confirmPopup-expected");
      const entityText = document.getElementById("confirmPopup-entity");
      const accept = document.getElementById("confirmPopup-true");
      const requiresName = expectedName !== undefined && expectedName !== null;
      const expectedValue = String(expectedName ?? "");

      if (text) text.textContent = message;
      if (validation) validation.hidden = !requiresName;
      if (expected) expected.textContent = expectedValue;
      if (entityText) entityText.textContent = entity;
      if (input) {
        input.value = "";
        input.oninput = () => {
          if (accept) accept.disabled = input.value !== expectedValue;
        };
      }
      if (accept) accept.disabled = requiresName;
      if (requiresName) window.setTimeout(() => input?.focus(), 0);

      return resolvePopup("confirmPopup", () => {
        if (requiresName && input?.value !== expectedValue) return false;
        return true;
      });
    };

    window.addFilePopup = () => resolvePopup("addFilePopup");

    window.createAnalisisPopup = (laboratories = []) => {
      const title = document.getElementById("createAnalisisPopup-title");
      const prefix = document.getElementById("createAnalisisPopup-codigo_lab");
      const labSelect = document.getElementById("createAnalisisPopup-lab");
      const fileInput = document.getElementById("file_input");
      const codeInput = document.getElementById("a_code_input");
      const labsByName = new Map(laboratories.map((lab) => [lab.nombre_lab, lab]));

      if (title) title.textContent = "Nuevo análisis";
      if (prefix) prefix.textContent = "—";
      if (labSelect) {
        labSelect.replaceChildren(new Option("Selecciona un laboratorio", "", true, true));
        labSelect.options[0].disabled = true;
        laboratories.forEach((lab) => labSelect.add(new Option(lab.nombre_lab, lab.nombre_lab)));
        labSelect.onchange = () => {
          const lab = labsByName.get(labSelect.value);
          if (title) title.textContent = lab ? `Nuevo análisis para ${lab.nombre_lab}` : "Nuevo análisis";
          if (prefix) prefix.textContent = lab?.codigo_lab || "—";
        };
      }
      // Desactivado, denega todo input diferente a número
      // if (codeInput) codeInput.oninput = (event) => { event.target.value = event.target.value.replace(/\D/g, ""); };
      // Este nuevo permite denegar espacios, nadie sabe como desean normalizar los id_análisis
      if (codeInput) codeInput.oninput = (event) => { event.target.value = event.target.value.replace(/\s/g, ""); };


      return resolvePopup("createAnalisisPopup", () => {
        const lab = labsByName.get(labSelect?.value);
        if (!lab) return alert("Selecciona un laboratorio."), false;
        if (!lab.codigo_lab) return alert(`Necesitas establecer el código identificador de análisis para ${lab.nombre_lab}.`), false;
        if (!fileInput?.files?.[0]) return alert("Ingresa una cotización antes de crear el análisis."), false;
        if (codeInput?.value == "") return alert("Ingresa un código identificador de análisis."), false;
        return { labname: lab.nombre_lab, codigoLab: lab.codigo_lab };
      });
    };

    window.editdescPopup = (rowData) => {
      const collect = readDescriptionForm(rowData);
      return resolvePopup("editdescPopup", collect);
    };

    return () => {
      delete window.confirmPopup;
      delete window.addFilePopup;
      delete window.createAnalisisPopup;
      delete window.editdescPopup;
    };
  }, []);

  return null;
}



