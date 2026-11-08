
import React, { useEffect, useState } from 'react';
import './ManageComments.css';

function ManageComments({ onCommentsChange }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const API = 'http://localhost:5000/api/comments';

  const loadComments = async () => {
    try {
      setLoading(true);
      setError('');

      const token = sessionStorage.getItem('creatorToken');

      const response = await fetch(`${API}/manage/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load comments.');
      }

      const data = await response.json();
      setComments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setError('');
      setMessage('');

      const token = sessionStorage.getItem('creatorToken');

      const response = await fetch(`${API}/manage/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update comment.');
      }

      setMessage(`Comment marked as ${status}.`);
      await loadComments();

      if (onCommentsChange) {
        onCommentsChange();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="manage-comments">
      <div className="comments-heading">
        <h1>Manage Comments</h1>
        <p>Review and moderate comments from your viewers.</p>
      </div>

      {message && <p className="comments-success">{message}</p>}
      {error && <p className="comments-error">{error}</p>}

      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <div className="comments-empty">
          <h3>No comments yet</h3>
          <p>Viewer comments will appear here when submitted.</p>
        </div>
      ) : (
        <div className="comments-table-wrap">
          <table className="comments-table">
            <thead>
              <tr>
                <th>Viewer</th>
                <th>Content</th>
                <th>Comment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {comments.map((comment) => (
                <tr key={comment._id}>
                  <td>{comment.viewerName}</td>
                  <td>{comment.contentId?.title || 'Deleted content'}</td>
                  <td>{comment.message}</td>

                  <td>
                    <span className={`comment-status ${comment.status.toLowerCase()}`}>
                      {comment.status}
                    </span>
                  </td>

                  <td>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </td>

                  <td>
                    <div className="comment-actions">
                      {comment.status !== 'Approved' && (
                        <button
                          className="approve-btn"
                          onClick={() => updateStatus(comment._id, 'Approved')}
                        >
                          Approve
                        </button>
                      )}

                      {comment.status !== 'Hidden' && (
                        <button
                          className="hide-btn"
                          onClick={() => updateStatus(comment._id, 'Hidden')}
                        >
                          Hide
                        </button>
                      )}

                      {comment.status !== 'Pending' && (
                        <button
                          className="pending-btn"
                          onClick={() => updateStatus(comment._id, 'Pending')}
                        >
                          Pending
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageComments;
