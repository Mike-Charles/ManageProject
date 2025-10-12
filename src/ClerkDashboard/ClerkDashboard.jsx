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
  FaGavel,
  FaChartPie
  , FaEye
} from "react-icons/fa";
import "./ClerkDashboard.css";

export default function ClerkDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cases, setCases] = useState([]);
  const [caseStats, setCaseStats] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
    const [viewCase, setViewCase] = useState(null); // Case to view in modal
  const userDropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const casesPerPage = 6;







  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return navigate("/login");
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "clerk") return navigate("/unauthorized");
    setUser(parsedUser);

    // Example: fetch notifications (you can replace with backend API)
    setNotifications([
      {
        _id: "1",
        title: "Case Update",
        message: "A case you filed has been assigned a judge.",
        status: "Unread",
        sentAt: new Date(),
      },
      {
        _id: "2",
        title: "System Message",
        message: "Your password will expire soon.",
        status: "Read",
        sentAt: new Date(),
      },
    ]);

    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navigate]);







  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
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
    
    fetchCasesByClerk(parsedUser._id);
    fetchNotifications(parsedUser._id);
  }, [navigate]);

  // Fetch registered cases for clerk
const fetchCasesByClerk = async (clerkId) => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/cases/all/byClerk/${clerkId}`
    );
    setCases(res.data);

    // Count cases by status
    const stats = { Registered: 0, Submitted: 0, Approved: 0, Pending: 0, Disapproved: 0 };
    res.data.forEach((c) => {
      if (c.status === "Registered") stats.Registered++;
      else if (c.status === "Submitted") stats.Submitted++;
      else if (c.status === "Approved") stats.Approved++;
      else if (c.status === "Pending") stats.Pending++;
      else if (c.status === "Disapproved") stats.Disapproved++;
    });

    setCaseStats(stats);
  } catch (err) {
    console.error("Error fetching cases:", err);
  }
};


  // Fetch notifications
  const fetchNotifications = async (userId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/notifications/${userId}`
      );
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/markAsRead/${notificationId}`
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, status: "Read" } : n
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Pagination + Search
  const filteredCases = cases.filter(
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
      {/* HEADER */}
      <header
        style={{
          position: "sticky",
          top: 0,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          zIndex: 1000,
          padding: "12px 0",
        }}
      >
        <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
          <a
            className="navbar-brand fw-bold"
            href="#"
            style={{ color: "#007bff" }}
          >
            CourtSys
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#mobileMenu"
            aria-controls="mobileMenu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className="collapse navbar-collapse d-none d-lg-flex justify-content-end"
            style={{ display: "flex", justifyContent: "space-evenly" }}
          >
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
                  value={searchTerm}
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
                          className={`notification-item p-2 mb-1 ${
                            n.status === "Unread" ? "bg-light" : ""
                          }`}
                          style={{ cursor: "pointer", borderRadius: "5px" }}
                          onClick={() => markAsRead(n._id)}
                        >
                          <strong>{n.title || "New Case Assigned"}</strong>
                          <p style={{ margin: 0, fontSize: "0.85rem" }}>
                            {n.message}
                          </p>
                          <small className="text-muted">
                            {new Date(n.sentAt).toLocaleString()}
                          </small>
                        </div>
                      ))
                    )}
                  </div>
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
                    <span
                      style={{ color: "#6c757d", fontSize: "0.7em" }}
                    >
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
                onClick={() => navigate("/clerkdashboard")}
              >
                <FaHome /> Home
              </li>
              <li
                className="list-group-item"
                onClick={() => navigate("/caseregistration")}
              >
                <FaPlus /> Register Case
              </li>
              <li
                className="list-group-item"
                onClick={() => navigate("/submittedcases")}
              >
                <FaClipboardList /> Submitted Cases
              </li>
              <li
                className="list-group-item"
                onClick={() => navigate("/notifications")}
              >
                <FaBell /> Notifications
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* Sidebar + Main Content */}
      <div className="admin-content" style={{ padding: 0 }}>
        <aside className="admin-sidebar d-none d-lg-block" style={{ width: "300px" }}>
          <ul className="admin-nav">
            <li className="active" onClick={() => navigate("/clerkdashboard")}><FaHome /> Home</li>
            <li onClick={() => navigate("/caseregistration")}><FaPlus /> Register Case</li>
            <li onClick={() => navigate("/submittedcases")}><FaClipboardList /> Submitted Cases</li>
            <li onClick={() => navigate("/notifications")}><FaBell /> Notifications</li>
          </ul>
        </aside>

        <main className="admin-main">
          <section className="admin-grid">
            <div className="admin-card stat-card registered-cases">
              <div className="stat-icon" style={{ fontSize: "3rem", color: "green" }}><FaClipboardList /></div>
              <div className="stat-info">
                <h3>Registered</h3>
                <p>{caseStats.Registered || 0}</p>
              </div>
            </div>
            <div className="admin-card stat-card submitted-cases">
              <div className="stat-icon" style={{ fontSize: "3rem", color: "blue" }}><FaCheck /></div>
              <div className="stat-info">
                <h3>Submitted</h3>
                <p>{caseStats.Submitted || 0}</p>
              </div>
            </div>
            <div className="admin-card stat-card approved-cases">
              <div className="stat-icon" style={{ fontSize: "3rem", color: "purple" }}><FaCheck /></div>
              <div className="stat-info">
                <h3>Approved</h3>
                <p>{caseStats.Approved || 0}</p>
              </div>
            </div>
          </section>

          {/* Registered Cases Table */}
          <section className="admin-card card-table" style={{ marginTop: "20px" }}>
            <h3>Registered Cases</h3>
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
                          className=""
                          style={{ backgroundColor: "grey", color: "white", borderRadius: 30, display: "flex", gap: "8px", alignItems: "center", padding: "6px 12px", border: "none", cursor: "pointer" }}
                          onClick={() => setViewCase(c)}
                          data-bs-toggle="modal"
                          data-bs-target="#viewCaseModal"
                        >
                          <FaEye /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {currentCases.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center" }}>
                        No registered cases
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




        </main>
      </div>
    </div>
  );
}
