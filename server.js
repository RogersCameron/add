const express = require("express");
const Joi = require("joi");
const cors = require("cors");
const multer = require("multer");
const app = express();
app.use(express.static("public")); // Serve static files from public
app.use(express.json()); // For parsing application/json
app.use(cors()); // Allow cross-origin requests

// Sample video games data to simulate a database

const coverStorage = multer.diskStorage({
    destination: "./public/images/", // Change destination to public/images
    filename: (req, file, cb) => {
      // Create a unique filename for the uploaded file
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname)); // Use the original file extension
    },
  });
  
  const upload = multer({ storage: coverStorage });

let videoGames = [
  {
    id: 1,
    title: "Elden Ring",
    description: "An open-world action RPG, set in the Lands Between",
    cover: "/images/Eldenring.webp",
    genres: ["Action RPG"],
    platforms: ["PC", "PS5", "Xbox Series X"],
  },
  {
    id: 2,
    title: "Tekken",
    description: "A high-octane fighting game featuring a vast roster of characters with unique fighting styles.",
    cover: "/images/Tekken.webp",
    genres: ["Action", "Fighting"],
    platforms: ["PC", "PS4", "Xbox One"],
  },
  {
    id: 3,
    title: "Minecraft",
    description: "A game that puts your creativity to the test, allowing you to build, explore, and survive in a blocky, procedurally generated 3D world.",
    cover: "/images/Minecraft.webp",
    genres: ["Open World", "Adventure", "Sandbox"],
    platforms: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X/S"],
  },
  {
    id: 4,
    title: "Call of Duty",
    description: "Experience the gritty realism and cinematic intensity of Call of Duty's iconic battles and campaigns.",
    cover: "/images/Cod.webp",
    genres: ["Action", "First-Person Shooter"],
    platforms: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X/S"],
  }
 
];

// Serve the main HTML page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Endpoint to retrieve video games information
app.get("/api/videogames", (req, res) => {
  res.send(videoGames);
});

app.post("/api/videogames", upload.single('cover'), (req, res) => {
    const { error, value } = validateGame(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    // Build the new game object
    const newGame = {
        id: videoGames.length + 1,
        title: value.title,
        description: value.description,
        genres: value.genres.split(","),
        platforms: value.platforms.split(","),
        cover: req.file ? `/images/${req.file.filename}` : 'default-cover.jpg',
    };

    videoGames.push(newGame);
    res.send(newGame);
});
app.put("/api/videogames/:id", upload.single('cover'), (req, res) => {
    const { id } = req.params;
    const gameIndex = videoGames.findIndex(game => game.id == parseInt(id));

    if (gameIndex !== -1) {
        const updatedGame = {
            ...videoGames[gameIndex],
            ...req.body,
            cover: req.file ? `/images/${req.file.filename}` : videoGames[gameIndex].cover,
        };

        videoGames[gameIndex] = updatedGame;
        res.json(updatedGame);
    } else {
        res.status(404).send({ message: "Game not found." });
    }
});


// Validate incoming game data
const validateGame = (game) => {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(5).required(),
    genres: Joi.string().required(), // Genres as a comma-separated string
    platforms: Joi.string().required(), // Platforms as a comma-separated string
  });

  return schema.validate(game);
};

// Endpoint to add a new video game (removed Multer upload functionality)
app.post("/api/videogames", (req, res) => {
  const { error, value } = validateGame(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const newGame = {
    id: videoGames.length + 1,
    title: value.title,
    description: value.description,
    genres: value.genres.split(","),
    platforms: value.platforms.split(","),
    cover: value.cover || 'default-cover.jpg', // Use a cover URL from the request or a default
  };

  videoGames.push(newGame);
  res.send(newGame);
});
// DELETE endpoint to handle game deletion
app.delete("/api/videogames/:id", (req, res) => {
    const { id } = req.params; // Extract the game ID from the request URL
    const gameIndex = videoGames.findIndex(game => game.id === parseInt(id, 10));

    if (gameIndex > -1) {
        videoGames.splice(gameIndex, 1); // Remove the game from the array
        res.status(200).send({ message: "Game deleted successfully." });
    } else {
        res.status(404).send({ message: "Game not found." });
    }
});
// PUT endpoint for updating a game's details
app.put("/api/videogames/:id", (req, res) => {
    const { id } = req.params; // Extract the game ID from the URL
    const gameIndex = videoGames.findIndex(game => game.id === parseInt(id, 10));

    if (gameIndex > -1) {
        const updatedGame = {
            ...videoGames[gameIndex],
            ...req.body,
            cover: req.file ? `/images/${req.file.filename}` : videoGames[gameIndex].cover,
            id: videoGames[gameIndex].id // Ensure the game ID is not altered
        };

        videoGames[gameIndex] = updatedGame; // Replace the old game data with the updated data
        res.status(200).send(updatedGame);
    } else {
        res.status(404).send({ message: "Game not found." });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});
