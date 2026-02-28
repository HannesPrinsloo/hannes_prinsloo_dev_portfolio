
import pool from '../db';

interface CreateEventData {
    eventName: string;
    description: string;
    venueName: string;
    startTime: string;
    endTime: string;
    eventType: string;
    maxCapacity: number;
    levelIds: number[];
}

// 1. Create Event
export const createEvent = async (data: CreateEventData) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insert Event
        const eventQuery = `
            INSERT INTO events (event_name, description, venue_name, start_time, end_time, event_type, max_capacity, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
            RETURNING event_id
        `;
        const eventRes = await client.query(eventQuery, [
            data.eventName,
            data.description,
            data.venueName,
            data.startTime,
            data.endTime,
            data.eventType,
            data.maxCapacity
        ]);
        const eventId = eventRes.rows[0].event_id;

        // Insert Eligibility Levels
        if (data.levelIds && data.levelIds.length > 0) {
            const levelValues = data.levelIds.map((lid, index) => `($1, $${index + 2})`).join(',');
            const levelParams = [eventId, ...data.levelIds];

            await client.query(`
                INSERT INTO event_eligibility_levels (event_id, level_id)
                VALUES ${levelValues}
            `, levelParams);
        }

        await client.query('COMMIT');
        return { event_id: eventId, ...data };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// 2. List Events
export const getEvents = async (filter: 'upcoming' | 'past' | 'all' = 'upcoming') => {
    let whereClause = '';
    if (filter === 'upcoming') {
        whereClause = 'WHERE e.end_time > NOW()';
    } else if (filter === 'past') {
        whereClause = 'WHERE e.end_time <= NOW()';
    }
    // 'all' implies no filtering by time

    const query = `
        SELECT e.*, 
               COALESCE(json_agg(l.level_name) FILTER (WHERE l.level_name IS NOT NULL), '[]') AS allowed_levels_json,
               (SELECT COUNT(*) FROM event_bookings eb WHERE eb.event_id = e.event_id) as booked_count
        FROM events e
        LEFT JOIN event_eligibility_levels eel ON e.event_id = eel.event_id
        LEFT JOIN levels l ON eel.level_id = l.level_id
        ${whereClause}
        GROUP BY e.event_id
        ORDER BY e.start_time ${filter === 'past' ? 'DESC' : 'ASC'}
    `;
    const res = await pool.query(query);
    return res.rows;
};

// ... (getEligibleStudents, bookStudent, getBookedStudents, cancelBooking remain same)

// 7. Delete Event
export const deleteEvent = async (eventId: number) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Delete bookings
        await client.query('DELETE FROM event_bookings WHERE event_id = $1', [eventId]);

        // Delete eligibility levels
        await client.query('DELETE FROM event_eligibility_levels WHERE event_id = $1', [eventId]);

        // Delete event
        await client.query('DELETE FROM events WHERE event_id = $1', [eventId]);

        await client.query('COMMIT');
        return { success: true };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// 3. Get Eligible Students for an Event
export const getEligibleStudents = async (eventId: number) => {
    // Logic:
    // 1. Role = Student (role_id = 4) [Assuming 4 is student]
    // 2. Age <= 18 (using date_of_birth)
    // 3. Current Level IN (Allowed Levels for Event)
    // 4. NOT already booked for this event

    const query = `
        WITH StudentCurrentLevels AS (
            SELECT DISTINCT ON (student_user_id) student_user_id, level_id
            FROM student_levels
            ORDER BY student_user_id, date_completed DESC, created_at DESC
        ),
        EventAllowedLevels AS (
            SELECT level_id FROM event_eligibility_levels WHERE event_id = $1
        )
        SELECT 
            u.user_id, 
            u.first_name, 
            u.last_name, 
            u.date_of_birth,
            EXTRACT(YEAR FROM AGE(u.date_of_birth))::int AS age,
            l.level_name AS current_level_name
        FROM users u
        JOIN StudentCurrentLevels scl ON u.user_id = scl.student_user_id
        JOIN levels l ON scl.level_id = l.level_id
        WHERE u.role_id = 4 -- Student
          AND EXTRACT(YEAR FROM AGE(u.date_of_birth))::int <= 18 -- Business Logic: Max 18
          AND scl.level_id IN (SELECT level_id FROM EventAllowedLevels) -- Must match allowed level
          AND u.user_id NOT IN (SELECT student_user_id FROM event_bookings WHERE event_id = $1) -- Not already booked
        ORDER BY u.last_name, u.first_name
    `;

    const res = await pool.query(query, [eventId]);
    return res.rows;
};

