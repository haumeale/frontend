import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
      
      const response = await axios.get('http://localhost:8000/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(response.data);
    } catch (err: any) {
      setError('Failed to fetch user data');
      console.error('Failed to fetch current user:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:8000/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError('Failed to fetch users');
      }
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRoles = async (userId: number, roles: string[]) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`http://localhost:8000/admin/users/${userId}/roles`, roles, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      setError('Failed to update user roles');
      console.error('Failed to update user roles:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="admin-panel">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Admin Panel</h1>
        <div>
          <span>Welcome, {currentUser?.username} ({currentUser?.roles.join(', ')})</span>
          <button onClick={logout} style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

      {currentUser?.roles.includes('admin') ? (
        <div>
          <h2>User Management</h2>
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <UserRow key={user.id} user={user} onRoleUpdate={updateUserRoles} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <h2>Welcome to User Dashboard</h2>
          <p>You don't have admin privileges to view user management.</p>
          <p>Your roles: {currentUser?.roles.join(', ')}</p>
        </div>
      )}
    </div>
  );
};

const UserRow: React.FC<{ user: User; onRoleUpdate: (userId: number, roles: string[]) => void }> = 
  ({ user, onRoleUpdate }) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user.roles);

  const handleRoleChange = (role: string, checked: boolean) => {
    const newRoles = checked 
      ? [...selectedRoles, role]
      : selectedRoles.filter(r => r !== role);
    
    setSelectedRoles(newRoles);
    onRoleUpdate(user.id, newRoles);
  };

  return (
    <tr>
      <td>{user.id}</td>
      <td>{user.username}</td>
      <td>{user.email}</td>
      <td>
        {['admin', 'moderator', 'user'].map(role => (
          <label key={role} style={{ display: 'block', margin: '5px 0' }}>
            <input
              type="checkbox"
              className="role-checkbox"
              checked={selectedRoles.includes(role)}
              onChange={(e) => handleRoleChange(role, e.target.checked)}
            />
            {role}
          </label>
        ))}
      </td>
      <td>
        <button 
          onClick={() => onRoleUpdate(user.id, selectedRoles)}
          style={{ padding: '0.5rem 1rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Update Roles
        </button>
      </td>
    </tr>
  );
};

export default AdminPanel;