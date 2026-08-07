import Link from 'next/link'
import React from 'react'

import CaseStudyGrid, { type CaseStudyGridPost } from '@/components/CaseStudyGrid'
import ImageSlot from '@/components/ImageSlot'
import { ArrowRight } from '@/components/icons'
import { reveal } from '@/lib/reveal'

// Shown until case studies are published — mirrors the real card anatomy so the
// section keeps its shape. Delete once the collection has content.
const placeholders = [
  {
    label: 'Project 01 cover',
    spec: 'Composed cover, 1600 × 1200. Site screenshot on a background, not a raw capture.',
    tag: 'Project',
    year: '2026',
    roles: 'Design & build',
    title: 'Project one',
  },
  {
    label: 'Project 02 cover',
    spec: 'Same canvas and same margins as the others. The set has to read as one system.',
    tag: 'Project',
    year: '2026',
    roles: 'Design & build',
    title: 'Project two',
  },
  {
    label: 'Project 03 cover',
    spec: 'Vary the background, never the framing. That is what keeps the row even.',
    tag: 'Project',
    year: '2026',
    roles: 'Identity & site',
    title: 'Project three',
  },
]

/** Selected case studies on the home page. */
export const WorkShowcaseSection: React.FC<{ posts: CaseStudyGridPost[] }> = ({ posts }) => (
  <section className="section section-dark">
    <div className="container">
      <div className="section-head" {...reveal}>
        <div>
          <span className="eyebrow">Selected work</span>
          <h2>Recent projects.</h2>
        </div>

        <Link href="/work" className="link-arrow">
          All work
          <ArrowRight />
        </Link>
      </div>

      {posts.length > 0 ? (
        <CaseStudyGrid posts={posts} />
      ) : (
        <div className="gallery-grid reveal-group">
          {placeholders.map((item) => (
            <div key={item.label} className="gallery-item" {...reveal}>
              <div className="work-card">
                <ImageSlot label={item.label} spec={item.spec} ratio="4 / 3" />
                <div className="work-card-meta">
                  <div className="work-card-line">
                    <span className="work-card-tag">{item.tag}</span>
                    <span className="work-card-year">{item.year}</span>
                  </div>
                  <h3 className="work-card-title">{item.title}</h3>
                  <p className="work-card-info">{item.roles}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </section>
)

export default WorkShowcaseSection
