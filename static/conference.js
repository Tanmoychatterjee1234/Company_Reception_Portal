// Trigerring events when DOM content loaded
var employeeId, userLocation, username, userType;
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const sessionResponse = await fetch('/sessionData');
        const sessionData = await sessionResponse.json();
        employeeId = sessionData['employeeId'];
        userLocation = sessionData['userLocation'];
        username = sessionData['username'];
        userType = sessionData['userType'];
        // console.log(sessionData);
    } catch (error) {
        console.error('Error fetching session data:', error);
    }

    if (!employeeId || !userLocation || !username || !userType) {
        window.location.href = 'login.html';
    }
});

// Go to home page
document.getElementById('home').addEventListener('click', function () {
    window.location.href = 'home.html';
});

// Go the Company's website
document.getElementById('skipperLogo').addEventListener('click', function () {
    window.location.href = 'https://www.skipperlimited.com/';
});

// Form submission success modal functions
function showSuccessModal() {
    var modal = document.getElementById("successModal");
    var closeBtn = document.querySelector(".close");

    modal.style.display = "block";

    closeBtn.onclick = function () {
        modal.style.display = "none";
    };

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    setTimeout(() => {
        modal.style.display = "none";
    }, 10000);
}


// Customize the update field input according to choice
const updateFieldElement = document.getElementById('updateField');
const updatedValueElement = document.getElementById('updatedValue');
updateFieldElement.addEventListener('change', function () {
    const updateField = updateFieldElement.value;
    updatedValueElement.value = '';
    if (updateField === 'date') {
        updatedValueElement.setAttribute('type', 'date');
        document.getElementById('time_value').style.display = 'none';
        updatedValueElement.style.display = 'block';
    }
    else if (updateField === 'meeting_start_time' || updateField == 'meeting_end_time') {
        updatedValueElement.setAttribute('type', 'time');
        document.getElementById('time_value').style.display = 'block';
        updatedValueElement.style.display = 'none';
    }
    else if (updateField === 'room_no') {
        updatedValueElement.setAttribute('type', 'text');
        document.getElementById('time_value').style.display = 'none';
        updatedValueElement.style.display = 'block';
    }
    else {
        updatedValueElement.setAttribute('type', 'text');
        document.getElementById('time_value').style.display = 'none';
        updatedValueElement.style.display = 'block';
    }
});

// Switch between forms
function showForm(formId) {
    const forms = document.querySelectorAll('.form-section');
    forms.forEach(form => form.classList.remove('active-form'));

    document.getElementById(formId + 'Section').classList.add('active-form');

    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active-tab'));
    var activeTab = "";
    if (formId == 'conferenceForm') {
        activeTab = "conferenceTab";
    }
    else if (formId == 'updateForm') {
        activeTab = "updateTab";
    }
    else if (formId == 'cancelForm') {
        activeTab = "cancelTab";
    }
    document.getElementById(activeTab).classList.add('active-tab');
}

// Toggle meeting schedules modal visibility
var modal = document.getElementById("meetingModal");
var closeModal = document.getElementById("closeMeetingModal");
function showModal() {
    modal.style.display = "block";
}
closeModal.onclick = function () {
    modal.style.display = "none";
}
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// View already booked slots according to date and room_no
document.getElementById('view_slots').addEventListener('click', async (e) => {
    e.preventDefault();
    const meeting_schedules = document.getElementById('meeting_schedules');
    const date = document.getElementById('conferenceFormDate').value;
    const room_no = document.getElementById('room_no').value;
    if (userType === 'Receptionist') {


        try {
            const response = await fetch(`/getConferenceBookings/${date}/${room_no}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (response.ok) {
                // console.log(data);

                meeting_schedules.innerHTML = '';


                const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>SL NO</th>
                    <th>Name Of Person</th>
                    <th>Location</th>
                    <th>Room No</th>
                    <th>Meeting Start Time</th>
                    <th>Meeting End Time</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(meeting => `
                    <tr>
                        <td>${meeting.sl_no || ''}</td>
                        <td>${meeting.name_of_person || ''}</td>
                        <td>${meeting.location || ''}</td>
                        <td>${meeting.room_no || ' '}</td>
                        <td>${meeting.meeting_start_time || ' '}</td>
                        <td>${meeting.meeting_end_time || ' '}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

                meeting_schedules.innerHTML = tableHTML;
            } else {
                meeting_schedules.innerHTML = `<p>${data.message}</p>`;
            }
            showModal();
        } catch (error) {
            // console.error('Error:', error);
            alert('Failed to fetch meeting schedules, Please try later');
        }
    }
    else {
        alert('You are not authorized to view already booked meeting slots');
    }
});

