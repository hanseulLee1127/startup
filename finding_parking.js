class finding_parking {
    constructor() {
        const loggedInEl = document.querySelector('.loggedInUsername');
        const username = this.getUsername();
        if (username) {
            loggedInEl.textContent = "Welcome, " + username + "!";
        } else {
            loggedInEl.textContent = 'User not logged in';
        }

        this.buildings = this.fetchJsonData('building.json', 'buildings');
        this.parkingLots = this.fetchJsonData('parkingLot.json', 'lots');

        const locationForm = document.getElementById('locationForm');
        locationForm.addEventListener('submit', (event) => {
            event.preventDefault(); 
            this.handleLocationSearch();
        });

        const goToSavedListButton = document.getElementById('goToSavedListButton');
        goToSavedListButton.addEventListener('click', () => {
            window.location.href = 'savedList.html';
        });

        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('save-button')) {
                this.handleSaveButtonClick(event.target);
            }
        });

        this.loggedInUser = this.getUsername();
    }

    getUser() {
        const userAccountsString = localStorage.getItem('userAccounts');
        
        if (userAccountsString) {
            const userAccounts = JSON.parse(userAccountsString);
            const username = userAccounts.userAccounts;
            return userAccounts;
        }
        
        return userAccountsString;
    }

    getUsername() {
        const user = localStorage.getItem("loggedInUser");
        return user
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    }

    fetchJsonData(jsonFile, key) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', jsonFile, false);
        xhr.send();

        if (xhr.status === 200) {
            const jsonData = JSON.parse(xhr.responseText);
            return jsonData[key];
        } else {
            console.error(`Failed to fetch ${key} data from ${jsonFile}`);
            return [];
        }
    }

    getNearestParkingLots(buildingLat, buildingLon, numLots) {
        this.parkingLots.sort((lot1, lot2) => {
            const distance1 = this.calculateDistance(buildingLat, buildingLon, lot1.latitude, lot1.longitude);
            const distance2 = this.calculateDistance(buildingLat, buildingLon, lot2.latitude, lot2.longitude);
            return distance1 - distance2;
        });

        return this.parkingLots.slice(0, numLots);
    }

    displayParkingLots(parkingLots, buildingLat, buildingLon, buildingName) {
        const parkingLotList = document.getElementById('parkingLotList');
        parkingLotList.innerHTML = '';

        parkingLots.forEach((lot) => {
            const li = document.createElement('li');
            const distance = this.calculateDistance(buildingLat, buildingLon, lot.latitude, lot.longitude);
            const distanceString = this.getDistanceString(distance);
            
            li.innerHTML = `
                <span class="parking-lot-name">${lot.name}</span>
                <span class="parking-lot-location">${distanceString} from ${buildingName}</span>
                <button class="save-button">Save</button>
            `;
            parkingLotList.appendChild(li);

            const saveButton = li.querySelector('.save-button');
        });
    }

    saveParkingLot(parkingLotInfo) {
        const savedParkingLots = JSON.parse(localStorage.getItem('savedParkingLots')) || {};
    
        if (!savedParkingLots.hasOwnProperty(this.getUsername())) {
            savedParkingLots[this.getUsername()] = [];
        }
    
        const isAlreadySaved = savedParkingLots[this.getUsername()].some(savedLot => 
            savedLot.name === parkingLotInfo.name && savedLot.building === parkingLotInfo.building);
    
        if (!isAlreadySaved) {
            savedParkingLots[this.getUsername()].push(parkingLotInfo);
            localStorage.setItem('savedParkingLots', JSON.stringify(savedParkingLots));
            alert(`Parking lot ${parkingLotInfo.name} saved!`);
        } else {
            alert(`Parking lot ${parkingLotInfo.name} is already saved.`);
        }
    }
    
    handleSaveButtonClick(button) {
        const parkingLotName = button.parentElement.querySelector('.parking-lot-name').textContent;
        const parkingLotLocation = button.parentElement.querySelector('.parking-lot-location').textContent;
    
        const parkingLotInfo = {
            name: parkingLotName,
            distance: parkingLotLocation,
            building: this.selectedBuildingName, 
        };
    
        this.saveParkingLot(parkingLotInfo);
    }

    getDistanceString(distance) {

        if (distance < 1) {
            return `${(distance * 1000).toFixed(2)} meters`;
        } else {
            return `${distance.toFixed(2)} kilometers`;
        }
    }

    displayErrorMessage(message) {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
    }

    handleLocationSearch() {
        const locationInput = document.getElementById('locationInput');
        const selectedBuildingName = locationInput.value.trim().toUpperCase();

        const selectedBuilding = this.buildings.find((building) => building.name === selectedBuildingName);

        const errorMessage = document.getElementById('errorMessage');

        if (selectedBuilding) {
            const parkingLots = this.getNearestParkingLots(selectedBuilding.latitude, selectedBuilding.longitude, 5);
            this.displayParkingLots(parkingLots, selectedBuilding.latitude, selectedBuilding.longitude, selectedBuildingName);
            this.displayErrorMessage('');
        } else {
            this.displayParkingLots([], 0, 0, ''); 
            this.displayErrorMessage('Building not found. Please try again.');
        }
    }
}

const finding_parking_instance = new finding_parking();
finding_parking_instance.displaySavedParkingLots(); 