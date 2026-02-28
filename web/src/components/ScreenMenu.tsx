import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import { Collapsable } from '@/components/ui/collapsible'
import { ColorBadge, type ColorType } from '@/components/ui/color-badge'
import { ImagePlaceholder } from '@/components/ui/image-placeholder'
import { useMenu } from '@/hooks/useMenu'
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadMenuItemImage,
  deleteMenuItemImage,
  type MenuItem,
  type CreateMenuItemPayload,
} from '@/api/menu'

const STATIONS = ['stirfry', 'fryer', 'sides', 'grill'] as const
const DAYPARTS = ['breakfast', 'lunch', 'snack', 'dinner', 'late_snack'] as const
const COLORS: { value: ColorType; label: string }[] = [
  { value: null, label: 'None' },
  { value: 'blue', label: 'Blue - LTO' },
  { value: 'red', label: 'Red - Slow' },
  { value: 'green', label: 'Green - Busy' },
  { value: 'orange', label: 'Orange - Medium' },
  { value: 'yellow', label: 'Yellow - Caution' },
]

type FormData = {
  code: string
  title: string
  station: (typeof STATIONS)[number]
  batchSizes: string
  cookTimesPerBatch: Record<string, string>
  enabled: boolean
  recommendedBatch: Record<string, string>
  color: ColorType
  holdTime: string
}

const defaultForm: FormData = {
  code: '',
  title: '',
  station: 'stirfry',
  batchSizes: '1,2,3',
  cookTimesPerBatch: { '1': '8', '2': '8', '3': '8' },
  enabled: true,
  recommendedBatch: Object.fromEntries(DAYPARTS.map((d) => [d, '1'])),
  color: null,
  holdTime: '10',
}

function itemToForm(item: MenuItem): FormData {
  const sizes = item.batchSizes?.join(',') ?? '1,2,3'
  const cookTimesPerBatch: Record<string, string> = {}
  item.batchSizes?.forEach((size) => {
    const seconds = item.cookTimes?.[size] ?? 480
    cookTimesPerBatch[size] = String(seconds / 60)
  })
  
  return {
    code: item.code ?? '',
    title: item.title ?? '',
    station: (item.station as FormData['station']) ?? 'stirfry',
    batchSizes: sizes,
    cookTimesPerBatch,
    enabled: item.enabled ?? true,
    recommendedBatch: item.recommendedBatch ?? defaultForm.recommendedBatch,
    color: item.color ?? null,
    holdTime: String((item.holdTime ?? 600) / 60),
  }
}

