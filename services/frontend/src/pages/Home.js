import React, { useEffect, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { PostsContext } from '../contexts/PostsContext';
import './Home.css';

const Home = () => {
  const { posts, loading, error, fetchPosts } = useContext(PostsContext);

  useEffect(() => {
    const loadInitialPosts = async () => {
      await fetchPosts();
    };
    
    loadInitialPosts();
  }, []);

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="home-container">
      <h1>Recent Posts</h1>
      
      {posts?.length === 0 ? (
        <p>No posts yet. Be the first to create one!</p>
      ) : (
        <div className="posts-grid">
          {posts?.map(post => (
            <div key={post.id} className="post-card">
              <h2>{post.title}</h2>
              <p className="post-author">By: {post.username}</p>
              <p className="post-date">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
              <p className="post-excerpt">
                {post.content.substring(0, 150)}
                {post.content.length > 150 ? '...' : ''}
              </p>
              <div className="post-footer">
                <span>{post.comment_count || 0} comments</span>
                <Link to={`/post/${post.id}`} className="read-more">
                  Read More
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;