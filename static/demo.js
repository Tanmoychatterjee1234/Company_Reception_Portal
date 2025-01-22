// CREATE TABLE Reception (
//     SL_NO INT AUTO_INCREMENT PRIMARY KEY,
//     Date TEXT,
//     Name_Of_Visitor TEXT,
//     Number_Of_Visitors INT,
//     Address TEXT,
//     Purpose TEXT,
//     To_Whom_Meet TEXT,
//     Time_In TEXT,
//     Time_Out TEXT,
//     Mobile_No TEXT,
//     transactionDate TEXT,
//     transactionCreatedDate TEXT
// );

// ALTER TABLE Persons AUTO_INCREMENT=1;

// let date = new Date("2024-11-29");
// let day = date.toLocaleString('en-us', {weekday: 'long'});
// console.log(day);

// let inputdate = "28/11/2024";
// let [day, month, year] = inputdate.split('/').map(Number);
// let date = new Date(year, month - 1, day);
// let weekday = date.toLocaleString('en-us', { weekday: 'long' });
// console.log(weekday);

import express from 'express';
import { createConnection } from 'mysql';

import { join } from 'path';

// Initialize Express
const app = express();

// Setup MySQL connection
const db = createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'your_database'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database!');
});

// Configure Multer (for handling file uploads)
const storage = memoryStorage();
const upload = multer({ storage: storage });

// Serve static files (for HTML form)
app.use(express.static(join(__dirname, 'public')));

// Route for uploading image
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const image = req.file.buffer;  // The image buffer
    const imageName = req.file.originalname;

    // Insert image into MySQL database
    const query = 'INSERT INTO images (image_name, image_data) VALUES (?, ?)';
    db.query(query, [imageName, image], (err, result) => {
        if (err) {
            return res.status(500).send('Error uploading image to the database.');
        }
        res.send('Image uploaded successfully!');
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
