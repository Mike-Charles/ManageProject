import React, { useState, useRef, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";

function ManageUsers() {
    const [users, setUsers] = useState([
        { id: 1, name: "Alice", role: "Admin" },
        { id: 2, name: "Bob", role: "Judge" },
        { id: 3, name: "Charlie", role: "Clerk" }
    ]);

    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", role: "" });
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });
    };

    const handleAddUser = () => {
        const newId = users.length + 1;
        setUsers([...users, { id: newId, ...newUser }]);
        setNewUser({ name: "", role: "" });
        setShowModal(false);
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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
                        <a className="nav-link text-white" href="./ManageUsers">Manage Users</a>
                    </li>
                    <li className="nav-item mb-2">
                        <a className="nav-link text-white" href="">Manage Cases</a>
                    </li>
                    <li className="nav-item mb-2">
                        <a className="nav-link text-white" href="">Manage Schedule</a>
                    </li>
                    <li className="nav-item mb-2">
                        <a className="nav-link text-white" href="">Reports</a>
                    </li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-grow-1" style={{ backgroundColor: '#f5f5f5' }}>
                {/* Top Header */}
                <div className="d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: '#ccc' }}>
                    <h2 className="mb-0">Manage Users</h2>
                    <div className="align-items-center d-flex position-relative" style={{ cursor: 'pointer' }} ref={dropdownRef}>
                        <FaUserCircle size={48} className="me-2" onClick={toggleDropdown} />
                        {showDropdown && (
                            <div className="position-absolute end-0 mt-5 p-2 bg-white border rounded shadow" style={{zIndex: 10, marginBottom:'-100px', cursor: 'pointer' }}>
                                <p className="mb-1 d-flex" style={{ backgroundColor: '#ccc', margin: '0' }}>Admin Name</p>
                                <button className="dropdown-item btn btn-link text-start w-100 p-0 mb-1" onClick={() => alert('Change Password clicked')}>Change Password</button>
                                <button className="dropdown-item btn btn-link text-start w-100 p-0" onClick={() => alert('Logout clicked')}>Logout</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table Section */}
                <div className="container mt-4">
                    <h5>List of all users</h5>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.role}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="d-flex justify-content-end p-3">
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>Register New User</button>
                </div>
                

                {/* Modal */}
                {showModal && (
                    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Register New User</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <form>
                                        <div className="mb-3">
                                            <label className="form-label">Name</label>
                                            <input type="text" name="name" className="form-control" value={newUser.name} onChange={handleInputChange} />
                                        </div>
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
                                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button className="btn btn-primary" onClick={handleAddUser}>Add User</button>
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
