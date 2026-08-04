import React from 'react'

/**
 * Fixed strip shown only while draft mode is on.
 *
 * Draft mode is a cookie, so it follows you around the whole site until it is
 * switched off — without a marker it is genuinely easy to check a draft, click
 * through to the home page, and read unpublished work as though it were live.
 * The exit link is the only reliable way back out.
 */
export default function PreviewBanner({ path }: { path?: string }) {
  const href = path
    ? `/next/exit-preview?path=${encodeURIComponent(path)}`
    : '/next/exit-preview'

  return (
    <div className="preview-banner" role="status">
      <span>
        <strong>Draft preview.</strong> You are seeing unpublished content — visitors are not.
      </span>
      {/* a plain link, so leaving works even if JS never loads */}
      <a href={href}>Exit preview</a>
    </div>
  )
}
