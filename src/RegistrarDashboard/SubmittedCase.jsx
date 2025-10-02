// SubmittedCases.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaClipboardList,
  FaGavel,
  FaTimesCircle,
  FaChartPie,
  FaBell,
  FaLock,
  FaUserCircle,
  FaSignOutAlt,
  FaCheckCircle,
} from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

export default function SubmittedCases() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [submittedCases, setSubmittedCases] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const userDropdownRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    fetchSubmittedCases();
    fetchNotifications(parsedUser._id);
  }, [navigate]);

  const fetchSubmittedCases = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/cases/submitted");
      setSubmittedCases(res.data);
    } catch (err) {
      console.error("Error fetching submitted cases:", err);
    }
  };

  const fetchNotifications = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/notifications/${userId}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const approveCase = async (caseId) => {
    try {
      await axios.post(`http://localhost:5000/api/cases/approve/${caseId}`, {
        registrarName: user.name,
      });
      alert("Case approved successfully!");
      fetchSubmittedCases();
    } catch (err) {
      console.error("Error approving case:", err);
      alert("Failed to approve case");
    }
  };

  const disapproveCase = async (caseId) => {
    try {
      await axios.post(`http://localhost:5000/api/cases/disapprove/${caseId}`, {
        registrarName: user.name,
      });
      alert("Case disapproved successfully!");
      fetchSubmittedCases();
    } catch (err) {
      console.error("Error disapproving case:", err);
      alert("Failed to disapprove case");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="admin-dashboard" style={{ padding: 0, margin: 0, minHeight: "100vh" }}>
      {/* HEADER (copied from RegistrarDashboard) */}
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
              <li className="list-group-item" onClick={() => navigate("/registrardashboard")}>
                <FaHome /> Home
              </li>
              <li className="list-group-item active" onClick={() => navigate("/submittedcase")}>
                <FaClipboardList /> Submitted Cases
              </li>
              <li className="list-group-item" onClick={() => navigate("/approvedcases")}>
                <FaGavel /> Approved Cases
              </li>
              <li className="list-group-item" onClick={() => navigate("/disapprovedcases")}>
                <FaTimesCircle /> Disapproved Cases
              </li>
              <li className="list-group-item" onClick={() => navigate("/reporting")}>
                <FaChartPie /> Reports
              </li>
              <li className="list-group-item" onClick={() => navigate("/notifications")}>
                <FaBell /> Notifications
              </li>
              <li className="list-group-item" onClick={() => navigate("/settings")}>
                <FaLock /> Settings
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="admin-content" style={{ marginTop: "-59px" }}>
        {/* Sidebar */}
        <aside className="admin-sidebar" style={{ width: "300px" }}>
          <ul className="admin-nav">
            <li onClick={() => navigate("/registrardashboard")}>
              <FaHome /> Home
            </li>
            <li className="active" onClick={() => navigate("/submittedcase")}>
              <FaClipboardList /> Submitted Cases
            </li>
            <li onClick={() => navigate("/approvedcases")}>
              <FaGavel /> Approved Cases
            </li>
            <li onClick={() => navigate("/disapprovedcases")}>
              <FaTimesCircle /> Disapproved Cases
            </li>
            <li onClick={() => navigate("/reporting")}>
              <FaChartPie /> Reports
            </li>
            <li onClick={() => navigate("/notifications")}>
              <FaBell /> Notifications
            </li>
            <li onClick={() => navigate("/settings")}>
              <FaLock /> Settings
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          <section className="admin-card card-table">
            <h3>Submitted Cases</h3>
            <div className="table-responsive table-card">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Case Number</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Filed By</th>
                    <th>Approve/Disapprove</th>
                  </tr>
                </thead>
                <tbody>
                  {submittedCases.map((c) => (
                    <tr key={c._id}>
                      <td>{c.caseNumber || c._id}</td>
                      <td>{c.title}</td>
                      <td>{c.description}</td>
                      <td>{c.filedByName || "N/A"}</td>
                      <td>
                        <div className="action-buttons" style={{ display: "flex", gap: "10px" }}>
                          <button
                            style={{ backgroundColor: "green", color: "white", borderRadius: 40 }}
                            className="btn btn-approve"
                            onClick={() => approveCase(c._id)}
                          >
                            <FaCheckCircle />
                          </button>
                          <button
                            style={{ backgroundColor: "red", color: "white", borderRadius: 40 }}
                            className="btn btn-disapprove"
                            onClick={() => disapproveCase(c._id)}
                          >
                            <FaTimesCircle />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {submittedCases.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center" }}>
                        No submitted cases available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
