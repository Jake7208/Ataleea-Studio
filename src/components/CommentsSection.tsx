import React from 'react'
import { getPayload } from 'payload'

import config from '@/payload.config'
import CommentForm, { type CommentTarget } from '@/components/CommentForm'
import CommentLikeButton from '@/components/CommentLikeButton'

type Props = {
  postId: string
  postType: CommentTarget
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

/** Approved comments for a post, oldest first, followed by the submission form. */
export default async function CommentsSection({ postId, postType }: Props) {
  const payload = await getPayload({ config: await config })
  const { docs, totalDocs } = await payload.find({
    collection: 'comments',
    where: {
      and: [
        { 'post.relationTo': { equals: postType } },
        { 'post.value': { equals: postId } },
        // the Local API bypasses access control, so the public filter is applied by hand
        { approved: { equals: true } },
      ],
    },
    sort: 'createdAt',
    depth: 0,
    limit: 200,
    select: { name: true, body: true, createdAt: true, likes: true },
  })

  return (
    <section className="section container">
      <div className="section-head">
        <h2>
          {totalDocs > 0 ? `${totalDocs} ${totalDocs === 1 ? 'comment' : 'comments'}` : 'Comments'}
        </h2>
      </div>

      <div className="comments">
        {docs.length > 0 ? (
          <ol className="comment-list">
            {docs.map((comment) => (
              <li key={comment.id} className="comment">
                <div className="comment-head">
                  <span className="comment-name">{comment.name}</span>
                  {comment.createdAt && (
                    <time dateTime={comment.createdAt}> · {formatDate(comment.createdAt)}</time>
                  )}
                </div>
                <p className="comment-body">{comment.body}</p>
                <div className="comment-foot">
                  <CommentLikeButton commentId={comment.id} initialLikes={comment.likes ?? 0} />
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="comments-empty">No comments yet — be the first to leave one.</p>
        )}

        <CommentForm postId={postId} postType={postType} />
      </div>
    </section>
  )
}
