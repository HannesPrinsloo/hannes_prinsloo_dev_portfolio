import pool from '../db';
import bcrypt from 'bcryptjs';

// Logic for creating a user
export const createUser = async (userData: any) => {
    const { role_id, first_name, last_name, email, phone_number, password, date_of_birth, is_active } = userData;

    // Hash password before saving to DB 
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // SQL targeting the public.users table from your dump
    const query = `
        INSERT INTO users (role_id, first_name, last_name, email, phone_number, password_hash, date_of_birth, is_active) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING user_id, first_name, last_name, email;
    `;
    const values = [role_id, first_name, last_name, email || null, phone_number || null, hashedPassword, date_of_birth, is_active];

    const result = await pool.query(query, values);
    return result.rows[0];
};

// Logic for fetching all users
// Logic for fetching all users
export const getAllUsers = async () => {
    // We join with teacher_student_rosters and teachers to get assigned teacher info for students
    // We use string_agg to handle cases (though rare for now) where a student has multiple teachers
    // We do similar aggregation for instruments
    const query = `
        SELECT u.user_id, u.first_name, u.last_name, u.email, u.role_id, u.phone_number, 
               u.date_of_birth, u.is_active, u.created_at, u.updated_at,
               string_agg(DISTINCT t.first_name || ' ' || t.last_name, ', ') as teacher_names,
               MAX(latest_level.level_name) as current_level_name,
               jsonb_agg(DISTINCT CASE WHEN t.user_id IS NOT NULL THEN jsonb_build_object('id', t.user_id, 'name', t.first_name || ' ' || t.last_name) ELSE NULL END) as teachers,
               jsonb_agg(DISTINCT CASE WHEN i.instrument_id IS NOT NULL THEN jsonb_build_object('instrument_id', i.instrument_id, 'instrument_name', i.instrument_name) ELSE NULL END) as instruments
        FROM users u
        LEFT JOIN teacher_student_rosters tsr ON u.user_id = tsr.student_user_id
        LEFT JOIN users t ON tsr.teacher_user_id = t.user_id
        LEFT JOIN student_instruments si ON u.user_id = si.student_user_id
        LEFT JOIN instruments i ON si.instrument_id = i.instrument_id
        LEFT JOIN (
            SELECT DISTINCT ON (sl.student_user_id) sl.student_user_id, l.level_name
            FROM student_levels sl
            JOIN levels l ON sl.level_id = l.level_id
            ORDER BY sl.student_user_id, sl.date_completed DESC, sl.created_at DESC
        ) latest_level ON u.user_id = latest_level.student_user_id
        GROUP BY u.user_id
        ORDER BY u.user_id ASC
    `;
    const result = await pool.query(query);

    // Clean up the json_agg result (remove nulls if any)
    const rows = result.rows.map(row => ({
        ...row,
        teachers: row.teachers.filter((t: any) => t !== null),
        instruments: row.instruments.filter((i: any) => i !== null)
    }));

    return rows;
};

// Logic for fetching a single user by ID
export const getUserById = async (id: number) => {
    const query = `
        SELECT user_id, first_name, last_name, email, role_id, phone_number, 
               date_of_birth, is_active, created_at, updated_at 
        FROM users 
        WHERE user_id = $1
    `;
    const result = await pool.query(query, [id]);

    // Return the first row (or undefined if not found)
    return result.rows[0];
};

