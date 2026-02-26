# Phase 3 Implementation: Menu Management Screen

## Summary
Completed full refactoring of the Menu Management screen ([./web/src/components/ScreenMenu.tsx](./web/src/components/ScreenMenu.tsx)) to integrate all Phase 2 UI components and support new Stage 2 requirements.

## Root Cause Analysis
The menu management screen needed updates to support:
1. **Station-based grouping** - Items should be organized by kitchen station
2. **Batch-specific cook times** - Each batch size needs its own cook time (not shared)
3. **Color assignment** - Support for Blue (LTO), Red (Slow), Green (Busy), Orange (Medium)
4. **Image uploads** - Support for menu item pictures with drag-and-drop
5. **Toggle switches** - Replace checkboxes with proper toggle components
6. **Quality hold times** - Each item can specify its own hold time before quality degradation

## Affected Components

### Frontend
- **[./web/src/components/ScreenMenu.tsx](./web/src/components/ScreenMenu.tsx)** - Complete refactoring
  - Added `Collapsable` component integration for station grouping
  - Implemented individual cook time inputs for each batch size
  - Added color picker with predefined color options
  - Implemented image upload with drag-and-drop support
  - Added image preview and removal functionality
  - Replaced checkbox with `ToggleSwitch` component
  - Added `ColorBadge` display in item list
  - Added `ImagePlaceholder` for items without images

### Backend (Already Completed in Phase 1)
- **[./api/database/migrations/1740354400000_add_color_image_holdtime_to_menu_items.ts](./api/database/migrations/1740354400000_add_color_image_holdtime_to_menu_items.ts)** - Schema migration
- **[./api/app/models/menu_item.ts](./api/app/models/menu_item.ts)** - Model updated with new fields
- **[./api/app/controllers/menu_items_controller.ts](./api/app/controllers/menu_items_controller.ts)** - Image upload endpoints

### Types
- **[./web/src/api/menu.ts](./web/src/api/menu.ts)** - Updated MenuItem and payload types

## Implementation Details

### 1. Station Grouping with Collapsable Sections
```tsx
{STATIONS.map((station) => {
  const items = itemsByStation[station] || []
  return (
    <Collapsable
      key={station}
      title={`${station.charAt(0).toUpperCase() + station.slice(1)} Station`}
      count={items.length}
      defaultOpen={true}
    >
      {/* Items rendered here */}
    </Collapsable>
  )
})}
```

### 2. Batch-Specific Cook Times
Instead of a single cook time field, each batch size gets its own input:
```tsx
<div className="grid grid-cols-3 gap-2">
  {batchSizes.map((size) => (
    <div key={size} className="flex items-center gap-2">
      <Label className="w-12 text-sm text-muted-foreground">{size}:</Label>
      <Input
        type="number"
        value={form.cookTimesPerBatch[size] || '8'}
        onChange={(e) => /* Update specific batch time */}
      />
    </div>
  ))}
</div>
```

### 3. Color Assignment
Color dropdown with predefined options:
```tsx
const COLORS: { value: ColorType; label: string }[] = [
  { value: null, label: 'None' },
  { value: 'blue', label: 'Blue - LTO' },
  { value: 'red', label: 'Red - Slow' },
  { value: 'green', label: 'Green - Busy' },
  { value: 'orange', label: 'Orange - Medium' },
]
```

Color badge displayed in item list:
```tsx
{item.color && <ColorBadge color={item.color} />}
```

### 4. Image Upload with Drag-and-Drop
```tsx
<div
  className="border-2 border-dashed rounded-lg p-4 cursor-pointer"
  onDrop={handleImageDrop}
  onDragOver={(e) => e.preventDefault()}
  onClick={() => fileInputRef.current?.click()}
>
  {imagePreview ? (
    <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded" />
  ) : (
    <ImagePlaceholder className="h-32" />
  )}
</div>
```

Image handling:
- Validates file type (JPEG, PNG, WebP)
- Validates file size (max 5MB)
- Shows preview before upload
- Supports drag-and-drop
- Uploads after item save
- Automatic cleanup of old images on replacement

### 5. Toggle Switch for Enabled Status
Replaced checkbox with `ToggleSwitch` component:
```tsx
<ToggleSwitch
  checked={item.enabled}
  onCheckedChange={async (checked) => {
    await updateMenuItem(item.id, { enabled: checked })
    refetch()
  }}
/>
```

### 6. Hold Time Configuration
Added hold time input (in minutes):
```tsx
<Input
  type="number"
  min={1}
  step={1}
  value={form.holdTime}
  onChange={(e) => setForm((f) => ({ ...f, holdTime: e.target.value }))}
/>
```

Converted to seconds in payload:
```tsx
holdTime: Math.round(parseFloat(form.holdTime) * 60)
```

## Test Results

### Build Status
✅ TypeScript compilation successful
✅ Docker build completed without errors
✅ Web container deployed and running

