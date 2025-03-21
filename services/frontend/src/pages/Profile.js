import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { PostsContext } from '../contexts/PostsContext';
import './Profile.css';

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const { userPosts, loading, error, fetchUserPosts, deletePost } = useContext(PostsContext);

  useEffect(() => {
    fetchUserPosts();
  }, []);

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(postId);
      } catch (err) {
        console.error('Error handling delete in component:', err);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading your profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <div className="user-info">
          <p><strong>Username:</strong> {currentUser?.username}</p>
          <p><strong>Email:</strong> {currentUser?.email}</p>
          <p><strong>Member since:</strong> {new Date(currentUser?.created_at).toLocaleDateString()}</p>
        </div>
      </div>
      
      <div className="user-posts-section">
        <h2>My Posts</h2>
        
        {error && <div className="error">{error}</div>}
        
        {userPosts?.length === 0 ? (
          <p className="no-posts">You haven't created any posts yet.</p>
        ) : (
          <div className="posts-list">
            {userPosts?.map(post => (
              <div key={post.id} className="post-item">
                <h3>{post.title}</h3>
                <p className="post-date">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
                <p className="post-excerpt">
                  {post.content.substring(0, 100)}
                  {post.content.length > 100 ? '...' : ''}
                </p>
                <div className="post-actions">
                  <Link to={`/post/${post.id}`} className="view-button">
                    View
                  </Link>
                  <button 
                    onClick={() => handleDeletePost(post.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;