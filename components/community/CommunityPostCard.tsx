"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export type CommunityComment = {
  _id?: string;
  text: string;
  authorName: string;
  createdAt: string;
};

export type CommunityPost = {
  _id: string;
  author: string;
  title: string;
  content: string;
  destination: string;
  imageUrl?: string;
  tags: string[];
  tripType: string;
  rating: number | null;
  likes: number;
  hasLiked: boolean;
  comments: CommunityComment[];
  commentCount: number;
  createdAt: string;
};

type CommunityPostCardProps = {
  post: CommunityPost;
  index: number;
  copyStatus: string | null;
  activeCommentId: string | null;
  commentText: string;
  onLike: (id: string) => void;
  onToggleComments: (id: string) => void;
  onShare: (id: string) => void;
  onCommentTextChange: (text: string) => void;
  onCommentSubmit: (id: string) => void;
  onTagClick?: (tag: string) => void;
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function CommunityPostCard({
  post,
  index,
  copyStatus,
  activeCommentId,
  commentText,
  onLike,
  onToggleComments,
  onShare,
  onCommentTextChange,
  onCommentSubmit,
  onTagClick,
}: CommunityPostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const longContent = post.content.length > 280;
  const showComments = activeCommentId === post._id;

  return (
    <motion.article
      id={`post-${post._id}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className="overflow-hidden rounded-3xl border border-stone-800 bg-stone-900/80 backdrop-blur-sm transition hover:border-amber-600/40"
    >
      {post.imageUrl && (
        <div className="relative h-56 sm:h-72 w-full">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
            unoptimized={post.imageUrl.startsWith("data:")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent" />
          {post.tripType && post.tripType !== "Other" && (
            <span className="absolute top-4 left-4 rounded-full bg-amber-600 px-3 py-1 text-xs font-bold text-black">
              {post.tripType}
            </span>
          )}
        </div>
      )}

      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-lg font-bold text-black">
              {post.author.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white truncate">{post.author}</p>
              <p className="text-xs text-stone-500">{timeAgo(post.createdAt)}</p>
            </div>
          </div>
          {post.rating != null && (
            <div className="flex items-center gap-0.5 shrink-0 rounded-full bg-stone-950 px-2 py-1 border border-stone-800">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < post.rating!
                      ? "fill-amber-500 text-amber-500"
                      : "text-stone-700"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {!post.imageUrl && post.tripType && post.tripType !== "Other" && (
          <span className="inline-block mb-3 rounded-full border border-amber-600/50 bg-amber-600/10 px-3 py-0.5 text-xs font-medium text-amber-400">
            {post.tripType}
          </span>
        )}

        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{post.title}</h3>

        {post.destination && (
          <div className="flex items-center gap-2 text-stone-400 mb-3 text-sm">
            <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
            <span>{post.destination}</span>
          </div>
        )}

        <p
          className={`text-stone-300 leading-relaxed ${
            !expanded && longContent ? "line-clamp-4" : ""
          }`}
        >
          {post.content}
        </p>
        {longContent && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-sm font-medium text-amber-500 hover:text-amber-400"
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Read more <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        )}

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagClick?.(tag)}
                className="rounded-full bg-stone-950 border border-stone-800 px-2.5 py-0.5 text-xs text-stone-400 hover:border-amber-600 hover:text-amber-400 transition"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-4 sm:gap-6 mt-6 pt-6 border-t border-stone-800">
          <button
            type="button"
            onClick={() => onLike(post._id)}
            className={`flex items-center gap-2 text-sm font-medium transition ${
              post.hasLiked
                ? "text-amber-500"
                : "text-stone-400 hover:text-amber-500"
            }`}
          >
            <Heart
              className="h-5 w-5"
              fill={post.hasLiked ? "currentColor" : "none"}
            />
            {post.likes}
          </button>
          <button
            type="button"
            onClick={() => onToggleComments(post._id)}
            className="flex items-center gap-2 text-sm font-medium text-stone-400 hover:text-amber-500 transition"
          >
            <MessageCircle className="h-5 w-5" />
            {post.commentCount}
          </button>
          <button
            type="button"
            onClick={() => onShare(post._id)}
            className="relative flex items-center gap-2 text-sm font-medium text-stone-400 hover:text-amber-500 transition"
          >
            <Share2 className="h-5 w-5" />
            Share
            {copyStatus === post._id && (
              <span className="absolute -top-8 left-0 rounded bg-amber-600 px-2 py-0.5 text-xs font-bold text-black whitespace-nowrap">
                Link copied!
              </span>
            )}
          </button>
        </div>

        {showComments && (
          <div className="mt-6 pt-6 border-t border-stone-800">
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
              {post.comments.map((comment, idx) => (
                <div
                  key={comment._id || idx}
                  className="rounded-xl bg-stone-950/80 border border-stone-800/80 p-4"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-white">
                      {comment.authorName}
                    </p>
                    <p className="text-[10px] text-stone-600">
                      {timeAgo(comment.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm text-stone-300">{comment.text}</p>
                </div>
              ))}
              {post.comments.length === 0 && (
                <p className="text-center text-sm text-stone-500 py-4">
                  No comments yet — start the conversation.
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => onCommentTextChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onCommentSubmit(post._id);
                }}
                className="flex-1 rounded-xl border border-stone-800 bg-stone-950 px-4 py-2.5 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-600/50"
              />
              <button
                type="button"
                onClick={() => onCommentSubmit(post._id)}
                disabled={!commentText.trim()}
                className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-black hover:bg-amber-500 disabled:opacity-40 transition"
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.article>
  );
}
