import React from 'react';
import type { UserData } from '../types';

interface MobileUserListProps {
    users: UserData[];
    onUserClick: (user: UserData) => void;
    emptyMessage?: string;
}

const MobileUserList: React.FC<MobileUserListProps> = ({ users, onUserClick, emptyMessage = "No users found." }) => {
    return (
        <div className="mobile-user-list">
            {users.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>{emptyMessage}</div>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {users.map(user => (
                        <li
                            key={user.user_id}
                            onClick={() => onUserClick(user)}
                            style={{
                                padding: '16px',
                                borderBottom: '1px solid #eee',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-dark)' }}>
                                    {user.first_name} {user.last_name}
                                </span>
                                <span style={{ fontSize: '0.85rem', color: '#666' }}>
                                    {user.email}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#ccc' }}>&rsaquo;</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MobileUserList;
