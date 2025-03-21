import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CommentsContext = createContext();

export const CommentsProvider = ({ children }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(AuthContext);

  const fetchCommentsByPostId = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      setLoading(true);
      setError(null);
      const res = await axios.get(`/api/comments/post/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      
      if (res.data.success) {
        setComments(res.data.comments);
        return res.data.comments;
      }
    } catch (err) {
      setError('Failed to load comments');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (postId, content) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/api/comments', 
        { postId, content },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (res.data.success) {
        const newComment = {
          ...res.data.comment,
          username: currentUser.username
        };
        
        setComments(prevComments => [newComment, ...prevComments]);
        return newComment;
      }
    } catch (err) {
      setError('Failed to add comment');
      console.error('Error adding comment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateComment = async (commentId, content) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `/api/comments/${commentId}`, 
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (res.data.success) {
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === commentId 
              ? { ...res.data.comment, username: comment.username } 
              : comment
          )
        );
        
        return res.data.comment;
      }
    } catch (err) {
      setError('Failed to update comment');
      console.error('Error updating comment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await axios.delete(`/api/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.data.success) {
        setComments(prevComments => 
          prevComments.filter(comment => comment.id !== commentId)
        );
        
        return true;
      }
    } catch (err) {
      setError('Failed to delete comment');
      console.error('Error deleting comment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    comments,
    loading,
    error,
    fetchCommentsByPostId,
    addComment,
    updateComment,
    deleteComment
  };

  return (
    <CommentsContext.Provider value={value}>
      {children}
    </CommentsContext.Provider>
  );
};