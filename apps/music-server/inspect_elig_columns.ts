
import pool from './db/index';

const inspectEligColumns = async () => {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'event_eligibility_levels'
        `);
        console.table(res.rows);
        pool.end();
    } catch (err) {
        console.error(err);
    }
};

inspectEligColumns();
