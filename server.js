const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Reads the connection string Azure automatically created for you.
const dbConnectionString = process.env.SQLAZURECONNSTR_DefaultConnection;

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/submit', async (req, res) => {
    const userInput = req.body.userInput;
    try {
        let pool = await sql.connect(dbConnectionString);
        // This single query creates the table if it doesn't exist, then inserts the data.
        await pool.request()
            .input('UserText', sql.NVarChar, userInput)
            .query('IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N\'[dbo].[UserInputs]\') AND type in (N\'U\')) CREATE TABLE [dbo].[UserInputs](ID int IDENTITY(1,1) PRIMARY KEY, UserText nvarchar(255)); INSERT INTO UserInputs (UserText) VALUES (@UserText);');
        res.send(`<h1>Success!</h1><p>Saved "${userInput}" to the database.</p><a href="/">Go back</a>`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error. Check the Log Stream in the Azure portal for details.");
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});