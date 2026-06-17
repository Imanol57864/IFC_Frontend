const params = new URLSearchParams(window.location.search);
const error = params.get("error");

if (error) {
    const box = document.getElementById("error");
    box.innerText = error;
    box.style.display = "block";

    window.history.replaceState({}, document.title, window.location.pathname);
}