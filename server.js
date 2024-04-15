const express = require('express');
const Joi = require('joi');
const multer = require('multer');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const path = require('path');

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
app.use(express.static('public'));
app.use(express.json());
app.use(cors());

const upload = multer({
    storage: multer.diskStorage({
        destination: './public/images/',
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        }
    })
});

mongoose.connect('mongodb+srv://cameronr129:Cowbutt23@games.wia1g2t.mongodb.net/?retryWrites=true&w=majority&appName=Games')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

const gameSchema = new mongoose.Schema({
    title: String,
    description: String,
    platforms: [String],
    cover: String,
});

const Game = mongoose.model('Game', gameSchema);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/api/videogames', async (req, res) => {
    const games = await Game.find();
    res.send(games);
});

app.post('/api/videogames', upload.single('gameArtwork'), async (req, res) => {
  const { error } = validateGame({
      ...req.body,
      cover: req.file ? `/images/${req.file.filename}` : undefined // Ensure this aligns with what your validation expects
  });

  if (error) {
      return res.status(400).send(error.details[0].message);
  }

  let game = new Game({
      title: req.body.title,
      description: req.body.description,
      platforms: req.body.platforms.split(','),
      cover: req.file ? `/images/${req.file.filename}` : 'default-cover.jpg'
  });

  try {
      await game.save();
      res.send(game);
  } catch (err) {
      res.status(500).send('Server error: ' + err.message);
  }
});

app.put('/api/videogames/:id', upload.single('cover'), async (req, res) => {
  const { error } = validateGame(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const updateData = {
      title: req.body.title,
      description: req.body.description,
      platforms: req.body.platforms.split(','),
      cover: req.file ? `/images/${req.file.filename}` : req.body.cover
  };

  try {
    // Here, ensure req.params.id is correctly captured
    const game = await Game.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!game) return res.status(404).send('The game with the given ID was not found.');
    res.send(game);
  } catch (err) {
    console.error('Error updating game:', err);
    res.status(500).send('Server error: ' + err.message);
  }

  console.log("ID received:", req.params.id);  // Check what ID is received
});


app.delete('/api/videogames/:id', async (req, res) => {
  console.log("Received delete request for ID:", req.params.id);
  try {
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) {
      console.log("No game found with ID:", req.params.id);
      return res.status(404).send('Game not found');
    }
    console.log("Deleted game:", game);
    res.send({ message: 'Game deleted successfully', game });
  } catch (err) {
    console.error("Error deleting game:", err);
    res.status(500).send('Server error');
  }
});



function validateGame(game) {
  const schema = Joi.object({
      title: Joi.string().min(3).required(),
      description: Joi.string().min(5).required(),
      platforms: Joi.string().required(),
      cover: Joi.allow(), // Allow any value for cover
      'game-id': Joi.allow() // Explicitly allow 'game-id'
  });

  return schema.validate(game);
}


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
