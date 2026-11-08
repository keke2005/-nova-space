
import React, { useEffect, useState } from 'react';
import './ExploreContent.css';

// Default pictures for each category
const defaultPictures = {
  Education: '/images/education.jpg',
  Technology: '/images/technology.jpg',
  Lifestyle: '/images/lifestyle.jpg',
  Entertainment: '/images/creative.jpg',
  Other: '/images/creative.jpg'
};

function ExploreContent({ onViewDetails }) {
  const [contents, setContents] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadContents = async () => {
      try {
        const response = await fetch(
          'https://nova-space.onrender.com/api/contents'
        );

        if (!response.ok) {
          throw new Error('Failed to load content.');
        }

        const data = await response.json();
        setContents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadContents();
  }, []);

  // Search and filter content
  const filteredContents = contents.filter((content) => {
    const matchesSearch =
      content.title.toLowerCase().includes(search.toLowerCase()) ||
      content.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === 'All' || content.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="explore-page">

      {/* PAGE HEADING */}
      <div className="explore-heading">
        <p className="gold-text">DISCOVER SOMETHING NEW</p>
        <h1>Explore Content</h1>
        <p>
          Discover articles, videos, images and creative ideas.
        </p>
      </div>

      {/* SEARCH AND CATEGORY FILTER */}
      <div className="explore-filters">
        <input
          type="text"
          placeholder="Search content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Education">Education</option>
          <option value="Technology">Technology</option>
          <option value="Lifestyle">Lifestyle</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* LOADING AND ERROR */}
      {loading && <p>Loading content...</p>}

      {error && (
        <p className="explore-error">{error}</p>
      )}

      {!loading && !error && (
        <>
          <p className="explore-count">
            {filteredContents.length} content item(s) found
          </p>

          {filteredContents.length === 0 ? (
            <div className="explore-empty">
              <h3>No content found</h3>
              <p>Try another search or category.</p>
            </div>
          ) : (

            /* CONTENT CARDS */
            <div className="explore-grid">

              {filteredContents.map((content) => {
                const picture =
                  content.thumbnail ||
                  defaultPictures[content.category] ||
                  defaultPictures.Other;

                return (
                  <div
                    className="explore-card"
                    key={content._id}
                  >

                    {/* CONTENT PICTURE */}
                    <img
                      src={picture}
                      alt={content.title}
                      className="explore-image"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          '/images/creative.jpg';
                      }}
                    />

                    {/* CONTENT INFORMATION */}
                    <div className="explore-card-body">

                      <p className="gold-text">
                        {content.category}
                      </p>

                      <h3>{content.title}</h3>

                      <p>{content.description}</p>

                      <button
                        className="explore-view-btn"
                        onClick={() =>
                          onViewDetails(content._id)
                        }
                      >
                        View Details →
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>
          )}
        </>
      )}

    </section>
  );
}

export default ExploreContent;
