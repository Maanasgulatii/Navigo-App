const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const reviewsFile = path.join(__dirname, 'reviews.txt');

if (!fs.existsSync(reviewsFile)) {
  const headers = 'Name\tEmail\tReview\n';
  fs.writeFileSync(reviewsFile, headers, 'utf8');
  console.log('reviews.txt initialized with headers');
}

// Positive message for root URL
app.get('/', (req, res) => {
  res.send('Node server is running.');
});

app.post('/api/reviews', (req, res) => {
  const { name, email, review } = req.body;

  if (!name || !email || !review) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const reviewEntry = `${name}\t${email}\t${review}\n`;

  fs.appendFile(reviewsFile, reviewEntry, (err) => {
    if (err) {
      console.error('Error writing to reviews.txt:', err);
      return res.status(500).json({ message: 'Failed to save review' });
    }
    res.status(200).json({ message: 'Review saved successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log('Visit http://localhost:5000 for status.');
});
