import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaUserCircle } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

function ManageSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();
  const [user, setUser] = useState({ fullname: 'Admin Name', email: 'admin@example.com' }); // dummy user

  const [newSchedule, setNewSchedule] = useState({
    scheduleTitle: '',
    caseTitle: '',
    assignedJudge: '',
    date: '',
    time: '',
    location: '',
    status: 'Scheduled',
    createdBy: '',
  });

  const [editMode, setEditMode] = useState(false);
  const [currentScheduleId, setCurrentScheduleId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSchedules();
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/schedules');
      setSchedules(res.data);
    } catch (err) {
      console.error('Error fetching schedules:', err);
    }
  };

  const handleInputChange = (e) => {
    setNewSchedule({ ...newSchedule, [e.target.name]: e.target.value });
  };

  const handleSaveSchedule = async () => {
    try {
      if (editMode) {
        await axios.put(`http://localhost:3001/api/schedules/${currentScheduleId}`, newSchedule);
        setMessage("✅ Schedule updated successfully");
      } else {
        const res = await axios.post('http://localhost:3001/api/schedules', newSchedule);
        setSchedules([...schedules, res.data]);
        setMessage("✅ Schedule added successfully");
      }
      resetModal();
      fetchSchedules();
    } catch (err) {
      console.error('Error saving schedule:', err);
      setMessage("❌ Failed to save schedule");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      try {
        await axios.delete(`http://localhost:3001/api/schedules/${id}`);
        setSchedules(schedules.filter(s => s._id !== id));
        setMessage("🗑️ Schedule deleted");
      } catch (err) {
        console.error('Error deleting schedule:', err);
        setMessage("❌ Failed to delete schedule");
      }
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleEditSchedule = (schedule) => {
    setEditMode(true);
    setCurrentScheduleId(schedule._id);
    setNewSchedule(schedule);
    setShowModal(true);
  };

  const resetModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentScheduleId(null);
    setNewSchedule({
      scheduleTitle: '',
      caseTitle: '',
      assignedJudge: '',
      date: '',
      time: '',
      location: '',
      status: 'Scheduled',
      createdBy: '',
    });
  };

  const filteredSchedules = schedules.filter(s =>
    s.scheduleTitle.toLowerCase().includes(search.toLowerCase()) ||
    s.caseTitle.toLowerCase().includes(search.toLowerCase()) ||
    s.assignedJudge.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="bg-dark text-white p-4" style={{ width: '250px' }}>
        <h4 className="mb-4">Admin Menu</h4>
        <ul className="nav flex-column">
          <li className="nav-item mb-2 "><a className="nav-link text-white " href="./AdminDashboard">Home</a></li>
          <li className="nav-item mb-2 "><a className="nav-link text-white " href="./ManageUsers">Manage Users</a></li>
          <li className="nav-item mb-2 "><a className="nav-link text-white " href="./ManageCases">Manage Cases</a></li>
          <li className="nav-item mb-2 "><a className="nav-link text-white active" href="./ManageSchedules">Manage Schedule</a></li>
          <li className="nav-item mb-2 "><a className="nav-link text-white " href="#">Reports</a></li>
        </ul>
      </div>

      {/* Main Content */}

      {/* Header */}
      <div className="flex-grow-1 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center p-3 bg-light border-bottom shadow-sm">
          <h2>Manage Cases</h2>
          <div className="position-relative " ref={dropdownRef}>
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

        {message && <div className="alert alert-info text-center">{message}</div>}

        {/* Search */}
        <div className='m-3'>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search schedules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="table-responsive shadow-sm m-3">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>Schedule Title</th>
                <th>Case Title</th>
                <th>Assigned Judge</th>
                <th>Date</th>
                <th>Time</th>
                <th>Location</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((schedule) => (
                <tr
                  key={schedule._id}
                  onMouseEnter={() => setHoveredRow(schedule._id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td>{schedule.scheduleTitle}</td>
                  <td>{schedule.caseTitle}</td>
                  <td>{schedule.assignedJudge}</td>
                  <td>{schedule.date}</td>
                  <td>{schedule.time}</td>
                  <td>{schedule.location}</td>
                  <td>{schedule.status}</td>
                  <td>{schedule.createdBy}</td>
                  <td>
                    {hoveredRow === schedule._id && (
                      <>
                        <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditSchedule(schedule)}>
                          <FaEdit />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteSchedule(schedule._id)}>
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredSchedules.length === 0 && (
                <tr><td colSpan="9" className="text-center">No schedules found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Add Button */}
        <div className="d-flex justify-content-end">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FaPlus className="me-2" /> Add New Schedule
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editMode ? "Edit Schedule" : "Add Schedule"}</h5>
                  <button type="button" className="btn-close" onClick={resetModal}></button>
                </div>
                <div className="modal-body">
                  <input type="text" className="form-control mb-2" placeholder="Schedule Title" name="scheduleTitle" value={newSchedule.scheduleTitle} onChange={handleInputChange} />
                  <input type="text" className="form-control mb-2" placeholder="Case Title" name="caseTitle" value={newSchedule.caseTitle} onChange={handleInputChange} />
                  <input type="text" className="form-control mb-2" placeholder="Assigned Judge" name="assignedJudge" value={newSchedule.assignedJudge} onChange={handleInputChange} />
                  <input type="date" className="form-control mb-2" name="date" value={newSchedule.date} onChange={handleInputChange} />
                  <input type="time" className="form-control mb-2" name="time" value={newSchedule.time} onChange={handleInputChange} />
                  <input type="text" className="form-control mb-2" placeholder="Location" name="location" value={newSchedule.location} onChange={handleInputChange} />
                  <select className="form-select mb-2" name="status" value={newSchedule.status} onChange={handleInputChange}>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Postponed">Postponed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <input type="text" className="form-control mb-2" placeholder="Created By" name="createdBy" value={newSchedule.createdBy} onChange={handleInputChange} />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={resetModal}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSaveSchedule}>
                    {editMode ? "Update Schedule" : "Add Schedule"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ManageSchedules;
