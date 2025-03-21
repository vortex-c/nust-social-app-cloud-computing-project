import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const PostsContext = createContext();

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(AuthContext);

  const fetchPosts = async () => {
    try {
      const timestamp = Date.now();
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/posts?_=${timestamp}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(res)
      if (res.data.success) {
          setPosts(res.data.posts);
        return { 
          data: res.data.posts, 
        };
      }
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostById = async (postId) => {
    try {
      const timestamp = Date.now();
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/posts/${postId}?_=${timestamp}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.data.success) {
        setCurrentPost(res.data.post);
        return res.data.post;
      }
    } catch (err) {
      setError('Failed to load post');
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    if (!currentUser) return;

    try {
      const timestamp = Date.now();
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/posts/user/${currentUser.id}?_=${timestamp}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.data.success) {
        setUserPosts(res.data.posts);
        return res.data.posts;
      }
    } catch (err) {
      setError('Failed to load your posts');
      console.error('Error fetching user posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (title, content) => {
    try {
      const timestamp = Date.now();
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `/api/posts/?_=${timestamp}`, 
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (res.data.success) {
        return res.data.post;
      }
    } catch (err) {
      const timestamp = Date.now();
      setError('Failed to create post');
      console.error('Error creating post:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (postId, title, content) => {
    try {
      const timestamp = Date.now();
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `/api/posts/${postId}?_=${timestamp}`, 
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (res.data.success) {
        // Update posts in state
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId ? res.data.post : post
          )
        );
        
        if (currentPost && currentPost.id === postId) {
          setCurrentPost(res.data.post);
        }
        
        return res.data.post;
      }
    } catch (err) {
      setError('Failed to update post');
      console.error('Error updating post:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await axios.delete(`/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.data.success) {
        setPosts(prevPosts => 
          prevPosts.filter(post => post.id !== postId)
        );
        setUserPosts(prevPosts => 
          prevPosts.filter(post => post.id !== postId)
        );
        
        return true;
      }
    } catch (err) {
      setError('Failed to delete post');
      console.error('Error deleting post:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    posts,
    userPosts,
    currentPost,
    loading,
    error,
    fetchPosts,
    fetchPostById,
    fetchUserPosts,
    createPost,
    updatePost,
    deletePost
  };

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
};