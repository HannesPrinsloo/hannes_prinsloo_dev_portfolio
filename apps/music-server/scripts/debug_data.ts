
import pool from './db/index';

const checkData = async () => {
    try {
        console.log('--- LEVELS ---');
        const levels = await pool.query('SELECT level_id, level_name FROM levels ORDER BY level_number');
        console.table(levels.rows);

        console.log('\n--- STUDENT DOBs ---');
        // Get students (role_id 4 presumably, or just check a few users)
        const students = await pool.query(`
            SELECT user_id, first_name, last_name, date_of_birth 
            FROM users 
            WHERE role_id = 4 
            LIMIT 5
        `);
        console.table(students.rows);

        pool.end();
    } catch (err) {
        console.error(err);
    }
};

checkData();
