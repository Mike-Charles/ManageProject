// ClerkRegisterCase.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaBell,
  FaChevronDown,
  FaLock,
  FaSave,
  FaClipboardList,
  FaHome,
  FaPlus,
} from "react-icons/fa";
import "./CaseForm.css";

export default function ClerkRegisterCase() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    caseNumber: "",
    title: "",
    description: "",
    partiesInvolved: "",
    registrationNotes: "",
  });

  const userDropdownRef = useRef();

  // Load user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return navigate("/login");

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "clerk") return navigate("/unauthorized");

    setUser(parsedUser);

    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navigate]);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit new case
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/cases", {
        ...formData,
        filedByName: user.name,
        registeredBy: user._id,
      });
      alert("Case registered successfully!");
      navigate("/clerkdashboard");
    } catch (err) {
      console.error(err);
      alert("Error registering case.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="admin-dashboard">
      {/* Header (same as ClerkDashboard) */}
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
          {/* Search bar */}
          <form className="d-flex me-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search cases..."
              disabled
              style={{ maxWidth: "400px" }}
            />
          </form>

          {/* Notifications */}
          <div className="position-relative me-3">
            <FaBell size={24} />
          </div>

          {/* User Dropdown */}
          <div className="position-relative" ref={userDropdownRef}>
            <button
              className="btn btn-light d-flex align-items-center"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <FaUserCircle size={28} className="me-2" />
              <span>{user?.name}</span>
              <FaChevronDown className="ms-1" />
            </button>

            {dropdownOpen && (
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
          <div className="case-form-container">
            <h2>Register New Case</h2>
            <form className="case-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Case Number</label>
                <input
                  type="text"
                  name="caseNumber"
                  value={formData.caseNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Parties Involved</label>
                <input
                  type="text"
                  name="partiesInvolved"
                  value={formData.partiesInvolved}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Registration Notes</label>
                <textarea
                  name="registrationNotes"
                  value={formData.registrationNotes}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn-save">
                <FaSave /> Register Case
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
