//this is basically to add 10 users(initially)

require('dotenv').config()
const mongoose = require('mongoose');
const User = require('./models/User');
const MONGO_URI = process.env.MONGO_URI;


const initialUsers = [
    { name: 'Rahul', totalPoints: 0 },
    { name: 'Kamal', totalPoints: 0 },
    { name: 'Sanak', totalPoints: 0 },
    { name: 'Priya', totalPoints: 0 },
    { name: 'Amit', totalPoints: 0 },
    { name: 'Deepa', totalPoints: 0 },
    { name: 'Vikas', totalPoints: 0 },
    { name: 'Swati', totalPoints: 0 },
    { name: 'Rohan', totalPoints: 0 },
    { name: 'Anjali', totalPoints: 0 },
];

async function seedDatabase() {
    try {
        // Connect to MongoDB using the URI from .env
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected for Seeding!');

        await User.deleteMany({});
        console.log('Existing users cleared from the database.');

        // Insert the initial users into the database
        await User.insertMany(initialUsers);
        console.log('Initial 10 users seeded successfully!');

    } catch (error) {
        // Log any errors that occur during the seeding process
        console.error('Error seeding database:', error);
    } finally {
       
        mongoose.disconnect();
        console.log('MongoDB Disconnected.');
    }
}

seedDatabase();