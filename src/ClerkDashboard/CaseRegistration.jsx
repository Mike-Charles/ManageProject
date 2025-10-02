// ClerkCaseRegistration.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaClipboardList,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaChevronDown,
  FaLock,
  FaPlus,
  FaCheck,
} from "react-icons/fa";
import "./CaseRegistration.css";

const ClerkCaseRegistration = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionDropdownOpen, setActionDropdownOpen] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const userDropdownRef = useRef();
  const actionDropdownRef = useRef();

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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navigate]);

  const fetchCases = async (clerkId) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/cases/registered/byClerk/${clerkId}`
      );
      setCases(res.data);
    } catch (err) {
      console.error("Error fetching cases:", err);
    }
    setLoading(false);
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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this case?")) {
      try {
        await axios.delete(`http://localhost:5000/api/cases/${id}`);
        fetchCases(user._id);
      } catch (err) {
        console.error("Error deleting case:", err);
      }
    }
  };

  const handleSubmitCase = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/cases/submit/${id}`, {
        clerkId: user._id,
        clerkName: user.name,
      });
      fetchCases(user._id);
    } catch (err) {
      console.error("Error submitting case:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const filteredCases = cases.filter(
    (c) =>
      c.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-dashboard">
      {/* Header (copied exactly from ClerkDashboard.jsx) */}
      <header className="admin-header navbar navbar-expand-lg navbar-light bg-light shadow-sm px-3">
        <div className="navbar-brand fw-bold">CourtSys</div>

        {/* Mobile Menu Button */}
        <button
          className="btn btn-light d-lg-none ms-auto"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#mobileMenu"
          aria-controls="mobileMenu"
        >
          ☰
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
              onChange={(e) => setSearchTerm(e.target.value)}
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

      <div className="admin-content">
        {/* Sidebar */}
        <aside className="admin-sidebar d-none d-lg-block" style={{ width: "300px" }}>
          <ul className="admin-nav">
            <li className="list-group-item" onClick={() => navigate("/clerkdashboard")}>
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

        {/* Main Content */}
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

            {/* Table */}
            <div className="table-responsive table-card mt-3">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Case Number</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Filed By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredCases.length > 0 ? (
                    filteredCases.map((c) => (
                      <tr key={c._id}>
                        <td>{c.caseNumber}</td>
                        <td>{c.title}</td>
                        <td>{c.description || "N/A"}</td>
                        <td>{c.status}</td>
                        <td>{c.filedByName}</td>
                        <td>
                          <div
                            className="d-flex align-items-center gap-2"
                            ref={actionDropdownRef}
                          >
                            <button
                              className="btn btn-success btn-sm d-flex align-items-center gap-1"
                              onClick={() => handleSubmitCase(c._id)}
                              style={{ borderRadius: "20px" }}
                            >
                              <FaCheck /> Submit
                            </button>

                            <div
                              className="action-dropdown-container"
                              onClick={() =>
                                setActionDropdownOpen(
                                  actionDropdownOpen === c._id ? null : c._id
                                )
                              }
                            >
                              <span className="three-dots">...</span>
                              {actionDropdownOpen === c._id && (
                                <div className="action-dropdown-menu">
                                  <div
                                    className="action-dropdown-item"
                                    onClick={() =>
                                      navigate(`/cases/edit/${c._id}`)
                                    }
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
                      <td colSpan="6" className="text-center">
                        No registered cases found
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
};

export default ClerkCaseRegistration;
