window.addFilePopup = async function () {
    const modal = document.getElementById('addFilePopup');
    const bTrue = document.getElementById('addFilePopup-true');
    const bFalse = document.getElementById('addFilePopup-false');

    // 1. Configurar el mensaje y mostrar el modal
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