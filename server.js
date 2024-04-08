const express = require('express');
const Joi = require('joi');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(express.static('public')); // Serve static files
app.use('/game-covers', express.static('game-covers')); // Serve game cover images
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable Cross-Origin Resource Sharing

// Configure storage for game cover images
const storage = multer.diskStorage({
  destination: './public/game-covers/', // Change to store game cover images
  filename: (req, file, cb) => {
    // Preserve the original file name
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Video games array to simulate a database
let videoGames = [
  {
    id: 1,
    title: 'Elden Ring',
    genre: 'Action RPG',
    cover: 'Eldenring.webp',
    platforms: ['PC', 'PS5', 'Xbox Series X'],
  },
];

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// API endpoint to get all video games
app.get('/api/videogames', (req, res) => {
  res.send(videoGames);
});

// API endpoint to add a new video game
app.post('/api/videogames', upload.single('cover'), (req, res) => {
  const { error, value } = validateVideoGame(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const newGame = {
    id: videoGames.length + 1,
    title: value.title,
    genre: value.genre,
    platforms: value.platforms.split(','),
    cover: req.file ? `game-covers/${req.file.filename}` : 'default-cover.jpg',
  };

  videoGames.push(newGame);
  res.send(newGame); // Respond with the added video game
});

// Validate video game data using Joi
const validateVideoGame = (game) => {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    genre: Joi.string().min(3).required(),
    platforms: Joi.string().required(), // Platforms as a comma-separated string
  });

  return schema.validate(game);
};

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
