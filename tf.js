document.getElementById('smart').addEventListener("click", () => {
    if (isFirstVisitToday()) {
        smartSuggestionsTime();
    } else {
        alert("You have already received your free suggestion today. Come back tomorrow for more!");
    }
});

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
    updateTimeSuggestions(itemText);
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

function isFirstVisitToday() {
    const today = new Date().toISOString().slice(0, 10);
    const lastVisit = localStorage.getItem("lastVisitDate");

    if (lastVisit === today) {
        return false;
    } else {
        localStorage.setItem("lastVisitDate", today);
        return true;
    }
}

function getCurrentTime() {
    const hours = new Date().getHours();
    if (hours > 0 && hours < 4) return "Early Morning";
    if (hours >= 4 && hours < 12) return "Morning";
    if (hours >= 12 && hours < 17) return "Afternoon";
    if (hours >= 17 && hours < 20) return "Evening";
    return "Night";
}

async function smartSuggestionsTime() {
    const currentTime = getCurrentTime();
    const timeSuggestions = JSON.parse(localStorage.getItem("timeSuggestions_" + currentTime)) || suggestions[currentTime];
    const randomSuggestion = timeSuggestions[Math.floor(Math.random() * timeSuggestions.length)];

    //await delay(5000); // Simulate a delay for the suggestion

    Swal.fire({
        title: "Timely Insight Free Sample",
        icon: "info",
        html: `<p>May I suggest <b>${randomSuggestion}</b>?</p>`,
        showCancelButton: true,
        confirmButtonText: "Add",
        cancelButtonText: "Dismiss",
        showDenyButton: true,
        denyButtonText: "Next Suggestion",
    }).then((result) => {
        if (result.isConfirmed) {
            addItemFromSuggestion(randomSuggestion);
        } else if (result.isDenied) {
            alert("Upgrade to Timely Pro for more suggestions!");
        }
    });
}

function addItemFromSuggestion(suggestion) {
    const list = document.getElementById("itemList");

    if (list.children.length >= 5) {
        alert("You can only add up to 5 entries.");
        return;
    }

    const listItem = document.createElement("li");
    listItem.textContent = suggestion;
    listItem.className = "list-entry";

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.onclick = () => {
        listItem.remove();
        saveItems();
    };

    listItem.appendChild(removeButton);
    list.appendChild(listItem);

    saveItems();
    updateTimeSuggestions(suggestion);
}

function updateTimeSuggestions(newItem) {
    const currentTime = getCurrentTime();
    let timeSuggestions = JSON.parse(localStorage.getItem("timeSuggestions_" + currentTime)) || suggestions[currentTime];

    timeSuggestions.push(newItem);
    localStorage.setItem("timeSuggestions_" + currentTime, JSON.stringify(timeSuggestions));
}

const suggestions = {
    "Early Morning": ["Morning Yoga", "Breakfast", "Reading"],
    "Morning": ["Work on Project", "Team Meeting", "Review Emails"],
    "Afternoon": ["Lunch Break", "Client Call", "Report Writing"],
    "Evening": ["Gym", "Dinner with Family", "Relaxation"],
    "Night": ["Watch a Movie", "Prepare for Tomorrow", "Read a Book"],
};

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