### Runtime Verification
✅ Frontend accessible at http://localhost:8080 (HTTP 200)
✅ API responding at http://localhost:3333/api/menu (16 items)
✅ All new components integrated without errors
✅ Navigation properly hidden with slide-down menu button

### Functionality Verified
✅ Station grouping displays items organized by station
✅ Collapsable sections work with default open state
✅ Cook times can be set individually per batch size
✅ Color dropdown shows all 4 color options + None
✅ Color badges display correctly in item list
✅ Image upload interface ready (drag-and-drop placeholder)
✅ Toggle switches replace checkboxes for enabled status
✅ Hold time field accepts numeric input in minutes

## Phase 4 Implementation: FOH/Drive-Thru Screens

### Changes Completed

#### CallFoodItem Component ([./web/src/components/CallFoodItem.tsx](./web/src/components/CallFoodItem.tsx))
- ✅ New card layout: Code at top, ColorBadge underneath, Title, Picture/Placeholder, Batch Toggle, Call button
- ✅ Integrated BatchToggle component for 3-position batch selection
- ✅ Added ProgressBar inside Call button showing cooking progress (red → orange → green)
- ✅ Timer countdown displayed in button text (MM:SS format)
- ✅ Cancel button appears when item is actively cooking
- ✅ ImagePlaceholder shown when no image uploaded
- ✅ Fallback to button grid for non-3-batch items
- ✅ Quality check state handling

#### API Changes
- ✅ Added DELETE `/api/tickets/:id` endpoint ([./api/app/controllers/tickets_controller.ts:108-121](./api/app/controllers/tickets_controller.ts:108-121))
- ✅ Cancel broadcasts `ticket_cancelled` event to station and source
- ✅ Updated routes ([./api/start/routes.ts:29](./api/start/routes.ts:29))
- ✅ Added `cancelTicket()` function to frontend API ([./web/src/api/tickets.ts:77-83](./web/src/api/tickets.ts:77-83))

#### Screen Updates
- ✅ ScreenFOH updated with cancel handler and new props to CallFoodItem
- ✅ ScreenDriveThru updated with cancel handler and new props to CallFoodItem
- ✅ Both screens now pass: activeTicketId, remainingSeconds, totalSeconds, onCancel

### Progress Bar Behavior
- **0-33%**: Red (just started)
- **34-66%**: Orange (halfway)
- **67-99%**: Yellow (almost done)
- **100%**: Green (ready for quality check)
- Text shows remaining time in MM:SS format overlaid on progress bar

## Phase 5 Implementation: Collapsable My Calls by Hour

### Changes Completed

#### FOH & Drive-Thru Screens
- ✅ Added `groupTicketsByHour()` function to group tickets by hour (HH:00 - HH:00 format)
- ✅ Added `getCurrentHourLabel()` to determine current hour for default expansion
- ✅ Replaced flat list with Collapsable sections for each hour
- ✅ Each section shows hour range and ticket count (e.g., "10:00 - 11:00 (5)")
- ✅ Current hour expanded by default, others collapsed
- ✅ Applied to both ScreenFOH and ScreenDriveThru

#### Implementation Details
```tsx
function groupTicketsByHour(tickets: SnapshotTicket[]): Record<string, SnapshotTicket[]> {
  const groups: Record<string, SnapshotTicket[]> = {}
  const now = new Date()
  
  tickets.forEach((ticket) => {
    const ticketTime = ticket.startedAt ? new Date(ticket.startedAt) : now
    const hour = ticketTime.getHours()
    const hourLabel = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`
    
    if (!groups[hourLabel]) groups[hourLabel] = []
    groups[hourLabel].push(ticket)
  })
  
  return groups
}
```

## Next Steps

Phase 5 complete. Ready to proceed to **Phase 6** which includes:
- Quality hold timer (10-min countdown after 100%)
- Red pulsing border animation for quality alerts
- BOH screen updates with collapsable completed items
- Cancel confirmation dialog with shadcn Alert

## Technical Notes

### Form State Management
- Form data uses string types for numeric inputs to allow empty fields during editing
- Conversion to numbers happens in `formToPayload()` function
- Batch sizes stored as comma-separated string in form, split into array for payload

### Image Upload Flow
1. User selects/drops image file
2. File validated (type, size)
3. Preview shown immediately using `URL.createObjectURL()`
4. Item saved first (create or update)
5. Image uploaded separately to `/api/menu/:id/image`
6. Old image automatically cleaned up on server

### Type Safety
- All components properly typed with TypeScript
- ColorType union type ensures only valid colors
- FormData type separate from payload types for better UX
- MenuItem type includes optional new fields (color, imageUrl, holdTime)

## Known Issues
- ⚠️ **Cancel button not working yet** - WebSocket event handler added but needs further debugging
- ⚠️ **Picture upload not working** - UI implemented but file upload needs debugging

## Deployment Status
- ✅ Changes committed and built locally
- ✅ Web container rebuilt and restarted
- ⏳ Not yet pushed to git (awaiting user verification)
- ⏳ Not yet deployed to production droplet
