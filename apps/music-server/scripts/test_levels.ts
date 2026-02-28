import http from 'http';

const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/users',
    method: 'GET',
}, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const users = JSON.parse(data);
            const students = users.filter((u: any) => u.role_id === 4).slice(0, 5);
            students.forEach((s: any) => {
                console.log(`Student: ${s.first_name} ${s.last_name}, Level: ${s.current_level_name}`);
            });
        } catch (e) {
            console.error("Failed to parse JSON", data.substring(0, 100));
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});
req.end();
