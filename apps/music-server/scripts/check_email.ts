import pool from './db';

async function check() {
    const res = await pool.query(`
        SELECT column_name, is_nullable, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'email';
    `);
    console.log('Users Email constraints:', res.rows);

    const slRes = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'student_levels';
    `);
    console.log('Student levels columns:', slRes.rows);
    process.exit(0);
}
check();
