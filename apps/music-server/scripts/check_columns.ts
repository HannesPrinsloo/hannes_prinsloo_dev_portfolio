
import pool from './db/index';

const checkColumns = async () => {
    try {
        const res = await pool.query('SELECT * FROM levels LIMIT 1');
        console.log('Columns:', Object.keys(res.rows[0]));
        pool.end();
    } catch (err) {
        console.error(err);
    }
};

checkColumns();
