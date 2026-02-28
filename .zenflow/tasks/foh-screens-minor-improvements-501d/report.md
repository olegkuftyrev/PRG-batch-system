# Implementation Report — FOH Screens Minor Improvements

## Card height reduction (CallFoodItem.tsx)

To fit 2 rows of cards on a 1180×820 screen the following values were changed:

| Element | Original | New |
|---|---|---|
| CardHeader padding | `pb-2` (default `pt-6`) | `pt-3 pb-1` |
| Product code font size | `text-lg` | `text-base` |
| Product title font size | `text-base` | `text-sm` |
| Title top margin | `mt-2` | `mt-1` |
| CardContent bottom padding | `pb-3` | `pb-2` |
| CardContent spacing | `space-y-3` | `space-y-2` |
| Image aspect ratio | `aspect-[6/4]` (3:2) → `aspect-[2/1]` (2:1) | `aspect-[3/1]` (3:1, full image, no crop) |
| Image rendering | `object-cover` (crops) | `object-contain` (full image) |
| Batch toggle min height | `min-h-[80px]` | `min-h-[56px]` |
| CardFooter padding | `pb-4 px-4` | `pb-3 px-3` |

## What was built across the full task

### UI / FOH
- Progress bar extracted from disabled button state (no longer dimmed)
- Layout: `[!!! button] [ProgressBar/Call] [X button]` on one row
- "Quality Hold X:XX" renamed to "Almost done"
- Emergency `!!!` button: outline style, `Siren` icon
- Cancel `X` button: outline style, `CircleX` icon
- Product code: colored underline bar instead of colored box background
- FOH Section order: S1 = C2,C3,B3,F4,M1,V1,R1,R2 | S2 = CB1,CB5,C1,B1,B5,CB3 | S3 = C4,E1,E2,E3
- When item is called: toggle hidden, shows Recommended/Called lines in `min-h` container

### Drive Thru
- Custom row-based layout per section (no generic grid)
- S1 Row1: M1, R1 → `CallFoodItemWide` (50/50, horizontal layout)
- S1 Row2: V1, C3, B5 → 3-col
- S2 Row1: F4, B1, C4 → 3-col
- S2 Row2: CB3, C2, CB1 → 3-col

### BOH
- Priority tickets: red "Waiting" badge + red border, sorted to top
- Waiting side sorted oldest → newest

### Emergency Priority (`!!!`)
- Backend: `priority` boolean on tickets table, `POST /api/tickets/:id/priority`
- Frontend: `markTicketPriority()` API + socket event `ticket_priority_updated`

### Menu / Data
- 18 menu items with full ingredients, allergens, nutrition data
- CB5 (SweetFire Chicken Breast) added as new item
- All items have images in `api/public/uploads/`
- Colors: green/yellow/red per item
- Menu cards colored by item color (bg-{color}-100)
- Product info modal (Dialog) on `Info` icon click

### DB columns added
- `ingredients TEXT`, `allergens TEXT`, `nutrition TEXT` on `menu_items`
- `priority BOOLEAN` on `tickets`
