// const express = require('express');
// const path = require('path');
// const bodyParser = require('body-parser');
// const app = express();
// const PORT = process.env.PORT || 8080;

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// app.use(express.static(path.join(__dirname)));

// app.post('/api/login', (req, res) => { 
//     const { username, password } = req.body;

//     if (username === 'user' && password === 'pass') {
//         res.json({ success: true, message: 'Login successful' });
//     } else {
//         res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }
// });

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'index.html'));
// });
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const dbConfig = require('./dbConfig.json');  // Ensure this path is correct
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 8080;

// MongoDB Connection Setup
const uri = `mongodb+srv://${dbConfig.userName}:${dbConfig.password}@${dbConfig.hostname}/myDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (e) {
        console.error('Failed to connect to MongoDB', e);
        process.exit(1); // Exit process with failure
    }
}
connectDB();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
app.use(cookieParser());

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const userCollection = client.db("myDatabase").collection("users");

    try {
        const user = await userCollection.findOne({ username: username });
        if (user) {
            // Check password
            if (user.password === password) {
                // Setting a cookie with the username
                res.cookie('loggedInUsername', username, { httpOnly: true, maxAge: 86400000 }); // 24-hour expiration
                res.json({ success: true, message: 'Login successful' });
            } else {
                res.status(401).json({ success: false, message: 'Incorrect password.' });
            }
        } else {
            // User not found, create a new user
            await userCollection.insertOne({ username: username, password: password });
            // Setting a cookie with the username for the new user
            res.cookie('loggedInUsername', username, { httpOnly: true, maxAge: 86400000 });
            res.json({ success: true, message: 'New user created and logged in.' });
        }
    } catch (e) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


app.post('/api/saveParkingLot', async (req, res) => {
    const parkingLot = req.body.parkingLot;
    const username = req.cookies.loggedInUsername; // Get username from cookie

    if (!username) {
        return res.status(401).json({ success: false, message: 'User not logged in.' });
    }

    const parkingLotCollection = client.db("myDatabase").collection("parkingLots");

    try {
        // Check if the parking lot is already saved by the current user
        const userDoc = await parkingLotCollection.findOne({ username: username, 'parkingLots.name': parkingLot.name });
        if (userDoc) {
            res.status(409).json({ success: false, message: 'Parking lot already saved by you' });
        } else {
            // Save new parking lot for the current user
            await parkingLotCollection.updateOne(
                { username: username },
                { $push: { parkingLots: parkingLot } },
                { upsert: true }
            );
            res.json({ success: true, message: 'Parking lot saved' });
        }
    } catch (e) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Endpoint to retrieve saved parking lots for a user
app.post('/api/getSavedParkingLots', async (req, res) => {
    const username = req.cookies.loggedInUsername; // Get username from cookie

    if (!username) {
        return res.status(401).json({ success: false, message: 'User not logged in.' });
    }

    const parkingLotCollection = client.db("myDatabase").collection("parkingLots");

    try {
        const userDoc = await parkingLotCollection.findOne({ username: username });
        if (userDoc) {
            res.json({ success: true, parkingLots: userDoc.parkingLots });
        } else {
            res.json({ success: false, message: 'No parking lots found for this user' });
        }
    } catch (e) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


  
  app.post('/api/clearAllParkingLots', async (req, res) => {
    const username = req.cookies.loggedInUsername; // Get username from cookie
  
    if (!username) {
      return res.status(401).json({ success: false, message: 'User not logged in.' });
    }
  
    const parkingLotCollection = client.db("myDatabase").collection("parkingLots");
  
    try {
      // Clear all parking lots for the current user
      await parkingLotCollection.updateOne(
        { username: username },
        { $set: { parkingLots: [] } }
      );
  
      res.json({ success: true, message: 'All saved parking lots cleared successfully.' });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
