import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaEdit, FaTrash, FaUserCircle, FaChartBar,
  FaUsersCog, FaSignOutAlt, FaSearch, FaPlus
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './ManageUsers.css';
import './AdminDashboard.css';

export default function ManageUsers() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return navigate('/login');
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin') return navigate('/unauthorized');
    setUser(parsedUser);
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const startEditing = (user) => {
    setEditingUserId(user._id);
    setEditForm({ name: user.name, email: user.email, role: user.role });
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditForm({});
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/users/${id}`, editForm);
      const updatedUser = res.data;
      setUsers(users.map((u) => (u._id === id ? updatedUser : u)));
      setEditingUserId(null);
    } catch (err) {
      alert('Failed to update user.');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-logo">CCMIS</div>
        <div className="admin-user">
          <FaUserCircle size={32} />
          <div>
            <div className="admin-user-name">{user?.name}</div>
            <div className="admin-user-email">{user?.email}</div>
          </div>
        </div>
      </header>

      <div className="admin-content">
        <aside className="admin-sidebar">
          <ul className="admin-nav">
            <li onClick={() => navigate('/admindashboard')}><FaChartBar /> Dashboard</li>
            <li className="active"><FaUsersCog /> Manage Users</li>
            <li onClick={handleLogout}><FaSignOutAlt /> Logout</li>
          </ul>
        </aside>

        <main className="admin-main">
          <div className="admin-card full-width">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Manage Users</h2>
              <button className="btn btn-create" onClick={() => navigate('/createuser')}>
                <FaPlus style={{ marginRight: '6px' }} /> Create New User
              </button>
            </div>

            {/* Search Input */}
            <div style={{ margin: '1rem 0' }}>
              <FaSearch style={{ marginRight: 6 }} />
              <input
                type="text"
                value={searchTerm}
                placeholder="Search users..."
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '8px',
                  width: '250px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                }}
              />
            </div>

            {loading ? (
              <p>Loading users...</p>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((u) => (
                        <tr key={u._id}>
                          {editingUserId === u._id ? (
                            <>
                              <td>
                                <input
                                  name="name"
                                  value={editForm.name}
                                  onChange={handleEditChange}
                                />
                              </td>
                              <td>
                                <input
                                  name="email"
                                  value={editForm.email}
                                  onChange={handleEditChange}
                                />
                              </td>
                              <td>
                                <select name="role" value={editForm.role} onChange={handleEditChange}>
                                  <option value="admin">Admin</option>
                                  <option value="clerk">Clerk</option>
                                  <option value="registrar">Registrar</option>
                                  <option value="judge">Judge</option>
                                  <option value="lawyer">Lawyer</option>
                                </select>
                              </td>
                              <td>
                                <button className="btn btn-edit" onClick={() => handleEditSubmit(u._id)}>Save</button>
                                <button className="btn btn-delete" onClick={cancelEdit}>Cancel</button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td>{u.name}</td>
                              <td>{u.email}</td>
                              <td>{u.role}</td>
                              <td>
                                <button className="btn btn-edit" onClick={() => startEditing(u)}>
                                  <FaEdit /> Edit
                                </button>
                                <button className="btn btn-delete" onClick={() => handleDelete(u._id)}>
                                  <FaTrash /> Delete
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div style={{ marginTop: '1rem' }}>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      style={{
                        margin: '0 4px',
                        padding: '6px 10px',
                        border: '1px solid #ccc',
                        backgroundColor: currentPage === i + 1 ? '#3b82f6' : '#fff',
                        color: currentPage === i + 1 ? '#fff' : '#333',
                        borderRadius: '5px',
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
