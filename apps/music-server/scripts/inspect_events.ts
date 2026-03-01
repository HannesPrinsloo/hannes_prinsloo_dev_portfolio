
import pool from './db';

const inspectEvents = async () => {
    try {
        const res = await pool.query('SELECT * FROM events');
        console.log("All Events:", JSON.stringify(res.rows, null, 2));

        const upcoming = await pool.query('SELECT * FROM events WHERE end_time > NOW()');
        console.log("Upcoming Events (End > NOW):", JSON.stringify(upcoming.rows, null, 2));

        const now = await pool.query('SELECT NOW()');
        console.log("DB NOW():", now.rows[0]);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
};

inspectEvents();
