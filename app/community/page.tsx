"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Search,
  Users,
  Heart,
  MessageCircle,
  MapPin,
  Sparkles,
  Filter,
  X,
  Compass,
} from "lucide-react";
import CreatePostForm from "@/components/community/CreatePostForm";
import CommunityPostCard, {
  type CommunityPost,
} from "@/components/community/CommunityPostCard";
import { SORT_OPTIONS, TRIP_TYPES, type SortOption } from "@/lib/community/constants";

type CommunityStats = {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  topDestinations: { name: string; count: number }[];
  trendingTags: { name: string; count: number }[];
};

export default function CommunityPage() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("recent");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [tripTypeFilter, setTripTypeFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/posts/stats");
      if (res.ok) setStats(await res.json());
    } catch {
      /* stats optional */
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (destinationFilter) params.set("destination", destinationFilter);
      if (tripTypeFilter) params.set("tripType", tripTypeFilter);
      if (tagFilter) params.set("tag", tagFilter);
      params.set("sort", sort);

      const res = await fetch(`/api/posts?${params.toString()}`);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, destinationFilter, tripTypeFilter, tagFilter, sort]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const requireAuth = () => {
    if (!session) {
      window.location.href = "/login?callbackUrl=/community";
      return false;
    }
    return true;
  };

  const handleLike = async (postId: string) => {
    if (!requireAuth()) return;
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              hasLiked: !p.hasLiked,
              likes: p.hasLiked ? p.likes - 1 : p.likes + 1,
            }
          : p
      )
    );
    try {
      await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    } catch {
      fetchPosts();
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    if (!session || !commentText.trim()) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText }),
      });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId
              ? {
                  ...p,
                  comments: [...p.comments, data.comment],
                  commentCount: data.commentCount,
                }
              : p
          )
        );
        setCommentText("");
        fetchStats();
      }
    } catch {
      /* ignore */
    }
  };

  const handleShare = (postId: string) => {
    const url = `${window.location.origin}/community#post-${postId}`;
    navigator.clipboard.writeText(url);
    setCopyStatus(postId);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const clearFilters = () => {
    setSearch("");
    setDestinationFilter("");
    setTripTypeFilter("");
    setTagFilter("");
    setSort("recent");
  };

  const hasActiveFilters =
    debouncedSearch || destinationFilter || tripTypeFilter || tagFilter;

  const filterSidebar = (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Stories, places..."
            className="w-full rounded-xl border border-stone-800 bg-stone-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-600/50"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">
          Sort by
        </label>
        <div className="flex flex-col gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSort(opt.value)}
              className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                sort === opt.value
                  ? "bg-amber-600/20 text-amber-400 font-medium"
                  : "text-stone-400 hover:bg-stone-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">
          Trip type
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTripTypeFilter("")}
            className={`rounded-full px-3 py-1 text-xs border transition ${
              !tripTypeFilter
                ? "bg-amber-600 text-black border-amber-600 font-medium"
                : "border-stone-700 text-stone-400"
            }`}
          >
            All
          </button>
          {TRIP_TYPES.filter((t) => t !== "Other").map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTripTypeFilter(tripTypeFilter === t ? "" : t)}
              className={`rounded-full px-3 py-1 text-xs border transition ${
                tripTypeFilter === t
                  ? "bg-amber-600/20 border-amber-600 text-amber-400"
                  : "border-stone-700 text-stone-400 hover:border-stone-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {stats && stats.topDestinations.length > 0 && (
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">
            Popular destinations
          </label>
          <div className="flex flex-col gap-1">
            {stats.topDestinations.map((d) => (
              <button
                key={d.name}
                type="button"
                onClick={() =>
                  setDestinationFilter(
                    destinationFilter === d.name ? "" : d.name
                  )
                }
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                  destinationFilter === d.name
                    ? "bg-amber-600/20 text-amber-400"
                    : "text-stone-400 hover:bg-stone-800"
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {d.name}
                </span>
                <span className="text-xs text-stone-600">{d.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {stats && stats.trendingTags.length > 0 && (
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">
            Trending tags
          </label>
          <div className="flex flex-wrap gap-2">
            {stats.trendingTags.map((t) => (
              <button
                key={t.name}
                type="button"
                onClick={() => setTagFilter(tagFilter === t.name ? "" : t.name)}
                className={`rounded-full px-2.5 py-1 text-xs border transition ${
                  tagFilter === t.name
                    ? "bg-amber-600/20 border-amber-600 text-amber-400"
                    : "border-stone-800 text-stone-500 hover:text-stone-300"
                }`}
              >
                #{t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-stone-700 py-2 text-sm text-stone-400 hover:bg-stone-800 transition"
        >
          <X className="h-4 w-4" />
          Clear filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden border-b border-stone-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-stone-950 to-stone-950" />
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-stone-950/80" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-600/40 bg-amber-600/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-400 mb-4">
                <Compass className="h-3.5 w-3.5" />
                Travel Community
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight">
                Stories from{" "}
                <span className="text-amber-500">real travelers</span>
              </h1>
              <p className="mt-4 text-lg text-stone-300 max-w-xl">
                Share Umrah journeys, family tours, and travel tips. Learn from
                people who have been there.
              </p>
            </div>

            {stats && (
              <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0">
                {[
                  { icon: Users, label: "Stories", value: stats.totalPosts },
                  { icon: Heart, label: "Likes", value: stats.totalLikes },
                  {
                    icon: MessageCircle,
                    label: "Comments",
                    value: stats.totalComments,
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-stone-800 bg-stone-900/60 backdrop-blur px-4 py-4 text-center"
                  >
                    <Icon className="h-5 w-5 text-amber-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="text-[10px] uppercase tracking-wider text-stone-500 mt-0.5">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-10">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-2xl border border-stone-800 bg-stone-900/50 p-6">
              <div className="flex items-center gap-2 mb-6 text-white font-semibold">
                <Filter className="h-4 w-4 text-amber-500" />
                Filters
              </div>
              {filterSidebar}
            </div>
          </aside>

          {/* Main column */}
          <div className="min-w-0 space-y-8">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden flex w-full items-center justify-center gap-2 rounded-xl border border-stone-800 bg-stone-900 py-3 text-sm font-medium text-stone-300"
            >
              <Filter className="h-4 w-4" />
              {mobileFiltersOpen ? "Hide filters" : "Show filters"}
            </button>

            {mobileFiltersOpen && (
              <div className="lg:hidden rounded-2xl border border-stone-800 bg-stone-900/50 p-6">
                {filterSidebar}
              </div>
            )}

            {status === "authenticated" ? (
              <CreatePostForm
                onSuccess={() => {
                  fetchPosts();
                  fetchStats();
                }}
              />
            ) : (
              <div className="rounded-3xl border border-amber-600/30 bg-gradient-to-r from-amber-600/10 to-stone-900 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <Sparkles className="h-8 w-8 text-amber-500 shrink-0" />
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Join the conversation
                    </h2>
                    <p className="text-sm text-stone-400 mt-1">
                      Sign in to share your travel story, like posts, and comment.
                    </p>
                  </div>
                </div>
                <Link
                  href="/login?callbackUrl=/community"
                  className="shrink-0 rounded-full bg-amber-600 px-6 py-2.5 text-center text-sm font-bold text-black hover:bg-amber-500 transition"
                >
                  Sign in to post
                </Link>
              </div>
            )}

            {/* Guidelines */}
            <div className="rounded-2xl border border-stone-800/80 bg-stone-900/30 px-5 py-4 text-sm text-stone-500">
              <span className="text-amber-500 font-medium">Community guidelines:</span>{" "}
              Be respectful, share honest experiences, and avoid spam. Photos
              should be your own or properly credited.
            </div>

            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-3xl border border-stone-800 bg-stone-900 h-64"
                  />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 rounded-3xl border border-dashed border-stone-800">
                <Compass className="h-12 w-12 text-stone-700 mx-auto mb-4" />
                <p className="text-lg text-stone-400">
                  {hasActiveFilters
                    ? "No stories match your filters."
                    : "Be the first to share a travel story!"}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 text-amber-500 text-sm font-medium hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {posts.map((post, idx) => (
                  <CommunityPostCard
                    key={post._id}
                    post={post}
                    index={idx}
                    copyStatus={copyStatus}
                    activeCommentId={activeCommentId}
                    commentText={commentText}
                    onLike={handleLike}
                    onToggleComments={(id) => {
                      if (!requireAuth()) return;
                      setActiveCommentId(activeCommentId === id ? null : id);
                    }}
                    onShare={handleShare}
                    onCommentTextChange={setCommentText}
                    onCommentSubmit={handleCommentSubmit}
                    onTagClick={(tag) => {
                      setTagFilter(tag);
                      setMobileFiltersOpen(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
