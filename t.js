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

let category;

let displayedCategory = 'All';

var container;

let allItems = false;

let schedules;

let items;

let pickedDate =  new Date().toLocaleDateString("en-CA");

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

async function getSchedulesByEmail(email) {
    return await fetch(`https://timely-zc0n.onrender.com/items/${encodeURIComponent(email)}`)
        .then(response => response.json())
        .catch(error => {
            console.error('Error:', error);
            return [];
        });
}

async function getAllItems() {
    try {
        const response = await fetch('https://timely-zc0n.onrender.com/items');
        if (!response.ok) {
            throw new Error('Failed to fetch all items');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching all items:', error);
        return [];
    }
}   

async function deleteScheduleById(id) {
    try {
        const response = await fetch(`https://timely-zc0n.onrender.com/items/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete schedule');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function deleteAll() {
    try {
        const response = await fetch(`https://timely-zc0n.onrender.com/items/`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete schedule');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function addScheduleToBackend(schedule) {
    const formattedSchedule = {
        id: schedule.id,
        username: schedule.username,
        email: schedule.email,
        password: schedule.password,

        itemName: schedule.itemName || schedule.name,
        itemDescription: schedule.itemDescription || schedule.description || "No description provided",
        itemDate: schedule.itemDate || schedule.date,
        itemStart: schedule.itemStart || schedule.starting || "",
        itemEnd: schedule.itemEnd || schedule.ending || "",
        itemCategory: schedule.itemCategory || schedule.category || "other",
    };

    try {
        const response = await fetch('https://timely-zc0n.onrender.com/items/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formattedSchedule)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to add schedule: ${response.status} - ${errorText}`);
            throw new Error('Failed to add schedule');
        }

        return await response.json();

    } catch (error) {
        console.error('Error in addScheduleToBackend:', error);
        return null;
    }
}

async function start() {
    const user = JSON.parse(localStorage.getItem('savedUser')) || null;

    if (!user) {
        document.body.innerHTML = `
            <h1>Error Code 402 - Payment Required, Not Logged In</h1>
            <p>Please log in to access Timely.</p>
            <button onclick="window.location.href='https://www.timelypro.online/login.html'">Go to Login</button>
        `;
        document.head.innerHTML = `
        <meta name="google-adsense-account" content="ca-pub-3927114728284023">`;
        return;
    }

    const fetchedSchedules = await getSchedulesByEmail(user.email);
    schedules = Array.isArray(fetchedSchedules) ? fetchedSchedules : [];
    const todaysDate = getLocalDate();

    const todaysTasks = schedules.filter(task => {
        const taskDate = task.itemDate.split("T")[0];
        return taskDate === todaysDate;
    });
    console.log(todaysTasks)
    
    await renderDashboard();     // NEW UI is placed here
    data();             // Fills in Lumen's daily summary
    addProductivity(-1);
    decayProductivity();

    if (document.getElementById('xpDisplay')) {
        setInterval(updateXpDisplay, 1000);
    }

    addGeneralStyles();
}

function logout() {
    Swal.fire({
        title: "Are you sure you want to logout?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, logout!",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
    }).then((result) => {
        if (result.isConfirmed) {
        localStorage.removeItem('savedUser');
        window.location.href = 'https://www.timelypro.online/';
        }
    });
}

function tim() {
    document.body.innerHTML = `
        <iframe 
            src="https://staklabs.github.io/Timely/tim.html" 
            width="100%" 
            height="600px" 
            style="border: none; border-radius: 12px; box-shadow: 0 0 20px #00f2ff44;">
        </iframe>
        <br>
        <button onclick="start()" style="cursor: pointer;">Back to schedules</button>
    `
}

function addGeneralStyles() {
    const style = document.createElement('style');
    style.innerHTML += `
        .button-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 20px;
            justify-content: center;
            align-items: center;
            max-width: 500px;
        }

        .button-container button {
            flex: 0 1 calc(45% - 5px);
            padding: 8px 12px;
            font-size: 14px;

            background-color: #2196F3;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            box-sizing: border-box;
            min-width: 100px;
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
            <label for="categorySelector">Category:</label>
            <br>
            <select id="categorySelector" onchange="category = this.value;">
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="shopping">Shopping</option>
                <option value="todo">To-Do</option>
                <option value="other">Other</option>
            </select>
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
    const itemCategory = document.getElementById('categorySelector').value;

    if (name) {
        const newPreset = {
            id: presets.length + 1,
            name,
            description: description || null,
            starting: starting || null,
            ending: ending || null,
            category: itemCategory
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
                    await deleteAll();
                    start();
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
                        await deleteAll();
                        start();
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

async function  data() {
    container = document.querySelector('#scheduleContainer');
    container.innerHTML = '';
    const filteredSchedulesByDate = allItems ? schedules : schedules.filter(schedule => (new Date(schedule.itemDate).toLocaleDateString()).replaceAll('/', '-')
        === (new Date(pickedDate).toLocaleDateString()).replaceAll('/', '-'));
    
    filteredSchedulesByDate.forEach((schedule) => {
        const id = schedule.id;
        const name = schedule.itemName;
        let description = schedule.itemDescription;
        description = description || 'No description provided'
        const date = schedule.itemDate;
        const starting = schedule.itemStart;
        const ending = schedule.itemEnd;
        let category = schedule.itemCategory;
        category = category.toLowerCase();
        container.innerHTML += `
            <div class="item" id="item_${id}"> <div class="checkbox-wrapper">
                    <input id="checkbox_${id}" type="checkbox"
                        onchange="if (this.checked) { localStorage.setItem('checkbox_${id}', true); addXP(5); done(${id}); } else { localStorage.removeItem('checkbox_${id}'); addXP(-5); done(${id}); }">
                </div>
                <h2>${name}</h2>
                <p>${description || 'No description provided'}</p>
                <p>${starting ? 'Start Time: ' + starting : ''}</p>
                <p>${ending ? 'End Time: ' + ending : ''}</p>
                <p>Category: ${category}</p>
                <div class="item-actions">
                    <hr>
                    <div class="item-buttons">
                        <button class="edit-button" onclick="newItem('${name.replace(/'/g, "\\'")}', '${description.replace(/'/g, "\\'")}', '${starting || ''}', '${ending || ''}', '${category}', '${date}', ${id})">
                            Edit
                        </button>
                        <button class="remove-button" onclick="remove(${id})">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    filteredSchedulesByDate.forEach((schedule) => {
        const { id } = schedule;
        const checked = JSON.parse(localStorage.getItem(`checkbox_${id}`)) || false;
        const checkbox = document.getElementById("checkbox_" + id);
        if (checkbox) checkbox.checked = checked;

        done(id);
    });
}

async function allData() {
    container = document.querySelector('#scheduleContainer');
    container.innerHTML = '';
    let filteredSchedules = schedules;
    filteredSchedules.forEach((schedule) => {
        const id = schedule.id;
        const name = schedule.itemName;
        let description = schedule.itemDescription || 'No description provided  ';
        const date = schedule.itemDate;
        const starting = schedule.itemStart;
        const ending = schedule.itemEnd;
        const category = schedule.itemCategory;
        container.innerHTML += `
            <div class="item" id="item_${id}"> <div class="checkbox-wrapper">
                    <input id="checkbox_${id}" type="checkbox"
                        onchange="if (this.checked) { localStorage.setItem('checkbox_${id}', true); addXP(5); done(${id}); } else { localStorage.removeItem('checkbox_${id}'); addXP(-5); done(${id}); }">
                </div>
                <h2>${name}</h2>
                <p>${description || 'No description provided'}</p>
                <p>Date: ${(new Date(date).toLocaleDateString()).replaceAll('/', '-')}</p>
                <p>${starting ? 'Start Time: ' + starting : ''}</p>
                <p>${ending ? 'End Time: ' + ending : ''}</p>
                <p>Category: ${category}</p>
                <div class="item-actions">
                    <hr>
                    <div class="item-buttons">
                        <button class="icon-button edit-button" onclick="newItem('${name.replace(/'/g, "\\'")}', '${description.replace(/'/g, "\\'")}', '${starting || ''}', '${ending || ''}', '${category}', '${date}', ${id})">
                            Edit
                        </button>
                        <button class="icon-button remove-button" onclick="remove(${id})">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    filteredSchedules.forEach((schedule) => {
        const { id } = schedule;
        const checked = JSON.parse(localStorage.getItem(`checkbox_${id}`)) || false;
        const checkbox = document.getElementById("checkbox_" + id);
        if (checkbox) checkbox.checked = checked;


        done(id);
    });
}

function newItem(name, description, starting, ending, category, date, id) {
    const user = JSON.parse(localStorage.getItem('savedUser'));
    if (!user) {
        alert('User not logged in');
        return;
    }

    if (typeof name === 'undefined') name = '';
    if (typeof description === 'undefined') description = '';
    if (typeof starting === 'undefined') starting = null;
    if (typeof ending === 'undefined') ending = null;
    if (typeof category === 'undefined') category = 'other';
    const currentDate = new Date().toISOString().split('T')[0];
    if (typeof date === 'undefined') date = currentDate;

    const itemId = id ? id : null;

    document.body.innerHTML = `
        <h2>${itemId ? 'Edit Schedule' : 'Add Schedule'}</h2>
        <form id="scheduleForm">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" value="${name}" required>
            <label for="description">Description:</label>
            <textarea id="description" name="description">${description}</textarea>
            <label for="date">Date:</label>
            <input type="date" id="date" name="date" value="${pickedDate}" required>
            <br>
            <br>
            <label for="startTime">Start time:</label>
            <input type="time" id="startTime" name="startTime" value="${starting || ''}" required>
            <label for="endTime">End time:</label>
            <input type="time" id="endTime" name="endTime" value="${ending || ''}">
            <br>
            <br>
            <label for="categorySelector">Category:</label>
            <br>
            <select id="categorySelector" name="categorySelector">
                <option value="work" ${category === 'work' ? 'selected' : ''}>Work</option>
                <option value="personal" ${category === 'personal' ? 'selected' : ''}>Personal</option>
                <option value="shopping" ${category === 'shopping' ? 'selected' : ''}>Shopping</option>
                <option value="todo" ${category === 'todo' ? 'selected' : ''}>To-Do</option>
                <option value="other" ${category === 'other' ? 'selected' : ''}>Other</option>
            </select>
            <br>
            <br>
            <button type="button" onclick="start()">Back to Schedules</button>
            <br>
            <br>
            <button type="button" id="Add" onclick="remove(${id}, false); addItem(); start();">${itemId ? 'Update Schedule' : 'Add Schedule'}</button>
            <br>
            <br>
            <select id="presetSelector" onchange="
                const p = presets.find(p => p.name === this.value);
                if (p) newItem(p.name, p.description, p.starting, p.ending, p.category, document.getElementById('date').value, ${itemId || 'null'});
            ">
                <option value="">Select Preset</option>
                ${presets.map(preset => `<option value="${preset.name}">${preset.name}</option>`).join('')}
            </select>
        </form>
    `;
}

async function addItem() {
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
    const itemCategory = document.getElementById('categorySelector').value;
    const currentTime = getCurrentTime();
    timeSuggestions.push(name);
    localStorage.setItem('timeSuggestions_' + currentTime + '_' + user.username, JSON.stringify(timeSuggestions));

    let maxId = 0;
    let allSchedules = await getAllItems() || [];
    if (Array.isArray(allSchedules) && allSchedules.length > 0) {
        maxId = Math.max(...allSchedules.map(s => Number(s.id) || 0));
    }
    const newId = maxId + 1;

    if (name && date) {
        const newSchedule = {
            id: newId,
            name,
            description: description || "No description provided",
            date,
            starting: starting || null,
            ending: ending || null,
            category: itemCategory,
            email: user.email,
            username: user.username,
            password: user.password
        };
        await addScheduleToBackend(newSchedule);
        schedules = await getSchedulesByEmail(user.email);
        localStorage.setItem('schedules_' + user.username, JSON.stringify(schedules));
        start();
        addXP(1);
    } else {
        alert('Please fill in name and date fields.');
    }
}

async function remove(id, swalAlert) {
    if (typeof swalAlert === 'undefined') swalAlert = true;
    if (swalAlert) {
        const user = JSON.parse(localStorage.getItem('savedUser'));
        if (!user) return;
        Swal.fire({
            title: "Are you sure you want to remove this item?",
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: "Remove",
            denyButtonText: `Cancel`
            }).then(async (result) => {
            if (result.isConfirmed) {
                localStorage.setItem(`checkbox_${id}`, false);
                deleteScheduleById(id);
                schedules = await getSchedulesByEmail(user.email);
                start();
                if (allItems && schedules.length > 0) viewAll();
            } else if (result.isDenied) {}
        });
    } else {
            deleteScheduleById(id);
            start();
    }
}

async function viewAll() {
    const user = JSON.parse(localStorage.getItem('savedUser'));
    if (!user) {
        alert('User not logged in');
        return;
    }

    schedules = await getSchedulesByEmail(user.email);

    document.body.innerHTML = `
        <h1>All Schedules</h1>
        <button onclick="allItems = false; start()">Back to Dashboard</button>
        <div id="scheduleContainer"></div>
    `;

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

function startSmartSuggestions(type) {
    if (type === 'time') {
        !user ? start() : smartSuggestionsTime();
    } else {
        console.warn("Invalid type for smart suggestions.");
    }
}
setInterval(!user ? start : smartSuggestionsTime, 3600000);

function AIsuggestionORnot(suggestion) {
    for (const period in suggestions) {
        if (suggestions[period].includes(suggestion)) {
            return false;
        }
    }
    return true;
}

async function addXP(amount) {
    const user = JSON.parse(localStorage.getItem('savedUser'));
    if (!user) {
        console.warn("User not logged in, cannot add XP.");
        return;
    }
    let xp = await getXP();
    xp += amount;
    localStorage.setItem('xp_' + user.username, JSON.stringify(xp));

    try {
        await fetch(`https://timely-zc0n.onrender.com/users/${encodeURIComponent(user.email)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ xp })
        });
    } catch (error) {
        console.error('Failed to update XP in backend:', error);
    }

    if (amount > 0) {
        Swal.fire({
            title: `+${amount} XP!`,
            showConfirmButton: false,
            timer: 500,
            showProgressBar: false,
        });
    }
    updateXpDisplay();
    if (amount == 1) addProductivity(5);
    if (amount == 5) addProductivity(15);
}

