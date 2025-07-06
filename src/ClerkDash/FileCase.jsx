import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
function FileCase() {
  const [formData, setFormData] = useState({
    caseTitle: '',
    caseDescription: '',
    partiesInvolved: '',
    documents: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const clerk = JSON.parse(localStorage.getItem('user'));

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const data = new FormData();
      data.append('caseTitle', formData.caseTitle);
      data.append('caseDescription', formData.caseDescription); // corrected name
      data.append('partiesInvolved', formData.partiesInvolved);
      if (formData.documents) {
        data.append('documents', formData.documents);
      }
      data.append('filedBy', clerk?._id); // aligns with your schema
      data.append('clerk', clerk?._id);   // sets clerk explicitly
      data.append('status', 'Filed');     // initial status

      const res = await axios.post(
        "https://courtcase-backend.onrender.com/api/cases",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setMessage('Case filed successfully!');
      setFormData({ caseTitle: '', caseDescription: '', partiesInvolved: '', documents: null });
    } catch (err) {
      console.error(err);
      setMessage('Error filing case. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="card shadow mx-auto" style={{ maxWidth: '700px' }}>
        <div className="card-header bg-dark text-white">
          <h3 className="mb-0">File New Case</h3>
        </div>
        <div className="card-body">
          {message && (
            <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`} role="alert">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="caseTitle" className="form-label">Case Title</label>
              <input
                type="text"
                className="form-control"
                id="caseTitle"
                name="caseTitle"
                value={formData.caseTitle}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="caseDescription" className="form-label">Case Description</label>
              <textarea
                className="form-control"
                id="caseDescription"
                name="caseDescription"
                rows="4"
                value={formData.caseDescription}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="mb-3">
              <label htmlFor="partiesInvolved" className="form-label">Parties Involved</label>
              <input
                type="text"
                className="form-control"
                id="partiesInvolved"
                name="partiesInvolved"
                value={formData.partiesInvolved}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="documents" className="form-label">Attach Documents (optional)</label>
              <input
                type="file"
                className="form-control"
                id="documents"
                name="documents"
                accept=".pdf,.doc,.docx,.jpg,.png"
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Filing...' : 'File Case'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FileCase;
