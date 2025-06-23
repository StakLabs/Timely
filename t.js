window.start = start;
window.newItem = newItem;
window.removeAll = removeAll;
window.viewAll = viewAll;
window.addItem = addItem;
window.addXP = addXP;

const suggestions = {
    'Early Morning': [
        'Morning Yoga', 'Breakfast', 'Reading'
    ],
    'Morning': [
        'Work on Project', 'Team Meeting', 'Review Emails'
    ],
    'Afternoon': [
        'Lunch Break', 'Client Call', 'Report Writing'
    ],
    'Evening': [
        'Gym', 'Dinner with Family', 'Relaxation'
    ],
    'Night': [
        'Watch a Movie', 'Prepare for Tomorrow', 'Read a Book'
    ]
};

const user = JSON.parse(localStorage.getItem('savedUser')) || null;

const currentTime = getCurrentTime();

let presets = JSON.parse(localStorage.getItem('presets_' + (JSON.parse(localStorage.getItem('savedUser'))?.username || 'default'))) || [];

let timeSuggestions = JSON.parse(localStorage.getItem('timeSuggestions_' + currentTime + '_' + (JSON.parse(localStorage.getItem('savedUser'))?.username || 'default'))) || suggestions[currentTime];

localStorage.setItem('suggestions', JSON.stringify(suggestions));
localStorage.setItem('timeSuggestions_' + currentTime + '_' + (JSON.parse(localStorage.getItem('savedUser'))?.username || 'default'), JSON.stringify(timeSuggestions));

const variables = JSON.parse(localStorage.getItem('variables')) || {};

let listedItems;

let category = 'other';

var container;

let allItems = false;

let schedules;

let items;

let pickedDate = new Date().toISOString().split('T')[0];

const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8"/>
        <title>Timely - Schedule Smarter, Not Harder</title>
    </head>
    <body>
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <h1>Welcome to Timely</h1>
        <p>Timely is a scheduling site that helps you manage your time effectively.</p>
        <p>Here you can view your schedules, add new ones, and manage your time better.</p>
        <button onclick="newItem()">Start Scheduling</button>
        <script src="t.js"></script>
    </body>
    </html>
