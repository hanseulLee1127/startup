
document.addEventListener('DOMContentLoaded', () => {
    const savedParkingLotsContainer = document.getElementById('savedParkingLotsContainer');
    const goBackButton = document.getElementById('goBackButton');
    const deleteButton = document.getElementById('deleteButton');
    const clearAllButton = document.getElementById('clearAllButton');
    const buttonsContainer = document.getElementById('buttonsContainer');

    displaySavedParkingLots();

    goBackButton.addEventListener('click', () => {
        window.history.back();
    });


    deleteButton.addEventListener('click', () => {
        deleteSelectedParkingLots();
    });


    clearAllButton.addEventListener('click', () => {
        clearAllSavedParkingLots();
    });

    function displaySavedParkingLots() {
        const loggedInUser = localStorage.getItem('loggedInUser');
        const savedParkingLots = JSON.parse(localStorage.getItem('savedParkingLots')) || {};

        if (!savedParkingLots[loggedInUser] || savedParkingLots[loggedInUser].length === 0) {
            savedParkingLotsContainer.innerHTML = '<p>No saved parking lots.</p>';
            buttonsContainer.style.display = 'none'; 
            return;
        }

        buttonsContainer.style.display = 'block'; 
        savedParkingLotsContainer.innerHTML = '';
        const ul = document.createElement('ul');

        savedParkingLots[loggedInUser].forEach((parkingLot, index) => {
            const li = document.createElement('li');
            li.textContent = `${parkingLot.name} - ${parkingLot.distance}`;
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `checkbox${index}`;
            li.appendChild(checkbox);

            ul.appendChild(li);
        });

        savedParkingLotsContainer.appendChild(ul);
    }

    function deleteSelectedParkingLots() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        const loggedInUser = localStorage.getItem('loggedInUser');
        const savedParkingLots = JSON.parse(localStorage.getItem('savedParkingLots')) || {};
        if (!savedParkingLots[loggedInUser]) {
            return;
        }
        const updatedParkingLots = savedParkingLots[loggedInUser].filter((_, index) => !checkboxes[index].checked);
        savedParkingLots[loggedInUser] = updatedParkingLots;
        localStorage.setItem('savedParkingLots', JSON.stringify(savedParkingLots));
        displaySavedParkingLots();
    }

    function clearAllSavedParkingLots() {
        const loggedInUser = localStorage.getItem('loggedInUser');
        const savedParkingLots = JSON.parse(localStorage.getItem('savedParkingLots')) || {};
        if (!savedParkingLots[loggedInUser]) {
            return;
        }
        delete savedParkingLots[loggedInUser];

        localStorage.setItem('savedParkingLots', JSON.stringify(savedParkingLots));

        displaySavedParkingLots();
    }
});