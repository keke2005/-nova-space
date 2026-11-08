
import React, { useEffect, useState } from 'react';
import './App.css';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ExploreContent from './components/ExploreContent';
import ContentDetails from './components/ContentDetails';

const API = 'http://localhost:5000/api';

const defaultPictures = {
  Education: '/images/education.jpg',
  Technology: '/images/technology.jpg',
  Lifestyle: '/images/lifestyle.jpg',
  Entertainment: '/images/creative.jpg',
  Other: '/images/creative.jpg'
};

function getPage() {
  const hash = window.location.hash;

  if (hash.startsWith('#content/')) return 'details';
  if (hash === '#explore' || hash === '#content') return 'explore';
  if (hash === '#login') return 'login';
  if (hash === '#dashboard') return 'dashboard';

  return 'home';
}

function App() {
  const [page, setPage] = useState(getPage);
  const [creator, setCreator] = useState(null);
  const [featuredContent, setFeaturedContent] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [contentError, setContentError] = useState('');

  const [selectedContentId, setSelectedContentId] = useState(
    window.location.hash.startsWith('#content/')
      ? window.location.hash.split('/')[1]
      : null
  );

  // Navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;

      setPage(getPage());

      if (hash.startsWith('#content/')) {
        setSelectedContentId(hash.split('/')[1]);
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Load published content from MongoDB
  useEffect(() => {
    if (page !== 'home' || creator) return;

    const loadFeaturedContent = async () => {
      try {
        setLoadingContent(true);
        setContentError('');

        const response = await fetch(`${API}/contents`);

        if (!response.ok) {
          throw new Error('Unable to load featured content.');
        }

        const data = await response.json();

        setFeaturedContent(data.slice(0, 3));
      } catch (error) {
        setContentError(error.message);
      } finally {
        setLoadingContent(false);
      }
    };

    loadFeaturedContent();
  }, [page, creator]);

  // Open details
  const openDetails = (id) => {
    setSelectedContentId(id);
    window.location.hash = `#content/${id}`;
    setPage('details');
  };

  // Explore page
  const openExplore = () => {
    window.location.hash = '#explore';
    setPage('explore');
  };

  // Login
  const handleLogin = (user) => {
    setCreator(user);
    window.location.hash = '#dashboard';
    setPage('dashboard');
  };

  // Logout
  const handleLogout = () => {
    sessionStorage.removeItem('creatorToken');
    setCreator(null);
    window.location.hash = '#home';
    setPage('home');
  };

  return (
    <div className="App">

      {/* NAVIGATION */}
      <nav className="navbar">
        <h2>
          NOVA<span>SPACE.</span>
        </h2>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#explore">Explore</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>

        {creator ? (
          <button
            className="login-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <a href="#login" className="login-btn">
            Creator Login
          </a>
        )}
      </nav>

      {/* DASHBOARD */}
      {creator ? (
        <Dashboard
          creator={creator}
          onLogout={handleLogout}
        />

      ) : page === 'login' ? (
        <Login onLogin={handleLogin} />

      ) : page === 'explore' ? (
        <ExploreContent onViewDetails={openDetails} />

      ) : page === 'details' && selectedContentId ? (
        <ContentDetails
          contentId={selectedContentId}
          onBack={openExplore}
        />

      ) : (
        <>

          {/* HERO SECTION */}
          <section className="hero" id="home">
            <div className="hero-content">

              <p className="gold-text">
                WELCOME TO NOVA SPACE
              </p>

              <h1>
                Stories Worth
                <br />
                <span>Sharing.</span>
              </h1>

              <p className="hero-description">
                Discover inspiring content, explore new ideas,
                and connect with creativity all in one place.
              </p>

              <a href="#explore" className="gold-btn">
                Explore Content →
              </a>

            </div>
          </section>

          {/* FEATURED CONTENT */}
          <section className="content-section" id="content">

            <p className="gold-text">
              DISCOVER SOMETHING NEW
            </p>

            <h2>Featured Content</h2>

            {loadingContent && (
              <p>Loading featured content...</p>
            )}

            {contentError && (
              <p className="details-error">
                {contentError}
              </p>
            )}

            {!loadingContent &&
              !contentError &&
              featuredContent.length === 0 && (
                <p>
                  No published content yet. Check back soon!
                </p>
              )}

            <div className="content-grid">

              {!loadingContent &&
                !contentError &&
                featuredContent.map((item) => {
                  const picture =
                    item.thumbnail ||
                    defaultPictures[item.category] ||
                    defaultPictures.Other;

                  return (
                    <div
                      className="content-card"
                      key={item._id}
                    >

                      {/* CONTENT IMAGE */}
                      <div className="featured-image-container">
                        <img
                          src={picture}
                          alt={item.title}
                          className="featured-image"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              '/images/creative.jpg';
                          }}
                        />
                      </div>

                      {/* CONTENT INFORMATION */}
                      <div className="featured-card-body">

                        <p className="gold-text">
                          {item.category}
                        </p>

                        <h3>{item.title}</h3>

                        <p className="featured-description">
                          {item.description}
                        </p>

                        <button
                          className="gold-btn featured-button"
                          onClick={() => openDetails(item._id)}
                        >
                          View Details →
                        </button>

                      </div>

                    </div>
                  );
                })}

            </div>

            {!loadingContent &&
              !contentError &&
              featuredContent.length > 0 && (
                <button
                  className="gold-btn view-all-btn"
                  onClick={openExplore}
                >
                  View All Content →
                </button>
              )}

          </section>

          {/* ABOUT SECTION */}
          <section className="about-section" id="about">

            <p className="gold-text">
              OUR PLATFORM
            </p>

            <h2>
              One Place. Endless Creativity.
            </h2>

            <p>
              Nova Space brings content creators and viewers
              together. Explore published content, share your
              thoughts, and become part of a creative community.
            </p>

          </section>

        </>
      )}

      {/* FOOTER */}
      <footer id="contact">

        <h2>
          NOVA<span>SPACE.</span>
        </h2>

        <p>Creating. Sharing. Connecting.</p>

        <p>
          © 2026 Nova Space. All rights reserved.
        </p>

      </footer>

    </div>
  );
}

export default App;
