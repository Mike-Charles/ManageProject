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
} from "react-icons/fa";
import "./RegistrarDashboard.css";

export default function ApprovedCases() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [approvedCases, setApprovedCases] = useState([]);
  const [judges, setJudges] = useState([]);
  const [selectedJudge, setSelectedJudge] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef();

  // Load user & fetch cases + judges
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
    fetchApprovedCases();
    fetchJudges();
    fetchNotifications(parsedUser._id);
  }, [navigate]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch approved cases
  const fetchApprovedCases = async () => {
    try {
      const res = await axios.get("https://courtcase-backend.onrender.com/api/cases/approved");
      setApprovedCases(res.data);
    } catch (err) {
      console.error("Error fetching approved cases:", err);
    }
  };

  // Fetch judges
  const fetchJudges = async () => {
    try {
      const res = await axios.get("https://courtcase-backend.onrender.com/api/users/judges");
      setJudges(res.data);
    } catch (err) {
      console.error("Error fetching judges:", err);
    }
  };

  // Fetch notifications
  const fetchNotifications = async (userId) => {
    try {
      const res = await axios.get(`https://courtcase-backend.onrender.com/api/notifications/${userId}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // Assign judge
  const handleAssign = async (caseId) => {
    if (!selectedJudge[caseId]) {
      alert("Please select a judge before assigning.");
      return;
    }
    try {
      await axios.post(`https://courtcase-backend.onrender.com/api/cases/endorse/${caseId}`, {
        judgeId: selectedJudge[caseId],
        registrarName: user.name,
      });
      setApprovedCases((prev) =>
        prev.map((c) =>
          c._id === caseId
            ? { ...c, successMessage: "Judge assigned successfully!" }
            : c
        )
      );
      setTimeout(() => {
        setApprovedCases((prev) =>
          prev.map((c) =>
            c._id === caseId ? { ...c, successMessage: "" } : c
          )
        );
      }, 3000);
    } catch (err) {
      console.error("Error assigning judge:", err);
      alert("Error assigning judge");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="admin-dashboard" style={{ padding: 0, margin: 0, minHeight: "100vh" }}>
      {/* HEADER - copied exactly from RegistrarDashboard */}
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

          {/* Desktop Search + Notifications + User */}
          <div className="collapse navbar-collapse d-none d-lg-flex justify-content-end" style={{ display: "flex", justifyContent: "space-evenly" }}>
            {/* Search */}
            <div className="collapse navbar-collapse d-none d-lg-flex justify-content-end" style={{ marginLeft: 250 }}>
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

            {/* Notifications */}
            <div className="navbar-collapse d-none d-lg-flex justify-content-end">
              <div className="nav-item me-3 position-relative">
                <FaBell size={22} />
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
            <h5 className="offcanvas-title" id="mobileMenuLabel">Menu</h5>
            <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div className="offcanvas-body">
            <ul className="list-group">
              <li className="list-group-item" onClick={() => navigate("/registrardashboard")}>
                <FaHome /> Home
              </li>
              <li className="list-group-item" onClick={() => navigate("/submittedcase")}>
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
            <li onClick={() => navigate("/submittedcase")}>
              <FaClipboardList /> Submitted Cases
            </li>
            <li className="active" onClick={() => navigate("/approvedcases")}>
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

        {/* Main */}
        <main className="admin-main">
          <section className="admin-card card-table">
            <h3>Approved Cases (Ready for Assignment)</h3>
            <div className="table-responsive table-card">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Case Number</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Filed By</th>
                    <th>Assign Judge</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedCases.map((c) => (
                    <tr key={c._id}>
                      <td>{c.caseNumber || c._id}</td>
                      <td>{c.title}</td>
                      <td>{c.description}</td>
                      <td>{c.filedByName || "N/A"}</td>
                      <td style={{ minWidth: "180px" }}>
                        <select
                          className="form-select"
                          value={selectedJudge[c._id] || ""}
                          onChange={(e) =>
                            setSelectedJudge((prev) => ({
                              ...prev,
                              [c._id]: e.target.value,
                            }))
                          }
                        >
                          <option value="">-- Select Judge --</option>
                          {judges.map((judge) => (
                            <option key={judge._id} value={judge._id}>
                              {judge.fullName || judge.name}
                            </option>
                          ))}
                        </select>
                        {c.successMessage && (
                          <div
                            style={{
                              color: "green",
                              marginTop: "5px",
                              fontWeight: "bold",
                              fontSize: "0.9rem",
                            }}
                          >
                            {c.successMessage}
                          </div>
                        )}
                      </td>
                      <td>
                        <button
                          style={{ backgroundColor: "#388E3C", color: "white", borderRadius: 30 }}
                          onClick={() => handleAssign(c._id)}
                          className="btn btn-success"
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                  {approvedCases.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center" }}>
                        No approved cases found
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
