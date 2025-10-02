// ClerkDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHome,
  FaUserCircle,
  FaSignOutAlt,
  FaClipboardList,
  FaChevronDown,
  FaLock,
  FaBell,
  FaCalendarAlt,
  FaPlus,
  FaCheck,
  FaEdit,
  FaBars,
} from "react-icons/fa";
import "./ClerkDashboard.css";

export default function ClerkDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [submittedCases, setSubmittedCases] = useState([]);
  const [caseStats, setCaseStats] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const casesPerPage = 6;

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load user & fetch data
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return navigate("/login");

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "clerk") return navigate("/unauthorized");

    setUser(parsedUser);

    fetchSubmittedCases(parsedUser._id);
    fetchCaseStats(parsedUser._id);
    fetchNotifications(parsedUser._id);
  }, [navigate]);

  // API Calls
  const fetchSubmittedCases = async (clerkId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/cases/submitted/byClerk/${clerkId}`
      );
      setSubmittedCases(res.data);
    } catch (err) {
      console.error("Error fetching submitted cases:", err);
    }
  };

  const fetchCaseStats = async (clerkId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/cases/submitted/byClerk/${clerkId}`
      );

      const stats = { Submitted: 0, Approved: 0, Pending: 0 };
      res.data.forEach((c) => {
        if (c.status === "Submitted") stats.Submitted++;
        else if (c.status === "Approved") stats.Approved++;
        else if (c.status === "Pending") stats.Pending++;
      });

      setCaseStats(stats);
    } catch (err) {
      console.error("Error fetching case stats:", err);
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

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Pagination + Search
  const filteredCases = submittedCases.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLast = currentPage * casesPerPage;
  const indexOfFirst = indexOfLast - casesPerPage;
  const currentCases = filteredCases.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCases.length / casesPerPage);

  return (
    <div className="admin-dashboard">
      {/* Header (copied from RegistrarDashboard) */}
      <header className="admin-header navbar navbar-expand-lg navbar-light bg-light shadow-sm px-3">
        {/* Left: Logo */}
        <div className="navbar-brand fw-bold">CourtSys</div>

        {/* Mobile Menu Button */}
        <button
          className="btn btn-light d-lg-none ms-auto"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#mobileMenu"
          aria-controls="mobileMenu"
        >
          <FaBars />
        </button>

        {/* Desktop Section */}
        <div className="collapse navbar-collapse d-none d-lg-flex justify-content-end">
          {/* Search */}
          <form className="d-flex me-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ maxWidth: "400px" }}
            />
          </form>

          {/* Notifications */}
          <div className="position-relative me-3">
            <FaBell size={24} />
            {notifications.length > 0 && (
              <span className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">
                {notifications.length}
              </span>
            )}
          </div>

          {/* User Dropdown */}
          <div className="position-relative" ref={userDropdownRef}>
            <button
              className="btn btn-light d-flex align-items-center"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            >
              <FaUserCircle size={28} className="me-2" />
              <span>{user?.name}</span>
              <FaChevronDown className="ms-1" />
            </button>

            {userDropdownOpen && (
              <div
                className="dropdown-menu show shadow p-2"
                style={{ right: 0, position: "absolute" }}
              >
                <div className="px-3 py-2 border-bottom">
                  <div className="fw-bold">{user?.name}</div>
                  <small className="text-muted">{user?.email}</small>
                </div>
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
      </header>

      {/* Mobile Offcanvas Menu */}
      <div
        className="offcanvas offcanvas-start"
        tabIndex="-1"
        id="mobileMenu"
        aria-labelledby="mobileMenuLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="mobileMenuLabel">Menu</h5>
          <button
            type="button"
            className="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <ul className="list-group">
            <li className="list-group-item" onClick={() => navigate("/clerkdashboard")}>
              <FaHome /> Home
            </li>
            <li className="list-group-item" onClick={() => navigate("/CaseRegistration")}>
              <FaPlus /> Register Case
            </li>
            <li className="list-group-item" onClick={() => navigate("/submittedcases")}>
              <FaClipboardList /> Submitted Cases
            </li>
            <li className="list-group-item" onClick={() => navigate("/notifications")}>
              <FaBell /> Notifications
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content (unchanged) */}
      <div className="admin-content">
        <aside className="admin-sidebar d-none d-lg-block" style={{ width: "300px" }}>
          <ul className="admin-nav">
            <li className="active" onClick={() => navigate("/clerkdashboard")}>
              <FaHome /> Home
            </li>
            <li onClick={() => navigate("/CaseRegistration")}>
              <FaPlus /> Register Case
            </li>
            <li onClick={() => navigate("/submittedcases")}>
              <FaClipboardList /> Submitted Cases
            </li>
            <li onClick={() => navigate("/notifications")}>
              <FaBell /> Notifications
            </li>
          </ul>
        </aside>

        <main className="admin-main">
          {/* Stat Cards */}
          <section className="admin-grid">
            <div className="admin-card stat-card total-cases">
              <div className="stat-icon" style={{ fontSize: "3rem", color: "green" }}>
                <FaClipboardList />
              </div>
              <div className="stat-info">
                <h3>Total Submitted</h3>
                <p>{submittedCases.length}</p>
              </div>
            </div>

            <div className="admin-card stat-card approved-cases">
              <div className="stat-icon" style={{ fontSize: "3rem", color: "blue" }}>
                <FaCheck />
              </div>
              <div className="stat-info">
                <h3>Approved</h3>
                <p>{caseStats.Approved || 0}</p>
              </div>
            </div>

            <div className="admin-card stat-card pending-cases">
              <div className="stat-icon" style={{ fontSize: "3rem", color: "orange" }}>
                <FaEdit />
              </div>
              <div className="stat-info">
                <h3>Pending Approval</h3>
                <p>{caseStats.Pending || 0}</p>
              </div>
            </div>
          </section>

          {/* Submitted Cases Table */}
          <section className="admin-card card-table" style={{ marginTop: "20px" }}>
            <h3>Submitted Cases</h3>
            <div style={{ margin: "1rem 0" }}>
              <input
                type="text"
                value={searchTerm}
                placeholder="Search cases..."
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="search-input"
              />
            </div>

            <div className="table-responsive table-card">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Filed By</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCases.map((c) => (
                    <tr key={c._id}>
                      <td>{c.title}</td>
                      <td>{c.description}</td>
                      <td>{c.filedByName || "N/A"}</td>
                      <td>{c.status}</td>
                      <td>
                        <button
                          className="btn btn-edit"
                          onClick={() => navigate(`/submittedcases/${c._id}`)}
                        >
                          <FaEdit /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {currentCases.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center" }}>
                        No submitted cases
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
