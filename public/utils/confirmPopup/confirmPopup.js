window.confirmPopup = async function (mensaje) {
    const modal = document.getElementById('confirmPopup');
    const texto = document.getElementById('confirmPopup-msg');
    const bTrue = document.getElementById('confirmPopup-true');
    const bFalse = document.getElementById('confirmPopup-false');

    // 1. Configurar el mensaje y mostrar el modal
    texto.innerText = mensaje;
    modal.classList.remove('hide');

    // 2. Retornar una promesa que espera el clic
    return new Promise((resolve) => {
        bTrue.onclick = () => {
            modal.classList.add('hide');
            resolve(true);
        };
        bFalse.onclick = () => {
            modal.classList.add('hide');
            resolve(false);
        };
    });
}