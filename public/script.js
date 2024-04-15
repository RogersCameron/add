document.addEventListener('DOMContentLoaded', async () => {
    try {
        const videoGames = await getVideoGames();
        showVideoGames(videoGames);
    } catch (error) {
        console.error('Error loading video game data:', error);
    }

    const gallery = document.getElementById('imageGallery');
    const detailsContent = document.getElementById('game-details-content');

    if (!gallery || !detailsContent) {
        console.error('One or more required elements are missing!');
        return; // Stop further execution if elements are missing
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
    detailsModal.style.display = 'block';

    detailsContent.innerHTML = `
        <h3>${game.title}</h3>
        <p><strong>Description:</strong> ${game.description}</p>
        <p><strong>Platforms:</strong> ${game.platforms.join(', ')}</p>
        <img src="${game.cover}" style="width:50%;">
        <br><br>
        <button onclick="populateEditForm(${JSON.stringify(game).split('"').join("&quot;")})" class="edit-game-btn"><i class="fas fa-pencil-alt"></i> Edit</button>
        <button onclick="showDeleteConfirmation('${game._id}')" class="delete-game-btn"><i class="fas fa-trash"></i> Delete</button>
        `;
}



function setupModalTriggers() {
    document.getElementById('showAddGameModal').addEventListener('click', () => {
        document.getElementById('addEditGameModal').style.display = 'block';
        resetAddGameForm();
    });

    document.querySelectorAll('.close').forEach(element => {
        element.onclick = () => {
            element.closest('.modal').style.display = 'none';
        };
    });
}

function resetAddGameForm() {
    const form = document.getElementById('game-form');
    form.reset();
    document.getElementById('game-id').value = '';
}

function populateEditForm(game) {
    const form = document.getElementById('game-form');
    document.getElementById('game-details-modal').style.display = 'none';
    document.getElementById('addEditGameModal').style.display = 'block';

    
    form['game-id'].value = game._id;  
    form['title'].value = game.title;
    form['description'].value = game.description;
    form['platforms'].value = game.platforms.join(',');
}

function setupAddGameForm() {
    const form = document.getElementById('game-form');
    form.onsubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const gameId = form['game-id'].value;
        const method = gameId ? 'PUT' : 'POST';
        const url = gameId ? `/api/videogames/${gameId}` : '/api/videogames';

        try {
            const response = await fetch(url, {
                method: method,
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to save the game: ' + await response.text());
            }

            alert('Game saved successfully');
            form.reset();
            document.getElementById('addEditGameModal').style.display = 'none';
            // Refresh the game list
            const videoGames = await getVideoGames();
            showVideoGames(videoGames);
        } catch (error) {
            alert(error.message);
        }
    };
}

const deleteGame = async () => {
    const gameId = document.getElementById('game-id-to-delete').value;
    try {
        const response = await fetch(`/api/videogames/${gameId}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error('Failed to delete the game: ' + await response.text());
        }
        alert('Game deleted successfully');
        document.getElementById('delete-confirmation-modal').style.display = 'none';
        // Optionally refresh the game list or update the UI accordingly
    } catch (error) {
        console.error('Error during game deletion:', error.message);
        alert('Error during game deletion: ' + error.message);
    }

};

function showDeleteConfirmation(gameId) {
    document.getElementById('game-id-to-delete').value = gameId; // Set the game ID to the hidden input
    document.getElementById('delete-confirmation-modal').style.display = 'block'; // Show the modal
}
