//main server file

require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const User = require('./models/User')
const PointHistory = require('./models/PointHistory')

const app = express()
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI

const allowedOrigins = [
    'http://localhost:3000', // For local frontend development
    'https://leaderboard-frontend-3d2o.onrender.com' // <--- CRUCIAL: Your deployed frontend URL
];

app.use(cors({
    origin: function (origin, callback) {
        // --- START DEBUGGING LOGS ---
        console.log('Incoming request origin:', origin);
        console.log('Allowed origins:', allowedOrigins);
        // --- END DEBUGGING LOGS ---

        // Allow requests with no origin (like Postman or curl) or from allowed origins
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
    },
    methods: ['GET', 'POST'], // Specify allowed HTTP methods
    credentials: true
}));


app.use(express.json());
//mongo db connection
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('MongoDB Connected Successfully!'))
.catch(err => console.error('MongoDB Connection Error:', err));


//API ROUTES TO ADD USER, TO SEE ALL USERS and LEADERBOARD

//health check api
app.get('/', (req, res) => {
    res.send('Leaderboard Backend API is running!');
});



//api to get all users

app.get('/api/users', async (req, res) => {

    try {
        const users = await User.find().sort({ totalPoints: -1 });

        let currentRank = 1;
        let previousPoints = -1;

        const rankedUsers = users.map((user, index) => {
            if (user.totalPoints !== previousPoints) {
                currentRank = index + 1;
            }
            previousPoints = user.totalPoints;
            return { ...user.toObject(), rank: currentRank }
        });

        res.json(rankedUsers) //send ranked users as json
    } catch (error) {
        console.error('Error fetching users', error);
        res.status(500).json({ message: 'Server error while fetching users' });
    }

});


//api to add a new user

app.post('/api/users', async (req, res) => {
    const { name } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'User name is required.' });
    }

    try {

        const newUser = new User({ name: name.trim(), totalPoints: 0 });
        await newUser.save(); //save user in the db
        res.status(200).json(newUser) //return new user as json.

    } catch (error) {
        console.error('Error adding user: ', error);
        res.status(500).json({ message: 'Server error while adding new user' });

    }
})


//api to claim random points on click

app.post('/api/users/:id/claim-points', async (req, res) => {

    try {

        const userId = req.params.id //getting user id from the url parameters

        //find user based on userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        //generate random points
        const randomPoints = Math.floor(Math.random() * 10) + 1;

        user.totalPoints += randomPoints;
        await user.save();


        //creating history entry for points recoverd
        const historyEvent = new PointHistory({
            userId: user._id,
            userName: user.name,
            pointsClaimed: randomPoints
        })
        await historyEvent.save();

        res.json({ user: user, pointsClaimed: randomPoints });

    } catch (error) {
        console.error('Error claiming points', error);
        res.status(500).json({message: 'Server error while claiming points'});
        
    }
})


//api to fetch point claim history 

app.get('/api/history', async (req, res) => {
    try {

        const {userId} = req.query
        let history;

        if(userId){
            history = await PointHistory.find({userId: userId}).sort({ timestamp: -1});
        }else{
            history = await PointHistory.find().sort({timestamp: -1});
        }

        res.json(history)
        
    } catch (error) {
        console.error('Error fetching history', error);
        res.status(500).json({message: 'Server error while fetching history'});
        
    }
})

//start the server
app.listen(PORT, () => {
    console.log(`Server is running http://localhost:${PORT}`);
    
})