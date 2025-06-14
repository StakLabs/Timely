window.start = start;
window.newItem = newItem;
window.removeAll = removeAll;
window.viewAll = viewAll;
window.addItem = addItem;

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

const currentTime = getCurrentTime();

//let pickedCat = 'Select Category';

const user = JSON.parse(localStorage.getItem('savedUser')) || null;

let presets = JSON.parse(localStorage.getItem('presets_' + user.username)) || [];

let timeSuggestions = JSON.parse(localStorage.getItem('timeSuggestions_' + currentTime + '_' + user.username)) || suggestions[currentTime];

localStorage.setItem('suggestions', JSON.stringify(suggestions));
localStorage.setItem('timeSuggestions_' + currentTime + '_' + user.username, JSON.stringify(timeSuggestions));

const variables = {};

let listedItems;

let category = 'other';

var container;

let allItems = false;

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
    const user = JSON.parse(localStorage.getItem('savedUser')) || null;

    if (!user) {
        document.body.innerHTML = '<h1 style="color: red;">You are not logged in. Please log in to access this page.</h1>';
        return;
    }

    schedules = JSON.parse(localStorage.getItem('schedules_' + user.username)) || [];

    if (schedules.length == 0) {
        document.body.innerHTML = `
            <h1>Welcome, ${user.username}!</h1>
            <button onclick="newItem()">Add New Item</button>
            <button onclick="newPreset()">Add New Preset</button>
            <br>
            <div id="scheduleContainer"></div>
        `
        shouldRender();
    } else {
        document.body.innerHTML = `
            <h1>Welcome, ${user.username}!</h1>
            <button onclick="newItem()">Add New Item</button>            
            <button onclick="newPreset()">Add New Preset</button>
            <button onclick="removeAll();">Remove all Items</button>
            <button <button onclick="allItems = true; viewAll();">View All Items</button>
            <input type="date" id="datePicker" value="${pickedDate}" onchange="pickedDate = this.value; start();">
            <br>
            <div id="scheduleContainer"></div>
        `;
        container = document.querySelector('#scheduleContainer');
        data();
    }
}

/*<select value="pickedCat" id=catpicker onchange="pickedCat = this.value; start();">
                <option>Select Category</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Other">Other</option>
            </select>*/

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

/*<select id=catpicker onchange="category = this.value;">
                <option>Select Category</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Other">Other</option>
            </select>*/

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
        //notifyAdd();
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

function removeAll() {
    const user = JSON.parse(localStorage.getItem('savedUser'));
    if (!user) return;
    Swal.fire({
        title: "Are you sure you want to remove all items?",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Remove",
        denyButtonText: `Cancel`
        }).then((result) => {
        if (result.isConfirmed) {
            schedules = [];
            localStorage.setItem('schedules_' + user.username, JSON.stringify(schedules));
            start();
        } else if (result.isDenied) {}
    });
}

async function data() {
    let items = schedules.length;
    schedules.forEach((schedule) => {
        const { ending, starting, date, id, name, description } = schedule;
        //if (date == pickedDate) {
           // if (pickedCat) if (pickedCat == category) {
                container.innerHTML += `
                    <br>
                    <div class="item">
                        <h2>${name}</h2>
                        <p>${description}</p>
                        <p>${starting ? 'Start Time: ' + starting : ''}</p>
                        <p>${ending ? 'End Time: ' + ending : ''}</p>
                        <button onclick="remove(${id})">Remove</button>
                    </div>
                `;
            //};
        //}
    });
    addStyles();
    shouldRender();
}

async function allData() {
    container.innerHTML = ''; // clear before showing all
    schedules.forEach((schedule) => {
        const { ending, starting, date, id, name, description } = schedule;
        container.innerHTML += `
            <div class="item">
                <h2>${name}</h2>
                <p>${description}</p>
                <p>Date: ${date}</p>
                <p>${starting ? 'Start Time: ' + starting : ''}</p>
                <p>${ending ? 'End Time: ' + ending : ''}</p>
                <button onclick="remove(${id})">Remove</button>
            </div>
        `;
    });
    addStyles();
    shouldRender();
}

function newItem(name, description, starting, ending, category) {
    const user = JSON.parse(localStorage.getItem('savedUser'));
    if (!name) name = '';
    if (!description) description = '';
    if (!starting) starting = null;
    if (!ending) ending = null;
    const currentDate = new Date().toISOString().split('T')[0];
    document.body.innerHTML = `
        <h2>Add New Schedule</h2>
        <form id="scheduleForm">
            <label for="name" value>Name:</label>
            <input type="text" id="name" name="name" value="${name}"required>
            <label for="description">Description:</label>
            <input type="text" id="description" name="description" value="${description}">
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
        //notifyAdd();
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
    } else {
        alert('Please fill in name and date fields.');
    }
}

async function shouldRender() {
    while (listedItems !== items) {
        await delay(1000);
        data();
    }
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
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            schedules = schedules.filter(schedule => schedule.id !== id);
            localStorage.setItem('schedules_' + user.username, JSON.stringify(schedules));
            start();
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
    }

    .item {
      border: 3px solid #333;
      padding: 16px;
      border-radius: 10px;
      background-color: #e7f8e9;
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
      color: #245d2f;
    }

    .item p {
      margin: 4px 0;
      color: #3b3b3b;
      font-size: 14px;
    }

    .item button {
      margin-top: 10px;
      padding: 8px;
      background-color: white;
      border: 2px solid #245d2f;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
    }

    .item button:hover {
      background-color: #cce5cc;
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

function notifyAdd() {
    /*
    console.log('Notification permission:', Notification.permission);
    if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                new Notification('Timely', {
                    body: 'New item added successfully!'
                });
            }
            if (permission === 'denied') {
                alert('Please enable notifications in your browser settings to receive reminders.');
            }
            if (permission === 'default') {
                alert('Please enable notifications in your browser settings to receive reminders.');
            }
        });
    } else if (Notification.permission === 'granted') {
        new Notification('Timely', {
            body: 'New item added successfully!'
        });
    }
        */
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

    //console.log("Current time:", currentTime);
    //onsole.log("Today's date:", currentDate);

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

        //console.log("Checking schedule:", schedule);

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
                    <b>Timely Insight:</b> May I suggest <i>${randomSuggestion}</i>?
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

smartSuggestionsTime(); // initial call

setInterval(smartSuggestionsTime, 3600000); // every hour
