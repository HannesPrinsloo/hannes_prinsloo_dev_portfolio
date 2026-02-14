import { useState, useEffect } from 'react';
import { createUser, updateUser } from '../services/api';

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserAdded: () => void;
    defaultRole: number;
    userToEdit?: any; // Optional user object for editing
}

const AddUserModal = ({ isOpen, onClose, onUserAdded, defaultRole, userToEdit }: AddUserModalProps) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        role_id: defaultRole,
        date_of_birth: '2000-01-01',
        is_active: true
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Reset or Popualte form when opening/changing user
    useEffect(() => {
        if (isOpen) {
            if (userToEdit) {
                setFormData({
                    first_name: userToEdit.first_name || '',
                    last_name: userToEdit.last_name || '',
                    email: userToEdit.email || '',
                    phone_number: userToEdit.phone_number || '',
                    password: '', // Leave blank for updates
                    role_id: userToEdit.role_id,
                    date_of_birth: userToEdit.date_of_birth ? new Date(userToEdit.date_of_birth).toISOString().split('T')[0] : '2000-01-01',
                    is_active: userToEdit.is_active
                });
            } else {
                // Reset for creation
                setFormData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone_number: '',
                    password: '',
                    role_id: defaultRole,
                    date_of_birth: '2000-01-01',
                    is_active: true
                });
            }
            setError(null);
        }
    }, [isOpen, userToEdit, defaultRole]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'role_id' ? parseInt(value, 10) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload: any = { ...formData };
            // If editing and password is empty, don't send it
            if (userToEdit && !payload.password) {
                delete payload.password;
            } else {
                // Backend expects password_hash key
                payload.password_hash = payload.password;
                delete payload.password;
            }

            if (userToEdit) {
                await updateUser(userToEdit.user_id, payload);
            } else {
                await createUser(payload);
            }

            onUserAdded();
            onClose();
        } catch (err: any) {
            setError(err.message || (userToEdit ? 'Failed to update user' : 'Failed to create user'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="card" style={{ width: '400px', textAlign: 'left', backgroundColor: '#242424' }}>
                <h3>{userToEdit ? 'Edit User' : 'Add New User'}</h3>
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Role</label>
                        <select name="role_id" value={formData.role_id} onChange={handleChange}>
                            <option value={1}>Admin</option>
                            <option value={2}>Teacher</option>
                            <option value={3}>Manager</option>
                            <option value={4}>Student</option>
                        </select>
                    </div>

                    <div>
                        <label>First Name</label>
                        <input name="first_name" required value={formData.first_name} onChange={handleChange} />
                    </div>

                    <div>
                        <label>Last Name</label>
                        <input name="last_name" required value={formData.last_name} onChange={handleChange} />
                    </div>

                    <div>
                        <label>Email</label>
                        <input type="email" name="email" required value={formData.email} onChange={handleChange} />
                    </div>

                    <div>
                        <label>Phone</label>
                        <input name="phone_number" value={formData.phone_number} onChange={handleChange} />
                    </div>

                    <div>
                        <label>Password {userToEdit && <span style={{ fontSize: '0.8em', color: '#aaa' }}>(Leave blank to keep current)</span>}</label>
                        <input
                            type="password"
                            name="password"
                            required={!userToEdit} // Required only for new users
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ flexDirection: 'row', gap: '10px', marginTop: '20px' }}>
                        <button type="button" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : (userToEdit ? 'Update User' : 'Create User')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;
