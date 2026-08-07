import { getPayload } from 'payload'
import config from '../src/payload.config'

const slug = 'the-return-on-design'

const payload = await getPayload({ config })

// Clean up existing
const existing = await payload.find({
  collection: 'blog',
  where: { slug: { equals: slug } },
  limit: 1,
  draft: true,
})

for (const doc of existing.docs) {
  await payload.delete({ collection: 'blog', id: doc.id })
}

const body = {
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: "In the modern digital economy, your website is the primary storefront for your brand. When prospective customers arrive, they form an opinion about your business in as little as 50 milliseconds, which is faster than the blink of an eye. According to the Stanford Web Credibility Project, ",
            version: 1
          },
          {
            type: 'link',
            fields: {
              url: 'https://credibility.stanford.edu/',
              newTab: true
            },
            children: [
              {
                type: 'text',
                text: "75 percent of consumers",
                version: 1
              }
            ],
            version: 1
          },
          {
            type: 'text',
            text: " admit they judge a company's credibility based solely on its website design. A template-built site that looks identical to your competitors tells your prospective clients that your operations are generic, whereas custom design immediately establishes authority.",
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: "But premium design is not just a visual vanity project. It is a strategic business asset that directly impacts your bottom line. Independent research from Forrester shows that a well-designed user interface can increase a website's conversion rate by up to 200 percent. Furthermore, a superior, frictionless user experience can yield conversion gains of up to ",
            version: 1
          },
          {
            type: 'link',
            fields: {
              url: 'https://www.forrester.com/',
              newTab: true
            },
            children: [
              {
                type: 'text',
                text: "400 percent",
                version: 1
              }
            ],
            version: 1
          },
          {
            type: 'text',
            text: ". Forrester also reported that every dollar invested in user experience can return up to one hundred dollars, representing an exponential return on investment. Design is the bridge that transforms casual interest into structured sales inquiries.",
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: "To capture this value, forward-thinking businesses are leaving bloated drag-and-drop page builders behind. By partnering with a studio that engineers custom headless stacks, you ensure your platform loads instantly, moves fluidly, and guides users with clear interaction patterns. This combination of lightning speed and custom visual storytelling builds deep trust with visitors, leading to higher engagement and more pipeline growth. Your digital presence is too valuable to leave to chance.",
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1
      }
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1
  }
}

// Topics the post is filed under. Tags are subjects now — what the post *is*
// lives on the post itself, in `kind`.
const topicRes = await payload.find({
  collection: 'tags',
  where: { name: { equals: 'Digital Strategy' } },
  limit: 1,
})
let topicId = topicRes.docs[0]?.id
if (!topicId) {
  const newTag = await payload.create({
    collection: 'tags',
    data: { name: 'Digital Strategy' },
  })
  topicId = newTag.id
}

// Get some media from database to use as mainMedia cover (reuse existing media from seed or library)
const mediaRes = await payload.find({
  collection: 'media',
  limit: 1,
})
const mediaId = mediaRes.docs[0]?.id || null

await payload.create({
  collection: 'blog',
  data: {
    title: 'The Return on Design: Why Settle for Templates When Custom Engineering Drives 400% Higher Conversions',
    slug,
    publishedAt: new Date().toISOString(),
    excerpt: 'Every dollar invested in superior user experience yields up to a hundred dollars in returns. Discover how custom digital design transforms raw visitor traffic into high-value customer inquiries.',
    author: 'Ataleea Studio',
    // @ts-expect-error: Lexical JSON structure is cast to unknown to avoid deep schema typing mismatch in database seed scripts
    body: body,
    kind: 'article',
    tags: [topicId],
    mainMedia: mediaId,
    _status: 'published',
  }
})

console.log('Successfully seeded blog post: /newsroom/' + slug)
process.exit(0)