// 4. Book Student
export const bookStudent = async (eventId: number, studentId: number, bookedByUserId: number) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check if already booked with FOR UPDATE lock
        const check = await client.query('SELECT 1 FROM event_bookings WHERE event_id = $1 AND student_user_id = $2 FOR UPDATE', [eventId, studentId]);
        if (check.rows.length > 0) {
            throw new Error("Student already booked for this event");
        }

        // Re-validate absolute current eligibility dynamically
        const validationQuery = `
            WITH StudentInfo AS (
                SELECT 
                    u.date_of_birth,
                    EXTRACT(YEAR FROM AGE(u.date_of_birth))::int AS age,
                    (
                        SELECT level_id FROM student_levels 
                        WHERE student_user_id = $2 
                        ORDER BY date_completed DESC, created_at DESC LIMIT 1
                    ) as current_level_id
                FROM users u WHERE user_id = $2 AND role_id = 4
            ),
            EventInfo AS (
                SELECT event_id FROM events WHERE event_id = $1
            ),
            AllowedLevels AS (
                SELECT level_id FROM event_eligibility_levels WHERE event_id = $1
            )
            SELECT * FROM StudentInfo
            WHERE age <= 18 
              AND (
                  NOT EXISTS (SELECT 1 FROM AllowedLevels) 
                  OR current_level_id IN (SELECT level_id FROM AllowedLevels)
              );
        `;

        const validationRes = await client.query(validationQuery, [eventId, studentId]);
        if (validationRes.rows.length === 0) {
            throw new Error("Student no longer meets the eligibility criteria for this event. Please refresh your page.");
        }

        const insertQuery = `
            INSERT INTO event_bookings (event_id, student_user_id, booked_by_user_id, booking_status, booked_at)
            VALUES ($1, $2, $3, 'Confirmed', NOW())
            RETURNING *
        `;
        const res = await client.query(insertQuery, [eventId, studentId, bookedByUserId]);

        await client.query('COMMIT');
        return res.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// 5. Get Booked Students for an Event (Admin View)
export const getBookedStudents = async (eventId: number) => {
    const query = `
        SELECT 
            eb.event_booking_id,
            eb.booked_at,
            u.user_id,
            u.first_name, 
            u.last_name,
            u.email,
            u.phone_number
        FROM event_bookings eb
        JOIN users u ON eb.student_user_id = u.user_id
        WHERE eb.event_id = $1
        ORDER BY u.last_name, u.first_name
    `;
    const res = await pool.query(query, [eventId]);
    return res.rows;
};

// 6. Cancel Booking
export const cancelBooking = async (bookingId: number) => {
    await pool.query('DELETE FROM event_bookings WHERE event_booking_id = $1', [bookingId]);
    return { success: true };
};

// 7. Get Events for Manager
export const getEventsForManager = async (managerId: number) => {
    // 1. Get all upcoming events
    // 2. For each event, find:
    //    - Eligible students for this manager (not booked)
    //    - Booked students for this manager (booked)

    const query = `
        WITH ManagerStudents AS (
            SELECT 
                s.user_id, 
                s.first_name, 
                s.last_name, 
                s.date_of_birth,
                COALESCE(sl.level_id, 1) as level_id, -- Default to level 1 if no level assigned
                COALESCE(l.level_name, 'Unknown') as level_name
            FROM manager_student_relationships msr
            JOIN users s ON msr.student_user_id = s.user_id
            LEFT JOIN (
                SELECT DISTINCT ON (student_user_id) student_user_id, level_id 
                FROM student_levels 
                ORDER BY student_user_id, date_completed DESC, created_at DESC
            ) sl ON s.user_id = sl.student_user_id
            LEFT JOIN levels l ON sl.level_id = l.level_id
            WHERE msr.manager_user_id = $1
        ),
        UpcomingEvents AS (
            SELECT 
                e.*,
                COALESCE(json_agg(eel.level_id) FILTER (WHERE eel.level_id IS NOT NULL), '[]') as allowed_level_ids
            FROM events e
            LEFT JOIN event_eligibility_levels eel ON e.event_id = eel.event_id
            WHERE e.end_time > NOW()
            GROUP BY e.event_id
        )
        SELECT 
            e.event_id,
            e.event_name,
            e.venue_name,
            e.start_time,
            e.end_time,
            e.event_type,
            e.description,
            (SELECT COUNT(*) FROM event_bookings eb WHERE eb.event_id = e.event_id) as total_booked_count,
            e.max_capacity,
            
            -- Eligible Students (Not booked, correct level, age <= 18)
            (
                SELECT COALESCE(json_agg(json_build_object(
                    'user_id', ms.user_id,
                    'first_name', ms.first_name,
                    'last_name', ms.last_name,
                    'current_level_name', ms.level_name
                )), '[]')
                FROM ManagerStudents ms
                WHERE 
                    EXTRACT(YEAR FROM AGE(ms.date_of_birth))::int <= 18
                    AND (
                         json_array_length(e.allowed_level_ids) = 0
                         OR
                         ms.level_id = ANY(SELECT json_array_elements_text(e.allowed_level_ids)::int)
                    )
                    AND ms.user_id NOT IN (SELECT student_user_id FROM event_bookings eb WHERE eb.event_id = e.event_id)
            ) as eligible_students,

            -- Booked Students (Already booked)
            (
                SELECT COALESCE(json_agg(json_build_object(
                    'user_id', ms.user_id,
                    'first_name', ms.first_name,
                    'last_name', ms.last_name,
                    'booking_id', eb.event_booking_id
                )), '[]')
                FROM ManagerStudents ms
                JOIN event_bookings eb ON ms.user_id = eb.student_user_id
                WHERE eb.event_id = e.event_id
            ) as booked_students

        FROM UpcomingEvents e
        ORDER BY e.start_time ASC
    `;

    const res = await pool.query(query, [managerId]);

    // Filter out events where the manager has NO eligible students AND NO booked students
    return res.rows.filter(event =>
        (event.eligible_students && event.eligible_students.length > 0) ||
        (event.booked_students && event.booked_students.length > 0)
    );
};

