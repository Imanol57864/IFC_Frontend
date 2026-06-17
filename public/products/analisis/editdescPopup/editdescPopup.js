window.editdescPopup = async function (row_data) {
    const modal = document.getElementById('editdescPopup');
    const bTrue = document.getElementById('editdescPopup-true');
    const bFalse = document.getElementById('editdescPopup-false');

    // 1. Configurar el mensaje y mostrar el modal
    modal.classList.remove('hide');

    // for each element in row_data, add the value as "value" attribute to document.getElemetById(key)
    const elementObject = {}
    Object.entries(row_data).forEach(([key, value]) => {
        const el = document.getElementById(key);
        if (el) {
            el.value = value; // set UI value
            elementObject[key] = el; // save element based on key
        }
    });

    // 2. Retornar una promesa que espera el clic
    return new Promise((resolve) => {
        bTrue.onclick = () => {
            modal.classList.add('hide');
            resolve(processForm(true)); //await processForm(true)
        };
        bFalse.onclick = () => {
            modal.classList.add('hide');
            resolve(processForm(false));
        };
    });

    // from the elementObject, gather each value from each element, return (a json object @ resolve + reset dom)
    function processForm(btn_bool) {
        const workingJson = {}
        Object.entries(elementObject).forEach(([key, element]) => {
            if (element) {
                workingJson[key] = element.value; // get value
                element.value = ""; // reset default value @ dom
            }
        });

        if (btn_bool) return (workingJson)
         else return (false);
    }
}