class finding_parking {
    constructor() {
        const loggedInEl = document.querySelector('.loggedInUsername');
        this.getUsername().then(username => {
            if (username) {
                const loggedInEl = document.querySelector('.loggedInUsername');
                loggedInEl.textContent = `Welcome, ${username}!`;
                this.loggedInUser = username;
            }
        });
        
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
        this.initializeChat();
        this.initWebSocket();
        this.addToggleChatButtonListener();
       
    }

    addToggleChatButtonListener() {
        const toggleChatButton = document.getElementById('toggleChatButton');
        const chatContainer = document.getElementById('chatContainer');

        toggleChatButton.addEventListener('click', () => {
            if (chatContainer.style.display === 'none') {
                chatContainer.style.display = 'block';
                toggleChatButton.textContent = 'Hide Chat';
            } else {
                chatContainer.style.display = 'none';
                toggleChatButton.textContent = 'Show Chat';
            }
        });
    }

    initializeChat() {
        const sendButton = document.getElementById('sendButton');
        const chatInput = document.getElementById('chatInput');

        sendButton.addEventListener('click', () => {
            const message = chatInput.value;
            chatInput.value = '';
            this.sendChatMessage(message);
        });
    }

    sendChatMessage(message) {
        if (message) {
            this.sendWebSocketMessage(message);
            this.addMessageToChat('You', message);
        }
    }

    initWebSocket() {
        const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
        const socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
        // this.socket = new WebSocket('ws://localhost:4001'); 
        this.socket = socket;
        socket.onopen = () => {
            console.log('WebSocket connection established');
        };

        socket.onmessage = (event) => {
            this.handleWebSocketMessage(event.data);
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed');
        };
    }


    handleWebSocketMessage(data) {
        if (data instanceof Blob) {
            const reader = new FileReader();
            reader.onload = () => {
                this.addMessageToChat('Anonymous', reader.result);
            };
            reader.readAsText(data);
        } else {
            this.addMessageToChat('Anonymous', data);
        }
    }

    addMessageToChat(sender, message) {
        const messageList = document.getElementById('messageList');
        if (messageList) {
            const newMessage = document.createElement('li');
            newMessage.textContent = `${sender}: ${message}`;
            messageList.appendChild(newMessage);
            messageList.scrollTop = messageList.scrollHeight;
        }
    }


    sendWebSocketMessage(message) {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            console.error('WebSocket is not open.');
        }
    }

    getUsername() {
        return fetch('/api/getLoggedInUser')
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              this.loggedInUser = data.username;
              return data.username;
            } else {
              alert(data.message);
              return null;
            }
          })
          .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while fetching user information.');
            return null;
          });
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
        fetch('/api/saveParkingLot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: this.loggedInUser,
                parkingLot: parkingLotInfo,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`Parking lot ${parkingLotInfo.name} saved!`);
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while saving the parking lot.');
        });
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