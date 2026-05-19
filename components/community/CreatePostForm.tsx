"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageIcon, X, Star, Loader2 } from "lucide-react";
import { SUGGESTED_TAGS, TRIP_TYPES, type TripType } from "@/lib/community/constants";
import DestinationCombobox from "@/components/DestinationCombobox";

type CreatePostFormProps = {
  onSuccess: () => void;
};

export default function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [destination, setDestination] = useState("");
  const [tripType, setTripType] = useState<TripType>("Other");
  const [rating, setRating] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag].slice(0, 5)
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image must be smaller than 5MB");
      return;
    }
    setImageError("");
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImageUrl(result);
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { title?: string; content?: string } = {};
    if (!title.trim()) nextErrors.title = "Title is required";
    if (!content.trim()) nextErrors.content = "Share a few details about your trip";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          destination,
          imageUrl,
          tags,
          tripType,
          rating,
        }),
      });
      if (res.ok) {
        setTitle("");
        setContent("");
        setDestination("");
        setTripType("Other");
        setRating(null);
        setTags([]);
        setImageUrl("");
        setPreviewUrl(null);
        setExpanded(false);
        onSuccess();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-stone-800 bg-gradient-to-br from-stone-900 to-stone-950 p-6 sm:p-8 shadow-xl">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Share your journey</h2>
          <p className="text-sm text-stone-400 mt-1">
            Inspire fellow travelers with photos, tips, and real experiences.
          </p>
        </div>
        {!expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="shrink-0 rounded-full bg-amber-600 px-4 py-2 text-sm font-bold text-black hover:bg-amber-500 transition"
          >
            Write post
          </button>
        )}
      </div>

      {expanded && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              placeholder="Give your story a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full rounded-xl border bg-stone-950 px-4 py-3 text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-600/50 ${
                errors.title ? "border-red-500" : "border-stone-800"
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-400">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DestinationCombobox
              variant="form"
              placeholder="Where to go?"
              value={destination}
              onChange={setDestination}
              onSelect={(d) => setDestination(d.name)}
            />
            <select
              value={tripType}
              onChange={(e) => setTripType(e.target.value as TripType)}
              className="rounded-xl border border-stone-800 bg-stone-950 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-600/50"
            >
              {TRIP_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-2">
              Trip rating (optional)
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(rating === n ? null : n)}
                  className="p-1 rounded transition hover:scale-110"
                  aria-label={`Rate ${n} stars`}
                >
                  <Star
                    className={`h-6 w-6 ${
                      rating && n <= rating
                        ? "fill-amber-500 text-amber-500"
                        : "text-stone-600"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-2">
              Tags (up to 5)
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1 text-xs font-medium border transition ${
                    tags.includes(tag)
                      ? "bg-amber-600/20 border-amber-600 text-amber-400"
                      : "border-stone-700 text-stone-400 hover:border-stone-500"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <input
              type="file"
              id="community-image-upload"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              htmlFor="community-image-upload"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-stone-700 bg-stone-950/50 px-4 py-4 text-stone-400 hover:border-amber-600 hover:text-amber-400 transition"
            >
              <ImageIcon className="h-5 w-5" />
              {previewUrl ? "Change photo" : "Add a photo (optional, max 5MB)"}
            </label>
            {imageError && (
              <p className="mt-1 text-xs text-red-400">{imageError}</p>
            )}
            {previewUrl && (
              <div className="relative mt-3 h-48 overflow-hidden rounded-xl border border-stone-800">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl("");
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 rounded-full bg-black/70 p-2 text-white hover:bg-black"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <textarea
            placeholder="What made this trip special? Share tips, highlights, or lessons learned..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className={`w-full resize-none rounded-xl border bg-stone-950 px-4 py-3 text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-600/50 ${
              errors.content ? "border-red-500" : "border-stone-800"
            }`}
          />
          {errors.content && (
            <p className="text-xs text-red-400">{errors.content}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 font-bold text-black hover:bg-amber-500 disabled:opacity-50 transition"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish story"
              )}
            </button>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="rounded-xl border border-stone-700 px-6 py-3 text-stone-300 hover:bg-stone-800 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
