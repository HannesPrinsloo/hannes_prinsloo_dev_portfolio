import pool from './db';

const inspectEnrollments = async () => {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'enrollments';
        `);
        console.log("Enrollments Table Schema:", res.rows);

        const fkRes = await pool.query(`
            SELECT
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM 
                information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='enrollments';
        `);
        console.log("Enrollments Foreign Keys:", fkRes.rows);

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
};

inspectEnrollments();
