import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pool from './db';



//Import route files
import userRoutes from './routes/userRoutes';
import roleRoutes from './routes/roleRoutes';
import loginRoutes from './routes/loginRoutes';
import me from './routes/checkMe';
import logoutRoutes from './routes/logoutRoutes';
import rosterRoutes from './routes/rosterRoutes';
import lessonRoutes from './routes/lessonRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import levelRoutes from './routes/levelRoutes';
import eventRoutes from './routes/eventRoutes';

// Load environment variable from .env file
// This makes variables like PORT available via process.env.PORT


// Initialise the Express application
const app = express();
// Enable proxy trust for Render/Vercel (Load Balancers)
app.set('trust proxy', 1);

// Get the port from the environment variables, or degault to 5000
const port = process.env.PORT || 5000;

// ~~~ Middleware Setup ~~~
// Functions that Express runs for every incoming request

// 1. express.json():
// This middleware tells Express to parse incoming request bodies that are in JSON format.
// It's essential for handling data sent from your frontend (e.g., when a user submits a form)
app.use(express.json());


// 2. cookie-parser
// self-explanatory
app.use(cookieParser());

// 3. cors():
// This middleware enables Corss-Origin Resource Sharing (CORS)
// It's necessary because the frontend will be sending requests to this backend. 
// Without CORS enabled browsers would block this request. All origins are allowed in development
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS.split(',')
            : ['http://localhost:5173', 'http://localhost:3000'];

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app') || origin.includes('hannesprinsloo.dev')) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(null, false); // For strict security, use Error('Not allowed by CORS') but false is softer for debugging
        }
    },
    credentials: true,
}));


// ~~~ API Routes ~~~
// Mount express.Route here
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/logins', loginRoutes);
app.use('/api/checkMe', me);
app.use('/api/logout', logoutRoutes);
app.use('/api/rosters', rosterRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/events', eventRoutes);

// ~~~ Define a Basic API Route ~~~
// This is a simple "GET" request handler for the root URL ("/")
// When someone accesses http://localhost:5000/ in their browser, this code will run
app.get('/', (req, res) => {
    // Send a text response back to the client
    res.send('new-guitar-app API is running');
});

app.get('/test-db-connection', async (req, res) => {
    try {
        const client = await pool.connect(); // Attempt to get a client from the pool
        const result = await client.query('SELECT NOW() as current_time'); // Execute a simple query
        client.release(); // Release the client back to the pool

        res.status(200).json({
            message: 'Database connection successful.',
            currentTime: result.rows[0].current_time,
            database: process.env.DB_DATABASE
        });
    } catch (err: any) {
        console.error('Database connection error:', err.message);
        res.status(500).json({
            message: 'Database connection failed.',
            error: err.message,
            hint: 'Check your .env file DB credentials, PostgreSQL server status, and database name.'
        });
    }
});

app.get('/express-test', async (req, res) => {
    res.send('Express test passed');
});

// <~~~ END OF NEW ROUTE



// ~~~ Start the Server ~~~
// Tell the Express application to start listening for incoming requests on the specified port
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log('Environment variables loaded successfully');
});