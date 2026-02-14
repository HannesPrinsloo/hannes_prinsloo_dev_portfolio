
import pool from './db';

const debugManager = async () => {
    const managerId = 27;
    console.log(`Checking data for Manager ID: ${managerId}`);

    try {
        // 1. Check Relationships
        const rels = await pool.query('SELECT * FROM manager_student_relationships WHERE manager_user_id = $1', [managerId]);
        console.log("Relationships:", rels.rows);

        // 2. Check all students to find a candidate
        if (rels.rows.length === 0) {
            console.log("No students linked. Finding a student...");
            const students = await pool.query('SELECT * FROM users WHERE role_id = 4 LIMIT 5'); // 4 is Student
            console.log("Candidate Students:", students.rows.map(s => ({ id: s.user_id, name: s.first_name + ' ' + s.last_name, dob: s.date_of_birth })));
        }

        // 3. Check Events
        const events = await pool.query('SELECT * FROM events WHERE end_time > NOW()');
        console.log("Upcoming Events:", events.rows.map(e => ({ id: e.event_id, name: e.event_name })));

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
};

debugManager();
