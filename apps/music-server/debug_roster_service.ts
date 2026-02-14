
import pool from './db';

const debugRosterService = async () => {
    const managerId = 27;
    console.log(`Testing getManagerStudents query for Manager ID: ${managerId}`);

    const query = `
        SELECT 
            s.user_id,
            s.first_name,
            s.last_name,
            s.phone_number,
            s.date_of_birth,
            EXTRACT(YEAR FROM AGE(s.date_of_birth))::int AS age,
            msr.relationship_type,
            COALESCE(l.level_id, 1) AS level_id,
            COALESCE(l.level_name, 'Beginner') AS current_level_name,
            
            t.first_name as teacher_first_name,
            t.last_name as teacher_last_name
            
        FROM manager_student_relationships msr
        JOIN users s ON msr.student_user_id = s.user_id
        LEFT JOIN (
            SELECT DISTINCT ON (student_user_id) student_user_id, level_id 
            FROM student_levels 
            ORDER BY student_user_id, date_completed DESC, created_at DESC
        ) sl ON s.user_id = sl.student_user_id
        LEFT JOIN levels l ON sl.level_id = l.level_id
        LEFT JOIN teacher_student_rosters tsr ON s.user_id = tsr.student_user_id AND tsr.is_active = true
        LEFT JOIN users t ON tsr.teacher_user_id = t.user_id
        WHERE msr.manager_user_id = $1
        ORDER BY s.last_name ASC;
    `;

    try {
        const res = await pool.query(query, [managerId]);
        console.log("Query Result:", JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error("Query Error:", err);
    } finally {
        pool.end();
    }
};

debugRosterService();
