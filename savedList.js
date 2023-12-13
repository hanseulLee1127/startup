
document.addEventListener('DOMContentLoaded', () => {
    const savedParkingLotsContainer = document.getElementById('savedParkingLotsContainer');
    const goBackButton = document.getElementById('goBackButton');
    const clearAllButton = document.getElementById('clearAllButton');
    const buttonsContainer = document.getElementById('buttonsContainer');
  
    // Call the function to fetch and display saved parking lots
    displaySavedParkingLots();
  
    goBackButton.addEventListener('click', () => {
      window.history.back();
    });
  
    clearAllButton.addEventListener('click', () => {
      clearAllSavedParkingLots();
    });
  
    // Function to fetch and display saved parking lots from the server
    function displaySavedParkingLots() {
      // Make an AJAX request to fetch saved parking lots from the server
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
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (!loggedInUser) {
          alert('User is not logged in.');
          return;
        }
      
        // Make an AJAX request to the server to clear all saved parking lots
        fetch('/api/clearAllParkingLots', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            loggedInUser: loggedInUser,
          }),
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
      
});