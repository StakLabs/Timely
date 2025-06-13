window.start = start;
window.newItem = newItem;
window.removeAll = removeAll;
window.viewAll = viewAll;
window.addItem = addItem;

const suggestions = {
    'Early Morning': [
        'Morning Yoga', 'Breakfast', 'Reading', 'Meditation', 'Stretching',
        'Journaling', 'Plan the Day', 'Go for a Walk',
        'Check News Headlines', 'Feed Pets', 'Water Plants'
    ],
    'Morning': [
        'Work on Project', 'Team Meeting', 'Coffee Break', 'Review Emails',
        'Check Industry News', 'Write Code', 'Design a Presentation', 'Brainstorm Ideas',
        'Meet a Colleague', 'Review a Report', 'Listen to Business Podcast', 'Analyze Data',
        'Respond to Client Queries', 'Take a Walk Outside', 'Sketch a UI Design',
        'Research Productivity Hacks', 'Check Task Progress', 'Learn a New Skill',
        'Do a 10-minute Workout', 'Write a Blog Post', 'Prepare Meeting Notes',
        'Work on a Creative Task', 'Experiment with a New Work Style', 'Try a Pomodoro Session',
        'Review Competitor Trends', 'Write a Business Proposal', 'Catch Up on Work Messages',
        'Organize Work Desk', 'Prepare a Brief Presentation', 'Discuss a New Strategy',
        'Research Latest Innovations', 'Improve Writing Skills', 'Review a Book Summary',
        'Network with Colleagues', 'Take Detailed Notes on a Topic', 'Sketch Out a Concept',
        'Listen to Classical Music', 'Research Investment Ideas', 'Plan a Work Strategy',
        'Prepare a Spreadsheet', 'Try Digital Note-taking', 'Review Calendar Events',
        'Read a Work-related Article', 'Watch a TED Talk', 'Create an Infographic',
        'Write a Work-related Reflection', 'Test a New Work Tool', 'Review Personal Finance',
        'Plan a Side Project', 'Start a Coding Challenge', 'Practice a Professional Skill',
        'Analyze a Business Model', 'Organize Project Documents', 'Review a Portfolio',
        'Catch Up on Industry Trends', 'Study Leadership Principles', 'Learn a Financial Tip',
        'Plan a Knowledge-Sharing Session', 'Create a Productivity Guide', 'Try a Business Experiment'
    ],
    'Afternoon': [
        'Lunch Break', 'Client Call', 'Report Writing', 'Go for a Walk', 'Reply to Emails',
        'Read Industry News', 'Practice Public Speaking', 'Organize Files', 'Brainstorm Ideas',
        'Listen to a Podcast', 'Try a Mindfulness Exercise', 'Work on a Creative Task', 'Do Some Sketching',
        'Write an Article', 'Check Financial Markets', 'Review Meeting Notes', 'Plan Next Steps',
        'Test a New Work Strategy', 'Listen to Relaxing Music', 'Check Off Tasks', 'Attend a Webinar',
        'Try a Mental Puzzle', 'Call a Friend', 'Schedule Meetings', 'Research a New Skill',
        'Build a Spreadsheet Model', 'Prepare a Sales Pitch', 'Write Down Key Takeaways', 'Plan an Event',
        'Study a Foreign Language', 'Review Business Strategies', 'Create a Budget Tracker', 'Plan the Rest of the Day'
    ],
    'Evening': [
        'Gym', 'Dinner with Family', 'Relaxation'
    ],
    'Night': [
        'Watch a Movie', 'Prepare for Tomorrow', 'Sleep', 'Reflect on the Day', 'Read a Book'
    ]
};

const currentTime = getCurrentTime();

let timeSuggestions = JSON.parse(localStorage.getItem('timeSuggestions')) ? JSON.parse(localStorage.getItem('timeSuggestions')) : suggestions[currentTime];

localStorage.setItem('suggestions', JSON.stringify(suggestions));
localStorage.setItem('timeSuggestions', JSON.stringify(timeSuggestions));

const variables = {};

let listedItems;

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
            <br>
            <div id="scheduleContainer"></div>
        `
        shouldRender();
    } else {
        document.body.innerHTML = `
            <h1>Welcome, ${user.username}!</h1>
            <button onclick="newItem()">Add New Item</button>
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

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
        if (date == pickedDate) {
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
        }
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

function newItem(defaultName) {
    if (!defaultName) defaultName = '';
    const currentDate = new Date().toISOString().split('T')[0];
    document.body.innerHTML = `
        <h2>Add New Schedule</h2>
        <form id="scheduleForm">
            <label for="name" value>Name:</label>
            <input type="text" id="name" name="name" value="${defaultName}"required>
            <label for="description">Description:</label>
            <input type="text" id="description" name="description">
            <label for="date">Date:</label>
            <input type="date" id="date" name="date" value="${currentDate}" required>
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
            <button type="button" id="Add" onclick="addItem()">Add Schedule</button>
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
    localStorage.setItem('timeSuggestions', JSON.stringify(timeSuggestions));


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

    console.log("Current time:", currentTime);
    console.log("Today's date:", currentDate);

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

        console.log("Checking schedule:", schedule);

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
    const currentTime = getCurrentTime();
    const randomSuggestion = timeSuggestions[Math.floor(Math.random() * timeSuggestions.length)];
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: `Timely Insight: May I suggest ${randomSuggestion}?`,
        showConfirmButton: true,
        confirmButtonText: 'Add Task',
        showDenyButton: true,
        denyButtonText: 'Dismiss',
        timer: 10000,           // auto close after 10 seconds
        timerProgressBar: true,
        didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    }).then((result) => {
        if (result.isConfirmed) {
        newItem(randomSuggestion);
        } else if (result.isDenied) {}})
};

smartSuggestionsTime(); // initial call

setInterval(smartSuggestionsTime, 3600000); // every hour
