document.addEventListener('DOMContentLoaded', () => {
    showVideoGames();
    setupEventListeners();
});

async function showVideoGames() {
    const response = await fetch('/api/videogames');
    const videoGames = await response.json();
    const gamesDiv = document.getElementById("game-list");
    gamesDiv.innerHTML = ''; // Clear existing content
    videoGames.forEach(game => {
        // Adjust src path to match the 'images' folder structure
        const gameElement = document.createElement('div');
       // Assuming the 'cover' property is just 'Eldenring.webp'
        gameElement.innerHTML = `
        <h3>${game.title}</h3>
        <p>${game.genre}</p>
        <img src="${game.cover}" alt="${game.title} Cover" style="max-width: 100%; display: block;">
        <p>Platforms: ${game.platforms.join(', ')}</p>
        `;

        gamesDiv.appendChild(gameElement);
    });
}

async function getVideoGames() {
    try {
        const response = await fetch("api/videogames/");
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch video games: ", error);
        return []; // Return an empty array on failure
    }
}

function setupEventListeners() {
    document.getElementById("showAddGameModal").addEventListener('click', () => {
        document.getElementById('addEditGameModal').style.display = 'block';
    });

    document.querySelectorAll('.close, .close-modal').forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').style.display = 'none';
        });
    });

    document.getElementById("game-form").addEventListener('submit', addEditGame);

    document.getElementById("add-platform").addEventListener('click', (e) => {
        e.preventDefault();
        const platformBoxes = document.getElementById("platform-boxes");
        const input = document.createElement("input");
        input.type = "text";
        input.name = "platforms[]";
        platformBoxes.appendChild(input);
    });

    document.getElementById("artwork").addEventListener('change', function(e) {
        if (e.target.files.length) {
            const preview = document.getElementById("artwork-prev");
            preview.style.display = 'block';
            preview.src = URL.createObjectURL(e.target.files[0]);
        }
    });
}

async function addEditGame(e) {
    e.preventDefault();
    alert('Form submission logic to be implemented.'); 
}

