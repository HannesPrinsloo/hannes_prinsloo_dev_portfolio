
import pool from './db';

const migrate = async () => {
    try {
        await pool.query(`
            ALTER TABLE enrollments 
            ADD COLUMN IF NOT EXISTS parent_note TEXT;
        `);
        console.log("Successfully added parent_note column to enrollments table.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        pool.end();
    }
};

migrate();
