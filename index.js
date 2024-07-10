const mainDisplay = document.querySelector('.main-display-area')
const addBtn = document.querySelector('.add-task-btn');
const removeBtn = document.querySelector('.remove-task-btn');
const task_form = document.querySelector('.new-task-form');
const task_status_colors = document.querySelectorAll('.color-selector')
const toolbarColors = document.querySelectorAll('.color') 
const noTasksDisplayMsg = document.querySelector('.no-tasks-display-msg')
const lockClass = 'fa-lock'
const unlockClass = 'fa-lock-open'

let tickets = document.querySelectorAll('.ticket-container')
let addTaskFlag = false;
let removeTaskFlag = false;
// let taskId = 1;
let ticket_status_color = 'lightpink' 
let lock_icon_clicked = false;
const colorsList = ['lightblue', 'lightpink','lightgreen', 'black'];
let index = 0;

// LS changes
let ticketsList =[]
init(); // calling init function to populate ticketeList

// || -------- adding toggle add button functionality ------- || 
addBtn.addEventListener('click',( event ) => {
    addTaskFlag = !addTaskFlag;
    if(addTaskFlag) {
        task_form.style.display='flex';
    }
    else{
        task_form.style.display='none';
        document.querySelector('.task-text').value="";
    }
})

// || ------- creating a new ticket using task form ------- || 
task_form.addEventListener('keyup', (event) => {
    if( event.key === 'Shift' ) {
        const task_text = document.querySelector('.task-text');

        let taskId = Math.random().toString(36).substring(2);

        // || new feature - handle no tickets to display ||
        console.log(ticketsList)
        if( ticketsList.length == 0) {
            noTasksDisplayMsg.style.display='none'
        }
        // || new feature ends ||

        createTicketInDOM(task_text.value, ticket_status_color,  taskId);

        // || LS changes - started ||
        ticketsList.push({
            ticketId: taskId, 
            ticketText: task_text.value, 
            ticketStatusColor: ticket_status_color
        })
        updateLocalStorage(ticketsList)
        // || LS changes - ended ||

        task_text.value="";
        task_form.style.display='none';
        addTaskFlag=false;
    }
})


// || ---- colors dynamically gets chosen based on click selection in new task form ---- || 

task_status_colors.forEach(function(currentColorElement){
    currentColorElement.addEventListener('click',() => {
        // remove 'active' class from previously selected div 
        for( let i = 0; i < task_status_colors.length; i++ ) {
            if( task_status_colors[ i ].classList.contains('active') ) {
                task_status_colors[ i ].classList.remove('active')
            }
        }
        // add 'active' class to currently selected color div 
        currentColorElement.classList.add('active');
        ticket_status_color = currentColorElement.classList[0];
    })
})

// || -------- Activating DELETION Mode ------- || 
removeBtn.addEventListener('click', (event) => {
    removeTaskFlag = !removeTaskFlag

    if( removeTaskFlag ) {
        console.log(removeTaskFlag)
        alert("Delete Functionality Activated.");
        removeBtn.title="Disable Delete functionality";
        removeBtn.style.color='red';
        task_form.style.display='none'; // closing the task_form if it is open
    }else{
        removeBtn.style.color='white';
        removeBtn.title="Enable Delete functionality";
    }
})


// // helper functions
function createTicketInDOM( task_value, ticket_status_color, taskId) {
    const ticketContainer = document.createElement('div');
    ticketContainer.classList.add('ticket-container');

    const ticketHTMLBody = `<div class="ticket-status-color" style="background-color: ${ticket_status_color}    "></div>
                                <div class="ticket-unique-id">
                                    ${taskId}
                                </div>
                                <div class="ticket-body">
                                    <div class="ticket-text" >
                                        ${task_value}
                                    </div>
                                    <div class="lock-icon">
                                        <i class="fa-solid fa-lock"></i>
                                    </div>                
                            </div>`
                        
    ticketContainer.innerHTML = ticketHTMLBody;
    console.log(ticketContainer) 

    mainDisplay.appendChild(ticketContainer);
    console.log(mainDisplay)
    // attaching events
    handleLockClick(ticketContainer)
    handleRemoval(ticketContainer)
    changeTaskStatus(ticketContainer)
    handleFilterColor()
}

