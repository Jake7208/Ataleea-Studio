import type { CollectionConfig, PayloadRequest } from 'payload'
import { APIError } from 'payload'
import { revalidatePath } from 'next/cache'
import { createHash } from 'crypto'

import { assertHuman } from '@/lib/turnstile'

/** How many fingerprints a single comment keeps before the oldest fall off. */
const MAX_VOTERS = 500

/**
 * Identifies a liker without storing anything identifying: the address is
 * hashed with the comment id and the app secret, so the value is useless
 * outside this one comment and can't be reversed into an IP.
 *
 * Best-effort by nature — a new address is a new vote. It exists to stop the
 * endpoint being looped, not to be an identity system. The button also tracks
 * liked comments in localStorage, which covers the ordinary case.
 */
const voterFingerprint = (req: PayloadRequest, commentId: string): string => {
  const ip =
    req.headers?.get('cf-connecting-ip') ||
    req.headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  return createHash('sha256')
    .update(`${ip}:${commentId}:${process.env.PAYLOAD_SECRET ?? ''}`)
    .digest('hex')
}

type CommentTarget = 'blog' | 'case-studies'

/** Where each commentable collection lives on the front end. */
const SECTION_FOR: Record<CommentTarget, string> = {
  blog: 'blog',
  'case-studies': 'work',
}

type PostRelation = {
  relationTo: CommentTarget
  value: string | { slug?: string | null }
}

/**
 * Rebuilds the post page so an approved (or removed) comment shows up immediately
 * instead of waiting out the page's 60s ISR window.
 */
const revalidatePost = async (post: unknown, req: PayloadRequest): Promise<void> => {
  const rel = post as PostRelation | undefined
  const section = rel?.relationTo ? SECTION_FOR[rel.relationTo] : undefined
  if (!rel || !section) return

  try {
    // `value` is a bare id at depth 0 and a populated doc at higher depths
    const slug =
      typeof rel.value === 'object'
        ? rel.value?.slug
        : (
            await req.payload.findByID({
              collection: rel.relationTo,
              id: rel.value,
              depth: 0,
              req,
            })
          )?.slug

    if (slug) revalidatePath(`/${section}/${slug}`)
  } catch (err) {
    // the comment is already written — never fail the request over a stale cache
    req.payload.logger.error({ err }, 'Failed to revalidate post after comment change')
  }
}

export const Comments: CollectionConfig = {
  slug: 'comments',
  labels: {
    singular: 'Comment',
    plural: 'Comments',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'post', 'approved', 'createdAt'],
    group: 'Inbox',
  },
  access: {
    // anyone can leave a comment, but only approved ones are readable publicly
    create: () => true,
    read: ({ req }) => {
      if (req.user) return true
      return { approved: { equals: true } }
    },
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    // create is open to the public. Moderation keeps spam off the page, but
    // nothing kept it out of the admin queue until this.
    beforeValidate: [
      async ({ operation, req }) => {
        if (operation === 'create') await assertHuman(req)
      },
    ],
    // only the approved state is visible on the page, so a brand-new (unapproved)
    // comment doesn't need to bust the cache — approving or unapproving one does.
    // Likes flip `skipRevalidate` on: they change often and are reconciled on the
    // client, so there's no reason to rebuild the page on every one.
    afterChange: [
      async ({ doc, previousDoc, req, context }) => {
        if (context?.skipRevalidate) return
        if (!doc?.approved && !previousDoc?.approved) return
        await revalidatePost(doc?.post, req)
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        if (!doc?.approved) return
        await revalidatePost(doc?.post, req)
      },
    ],
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: ['blog', 'case-studies'],
      required: true,
      index: true,
      admin: {
        description: 'The journal post or case study this comment belongs to.',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 80,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      // reading is restricted to logged-in users so addresses never leak through
      // the public /api/comments response
      access: {
        read: ({ req }) => Boolean(req.user),
      },
      admin: {
        description: 'Never shown publicly — only used to identify the commenter.',
      },
    },
    {
      name: 'body',
      type: 'textarea',
      label: 'Comment',
      required: true,
      maxLength: 2000,
    },
    {
      name: 'approved',
      type: 'checkbox',
      defaultValue: false,
      // denying create/update to the public keeps a commenter from approving their
      // own comment by posting `approved: true` straight to the REST API
      access: {
        create: ({ req }) => Boolean(req.user),
        update: ({ req }) => Boolean(req.user),
      },
      admin: {
        position: 'sidebar',
        description: 'Comments stay hidden until this is checked.',
      },
    },
    {
      name: 'likes',
      type: 'number',
      defaultValue: 0,
      min: 0,
      // bumped through the /:id/like endpoint below, which overrides access; the
      // public can't write it directly (collection update is admin-only)
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'How many readers liked this comment.',
      },
    },
    {
      name: 'voters',
      type: 'json',
      defaultValue: [],
      // Salted one-way hashes, never raw addresses — see voterFingerprint below.
      // Admin-only on every operation so the list can't be read back or seeded
      // through the public API; the like endpoint writes it with overrideAccess.
      access: {
        read: ({ req }) => Boolean(req.user),
        create: ({ req }) => Boolean(req.user),
        update: ({ req }) => Boolean(req.user),
      },
      admin: {
        hidden: true,
      },
    },
  ],
  endpoints: [
    // Public "like" — anyone can add one to an approved comment. Mounted at
    // POST /api/comments/:id/like. Access is overridden here because the
    // collection's update is admin-only, and the like never touches any other field.
    {
      path: '/:id/like',
      method: 'post',
      handler: async (req) => {
        const id = req.routeParams?.id as string | undefined
        if (!id) throw new APIError('Missing comment id', 400)

        let comment
        try {
          comment = await req.payload.findByID({
            collection: 'comments',
            id,
            depth: 0,
            overrideAccess: true,
            req,
          })
        } catch {
          comment = null
        }

        // only approved comments are likeable — mirrors what's publicly visible,
        // so an unapproved comment can't be probed through this endpoint
        if (!comment || !comment.approved) {
          throw new APIError('Comment not found', 404)
        }

        const current = typeof comment.likes === 'number' ? comment.likes : 0
        const voters: string[] = Array.isArray(comment.voters) ? (comment.voters as string[]) : []
        const fingerprint = voterFingerprint(req, id)

        // Already counted. Answer with the real total rather than an error — the
        // button only wants the number, and a 4xx here would make it roll back a
        // like that did land.
        if (voters.includes(fingerprint)) {
          return Response.json({ likes: current, counted: false })
        }

        const likes = current + 1

        await req.payload.update({
          collection: 'comments',
          id,
          // capped so a comment that gets hammered can't grow an unbounded field
          data: { likes, voters: [...voters, fingerprint].slice(-MAX_VOTERS) },
          depth: 0,
          overrideAccess: true,
          context: { skipRevalidate: true },
          req,
        })

        return Response.json({ likes, counted: true })
      },
    },
  ],
}
