'use client'

import React, { useCallback, useState, useSyncExternalStore } from 'react'

import { Heart } from '@/components/icons'

// which comments this browser has already liked — keeps the count honest across
// reloads and stops a reader double-liking, without needing an account
const STORAGE_KEY = 'liked-comments'
// same-tab writes don't fire `storage`, so announce them ourselves
const CHANGED_EVENT = 'liked-comments:changed'

function readLiked(): Record<string, true> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function rememberLiked(commentId: string) {
  const store = readLiked()
  store[commentId] = true
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  window.dispatchEvent(new Event(CHANGED_EVENT))
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange)
  window.addEventListener(CHANGED_EVENT, onStoreChange)
  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(CHANGED_EVENT, onStoreChange)
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
  const [pending, setPending] = useState(false)
  // covers the gap between the click and the store write landing
  const [justLiked, setJustLiked] = useState(false)

  // localStorage is client-only: the server renders "not liked" and the real
  // value arrives on hydration, staying in sync across tabs thereafter.
  const storedLiked = useSyncExternalStore(
    subscribe,
    useCallback(() => readLiked()[commentId] === true, [commentId]),
    () => false,
  )

  const liked = storedLiked || justLiked

  const like = async () => {
    if (liked || pending) return
    setPending(true)
    // optimistic — bump the count now, reconcile with the server below
    setJustLiked(true)
    setLikes((n) => n + 1)
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, { method: 'POST' })
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      const data = await res.json()
      if (typeof data?.likes === 'number') setLikes(data.likes)
      rememberLiked(commentId)
    } catch {
      // roll back so the button can be tried again
      setJustLiked(false)
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
          ? `Liked, ${likes} ${likes === 1 ? 'like' : 'likes'}`
          : 'Like this comment'
      }
    >
      <Heart />
      <span className="comment-like-count">{likes}</span>
    </button>
  )
}