// || -------- remove ticket when clicked in DELETION Mode ------- || 
function handleRemoval( currentTicket ) {
    const ticketId = currentTicket.querySelector('.ticket-unique-id').innerText;
    
    currentTicket.addEventListener('click', (e) => {
        if( removeTaskFlag ) {
            console.log(currentTicket);
            currentTicket.remove();

            // || LS changes - started ||
            const taskidx_in_ticketList = getTicketIndex(ticketId);
            ticketsList.splice(taskidx_in_ticketList, 1 );
            // syntax: splice(idx to start from, number of elements to delete, elements to be added(optional) )
            updateLocalStorage(ticketsList);
            // || LS changes - ended ||

            // || new feature - handle no tickets to display ||
            console.log('from handal removal', ticketsList)
            if( ticketsList.length == 0) {
                noTasksDisplayMsg.style.display='block'
            }
            // || new feature ends ||
        }
    })
}

function handleLockClick( currentTicket ) {
    console.log("Log from handleLockClick func: ",currentTicket);
    const ticketText = currentTicket.querySelector('.ticket-text')
    const icon = currentTicket.querySelector('.lock-icon').children[0];
    // ticketId of ticket which got clicked
    const ticketId = currentTicket.querySelector('.ticket-unique-id').innerText;
    console.log("From handleLockClick func, ticket id of clicked ticket: ",ticketId);


    icon.addEventListener('click', () => {
        const taskidx_in_ticketList = getTicketIndex(ticketId);
        console.log("taskidx_in_ticketList: ", taskidx_in_ticketList);

        if( icon.classList.contains(lockClass) ) {
            console.log(" ticket unlocked, ready to be edited")

            icon.classList.remove(lockClass)
            icon.classList.add(unlockClass)
            ticketText.setAttribute('contenteditable',true);        
        } else{
            console.log("ticket locked, can not be edited")
            
            icon.classList.add(lockClass)
            icon.classList.remove(unlockClass)
            ticketText.setAttribute('contenteditable',false)        
        }
        // || LS changes - started ||
        ticketsList[ taskidx_in_ticketList ].ticketText = ticketText.innerText;

        // updating local storage
        updateLocalStorage(ticketsList);
        // || LS changes - ended ||
    })
}

function changeTaskStatus( currentTicket ) {
    let statusColor = currentTicket.querySelector('div.ticket-status-color')
    const ticketId = currentTicket.querySelector('.ticket-unique-id').innerText;

    statusColor.addEventListener('click', () => {
        let currentColor = statusColor.style.backgroundColor;
        console.log(currentColor);

        let currentColorIdx = colorsList.findIndex(function(color) {
            return color == currentColor
        })

        let newIdx = (currentColorIdx + 1) % colorsList.length;
        statusColor.style.backgroundColor=colorsList[newIdx];

        // || LS changes - started ||
        const taskidx_in_ticketList = getTicketIndex(ticketId);
        console.log("taskidx_in_ticketList: ", taskidx_in_ticketList);
        ticketsList[ taskidx_in_ticketList ].ticketStatusColor = statusColor.style.backgroundColor;
        // update LS
        updateLocalStorage(ticketsList);
        // || LS changes - ended ||
    })    
}

// | ---- filter tickets based on color ---- |
function handleFilterColor() {
    tickets = document.querySelectorAll('.ticket-container');
    toolbarColors.forEach( function(color) {
        color.addEventListener('click', () => {
            const selectedColor = color.classList[0];
            console.log("toolbar selected color: ", selectedColor)
            tickets.forEach(function(ticket) {
                let ticketStatusColor = ticket.querySelector('.ticket-status-color')
                ticketStatusColor = ticketStatusColor.style.backgroundColor;
                console.log(ticketStatusColor); 
                if( ticketStatusColor === selectedColor ) {
                    // color matches , display ticket
                    ticket.style.display = 'flex';
                } else{
                    ticket.style.display = 'none';
                }
            })
        })
        //remove filter if any toolbar color double clicked
        color.addEventListener('dblclick', () => {
            tickets.forEach((ticket) => {
              ticket.style.display = 'flex';  
            })
        })
    } )
}

// Local Storage Implementation
function init() {
    ticketsList = JSON.parse(localStorage.getItem('ticketsList')) || []
    // || new feature - handle no tickets to display ||
    if( ticketsList.length != 0) {
        noTasksDisplayMsg.style.display='none'
    }
    // || new feature ends ||
    if( ticketsList.length > 0 ) {
        ticketsList.forEach( function(ticket) {
            createTicketInDOM(ticket.ticketText, ticket.ticketStatusColor, ticket.ticketId)
        } )
    }
}

function updateLocalStorage(ticketsList) {
    localStorage.setItem('ticketsList', JSON.stringify(ticketsList))
}

// || ---- function for finding ticket index ---- ||
function getTicketIndex(id) {
    let idx = ticketsList.findIndex(function(ticket){
        return ticket.ticketId == id; 
    }) 
    return idx;
}
// ticketsList.push({
//     ticketId: taskId, 
//     ticketText: task_text.value, 
//     ticketStatusColor: ticket_status_color
// })