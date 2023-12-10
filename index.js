import fetch from 'node-fetch';
global.Headers = fetch.Headers;
import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Replicate from 'replicate';

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Initialize express app
const app = express();

// Use middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Replicate with the API token from an environment variable
const replicate = new Replicate({
  token: process.env.REPLICATE_API_TOKEN,
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No audio file uploaded.');
  }

  try {
    const audioBase64 = req.file.buffer.toString('base64');
    const output = await replicate.predictions.create({
      version: "openai/whisper",
      input: {
        audio: audioBase64,
        // Additional parameters if necessary
      },
    });

    console.log(output);
    res.send(output);
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).send('Error transcribing audio.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
