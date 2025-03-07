// Fetching session data
var employee_Id, user_Location, user_name, user_Type;
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const sessionResponse = await fetch('/sessionData');
        const sessionData = await sessionResponse.json();
        employee_Id = sessionData['employeeId'];
        user_Location = sessionData['userLocation'];
        user_name = sessionData['username'];
        user_Type = sessionData['userType'];
        // console.log(sessionData);
    } catch (error) {
        console.error('Error fetching session data:', error);
    }


    if (!employee_Id || !user_Location || !user_name || !user_Type) {
        window.location.href = 'login.html';
    }
});

// Go the Company's website
document.getElementById('skipperLogo').addEventListener('click', function () {
    window.location.href = 'https://www.skipperlimited.com/';
});

// Go the home page
document.getElementById('home').addEventListener('click', function () {
    window.location.href = 'home.html';
});

// Switch between the forms
function showForm(formId) {
    const forms = document.querySelectorAll('.form-section');
    forms.forEach(form => form.classList.remove('active-form'));

    document.getElementById(formId + 'Section').classList.add('active-form');

    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active-tab'));

    let activeTab = "";
    if (formId === 'registerForm') {
        activeTab = "registerTab";
    } else if (formId === 'deleteForm') {
        activeTab = "deleteTab";
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

// Validate password - password has to be 8 characters long,
// contain one uppercase character, one lowercase character, 
// one number, one special character. 
function validatePassword(password) {
    const passwordCriteria = {
        minLength: 8,
        hasUpperCase: /[A-Z]/,
        hasLowerCase: /[a-z]/,
        hasNumbers: /\d/,
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/
    };
    if (password.length < passwordCriteria.minLength) {
        return 'Password must be at least 8 characters long.';
    }
    if (!passwordCriteria.hasUpperCase.test(password)) {
        return 'Password must contain at least one uppercase letter.';
    }
    if (!passwordCriteria.hasLowerCase.test(password)) {
        return 'Password must contain at least one lowercase letter.';
    }
    if (!passwordCriteria.hasNumbers.test(password)) {
        return 'Password must contain at least one number.';
    }
    if (!passwordCriteria.hasSpecialChar.test(password)) {
        return 'Password must contain at least one special character.';
    }
    return null;
}

// Submit the registration form
document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    let text;
    if (confirm("Are you sure to register the user?") == true) {
        text = "You pressed OK!"
        // console.log(text);
        if (user_Type === 'Admin User') {
            const location = document.getElementById('location').value;
            const employeeId = document.getElementById('employeeId').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confpassword').value;
            const username = document.getElementById('username').value;
            const userType = document.getElementById('userType').value;


            const passwordError = validatePassword(password);
            if (passwordError) {
                alert(passwordError);
                return;
            }


            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            const userData = {
                location,
                employeeId,
                password,
                username,
                userType
            };

            try {
                const response = await fetch('/registerUser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                const responseData = await response.json();

                if (responseData.message === 'User added successfully') {
                    document.getElementById('registerForm').reset();
                    showSuccessModal();
                } else {
                    alert(`Error: ${responseData.message}`);
                }
            } catch (error) {
                // console.error('Error registering user:', error);
                alert('Failed to register user. Please try again later.');
            }
        }
        else {
            alert('You are not authorized to register user');
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
    let text;
    if (confirm("Are you sure to delete the user?") == true) {
        text = "You pressed OK!"
        // console.log(text);
        if (user_Type === 'Admin User') {
            const location = document.getElementById('_location').value;
            const employeeId = document.getElementById('_employeeId').value;

            const deleteData = {
                location,
                employeeId
            };

            try {
                const response = await fetch('/deleteUser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(deleteData)
                });

                const responseData = await response.json();
                if (responseData.message === 'User deleted successfully') {
                    document.getElementById('deleteForm').reset();
                    showSuccessModal();
                } else {
                    alert(`Error: ${responseData.message}`);
                }
            } catch (error) {
                // console.error('Error deleting user:', error);
                alert('Failed to delete user. Please try again later.');
            }
        }
        else {
            alert('You are not authorized to delete user');
        }
    }
    else {
        text = "You canceled!";
        // console.log(text);
    }
});

// Toggle the user password visibility
const showHidePass = document.getElementById('showHidePassword');
const userPassword = document.getElementById('password');
showHidePass.addEventListener('mousedown', function (e) {
    userPassword.setAttribute('type', 'text');
    this.classList.add('fa-eye-slash');
});

showHidePass.addEventListener('mouseup', function (e) {
    userPassword.setAttribute('type', 'password');
    this.classList.remove('fa-eye-slash');
});

showHidePass.addEventListener('mouseleave', function (e) {
    userPassword.setAttribute('type', 'password');
    this.classList.remove('fa-eye-slash');
});

// Toggle the confirm password visibility
const showHideConfPass = document.getElementById('showHideConfPassword');
const confPassword = document.getElementById('confpassword');
showHideConfPass.addEventListener('mousedown', function (e) {
    confPassword.setAttribute('type', 'text');
    this.classList.add('fa-eye-slash');
});

showHideConfPass.addEventListener('mouseup', function (e) {
    confPassword.setAttribute('type', 'password');
    this.classList.remove('fa-eye-slash');
});

showHideConfPass.addEventListener('mouseleave', function (e) {
    confPassword.setAttribute('type', 'password');
    this.classList.remove('fa-eye-slash');
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
        window.location.href = "login.html";
    }
});