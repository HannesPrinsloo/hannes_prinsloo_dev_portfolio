
import pool from './db';

const checkRoles = async () => {
    try {
        const res = await pool.query('SELECT * FROM roles');
        console.log("Roles Table:", JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
};

checkRoles();
