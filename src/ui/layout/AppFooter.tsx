/**
 * AppFooter.tsx
 *
 * Purpose:
 *   Provides a low-priority application region for utilities, status
 *   information, diagnostics, and metadata that should remain accessible
 *   without competing with the main outpost workspace.
 *
 * Architecture:
 *   AppFooter is a layout component rather than a feature-specific component.
 *   It does not know what controls or messages it contains; App.tsx supplies
 *   those as children.
 *
 *   This keeps infrastructure such as reference-data controls separate from
 *   the character, outpost, manufacturing, and cargo editing interfaces.
 *
 * Change this file when:
 *   - the semantic structure of the application footer changes;
 *   - distinct footer regions or groups are introduced;
 *   - common footer behaviour is added.
 */

import type { ReactNode } from 'react'

import './AppFooter.css'

interface AppFooterProps {
  children: ReactNode
}

export function AppFooter({
  children,
}: AppFooterProps) {
  return (
    <footer className="app-footer">
      {children}
    </footer>
  )
}