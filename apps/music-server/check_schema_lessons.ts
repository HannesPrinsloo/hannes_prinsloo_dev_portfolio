
import pool from './db';

const checkSchema = async () => {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'lessons';
        `);
        console.log("Lessons Table Schema:", res.rows);

        const res2 = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'attendance';
        `);
        console.log("Attendance Table Schema:", res2.rows);

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
};

checkSchema();
