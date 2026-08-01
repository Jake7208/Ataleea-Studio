'use client'

import React, { useEffect, useState } from 'react'

import { Heart } from '@/components/icons'

// which comments this browser has already liked — keeps the count honest across
// reloads and stops a reader double-liking, without needing an account
const STORAGE_KEY = 'liked-comments'

function readLiked(): Record<string, true> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export default function CommentLikeButton({
  commentId,
  initialLikes,
}: {
  commentId: string
  initialLikes: number
}) {
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(false)
  const [pending, setPending] = useState(false)

  // localStorage is client-only, so the liked state settles after hydration
  useEffect(() => {
    if (readLiked()[commentId]) setLiked(true)
  }, [commentId])

  const like = async () => {
    if (liked || pending) return
    setPending(true)
    // optimistic — bump the count now, reconcile with the server below
    setLiked(true)
    setLikes((n) => n + 1)
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, { method: 'POST' })
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      const data = await res.json()
      if (typeof data?.likes === 'number') setLikes(data.likes)
      const store = readLiked()
      store[commentId] = true
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    } catch {
      // roll back so the button can be tried again
      setLiked(false)
      setLikes((n) => Math.max(0, n - 1))
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      className={`comment-like ${liked ? 'is-liked' : ''}`}
      onClick={like}
      disabled={liked || pending}
      aria-pressed={liked}
      aria-label={
        liked
          ? `Liked — ${likes} ${likes === 1 ? 'like' : 'likes'}`
          : 'Like this comment'
      }
    >
      <Heart />
      <span className="comment-like-count">{likes}</span>
    </button>
  )
}
