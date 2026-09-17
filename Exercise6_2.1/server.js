const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const port= 3000;

app.use(express.json());
const message = path.join(__dirname, 'data.json');


app.get("/data", (req, res) => {
    fs.readFile(message, 'utf8', (err, message) => {
        if (err) {
            res.status(500).send('Error reading data');
        }
        res.status(200).json(JSON.parse(message));
    })
})

app.post("/update", (req,res) => {
    const newMessage = {"message": "Updating with a new message"};
    fs.writeFile(message, JSON.stringify(newMessage), 'utf8', (err) => {
        if (err) {
            res.status(500).send('Error updating data');
        }
        res.status(200).json(newMessage);
    })
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});