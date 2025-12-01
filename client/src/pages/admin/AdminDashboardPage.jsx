import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, updateUserRole, updateUserStatus } from '../../api/adminApi';
import toast from 'react-hot-toast';

const AdminDashboardPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllUsers();
            setUsers(response.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not fetch user data.");
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            toast.success("User role updated successfully.");
            fetchUsers();
        } catch (error) { toast.error(error.response?.data?.message || "Failed to update role."); }
    };

    const handleStatusChange = async (userId, newStatus) => {
         try {
            await updateUserStatus(userId, newStatus);
            toast.success("User status updated successfully.");
            fetchUsers();
        } catch (error) { toast.error(error.response?.data?.message || "Failed to update status."); }
    };
    
    const ROLES = ['user', 'mentor', 'support', 'admin'];
    const STATUSES = ['active', 'warned', 'suspended', 'banned'];

    return (
        <div>
            <h1 className="text-4xl font-bold text-textPrimary mb-6">Admin Dashboard: User Management</h1>
             {loading ? <p>Loading user list...</p> : (
                <div className="bg-surface rounded-lg shadow-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4">{user.fullName}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <select value={user.role} onChange={(e) => handleRoleChange(user._id, e.target.value)} className="p-1 border rounded-md">
                                            {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                         <select value={user.accountStatus} onChange={(e) => handleStatusChange(user._id, e.target.value)} className="p-1 border rounded-md">
                                            {STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;
