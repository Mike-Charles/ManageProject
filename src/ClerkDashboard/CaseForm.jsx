// File: FileNewCase.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaBell,
  FaChevronDown,
  FaLock,
  FaHome,
  FaPlus,
  FaClipboardList,
} from "react-icons/fa";
import "./FileNewCase.css";

export default function FileNewCase() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const userDropdownRef = useRef();

  // ✅ Added missing state variables for header functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    filingDate: new Date().toISOString().split("T")[0],
    status: "Registered",
    plaintiffName: "",
    plaintiffAddress: "",
    plaintiffPhone: "",
    plaintiffEmail: "",
    defendantName: "",
    defendantAddress: "",
    defendantPhone: "",
    defendantEmail: "",
    document: "",
  });

  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  // ✅ Load user + mock notifications + outside click detection
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

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n._id === id ? { ...n, status: "Read" } : n
      )
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    alert(`Searching for: ${searchTerm}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, and PDF files are allowed.");
      return;
    }

    const formDataCloud = new FormData();
    formDataCloud.append("file", file);
    formDataCloud.append("upload_preset", "your_upload_preset_here"); // replace with your Cloudinary preset

    try {
      setUploading(true);
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/https://drive.google.com/drive/folders/1Cd1LQjD14WAgkM-yeZ8fMq4fHv-pcFJz?usp=drive_link/upload",
        formDataCloud
      );
      setFormData((prev) => ({ ...prev, document: res.data.secure_url }));
      setMessage("File uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("File upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) return;

    try {
      const token = localStorage.getItem("token");

      const payload = {
        title: formData.title,
        description: formData.description,
        filingDate: formData.filingDate,
        plaintiff: {
          name: formData.plaintiffName,
          address: formData.plaintiffAddress,
          phone: formData.plaintiffPhone,
          email: formData.plaintiffEmail,
        },
        defendant: {
          name: formData.defendantName,
          address: formData.defendantAddress,
          phone: formData.defendantPhone,
          email: formData.defendantEmail,
        },
        filedByName: user?.name || "Unknown Clerk",
        registeredBy: user?._id,
        document: formData.document,
      };

      const response = await axios.post(
        "https://courtcase-backend.onrender.com/api/cases/create",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(
        `Case Registered successfully! Case Number: ${response.data.caseNumber}`
      );

      // reset form
      setFormData({
        title: "",
        description: "",
        filingDate: new Date().toISOString().split("T")[0],
        status: "Registered",
        plaintiffName: "",
        plaintiffAddress: "",
        plaintiffPhone: "",
        plaintiffEmail: "",
        defendantName: "",
        defendantAddress: "",
        defendantPhone: "",
        defendantEmail: "",
        document: "",
      });
    } catch (err) {
      console.error(err);
      setMessage("Error registering case. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

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
            <div style={{ marginLeft: 250 }}>
              <form
                className="d-flex mx-3"
                style={{ flex: 8, maxWidth: 400 }}
                onSubmit={handleSearch}
              >
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
                onClick={() => navigate("/filenewcase")}
              >
                <FaPlus /> File New Case
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
            <li
              className="list-group-item"
              onClick={() => navigate("/clerkdashboard")}
            >
              <FaHome /> Home
            </li>
            <li className="active" onClick={() => navigate("/caseregistration")}>
              <FaPlus /> File New Case
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
          <div className="file-case-container compact-horizontal">
            <form onSubmit={handleSubmit} className="file-case-form-compact">
              {/* Case Info */}
              <div className="form-section">
                <h4>Case Info</h4>
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
                <input
                  type="date"
                  name="filingDate"
                  value={formData.filingDate}
                  readOnly
                />
                <input
                  type="text"
                  name="status"
                  value={formData.status}
                  readOnly
                />
              </div>

              {/* Plaintiff */}
              <div className="form-section">
                <h4>Plaintiff</h4>
                <input
                  type="text"
                  name="plaintiffName"
                  placeholder="Name"
                  value={formData.plaintiffName}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="plaintiffAddress"
                  placeholder="Address"
                  value={formData.plaintiffAddress}
                  onChange={handleChange}
                />
                <input
                  type="tel"
                  name="plaintiffPhone"
                  placeholder="Phone"
                  value={formData.plaintiffPhone}
                  onChange={handleChange}
                />
                <input
                  type="email"
                  name="plaintiffEmail"
                  placeholder="Email"
                  value={formData.plaintiffEmail}
                  onChange={handleChange}
                />
              </div>

              {/* Defendant */}
              <div className="form-section">
                <h4>Defendant</h4>
                <input
                  type="text"
                  name="defendantName"
                  placeholder="Name"
                  value={formData.defendantName}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="defendantAddress"
                  placeholder="Address"
                  value={formData.defendantAddress}
                  onChange={handleChange}
                />
                <input
                  type="tel"
                  name="defendantPhone"
                  placeholder="Phone"
                  value={formData.defendantPhone}
                  onChange={handleChange}
                />
                <input
                  type="email"
                  name="defendantEmail"
                  placeholder="Email"
                  value={formData.defendantEmail}
                  onChange={handleChange}
                />
              </div>

              {/* Filed By & Document */}
              <div className="form-section">
                <h4>Filed By</h4>
                <input type="text" value={user?.name || ""} readOnly />
                <h4>Document (PDF/Image)</h4>
                <input type="file" onChange={handleFileUpload} />
                {uploading && <p>Uploading...</p>}
                {formData.document && (
                  <p>
                    Uploaded:{" "}
                    <a
                      href={formData.document}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Document
                    </a>
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="form-actions">
                <button type="submit" disabled={uploading}>
                  Submit
                </button>
                <button
                  type="reset"
                  onClick={() => window.location.reload()}
                >
                  Reset
                </button>
              </div>

              {/* Messages */}
              {message && <p className="form-message">{message}</p>}
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
