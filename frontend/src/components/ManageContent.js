
import React, { useEffect, useState } from 'react';
import './ManageContent.css';

const API = 'https://nova-space.onrender.com/api/contents';

const emptyForm = {
  title: '',
  description: '',
  category: '',
  contentType: 'Article',
  thumbnail: '',
  mediaUrl: '',
  articleContent: '',
  status: 'Draft',
  publicationDate: ''
};

function ManageContent({ onContentChange }) {
  const [contents, setContents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getToken = () => sessionStorage.getItem('creatorToken');

  const loadContents = async () => {
    try {
      const response = await fetch(`${API}/manage/all`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load content.');
      }

      const data = await response.json();
      setContents(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadContents();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError('');
    setMessage('');
  };

  const openEditForm = (content) => {
    setEditingId(content._id);

    setForm({
      title: content.title || '',
      description: content.description || '',
      category: content.category || '',
      contentType: content.contentType || 'Article',
      thumbnail: content.thumbnail || '',
      mediaUrl: content.mediaUrl || '',
      articleContent: content.articleContent || '',
      status: content.status || 'Draft',
      publicationDate: content.publicationDate
        ? new Date(content.publicationDate).toISOString().slice(0, 16)
        : ''
    });

    setShowForm(true);
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (form.status === 'Scheduled' && !form.publicationDate) {
      setError('Please choose a publication date.');
      return;
    }

    setLoading(true);

    try {
      const url = editingId ? `${API}/${editingId}` : API;
      const method = editingId ? 'PUT' : 'POST';

      const body = {
        ...form,
        publicationDate: form.publicationDate
          ? new Date(form.publicationDate).toISOString()
          : null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save content.');
      }

      setMessage(editingId
        ? 'Content updated successfully!'
        : 'Content created successfully!'
      );

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadContents();

      if (onContentChange) {
        onContentChange();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }

    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete content.');
      }

      setMessage('Content deleted successfully!');
      await loadContents();

      if (onContentChange) {
        onContentChange();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="manage-content">
      <div className="manage-header">
        <div>
          <h1>Manage Content</h1>
          <p>Create, edit, publish and schedule your content.</p>
        </div>

        <button className="manage-add-btn" onClick={openAddForm}>
          + Add Content
        </button>
      </div>

      {message && <p className="manage-success">{message}</p>}
      {error && <p className="manage-error">{error}</p>}

      {showForm && (
        <form className="manage-form" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Edit Content' : 'Add New Content'}</h2>

          <label>Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />

          <label>Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Education">Education</option>
            <option value="Technology">Technology</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Other">Other</option>
          </select>

          <label>Content Type</label>
          <select
            name="contentType"
            value={form.contentType}
            onChange={handleChange}
          >
            <option value="Article">Article</option>
            <option value="Video">Video</option>
            <option value="Image">Image</option>
            <option value="Podcast">Podcast</option>
          </select>

          <label>Thumbnail Image URL</label>
          <input
            name="thumbnail"
            value={form.thumbnail}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />

          <label>Media URL</label>
          <input
            name="mediaUrl"
            value={form.mediaUrl}
            onChange={handleChange}
            placeholder="Video, image or audio URL"
          />

          <label>Article Content</label>
          <textarea
            name="articleContent"
            value={form.articleContent}
            onChange={handleChange}
            rows="5"
          />

          <label>Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Scheduled">Scheduled</option>
          </select>

          {form.status === 'Scheduled' && (
            <>
              <label>Publication Date and Time</label>
              <input
                type="datetime-local"
                name="publicationDate"
                value={form.publicationDate}
                onChange={handleChange}
                required
              />
            </>
          )}

          <div className="manage-form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update Content' : 'Save Content'}
            </button>

            <button
              type="button"
              className="manage-cancel-btn"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="manage-table-wrap">
        <table className="manage-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Type</th>
              <th>Status</th>
              <th>Publication Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {contents.length === 0 ? (
              <tr>
                <td colSpan="6" className="manage-empty">
                  No content yet. Click Add Content to get started.
                </td>
              </tr>
            ) : (
              contents.map((content) => (
                <tr key={content._id}>
                  <td>{content.title}</td>
                  <td>{content.category}</td>
                  <td>{content.contentType}</td>
                  <td>{content.status}</td>
                  <td>
                    {content.publicationDate
                      ? new Date(content.publicationDate).toLocaleString()
                      : 'Not set'}
                  </td>
                  <td>
                    <div className="manage-actions">
                      <button onClick={() => openEditForm(content)}>
                        Edit
                      </button>
                      <button
                        className="manage-delete-btn"
                        onClick={() => handleDelete(content._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageContent;
