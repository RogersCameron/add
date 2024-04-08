document.addEventListener('DOMContentLoaded', async () => {
    try {
        const videoGames = await getVideoGames();
        showVideoGames(videoGames);
    } catch (error) {
        console.error('Error loading video game data:', error);
    }

    setupModalTriggers();
    setupAddGameForm();
});

async function getVideoGames() {
    const response = await fetch('/api/videogames');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

function showVideoGames(videoGames) {
    const gallery = document.getElementById('imageGallery');
    gallery.innerHTML = '';

    videoGames.forEach((game) => {
        const div = document.createElement('div');
        div.className = 'w3-quarter w3-container';
        const img = document.createElement('img');
        img.src = game.cover.startsWith('/') ? game.cover : `/images/${game.cover}`;
        img.alt = game.title;
        img.classList.add("w3-hover-opacity");
        div.appendChild(img);
        gallery.appendChild(div);

        img.onclick = () => displayGameDetails(game);
    });
}

function displayGameDetails(game) {
    const detailsModal = document.getElementById('game-details-modal');
    const detailsContent = document.getElementById('game-details-content');

    detailsContent.innerHTML = `
        <h3>${game.title}</h3>
        <p><strong>Description:</strong> ${game.description}</p>
        <p><strong>Genres:</strong> ${game.genres.join(', ')}</p>
        <p><strong>Platforms:</strong> ${game.platforms.join(', ')}</p>
        <img src="${game.cover}" style="width:50%;"><br><br>`;

        const editButton = document.createElement('button');
        editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>'; // Using innerHTML to include the FontAwesome icon
        editButton.classList.add("edit-game-btn"); // Assuming you have CSS styles for this class
        editButton.onclick = () => populateEditForm(game);

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>'; // Using innerHTML to include the FontAwesome icon
        deleteButton.classList.add("delete-game-btn"); // Assuming you have CSS styles for this class
        deleteButton.onclick = () => deleteGame(game.id);

    detailsContent.appendChild(editButton);
    detailsContent.appendChild(deleteButton);

    detailsModal.style.display = 'block';
}

function setupModalTriggers() {
    document.getElementById('showAddGameModal').addEventListener('click', (event) => {
        event.preventDefault();
        resetAddGameForm();
        document.getElementById('addEditGameModal').style.display = 'block';
    });

    Array.from(document.getElementsByClassName('close')).forEach((element) => {
        element.addEventListener('click', () => {
            element.closest('.modal').style.display = 'none';
        });
    });
}

function populateEditForm(game) {
    const form = document.getElementById('game-form');
    form.reset(); // Reset the form to ensure it's clean
  
    // Populate the form with game details
    document.getElementById('game-id').value = game.id;
    document.getElementById('title').value = game.title;
    document.getElementById('description').value = game.description;
  
    // Hide the details modal and show the form modal
    document.getElementById('game-details-modal').style.display = 'none';
    document.getElementById('addEditGameModal').style.display = 'block';
  }
  
  async function deleteGame(gameId) {
    if (!confirm('Are you sure you want to delete this game?')) return;
    try {
      await fetch(`/api/videogames/${gameId}`, { method: 'DELETE' });
      alert('Game deleted successfully');
      location.reload(); // Reload the page to refresh the game list
    } catch (error) {
      alert('Failed to delete the game');
    }
  }
  

function resetAddGameForm() {
    const form = document.getElementById('game-form');
    form.reset();
    document.getElementById('game-id').value = ''; // Ensure game ID is cleared for new entries
}
function populateEditForm(game) {
    // Hide the game details modal
    document.getElementById('game-details-modal').style.display = 'none';

    // Populate the edit form with the game's data
    document.getElementById('game-id').value = game.id;
    document.getElementById('title').value = game.title;
    document.getElementById('description').value = game.description;
    // Populate other fields like genres and platforms as per your form design

    // Show the edit game modal
    document.getElementById('addEditGameModal').style.display = 'block';
}


function setupAddGameForm() {
    const form = document.getElementById('game-form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const gameId = document.getElementById('game-id').value;
        const url = gameId ? `/api/videogames/${gameId}` : '/api/videogames'; // Endpoint for updating or adding a game
        const method = gameId ? 'PUT' : 'POST'; // Use PUT to update an existing game, POST to add a new one

        const response = await fetch(url, {
            method: method,
            body: formData,
        });

        if (response.ok) {
            form.reset();
            document.getElementById('addEditGameModal').style.display = 'none';
            const videoGames = await getVideoGames();
            showVideoGames(videoGames);
        } else {
            alert('Error saving game');
        }
    });
}
