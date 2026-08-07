/**
 * Refuses to build into a .next directory that a dev server is using.
 *
 * `next dev` and `next build` write to the same place, and they will happily do
 * it at the same time. What comes out is a build that reports success and then
 * serves HTML pointing at asset hashes that no longer exist: every stylesheet
 * and script 404s, and the site renders as unstyled markup. Nothing in the build
 * output says a word about it, which is what makes it worth a guard — the
 * failure looks like a bug in the site rather than a collision over a folder.
 *
 * `.next/dev/lock` is written by the dev server and is the cheapest reliable
 * signal that one is running. It only ever exists locally: CI and the Docker
 * build start from a clean checkout, so this never fires there.
 *
 * Two ways past it, depending on what you want:
 *   npm run build:local     build somewhere else and leave the dev server alone
 *   ALLOW_DEV_LOCK=1        proceed anyway, e.g. after a crash left a stale lock
 */
import { existsSync } from 'node:fs'
import path from 'node:path'

const distDir = process.env.NEXT_DIST_DIR || '.next'
const lock = path.join(process.cwd(), distDir, 'dev', 'lock')

if (existsSync(lock) && !process.env.ALLOW_DEV_LOCK) {
  console.error(
    [
      '',
      `  A dev server is using ${distDir}/.`,
      '',
      `  Building into it now would overwrite the assets that server is`,
      `  serving, and the built site would 404 its own CSS and JS without`,
      `  saying so.`,
      '',
      '  Stop the dev server and run this again, or:',
      '',
      '    npm run build:local     build into .next-local instead',
      '    ALLOW_DEV_LOCK=1 ...    ignore this (stale lock after a crash)',
      '',
    ].join('\n'),
  )
  process.exit(1)
}