`

async function start() {
    if (!user) {
        document.body.innerhtml = `
            <h1>Error Code 402 - Payment Required, Not Logged In</h1>
        `
    }

    if (!user) {
        document.body.innerHTML = '<h1 style="color: red;">You are not logged in. Please log in to access this page.</h1>';
        return;
    }

    schedules = JSON.parse(localStorage.getItem('schedules_' + user.username)) || [];

    if (schedules.length == 0) {
        document.body.innerHTML = `
            <p id="xpDisplay">${getXP()} XP</p>
            <h1>Welcome, ${user.username}!</h1>
            <div class="button-container">
                <button onclick="newItem()">Add New Item</button>
                <button onclick="newPreset()">Add New Preset</button>
            </div>
            <div id="scheduleContainer"></div>
        `
        shouldRender();
    } else {
        document.body.innerHTML = `
            <a href="whatsapp://send?text=Timely%20changed%20my%20routine!%20Create%20an%20account%20here:%20https://ayaan-creator-web.github.io/Timely/" data-action="share/whatsapp/share">Refer Timely to a Friend!</a>
            <p id="xpDisplay">${getXP()} XP</p>
            <h1>Welcome, ${user.username}!</h1>
            <div class="button-container">
                <button onclick="newItem()">Add New Item</button>
                <button onclick="newPreset()">Add New Preset</button>
                <button onclick="removeAll();">Remove all Items</button>
                <button onclick="allItems = true; viewAll();">View All Items</button>
            </div>
            <input type="date" id="datePicker" value="${pickedDate}" onchange="pickedDate = this.value; start();">
            <div id="scheduleContainer"></div>
        `;
        container = document.querySelector('#scheduleContainer');
        data();
    }
    if (document.getElementById('xpDisplay')) {
        setInterval(updateXpDisplay, 1000);
    }
    // Call addGeneralStyles after the HTML is rendered
    addGeneralStyles();
}

// Update this function
function addGeneralStyles() {
    const style = document.createElement('style');
    style.innerHTML += `
        .button-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 20px;
            justify-content: center; /* Changed to center to balance the smaller buttons */
            align-items: center;
            max-width: 500px; /* This still limits the overall width of the button row */
        }

        .button-container button {
            /* Adjusted width to make them less wide */
            flex: 0 1 calc(45% - 5px); /* Changed from 50% to 45% */
            padding: 8px 12px;
            font-size: 14px;

            background-color: #2196F3;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            box-sizing: border-box;
            min-width: 100px; /* Reduced min-width further if needed for very small screens */
        }

        .button-container button:hover {
            background-color: #1976D2;
        }
    `;
    document.head.appendChild(style);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function newPreset() {
    document.body.innerHTML = `
        <h2>Add New Preset</h2>
        <form id="scheduleForm">
            <label for="name" value>Name:</label>
            <input type="text" id="name" name="name" value=""required>
            <label for="description">Description:</label>
            <input type="text" id="description" name="description">
            <br>
            <br>
            <label for="startTime">Start time:</label>
            <input type="time" id="startTime" name="startTime" required>
            <label for="endTime">End time:</label>
            <input type="time" id="endTime" name="endTime">
            <br>
            <br>
            <button type="button" onclick="start()">Back to Schedules</button>
            <br>
            <br>
            <button type="button" id="Add" onclick="addPreset()">Add Preset</button>
        </form>
    `;
}

function addPreset() {
    const user = JSON.parse(localStorage.getItem('savedUser'));
    if (!user) {
        alert('User not logged in');
        return;
    }

    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const starting = document.getElementById('startTime').value;
    const ending = document.getElementById('endTime').value;

    if (name) {
        const newPreset = {
            id: timeSuggestions.length + 1,
            name,
            description: description || null,
            starting: starting || null,
            ending: ending || null
        }
        presets.push(newPreset);
        localStorage.setItem('presets_' + user.username, JSON.stringify(presets));
        start();
    } else {
        alert('Please fill in name field.');
    }
}

async function removeAll() {
    const user = JSON.parse(localStorage.getItem('savedUser'));
    if (!user) return;

    Swal.fire({
        title: "Are you sure you want to remove all items?",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Remove",
        denyButtonText: `Cancel`
    }).then(async (result) => {
        if (result.isConfirmed) {
            const passwordResult = await Swal.fire({
                title: "Enter your password",
                input: "password",
                inputLabel: "Password",
                inputPlaceholder: "Enter your password",
                inputAttributes: {
                    maxlength: "10",
                    autocapitalize: "off",
                    autocorrect: "off"
                },
                showCancelButton: true,
                confirmButtonText: "Remove All",
                showDenyButton: true,
                denyButtonText: "Try another way"
            });

            if (passwordResult.isConfirmed) {
                const password = passwordResult.value;
                if (password === user.password) {
                    schedules = [];
                    localStorage.setItem('schedules_' + user.username, JSON.stringify(schedules));
                    start();
                    Swal.fire({
                        icon: 'success',
                        title: 'All items removed successfully',
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Incorrect Password',
                        text: 'Please try again.'
                    });
                }
            } else if (passwordResult.isDenied) {
                const emailResult = await Swal.fire({
                    title: "Input email address",
                    input: "email",
                    inputLabel: "Your email address",
                    inputPlaceholder: "Enter your email address",
                    showCancelButton: true,
                    confirmButtonText: "Remove All"
                });

                if (emailResult.isConfirmed) {
                    const email = emailResult.value;
                    if (email === user.email) {
                        schedules = [];
                        localStorage.setItem('schedules_' + user.username, JSON.stringify(schedules));
                        start();
                        Swal.fire({
                            icon: 'success',
                            title: 'All items removed successfully',
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Incorrect or Invalid Email',
                            text: 'Please try again.'
                        });
                    }
                }
            }
        }
    });
}

async function data() {
    container.innerHTML = "";

    const filteredSchedules = allItems ? schedules : schedules.filter(schedule => schedule.date === pickedDate);

    filteredSchedules.forEach((schedule) => {
        const { ending, starting, date, id, name, description } = schedule;

        const checked = JSON.parse(localStorage.getItem(`checkbox_${id}`)) || false;

        container.innerHTML += `
            <br>
            <div class="item" id="item_${id}"> <div class="checkbox-wrapper">
                    <input id="checkbox_${id}" type="checkbox"
                        onchange="if (this.checked) { localStorage.setItem('checkbox_${id}', true); addXP(5); done(${id}); } else { localStorage.removeItem('checkbox_${id}'); addXP(-5); done(${id}); }">
                </div>
                <h2>${name}</h2>
                <p>${description}</p>
                <p>${starting ? 'Start Time: ' + starting : ''}</p>
                <p>${ending ? 'End Time: ' + ending : ''}</p>
                <button onclick="remove(${id})">Remove</button>
            </div>
        `;
    });

    filteredSchedules.forEach((schedule) => {
        const { id } = schedule;
        const checked = JSON.parse(localStorage.getItem(`checkbox_${id}`)) || false;
        const checkbox = document.getElementById("checkbox_" + id);
        if (checkbox) checkbox.checked = checked;

        // Call done() here to apply the initial 'done' or 'not-done' class on load
        done(id);
    });

    addStyles();
}

async function allData() {
    container.innerHTML = '';
    schedules.forEach((schedule) => {
        const { ending, starting, date, id, name, description } = schedule;
        container.innerHTML += `
            <div class="item" id="item_${id}"> <div class="checkbox-wrapper">
                    <input id="checkbox_${id}" type="checkbox"
                        onchange="if (this.checked) { localStorage.setItem('checkbox_${id}', true); addXP(5); done(${id}); } else { localStorage.removeItem('checkbox_${id}'); addXP(-5); done(${id}); }">
                </div>
                <h2>${name}</h2>
                <p>${description}</p>
                <p>Date: ${date}</p>
                <p>${starting ? 'Start Time: ' + starting : ''}</p>
                <p>${ending ? 'End Time: ' + ending : ''}</p>
                <button onclick="remove(${id})">Remove</button>
            </div>
        `;
    });

    schedules.forEach((schedule) => {
        const { id } = schedule;
        const checked = JSON.parse(localStorage.getItem(`checkbox_${id}`)) || false;
        const checkbox = document.getElementById("checkbox_" + id);
        if (checkbox) checkbox.checked = checked;

        // Call done() here to apply the initial 'done' or 'not-done' class on load
        done(id);
    });

    addStyles();
}

function newItem(name, description, starting, ending, category) {
    const user = JSON.parse(localStorage.getItem('savedUser'));
    if (!user) {
        alert('User not logged in');
        return;
    }
    if (!name) name = '';
    if (!description) description = '';
    if (!starting) starting = null;
    if (!ending) ending = null;
    const currentDate = new Date().toISOString().split('T')[0];
    document.body.innerHTML = `
        <h2>Add New Schedule</h2>
        <form id="scheduleForm">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" value="${name}" required>
            <label for="description">Description:</label>
            <textarea id="description" name="description">${description}</textarea>
            <label for="date">Date:</label>
            <input type="date" id="date" name="date" value="${currentDate}" required>
            <br>
            <br>
            <label for="startTime">Start time:</label>
            <input type="time" id="startTime" name="startTime" value="${starting}" required>
            <label for="endTime">End time:</label>
            <input type="time" id="endTime" name="endTime" value="${ending}">
            <br>
            <br>
            <button type="button" onclick="start()">Back to Schedules</button>
            <br>
            <br>
            <button type="button" id="Add" onclick="addItem()">Add Schedule</button>
            <br>
            <br>
            <select id="presetSelector" onchange="
                const p = presets.find(p => p.name === this.value);
                if (p) newItem(p.name, p.description, p.starting, p.ending, p.category);
            ">
                <option value="">Select Preset</option>
                ${presets.map(preset => `<option value="${preset.name}">${preset.name}</option>`).join('')}
            </select>
        </form>
    `;
}

function addItem() {
    const user = JSON.parse(localStorage.getItem('savedUser'));
    if (!user) {
        alert('User not logged in');
        return;
    }

    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;
    const starting = document.getElementById('startTime').value;
    const ending = document.getElementById('endTime').value;

    const currentTime = getCurrentTime();
    timeSuggestions.push(name);
    localStorage.setItem('timeSuggestions_' + currentTime + '_' + user.username, JSON.stringify(timeSuggestions));


    if (name && date) {
        const newSchedule = {
            id: schedules.length + 1,
            name,
            description: description || "No description provided",
            date: date,
            starting: starting || null,
            ending: ending || null
        }
        schedules.push(newSchedule);
        localStorage.setItem('schedules_' + user.username, JSON.stringify(schedules));
        start();
        addXP(1);
    } else {
        alert('Please fill in name and date fields.');
    }
}

function shouldRender() {

}

function remove(id) {
    const user = JSON.parse(localStorage.getItem('savedUser'));
    if (!user) return;
    Swal.fire({
        title: "Are you sure you want to remove this item?",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Remove",
        denyButtonText: `Cancel`
        }).then((result) => {
        if (result.isConfirmed) {
            localStorage.setItem(`checkbox_${id}`, false);
            localStorage.setItem('deletedItem', JSON.stringify(schedules.filter(schedule => schedule.id === id)));
            schedules = schedules.filter(schedule => schedule.id !== id);
            localStorage.setItem('schedules_' + user.username, JSON.stringify(schedules));
            start();
            Swal.fire({
                toast: true,
                text: "Item removed successfully",
                position: 'bottom',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: true,
                confirmButtonText: 'Undo',
                confirmButtonColor: '#3085d6',
            }).then((result) => {
                if (result.isConfirmed) {
                    const deletedItem = JSON.parse(localStorage.getItem('deletedItem'));
                    if (deletedItem && deletedItem.length > 0) {
                        schedules.push(deletedItem[0]);
                        localStorage.setItem('schedules_' + user.username, JSON.stringify(schedules));
                        localStorage.removeItem('deletedItem');
                        start();
                    }
                }
            })
            if (allItems && schedules.length > 0) viewAll();
        } else if (result.isDenied) {}
    });
}

function addStyles() {
  const style = document.createElement('style');
  style.innerHTML = `
    #scheduleContainer {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      justify-content: center;
      max-width: 960px;
      margin: 0 auto;
    }

    .item {
      border: 3px solid #90CAF9;
      padding: 16px;
      border-radius: 10px;
      background-color: #E3F2FD;
      width: 220px;
      height: 250px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;
    }

    .item:hover {
      transform: scale(1.02);
    }

    .item h2 {
      margin: 0 0 8px 0;
      font-size: 20px;
      color: #1976D2;
    }

    .item p {
      margin: 4px 0;
      color: #424242;
      font-size: 14px;
    }

    .item button {
      margin-top: 10px;
      padding: 8px;
      background-color: white;
      border: 2px solid #2196F3;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
    }

    .item button:hover {
      background-color: #E3F2FD;
    }
    .item {
      position: relative;
    }

    .checkbox-wrapper {
      position: absolute;
      top: 10px;
      right: 10px;
    }

    .checkbox-wrapper input[type="checkbox"] {
      transform: scale(1.2);
      cursor: pointer;
    }

    .item button[onclick^="remove("] {
      background-color: #EF9A9A;
      color: white;
      border: 2px solid #E57373;
    }

    .item button[onclick^="remove("]:hover {
      background-color: #E57373;
    }
  `;
  document.head.appendChild(style);
}

function viewAll() {
    const user = JSON.parse(localStorage.getItem('savedUser'));
    if (!user) {
        alert('User not logged in');
        return;
    }

    schedules = JSON.parse(localStorage.getItem('schedules_' + user.username)) || [];

    document.body.innerHTML = `
        <h1>All Schedules</h1>
        <button onclick="allItems = false; start()">Back to Dashboard</button>
        <div id="scheduleContainer"></div>
    `;

    container = document.querySelector('#scheduleContainer');

    allData();
}

start();

async function reminder() {
    const user = JSON.parse(localStorage.getItem('savedUser'));
    if (!user) {
        console.log("No user found");
        return;
    }

    const schedules = JSON.parse(localStorage.getItem('schedules_' + user.username)) || [];
    const currentDate = new Date().toISOString().split('T')[0];
    const now = new Date();

    const currentTime = now.getHours().toString().padStart(2, '0') + ':' +
                        now.getMinutes().toString().padStart(2, '0');

    if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            alert('Please enable notifications in your browser settings to receive reminders.');
            return;
        }
    } else if (Notification.permission === 'denied') {
        alert('Please enable notifications in your browser settings to receive reminders.');
        return;
    }

    for (const schedule of schedules) {
        const { id, date, name, description, starting } = schedule;

        if (!variables[`notificationTitle_${id}`]) {
            if (date === currentDate) {
                if (starting) {
                    console.log("Target time:", starting);
                    if (starting === currentTime) {
                        console.log("🔔 Sending notification for:", name);
                        new Notification(`Reminder: ${name}`, {
                            body: description ? description : 'No description provided',
                        });

                        variables[`notificationTitle_${id}`] = true;
                    }
                } else {
                    console.log("🔔 Sending notification for:", name);
                    new Notification(`Reminder: ${name}`, {
                        body: description ? description : 'No description provided',
                    });

                    variables[`notificationTitle_${id}`] = true;
                    localStorage.setItem('variables', JSON.stringify(variables));
                }
            }
        }
    }
}

setInterval(reminder, 5000);

function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours()
    hours = Number(hours)
    if (hours > 0 && hours < 4) {
        return 'Early Morning';
    } else if (hours >= 4 && hours < 12) {
        return 'Morning';
    } else if (hours >= 12 && hours < 17) {
        return 'Afternoon';
    } else if (hours >= 17 && hours < 20) {
        return 'Evening';
    } else {
        return 'Night';
    }
}

function smartSuggestionsTime() {
    const randomSuggestion = timeSuggestions[Math.floor(Math.random() * timeSuggestions.length)];

    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        html: `
            <div class="ti-content">
                <div class="ti-text">
                    <b>Timely Insight:</b> ${AIsuggestionORnot(randomSuggestion) ? 'You usually add ' : 'May I suggest: '} <i>${randomSuggestion}</i>${AIsuggestionORnot(randomSuggestion) ? ' around this time.' : '?'}
                </div>
                <div class="ti-buttons">
                    <button id="addTaskBtn" class="ti-btn green">Add</button>
                    <button id="suggestAnotherBtn" class="ti-btn blue">Next</button>
                    <button id="dismissBtn" class="ti-btn red">Dismiss</button>
                </div>
            </div>
        `,
        showConfirmButton: false,
        customClass: {
            popup: 'ti-toast'
        },
        timer: 10000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);

            document.getElementById('addTaskBtn').addEventListener('click', () => {
                Swal.close();
                newItem(randomSuggestion);
            });

            document.getElementById('suggestAnotherBtn').addEventListener('click', () => {
                Swal.close();
                smartSuggestionsTime();
            });

            document.getElementById('dismissBtn').addEventListener('click', () => {
                Swal.close();
            });
        }
    });
}

!user ? start() : smartSuggestionsTime();

setInterval(!user ? start : smartSuggestionsTime, 3600000);

function AIsuggestionORnot(suggestion) {
    for (const period in suggestions) {
        if (suggestions[period].includes(suggestion)) {
            return false;
        }
    }
    return true;
}

function addXP(amount) {
    const user = JSON.parse(localStorage.getItem('savedUser'));
    if (!user) {
        console.warn("User not logged in, cannot add XP.");
        return;
    }
    let xp = JSON.parse(localStorage.getItem('xp_' + user.username)) || 0;
    xp += amount;
    localStorage.setItem('xp_' + user.username, JSON.stringify(xp));
    if (amount > 0) {
        Swal.fire({
            title: `+${amount} XP!`,
            showConfirmButton: false,
            timer: 500,
            showProgressBar: false,
        });
    }
    updateXpDisplay();
}

function getXP() {
    const user = JSON.parse(localStorage.getItem('savedUser'));
    if (!user) {
        return 0;
    }
    return JSON.parse(localStorage.getItem('xp_' + user.username)) || 0;
}

function updateXpDisplay() {
    const xpElement = document.getElementById('xpDisplay');
    if (xpElement) {
        xpElement.textContent = `${getXP()} XP`;
    }
}

function done(id) {
    if (document.querySelector(`#checkbox_${id}`).checked) {
        document.querySelector(`#item_${id}`).classList.add('done');
        document.querySelector(`#item_${id}`).classList.remove('not-done')
    } else {
        document.querySelector(`#item_${id}`).classList.remove('done');
        document.querySelector(`#item_${id}`).classList.add('not-done');
    }
}

/*Updates in 1.4.0
    undo delete
*/