// Logic for deleting a user
// Logic for deleting a user (with cascading cleanup)
export const deleteUser = async (id: number, options: { deleteManager?: boolean } = {}) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check user role
        const userRes = await client.query('SELECT role_id FROM users WHERE user_id = $1', [id]);
        if (userRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return false;
        }
        const roleId = userRes.rows[0].role_id;

        // Cleanup dependencies based on role
        if (roleId === 4) { // Student
            await cleanupStudent(client, id);

            if (options.deleteManager) {
                // Find manager BEFORE deleting the user (though relationship was deleted in cleanupStudent... wait)
                // Actually cleanupStudent deletes the relationship. We need to find the manager ID *before* calling cleanupStudent.
                // Let's adjust the flow.
            }
        }

        // Re-thinking flow:
        // We need the manager ID first if we plan to delete them.
        let managerIdToDelete: number | null = null;

        if (roleId === 4) {
            if (options.deleteManager) {
                const relRes = await client.query('SELECT manager_user_id FROM manager_student_relationships WHERE student_user_id = $1', [id]);
                if (relRes.rows.length > 0) {
                    managerIdToDelete = relRes.rows[0].manager_user_id;

                    // Check if manager has OTHER students
                    const otherStudents = await client.query(
                        'SELECT student_user_id FROM manager_student_relationships WHERE manager_user_id = $1 AND student_user_id != $2',
                        [managerIdToDelete, id]
                    );

                    if (otherStudents.rows.length > 0) {
                        throw new Error("Cannot delete Manager: They have other associated students. Please delete the other students first.");
                    }
                }
            }

            await cleanupStudent(client, id);
        } else if (roleId === 3) { // Manager
            // Check if they have students
            const relRes = await client.query('SELECT student_user_id FROM manager_student_relationships WHERE manager_user_id = $1', [id]);
            if (relRes.rows.length > 0) {
                throw new Error("Cannot delete Manager: They have associated students. Delete students first.");
            }
        }

        // Delete the User
        const result = await client.query('DELETE FROM users WHERE user_id = $1 RETURNING user_id', [id]);

        // If we need to delete manager
        if (managerIdToDelete) {
            await client.query('DELETE FROM users WHERE user_id = $1', [managerIdToDelete]);
        }

        await client.query('COMMIT');
        return result.rowCount !== null && result.rowCount > 0;
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Delete User Error:", e);
        throw e; // Controller catches this
    } finally {
        client.release();
    }
};

const cleanupStudent = async (client: any, studentId: number) => {
    // 1. Attendance (via enrollments)
    await client.query(`
        DELETE FROM attendance_records 
        WHERE enrollment_id IN (SELECT enrollment_id FROM enrollments WHERE student_user_id = $1)
    `, [studentId]);

    // 2. Enrollments
    await client.query('DELETE FROM enrollments WHERE student_user_id = $1', [studentId]);

    // 3. Event Bookings
    await client.query('DELETE FROM event_bookings WHERE student_user_id = $1', [studentId]);

    // 4. Student Levels
    await client.query('DELETE FROM student_levels WHERE student_user_id = $1', [studentId]);

    // 5. Student Instruments (if exists)
    // We swallow error if table doesn't exist? No, we verified it exists.
    await client.query('DELETE FROM student_instruments WHERE student_user_id = $1', [studentId]);

    // 6. Roster
    await client.query('DELETE FROM teacher_student_rosters WHERE student_user_id = $1', [studentId]);

    // 7. Manager Relationships
    await client.query('DELETE FROM manager_student_relationships WHERE student_user_id = $1', [studentId]);
};

