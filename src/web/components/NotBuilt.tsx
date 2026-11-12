import type { ReactNode } from "react"

// A placeholder where a ticket's work will appear. Provided.

export function NotBuilt({ ticket, children }: { ticket: string; children?: ReactNode }) {
  return (
    <div className="not-built">
      <strong>Not built yet: {ticket}</strong>
      {children ? <div>{children}</div> : null}
    </div>
  )
}
