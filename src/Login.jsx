import React, { useState } from "react";

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        // Show error under Login heading
        setError(data.error || 'Wrong username or password');
        return;
      }else{

      // Redirect based on role
        localStorage.setItem('user', JSON.stringify(data.user)); // 👈 Save to localStorage
        
        // Redirect based on role
        if (data.user.role === 'Admin') {
          window.location.href = '/AdminDashboard';
        } else if (data.user.role === 'Judge') {
          window.location.href = '/JudgeDashboard';
        } else if (data.user.role === 'Clerk') {
          window.location.href = '/ClerkDashboard';
        }

      }

    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="mb-2 text-center">Login</h2>

        {/* 🔴 Error Message Below "Login" */}
        {error && (
          <div className="text-danger text-center mb-3" style={{ fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>

        <div className="text-center mt-3">
          <label className="form-label">Or</label>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <a href="">Forgot Password?</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
