import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaClipboardList,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaLock,
  FaPlus,
  FaCheck,
  FaEllipsisH
  
} from "react-icons/fa";
import "./CaseRegistration.css";

const ClerkCaseRegistration = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionDropdownOpen, setActionDropdownOpen] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [submitCaseId, setSubmitCaseId] = useState(null); // Case selected for submission
  const [successMessage, setSuccessMessage] = useState(""); // Inline success message

  const userDropdownRef = useRef();
  const actionDropdownRef = useRef();
  const notificationsRef = useRef();



  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return navigate("/login");
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "clerk") return navigate("/unauthorized");
    setUser(parsedUser);

    fetchCases(parsedUser._id);
    fetchNotifications(parsedUser._id);

    const handleClickOutside = (event) => {
      if (
        actionDropdownRef.current &&
        !actionDropdownRef.current.contains(event.target)
      ) {
        setActionDropdownOpen(null);
      }
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



  // Submit case to registrar
  const handleConfirmSubmit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/cases/submit/${submitCaseId}`, {
        clerkId: user._id,
        clerkName: user.name,
      });
      fetchCases(user._id);
      setSuccessMessage("Case successfully submitted to the Registrar!");
      setSubmitCaseId(null);
      // Remove success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error submitting case:", err);
    }
  };


  // Fetch cases by clerk
  const fetchCases = async (clerkId) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/cases/registered/byClerk/${clerkId}`
      );
      setCases(res.data || []);
    } catch (err) {
      console.error("Error fetching cases:", err);
      setCases([]);
    }
    setLoading(false);
  };

  // Fetch notifications
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

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/mark-read/${notificationId}`
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

  // Delete a case
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this case?")) {
      try {
        await axios.delete(`http://localhost:5000/api/cases/${id}`);
        setCases(cases.filter((c) => c._id !== id));
      } catch (err) {
        console.error("Error deleting case:", err);
      }
    }
  };



  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Filter cases for search
  const filteredCases = cases.filter(
    (c) =>
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.plaintiff?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.defendant?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
            </div>

            <div className="navbar-collapse d-none d-lg-flex justify-content-end">
              {/* Notifications */}
              <div
                className="nav-item me-3 position-relative"
                ref={notificationsRef}
              >
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

      {/* MAIN CONTENT */}
      <div className="admin-content" style={{ padding: 0 }}>
        <aside
          className="admin-sidebar d-none d-lg-block"
          style={{ width: "300px" }}
        >
          <ul className="admin-nav">
            <li onClick={() => navigate("/clerkdashboard")}>
              <FaHome /> Home
            </li>
            <li className="active" onClick={() => navigate("/CaseRegistration")}>
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
          <section className="admin-card card-table">
            <div className="d-flex justify-content-between align-items-center">
              <h3>Registered Cases</h3>
              <button
                className="btn btn-create"
                onClick={() => navigate("/caseform")}
              >
                <FaPlus className="me-1" /> Register New Case
              </button>
            </div>

                {/* Inline success message */}
                {successMessage && (
                  <div className="alert alert-success mt-2" role="alert">
                    {successMessage}
                  </div>
                )}

            <div className="table-responsive table-card mt-3">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Case Number</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Plaintiff</th>
                    <th>Defendant</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredCases.length > 0 ? (
                    filteredCases.map((c) => (
                      <tr key={c._id}>
                        <td>{c.caseNumber || "N/A"}</td>
                        <td>{c.title}</td>
                        <td>{c.description || "N/A"}</td>
                        <td>{c.plaintiff?.name || "N/A"}</td>
                        <td>{c.defendant?.name || "N/A"}</td>
                        <td>{c.status}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <button
                              className="btn btn-success btn-sm d-flex align-items-center gap-1"
                              onClick={() => setSubmitCaseId(c._id)}
                              style={{ borderRadius: "20px", backgroundColor: "#28a745", border: "none", padding: "6px 12px", cursor: "pointer" }}
                            >
                              <FaCheck /> Submit
                            </button>

                            <div
                              className="action-dropdown-container"
                              onClick={() =>
                                setActionDropdownOpen(actionDropdownOpen === c._id ? null : c._id)
                              }
                            >
                              <span className="three-dots left">...</span>
                              { actionDropdownOpen === c._id && (
                                <div className="action-dropdown-menu" >
                                  <div
                                    className="action-dropdown-item"
                                    onClick={() => navigate(`/editcase/${c._id}`)}
                                  >
                                    Edit
                                  </div>  
                                  <div
                                    className="action-dropdown-item"
                                    onClick={() => handleDelete(c._id)}
                                  >
                                    Delete
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">
                        No registered cases found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        {/* Submit Confirmation Modal */}
        {submitCaseId && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Submission</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSubmitCaseId(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to submit this case to the Registrar?</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSubmitCaseId(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleConfirmSubmit}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
};

export default ClerkCaseRegistration;
