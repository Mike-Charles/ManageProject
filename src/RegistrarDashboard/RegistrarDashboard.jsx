// RegistrarDashboard.jsx
import React, { useEffect, useState, useRef} from "react";
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
  FaEye,
  FaClipboard,
  FaFileAlt,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./RegistrarDashboard.css";
import Dropdown from 'react-bootstrap/Dropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';




export default function RegistrarDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [submittedCases, setSubmittedCases] = useState([]);
  const [approvedCases, setApprovedCases] = useState([]);
  const [disapprovedCases, setDisapprovedCases] = useState([]);
  const [judges, setJudges] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [caseStats, setCaseStats] = useState({});
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [viewCase, setViewCase] = useState(null); // Case to view in modal
  const [selectedJudge, setSelectedJudge] = useState({});
  
  



  

  // Load user & dashboard data
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
    fetchApprovedCases();
    fetchDisapprovedCases();
    fetchJudges();
    fetchStats();
    fetchNotifications(parsedUser._id);
  }, [navigate]);

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


  // Fetch submitted cases
  const fetchSubmittedCases = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/cases/submitted");
      setSubmittedCases(res.data);
    } catch (err) {
      console.error("Error fetching submitted cases:", err);
    }
  };

  // Fetch approved cases
  const fetchApprovedCases = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/cases/approved");
      setApprovedCases(res.data);
    } catch (err) {
      console.error("Error fetching approved cases:", err);
    }
  };

  // Fetch disapproved cases
  const fetchDisapprovedCases = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/cases/disapproved");
      setDisapprovedCases(res.data);
    } catch (err) {
      console.error("Error fetching disapproved cases:", err);
    }
  };

  // Fetch judges
  const fetchJudges = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/judges");
      setJudges(res.data);
    } catch (err) {
      console.error("Error fetching judges:", err);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/cases/status-stats");
      setCaseStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Fetch notifications
  const fetchNotifications = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/notifications/${userId}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };



    const handleAssign = async (caseId) => {
      if (!selectedJudge[caseId]) {
        alert("Please select a judge before assigning.");
        return;
      }
      try {
        await axios.post(`http://localhost:5000/api/cases/endorse/${caseId}`, {
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

  // Chart data
  const chartData = [
    { name: "Filed", count: caseStats.Filed || 0 },
    { name: "Registered", count: caseStats.Registered || 0 },
    { name: "Submitted", count: caseStats.Submitted || 0 },
    { name: "Approved", count: caseStats.Approved || 0 },
    { name: "Disapproved", count: caseStats.Disapproved || 0 },
  ];

  return (
    <div className="admin-dashboard" style={{padding: 0, margin: 0, minHeight: "100vh"}}>
      {/* HEADER */}
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
          <div className="collapse navbar-collapse d-none d-lg-flex justify-content-end" style={{display: "flex", justifyContent: "space-evenly"}}>
            {/* Search */}
            <div className="collapse navbar-collapse d-none d-lg-flex justify-content-end" style={{marginLeft: 250}}>
              <form className="d-flex mx-3" style={{ flex: 8, maxWidth: 400 }}>
                <input
                  className="form-control"
                  type="search"
                  placeholder="Search cases..."
                  aria-label="Search"
                  style={{ borderRadius: 30}}
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
                    <span style={{ color: "#6c757d", fontSize: "0.7em" }}>{user?.email}</span>
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
      

      {/* BODY */}
      <div className="admin-content" style={{marginTop:  "-59px" }}>
        {/* Sidebar */}
        <aside className="admin-sidebar" style={{ width: "300px", height: "100%" }}>
          <ul className="admin-nav">
            <li
              className="active"
              onClick={() => navigate("/registrardashboard")}
            >
              <FaHome /> Home
            </li>
            <li onClick={() => navigate("/submittedcase")}>
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
        

        {/* Main */}
        <main className="admin-main">
          {/* Stat Cards */}
          <section className="admin-grid">
            <div className="admin-card stat-card">
              <div
                className="stat-icon"
                style={{ fontSize: "3rem", color: "blue" }}
              >
                <FaClipboardList />
              </div>
              <div className="stat-info">
                <h3 style={{ fontSize: "18px"}}> Submitted Cases</h3>
                <p>{submittedCases.length}</p>
              </div>
            </div>
            <div className="admin-card stat-card">
              <div
                className="stat-icon"
                style={{ fontSize: "3rem", color: "green" }}
              >
                <FaGavel />
              </div>
              <div className="stat-info">
                <h3 style={{ fontSize: "18px"}}>Approved Cases</h3>
                <p>{approvedCases.length}</p>
              </div>
            </div>
            <div className="admin-card stat-card">
              <div
                className="stat-icon"
                style={{ fontSize: "3rem", color: "#D32F2F" }}
              >
                <FaTimesCircle />
              </div>
              <div className="stat-info">
                <h3 style={{ fontSize: "16px"}}>Disapproved Cases</h3>
                <p>{disapprovedCases.length}</p>
              </div>
            </div>
          </section>

          {/* Cases Ready for Assignment */}
          <section className="admin-card card-table">
            <h3>Cases Ready for Assignment</h3>
            <div className="table-responsive table-card">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Assign Judge</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedCases.map((c) => (
                    <tr key={c._id}>
                      <td>{c.title}</td>
                      <td>{c.description}</td>
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
                        <div className="d-flex">
                          <button
                            className="btn btn-sm btn-primary me-2"
                            style={{ backgroundColor: "grey", color: "white", borderRadius: 30, display: "flex", gap: "8px", alignItems: "center", padding: "6px 12px", border: "none", cursor: "pointer" }}
                            onClick={() => setViewCase(c)}
                            data-bs-toggle="modal"
                            data-bs-target="#viewCaseModal"
                          >
                            <FaEye /> View
                          </button>
                          <button
                            style={{ backgroundColor: "#388E3C", color: "white", borderRadius: 30, display: "flex", gap: "8px", alignItems: "center", padding: "6px 12px", border: "none", cursor: "pointer"}}
                            onClick={() => handleAssign(c._id)}
                            className="btn btn-success"
                          >
                            Assign
                          </button>
                        </div>
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



          {/* View Case Modal */}
          <div className="modal fade" id="viewCaseModal" tabIndex="-1" aria-labelledby="viewCaseModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header text-white" style={{ backgroundColor: "lightblue" }}>
                  <h5 className="modal-title" id="viewCaseModalLabel">Case Details</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  {viewCase ? (
                    <div className="container">
                      <div className="row mb-3">
                        <div className="col-md-6"><strong>Case Title:</strong> {viewCase.title}</div>
                        <div className="col-md-6"><strong>Filing Date:</strong> {new Date(viewCase.filingDate).toLocaleDateString()}</div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-12"><strong>Description:</strong> {viewCase.description}</div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6"><strong>Filed By:</strong> {viewCase.filedByName}</div>
                        <div className="col-md-6"><strong>Status:</strong> {viewCase.status}</div>
                      </div>
                      <hr />
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <h6>Plaintiff</h6>
                          <p><strong>Name:</strong> {viewCase.plaintiff?.name}</p>
                          <p><strong>Address:</strong> {viewCase.plaintiff?.address}</p>
                          <p><strong>Phone:</strong> {viewCase.plaintiff?.phone}</p>
                          <p><strong>Email:</strong> {viewCase.plaintiff?.email}</p>
                        </div>
                        <div className="col-md-6">
                          <h6>Defendant</h6>
                          <p><strong>Name:</strong> {viewCase.defendant?.name}</p>
                          <p><strong>Address:</strong> {viewCase.defendant?.address}</p>
                          <p><strong>Phone:</strong> {viewCase.defendant?.phone}</p>
                          <p><strong>Email:</strong> {viewCase.defendant?.email}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p>No case selected</p>
                  )}
                </div>
              </div>
            </div>
          </div>          

          {/* Disapproved Cases */}
          <section className="admin-card card-table">
            <h3>Disapproved Cases</h3>
            <div className="table-responsive table-card">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Filed By</th>
                  </tr>
                </thead>
                <tbody>
                  {disapprovedCases.map((c) => (
                    <tr key={c._id}>
                      <td>{c.title}</td>
                      <td>{c.description}</td>
                      <td>{c.filedByName || "N/A"}</td>
                    </tr>
                  ))}
                  {disapprovedCases.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center" }}>
                        No disapproved cases
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Reporting */}
          <section className="admin-card card-table">
            <h3>
              <FaChartPie /> Reporting Summary
            </h3>
            <div
              className="chart-container"
              style={{ width: "100%", height: 300 }}
            >
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#007bff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
