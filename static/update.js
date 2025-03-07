// Fetching session data
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

// Go to company's website
document.getElementById('skipperLogo').addEventListener('click', function () {
    window.location.href = 'https://www.skipperlimited.com/';
});

// Go to home page
document.getElementById('home').addEventListener('click', function () {
    window.location.href = 'home.html';
});

// Customize the input field according to the selected search field
const searchFieldElement = document.getElementById('searchField');
const searchValueElement = document.getElementById("searchValue");
searchFieldElement.addEventListener('change', function () {
    const searchField = searchFieldElement.value;
    searchValueElement.value = '';
    if (searchField === 'date') {
        searchValueElement.setAttribute('type', 'date');
        document.getElementById('time_value').style.display = 'none';
        document.getElementById('searchValue').style.display = 'block';
    }
    else if (searchField === 'time_in' || searchField == 'time_out' || searchField == 'scheduled_time') {
        searchValueElement.setAttribute('type', 'time');
        document.getElementById('time_value').style.display = 'block';
        document.getElementById('searchValue').style.display = 'none';
    }
    else if (searchField === 'mobile_no') {
        searchValueElement.setAttribute('type', 'tel');
        document.getElementById('time_value').style.display = 'none';
        document.getElementById('searchValue').style.display = 'block';
    }
    else if (searchField == 'duration') {
        searchValueElement.setAttribute('type', 'number');
        document.getElementById('time_value').style.display = 'none';
        document.getElementById('searchValue').style.display = 'block';
    }
    else {
        document.getElementById('time_value').style.display = 'none';
        searchValueElement.setAttribute('type', 'text');
        document.getElementById('time_value').style.display = 'none';
        document.getElementById('searchValue').style.display = 'block';
    }
});

// Customize the input field according to the selected update field 
const updateFieldElement = document.getElementById('updateField');
const updatedValueElement = document.getElementById('updatedValue');
updateFieldElement.addEventListener('change', function () {
    const updateField = updateFieldElement.value;
    updatedValueElement.value = '';
    if (updateField === 'date') {
        updatedValueElement.setAttribute('type', 'date');
        document.getElementById('time__value').style.display = 'none';
        document.getElementById('updatedValue').style.display = 'block';
    }
    else if (updateField === 'time_in' || updateField == 'time_out' || updateField == 'scheduled_time') {
        updatedValueElement.setAttribute('type', 'time');
        document.getElementById('time__value').style.display = 'block';
        document.getElementById('updatedValue').style.display = 'none';

    }
    else if (updateField === 'mobile_no') {
        updatedValueElement.setAttribute('type', 'tel');
        document.getElementById('time__value').style.display = 'none';
        document.getElementById('updatedValue').style.display = 'block';
    }
    else {
        updatedValueElement.setAttribute('type', 'text');
        document.getElementById('time__value').style.display = 'none';
        document.getElementById('updatedValue').style.display = 'block';
    }
});

// Switch between forms
function showForm(formId) {
    const resultDiv = document.getElementById("result");
    const forms = document.querySelectorAll('.form-section');
    forms.forEach(form => form.classList.remove('active-form'));

    document.getElementById(formId + 'Section').classList.add('active-form');

    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active-tab'));
    var activeTab = "";
    if (formId == 'searchForm') {
        activeTab = "searchTab";
        resultDiv.style.display = 'block';
    }
    else if (formId == 'updateForm') {
        activeTab = "updateTab";
        resultDiv.style.display = 'none';
    }
    else if (formId == 'deleteForm') {
        activeTab = "deleteTab";
        resultDiv.style.display = 'none';
    }
    document.getElementById(activeTab).classList.add('active-tab');
}

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

