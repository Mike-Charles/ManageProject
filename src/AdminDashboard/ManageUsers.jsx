import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  FaEdit, FaTrash, FaUserCircle, FaChartBar,
  FaUsersCog, FaSignOutAlt, FaSearch, FaPlus, FaHome, FaClipboardList,
  FaFileAlt, FaCog, FaLock, FaCalendarAlt, FaGavel, FaChartPie, FaBell, FaUser, FaEnvelope, FaKey, FaCalendar, FaPhone
  , FaBuilding, FaMapMarkerAlt, FaInfoCircle, FaExclamationCircle, FaCheckCircle, FaTimesCircle
  
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
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);
  const userDropdownRef = useRef(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      // Optionally, send a request to the server to mark as read
      await axios.put(`https://courtcase-backend.onrender.com/api/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, status: "Read" } : n
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

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
      const res = await axios.get('https://courtcase-backend.onrender.com/api/users');
      setUsers(res.data);
    } catch {
      console.error('Fetch error');
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
      await axios.delete(`https://courtcase-backend.onrender.com/api/users/${id}`);
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
      const res = await axios.put(`https://courtcase-backend.onrender.com/api/users/${id}`, editForm);
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
      {/* HEADER */}
      <header style={{ position: "sticky", top: 0, boxShadow: "0 2px 4px rgba(0,0,0,0.1)", zIndex: 1000, padding: "12px 0" }}>
        <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
          <a className="navbar-brand fw-bold" href="#" style={{ color: "#007bff" }}>
            CourtSys
          </a>

          <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileMenu" aria-controls="mobileMenu">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse d-none d-lg-flex justify-content-end" style={{ display: "flex", justifyContent: "space-evenly" }}>
            <div className="collapse navbar-collapse d-none d-lg-flex justify-content-end" style={{ marginLeft: 250 }}>
              <form className="d-flex mx-3" style={{ flex: 8, maxWidth: 400 }}>
                <input
                type="text"
                value={searchTerm}
                placeholder="Search users..."
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                />
              </form>
            </div>

            <div className="navbar-collapse d-none d-lg-flex justify-content-end">
              {/* Notifications */}
              <div className="nav-item me-3 position-relative" ref={notificationsRef}>
                <FaBell
                  size={22}
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowNotifications(!showNotifications)}
                />
                {notifications.filter((n) => n.status === "Unread").length > 0 && (
                  <span className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">
                    {notifications.filter((n) => n.status === "Unread").length}
                  </span>
                )}

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div
                    className="dropdown-menu show shadow p-2"
                    style={{
                      right: 0,
                      position: "absolute",
                      width: "350px",
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                  >
                    {notifications.length === 0 ? (
                      <p className="text-center my-2">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`notification-item p-2 mb-1 ${n.status === "Unread" ? "bg-light" : ""}`}
                          style={{ cursor: "pointer", borderRadius: "5px" }}
                          onClick={() => markAsRead(n._id)}
                        >
                          <strong>{n.title || "New Case Assigned"}</strong>
                          <p style={{ margin: 0, fontSize: "0.85rem" }}>{n.message}</p>
                          <small className="text-muted">{new Date(n.sentAt).toLocaleString()}</small>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* User */}
              <div className="position-relative" ref={userDropdownRef}>
                <button className="btn btn-light d-flex align-items-center" onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
                  <FaUserCircle size={28} className="me-2" />
                  <span>{user?.name}</span>
                </button>

                {userDropdownOpen && (
                  <div className="dropdown-menu show shadow p-2" style={{ right: 0, position: "absolute" }}>
                    <span style={{ color: "#6c757d", fontSize: "0.7em" }}>{user?.email}</span>
                    <button className="dropdown-item d-flex align-items-center" onClick={() => navigate("/change-password")}>
                      <FaLock className="me-1" /> Change Password
                    </button>
                    <button className="dropdown-item d-flex align-items-center" onClick={handleLogout}>
                      <FaSignOutAlt className="me-1" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Offcanvas Menu */}
        <div className="offcanvas offcanvas-start" tabIndex="-1" id="mobileMenu" aria-labelledby="mobileMenuLabel">
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="mobileMenuLabel">Menu</h5>
            <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div className="offcanvas-body">
            <ul className="list-group">
              <li className="list-group-item" onClick={() => navigate("/judgedashboard")}><FaHome /> Home</li>
              <li className="list-group-item" onClick={() => navigate("/casesassigned")}><FaClipboardList /> Cases Assigned</li>
              <li className="list-group-item" onClick={() => navigate("/schedulehearing")}><FaCalendarAlt /> Hearing Schedule</li>
              <li className="list-group-item" onClick={() => navigate("/judgmenthistory")}><FaGavel /> Judgment History</li>
              <li className="list-group-item" onClick={() => navigate("/progress")}><FaChartPie /> Case Progress</li>
              <li className="list-group-item" onClick={() => navigate("/notification")}>
                <div className=" position-relative" ref={notificationsRef}>
                  <FaBell
                    size={22}
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowNotifications(!showNotifications)}
                  />
                  <div style={{ marginLeft: '-28px', marginTop: '-90px', display: 'inline' }}>
                    {notifications.filter((n) => n.status === "Unread").length > 0 && (
                      <span className="badge bg-danger rounded-pill start-100 translate-middle"
                        style={{ fontSize: '0.6rem'}}
                      >
                        {notifications.filter((n) => n.status === "Unread").length}
                      </span>
                    )}
                  </div>
                </div>            
                Notifications</li>
            </ul>
          </div>
        </div>
      </header>

      <div className="admin-content" style={{ padding: 0 }}>
        <aside className="admin-sidebar">
          <ul className="admin-nav">
            <li onClick={() => navigate('/admindashboard')}><FaHome /> Home</li>
            <li className="active"><FaUsersCog /> Manage Users</li>
            <li onClick={() => navigate('/managecases')}><FaClipboardList /> Manage Cases</li>
            <li onClick={() => navigate('/reports')}><FaFileAlt /> Reports</li>
            <li onClick={() => navigate('/settings')}><FaCog /> Settings</li>
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
