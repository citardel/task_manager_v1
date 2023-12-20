import { task_manager_backend } from "../../declarations/task_manager_backend";


// DECLARE All Task as global variable
let allTasks = []; 


// TIMESTAMP Conversions
function formatTimestamp(timestamp) {
const dateObj = new Date(Number(timestamp));
const year = dateObj.getFullYear();
// Months in JavaScript are indexed from 0, so add 1
const month = dateObj.getMonth() + 1; 
const day = dateObj.getDate();
return `${year}-${month}-${day}`;
}


// CREATE Task element
function createTaskElement(task, index) {
const taskElement = document.createElement("div");
taskElement.classList.add("task");

// Format the timestamp to a read data with formatTimestamp
const formattedDate = formatTimestamp(task.dueDate);
// Create the task DOM data for the task
taskElement.innerHTML = `
<div class="task-container" id="data-task-id">
<p class="t-id">${index}<p/>
<h2 class="t-title">${task.title}</h2>
<p class="t-description">${task.description}</p>
<div class="btn">
<button id="edit-btn"><a href="#editForm"><i class="fa-light fa-pen-to-square"></i></a></button>
<button id="delete-btn"><i class="fa-light fa-trash"></i></button>
</div>
<div class="t-time">Date: ${formattedDate}</div>
</div>
`;
// Save the task DOM data in the respective properties
if (task.completed) {
taskElement.classList.add("task-completed");
} else {
taskElement.classList.add("task-pending");
}
// Switch the state of the task
taskElement.addEventListener("click", async () => {
// Obtain the ID of the task by index
const taskId = index; 
try {
let updateTasks;
if (task.completed) {
// Mark as pending in the backend
await task_manager_backend.markAsPending(taskId); 
// Update the state of the task
updateTasks = { ...task, completed: false };
} else {
// Mark as completed in the backend
await task_manager_backend.markAsCompleted(taskId); 
// Update the state of the task
updateTasks = { ...task, completed: true }; 
}
console.log(`Task with ID ${taskId} has had its state switched.`);
alert(`🔀Changing the status of task ID: ${taskId}...`);
callAllTasks();
} catch (error) {
console.error("Error updating task status:", error);
alert("Error updating task status:", error);
}
});
return taskElement;
}


// GET All Tasks
async function callAllTasks() {
allTasks = await task_manager_backend.getAllTasks();
console.log("All Tasks:", allTasks);
const pendingTab = document.querySelector(".pending-tab");
const completedTab = document.querySelector(".completed-tab");

// Clean the content
pendingTab.innerHTML = "";
completedTab.innerHTML = "";
// Add the index as second argument
allTasks.forEach((task, index) => {
// Yse this index in the fuction
const taskElement = createTaskElement(task, index);
if (task.completed) {
completedTab.appendChild(taskElement);
} else {
pendingTab.appendChild(taskElement);
}
});
}



// ADD Task
async function addTasks(task) {
const taskId = await task_manager_backend.addTasks(task);
task.id = taskId;
console.log(`Task ${taskId} added successfully.`);
alert(`🆕Adding ${taskId}...`);
callAllTasks();
return createTaskElement(task, allTasks.length);
}



// EDIT Task
async function editTaskById(taskId, newTask) {
try {
await task_manager_backend.updateTasks(taskId, newTask);
console.log(`Task ${taskId} has been editing.`);
alert(`✏️Editing task ${taskId}...`);
callAllTasks();
} catch (error) {
console.error("Error editing task:", error);
alert("Error editing task:", error);
}
}



// DELETE Task --ANGELA YU's METHOD
async function deleteTaskById(taskId) {
try {
await task_manager_backend.deleteTasks(taskId);
console.log(`Task ${taskId} deleted successfully.`);
alert(`❌Deleting task ${taskId}...`);
// Call callAllTasks for update the tasks
callAllTasks();
} catch (error) {
console.error("Error deleting task:", error);
alert("Error deleting task:", error);
}
}



