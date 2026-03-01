
import pool from './db';

const checkSchema2 = async () => {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'student_instruments';
        `);
        console.log("student_instruments Schema:", res.rows.map(r => r.column_name));

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
};

checkSchema2();
