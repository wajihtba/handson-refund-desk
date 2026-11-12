import { NavLink, Route, Routes } from "react-router"

import { ApprovalsPage } from "./pages/Approvals"
import { InboxPage } from "./pages/Inbox"
import { StatusRoute } from "./pages/StatusRoute"
import { TicketPage } from "./pages/Ticket"

// Layout and routes. Provided.
//
//   /                 the inbox
//   /tickets/:id      one ticket: message, decision, reply, timeline
//   /approvals        the support lead's queue (RD-502)
//   /status/:id       the customer's refund status page (RD-702)

export function App() {
  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">HomeShop · Refund Desk</span>
        <nav>
          <NavLink to="/" end>
            Inbox
          </NavLink>
          <NavLink to="/approvals">Approvals</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<InboxPage />} />
          <Route path="/tickets/:id" element={<TicketPage />} />
          <Route path="/approvals" element={<ApprovalsPage />} />
          <Route path="/status/:id" element={<StatusRoute />} />
          <Route path="*" element={<p className="empty">No page here.</p>} />
        </Routes>
      </main>
    </div>
  )
}