function addProductivity(amount) {
    const productivity = document.getElementById('productivityMeter');
    if (!productivity) return;

    let value = Number(localStorage.getItem('productivity') || 0);
    value += amount;
    if (value < 0) value = 0;

    localStorage.setItem('productivity', value);
    productivity.value = value;
}

async function getXP() {
    const user = JSON.parse(localStorage.getItem('savedUser'));
    if (!user) return 0;
    try {
        const response = await fetch(`https://timely-zc0n.onrender.com/users/${encodeURIComponent(user.email)}`);
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('xp_' + user.username, JSON.stringify(data.xp));
            return data.xp;
        }
    } catch (error) {
        console.error('Failed to fetch XP from backend:', error);
    }
    return JSON.parse(localStorage.getItem('xp_' + user.username)) || 0;
}

async function updateXpDisplay() {
    const xpElement = document.getElementById('xpDisplay');
    if (xpElement) {
        const xp = await getXP();
        xpElement.textContent = `${xp} XP`;
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

async function notices() {
    const now = new Date();
    const todaysDate = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.body.innerHTML = `
        <h1>Notices for ${todaysDate}</h1>
        <p>We have officially launched Update 2.1.0! In this update, we bring to you our new AI assistant, T.I.M. (Timely <br>Intelligence Mechanism)
        T.I.M. helps you create schedules from a simple prompt, a costly but useful feature!
        <br>
        <br>
        <strong>That's all the notices for now! Come back another time for more!</strong></p>
        <button onclick="start()">Back to homepage</button>
    `
    await delay(1000);
    localStorage.setItem('notices2', true);
}

async function openNotices() {
    if (!localStorage.getItem('notices2')) await delay(5000); notices();
}

openNotices();

function decayProductivity() {
    const productivityMeter = document.getElementById('productivityMeter');
    if (productivityMeter) {
        let productivity = parseFloat(localStorage.getItem('productivity')) || 0;
        let lastActivity = parseInt(localStorage.getItem('lastActivityTimestamp')) || Date.now();

        const currentTime = Date.now();
        const timeElapsed = currentTime - lastActivity; // Time in milliseconds

        const decayIntervalMs = 3600000; // 1 hour in milliseconds
        const decayAmountPerHour = 5; // Amount productivity decreases per hour of inactivity

        // Calculate how many decay intervals have passed
        const intervalsPassed = Math.floor(timeElapsed / decayIntervalMs);

        if (intervalsPassed > 0) {
            productivity -= (intervalsPassed * decayAmountPerHour);
            if (productivity < 0) productivity = 0; // Ensure productivity doesn't go below 0

            localStorage.setItem('productivity', JSON.stringify(productivity));
            productivityMeter.value = productivity;

            // Update the last activity timestamp to reflect the decay applied
            localStorage.setItem('lastActivityTimestamp', JSON.stringify(lastActivity + (intervalsPassed * decayIntervalMs)));
        }   
    }
}

async function summariseDay() {
    const todaysTasks = schedules.filter(task => {
        const taskDate = task.itemDate.split("T")[0];
        return taskDate === pickedDate;
    });

    if (localStorage.getItem('summary')) {
            const prevTasks = localStorage.getItem('previousTasks');

            if (prevTasks && prevTasks === JSON.stringify(todaysTasks)) {
                return localStorage.getItem('summary');
            }
    }

    const sumPrompt = `You are Lumen AI, built to generate short, conversational daily summaries for the Timely app.
    Your output must be one paragraph, or two connected paragraphs at most.
    Speak casually, naturally, and directly to the user. No bullet points, no rigid formatting, no overly formal sign-offs.

    Only summarize tasks that belong to today’s date.
    The schedule data will include an ISO date string in itemDate.
    A task is considered “today” only if itemDate.split("T")[0] exactly matches the current date: ${pickedDate}.
    Ignore all other tasks, even if they look similar or recent.

    Rewrite all task names into natural, human descriptions.
    Do not repeat the task name verbatim.
    Example rewrites:

    “Eat food” → “eating food” or “eat something.”

    “Drink water” → “stay hydrated.”

    “Freelance work” → “put in some grind time.”

    “Gym” → “hit the gym” or “work out.”

    Tense Logic (follow EXACTLY):

    Before writing the summary, determine whether each activity is past, ongoing, or in the future by comparing its time with the current time.

    Use this logic:

    Convert all HH:MM times to minutes since midnight.

    Convert the current time (${new Date().toLocaleTimeString()}) to minutes since midnight.

    If endTime < currentTime: past tense (“you had,” “you wrapped up”).

    If startTime > currentTime: future tense (“you have coming up,” “you’re planning to”).

    If startTime ≤ currentTime ≤ endTime or the task has no end time: ongoing tense (“you’re currently doing”).

    Never assume a task already happened unless this comparison confirms it.

    Todays tasks:
    ${JSON.stringify(todaysTasks)}

    If there are no tasks for today, write a very short and friendly two-sentence message letting the user know nothing is logged and encourage them to plan tomorrow.
    `;
    const sumLoad = {
        type: 'chat',
        prompt: 'No prompt needed.',
        system: sumPrompt,
        model: 'gpt-3.5-turbo',
    };
    
    const sumRes = await fetch('https://lumen-ai.onrender.com/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sumLoad)
    }); 
    const sumData = await sumRes.json();
    let summary = sumData.response || sumData.reply || sumData.choices?.[0]?.message?.content || '';
    
    localStorage.setItem('previousTasks', JSON.stringify(todaysTasks));
    localStorage.setItem('summary', summary);
    return summary;
}

async function renderDashboard() {
    const user = JSON.parse(localStorage.getItem('savedUser'));
    const todaysDate = getLocalDate();

    const todaysTasks = schedules.filter(task => {
        const taskDate = task.itemDate.split("T")[0];
        return taskDate === todaysDate;
    });

    const todayCount = todaysTasks.length;
    const allCount = schedules.length;

    document.body.innerHTML = `
        <div class="app-wrapper">
            <div class="summary-card">
                <div class="summary-text">
                    <h1 class="greeting">Good ${getCurrentTime()}, ${user.username} 👋</h1>
                    <p class="subtitle">Here’s your game plan</p>
                    <div class="day-stats">
                        <div class="stat-box">
                            <span class="stat-number" id="taskCount">${todayCount}</span>
                            <span class="stat-label">tasks</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-number" id="streakCount">${await getXP()}</span>
                            <span class="stat-label">XP</span>
                        </div>
                    </div>
                    <p id="dailySummary" class="daily-summary">${await summariseDay() ? await summariseDay() : "Loading your day summary…"}</p>
                </div>
                <div class="lumen-orb" onclick="AImenu()"></div>
            </div>

            <div class="time-tabs">
                <button class="tab active" id="tabToday">Today</button>
                <button class="tab" id="tabAll">All Tasks</button>
            </div>

            <h2 class="tasks-title">Tasks</h2>

            <div id="scheduleContainer" class="task-list"></div>

            <button class="add-task-btn" onclick="newItem()">+ Add Task</button>
        </div>
    `;

    document.getElementById("tabToday").onclick = () => {
        document.getElementById("taskCount").textContent = todaysTasks.length;
        document.getElementById("tabToday").classList.add("active");
        document.getElementById("tabAll").classList.remove("active");
        allItems = false;
        pickedDate = todaysDate;
        data();
    };

    document.getElementById("tabAll").onclick = () => {
        document.getElementById("taskCount").textContent = schedules.length;
        document.getElementById("tabAll").classList.add("active");
        document.getElementById("tabToday").classList.remove("active");
        allItems = true;
        allData();
    };
}

function AImenu() {
    Swal.fire({
        title: "AI Control Panel",
        text: "Choose your operational pathway, chief.",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Chat with Lumen",
        cancelButtonText: "Smart Suggestions",
        reverseButtons: true,
        backdrop: true,
    }).then((result) => {
        if (result.isConfirmed) {
            lumenChat(); 
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            smartSuggestionsTime();
        }
    });
}

async function lumenChat() {
    document.body.innerHTML = `
        <div class="chat-wrapper">
            <div class="chat-card">
                <h2 class="chat-title">Lumen AI</h2>
                <button onclick="lumenChat()" class="chat-refresh" title="Refresh Chat">⟳</button>
                <div id="chatContainer" class="chat-container">
                    <div class="initial-suggestions">
                        <button onclick="document.getElementById('userInput').value = 'Generate a summary of my day'; lumenTalk();">Generate a summary of my day</button>
                        <button onclick="document.getElementById('userInput').value = 'Add Eat Food today at 3pm today'; lumenTalk();">Add Eat Food today at 3pm</button>
                        <button onclick="document.getElementById('userInput').value = 'Suggest productive tasks to do in my free time'; lumenTalk();">Suggest productive tasks to do in my free time</button>
                    </div>
                </div>


                <div class="chat-input-box">
                    <input type="text" id="userInput" placeholder="Ask Lumen anything..." class="chat-input">
                    <button onclick="lumenTalk()" class="chat-send">Send</button>
                </div>

                <button onclick="start()" class="chat-back">← Back</button>
            </div>
        </div>
    `;
}


let lumenHistory = [];

async function lumenTalk() {
    const inputEl = document.getElementById("userInput");
    const container = document.getElementById("chatContainer");

    if (!inputEl || !container) return;

    const userText = inputEl.value.trim();
    if (!userText) return;

    // Remove initial suggestions
    const suggestionButtons = document.querySelector('.initial-suggestions');
    if (suggestionButtons) suggestionButtons.remove();

    // Display user message
    container.innerHTML += `<div class="msg user-msg">${userText}</div>`;
    container.scrollTop = container.scrollHeight;

    // Save message to history
    lumenHistory.push({ role: "user", content: userText });
    inputEl.value = "";

    const todaysTasks = schedules.filter(
        task => task.itemDate.split("T")[0] === pickedDate
    );

    const lumenPrompt = `
        You are Lumen AI for the Timely app.

        ## CORE BEHAVIOR RULES (FOLLOW EXACTLY)

        0. If the user asks for suggestions, ideas, recommendations, or asks what they should do,
           reply in WORDS ONLY. Do NOT create tasks unless the user provides a clear task name.

        1. If the user gives a specific task name to add, output ONLY JSON object(s). No words.

        2. Never speak normally when generating JSON. JSON ONLY.

        3. JSON must include:
           id, username, email, password,
           itemName, itemDescription,
           itemDate, itemStart, itemEnd, itemCategory.

        4. ID = random number 0–999999999.

        5. itemName max 2 words; itemDescription max 4 words.

        6. Missing details:
           - description = "No description provided"
           - guess category
           - guess times if needed

        7. Multiple tasks → return array.

        8. Use TODAY unless user says otherwise.

        9. Never include errors or internal logic.

        10. "What's on my schedule?" → WORDS ONLY.

        11. Any question → WORDS ONLY.

        12. Day summary → WORDS ONLY.

        13. Never create tasks unless user clearly gives a task name.

        14. Friendly, casual tone in WORDS mode.

        15. Do NOT assume user wants a task added.

        Today's date: ${pickedDate}
        Current time: ${new Date().toLocaleTimeString()}
        User data: ${JSON.stringify(user)}
        Today's tasks: ${JSON.stringify(todaysTasks)}
        Full schedule: ${JSON.stringify(schedules)}
        Chat history: ${lumenHistory.map(m => `${m.role}: ${m.content}`).join(" | ")}
    `;

    const historyText = lumenHistory
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join("\n");

    const lumenLoad = {
        type: "chat",
        model: "gpt-5-mini",
        system: lumenPrompt,
        prompt: `${historyText}\nUSER: ${userText}\nASSISTANT:`
    };

    const lumenRes = await fetch("https://lumen-ai.onrender.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lumenLoad)
    });

    let replyRaw = "";
    let reply = "";

    try {
        const lumenData = await lumenRes.json();
        replyRaw = lumenData.response ||
                   lumenData.reply ||
                   lumenData.choices?.[0]?.message?.content ||
                   "";
        reply = replyRaw.trim();
    } catch (e) {
        reply = "Something broke on my end 😭 try again?";
    }

    lumenHistory.push({ role: "assistant", content: reply });

    const isJSON = reply.startsWith("{") || reply.startsWith("[");

    if (!isJSON) {
        container.innerHTML += `<div class="msg lumen-msg">${reply}</div>`;
        container.scrollTop = container.scrollHeight;
        return;
    }
    const parsed = extractJSONFromString(reply);

    if (!parsed) {
        container.innerHTML += `<div class="msg lumen-msg">I couldn't read that 😭 Try again?</div>`;
        return;
    }

    if (Array.isArray(parsed)) {
        for (const item of parsed) await addScheduleToBackend(item);
    } else {
        await addScheduleToBackend(parsed);
    }

    container.innerHTML += `<div class="msg ai-msg">Added to your schedule.</div>`;
    container.scrollTop = container.scrollHeight;
}


