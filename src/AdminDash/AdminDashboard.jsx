import React, { useState, useRef, useEffect } from "react";
import {
  FaUsers,
  FaGavel,
  FaCalendarAlt,
  FaChartBar,
  FaUserCircle,
} from "react-icons/fa";
import axios from "axios";
import "./AdminDashboard.css"; // Make sure this CSS file is created and imported

function AdminDashboard() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [closedCases, setClosedCases] = useState([]);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);

    fetchClosedCases();

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchClosedCases = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/cases?status=Closed");
      setClosedCases(res.data);
    } catch (err) {
      console.error("Error fetching closed cases:", err);
    }
  };

  const dashboardLinks = [
    { title: "Manage Users", icon: <FaUsers size={80} />, path: "/ManageUsers" },
    { title: "Manage Cases", icon: <FaGavel size={80} />, path: "/ManageCases" },
    { title: "Manage Schedule", icon: <FaCalendarAlt size={80} />, path: "/ManageSchedules" },
    { title: "Reports", icon: <FaChartBar size={80} />, path: "/Reports" },
  ];

  return (
    <div className="container-fluid p-0" style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center p-3 bg-light border-bottom shadow-sm">
        <h2 className="mb-0">Admin Dashboard</h2>
        <div className="position-relative" ref={dropdownRef}>
          <FaUserCircle 
            size={48}
            className="text-dark card bg-dark text-white h-100 shadow-sm card-hover"
            style={{ cursor: "pointer" }}
            onClick={toggleDropdown}
          />
          {showDropdown && (
            <div className="position-absolute end-0 mt-2 p-3 bg-white border rounded shadow" style={{ zIndex: 1000, minWidth: "200px" }}>
              <p className="fw-bold mb-1">{user?.fullname || "Unknown"}</p>
              <p className="text-muted mb-3">{user?.email || "No email"}</p>
              <button className="btn btn-sm btn-outline-secondary mb-2 w-100" onClick={() => alert("Change Password clicked")}>
                Change Password
              </button>
              <a href="/" className="btn btn-sm btn-outline-danger w-100">Logout</a>
            </div>
          )}
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="row text-center px-4 py-4 g-4">
        {dashboardLinks.map((card, index) => (
          <div key={index} className="col-md-3">
            <a href={card.path} style={{ textDecoration: "none" }}>
              <div className="card bg-dark text-white h-100 shadow-sm card-hover">
                <div className="card-body d-flex flex-column justify-content-center align-items-center">
                  {card.icon}
                  <h5 className="card-title mt-3">{card.title}</h5>
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>

      {/* Closed Cases Table */}
      <div className="px-4 pb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Closed Cases</h5>
          <a href="/ManageCases" className="btn btn-primary btn-sm">+ Add Case</a>
        </div>

        <div className="table-responsive shadow-sm">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Case Title</th>
                <th>Assigned Judge</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {closedCases.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">No closed cases found.</td>
                </tr>
              ) : (
                closedCases.map((cs, i) => (
                  <tr key={cs._id}>
                    <td>{i + 1}</td>
                    <td>{cs.caseTitle}</td>
                    <td>{cs.judge}</td>
                    <td><span className="badge bg-success">{cs.status}</span></td>
                    <td>
                      <button className="btn btn-info btn-sm" onClick={() => alert(`View details of ${cs.caseTitle}`)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