// Submit the search form
document.getElementById('searchForm').addEventListener("submit", async (event) => {
    event.preventDefault();
    const resultDiv = document.getElementById("result");
    var searchField = document.getElementById("searchField").value;
    var searchValue = document.getElementById("searchValue").value;
    if (searchField === 'time_in' || searchField === 'time_out' || searchField === 'scheduled_time')
        searchValue = document.getElementById('hours_time').value + ":" + document.getElementById('minutes_time').value + " " + document.getElementById('ampm_time').value;

    if (userType === 'Admin User' || userType === 'Receptionist' || userType == 'End User') {
        try {
            const response = await fetch(`/search/${searchField}/${searchValue}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok) {

                resultDiv.innerHTML = '';

                const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Sl No</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Name of Visitor</th>
                    <th>Number of Visitors</th>
                    <th>Address</th>
                    <th>Purpose</th>
                    <th>To Whom Meet</th>
                    <th>Scheduled Time</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                    <th>Duration</th>
                    <th>Mobile No</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(visitor => `
                    <tr>
                        <td>${visitor.SL_NO || ''}</td>
                        <td>${visitor.Location || ''}</td>
                        <td>${visitor.Date || ''}</td>
                        <td>${visitor.Name_Of_Visitor || ' '}</td>
                        <td>${visitor.Number_Of_Visitors || ' '}</td>
                        <td>${visitor.Address || ' '}</td>
                        <td>${visitor.Purpose || ' '}</td>
                        <td>${visitor.To_Whom_Meet || ' '}</td>
                        <td>${visitor.Scheduled_Time || ' '}</td>
                        <td>${visitor.Time_In || ' '}</td>
                        <td>${visitor.Time_Out || ' '}</td>
                        <td>${visitor.Duration || ' '}</td>
                        <td>${visitor.Mobile_No || ' '}</td>
                        <td>${visitor.VisitorStatus || ' '}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

                resultDiv.innerHTML = tableHTML;
                resultDiv.style.display = 'block';
                resultDiv.style.maxWidth = '1200px';
            } else {
                resultDiv.innerHTML = `<p>${data.message}</p>`; // Display error message
            }
        } catch (error) {
            console.error('Error:', error);
            resultDiv.innerHTML = '<p>An error occurred while searching for the visitor.</p>';
        }
    }
    else {
        alert('You are not authorized to search visitor');
    }
});

// Submit the update form
document.getElementById('updateForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const sl_no = document.getElementById('sl_no').value;
    const updateField = document.getElementById('updateField').value;
    const updatedValue = document.getElementById('updatedValue').value;
    const hours__time = document.getElementById('hours__time').value;
    const minutes__time = document.getElementById('minutes__time').value;
    const ampm__time = document.getElementById('ampm__time').value;
    const formData = { updateField, updatedValue, sl_no, hours__time, minutes__time, ampm__time };
    let text;
    if (confirm("Are you sure to update the visitor?") == true) {
        text = "You pressed OK!";
        // console.log(text);
        if (userType === 'Receptionist') {
            if ((updateField === "time_out" || updateField === "time_in" || updateField === "scheduled_time")
                && (hours__time.length !== 2 || minutes__time.length !== 2)) {
                alert('Please note, the time format you’ve entered is incorrect. Kindly enter the time in the format HH:MM.');
                return;
            }
            fetch(`/update`, {
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
            alert('You are not authorized to update the visitor');
        }
    }
    else {
        text = "You canceled!";
        // console.log(text);
    }
});

// Submit the delete form
document.getElementById('deleteForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const sl_no = document.getElementById('sl__no').value;
    const formData = { sl_no };

    let text;
    if (confirm("Are you sure to delete the visitor?") == true) {
        text = "You pressed OK!";
        if (userType === 'Receptionist') {
            fetch(`/deleteVisitor`, {
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
                    document.getElementById('deleteForm').reset();
                    showSuccessModal();
                })
                .catch(error => {
                    // console.error('Error:', error);
                    alert('Form submission failed');
                });
        }
        else {
            alert('You are not authorized to delete the visitor');
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