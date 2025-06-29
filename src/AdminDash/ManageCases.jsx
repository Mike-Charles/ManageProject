import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaUserCircle, FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function ManageCases() {
  const [cases, setCases] = useState([]);
  const [newCase, setNewCase] = useState({
    caseTitle: '',
    judge: '',
    partiesInvolved: '',
    status: 'Open',
    createdBy: ''
  });
  const [user, setUser] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  const fetchCases = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/cases');
      setCases(res.data);
    } catch (err) {
      console.error('Error fetching cases:', err);
    }
  };

  useEffect(() => {
    fetchCases();
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
      setNewCase(prev => ({ ...prev, createdBy: userData.fullname }));
    }

    const modalElement = document.getElementById('caseModal');
    if (modalElement) {
      modalElement.addEventListener('hidden.bs.modal', () => {
        setEditId(null);
        setNewCase({
          caseTitle: '',
          judge: '',
          partiesInvolved: '',
          status: 'Open',
          createdBy: userData?.fullname || ''
        });
      });
    }
  }, []);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  useEffect(() => {

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCase({ ...newCase, [name]: value });
  };

  const handleAddOrUpdate = async () => {
    try {
      if (editId) {
        await axios.put(`http://localhost:3001/api/cases/${editId}`, newCase);
        setMessage('✅ Case updated successfully');
      } else {
        await axios.post('http://localhost:3001/api/cases', newCase);
        setMessage('✅ Case added successfully');
      }

      fetchCases();
      document.getElementById('closeModalBtn')?.click();
    } catch (err) {
      console.error('Failed to add/update case:', err);
      setMessage('❌ Error: Could not add or update case');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleEdit = (cs) => {
    setNewCase({
      caseTitle: cs.caseTitle,
      judge: cs.judge,
      partiesInvolved: cs.partiesInvolved,
      status: cs.status,
      createdBy: cs.createdBy
    });
    setEditId(cs._id);

    const modalElement = document.getElementById('caseModal');
    const modal = new window.bootstrap.Modal(modalElement);
    modal.show();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/cases/${id}`);
      setMessage('🗑️ Case deleted');
      fetchCases();
    } catch (err) {
      console.error('Failed to delete case:', err);
      setMessage('❌ Error: Could not delete case');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const filteredCases = cases.filter(cs =>
    cs.caseTitle.toLowerCase().includes(search.toLowerCase()) ||
    cs.judge.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Sidebar */}
      <div className="bg-dark text-white p-4" style={{ width: '250px' }}>
        <h4 className="mb-4">Admin Menu</h4>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
              <a className="nav-link text-white" href="./AdminDashboard">Home</a>
          </li>
          <li className="nav-item mb-2">
              <a className="nav-link text-white" href="./ManageUsers">Manage Users</a>
          </li>
          <li className="nav-item mb-2">
              <a className="nav-link text-white active" href="./ManageCases">Manage Cases</a>
          </li>
          <li className="nav-item mb-2">
              <a className="nav-link text-white" href="./ManageSchedules">Manage Schedule</a>
          </li>
          <li className="nav-item mb-2">
              <a className="nav-link text-white" href="">Reports</a>
          </li>
        </ul>
      </div>

      {/* Main */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-3 bg-light border-bottom">
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

        {/* Notifications */}
        {message && <div className="alert alert-info text-center m-3">{message}</div>}

        {/* Search & Table */}
        <div className="m-3">
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search by title or judge..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Title</th>
                <th>Judge</th>
                <th>Parties</th>
                <th>Status</th>
                <th>Date Filed</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map(cs => (
                <tr key={cs._id}>
                  <td>{cs.caseTitle}</td>
                  <td>{cs.judge}</td>
                  <td>{cs.partiesInvolved}</td>
                  <td>{cs.status}</td>
                  <td>{cs.dateFiled ? new Date(cs.dateFiled).toLocaleDateString('en-GB') : 'N/A'}</td>
                  <td>{cs.createdBy}</td>
                  <td>
                    <FaEdit onClick={() => handleEdit(cs)} className="text-primary me-2" data-bs-toggle="modal" data-bs-target="#caseModal" style={{ cursor: 'pointer' }} />
                    <FaTrash onClick={() => handleDelete(cs._id)} className="text-danger" style={{ cursor: 'pointer' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add Case Button */}
          <div className="d-flex justify-content-end">
            <button className="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#caseModal">
              <FaPlus className="me-1" /> New Case
            </button>
          </div>
        </div>
      </div>
      {/* Modal Form */}
      <div className="modal fade" id="caseModal" tabIndex="-1" aria-labelledby="caseModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="caseModalLabel">{editId ? 'Edit Case' : 'Add New Case'}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id="closeModalBtn"></button>
            </div>
            <div className="modal-body">
              <input name="caseTitle" className="form-control mb-2" placeholder="Case Title" value={newCase.caseTitle} onChange={handleChange} />
              <input name="judge" className="form-control mb-2" placeholder="Assigned Judge" value={newCase.judge} onChange={handleChange} />
              <input name="partiesInvolved" className="form-control mb-2" placeholder="Parties Involved" value={newCase.partiesInvolved} onChange={handleChange} />
              <select name="status" className="form-control mb-2" value={newCase.status} onChange={handleChange}>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-success" onClick={handleAddOrUpdate}>
                {editId ? 'Update Case' : 'Add Case'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageCases;
