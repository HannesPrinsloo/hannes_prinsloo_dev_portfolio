
import pool from './db/index';

const inspectSchema2 = async () => {
    try {
        const tables = ['levels', 'student_levels'];
        for (const table of tables) {
            console.log(`\nSchema for ${table}:`);
            const res = await pool.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = '${table}'
            `);
            console.table(res.rows);
        }

        // Also dump some data to see what levels exist
        const levels = await pool.query('SELECT * FROM levels');
        console.log('\nLevels Data:');
        console.table(levels.rows);

        pool.end();
    } catch (err) {
        console.error(err);
    }
};

inspectSchema2();
