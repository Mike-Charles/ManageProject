import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Updated CSS

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "registrar") navigate("/registrardashboard");
      else if (user.role === "admin") navigate("/admindashboard");
      else if (user.role === "clerk") navigate("/clerkdashboard");
      else if (user.role === "judge") navigate("/judgedashboard");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="login-welcome">
          <h1>Welcome to Court System</h1>
          <p>Nice to see you again</p>
        </div>
      </div>
      <div className="login-right">
        <form onSubmit={handleSubmit} className="login-form shadow">
          <h2 className="text-center mb-4">Login</h2>
          <p className="text-center text-muted">Please enter your details</p>
          {error && <div className="alert alert-danger mt-3">{error}</div>}

          <div className="form-group mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group mb-4">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="remember" />
              <label className="form-check-label" htmlFor="remember">
                Stay signed in
              </label>
            </div>
            <a href="/forgot-password" className="text-primary">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="btn btn-success w-100">
            Login
          </button>

          {/* <div className="text-center mt-3">
            <a href="/register" className="btn btn-outline-success w-100">
              Sign Up
            </a>
          </div> */}
        </form>
      </div>
    </div>
  );
}
