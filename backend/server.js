const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");


const bcrypt = require("bcrypt");
require("dotenv").config();

const Event = require("./models/Events");
const User = require("./models/Users");
const verifyToken = require("./middleware/auth.js");
const Registration = require('./models/Registration');
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/events", async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ message: "Database not connected" });
        }
        const allevents = await Event.find();
        res.json(allevents);

    } catch (err) {
        return res.status(500).json({ message: "something went wrong while fetching events" })
    }
})
app.post('/api/events', async (req, res) => {
    try {
        const newEvent = new Event(req.body);

        await newEvent.save();

        res.status(201).json(newEvent);
    } catch (error) {
        return res.status(400).json({ message: "Failed to create event", error: error.message });
    }
});
const PORT = 5000;

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/student-events").then(() => {
    console.log("✅ Connected to MongoDB");
}).catch(err => {
    console.error("❌ MongoDB connection error:", err);
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});


//user signup code
app.post("/api/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "user already exists" });
        }

        const hashedPass = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPass });
        await newUser.save();

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            }
        });

    } catch (err) {
        console.error("SIGNUP ERROR:", err);
        res.status(500).json({ message: "something went wrong while signing up", error: err.message });
    }
});

//user login code
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "user not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "wrong password" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
        res.json({
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,

            }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error during login" });
    }

})

//verify token
app.get('/api/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile" });
    }
});

//get all users
app.get('/api/users', async (req, res) => {
    try {

        const users = await User.find().sort({ createdAt: -1 });


        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
});

//admin
app.post("/api/admin/users", async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
            return res.status(400).json({ message: "admin already exists" })
        }
        const hashedPass = await bcrypt.hash(password, 10);
        const newuser = new User({
            name,
            email,
            password: hashedPass,
        });

        await newuser.save();

        res.status(201).json(newuser);

    } catch (err) {
        res.status(500).json({ message: "Error creating user" });
    }
})

// ROUTE: SEARCH EVENTS
// URL will look like: /api/events/search?q=tech
app.get('/api/events/search', async (req, res) => {
    try {
        // 1. Get the search word from the URL
        const searchWord = req.query.q;

        // If they clicked search but the box was empty, just send all events
        if (!searchWord) {
            const allEvents = await Event.find();
            return res.json(allEvents);
        }

        // 2. Search the database!
        // $or means: "Find events where the NAME matches OR the DESCRIPTION matches"
        // $regex does a partial match ("tech" finds "Technology")
        // $options: 'i' means case-insensitive ("tech" finds "Tech", "TECH", "tech")
        const searchResults = await Event.find({
            $or: [
                { name: { $regex: searchWord, $options: 'i' } },
                { description: { $regex: searchWord, $options: 'i' } }
            ]
        });

        // 3. Send the matching events back to the frontend
        res.json(searchResults);

    } catch (error) {
        res.status(500).json({ message: "Error searching for events" });
    }
});

//get an event
app.get("/api/events/:id", async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ message: "Database not connected" });
        }
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(400).json({ message: "no event found" });
        }
        res.send(event);
    } catch (err) {
        res.status(400).json({ msg: "something went wrong" })
    }
})


// ROUTE: Register for an event
app.post('/api/events/:id/register', verifyToken, async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.userId; // verifyToken gives us this!

        // 1. Find the event
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });

        // 2. Check if the event is full (Backend Validation is crucial!)
        if (event.registeredCount >= event.capacity) {
            return res.status(400).json({ message: "Sorry, this event is full!" });
        }

        // 3. Check if the user is ALREADY registered
        const existingRegistration = await Registration.findOne({ userId, eventId });
        if (existingRegistration) {
            return res.status(400).json({ message: "You are already registered!" });
        }

        // 4. Create the new Registration (Put them on the guest list)
        const newRegistration = new Registration({ userId, eventId });
        await newRegistration.save();

        // 5. Update the Event's registeredCount (+1)
        event.registeredCount += 1;
        await event.save();

        res.status(201).json({ message: "Successfully registered!" });

    } catch (error) {
        res.status(500).json({ message: "Server error during registration" });
    }
});

// ROUTE: Get all registrations for the logged-in user

app.get('/api/my-registrations', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const myRegistrations = await Registration.find({ userId })
            .populate('eventId')  // ✅ pulls full event data in one query
            .sort({ createdAt: -1 });

        res.json(myRegistrations);
    } catch (error) {
        res.status(500).json({ message: "Error fetching your registrations" });
    }
});




//delete regitration 

app.delete('/api/registrations/:id', verifyToken, async (req, res) => {
    try {
        const registrationId = req.params.id;
        const userId = req.user.userId;

        const registration = await Registration.findOne({
            _id: registrationId,
            userId: userId,
        })
        if (!registration) {
            return res.status(404).json({ message: "registration not found" });
        }

        const event = await Event.findById(registration.eventId);
        if (event) {
            // We use Math.max to ensure the count never accidentally goes below 0
            event.registeredCount = Math.max(0, event.registeredCount - 1);
            await event.save();
        }

        await Registration.findByIdAndDelete(registrationId);

        // 5. Send success message back to the frontend
        res.json({ message: "Successfully unregistered!" });
    } catch (err) {
        res.status(500).json({ message: "Error cancelling registration" });
    }
})