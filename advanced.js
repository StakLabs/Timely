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

//backend work

async function getSchedulesByEmail(email) {
    return await fetch(`https://timely-zc0n.onrender.com/items/${encodeURIComponent(email)}`)
        .then(response => response.json())
        .catch(error => {
            console.error('Error:', error);
            return [];
        });
}

async function deleteScheduleById(id) {
    try {
        const response = await fetch(`https://timely-zc0n.onrender.com/items/${id}`, {
            method: 'DELETE'
        });
        //start();
        if (!response.ok) {
            throw new Error('Failed to delete schedule');
        }
        return await response.json(); // or just return true if your API doesn't return data
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
        //start();
        if (!response.ok) {
            throw new Error('Failed to delete schedule');
        }
        return await response.json(); // or just return true if your API doesn't return data
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function addScheduleToBackend(schedule) {
    // Convert to required backend format
    const formattedSchedule = {
        itemCategory: schedule.category || 'other',
        itemDate: schedule.date,
        itemDescription: schedule.description || "No description provided",
        email: schedule.email,
        itemEnd: schedule.ending || null,
        id: schedule.id,
        itemName: schedule.name,
        itemStart: schedule.starting || null,
        username: schedule.username, // Make sure to include username and password if needed
        password: schedule.password
    };

    try {
        const response = await fetch('https://timely-zc0n.onrender.com/items/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formattedSchedule)
        });
        if (!response.ok) {
            throw new Error('Failed to add schedule');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function start() {
    const user = JSON.parse(localStorage.getItem('savedUser')) || null;

    if (!user) {
        document.body.innerHTML = `
            <h1>Error Code 402 - Payment Required, Not Logged In</h1>
            <p>Please log in to access Timely.</p>
            <button onclick="window.location.href='https://ayaan-creator-web.github.io/Timely/'">Go to Login</button>
        `;
        return;
    }

    schedules = await getSchedulesByEmail(user.email);
    //console.log("Schedules:", schedules);

    if (schedules.length === 0) {
        document.body.innerHTML = `
            <button id="noticesButton" onclick="notices()" style="position: absolute; top: 20px; left: 20px; background-color: #1976D2; color: white; padding: 10px 15px; border-radius: 8px; border: none; cursor: pointer; font-size: 16px;">Notices</button>
            <div id="timeDisplay"></div>
            <p id="xpDisplay">${getXP()} XP</p>
            <h1>Good ${getCurrentTime()}, ${user.username}!</h1>
            <div class="button-container">
                <button onclick="startSmartSuggestions('time')">Smart Suggestions</button>
                <button onclick="newItem()">Add New Item</button>
                <button onclick="newPreset()">Add New Preset</button>
                <button id="logout" onclick="logout();">Logout</button>
            </div>
            <div id="scheduleContainer"></div>
        `;
    } else {
        /*
            <select id="categorySelector" onchange="data(this.value)">
                <option value="All">All Categories</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="shopping">Shopping</option>
                <option value="todo">To-Do</option>
                <option value="other">Other</option>
            </select>
        */
        document.body.innerHTML = `
            <button id="noticesButton" onclick="notices()" style="position: absolute; top: 20px; left: 20px; background-color: #1976D2; color: white; padding: 10px 15px; border-radius: 8px; border: none; cursor: pointer; font-size: 16px;">Notices</button>
            <div id="timeDisplay"></div>
            <br>
            <br>
            <a onclick="addXP(10);" href="whatsapp://send?text=Timely%20changed%20my%20routine!%20Create%20an%20account%20here:%20https://ayaan-creator-web.github.io/Timely/" data-action="share/whatsapp/share">Refer Timely to a Friend for 10 Bonus XP!</a>
            <p id="xpDisplay">${getXP()} XP</p>
            <h1>Good ${getCurrentTime()}, ${user.username}!</h1>
            <div class="button-container">
                <button id="logout" onclick="logout();">Logout</button>
                <button onclick="startSmartSuggestions('time')">Smart Suggestions</button>
                <button onclick="newItem()">Add Item</button>
                <button onclick="newPreset()">Add Preset</button>
                <button onclick="removeAll();">Remove all Items</button>
                <button onclick="allItems = true; viewAll();">View All Items</button>
            </div>
            <input type="date" id="datePicker" value="${pickedDate}" onchange="pickedDate = this.value; start();">
            <div id="scheduleContainer"></div>
        `;
       //container = document.querySelector('#scheduleContainer');
        // get a selected value of dropdown here assign into variable
       // const selectedCeategory = document.getElementById('categorySelector').value;
       data();
    }

    if (document.getElementById('xpDisplay')) {
        setInterval(updateXpDisplay, 1000);
    }
    addGeneralStyles();
    addStyles();
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
        window.location.href = 'https://ayaan-creator-web.github.io/Timely/';
        }
    });
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

async function data(selectedCategory) {
    //selectedCategory = selectedCategory.toLowerCase();

    const filteredSchedulesByDate = allItems ? schedules : schedules.filter(schedule => (new Date(schedule.itemDate).toLocaleDateString()).replaceAll('/', '-')
         === (new Date(pickedDate).toLocaleDateString()).replaceAll('/', '-'));
    console.log(filteredSchedulesByDate);
    //debugger;
    filteredSchedulesByDate.forEach((schedule) => {
        const id = schedule.id;
        const name = schedule.itemName;
        let description = schedule.itemDescription;
        description = description || 'No description provided'
        const date = schedule.itemDate;
        const starting = schedule.itemStart;
        const ending = schedule.itemEnd;
        let category = schedule.itemCategory;
        container = document.querySelector('#scheduleContainer');
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
                <button onclick="newItem('${name.replace(/'/g, "\\'")}', '${description.replace(/'/g, "\\'")}', '${starting || ''}', '${ending || ''}', '${category}', '${date}', ${id})">Edit</button>
                <button onclick="remove(${id})">Remove</button>
            </div>
        `;
    });

    finalFilteredSchedules.forEach((schedule) => {
        const { id } = schedule;
        const checked = JSON.parse(localStorage.getItem(`checkbox_${id}`)) || false;
        const checkbox = document.getElementById("checkbox_" + id);
        if (checkbox) checkbox.checked = checked;


        done(id);
    });

    addStyles();
}

async function allData(selectedCategory = 'All') {
    container.innerHTML = '';
    /*const filteredSchedules = selectedCategory === 'All'
        ? schedules
        : schedules.filter(schedule => schedule.category === selectedCategory);*/
    let filteredSchedules = schedules;
    filteredSchedules.forEach((schedule) => {
        //const { ending, starting, date, id, name, description, category } = schedule;
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
                <p>Date: ${(new Date(date).toLocaleDateString()).replaceAll('/', '-')/*.replace('T14:00:00.000Z', '')*/}</p>
                <p>${starting ? 'Start Time: ' + starting : ''}</p>
                <p>${ending ? 'End Time: ' + ending : ''}</p>
                <p>Category: ${category}</p>
                <button onclick="newItem('${name.replace(/'/g, "\\'")}', '${description.replace(/'/g, "\\'")}', '${starting || ''}', '${ending || ''}', '${category}', '${date}', ${id})">Edit</button>
                <button onclick="remove(${id})">Remove</button>
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

    addStyles();
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
    //debugger;

    const itemId = id ? id : null;

    document.body.innerHTML = `
        <h2>${itemId ? 'Edit Schedule' : 'Add Schedule'}</h2>
        <form id="scheduleForm">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" value="${name}" required>
            <label for="description">Description:</label>
            <textarea id="description" name="description">${description}</textarea>
            <label for="date">Date:</label>
            <input type="date" id="date" name="date" value="${date.replace('T14:00:00.000Z', '')}" required>
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

    // Find the max id in current schedules
    let maxId = 0;
    if (Array.isArray(schedules) && schedules.length > 0) {
        maxId = Math.max(...schedules.map(s => Number(s.id) || 0));
    }
    const newId = maxId + 1;

    if (name && date) {
        const newSchedule = {
            id: newId,
            name,
            description: description || "No description provided",
            date: date,
            starting: starting || null,
            ending: ending || null,
            category: itemCategory || 'other',
            email: user.email, // if needed by backend
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
                //localStorage.setItem('deletedItem', JSON.stringify(schedules.filter(schedule => schedule.id === id)));
                /*schedules = schedules.filter(schedule => schedule.id !== id);
                localStorage.setItem('schedules_' + user.username, JSON.stringify(schedules));*/
                deleteScheduleById(id);
                schedules = await getSchedulesByEmail(user.email);
                start();
                /*Swal.fire({
                    toast: true,
                    text: "Item removed successfully",
                    position: 'bottom',
                    timer: 5000,
                    timerProgressBar: true,
                    showConfirmButton: true,
                    confirmButtonText: 'Undo',
                    confirmButtonColor: '#3085d6',
                }).then((result) => {a
                    if (result.isConfirmed) {
                        const deletedItem = JSON.parse(localStorage.getItem('deletedItem'));
                        if (deletedItem && deletedItem.length > 0) {
                            schedules.push(deletedItem[0]);
                            localStorage.setItem('schedules_' + user.username, JSON.stringify(schedules));
                            localStorage.removeItem('deletedItem');
                            start();
                        }
                    }
                })*/
                if (allItems && schedules.length > 0) viewAll();
            } else if (result.isDenied) {}
        });
    } else {
            deleteScheduleById(id);
            start();
            /*schedules = schedules.filter(schedule => schedule.id !== id);
            localStorage.setItem('schedules_' + user.username, JSON.stringify(schedules));*/
    }
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

async function viewAll() {
    const user = JSON.parse(localStorage.getItem('savedUser'));
    if (!user) {
        alert('User not logged in');
        return;
    }

    schedules = await getSchedulesByEmail(user.email);

    /*
        <select id="categorySelector" onchange="allData(this.value);">
            <option value="All">All Categories</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="shopping">Shopping</option>
            <option value="todo">To-Do</option>
            <option value="other">Other</option>
        </select>
    */

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
    let xp = await getXP(); // get XP from backend
    xp += amount;
    localStorage.setItem('xp_' + user.username, JSON.stringify(xp));

    // Update XP in backend
    try {
        await fetch(`http://localhost:3306/users/${encodeURIComponent(user.email)}`, {
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
}

async function getXP() {
    const user = JSON.parse(localStorage.getItem('savedUser'));
    if (!user) return 0;
    try {
        const response = await fetch(`http://localhost:3306/users/${encodeURIComponent(user.email)}`);
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('xp_' + user.username, JSON.stringify(data.xp));
            return data.xp;
        }
    } catch (error) {
        console.error('Failed to fetch XP from backend:', error);
    }
}

async function updateXpDisplay() {
    const xpElement = document.getElementById('xpDisplay');
    if (xpElement) {
        const xp = await getXP();
        xpElement.textContent = `${xp} XP`;
    }
}

async function getXP() {
    try {
        const response = await fetch(`https://timely-zc0n.onrender.com/users/${encodeURIComponent(user.email)}`);
        if (response.ok) {
            const data = await response.json();
            return data.xp;
        }
    } catch (error) {
        console.error('Failed to fetch XP from backend:', error);
    }
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

async function displayTime() {
    while (true) {
        await delay(100);
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        document.getElementById('timeDisplay').innerText = time;
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
        <p>Thank you for your patience for Timely 2.0.0! We aim to release this new version around the start<br>
        of July. All current user data will be removed, meaning that your account will be reset. As mentioned in the<br>
        previous notice, all user data will be erased as we will be re-writing how the app works
        <br>
        <br>
        This will be one of our last calls for user data. If you would like to be able to restore data, please<br>
        contact us at the same email you signed up for Timely with, and provide us any account details you<br>
        want to be saved and restored.
        <br>
        <br>.
        We are currently working on Update 2.0.0 and are progressing well! We expect for the update to release earlier<br>
        than expected, perhaps tomorrow or early July.
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

displayTime();

/* Update 2.0.0
    Cloud Sync using Backend
*/
