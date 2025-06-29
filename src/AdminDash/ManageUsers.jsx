import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { FaUserCircle, FaTrash, FaEdit, FaPlus } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [newUser, setNewUser] = useState({ fullname: "", role: "", email: "", password: "" });
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const [user, setUser] = useState(null);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState("");

    const toggleDropdown = () => setShowDropdown(!showDropdown);

    useEffect(() => {
        fetchUsers();

        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        }

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchUsers = () => {
        axios.get("http://localhost:3001/api/users")
            .then(res => setUsers(res.data))
            .catch(err => console.error("Error fetching users:", err));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });
    };

    const handleAddUser = () => {
        if (editMode) {
            axios.put(`http://localhost:3001/api/users/${currentUserId}`, newUser)
                .then(() => {
                    fetchUsers();
                    resetModal();
                    setMessage("✅ User updated successfully");
                })
                .catch(err => {
                    console.error("Error updating user:", err);
                    setMessage("❌ Failed to update user");
                });
        } else {
            axios.post("http://localhost:3001/api/users", { ...newUser, time_registered: Date.now() })
                .then(res => {
                    setUsers([...users, res.data]);
                    resetModal();
                    setMessage("✅ User added successfully");
                })
                .catch(err => {
                    console.error("Error adding user:", err);
                    setMessage("❌ Failed to add user");
                });
        }
        setTimeout(() => setMessage(""), 3000);
    };

    const handleDeleteUser = (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            axios.delete(`http://localhost:3001/api/users/${id}`)
                .then(() => {
                    setUsers(users.filter(user => user._id !== id));
                    setMessage("🗑️ User deleted");
                })
                .catch(err => {
                    console.error("Error deleting user:", err);
                    setMessage("❌ Failed to delete user");
                });
            setTimeout(() => setMessage(""), 3000);
        }
    };

    const handleEditUser = (user) => {
        setEditMode(true);
        setCurrentUserId(user._id);
        setNewUser({
            fullname: user.fullname,
            role: user.role,
            email: user.email,
            password: ""
        });
        setShowModal(true);
    };

    const resetModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentUserId(null);
        setNewUser({ fullname: "", role: "", email: "", password: "" });
    };

    const filteredUsers = users.filter(u =>
        u.fullname.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <div className="bg-dark text-white p-4" style={{ width: '250px' }}>
                <h4 className="mb-4">Admin Menu</h4>
                <ul className="nav flex-column">
                    <li className="nav-item mb-2">
                        <a className="nav-link text-white" href="./AdminDashboard">Home</a>
                    </li>
                    <li className="nav-item mb-2">
                        <a className="nav-link text-white active" href="./ManageUsers">Manage Users</a>
                    </li>
                    <li className="nav-item mb-2">
                        <a className="nav-link text-white" href="./ManageCases">Manage Cases</a>
                    </li>
                    <li className="nav-item mb-2">
                        <a className="nav-link text-white" href="./ManageSchedules">Manage Schedule</a>
                    </li>
                    <li className="nav-item mb-2">
                        <a className="nav-link text-white" href="">Reports</a>
                    </li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-grow-1" style={{ backgroundColor: '#f5f5f5' }}>
                <div className="d-flex justify-content-between align-items-center p-3 bg-light border-bottom shadow-sm">
                    <h2 className="mb-0">Manage Users</h2>
                    <div className="position-relative" ref={dropdownRef}>
                        <FaUserCircle
                        size={48}
                        className="text-dark text-dark card bg-dark text-white h-100 shadow-sm card-hover"
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

                {message && <div className="alert alert-info m-3 text-center">{message}</div>}

                <div className="container mt-4">
                    <h5>List of all users</h5>
                    <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="Search by name, email or role..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <div className="table-responsive shadow-sm">
                        <table className="table table-striped table-hover">
                            <thead className="table-dark">
                                <tr>
                                    <th>#</th>
                                    <th>Full Name</th>
                                    <th>Role</th>
                                    <th>Email</th>
                                    <th>Registered</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user, index) => (
                                    <tr key={user._id} onMouseEnter={() => setHoveredRow(user._id)} onMouseLeave={() => setHoveredRow(null)}>
                                        <td>{index + 1}</td>
                                        <td>{user.fullname}</td>
                                        <td>{user.role}</td>
                                        <td>{user.email}</td>
                                        <td>{new Date(user.time_registered).toLocaleString()}</td>
                                        <td>
                                            {hoveredRow === user._id && (
                                                <>
                                                    <FaEdit
                                                        className="me-2 text-primary"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => handleEditUser(user)}
                                                    />
                                                    <FaTrash
                                                        className="text-danger"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => handleDeleteUser(user._id)}
                                                    />
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="d-flex justify-content-end">
                        <button className="btn btn-primary m-3" onClick={() => setShowModal(true)}>
                            <FaPlus className="me-1" /> Register New User
                        </button>
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{editMode ? "Edit User" : "Register New User"}</h5>
                                    <button type="button" className="btn-close" onClick={resetModal}></button>
                                </div>
                                <div className="modal-body">
                                    <form>
                                        <div className="mb-3">
                                            <label className="form-label">Full Name</label>
                                            <input type="text" name="fullname" className="form-control" value={newUser.fullname} onChange={handleInputChange} />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Email</label>
                                            <input type="email" name="email" className="form-control" value={newUser.email} onChange={handleInputChange} />
                                        </div>
                                        {!editMode && (
                                            <div className="mb-3">
                                                <label className="form-label">Password</label>
                                                <input type="password" name="password" className="form-control" value={newUser.password} onChange={handleInputChange} />
                                            </div>
                                        )}
                                        <div className="mb-3">
                                            <label className="form-label">Role</label>
                                            <select name="role" className="form-control" value={newUser.role} onChange={handleInputChange}>
                                                <option value="">Select Role</option>
                                                <option value="Admin">Admin</option>
                                                <option value="Judge">Judge</option>
                                                <option value="Clerk">Clerk</option>
                                            </select>
                                        </div>
                                    </form>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={resetModal}>Cancel</button>
                                    <button className="btn btn-primary" onClick={handleAddUser}>
                                        {editMode ? "Update User" : "Add User"}
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

export default ManageUsers;
