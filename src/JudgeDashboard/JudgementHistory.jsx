// JudgmentHistory.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUserCircle,
  FaSignOutAlt,
  FaClipboardList,
  FaChevronDown,
  FaLock,
  FaBell,
  FaCalendarAlt,
  FaGavel,
  FaChartPie,
} from "react-icons/fa";
import "./JudgeDashboard.css";

export default function JudgmentHistory() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [judgments, setJudgments] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) navigate("/login");

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "judge") navigate("/unauthorized");

    setUser(parsedUser);
    fetchJudgments(parsedUser._id);
    fetchNotifications(parsedUser._id);
  }, [navigate]);

  const fetchJudgments = async (judgeId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/judgments/judge/${judgeId}`
      );
      setJudgments(res.data);
    } catch (err) {
      console.error("Error fetching judgments:", err);
    }
  };

  const fetchNotifications = async (userId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/notifications/${userId}`
      );
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-logo">CourtSys</div>
        <div className="admin-header-extras">
          <div className="admin-notifications">
            <FaBell size={24} />
            {notifications.length > 0 && (
              <span className="notification-count">
                {notifications.length}
              </span>
            )}
          </div>
          <div
            className="admin-user-dropdown"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <FaUserCircle size={32} />
            <div className="admin-user-dropdown-info">
              <div className="admin-user-name">{user?.name}</div>
              <div className="admin-user-email">{user?.email}</div>
            </div>
            <FaChevronDown className="dropdown-icon" />
            {dropdownOpen && (
              <div className="dropdown-menu">
                <div
                  className="dropdown-item"
                  onClick={() => navigate("/change-password")}
                >
                  <FaLock /> Change Password
                </div>
                <div className="dropdown-item" onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="admin-content">
        {/* Sidebar */}
        <aside className="admin-sidebar" style={{ width: "250px" }}>
          <ul className="admin-nav">
            <li onClick={() => navigate("/judgedashboard")}>
              <FaHome /> Home
            </li>
            <li onClick={() => navigate("/casesassigned")}>
              <FaClipboardList /> Assigned Cases
            </li>
            <li onClick={() => navigate("/schedulehearing")}>
              <FaCalendarAlt /> Hearing Schedule
            </li>
            <li className="active" onClick={() => navigate("/judgments")}>
              <FaGavel /> Judgment History
            </li>
            <li onClick={() => navigate("/progress")}>
              <FaChartPie /> Case Progress
            </li>
            <li onClick={() => navigate("/notification")}>
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
             Notifications
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          <section className="admin-card">
            <h3>Judgment History</h3>
            {judgments.length === 0 ? (
              <p>No judgments found.</p>
            ) : (
              <div className="judgment-list">
                {judgments.map((j) => (
                  <div key={j._id} className="judgment-card">
                    <h4>{j.caseId?.title || "Untitled Case"}</h4>
                    <p>
                      <strong>Case Number:</strong> {j.caseId?.caseNumber}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(j.judgmentDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Outcome:</strong> {j.outcome}
                    </p>
                    <p>
                      <strong>Summary:</strong> {j.summary}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