// 8. Get Events for Teacher
export const getEventsForTeacher = async (teacherId: number) => {
    // Similar to Manager view, but restricting students to the teacher's roster
    const query = `
        WITH TeacherStudents AS (
            SELECT 
                s.user_id, 
                s.first_name, 
                s.last_name, 
                s.date_of_birth,
                COALESCE(sl.level_id, 1) as level_id,
                COALESCE(l.level_name, 'Unknown') as level_name
            FROM teacher_student_rosters tsr
            JOIN users s ON tsr.student_user_id = s.user_id
            LEFT JOIN (
                SELECT DISTINCT ON (student_user_id) student_user_id, level_id 
                FROM student_levels 
                ORDER BY student_user_id, date_completed DESC, created_at DESC
            ) sl ON s.user_id = sl.student_user_id
            LEFT JOIN levels l ON sl.level_id = l.level_id
            WHERE tsr.teacher_user_id = $1
        ),
        UpcomingEvents AS (
            SELECT 
                e.*,
                COALESCE(json_agg(eel.level_id) FILTER (WHERE eel.level_id IS NOT NULL), '[]') as allowed_level_ids
            FROM events e
            LEFT JOIN event_eligibility_levels eel ON e.event_id = eel.event_id
            WHERE e.end_time > NOW()
            GROUP BY e.event_id
        )
        SELECT 
            e.event_id,
            e.event_name,
            e.venue_name,
            e.start_time,
            e.end_time,
            e.event_type,
            e.description,
            (SELECT COUNT(*) FROM event_bookings eb WHERE eb.event_id = e.event_id) as total_booked_count,
            e.max_capacity,
            
            -- Eligible Students (Not booked, correct level, age <= 18)
            (
                SELECT COALESCE(json_agg(json_build_object(
                    'user_id', ts.user_id,
                    'first_name', ts.first_name,
                    'last_name', ts.last_name,
                    'current_level_name', ts.level_name
                )), '[]')
                FROM TeacherStudents ts
                WHERE 
                    EXTRACT(YEAR FROM AGE(ts.date_of_birth))::int <= 18
                    AND (
                         json_array_length(e.allowed_level_ids) = 0
                         OR
                         ts.level_id = ANY(SELECT json_array_elements_text(e.allowed_level_ids)::int)
                    )
                    AND ts.user_id NOT IN (SELECT student_user_id FROM event_bookings eb WHERE eb.event_id = e.event_id)
            ) as eligible_students,

            -- Booked Students (Already booked)
            (
                SELECT COALESCE(json_agg(json_build_object(
                    'user_id', ts.user_id,
                    'first_name', ts.first_name,
                    'last_name', ts.last_name,
                    'booking_id', eb.event_booking_id
                )), '[]')
                FROM TeacherStudents ts
                JOIN event_bookings eb ON ts.user_id = eb.student_user_id
                WHERE eb.event_id = e.event_id
            ) as booked_students

        FROM UpcomingEvents e
        ORDER BY e.start_time ASC
    `;

    const res = await pool.query(query, [teacherId]);

    // Show events if the teacher has ANY relevant students (eligible or booked)
    // Or maybe we show all events? Manager view filters. Let's filter too to reduce noise.
    return res.rows.filter(event =>
        (event.eligible_students && event.eligible_students.length > 0) ||
        (event.booked_students && event.booked_students.length > 0)
    );
};
