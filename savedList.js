
document.addEventListener('DOMContentLoaded', () => {
    const savedParkingLotsContainer = document.getElementById('savedParkingLotsContainer');
    const goBackButton = document.getElementById('goBackButton');
    const clearAllButton = document.getElementById('clearAllButton');
    const buttonsContainer = document.getElementById('buttonsContainer');
    const deleteSelectedButton = document.getElementById('deleteSelectedButton');
    displaySavedParkingLots();
  
    goBackButton.addEventListener('click', () => {
      window.history.back();
    });
  
    clearAllButton.addEventListener('click', () => {
      clearAllSavedParkingLots();
    });
  
    deleteSelectedButton.addEventListener('click', () => {
      deleteSelectedParkingLots();
    });

    function displaySavedParkingLots() {
      fetch('/api/getSavedParkingLots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            const parkingLots = data.parkingLots;
            if (!parkingLots || parkingLots.length === 0) {
              savedParkingLotsContainer.innerHTML = '<p>No saved parking lots.</p>';
              buttonsContainer.style.display = 'none';
              return;
            }
  
            buttonsContainer.style.display = 'block';
            savedParkingLotsContainer.innerHTML = '';
            const ul = document.createElement('ul');
  
            parkingLots.forEach((parkingLot, index) => {
              const li = document.createElement('li');
              li.textContent = `${parkingLot.name} - ${parkingLot.distance}`;
              const checkbox = document.createElement('input');
              checkbox.type = 'checkbox';
              checkbox.value = parkingLot.name;
              checkbox.className = 'parking-lot-checkbox';
              li.prepend(checkbox);
              ul.appendChild(li);
            });
  
            savedParkingLotsContainer.appendChild(ul);
          } else {
            savedParkingLotsContainer.innerHTML = `<p>${data.message}</p>`;
            buttonsContainer.style.display = 'none';
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          alert('An error occurred while fetching saved parking lots.');
        });
    }

    

      
    function clearAllSavedParkingLots() {
      fetch('/api/clearAllParkingLots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert('All saved parking lots cleared successfully.');
            displaySavedParkingLots();
          } else {
            alert(data.message);
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          alert('An error occurred while clearing all saved parking lots.');
        });
  }

  function deleteSelectedParkingLots() {
    const selectedLots = Array.from(document.querySelectorAll('.parking-lot-checkbox:checked'))
                             .map(checkbox => checkbox.value);

    if (selectedLots.length === 0) {
        alert('No parking lots selected.');
        return;
    }

    fetch('/api/deleteSelectedParkingLots', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parkingLots: selectedLots })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Selected parking lots deleted successfully.');
            displaySavedParkingLots(); 
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while deleting selected parking lots.');
    });
}
      
});