function getTodaysTasksWithStatus(schedules) {
    const today = new Date().toISOString().split("T")[0];

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return schedules
        .filter(task => task.itemDate.split("T")[0] === today)
        .map(task => {
            // Convert time "HH:MM" into minutes
            const toMinutes = t => {
                if (!t) return null;
                const [h, m] = t.split(":").map(Number);
                return h * 60 + m;
            };

            const start = toMinutes(task.itemStart);
            const end = task.itemEnd ? toMinutes(task.itemEnd) : null;

            // Determine tense
            let tense;
            if (end !== null && end < currentMinutes) {
                tense = "past";
            } else if (start > currentMinutes) {
                tense = "future";
            } else if (start <= currentMinutes && (end === null || currentMinutes <= end)) {
                tense = "ongoing";
            } else {
                tense = "future";
            }

            // Determine completion:
            // 1. If user ticked the checkbox → completed
            // 2. If end time passed AND no checkbox → completed by time
            // 3. Otherwise pending
            const checkboxDone = JSON.parse(localStorage.getItem(`checkbox_${task.id}`)) || false;

            const completedByTime = end !== null && end < currentMinutes;
            const completed = checkboxDone || completedByTime;

            return {
                ...task,
                tense,
                completed
            };
        });
}

function getLocalDate() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
}

function extractJSONFromString(str) {
    try {
        // Find the first { and last }
        const start = str.indexOf("{");
        const end = str.lastIndexOf("}");

        if (start === -1 || end === -1) return null;

        const jsonStr = str.slice(start, end + 1);
        return JSON.parse(jsonStr);

    } catch (e) {
        return null;
    }
}
