  // Triggering events when DOM Content Loaded
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

  // Switch between forms
  function showForm(formId) {
      const forms = document.querySelectorAll('.form-section');
      forms.forEach(form => form.classList.remove('active-form'));

      document.getElementById(formId + 'Section').classList.add('active-form');

      const tabs = document.querySelectorAll('.tab');
      tabs.forEach(tab => tab.classList.remove('active-tab'));
      var activeTab = "";
      if (formId == 'addForm') {
          activeTab = "addTab";
      }
      else if (formId == 'requestForm') {
          activeTab = "requestTab";
      }
      document.getElementById(activeTab).classList.add('active-tab');
  }

  // Success modal functions
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

  // Submit request form
  document.getElementById('requestForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const date = document.getElementById('date').value;
      const name_of_visitor = document.getElementById('name_of_visitor').value;
      const number_of_visitors = document.getElementById('number_of_visitors').value;
      const address = document.getElementById('address').value;
      const purpose = document.getElementById('purpose').value;
      const to_whom_meet = document.getElementById('to_whom_meet').value;
      const hours = document.getElementById('hours').value;
      const minutes = document.getElementById('minutes').value;
      const ampm = document.getElementById('ampm').value;
      const duration = document.getElementById('duration').value;
      const mobile_no = document.getElementById('mobile_no').value;

      var formData = { date, address, purpose, userLocation, number_of_visitors, name_of_visitor, to_whom_meet, hours, minutes, ampm, duration, mobile_no, username };
      if (userType === 'End User') {
          if (hours.length !== 2 || minutes.length !== 2) {
              alert('Please note, the time format you’ve entered is incorrect. Kindly enter the time in the format HH:MM.');
              return;
          }
          if (address.length > 25) {
              alert('Please note, the address length sholud be less than 25 characters. Kindly enter the address within 25 characters.');
              return;
          }
          fetch(`/request`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(formData)
          })
              .then(response => {
                  console.log('Response status:', response.status);
                  return response.json();
              })
              .then(data => {
                  // console.log('Data from response:', data);
                  document.getElementById('requestForm').reset();
                  showSuccessModal();
              })
              .catch(error => {
                  // console.error('Error:', error);
                  alert('Form submission failed');
              });
      }
      else {
          alert('You are not authorized to request for the visitor');
      }
  });

  // Submit add form
  document.getElementById('addForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const date = document.getElementById('_date').value;
      const name_of_visitor = document.getElementById('_name_of_visitor').value;
      const number_of_visitors = document.getElementById('_number_of_visitors').value;
      const address = document.getElementById('_address').value;
      const purpose = document.getElementById('_purpose').value;
      const to_whom_meet = document.getElementById('_to_whom_meet').value;
      const hours_timein = document.getElementById('hours_timein').value;
      const hours_timeout = document.getElementById('hours_timeout').value;
      const minutes_timein = document.getElementById('minutes_timein').value;
      const minutes_timeout = document.getElementById('minutes_timeout').value;
      const ampm_timein = document.getElementById('ampm_timein').value;
      const ampm_timeout = document.getElementById('ampm_timeout').value;
      const duration = document.getElementById('_duration').value;
      const mobile_no = document.getElementById('_mobile_no').value;
      const formData = {
          date, name_of_visitor, number_of_visitors,
          address, purpose, to_whom_meet,
          hours_timein, hours_timeout, minutes_timein, minutes_timeout,
          ampm_timein, ampm_timeout, duration, mobile_no, userLocation, username
      };
      // console.log(formData);
      if (userType === 'Receptionist') {
          if (hours_timein.length !== 2 || hours_timeout.length !== 2 || minutes_timein.length !== 2 || minutes_timeout.length !== 2) {
              alert('Please note, the time format you’ve entered is incorrect. Kindly enter the time in the format HH:MM.');
              return;
          }
          if (address.length > 25) {
              alert('Please note, the address length sholud be less than 25 characters. Kindly enter the address within 25 characters.');
              return;
          }
          fetch(`/add`, {
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
                  document.getElementById('addForm').reset();
                  showSuccessModal();
              })
              .catch(error => {
                  // console.error('Error:', error);
                  alert('Form submission failed');
              });
      }
      else {
          alert('You are not authorized to add visitor');
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