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
 });

 // Return to login
 document.getElementById('loginBtn').addEventListener('click', function () {
     window.location.href = '/';
 });