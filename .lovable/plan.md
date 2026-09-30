# Conveyor Monitoring System

## Goal
Build a responsive paint-line operations dashboard from the supplied PRD, using the supplied JSGI maintenance interface as the visual reference for the dark navigation and slim utility header.

## First release
- Replace the blank page with the working dashboard at `/`.
- Add a collapsible dark sidebar for Dashboard, Live Line, Station View, Cabin History, Exceptions, Reports, Master Data, and Users.
- Add the slim top header with sidebar control, local plant date/time, alerts, and administrator profile.
- Show live operational summaries for cabins on line, processing, waiting, delayed, and completed today.
- Build a five-area conveyor view for PTED, Sanding, Sealing, Topcoat, and Touch-up, including station load, targets, status colors, and animated cabin movement.
- Add always-visible cabin search by serial, color, model, or lot; selecting a result highlights its location and opens its timeline.
- Add station queue, recent scan activity, and bottleneck panels with useful demo data matching the PRD.
- Make navigation and dashboard interactions work in the prototype, with large tablet-friendly controls and reduced-motion support.

## Visual direction
- Preserve the reference’s deep navy sidebar, cool blue iconography, compact uppercase section labels, pale workspace, and restrained blue accents.
- Use a dense industrial operations layout with crisp borders, small radii, clear status colors, and high information visibility.
- Keep desktop and tablet layouts usable; on smaller screens, the sidebar becomes an overlay and the main panels stack.

## Technical details
- Use the existing TanStack Start application and semantic Tailwind design tokens.
- Use in-app demo data and client-side interactions for this first interface build; live RFID/barcode ingestion, persistent records, authentication, and exports require the production data connection and are not included in this visual release.
- Add route-specific title, description, Open Graph, and Twitter metadata.
- Verify the finished dashboard in desktop and tablet-sized browser views.
