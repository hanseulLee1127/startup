function clearLocalStorage() {
  localStorage.clear();
  alert("Local storage cleared.");
}

function login() {
  const usernameEl = document.querySelector("#id");
  const passwordEl = document.querySelector("#pw");

  const userAccounts = JSON.parse(localStorage.getItem("userAccounts")) || {};

  if (userAccounts.hasOwnProperty(usernameEl.value)) {
      if (userAccounts[usernameEl.value] === passwordEl.value) {
          localStorage.setItem("loggedInUser", usernameEl.value);
          window.location.href = "finding_parking.html";
      } else {
          alert("Incorrect password. Please try again.");
      }
  } else {
      userAccounts[usernameEl.value] = passwordEl.value;
      localStorage.setItem("userAccounts", JSON.stringify(userAccounts));
      localStorage.setItem("loggedInUser", usernameEl.value);
      alert("Account created. You can now log in.");
      window.location.href = "finding_parking.html";
  }
}
