// AssignedCases.jsx — Modern UI Section for Registrar Dashboard
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUserCircle,
  FaSignOutAlt,
  FaClipboardList,
  FaChartPie,
  FaLock,
  FaBell,
  FaGavel,
  FaTimesCircle,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./AssignedCases.css";

export default function AssignedCases() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [cases, setCases] = useState([]);

  const userDropdownRef = useRef();

  // Load user + fetch data
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "registrar") {
      navigate("/unauthorized");
      return;
    }
    setUser(parsedUser);
    fetchAssignedCases(parsedUser._id);
    fetchNotifications(parsedUser._id);
  }, [navigate]);

  // Fetch assigned cases and create notifications for judges
  const fetchAssignedCases = async (registrarId) => {
    try {
      const res = await axios.get(
        `https://courtcase-backend.onrender.com/cases/assigned-to-registrar/${registrarId}`
      );
      const assignedCases = res.data;
      setCases(assignedCases);

      // Automatically create notifications for judges
      for (const c of assignedCases) {
        if (c.assignedJudge?._id) {
          await axios.post(
            `https://courtcase-backend.onrender.com/notifications/create`,
            {
              userId: c.assignedJudge._id,
              caseId: c._id,
              message: `You have been assigned a new case: ${c.title} (#${c.caseNumber})`,
              status: "Unread",
            }
          );
        }
      }
    } catch (err) {
      console.error("Failed to load assigned cases:", err);
    }
  };

  const fetchNotifications = async (userId) => {
    try {
      const res = await axios.get(
        `https://courtcase-backend.onrender.com/notifications/${userId}`
      );
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="assigned-wrapper">
      {/* === HEADER (copied exactly from RegistrarDashboard.jsx) === */}
      <header
        style={{
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          zIndex: 1000,
          padding: "12px 0",
        }}
      >
        <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
          {/* Logo */}
          <a
            className="navbar-brand fw-bold"
            href="#"
            style={{ color: "#007bff" }}
          >
            CourtSys
          </a>

          {/* Mobile Menu Button */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#mobileMenu"
            aria-controls="mobileMenu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Desktop: Search + Notifications + User */}
          <div
            className="collapse navbar-collapse d-none d-lg-flex justify-content-end"
            style={{ display: "flex", justifyContent: "space-evenly" }}
          >
            {/* Search */}
            <div
              className="collapse navbar-collapse d-none d-lg-flex justify-content-end"
              style={{ marginLeft: 250 }}
            >
              <form className="d-flex mx-3" style={{ flex: 8, maxWidth: 400 }}>
                <input
                  className="form-control"
                  type="search"
                  placeholder="Search cases..."
                  aria-label="Search"
                  style={{ borderRadius: 30 }}
                />
              </form>
            </div>
            <div className="navbar-collapse d-none d-lg-flex justify-content-end">
              {/* Notifications */}
              <div className="nav-item me-3 position-relative">
                <FaBell size={22} />
                {notifications.length > 0 && (
                  <span className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">
                    {notifications.length}
                  </span>
                )}
              </div>

              {/* User */}
              <div className="position-relative" ref={userDropdownRef}>
                <button
                  className="btn btn-light d-flex align-items-center"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <FaUserCircle size={28} className="me-2" />
                  <span>{user?.name}</span>
                </button>

                {userDropdownOpen && (
                  <div
                    className="dropdown-menu show shadow p-2"
                    style={{ right: 0, position: "absolute" }}
                  >
                    <span style={{ color: "#6c757d", fontSize: "0.7em" }}>
                      {user?.email}
                    </span>
                    <button
                      className="dropdown-item d-flex align-items-center"
                      onClick={() => navigate("/change-password")}
                    >
                      <FaLock className="me-1" /> Change Password
                    </button>
                    <button
                      className="dropdown-item d-flex align-items-center"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt className="me-1" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Offcanvas Menu */}
        <div
          className="offcanvas offcanvas-start"
          tabIndex="-1"
          id="mobileMenu"
          aria-labelledby="mobileMenuLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="mobileMenuLabel">
              Menu
            </h5>
            <button
              type="button"
              className="btn-close text-reset"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <ul className="list-group">
              <li
                className="list-group-item"
                onClick={() => navigate("/registrardashboard")}
              >
                <FaHome /> Home
              </li>
              <li
                className="list-group-item"
                onClick={() => navigate("/submittedcase")}
              >
                <FaClipboardList /> Submitted Cases
              </li>
              <li
                className="list-group-item"
                onClick={() => navigate("/approvedcases")}
              >
                <FaGavel /> Approved Cases
              </li>
              <li
                className="list-group-item"
                onClick={() => navigate("/disapprovedcases")}
              >
                <FaTimesCircle /> Disapproved Cases
              </li>
              <li
                className="list-group-item"
                onClick={() => navigate("/reporting")}
              >
                <FaChartPie /> Reports
              </li>
              <li
                className="list-group-item"
                onClick={() => navigate("/notifications")}
              >
                <FaBell /> Notifications
              </li>
              <li
                className="list-group-item"
                onClick={() => navigate("/settings")}
              >
                <FaLock /> Settings
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* === BODY === */}
      <h2 className="section-title">📂 Assigned Cases</h2>
      {cases.length === 0 ? (
        <p className="text-muted">No cases have been assigned yet.</p>
      ) : (
        <div className="card-list">
          {cases.map((item) => (
            <div className="case-card" key={item._id}>
              <h4 className="case-title">{item.title}</h4>
              <p className="case-description">{item.description}</p>
              <div className="case-meta">
                <span>
                  Filed By: <strong>{item.filedByName || "N/A"}</strong>
                </span>
                <span>
                  Status: <strong>{item.status}</strong>
                </span>
                <span>
                  Judge:{" "}
                  <strong>{item.assignedJudge?.name || "Unassigned"}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
