import type { TraceLine } from "../../shared/types"

// RD-103: the run's timeline on the ticket page. Verify runs hidden tests
// against this contract, rendering the component with react-dom/server
// (renderToStaticMarkup), with no browser and no router.
//
// RunTimeline({ lines }: { lines: TraceLine[] })   (a named export)
//   - Renders one list item (<li>) per trace line, in order, inside one
//     list.
//   - Each item shows the step number, the tool name on tool steps, the
//     line's summary, and the duration as "<n>ms". Task and stage lines
//     (RD-403, RD-404) show the same way: their summary says what happened.
//   - An empty run (no lines) renders "No steps yet" and no list items.
//   - Text from the trace renders as text, never as HTML.
//
// Until RD-103 it shows a placeholder.

export function RunTimeline({ lines }: { lines: TraceLine[] }) {
  void lines
  return <p className="empty">No timeline yet (RD-103)</p>
}
