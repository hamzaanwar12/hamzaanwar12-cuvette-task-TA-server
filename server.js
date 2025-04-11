const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const Job = require('./models/Job'); 
const jobRouter = require("./routes/jobs");


// const jobRouter = require("./routes/jobs");

// Initialize Express
const app = express();
// Middleware
app.use(cors()); // Allow frontend connections
app.use(express.json()); // Parse JSON requests
app.use('/api/jobs', jobRouter); 



// Routes
// Test Route
app.get('/', (req, res) => {
    res.send('🚀 Job Tracker Backend Running');
});



// Test Job Model (Add this before app.listen)
app.get('/test-job', async (req, res) => {
    try {
        const testJob = await Job.create({
            company: 'Google',
            role: 'Software Engineer',
            status: 'Applied',
            jobLink: 'https://careers.google.com/jobs/123',
        });
        res.status(201).json(testJob);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// Define PORT
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, async() => {
    await connectDB();
    console.log(`Server running on port ${PORT}`);
});