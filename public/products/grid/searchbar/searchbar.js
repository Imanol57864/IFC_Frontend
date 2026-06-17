const searchInput = document.getElementById("labSearchInput");
const optionsList = document.getElementById("labOptionsList");
const items = document.querySelectorAll(".option-item");
const bottomTables = document.getElementById("bottomTables")

// Show list when focused
searchInput.addEventListener("focus", () => {
    optionsList.classList.remove("hide");
});

// Filter logic
searchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();

    items.forEach(item => {
        const labname = item.getAttribute("data-labname").toLowerCase();
        if (labname.includes(value)) {
            item.classList.remove("hide");
        } else {
            item.classList.add("hide");
        }
    });
});

// Selection logic
items.forEach(item => {
    item.addEventListener("click", async () => {
        window.activateLoadScreen();
        optionsList.classList.add("hide"); // hide selection list
        searchInput.value = ""; // clean input selector
        
        // Hide selection (unhide all -> hide selected)
        await unhideNonSelected(); // unhide all non selected
        item.classList.add("hide-already-selected"); // hide option selected

        // Unhide the analisis table for the rest of the view
        bottomTables.classList.remove("hide");
    });
});

// Unhide non-selected
async function unhideNonSelected() {
    items.forEach(item => {
        item.classList.remove("hide-already-selected"); 
    });
}

// Close dropdown if clicking outside
document.addEventListener("click", (e) => {
    if (!e.target.closest(".searchable-dropdown")) {
        optionsList.classList.add("hide");
    }
    items.forEach(item => { item.classList.remove("hide"); });
});