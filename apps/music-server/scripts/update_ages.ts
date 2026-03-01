
import pool from './db/index';

const updateAges = async () => {
    try {
        // Current year is 2026 (based on system time context)
        // 6 years old -> 2020
        // 12 years old -> 2014
        // 13 years old -> 2013

        // Student One-derson (ID 24) -> 6 years old
        await pool.query("UPDATE users SET date_of_birth = '2020-01-01' WHERE user_id = 24");
        console.log("Updated Student One-derson (ID 24) to 6 years old");

        // Student Three-man (ID 26) -> 12 years old
        await pool.query("UPDATE users SET date_of_birth = '2014-01-01' WHERE user_id = 26");
        console.log("Updated Student Three-man (ID 26) to 12 years old");

        // Student Two-deau (ID 25) -> 13 years old
        await pool.query("UPDATE users SET date_of_birth = '2013-01-01' WHERE user_id = 25");
        console.log("Updated Student Two-deau (ID 25) to 13 years old");

        pool.end();
    } catch (err) {
        console.error(err);
    }
};

updateAges();
