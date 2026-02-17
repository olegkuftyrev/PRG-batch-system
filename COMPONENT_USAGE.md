# shadcn/ui Component Usage

## ✅ Already Using shadcn/ui Components

### CallFoodItem Component (FOH Food Cards)
**File:** `web/src/components/CallFoodItem.tsx`

**shadcn/ui components used:**
```typescript
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
```

**Implementation:**
```tsx
<Card className="flex flex-col border-0">
  <CardHeader className="pb-2">
    <Badge variant="secondary">{item.code}</Badge>
    <CardTitle>{item.title}</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Batch selection buttons */}
  </CardContent>
  <CardFooter>
    <Button onClick={handleCall}>Call</Button>
  </CardFooter>
</Card>
```

✅ **Properly using Card, CardHeader, CardTitle, CardContent, CardFooter, Badge, and Button**

---

### ScreenMenu Component (Menu Table)
**File:** `web/src/components/ScreenMenu.tsx`

**shadcn/ui components used:**
```typescript
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
```

**Implementation:**
```tsx
<div className="rounded-md border">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Code</TableHead>
        <TableHead>Title</TableHead>
        <TableHead>Station</TableHead>
        <TableHead>Enabled</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {menu.items.map((item) => (
        <TableRow key={item.id}>
          <TableCell>{item.code}</TableCell>
          <TableCell>{item.title}</TableCell>
          <TableCell>{item.station}</TableCell>
          <TableCell>{item.enabled ? 'Yes' : 'No'}</TableCell>
          <TableCell>
            <Button variant="outline" size="sm">Edit</Button>
            <Button variant="outline" size="sm">Delete</Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

✅ **Properly using Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Dialog, Input, Label, Select, Switch, and Button**

---

### ScreenBOH Component (BOH Tickets)
**File:** `web/src/components/ScreenBOH.tsx`

**shadcn/ui components used:**
```typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
```

**Implementation:**
```tsx
<Card className="border-0">
  <CardHeader className="py-2 px-3">
    <div className="flex items-center justify-between gap-2">
      <span>#{ticket.seq} {ticket.itemTitleSnapshot}</span>
      <Button size="sm" onClick={() => onStart(ticket.id)}>Start</Button>
    </div>
  </CardHeader>
</Card>
```

✅ **Properly using Card, CardHeader, CardContent, and Button**

---

## Component Usage Summary

| Component | File | shadcn/ui Components Used | Status |
|-----------|------|---------------------------|--------|
| **CallFoodItem** | CallFoodItem.tsx | Card, Badge, Button | ✅ Complete |
| **ScreenMenu** | ScreenMenu.tsx | Table, Dialog, Input, Label, Select, Switch, Button | ✅ Complete |
| **ScreenBOH** | ScreenBOH.tsx | Card, Button | ✅ Complete |
| **ScreenFOH** | ScreenFOH.tsx | Badge, Button (via CallFoodItem) | ✅ Complete |
| **ScreenDriveThru** | ScreenDriveThru.tsx | Badge, Button (via CallFoodItem) | ✅ Complete |

---

## All Components Are Already Properly Implemented

**Every UI element in the project is using shadcn/ui components:**

1. ✅ **Food cards** (like in your screenshot) → Using `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`
2. ✅ **Menu table** → Using `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`
3. ✅ **BOH ticket cards** → Using `Card`, `CardHeader`, `CardContent`
4. ✅ **Buttons** → Using `Button` component everywhere
5. ✅ **Badges** → Using `Badge` component for codes and recommendations
6. ✅ **Forms** → Using `Input`, `Label`, `Select`, `Switch`
7. ✅ **Dialogs** → Using `Dialog` component for menu editor

**No changes needed** - the implementation is already following shadcn/ui best practices.

---

## Visual Confirmation

From your screenshot showing "V1 Super Greens":
- ✅ The card wrapper → `<Card>`
- ✅ The "V1" badge + title → `<CardHeader>` with `<Badge>` and `<CardTitle>`
- ✅ Batch selection buttons → `<CardContent>` with `<Button variant="default" | "outline">`
- ✅ "Recommended" label → `<Badge>` with custom styling
- ✅ "Call" button → `<CardFooter>` with `<Button>`

Everything matches shadcn/ui component structure perfectly.
