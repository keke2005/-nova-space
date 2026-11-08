
import React, { useEffect, useState } from 'react';
import './ContentDetails.css';

const API = 'https://nova-space.onrender.com/api';

// Convert YouTube links into playable embed links
function getYouTubeEmbedUrl(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname;

    let videoId = null;

    if (host === 'youtu.be' || host === 'www.youtu.be') {
      videoId = path.split('/')[1];
    } else if (
      host === 'youtube.com' ||
      host === 'www.youtube.com' ||
      host === 'm.youtube.com'
    ) {
      if (path === '/watch') {
        videoId = parsed.searchParams.get('v');
      } else if (
        path.startsWith('/shorts/') ||
        path.startsWith('/embed/') ||
        path.startsWith('/live/')
      ) {
        videoId = path.split('/')[2];
      }
    }

    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return `https://www.youtube.com/embed/${videoId}`;
    }

    return null;
  } catch {
    return null;
  }
}

function ContentDetails({ contentId, onBack }) {
  const [content, setContent] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [viewerName, setViewerName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Unique viewer ID for this browser
  const [viewerId] = useState(() => {
    let id = localStorage.getItem('creatorViewerId');

    if (!id) {
      id = window.crypto.randomUUID();
      localStorage.setItem('creatorViewerId', id);
    }

    return id;
  });

  // Load content, comments and likes
  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        setError('');
        setContent(null);
        setLiked(false);

        const [contentRes, commentsRes, likesRes] =
          await Promise.all([
            fetch(`${API}/contents/${contentId}`),
            fetch(`${API}/comments/${contentId}`),
            fetch(`${API}/likes/${contentId}`)
          ]);

        if (!contentRes.ok || !commentsRes.ok || !likesRes.ok) {
          throw new Error('Failed to load content details.');
        }

        const contentData = await contentRes.json();
        const commentsData = await commentsRes.json();
        const likesData = await likesRes.json();

        setContent(contentData);
        setComments(commentsData);
        setLikes(likesData.totalLikes);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [contentId]);

  // Like or unlike content
  const handleLike = async () => {
    try {
      setError('');

      const response = await fetch(
        `${API}/likes/${contentId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ viewerId })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to like content.'
        );
      }

      setLiked(data.liked);
      setLikes((previous) =>
        previous + (data.liked ? 1 : -1)
      );

    } catch (err) {
      setError(err.message);
    }
  };

  // Submit viewer comment
  const handleComment = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `${API}/comments/${contentId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            viewerName,
            message: commentText
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to submit comment.'
        );
      }

      setMessage('Your comment was submitted for approval.');
      setViewerName('');
      setCommentText('');

    } catch (err) {
      setError(err.message);
    }
  };

  // Copy content link
  const handleShare = async () => {
    const url =
      `${window.location.origin}/#content/${contentId}`;

    try {
      await navigator.clipboard.writeText(url);
      setError('');
      setMessage('Content link copied!');
    } catch (err) {
      setError('Unable to copy link.');
    }
  };

  if (loading) {
    return (
      <div className="details-page">
        Loading content...
      </div>
    );
  }

  if (!content) {
    return (
      <div className="details-page">
        <p className="details-error">
          {error || 'Content not found.'}
        </p>

        <button onClick={onBack}>
          Back to Explore
        </button>
      </div>
    );
  }

  const youtubeEmbed = getYouTubeEmbedUrl(content.mediaUrl);

  return (
    <div className="details-page">

      {/* BACK BUTTON */}
      <button
        className="details-back"
        onClick={onBack}
      >
        ← Back to Explore
      </button>

      {/* CONTENT INFORMATION */}
      <p className="gold-text">
        {content.category}
      </p>

      <h1>{content.title}</h1>

      <p className="details-description">
        {content.description}
      </p>

      {/* VIEW COUNTER */}
      <p className="details-views">
        👁 {content.views ?? 0} views
      </p>

      {/* THUMBNAIL FOR NON-VIDEO CONTENT */}
      {content.thumbnail &&
        content.contentType !== 'Video' && (
          <img
            src={content.thumbnail}
            alt={content.title}
            className="details-image"
          />
        )}

      {/* ARTICLE */}
      {content.contentType === 'Article' && (
        <div className="details-article">
          {content.articleContent}
        </div>
      )}

      {/* IMAGE */}
      {content.contentType === 'Image' &&
        content.mediaUrl && (
          <img
            src={content.mediaUrl}
            alt={content.title}
            className="details-image"
          />
        )}

      {/* VIDEO */}
      {content.contentType === 'Video' &&
        content.mediaUrl && (

          youtubeEmbed ? (

            <div className="youtube-container">
              <iframe
                src={youtubeEmbed}
                title={content.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>

          ) : (

            <video
              controls
              className="details-video"
              src={content.mediaUrl}
            >
              Your browser does not support video playback.
            </video>

          )
        )}

      {/* PODCAST */}
      {content.contentType === 'Podcast' &&
        content.mediaUrl && (
          <audio controls src={content.mediaUrl}>
            Your browser does not support audio playback.
          </audio>
        )}

      {/* LIKES AND SHARING */}
      <div className="details-engagement">

        <button onClick={handleLike}>
          {liked ? '♥ Liked' : '♡ Like'} ({likes})
        </button>

        <button onClick={handleShare}>
          Share / Copy Link
        </button>

      </div>

      {message && (
        <p className="details-success">
          {message}
        </p>
      )}

      {error && (
        <p className="details-error">
          {error}
        </p>
      )}

      {/* COMMENTS */}
      <div className="details-comments">

        <h2>
          Comments ({comments.length})
        </h2>

        {comments.length === 0 ? (
          <p>
            No approved comments yet.
            Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              className="details-comment"
              key={comment._id}
            >
              <strong>
                {comment.viewerName}
              </strong>

              <p>{comment.message}</p>
            </div>
          ))
        )}

        {/* COMMENT FORM */}
        <form
          onSubmit={handleComment}
          className="details-comment-form"
        >
          <h3>Leave a Comment</h3>

          <input
            type="text"
            placeholder="Your name"
            value={viewerName}
            onChange={(e) =>
              setViewerName(e.target.value)
            }
            required
          />

          <textarea
            placeholder="Write your comment..."
            value={commentText}
            onChange={(e) =>
              setCommentText(e.target.value)
            }
            maxLength="1000"
            required
          />

          <button type="submit">
            Submit Comment
          </button>
        </form>

      </div>
    </div>
  );
}

export default ContentDetails;
