import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaUserCircle,
  FaChartBar,
  FaUsersCog,
  FaSignOutAlt,
  FaPaperPlane,
  FaChevronDown,
  FaBell,
  FaHome,
  FaClipboardList,
  FaCalendarAlt,
  FaGavel,
  FaChartPie,
  FaLock,
  FaFileAlt,
  FaCog,
  
} from 'react-icons/fa';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [counts, setCounts] = useState({ users: 0, cases: 0, ClosedCases: 0 });
  const [roleData, setRoleData] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // Removed unused currentTime state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);
  const userDropdownRef = useRef(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  // Removed unused currentPage state
  const [searchTerm, setSearchTerm] = useState('');

  // Removed unused currentTime effect

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'admin') {
        navigate('/unauthorized');
      } else {
        setUser(parsedUser);
      }
    }
  }, [navigate]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, casesRes, closedRes, rolesRes, recentUsersRes] = await Promise.all([
          axios.get('https://courtcase-backend.onrender.com/api/users/count'),
          axios.get('https://courtcase-backend.onrender.com/api/cases/count'),
          axios.get('https://courtcase-backend.onrender.com/api/cases/closed'),
          axios.get('https://courtcase-backend.onrender.com/api/users/roles/count'),
          axios.get('https://courtcase-backend.onrender.com/api/users/recent'), // Add this route in backend
        ]);

        setCounts({
          users: usersRes.data.count || 0,
          cases: casesRes.data.count || 0,
          ClosedCases: closedRes.data.closedCount || 0,
        });

        const rolesArray = Object.entries(rolesRes.data).map(([role, count]) => ({
          name: role.charAt(0).toUpperCase() + role.slice(1),
          count,
        }));
        setRoleData(rolesArray);
        setRecentUsers(recentUsersRes.data || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Add markAsRead function
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`https://courtcase-backend.onrender.com/api/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, status: "Read" } : n
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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

      {/* Content */}
      <div className="admin-content" style={{ display: 'flex', padding: 0 }}>
        <aside className="admin-sidebar">
          <ul className="admin-nav">
            <li className="active"><FaHome /> Home</li>
            <li onClick={() => navigate('/manageusers')}><FaUsersCog /> Manage Users</li>
            <li onClick={() => navigate('/managecases')}><FaClipboardList /> Manage Cases</li>
            <li onClick={() => navigate('/reports')}><FaFileAlt /> Reports</li>
            <li onClick={() => navigate('/settings')}><FaCog /> Settings</li>
          </ul>
        </aside>


        <main className="admin-main">
          <section className="admin-grid">
            {loading ? (
              <p>Loading dashboard...</p>
            ) : (
              <>
                {/* Stat Cards */}
                <div className="admin-card stat-card users">
                  <div className="stat-icon"><FaUsersCog size={24} /></div>
                  <div className="stat-info">
                    <h3>Total Users</h3>
                    <p>{counts.users}</p>
                  </div>
                </div>
                <div className="admin-card stat-card cases">
                  <div className="stat-icon"><FaChartBar size={24} /></div>
                  <div className="stat-info">
                    <h3>Cases Filed</h3>
                    <p>{counts.cases}</p>
                  </div>
                </div>
                <div className="admin-card stat-card closed-cases">
                  <div className="stat-icon"><FaPaperPlane size={24} /></div>
                  <div className="stat-info">
                    <h3>Closed Cases</h3>
                    <p>{counts.ClosedCases}</p>
                  </div>
                </div>


              </>
            )}
          </section>
          <section className="admin-charts">
            <div className="admin-card full-width">
              <h3>Recently Created Users</h3>
              <div className="recent-users-row">
                {recentUsers.length > 0 ? (
                  recentUsers.map((u, i) => (
                    <div className="recent-user-card" key={u._id || i}>
                      <h4>{u.name}</h4>
                      <p>{u.email}</p>
                      <span className="user-role">{u.role}</span>
                    </div>
                  ))
                ) : (
                  <p>No recent users found.</p>
                )}
              </div>
            </div>


            {/* Chart */}
            <div className="admin-card full-width full-height">
              <h3>User Distribution by Role</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
