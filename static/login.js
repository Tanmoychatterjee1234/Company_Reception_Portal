// Toggle modal visibility
var modal = document.getElementById("errorModal");
var closeModal = document.getElementById("closeModal");
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

// Submit login form
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const location = document.getElementById('location').value;
    const employeeId = document.getElementById('employeeId').value;
    const password = document.getElementById('password').value;
    fetch(`/loginUser/${location}/${employeeId}/${password}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(response => response.json()).then(data => {
        const errorMessage = document.getElementById('error-message');
        if (data.message === 'Successful login') {
            window.location.href = 'home.html';
        } else {
            errorMessage.textContent = data.message;
            showModal();
            console.log(data.details);
        }
    });
});


// Toggle the password visibility
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