function formToPayload(form: FormData): CreateMenuItemPayload {
  const sizes = form.batchSizes.split(',').map((s) => s.trim()).filter(Boolean) || ['1']
  const cookTimes: Record<string, number> = {}
  
  sizes.forEach((size) => {
    const minutes = parseFloat(form.cookTimesPerBatch[size] || '8')
    cookTimes[size] = Math.round(minutes * 60)
  })
  
  return {
    code: form.code.trim(),
    title: form.title.trim(),
    station: form.station,
    batchSizes: sizes,
    cookTimes,
    enabled: form.enabled,
    recommendedBatch: form.recommendedBatch,
    color: form.color,
    holdTime: Math.round(parseFloat(form.holdTime) * 60),
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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openAdd = () => {
    setEditing(null)
    setForm(defaultForm)
    setLastError(null)
    setImageFile(null)
    setImagePreview(null)
    setDialogOpen(true)
  }

  const openEdit = (item: MenuItem) => {
    setEditing(item)
    setForm(itemToForm(item))
    setLastError(null)
    setImageFile(null)
    setImagePreview(item.imageUrl ? `${import.meta.env.VITE_API_URL || ''}${item.imageUrl}` : null)
    setDialogOpen(true)
  }

  const handleBatchSizesChange = (value: string) => {
    const sizes = value.split(',').map((s) => s.trim()).filter(Boolean)
    const newCookTimes: Record<string, string> = {}
    sizes.forEach((size) => {
      newCookTimes[size] = form.cookTimesPerBatch[size] || '8'
    })
    setForm((f) => ({ ...f, batchSizes: value, cookTimesPerBatch: newCookTimes }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      setLastError('Only JPEG, PNG, and WebP images are allowed')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setLastError('Image must be less than 5MB')
      return
    }
    
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setLastError(null)
  }

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    
    const input = fileInputRef.current
    if (input) {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input.files = dataTransfer.files
      handleImageSelect({ target: input } as any)
    }
  }

  const handleRemoveImage = async () => {
    if (editing?.imageUrl) {
      try {
        await deleteMenuItemImage(editing.id)
        setImagePreview(null)
        setImageFile(null)
        refetch()
      } catch (e) {
        setLastError(e instanceof Error ? e.message : 'Failed to remove image')
      }
    } else {
      setImagePreview(null)
      setImageFile(null)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setLastError(null)
    try {
      const payload = formToPayload(form)
      let itemId: number
      
      if (editing) {
        await updateMenuItem(editing.id, payload)
        itemId = editing.id
      } else {
        const created = await createMenuItem(payload)
        itemId = created.id
      }
      
      if (imageFile) {
        setUploadingImage(true)
        try {
          await uploadMenuItemImage(itemId, imageFile)
        } catch (e) {
          setLastError(`Item saved but image upload failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
        } finally {
          setUploadingImage(false)
        }
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

  const itemsByStation = menu.items.reduce((acc, item) => {
    if (!acc[item.station]) acc[item.station] = []
    acc[item.station].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

  const batchSizes = form.batchSizes.split(',').map((s) => s.trim()).filter(Boolean)

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Menu (v{menu.menuVersion})</h1>
        <Button onClick={openAdd}>Add item</Button>
      </div>

      <div className="space-y-4">
        {STATIONS.map((station) => {
          const items = itemsByStation[station] || []
          return (
            <Collapsable
              key={station}
              title={`${station.charAt(0).toUpperCase() + station.slice(1)} Station`}
              count={items.length}
              defaultOpen={true}
            >
              <div className="space-y-2">
                {items.length === 0 && (
                  <p className="text-sm text-muted-foreground">No items</p>
                )}
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 p-3 border rounded-lg ${
                      item.color === 'blue' ? 'bg-blue-100 border-blue-300' :
                      item.color === 'red' ? 'bg-red-100 border-red-300' :
                      item.color === 'green' ? 'bg-green-100 border-green-300' :
                      item.color === 'orange' ? 'bg-orange-100 border-orange-300' :
                      item.color === 'yellow' ? 'bg-yellow-100 border-yellow-300' :
                      'hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.code}</span>
                        <span>-</span>
                        <span>{item.title}</span>
                        {item.color && <ColorBadge color={item.color} />}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Batches: {item.batchSizes?.join(', ')} • Hold: {(item.holdTime || 600) / 60}min
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ToggleSwitch
                        checked={item.enabled}
                        onCheckedChange={async (checked) => {
                          try {
                            await updateMenuItem(item.id, { enabled: checked })
                            refetch()
                          } catch (e) {
                            alert('Failed to update')
                          }
                        }}
                      />
                      <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(item)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Collapsable>
          )
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit item' : 'Add item'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {lastError && <div className="text-destructive text-sm">{lastError}</div>}
            
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Color</Label>
                <Select
                  value={form.color || 'null'}
                  onValueChange={(v) => setForm((f) => ({ ...f, color: v === 'null' ? null : v as ColorType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((c) => (
                      <SelectItem key={c.value || 'null'} value={c.value || 'null'}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Batch sizes (comma-separated: 0.5, 1, 2, 3, 4)</Label>
              <Input
                value={form.batchSizes}
                onChange={(e) => handleBatchSizesChange(e.target.value)}
                placeholder="1,2,3"
              />
            </div>

            <div className="grid gap-2">
              <Label>Cook times per batch (minutes)</Label>
              <div className="grid grid-cols-3 gap-2">
                {batchSizes.map((size) => (
                  <div key={size} className="flex items-center gap-2">
                    <Label className="w-12 text-sm text-muted-foreground">{size}:</Label>
                    <Input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={form.cookTimesPerBatch[size] || '8'}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          cookTimesPerBatch: { ...f.cookTimesPerBatch, [size]: e.target.value },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Hold time (minutes)</Label>
              <Input
                type="number"
                min={1}
                step={1}
                value={form.holdTime}
                onChange={(e) => setForm((f) => ({ ...f, holdTime: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label>Picture</Label>
              <div
                className="border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-accent/50"
                onDrop={handleImageDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveImage()
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <ImagePlaceholder className="h-32" />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ToggleSwitch
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
                    <Label className="w-24 text-muted-foreground capitalize text-sm">{dp.replace('_', ' ')}</Label>
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
                        {batchSizes.map((s) => (
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
            <Button onClick={handleSave} disabled={saving || uploadingImage}>
              {saving ? 'Saving…' : uploadingImage ? 'Uploading image…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
