document.addEventListener('DOMContentLoaded', function() {
  const logoutButton = document.getElementById('logoutButton');

  // Function to update the UI with the user's name
  function updateGreeting(name) {
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
      usernameElement.textContent = name;
    }
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
      logoutButton.style.display = 'block';
    }
  }

  // Function to handle logout
  function logout() {
    fetch('/auth/logout', {
      method: 'GET',
      credentials: 'include'
    })
      .then(response => {
        if (response.ok) {
          window.location.href = '/index.html'; // Redirect to the landing page
        } else {
          alert('Logout failed.');
        }
      })
      .catch(error => {
        console.error('Error logging out:', error);
      });
  }

  // Add event listener to the logout button
  logoutButton.addEventListener('click', logout);

  // Check if the user is logged in and update the UI accordingly
  fetch('/auth/check-login', {
    credentials: 'include'
  })
    .then(response => response.json())
    .then(data => {
      if (data.loggedIn) {
        updateGreeting(data.name);
        logoutButton.style.display = 'block';
      }
    })
    .catch(error => {
      console.error('Error checking login status:', error);
    });
});

// Fetch the login status from the server
fetch('/auth/check-login', {
  credentials: 'include'
})
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    if (data.loggedIn) {
      document.getElementById('logoutButton').style.display = 'block'; // Show the logout button
    } else {
      // If not logged in, hide the logout button and potentially redirect to the login page
      document.getElementById('logoutButton').style.display = 'none';
      window.location.href = '/login.html';
    }  })
  .catch(error => {
    console.error('Error checking login status:', error);
  });
