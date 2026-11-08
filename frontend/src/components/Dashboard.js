
import React, { useEffect, useState } from 'react';
import ManageContent from './ManageContent';
import ManageComments from './ManageComments';
import './Dashboard.css';

function Dashboard({ creator, onLogout }) {
  const [activePage, setActivePage] = useState('overview');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  // Load dashboard statistics from MongoDB
  const loadStats = async () => {
    try {
      setError('');

      const token = sessionStorage.getItem('creatorToken');

      const response = await fetch(
        'https://nova-space.onrender.com/api/dashboard/stats',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Unable to load dashboard statistics.');
      }

      const data = await response.json();
      setStats(data);

    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="dashboard">

      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <h2>
          CREATOR<span>HUB.</span>
        </h2>

        <p>Creator Panel</p>

        <nav>
          <button
            className={activePage === 'overview' ? 'active' : ''}
            onClick={() => {
              setActivePage('overview');
              loadStats();
            }}
          >
            Overview
          </button>

          <button
            className={activePage === 'content' ? 'active' : ''}
            onClick={() => setActivePage('content')}
          >
            Manage Content
          </button>

          <button
            className={activePage === 'comments' ? 'active' : ''}
            onClick={() => setActivePage('comments')}
          >
            Comments
          </button>
        </nav>

        <button
          className="dashboard-logout"
          onClick={onLogout}
        >
          Logout
        </button>
      </aside>

      {/* Main Dashboard Content */}
      <main className="dashboard-main">

        {/* Overview Page */}
        {activePage === 'overview' && (
          <>
            <h1>Dashboard Overview</h1>
            <p>Welcome back, {creator.name}!</p>

            {error && (
              <p className="dashboard-error">{error}</p>
            )}

            {!stats && !error && (
              <p>Loading statistics...</p>
            )}

            {stats && (
              <div className="dashboard-stats">

                <div className="stat-card">
                  <h3>Total Content</h3>
                  <strong>{stats.totalContent}</strong>
                </div>

                <div className="stat-card">
                  <h3>Published</h3>
                  <strong>{stats.publishedContent}</strong>
                </div>

                <div className="stat-card">
                  <h3>Drafts</h3>
                  <strong>{stats.draftContent}</strong>
                </div>

                <div className="stat-card">
                  <h3>Scheduled</h3>
                  <strong>{stats.scheduledContent}</strong>
                </div>

                <div className="stat-card">
                  <h3>Comments</h3>
                  <strong>{stats.totalComments}</strong>
                </div>

              </div>
            )}
          </>
        )}

        {/* Manage Content Page */}
        {activePage === 'content' && (
          <ManageContent
            onContentChange={loadStats}
          />
        )}

        {/* Manage Comments Page */}
        {activePage === 'comments' && (
          <ManageComments
            onCommentsChange={loadStats}
          />
        )}

      </main>
    </div>
  );
}

export default Dashboard;
