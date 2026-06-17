// Forzar reload en "back & forward" con load screen
window.addEventListener("pageshow", (event) => {
    if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
        // La página viene del bfcache
        window.activateLoadScreen(3000);
        location.reload(); // recarga la página
    }
});