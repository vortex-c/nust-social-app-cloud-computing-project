import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { PostsContext } from '../contexts/PostsContext';
import { CommentsContext } from '../contexts/CommentsContext';
import './PostDetail.css';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { currentPost, loading: postLoading, error: postError, fetchPostById } = useContext(PostsContext);
  const { 
    comments, 
    loading: commentsLoading, 
    error: commentsError, 
    fetchCommentsByPostId, 
    addComment 
  } = useContext(CommentsContext);
  
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch post and comments when component mounts or id changes
    fetchPostById(id);
    fetchCommentsByPostId(id);
  }, [id]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (!newComment.trim()) return;
    
    try {
      setSubmitting(true);
      await addComment(id, newComment);
      setNewComment('');
    } catch (err) {
      console.error('Error in comment submission handler:', err);
      // Error is handled in the context
    } finally {
      setSubmitting(false);
    }
  };

  const loading = postLoading || commentsLoading;
  const error = postError || commentsError;

  if (loading && !currentPost) {
    return <div className="loading">Loading post...</div>;
  }

  if (error || !currentPost) {
    return <div className="error">{error || 'Post not found'}</div>;
  }

  return (
    <div className="post-detail-container">
      <div className="post-header">
        <h1>{currentPost.title}</h1>
        <div className="post-meta">
          <span>By: {currentPost.username}</span>
          <span>Posted: {new Date(currentPost.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="post-content">
        {currentPost.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      
      <div className="comments-section">
        <h2>Comments ({comments?.length || 0})</h2>
        
        {currentUser && (
          <form onSubmit={handleSubmitComment} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              required
            />
            <button 
              type="submit" 
              disabled={submitting}
              className="submit-comment"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        )}
        
        {commentsLoading ? (
          <p className="loading-comments">Loading comments...</p>
        ) : comments?.length === 0 ? (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        ) : (
          <div className="comments-list">
            {comments?.map(comment => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">{comment.username}</span>
                  <span className="comment-date">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="comment-content">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetail;