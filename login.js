function login() {
    const usernameEl = document.querySelector("#id");
    localStorage.setItem("username_1", usernameEl.value);
    const passwordEl = document.querySelector("#pw");
    localStorage.setItem("password_1", passwordEl.value);
    window.location.href = "finding_parking.html";
  }