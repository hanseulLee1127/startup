const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const dbConfig = require('./dbConfig.json'); 
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 4001;


const uri = `mongodb+srv://${dbConfig.userName}:${dbConfig.password}@${dbConfig.hostname}/myDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (e) {
        console.error('Failed to connect to MongoDB', e);
        process.exit(1);
    }
}
connectDB();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
app.use(cookieParser());

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password cannot be empty.' });
    }

    const userCollection = client.db("myDatabase").collection("users");
    try {
        const user = await userCollection.findOne({ username: username });
        if (user) {
  
            if (user.password === password) {
        
                res.cookie('loggedInUsername', username, { httpOnly: true, maxAge: 86400000 }); 
                res.json({ success: true, message: 'Login successful' });
            } else {
                res.status(401).json({ success: false, message: 'Incorrect password.' });
            }
        } else {
          
            await userCollection.insertOne({ username: username, password: password });
          
            res.cookie('loggedInUsername', username, { httpOnly: true, maxAge: 86400000 });
            res.json({ success: true, message: 'New user created and logged in.' });
        }
    } catch (e) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


app.post('/api/saveParkingLot', async (req, res) => {
    const { parkingLot } = req.body;
    const username = req.cookies.loggedInUsername; 

    if (!username) {
        return res.status(401).json({ success: false, message: 'User not logged in.' });
    }

    const parkingLotCollection = client.db("myDatabase").collection("parkingLots");

    try {
        const existingLot = await parkingLotCollection.findOne({ 
            username: username, 
            'parkingLots.name': parkingLot.name,
            'parkingLots.building': parkingLot.building,
            'parkingLots.distance': parkingLot.distance
        });

        if (existingLot) {
            res.status(409).json({ success: false, message: 'Parking lot already saved by you' });
        } else {
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



app.post('/api/getSavedParkingLots', async (req, res) => {
    const username = req.cookies.loggedInUsername; 

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

app.get('/api/getLoggedInUser', (req, res) => {
    const username = req.cookies.loggedInUsername;
    if (!username) {
      return res.status(401).json({ success: false, message: 'User not logged in.' });
    }
    res.json({ success: true, username: username });
  });
  
  
  app.post('/api/clearAllParkingLots', async (req, res) => {
    const username = req.cookies.loggedInUsername; 
  
    if (!username) {
      return res.status(401).json({ success: false, message: 'User not logged in.' });
    }
  
    const parkingLotCollection = client.db("myDatabase").collection("parkingLots");
  
    try {
      
      await parkingLotCollection.updateOne(
        { username: username },
        { $set: { parkingLots: [] } }
      );
  
      res.json({ success: true, message: 'All saved parking lots cleared successfully.' });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  
  app.post('/api/deleteSelectedParkingLots', async (req, res) => {
    const { parkingLots } = req.body;
    const username = req.cookies.loggedInUsername;

    if (!username) {
        return res.status(401).json({ success: false, message: 'User not logged in.' });
    }

    const parkingLotCollection = client.db("myDatabase").collection("parkingLots");

    try {
        await parkingLotCollection.updateOne(
            { username: username },
            { $pull: { parkingLots: { name: { $in: parkingLots } } } }
        );

        res.json({ success: true, message: 'Selected parking lots deleted successfully.' });
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
