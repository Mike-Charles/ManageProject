import { useState } from 'react';

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add logic to send data to the backend or validate inputs
    console.log('Form submitted:', formData);
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input 
            type="text" 
            name="username" 
            className="form-control" 
            value={formData.username} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email address</label>
          <input 
            type="email" 
            name="email" 
            className="form-control" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input 
            type="password" 
            name="password" 
            className="form-control" 
            value={formData.password} 
            onChange={handleChange} 
            required 
          />
        </div>
        <button type="submit" className="btn btn-primary">Sign Up</button>
      </form>
    </div>
  );
}

export default Signup;
