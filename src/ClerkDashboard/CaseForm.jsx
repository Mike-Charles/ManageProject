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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    formDataCloud.append("upload_preset", "your_upload_preset_here");

    try {
      setUploading(true);
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/your_cloud_name_here/upload",
        formDataCloud
      );
      setFormData((prev) => ({ ...prev, document: res.data.secure_url }));
      setUploading(false);
      setMessage("File uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      setUploading(false);
      setMessage("File upload failed. Try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const payload = {
        title: formData.title,
        description: formData.description,
        filingDate: formData.filingDate,
        status: formData.status,
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
        registeredBy: user?._id, // <-- crucial addition
        document: formData.document,
      };

      const response = await axios.post(
        "http://localhost:5000/api/cases/create",
        payload,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      console.log("✅ Case created:", response.data);
      setMessage("Case filed successfully!");
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
      console.error("Error creating case:", err);
      setMessage("Error filing case. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header navbar navbar-expand-lg navbar-light shadow-sm px-3">
        <div className="navbar-brand fw-bold">CourtSys</div>
        <div className="collapse navbar-collapse d-none d-lg-flex justify-content-end">
          <div className="position-relative me-3"><FaBell size={24} /></div>
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
              <div className="dropdown-menu show shadow p-2" style={{ right: 0, position: "absolute" }}>
                <div className="px-3 py-2 border-bottom">
                  <div className="fw-bold">{user?.name}</div>
                  <small className="text-muted">{user?.email}</small>
                </div>
                <button className="dropdown-item d-flex align-items-center" onClick={() => navigate("/change-password")}>
                  <FaLock className="me-1" /> Change Password
                </button>
                <button className="dropdown-item d-flex align-items-center" onClick={handleLogout}>
                  <FaSignOutAlt className="me-1" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="admin-content">
        <aside className="admin-sidebar d-none d-lg-block" style={{ width: "300px" }}>
          <ul className="admin-nav">
            <li className="list-group-item" onClick={() => navigate("/clerkdashboard")}><FaHome /> Home</li>
            <li className="active" onClick={() => navigate("/filenewcase")}><FaPlus /> File New Case</li>
            <li onClick={() => navigate("/submittedcases")}><FaClipboardList /> Submitted Cases</li>
            <li onClick={() => navigate("/notifications")}><FaBell /> Notifications</li>
          </ul>
        </aside>

        <main className="admin-main">
          <div className="file-case-container compact-horizontal">
            <form onSubmit={handleSubmit} className="file-case-form-compact">
              <div className="form-section">
                <h4>Case Info</h4>
                <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange}></textarea>
                <input type="date" name="filingDate" value={formData.filingDate} readOnly />
                <input type="text" name="status" value={formData.status} readOnly />
              </div>

              <div className="form-section">
                <h4>Plaintiff</h4>
                <input type="text" name="plaintiffName" placeholder="Name" value={formData.plaintiffName} onChange={handleChange} required />
                <input type="text" name="plaintiffAddress" placeholder="Address" value={formData.plaintiffAddress} onChange={handleChange} />
                <input type="tel" name="plaintiffPhone" placeholder="Phone" value={formData.plaintiffPhone} onChange={handleChange} />
                <input type="email" name="plaintiffEmail" placeholder="Email" value={formData.plaintiffEmail} onChange={handleChange} />
              </div>

              <div className="form-section">
                <h4>Defendant</h4>
                <input type="text" name="defendantName" placeholder="Name" value={formData.defendantName} onChange={handleChange} required />
                <input type="text" name="defendantAddress" placeholder="Address" value={formData.defendantAddress} onChange={handleChange} />
                <input type="tel" name="defendantPhone" placeholder="Phone" value={formData.defendantPhone} onChange={handleChange} />
                <input type="email" name="defendantEmail" placeholder="Email" value={formData.defendantEmail} onChange={handleChange} />
              </div>

              <div className="form-section">
                <h4>Filed By</h4>
                <input type="text" value={user?.name || ""} readOnly />
                <h4>Document (PDF/Image)</h4>
                <input type="file" onChange={handleFileUpload} />
                {uploading && <p>Uploading...</p>}
                {formData.document && <p>Uploaded: <a href={formData.document} target="_blank" rel="noreferrer">View Document</a></p>}
              </div>

              <div className="form-actions">
                <button type="submit" disabled={uploading}>Submit</button>
                <button type="reset" onClick={() => window.location.reload()}>Reset</button>
              </div>

              {message && <p className="form-message">{message}</p>}
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