// Conference room booking
document.getElementById('conferenceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name_of_person = document.getElementById('name_of_person').value;
    const date = document.getElementById('conferenceFormDate').value;
    const room_no = document.getElementById('room_no').value;
    const hours_start = document.getElementById('hours_start').value;
    const minutes_start = document.getElementById('minutes_start').value;
    const ampm_start = document.getElementById('ampm_start').value;
    const hours_end = document.getElementById('hours_end').value;
    const minutes_end = document.getElementById('minutes_end').value;
    const ampm_end = document.getElementById('ampm_end').value;
    const formData = {
        name_of_person, date, room_no, hours_start, hours_end,
        minutes_start, minutes_end, ampm_start, ampm_end, userLocation, username
    };
    let text;
    if (confirm("Are you sure to schedule this meeting?") == true) {
        text = "You pressed OK!";
        // console.log(text);
        if (userType === 'Receptionist') {
            if (hours_start.length !== 2 || hours_end.length !== 2 || minutes_start.length !== 2 || minutes_end.length !== 2) {
                alert('Please note, the time format you’ve entered is incorrect. Kindly enter the time in the format HH:MM.');
                return;
            }
            fetch(`/bookConferenceRoom`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
                .then(response => {
                    // console.log('Response status:', response.status);
                    return response.json();
                })
                .then(data => {
                    // console.log('Data from response:', data);
                    document.getElementById('conferenceForm').reset();
                    showSuccessModal();
                })
                .catch(error => {
                    // console.error('Error:', error);
                    alert('Form submission failed');
                });
        }
        else {
            alert('You are not authorized to schedule the meeting');
        }
    }
    else {
        text = "You cancelled!!";
        // console.log(text);
    }
});

// Update visitor info
document.getElementById('updateForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const SL_NO = document.getElementById('SL_NO').value;
    const updateField = document.getElementById('updateField').value;
    const updatedValue = document.getElementById('updatedValue').value;
    const hours_time = document.getElementById('hours__time').value;
    const minutes_time = document.getElementById('minutes__time').value;
    const ampm_time = document.getElementById('ampm__time').value;

    const formData = {
        SL_NO, updateField, updatedValue, hours_time, minutes_time, ampm_time
    };

    let text;
    if (confirm("Are you sure to update meeting details?") == true) {
        text = "You pressed OK!";
        // console.log(text);
        if (userType === 'Receptionist') {
            if ((updateField === "meeting_start_time" || updateField === "meeting_end_time")
                && (hours_time.length !== 2 || minutes_time.length !== 2)) {
                alert('Please note, the time format you’ve entered is incorrect. Kindly enter the time in the format HH:MM.');
                return;
            }
            fetch(`/updateMeetingInfo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
                .then(response => {
                    // console.log('Response status:', response.status);
                    return response.json();
                })
                .then(data => {
                    // console.log('Data from response:', data);
                    document.getElementById('updateForm').reset();
                    showSuccessModal();
                })
                .catch(error => {
                    // console.error('Error:', error);
                    alert('Form submission failed');
                });
        }
        else {
            alert('You are not authorized to update the meeting info');
        }
    }
    else {
        text = "You cancelled!!";
        // console.log(text);
    }
});

// Cancel the meeting
document.getElementById('cancelForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const SL_NO = document.getElementById('SL__NO').value;

    const formData = {
        SL_NO
    };

    let text;
    if (confirm("Are you sure to cancel the meeting?") == true) {
        text = "You pressed OK!";
        // console.log(text);
        if (userType === 'Receptionist') {
            fetch(`/cancelMeeting`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
                .then(response => {
                    // console.log('Response status:', response.status);
                    return response.json();
                })
                .then(data => {
                    // console.log('Data from response:', data);
                    document.getElementById('cancelForm').reset();
                    showSuccessModal();
                })
                .catch(error => {
                    // console.error('Error:', error);
                    alert('Form submission failed');
                });
        }
        else {
            alert('You are not authorized to cancel the meeting');
        }
    }
    else {
        text = "You cancelled!!";
        // console.log(text);
    }
});

// Timer function
// When five minutes of idleness end, trigger auto logout
var IdealTimeOut = 300;
var idleSecondsTimer = null;
var idleSecondsCounter = 0;
document.onclick = function () { idleSecondsCounter = 0; };
document.onmousemove = function () { idleSecondsCounter = 0; };
document.onkeypress = function () { idleSecondsCounter = 0; };
idleSecondsTimer = window.setInterval(CheckIdleTime, 1000);

function CheckIdleTime() {
    idleSecondsCounter++;
    if (idleSecondsCounter >= IdealTimeOut) {
        fetch('/logout')
            .then(response => response.json())
            .catch(err => console.error('Error destroying session data:', err));
        window.clearInterval(idleSecondsTimer);
        alert("Your Session has expired. Please login again.");
        window.location.href = "login.html";
    }
}

// When visibility change occur, trigger auto logout
document.addEventListener("visibilitychange", function () {
    if (idleSecondsCounter >= 80) {
        fetch('/logout')
            .then(response => response.json())
            .catch(err => console.error('Error destroying session data:', err));
        window.clearInterval(idleSecondsTimer);
        alert("Your Session has expired. Please login again.");
        window.location.href = "login.html";
    }
});