import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaUserCircle,
  FaChartBar,
  FaUsersCog,
  FaSignOutAlt,
  FaPaperPlane,
  FaChevronDown,
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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

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
          axios.get('http://localhost:5000/api/users/count'),
          axios.get('http://localhost:5000/api/cases/count'),
          axios.get('http://localhost:5000/api/cases/closed'),
          axios.get('http://localhost:5000/api/users/roles/count'),
          axios.get('http://localhost:5000/api/users/recent'), // Add this route in backend
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-logo">CCMIS</div>
        <div className="admin-datetime">{currentTime.toLocaleString()}</div>
        <div className="admin-header-extras">
          <div className="admin-user-dropdown">
            <FaUserCircle size={32} />
            <div className="admin-user-dropdown-info">
              <div className="admin-user-name">{user?.name}</div>
              <div className="admin-user-email">{user?.email}</div>
            </div>
            <FaChevronDown className="dropdown-icon" />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="admin-content">
        <aside className="admin-sidebar">
          <ul className="admin-nav">
            <li className="active"><FaChartBar /> Dashboard</li>
            <li onClick={() => navigate('/manageusers')}><FaUsersCog /> Manage Users</li>
            <li onClick={handleLogout}><FaSignOutAlt /> Logout</li>
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
