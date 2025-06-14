function addItem() {
    const input = document.getElementById("itemInput");
    const list = document.getElementById("itemList");
    
    if (list.children.length >= 5) {
        alert("You can only add up to 5 items.");
        return;
    }

    const itemText = input.value.trim();
    if (itemText === "") {
        alert("Please enter an item.");
        return;
    }

    const listItem = document.createElement("li");
    listItem.textContent = itemText;
    listItem.className = "item";

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.onclick = () => listItem.remove();
    
    listItem.appendChild(removeButton);
    list.appendChild(listItem);
    input.value = "";
}