let listedItems;

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

    if (schedules.length === 0) {
        shouldRender();
    } else {
        document.body.innerHTML = `
            <h1>Welcome, ${user.username}!</h1>
            <button onclick="newItem()">Add New Item</button>
            <button onclick="removeAll();">Remove all Items</button>
            <input type="date" id="datePicker" value="${pickedDate}" onchange="pickedDate = this.value; start();">
            <br>
            <div id="scheduleContainer"></div>
            <script src="t.js"></script>
        `;
        data();
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function removeAll() {
    const user = JSON.parse(localStorage.getItem('savedUser'));
    if (!user) return;

    schedules = [];
    localStorage.setItem('schedules_' + user.username, JSON.stringify(schedules));
    start();
}

async function data() {
    let items = schedules.length;
    schedules.forEach((schedule) => {
        const { ending, starting, date, id, name, description } = schedule;
        const container = document.querySelector('#scheduleContainer')
        if (date == pickedDate) {
            container.innerHTML += `
            <br>
            <div class="item">
                <h2>${name}</h2>
                <p>${description}</p>
                <p>Date: ${date}</p>
                <p>${starting ? 'Start Time: ' + starting : ''}</p>
                <p>${ending ? 'End Time: ' + ending : ''}</p>
                <button onclick="remove(${id})">Remove</button>
            </div>
        `;
        }
    });
    addStyles();
    shouldRender();
}

function newItem() {
    document.body.innerHTML = `
        <h2>Add New Schedule</h2>
        <form id="scheduleForm">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required>
            <label for="description">Description:</label>
            <input type="text" id="description" name="description">
            <label for="date">Date:</label>
            <input type="date" id="date" name="date" required>
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
            <button type="button" onclick="addItem()">Add Schedule</button>
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
    } else {
        alert('Please fill in name and date fields.');
    }
}

async function shouldRender() {
    if (schedules.length === 0) {
        document.body.innerHTML += '<h1>No items found. <a onclick="newItem()">Please add an item by clicking here.</a></h1>';
    } else {
        while (listedItems !== items) {
            await delay(1000);
            data();
        }
    }
}

function remove(id) {
    const user = JSON.parse(localStorage.getItem('savedUser'));
    if (!user) return;

    schedules = schedules.filter(schedule => schedule.id !== id);
    localStorage.setItem('schedules_' + user.username, JSON.stringify(schedules));
    start();
}

function addStyles() {
  const style = document.createElement('style');
  style.innerHTML = `
    #scheduleContainer {
      width: 100%;
    }
    .item {
      display: inline-block;
      border: 3px solid #333;
      padding: 8px 12px;
      margin-bottom: 10px;
      border-radius: 5px;
    }
  `;
  document.head.appendChild(style);
}