'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, MessageCircle, Share2, User, MapPin, Image as ImageIcon, X } from 'lucide-react';

interface Comment {
  _id?: string;
  text: string;
  authorName: string;
  createdAt: string;
}

interface Post {
  _id: string;
  author: string;
  title: string;
  content: string;
  destination: string;
  imageUrl?: string;
  likes: number;
  hasLiked: boolean;
  comments: Comment[];
  commentCount: number;
  createdAt: string;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ title: '', content: '', destination: '', imageUrl: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [postErrors, setPostErrors] = useState<{title?: string, content?: string}>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be smaller than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPost({ ...newPost, imageUrl: reader.result as string });
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setNewPost({ ...newPost, imageUrl: '' });
    setPreviewUrl(null);
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        setPosts([]);
        console.error('Invalid posts data:', data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const validatePost = () => {
    const errors: any = {};
    let isValid = true;
    if (!newPost.title.trim()) { errors.title = "Title is required"; isValid = false; }
    if (!newPost.content.trim()) { errors.content = "Story content is required"; isValid = false; }
    setPostErrors(errors);
    return isValid;
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePost()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });
      if (res.ok) {
        setNewPost({ title: '', content: '', destination: '', imageUrl: '' });
        setPreviewUrl(null);
        fetchPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    // Optimistic UI update
    setPosts(posts.map(p => {
      if (p._id === postId) {
        return {
          ...p,
          hasLiked: !p.hasLiked,
          likes: p.hasLiked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    }));

    try {
      await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
    } catch (error) {
      console.error('Error toggling like:', error);
      fetchPosts(); // Revert on error
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    if (!commentText.trim()) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText }),
      });
      
      if (res.ok) {
        const data = await res.json();
        // Update post with new comment
        setPosts(posts.map(p => {
          if (p._id === postId) {
            return {
              ...p,
              comments: [...p.comments, data.comment],
              commentCount: data.commentCount
            };
          }
          return p;
        }));
        setCommentText('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleShare = (postId: string) => {
    const url = `${window.location.origin}/community#post-${postId}`;
    navigator.clipboard.writeText(url);
    setCopyStatus(postId);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4">
            Travel <span className="text-amber-500">Community</span>
          </h1>
          <p className="text-xl text-stone-400">
            Share your experiences, inspire others, and discover travel stories from around the world.
          </p>
        </div>

        {/* Create Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 bg-stone-900 border border-stone-800 rounded-3xl p-8"
        >
          <h2 className="text-xl font-bold text-white mb-6">Share Your Journey</h2>
          <form onSubmit={handlePostSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Journey title..."
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                required
                className={`w-full px-4 py-3 bg-stone-950 border ${postErrors.title ? 'border-red-500' : 'border-stone-800 focus:border-amber-600'} rounded-xl text-white placeholder:text-stone-600 focus:outline-none transition-colors`}
              />
              {postErrors.title && <p className="mt-1 text-xs text-red-500">{postErrors.title}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Destination (e.g. Makkah, Paris)"
                value={newPost.destination}
                onChange={(e) => setNewPost({ ...newPost, destination: e.target.value })}
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-600"
              />
              <div className="relative w-full">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-400 hover:text-white cursor-pointer hover:border-amber-600 flex items-center justify-center gap-2 transition-all"
                >
                  <ImageIcon className="h-5 w-5" />
                  <span>{previewUrl ? 'Change Image' : 'Upload Image (Optional)'}</span>
                </label>
              </div>
            </div>

            {previewUrl && (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-stone-800">
                <Image width={800} height={800} src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-white hover:bg-black transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div>
              <textarea
                placeholder="Tell your travel story..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                required
                rows={4}
                className={`w-full px-4 py-3 bg-stone-950 border ${postErrors.content ? 'border-red-500' : 'border-stone-800 focus:border-amber-600'} rounded-xl text-white placeholder:text-stone-600 focus:outline-none resize-none transition-colors`}
              />
              {postErrors.content && <p className="mt-1 text-xs text-red-500">{postErrors.content}</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-amber-600 text-black font-bold rounded-xl hover:bg-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sharing...' : 'Share Story'}
            </button>
          </form>
        </motion.div>

        {/* Posts Feed */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-stone-400">Loading community stories...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post, idx) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden hover:border-amber-600/50 transition-all"
              >
                {post.imageUrl && (
                  <Image width={800} height={800} src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-64 object-cover" />
                )}

                <div className="p-8" id={`post-${post._id}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-amber-600 flex items-center justify-center">
                      <User className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{post.author}</p>
                      <p className="text-xs text-stone-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{post.title}</h3>

                  {post.destination && (
                    <div className="flex items-center gap-2 text-stone-400 mb-4">
                      <MapPin className="h-4 w-4 text-amber-600" />
                      <span>{post.destination}</span>
                    </div>
                  )}

                  <p className="text-stone-300 mb-6 line-clamp-3">{post.content}</p>

                  <div className="flex gap-6 pt-6 border-t border-stone-800">
                    <button 
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-2 transition-colors ${post.hasLiked ? 'text-amber-500' : 'text-stone-400 hover:text-amber-500'}`}
                    >
                      <Heart className="h-5 w-5" fill={post.hasLiked ? 'currentColor' : 'none'} />
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    <button 
                      onClick={() => setActiveCommentId(activeCommentId === post._id ? null : post._id)}
                      className="flex items-center gap-2 text-stone-400 hover:text-amber-500 transition-colors"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm">{post.commentCount}</span>
                    </button>
                    <button 
                      onClick={() => handleShare(post._id)}
                      className="flex items-center gap-2 text-stone-400 hover:text-amber-500 transition-colors relative"
                    >
                      <Share2 className="h-5 w-5" />
                      {copyStatus === post._id && (
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-600 text-black text-xs px-2 py-1 rounded font-bold whitespace-nowrap">
                          Copied!
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Comments Section */}
                  {activeCommentId === post._id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 pt-6 border-t border-stone-800"
                    >
                      <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
                        {post.comments.map((comment, idx) => (
                          <div key={comment._id || idx} className="bg-stone-950 p-4 rounded-xl">
                            <p className="text-sm font-semibold text-white mb-1">{comment.authorName}</p>
                            <p className="text-sm text-stone-300">{comment.text}</p>
                          </div>
                        ))}
                        {post.comments.length === 0 && (
                          <p className="text-stone-500 text-sm text-center py-2">No comments yet. Be the first!</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCommentSubmit(post._id);
                          }}
                          className="flex-1 px-4 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-600 text-sm"
                        />
                        <button
                          onClick={() => handleCommentSubmit(post._id)}
                          disabled={!commentText.trim()}
                          className="px-4 py-2 bg-amber-600 text-black font-bold rounded-lg hover:bg-amber-500 transition-all disabled:opacity-50 text-sm"
                        >
                          Post
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-stone-400 text-lg">Be the first to share your travel story!</p>
          </div>
        )}
      </div>
    </div>
  );
}