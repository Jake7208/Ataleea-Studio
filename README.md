# Portfolio Site Template (Payload CMS + Next.js)

An **unstyled, data-blank** starter extracted from the original portfolio site. All the
backend plumbing and page structure is wired up; the design and content are yours to add.

## What's included

| Piece | Where | Notes |
| --- | --- | --- |
| Case studies | `collections/CaseStudies.ts` → `/work`, `/work/[slug]` | Drafts, tags, credits, text + media blocks, tag filter bar |
| Blog | `collections/Blog.ts` → `/blog`, `/blog/[slug]` | Drafts, Lexical rich text, tags, excerpts |
| Gallery | `collections/Media.ts` → `/gallery` | Tag-filtered grid of tagged uploads + lightbox |
| Testimonials | `collections/Testimonials.ts` → home page | Drag-to-order in admin, featured flag |
| Comments | `collections/Comments.ts` | On posts + case studies; moderation, likes, ISR revalidation |
| Contact form | `collections/ContactSubmissions.ts` → `/contact` | Saves to DB, emails you via Resend |
| Admin panel | `/admin` | Payload 3, MongoDB, optional R2/S3 media storage |

Deliberately **not** included (add per site): CSS beyond a tiny reset, fonts, animations
(the original's GSAP/Lenis layer), theme toggle, preloader, sounds.

## Starting a new site

1. **Copy this folder** to a new repo.
2. **Fill in [`src/site.config.ts`](src/site.config.ts)** — name, description, author, email,
   socials, nav. The layout, header, footer and collection defaults all read from it.
3. **Environment**: `cp .env.example .env`, set `DATABASE_URL` and `PAYLOAD_SECRET`
   (Resend + R2 vars are optional — without them email logs to console and uploads
   store locally).
4. `pnpm install && pnpm dev`, then visit `http://localhost:3000/admin` to create the
   first admin user.
5. **Replace placeholder copy** — grep for `ALL_CAPS_TOKENS`:
   ```sh
   grep -rn "HERO_\|ABOUT_\|FACT_\|FOOTER_CTA\|_PAGE_" src
   ```
6. **Style it**: `src/app/(frontend)/styles.css` is nearly empty; the markup already
   carries class hooks (listed at the top of that file). Replace `src/app/icon.svg`
   with your favicon.

## Things to know

- **Types**: `src/payload-types.ts` is generated. After changing any collection, run
  `pnpm generate:types` (and `pnpm generate:importmap` if you add admin components).
- **Rendering**: public pages are static with `revalidate = 60`; comment approval
  triggers an immediate revalidate of the affected post. The gallery renders
  per-request because of its `?tag=` filter.
- **Comment likes** use a custom endpoint (`POST /api/comments/:id/like`) and
  localStorage to prevent double-likes.
- **Gallery membership**: an upload appears in the gallery only if it has at least one
  tag; the `featured` checkbox marks a hero photo if you build one into the home page.
- **Docker**: `docker-compose up` gives you a local MongoDB + the dev server (set
  `DATABASE_URL=mongodb://mongo/your-db-name`). The `Dockerfile` needs
  `output: 'standalone'` in `next.config.ts` if you deploy with it.
- **Tests**: the original project's Vitest/Playwright setup wasn't carried over —
  add your own if the new site needs it.
