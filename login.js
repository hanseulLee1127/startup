
function login() {
  const usernameEl = document.querySelector("#id");
  const passwordEl = document.querySelector("#pw");
    
  if (!usernameEl.value.trim() || !passwordEl.value) {
    alert("Username and password cannot be empty.");
    return;
  }
  fetch('/api/login', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: usernameEl.value, password: passwordEl.value })
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          alert(data.message);
          window.location.href = "finding_parking.html";
      } else {
          alert(data.message);
      }
  })
  .catch(error => {
      console.error('Error:', error);
      alert("Failed to log in. Please try again later.");
  });
}