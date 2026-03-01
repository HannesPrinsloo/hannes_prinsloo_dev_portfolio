
import pool from './db/index';

const inspectEventsColumns = async () => {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'events'
        `);
        console.table(res.rows);
        pool.end();
    } catch (err) {
        console.error(err);
    }
};

inspectEventsColumns();
