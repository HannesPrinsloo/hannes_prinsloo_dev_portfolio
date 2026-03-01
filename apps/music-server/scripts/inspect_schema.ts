
import pool from './db/index';

const inspectSchema = async () => {
    try {
        const tables = ['levels', 'student_levels', 'users'];
        for (const table of tables) {
            console.log(`\nSchema for ${table}:`);
            const res = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = '${table}'
        `);
            console.table(res.rows);
        }
        pool.end();
    } catch (err) {
        console.error(err);
    }
};

inspectSchema();
