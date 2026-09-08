/**
 * TitleBar.tsx
 *
 * Purpose:
 *   Displays application identity at the top of the page.
 *
 * Architecture:
 *   The title bar is deliberately separate from the persistent working header.
 *   It participates in normal document scrolling and therefore disappears as
 *   the user moves down into the workspace.
 *
 *   Network-level controls do not belong here; they live in the sticky page
 *   header below.
 *
 * Change this file when:
 *   - application-title presentation changes;
 *   - subtitle, version, or other application-identity information is added;
 *   - title-bar-specific presentation behaviour changes.
 */

import './TitleBar.css'

interface TitleBarProps {
  onAbout: () => void
}

export function TitleBar({ onAbout }: TitleBarProps) {
  return (
    <header className="title-bar">
      <h1>Starfield Outpost Network</h1>
      <button
        type="button"
        className="title-bar__about"
        onClick={onAbout}
      >
        About
      </button>
    </header>
  )
}
