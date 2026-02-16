import React, { useState } from 'react';
import type { UserData } from '../types';

interface MobileUserDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserData | null;
    onEdit: (user: UserData) => void;
    onDelete: (userId: number) => void;
    // Optional props for Students specific actions
    teachers?: { id: number, name: string }[];
    onAssignTeacher?: (userId: number, teacherId: string) => void;
    mainTab: string; // 'Students' | 'Teachers' | 'Managers' | 'Admins'
}

const MobileUserDetailModal: React.FC<MobileUserDetailModalProps> = ({
    isOpen, onClose, user, onEdit, onDelete, teachers, onAssignTeacher, mainTab
}) => {
    const [activeTab, setActiveTab] = useState<'info' | 'actions' | 'academic'>('info');

    if (!isOpen || !user) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 10001 // Higher than BottomNav (9999)
        }} onClick={onClose}>
            <div
                className="card"
                onClick={e => e.stopPropagation()}
                style={{
                    width: '90%',
                    maxWidth: '400px',
                    backgroundColor: 'white',
                    color: 'var(--text-dark)',
                    maxHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                    borderRadius: '8px',
                    position: 'relative',
                    overflow: 'hidden' // Container itself hidden, inner content scrolls
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: '#666',
                        zIndex: 10
                    }}
                >
                    &times;
                </button>

                <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.25rem', paddingRight: '30px' }}>
                    {user.first_name} {user.last_name}
                </h2>

                {/* Styled Tabs */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    <button
                        onClick={() => setActiveTab('info')}
                        style={{
                            flex: 1,
                            padding: '8px',
                            background: activeTab === 'info' ? '#2ea44f' : '#f0f0f0',
                            color: activeTab === 'info' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        Info
                    </button>
                    {mainTab === 'Students' && (
                        <button
                            onClick={() => setActiveTab('academic')}
                            style={{
                                flex: 1,
                                padding: '8px',
                                background: activeTab === 'academic' ? '#2ea44f' : '#f0f0f0',
                                color: activeTab === 'academic' ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Academic
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('actions')}
                        style={{
                            flex: 1,
                            padding: '8px',
                            background: activeTab === 'actions' ? '#2ea44f' : '#f0f0f0',
                            color: activeTab === 'actions' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        Actions
                    </button>
                </div>

                <div className="tab-content" style={{ overflowY: 'auto', flex: 1 }}>
                    {activeTab === 'info' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', color: '#888', fontSize: '0.85rem' }}>Email</label>
                                <div style={{ fontSize: '1rem', wordBreak: 'break-all' }}>{user.email}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#888', fontSize: '0.85rem' }}>Phone</label>
                                <div style={{ fontSize: '1rem' }}>{user.phone_number || 'N/A'}</div>
                            </div>

                            {/* Only show ID if needed, maybe minimal */}
                            <div>
                                <label style={{ display: 'block', color: '#888', fontSize: '0.85rem' }}>Role</label>
                                <div style={{ fontSize: '1rem' }}>{mainTab.slice(0, -1)}</div>
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#888', fontSize: '0.85rem' }}>Status</label>
                                <div className={`status-badge ${user.is_active ? 'present' : 'absent'}`} style={{ display: 'inline-block', marginTop: '5px' }}>
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'academic' && mainTab === 'Students' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', color: '#888', fontSize: '0.85rem', marginBottom: '8px' }}>Assigned Teacher</label>
                                <select
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white', color: 'black' }}
                                    value={user.teachers?.[0]?.id || ''}
                                    onChange={(e) => onAssignTeacher && onAssignTeacher(user.user_id, e.target.value)}
                                >
                                    <option value="">-- Unassigned --</option>
                                    {teachers?.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {activeTab === 'actions' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button
                                onClick={() => { onEdit(user); onClose(); }}
                                className="btn-primary"
                                style={{ width: '100%', padding: '12px', justifyContent: 'center', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '6px' }}
                            >
                                Edit Details
                            </button>

                            <hr style={{ width: '100%', border: 'none', borderTop: '1px solid #eee', margin: '10px 0' }} />

                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete/archive this user?')) {
                                        onDelete(user.user_id);
                                        onClose();
                                    }
                                }}
                                className="btn-secondary"
                                style={{ width: '100%', padding: '12px', color: '#dc3545', borderColor: '#dc3545', backgroundColor: 'white', border: '1px solid #dc3545', borderRadius: '6px' }}
                            >
                                Delete / Archive
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileUserDetailModal;
