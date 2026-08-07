import { getPayload } from 'payload'
import config from '../src/payload.config'

const slug = 'the-millisecond-cost'

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
            text: "When a prospective client visits your creative studio's website, they aren't just evaluating your design aesthetics; they are experiencing your digital capabilities first-hand. Unfortunately, many studios build their portfolios on bloated page builders, sacrificing performance. This results in slow load sequences that act as a silent killer of new project inquiries.",
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
            text: "A joint study by Google and Deloitte, titled ",
            version: 1
          },
          {
            type: 'text',
            text: "Milliseconds Make Millions",
            mode: 'normal',
            style: 'font-style: italic;',
            version: 1
          },
          {
            type: 'text',
            text: ", proved the direct relationship between site speed and conversion rates. The research showed that even a minor ",
            version: 1
          },
          {
            type: 'text',
            text: "0.1-second speed improvement",
            mode: 'normal',
            style: 'font-weight: bold;',
            version: 1
          },
          {
            type: 'text',
            text: " led to an ",
            version: 1
          },
          {
            type: 'text',
            text: "8.4% increase in conversion rates",
            mode: 'normal',
            style: 'font-weight: bold;',
            version: 1
          },
          {
            type: 'text',
            text: " and an 8.3% bounce rate improvement on informational pages. You can read the full research details on ",
            version: 1
          },
          {
            type: 'link',
            fields: {
              url: 'https://web.dev/articles/milliseconds-make-millions',
              newTab: true
            },
            children: [
              {
                type: 'text',
                text: "Google's web.dev case study",
                version: 1
              }
            ],
            version: 1
          },
          {
            type: 'text',
            text: ".",
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
            text: "By replacing template monoliths with custom headless stacks—using Next.js for high-fidelity interactive animations and Payload CMS for backend content management—you can deliver perfect 100/100 performance scores and 0ms Total Blocking Time. Fast, fluid layouts prove your technical mastery and build immediate trust.",
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
  where: { name: { equals: 'Web Performance' } },
  limit: 1,
})
let topicId = topicRes.docs[0]?.id
if (!topicId) {
  const newTag = await payload.create({
    collection: 'tags',
    data: { name: 'Web Performance' },
  })
  topicId = newTag.id
}

await payload.create({
  collection: 'blog',
  data: {
    title: 'The Millisecond Cost: Why Speed is Your Creative Studio’s Silent Conversion Killer',
    slug,
    publishedAt: new Date().toISOString(),
    excerpt: 'A 0.1-second improvement in mobile load speeds can increase conversion rates by over 8%. Here is why premium studios leave generic page builders behind.',
    author: 'Ataleea Studio',
    // @ts-expect-error: Lexical JSON structure is cast to unknown to avoid deep schema typing mismatch in database seed scripts
    body: body,
    kind: 'article',
    tags: [topicId],
    _status: 'published',
  }
})

console.log('Successfully seeded blog post: /newsroom/' + slug)
process.exit(0)