// Logic for updating a user
export const updateUser = async (id: number, userData: any) => {
    const { role_id, first_name, last_name, email, phone_number, password, date_of_birth, is_active } = userData;

    // Build dynamic query
    let fields = [];
    let values = [];
    let paramIndex = 1;

    if (role_id) { fields.push(`role_id = $${paramIndex++}`); values.push(role_id); }
    if (first_name) { fields.push(`first_name = $${paramIndex++}`); values.push(first_name); }
    if (last_name) { fields.push(`last_name = $${paramIndex++}`); values.push(last_name); }
    if (email) { fields.push(`email = $${paramIndex++}`); values.push(email); }
    if (phone_number) { fields.push(`phone_number = $${paramIndex++}`); values.push(phone_number); }
    if (date_of_birth) { fields.push(`date_of_birth = $${paramIndex++}`); values.push(date_of_birth); }
    if (is_active !== undefined) { fields.push(`is_active = $${paramIndex++}`); values.push(is_active); }

    // Handle password separately (hash it)
    if (password) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        fields.push(`password_hash = $${paramIndex++}`);
        values.push(hashedPassword);
    }

    if (fields.length === 0) return null; // Nothing to update

    values.push(id);
    const query = `
        UPDATE users 
        SET ${fields.join(', ')}, updated_at = NOW() 
        WHERE user_id = $${paramIndex} 
        RETURNING user_id, first_name, last_name, email;
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
};

export const assignStudentTeacher = async (studentId: number, teacherId: number) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Remove existing roster entries for this student (Replace teacher mode)
        await client.query(
            `DELETE FROM teacher_student_rosters WHERE student_user_id = $1`,
            [studentId]
        );

        // 2. Create new roster entry
        if (teacherId) {
            await client.query(
                `INSERT INTO teacher_student_rosters (student_user_id, teacher_user_id) 
                 VALUES ($1, $2)`,
                [studentId, teacherId]
            );
        }

        await client.query('COMMIT');
        return true;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

export const createFamily = async (familyData: any) => {
    const { manager, students, isAdultStudent } = familyData;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        let managerId: number;

        // 1. Manager Handling
        if (manager.isNew) {
            const mDetails = manager.details;
            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(mDetails.password, saltRounds);

            const mRes = await client.query(
                `INSERT INTO users (role_id, first_name, last_name, email, phone_number, password_hash, date_of_birth, is_active) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, true) 
                 RETURNING user_id`,
                [3, mDetails.first_name, mDetails.last_name, mDetails.email, mDetails.phone_number, hashedPassword, mDetails.date_of_birth]
            );
            managerId = mRes.rows[0].user_id;
        } else {
            // Validate existing manager
            if (!manager.userId) throw new Error("Manager ID required for existing manager");
            managerId = manager.userId;
            // Optional: verify manager exists and has role 3
            const mCheck = await client.query('SELECT user_id FROM users WHERE user_id = $1 AND role_id = 3', [managerId]);
            if (mCheck.rows.length === 0) throw new Error("Existing manager not found or invalid role");
        }

        // 2. Student Handling
        for (let i = 0; i < students.length; i++) {
            const s = students[i];
            let studentId: number;

            // Handle Adult Student Case (First student matches manager)
            // If isAdultStudent is true, we treat the FIRST student in the list as the manager themself.
            // However, they need to be enrolled as a student. 
            // In our system, a user usually has ONE role. 
            // If we want a Manager (Role 3) to also be a Student, we have a few options:
            // A) Allow dual roles (requires DB change or role bitmask).
            // B) Create a separate User record for the Student persona (linked by email?).
            // C) Just use the Manager User ID in the roster/enrollment tables (assuming tables don't enforce Role=4).

            // Checking schema constraints: teacher_student_rosters references users(user_id).
            // Let's go with Option C for simplicity: The User ID is enrolled.
            // BUT, if isAdultStudent is true, we typically skip creating a NEW user for the first student.

            if (isAdultStudent && i === 0) {
                studentId = managerId;
                // Update DOB if needed? Assuming Manager DOB covered it.
            } else {
                // Create new Student User (Role 4)
                // Use a default password or generated one.
                const studentPassword = await bcrypt.hash('changeme', 10); // Default password

                const sRes = await client.query(
                    `INSERT INTO users (role_id, first_name, last_name, email, phone_number, password_hash, date_of_birth, is_active) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, true) 
                     RETURNING user_id`,
                    [4, s.firstName, s.lastName, null, null, studentPassword, s.dob]
                );
                studentId = sRes.rows[0].user_id;

                // 3. Create Relationship (Only for non-self)
                await client.query(
                    `INSERT INTO manager_student_relationships (manager_user_id, student_user_id, relationship_type) 
                     VALUES ($1, $2, $3)`,
                    [managerId, studentId, 'Parent/Guardian']
                );
            }

            // 4. Assign Teacher (Roster)
            if (s.assignedTeacherId) {
                await client.query(
                    `INSERT INTO teacher_student_rosters (teacher_user_id, student_user_id) 
                     VALUES ($1, $2)`,
                    [s.assignedTeacherId, studentId]
                );
            }
        }

        await client.query('COMMIT');
        return true;

    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Family Creation Error:", e);
        throw e;
    } finally {
        client.release();
    }
};

// --- Instrument Management ---
export const addStudentInstrument = async (studentId: number, instrumentId: number) => {
    // Upsert the instrument to the student_instruments table
    const query = `
        INSERT INTO student_instruments (student_user_id, instrument_id)
        VALUES ($1, $2)
        ON CONFLICT (student_user_id, instrument_id) DO NOTHING
    `;
    await pool.query(query, [studentId, instrumentId]);
    return { success: true };
};

export const removeStudentInstrument = async (studentId: number, instrumentId: number) => {
    const query = `
        DELETE FROM student_instruments
        WHERE student_user_id = $1 AND instrument_id = $2
    `;
    await pool.query(query, [studentId, instrumentId]);
    return { success: true };
};

// --- Teacher Management ---
export const addStudentTeacher = async (studentId: number, teacherId: number) => {
    // Upsert the teacher relationship
    const query = `
        INSERT INTO teacher_student_rosters (student_user_id, teacher_user_id)
        VALUES ($1, $2)
        ON CONFLICT (teacher_user_id, student_user_id) DO NOTHING
    `;
    await pool.query(query, [studentId, teacherId]);
    return { success: true };
};

export const removeStudentTeacher = async (studentId: number, teacherId: number) => {
    const query = `
        DELETE FROM teacher_student_rosters
        WHERE student_user_id = $1 AND teacher_user_id = $2
    `;
    await pool.query(query, [studentId, teacherId]);
    return { success: true };
};