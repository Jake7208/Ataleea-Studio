import Link from 'next/link'
import React from 'react'

import CaseStudyGrid, { type CaseStudyGridPost } from '@/components/CaseStudyGrid'
import ImageSlot from '@/components/ImageSlot'
import { ArrowRight } from '@/components/icons'

// Shown until case studies are published — mirrors the real card anatomy so the
// section keeps its shape. Delete once the collection has content.
const placeholders = [
  {
    label: 'Project 01 cover',
    spec: 'Finished commercial build, exterior. Wide, straight on.',
    meta: 'Commercial build, 2026',
    title: 'Project one',
  },
  {
    label: 'Project 02 cover',
    spec: 'Structural or trade work mid-build. Show the craft.',
    meta: 'Structural, 2026',
    title: 'Project two',
  },
  {
    label: 'Project 03 cover',
    spec: 'Interior or fit-out, finished. Warm, well lit.',
    meta: 'Interiors, 2026',
    title: 'Project three',
  },
]

/** Selected case studies on the home page. */
export const WorkShowcaseSection: React.FC<{ posts: CaseStudyGridPost[] }> = ({ posts }) => (
  <section className="section section-alt">
    <div className="container">
      <div className="section-head" data-reveal>
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
            <div key={item.label} className="gallery-item" data-reveal>
              <ImageSlot label={item.label} spec={item.spec} ratio="3 / 2" />
              <div className="work-card-meta">
                <p className="work-card-info">{item.meta}</p>
                <h3 className="work-card-title">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </section>
)

export default WorkShowcaseSection
