import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useMenu } from '@/hooks/useMenu'
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  type MenuItem,
  type CreateMenuItemPayload,
} from '@/api/menu'

const STATIONS = ['stirfry', 'fryer', 'sides', 'grill'] as const
const DAYPARTS = ['breakfast', 'lunch', 'snack', 'dinner', 'late_snack'] as const

type FormData = {
  code: string
  title: string
  station: (typeof STATIONS)[number]
  batchSizes: string
  cookTimeMinutes: string
  enabled: boolean
  recommendedBatch: Record<string, string>
}

const defaultForm: FormData = {
  code: '',
  title: '',
  station: 'stirfry',
  batchSizes: '1,2,3',
  cookTimeMinutes: '8',
  enabled: true,
  recommendedBatch: Object.fromEntries(DAYPARTS.map((d) => [d, '1'])),
}

function itemToForm(item: MenuItem): FormData {
  const sizes = item.batchSizes?.join(',') ?? '1,2,3'
  const firstTime = item.batchSizes?.[0]
    ? (item.cookTimes?.[item.batchSizes[0]] ?? 420) / 60
    : 8
  return {
    code: item.code ?? '',
    title: item.title ?? '',
    station: (item.station as FormData['station']) ?? 'stirfry',
    batchSizes: sizes,
    cookTimeMinutes: String(firstTime),
    enabled: item.enabled ?? true,
    recommendedBatch: item.recommendedBatch ?? defaultForm.recommendedBatch,
  }
}

function formToPayload(form: FormData): CreateMenuItemPayload {
  const sizes = form.batchSizes.split(',').map((s) => s.trim()).filter(Boolean) || ['1']
  const minutes = parseFloat(form.cookTimeMinutes) || 8
  const cookTimes: Record<string, number> = {}
  for (const s of sizes) cookTimes[s] = Math.round(minutes * 60)
  return {
    code: form.code.trim(),
    title: form.title.trim(),
    station: form.station,
    batchSizes: sizes,
    cookTimes,
    enabled: form.enabled,
    recommendedBatch: form.recommendedBatch,
  }
}

type Props = { menuVersion?: number }

export function ScreenMenu({ menuVersion }: Props) {
  const { menu, loading, error, refetch } = useMenu(menuVersion)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)

  const openAdd = () => {
    setEditing(null)
    setForm(defaultForm)
    setLastError(null)
    setDialogOpen(true)
  }

  const openEdit = (item: MenuItem) => {
    setEditing(item)
    setForm(itemToForm(item))
    setLastError(null)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setLastError(null)
    try {
      const payload = formToPayload(form)
      if (editing) {
        await updateMenuItem(editing.id, payload)
      } else {
        await createMenuItem(payload)
      }
      setDialogOpen(false)
      refetch()
    } catch (e) {
      setLastError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Delete ${item.code} ${item.title}?`)) return
    try {
      await deleteMenuItem(item.id)
      refetch()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete')
    }
  }

  if (loading) return <div className="p-6 text-muted-foreground">Loading menu…</div>
  if (error) return <div className="p-6 text-destructive">{error}</div>
  if (!menu) return null

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Menu (v{menu.menuVersion})</h1>
        <Button onClick={openAdd}>Add item</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Station</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead className="w-[140px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menu.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.code}</TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.station}</TableCell>
                <TableCell>{item.enabled ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(item)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit item' : 'Add item'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {lastError && (
              <div className="text-destructive text-sm">{lastError}</div>
            )}
            <div className="grid gap-2">
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="C1"
              />
            </div>
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Orange Chicken"
              />
            </div>
            <div className="grid gap-2">
              <Label>Station</Label>
              <Select
                value={form.station}
                onValueChange={(v) => setForm((f) => ({ ...f, station: v as FormData['station'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Batch sizes (comma-separated)</Label>
              <Input
                value={form.batchSizes}
                onChange={(e) => setForm((f) => ({ ...f, batchSizes: e.target.value }))}
                placeholder="1,2,3"
              />
            </div>
            <div className="grid gap-2">
              <Label>Cook time (minutes, same for all batches)</Label>
              <Input
                type="number"
                min={1}
                step={0.5}
                value={form.cookTimeMinutes}
                onChange={(e) => setForm((f) => ({ ...f, cookTimeMinutes: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.enabled}
                onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: v }))}
              />
              <Label>Enabled</Label>
            </div>
            <div className="grid gap-2">
              <Label>Recommended batch per daypart</Label>
              <div className="grid grid-cols-2 gap-2">
                {DAYPARTS.map((dp) => (
                  <div key={dp} className="flex items-center gap-2">
                    <Label className="w-24 text-muted-foreground capitalize">{dp}</Label>
                    <Select
                      value={form.recommendedBatch[dp] ?? '1'}
                      onValueChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          recommendedBatch: { ...f.recommendedBatch, [dp]: v },
                        }))
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          form.batchSizes
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean) || ['1']
                        ).map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
