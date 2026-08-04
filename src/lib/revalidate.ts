import { revalidatePath } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

/**
 * Rebuilds the pages a collection feeds as soon as something is published,
 * rather than leaving the admin looking broken for the 60s the pages' ISR
 * window would otherwise take.
 *
 * `paths` are the fixed pages that list the collection. `detail` builds the
 * document's own page from its slug, for collections that have one — passing a
 * doc with no slug (an unsaved draft, say) just skips it.
 */
export const revalidateFor = ({
  paths,
  detail,
}: {
  paths: string[]
  detail?: (slug: string) => string
}) => {
  const run = (doc: unknown, previous?: unknown) => {
    for (const path of paths) revalidatePath(path)

    if (!detail) return
    // both the new slug and the old one: renaming a published document leaves
    // the previous URL cached and otherwise stale
    for (const candidate of [doc, previous]) {
      const slug = (candidate as { slug?: unknown } | undefined)?.slug
      if (typeof slug === 'string' && slug) revalidatePath(detail(slug))
    }
  }

  const afterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req, context }) => {
    if (context?.skipRevalidate) return
    try {
      run(doc, previousDoc)
    } catch (err) {
      // the document is already saved — a stale cache is not worth failing over
      req.payload.logger.error({ err }, 'Failed to revalidate after a content change')
    }
  }

  const afterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
    try {
      run(doc)
    } catch (err) {
      req.payload.logger.error({ err }, 'Failed to revalidate after a content delete')
    }
  }

  return { afterChange: [afterChange], afterDelete: [afterDelete] }
}

/**
 * Same idea for a global, which has no slug and no delete — swapping the hero
 * image should show up on the page immediately, not a minute later.
 */
export const revalidateGlobalFor = ({ paths }: { paths: string[] }) => {
  const afterChange: GlobalAfterChangeHook = async ({ req, context }) => {
    if (context?.skipRevalidate) return
    try {
      for (const path of paths) revalidatePath(path)
    } catch (err) {
      req.payload.logger.error({ err }, 'Failed to revalidate after a global change')
    }
  }

  return { afterChange: [afterChange] }
}
