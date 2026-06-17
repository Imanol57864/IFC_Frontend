const modal = document.getElementById('createAnalisisPopup');
const bTrue = document.getElementById('createAnalisisPopup-true');
const bFalse = document.getElementById('createAnalisisPopup-false');
const title = document.getElementById('createAnalisisPopup-title');
const prefix = document.getElementById('createAnalisisPopup-codigo_lab');

const fileInput = document.getElementById('file_input');
const codeInput = document.getElementById('a_code_input');


// Reemplaza cualquier carácter que NO sea un dígito (0-9) con un string vacío
codeInput.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, ''); });

window.createAnalisisPopup = async function (labname, codigo_lab) {
    // 1. Configurar el mensaje y mostrar el modal
    modal.classList.remove('hide');
    title.textContent = `Nuevo análisis para ${labname}`;
    prefix.textContent = codigo_lab;

    // 2. Retornar una promesa que espera el clic
    return new Promise((resolve) => {
        bTrue.onclick = () => {
            const goodToSend = validateForm();
            if (goodToSend) {
                modal.classList.add('hide');
                resolve(true);
            }
        };
        bFalse.onclick = () => {
            modal.classList.add('hide');
            resolve(false);
        };
    });
}

function validateForm() {

    // Exec
    const file = fileInput.files[0];
    if (!file) return (alert("Ingresa una cotización antes de crear el análisis."), false);
    const regex = /^\d{3}$/;
    if (!regex.test(codeInput.value)) return (alert("Ingresa un código identificador de análisis válido."), false);

    // Exit
    return true;
}
