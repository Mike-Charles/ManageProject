import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ClerkDashboard() {
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    closed: 0,
  });
  const [recentCases, setRecentCases] = useState([]);

  useEffect(() => {
    const clerkId = JSON.parse(localStorage.getItem('user'))._id;

    // Fetch summary stats
    axios.get(`https://courtcase-backend.onrender.com/api/cases/summary?clerkId=${clerkId}`)
      .then(res => setSummary(res.data))
      .catch(err => console.error("Summary error:", err));

    // Fetch recent cases
    axios.get(`https://courtcase-backend.onrender.com/api/cases?clerkId=${clerkId}`)
      .then(res => setRecentCases(res.data.slice(0, 10)))  // show last 10
      .catch(err => console.error("Cases error:", err));
  }, []);

  return (
    <div className="container-fluid p-4">
      <h2 className="mb-4">Clerk Dashboard</h2>

      {/* Summary Cards */}
      <div className="row mb-4 g-3">
        <div className="col-md-3">
          <div className="card text-white bg-primary shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Total Filed</h5>
              <h3>{summary.total}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-warning shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Pending Approval</h5>
              <h3>{summary.pending}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-success shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Approved/Assigned</h5>
              <h3>{summary.approved}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-secondary shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Closed Cases</h5>
              <h3>{summary.closed}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-4">
        <a href="/FileCase" className="btn btn-primary me-2">+ File New Case</a>
        <a href="/MyCases" className="btn btn-outline-dark">View My Filed Cases</a>
      </div>

      {/* Recent Cases Table */}
      <h4>Recent Filed Cases</h4>
      <div className="table-responsive shadow-sm">
        <table className="table table-bordered align-middle">
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
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>{c.judge || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClerkDashboard;
