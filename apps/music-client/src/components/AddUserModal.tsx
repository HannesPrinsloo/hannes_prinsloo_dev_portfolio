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
        /* CHANGELOG: Refactored AddUserModal wrapper and form layout to use Tailwind CSS utility classes instead of inline logic and App.css classes. */
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[1000] p-5">
            <div className="bg-[#242424] text-white p-[25px] rounded-xl w-full max-w-[400px] text-left shadow-[0_10px_25px_rgba(0,0,0,0.15)] border border-[#333]">
                <h3 className="mt-0 font-bold mb-[20px] pb-2.5 border-b border-[#333]">{userToEdit ? 'Edit User' : 'Add New User'}</h3>
                {error && <p className="text-red-500 mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-[#aaa] font-medium text-sm">Role</label>
                        <select name="role_id" className="w-full p-2.5 rounded-md border border-[#444] bg-[#333] text-white focus:outline-none focus:border-primary-red" value={formData.role_id} onChange={handleChange}>
                            <option value={1}>Admin</option>
                            <option value={2}>Teacher</option>
                            <option value={3}>Manager</option>
                            <option value={4}>Student</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[#aaa] font-medium text-sm">First Name</label>
                        <input name="first_name" className="w-full p-2.5 rounded-md border border-[#444] bg-[#333] text-white focus:outline-none focus:border-primary-red" required value={formData.first_name} onChange={handleChange} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[#aaa] font-medium text-sm">Last Name</label>
                        <input name="last_name" className="w-full p-2.5 rounded-md border border-[#444] bg-[#333] text-white focus:outline-none focus:border-primary-red" required value={formData.last_name} onChange={handleChange} />
                    </div>

                    {formData.role_id !== 4 && (
                        <div className="flex flex-col gap-2">
                            <label className="text-[#aaa] font-medium text-sm">Email</label>
                            <input type="email" name="email" className="w-full p-2.5 rounded-md border border-[#444] bg-[#333] text-white focus:outline-none focus:border-primary-red" required value={formData.email} onChange={handleChange} />
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-[#aaa] font-medium text-sm">Phone</label>
                        <input name="phone_number" className="w-full p-2.5 rounded-md border border-[#444] bg-[#333] text-white focus:outline-none focus:border-primary-red" value={formData.phone_number} onChange={handleChange} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[#aaa] font-medium text-sm">Password {userToEdit && <span className="text-xs text-[#888]">(Leave blank to keep current)</span>}</label>
                        <input
                            type="password"
                            name="password"
                            className="w-full p-2.5 rounded-md border border-[#444] bg-[#333] text-white focus:outline-none focus:border-primary-red"
                            required={!userToEdit} // Required only for new users
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex justify-end gap-2.5 mt-[25px]">
                        <button type="button" className="bg-transparent text-[#aaa] border border-[#555] px-4 py-2 rounded cursor-pointer hover:bg-[#333] transition-colors" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="bg-primary-red text-white border-none px-4 py-2 rounded cursor-pointer hover:bg-[#cc0000] transition-colors" disabled={loading}>
                            {loading ? 'Saving...' : (userToEdit ? 'Update User' : 'Create User')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;