// SEARCH By text
document.querySelector("#searchForm").addEventListener("submit", async (e) => {
e.preventDefault();
const searchButton = document.querySelector(".b-search");
searchButton.setAttribute("disabled", true);
const searchTerm = document.getElementById("name").value;
if (searchTerm.trim() === "") {
alert("Please enter a search term");
searchButton.removeAttribute("disabled");
return;
}
try {
// Show the div "found" and his content
const foundSection = document.querySelector("result");
const resultTab = document.querySelector("result-tab");
resultTab.innerHTML = "<h2>Looking for tasks...</h2>";
foundSection.style.display = "block";
const searchResults = await searchTasks(searchTerm);
if (searchResults.length === 0) {
resultTab.innerHTML = "<h2>No results found</h2>";
} else {
const resultsHTML = searchResults.map((task, index) => {
const formattedDate = formatTimestamp(task.dueDate);
return `
<div class="task-container" id="data-task-id">
<p class="t-id">${index}<p/>
<h2 class="t-title">${task.title}</h2>
<p class="t-description">${task.description}</p>
<div class="btn">
<button id="edit-btn"><a href="#editForm"><i class="fa-light fa-pen-to-square"></i></a></button>
<button id="delete-btn"> <i class="fa-light fa-trash"></i></button>
</div>
<div class="t-time">Date: ${formattedDate}</div>     
</div>
`;
}).join("");
resultTab.innerHTML = resultsHTML;
}
} catch (error) {
console.error("Error searching Tasks:", error);
alert("Error searching Tasks:", error);
}
searchButton.removeAttribute("disabled");
return false;
});



// ADD Task to DOM
document.querySelector("#addForm").addEventListener("submit", async (e) => {
e.preventDefault();
const addButton = document.querySelector(".b-create");
addButton.setAttribute("disabled", true);
const title = document.getElementById("f-add-title").value;
const description = document.getElementById("f-add-description").value;
const dateInput = document.getElementById("f-add-time");
const selectedDate = dateInput.value;
const timestamp = Date.parse(selectedDate);
// Verify timestamp
if (isNaN(timestamp)) {
console.error("Invalid date");
alert("Invalid date");
addButton.removeAttribute("disabled");
return;
}
// Validate title length
if (title.length > 63) {
console.error(`Title exceeds maximum length (${title.length}/${64})`);
alert(`⚠️Your title exceeds maximum length (${title.length}/${64})`);
addButton.removeAttribute("disabled");
return;
}
// Validate description length
if (description.length > 127) {
console.error(`Description exceeds maximum length (${description.length}/${128})`);
alert(`⚠️Your description exceeds maximum length (${description.length}/${128})`);
addButton.removeAttribute("disabled");
return;
}
const task = { title: title, 
  description: description, 
  dueDate: timestamp, 
  completed: false };
const taskElement = await addTasks(task);
const pendingTab = document.querySelector(".pending-tab");
pendingTab.appendChild(taskElement);
addButton.removeAttribute("disabled");
// Refresh the list
callAllTasks();
return false;
});



// EDIT task from DOM
const editForm = document.querySelector("#editForm");
editForm.addEventListener("submit", async (e) => {
e.preventDefault();
const taskId = parseInt(document.getElementById("f-edit-taskId").value, 10);
const title = document.getElementById("f-edit-title").value;
const description = document.getElementById("f-edit-description").value;
const time = document.getElementById("f-edit-time").value;
const dueDate = Date.parse(time);
// Validate title length
if (title.length > 64) {
console.error(`Title exceeds maximum length (${title.length}/${64})`);
alert(`⚠️Your title exceeds maximum length (${title.length}/${64})`);
return;
}
// Validate description length
if (description.length > 128) {
console.error(`Description exceeds maximum length (${description.length}/${128})`);
alert(`⚠️Your description exceeds maximum length (${description.length}/${128})`);
return;
}
if (isNaN(dueDate)) {
console.error("Invalid time");
alert("Invalid time");
return;
}
const task = { title: title,
  description: description,
  dueDate: dueDate,
  completed: false };
editTaskById(taskId, task);
});

// DELETE task from DOM --ANGELA YU'S METHOD
// Assuming taskContainer is the container where tasks are added
const taskContainer = document.getElementsByClassName("task-container");

taskContainer.addEventListener("click", async (e) => {
    const target = e.target;

    // Check if the clicked element is a delete button
    if (target.classList.contains("delete-btn")) {
        // Retrieve the task ID from the data-task-id attribute
        const taskId = target.getAttribute("data-task-id");

        // Check if taskId is a valid number and within the range
        if (!isNaN(taskId) && taskId >= 0 && taskId < allTasks.length) {
            await deleteTaskById(parseInt(taskId));

            // Remove the task element from the HTML
            const taskElementToRemove = document.querySelector(`[data-task-id="${taskId}"]`);
            if (taskElementToRemove) {
                taskElementToRemove.remove();
            }
        } else {
            console.error("Invalid task ID. Unable to delete task.");
            alert("Invalid task ID. Unable to delete task.");
        }
    }

});



//SEARCH By text DOM
async function searchTasks(searchTerm) {
try {
const searchResults = await task_manager_backend.searchTasks(searchTerm);
console.log("Search Results:", searchResults);
return searchResults;
} catch (error) {
console.error("No search found:", error);
throw error;
}
}



// windows
window.addEventListener("DOMContentLoaded", async () => {
await callAllTasks();
});