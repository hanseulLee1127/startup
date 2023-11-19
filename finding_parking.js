class finding_parking {
    constructor() {
        const loggedInEl = document.querySelector('.loggedInUsername');
        const username = this.getid();
        if (username) {
            loggedInEl.textContent = "Welcome, " + username + "!";
        } else {
            loggedInEl.textContent = 'User not logged in';
        }
    }

    getid() {
        return localStorage.getItem('username_1');
    }
}

const finding_parking_instance = new finding_parking();