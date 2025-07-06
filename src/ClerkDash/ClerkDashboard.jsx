import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ClerkDashboard.css';

function ClerkDashboard() {
  const [summary, setSummary] = useState({
    total: 0, pending: 0, approved: 0, closed: 0,
  });
  const [recentCases, setRecentCases] = useState([]);
  const [filedCases, setFiledCases] = useState([]);
  const [loading, setLoading] = useState(false);

  const clerkId = JSON.parse(localStorage.getItem('user'))?._id;

  useEffect(() => {
    fetchSummary();
    fetchRecentCases();
    fetchFiledCases();
  }, []);

  const fetchSummary = () => {
    axios.get(`https://courtcase-backend.onrender.com/api/cases/summary?clerkId=${clerkId}`)
      .then(res => setSummary(res.data))
      .catch(console.error);
  };

  const fetchRecentCases = () => {
    axios.get(`https://courtcase-backend.onrender.com/api/cases?clerkId=${clerkId}`)
      .then(res => setRecentCases(res.data.slice(0, 10)))
      .catch(console.error);
  };

  const fetchFiledCases = () => {
    setLoading(true);
    axios.get("https://courtcase-backend.onrender.com/api/cases?status=Filed")
      .then(res => setFiledCases(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleRegisterCase = async (caseId) => {
    try {
      await axios.put(
        `https://courtcase-backend.onrender.com/api/cases/${caseId}/register`,
        { clerkId }
      );
      fetchFiledCases();
      fetchSummary();
      fetchRecentCases();
      alert("Case registered successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to register case.");
    }
  };

  const handleSubmitToRegistrar = async (caseId) => {
    try {
      await axios.put(
        `https://courtcase-backend.onrender.com/api/cases/${caseId}/submit-to-registrar`
      );
      fetchFiledCases();
      fetchSummary();
      fetchRecentCases();
      alert("Case submitted to registrar!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit case.");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="overlay">
        <div className="container py-5 text-white">
          <h1 className="text-center mb-4 fw-bold">Clerk Dashboard</h1>

          <div className="row g-4 mb-4">
            <SummaryCard title="Total Filed" value={summary.total} color="primary" />
            <SummaryCard title="Pending Approval" value={summary.pending} color="warning" />
            <SummaryCard title="Approved/Assigned" value={summary.approved} color="success" />
            <SummaryCard title="Closed Cases" value={summary.closed} color="secondary" />
          </div>

          <div className="d-flex justify-content-center mb-4 flex-wrap gap-3">
            <a href="/FileCase" className="btn btn-outline-light btn-lg shadow">+ File New Case</a>
            <a href="/MyCases" className="btn btn-light btn-lg shadow text-dark">View My Filed Cases</a>
          </div>

          {/* 📌 Recent Cases Table */}
          <div className="table-responsive bg-white rounded shadow p-3 text-dark mb-5">
            <h4 className="mb-3">Recent Filed Cases</h4>
            <table className="table table-bordered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Date Filed</th>
                  <th>Assigned Judge</th>
                </tr>
              </thead>
              <tbody>
                {recentCases.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">No cases filed yet.</td>
                  </tr>
                ) : (
                  recentCases.map((c, i) => (
                    <tr key={c._id}>
                      <td>{i + 1}</td>
                      <td>{c.caseTitle}</td>
                      <td>
                        <span className={`badge ${
                          c.status === 'Pending' ? 'bg-warning' :
                          c.status === 'Approved' || c.status === 'Assigned' ? 'bg-success' :
                          c.status === 'Closed' ? 'bg-secondary' : 'bg-light'
                        }`}>{c.status}</span>
                      </td>
                      <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>{c.judge || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 📌 Filed Cases Actions Table */}
          <div className="table-responsive bg-white rounded shadow p-3 text-dark">
            <h4 className="mb-3">Newly Filed Cases - Register & Submit</h4>
            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-dark" role="status" />
              </div>
            ) : (
              <table className="table table-bordered align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Case Title</th>
                    <th>Filed By</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filedCases.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">No newly filed cases.</td>
                    </tr>
                  ) : (
                    filedCases.map((c, i) => (
                      <tr key={c._id}>
                        <td>{i + 1}</td>
                        <td>{c.caseTitle}</td>
                        <td>{c.filedBy?.fullname || 'N/A'}</td>
                        <td>
                          <span className="badge bg-warning text-dark">{c.status}</span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-success me-2"
                            onClick={() => handleRegisterCase(c._id)}
                          >
                            Register
                          </button>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleSubmitToRegistrar(c._id)}
                          >
                            Submit to Registrar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, color }) {
  return (
    <div className="col-6 col-md-3">
      <div className={`card text-white bg-${color} shadow h-100`}>
        <div className="card-body d-flex flex-column justify-content-center align-items-center text-center">
          <h5 className="card-title">{title}</h5>
          <h2>{value}</h2>
        </div>
      </div>
    </div>
  );
}

export default ClerkDashboard;
