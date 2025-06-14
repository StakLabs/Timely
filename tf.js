document.addEventListener("DOMContentLoaded", loadItems);

function addItem() {
    const input = document.getElementById("itemInput");
    const list = document.getElementById("itemList");

    if (list.children.length >= 5) {
        alert("You can only add up to 5 entries.");
        return;
    }

    const itemText = input.value.trim();
    if (itemText === "") {
        alert("Please enter something.");
        return;
    }

    const listItem = document.createElement("li");
    listItem.textContent = itemText;
    listItem.className = "list-entry";

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.onclick = () => {
        listItem.remove();
        saveItems();
    };

    listItem.appendChild(removeButton);
    list.appendChild(listItem);
    input.value = "";

    saveItems();
}

function saveItems() {
    const data = [];
    document.querySelectorAll("#itemList li").forEach(entry => {
        data.push(entry.firstChild.textContent);
    });
    localStorage.setItem("listData", JSON.stringify(data));
}

function loadItems() {
    const savedData = JSON.parse(localStorage.getItem("listData")) || [];
    const list = document.getElementById("itemList");

    savedData.forEach(entryText => {
        const listItem = document.createElement("li");
        listItem.textContent = entryText;
        listItem.className = "list-entry";

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.onclick = () => {
            listItem.remove();
            saveItems();
        };

        listItem.appendChild(removeButton);
        list.appendChild(listItem);
    });
}
