
import pool from './db/index';

const inspectStudentLevels = async () => {
    try {
        const res = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'student_levels'
    `);
        console.table(res.rows);
        pool.end();
    } catch (err) {
        console.error(err);
    }
};

inspectStudentLevels();
