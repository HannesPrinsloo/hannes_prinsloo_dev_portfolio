import pool from './db';

const check = async () => {
    try {
        const resList = await pool.query("SELECT * FROM instruments");
        console.log("Instruments:", resList.rows);
        const resTable = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'student_instruments'");
        console.log("\nstudent_instruments columns:", resTable.rows);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
};
check();
