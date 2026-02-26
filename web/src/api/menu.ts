const API = import.meta.env.VITE_API_URL || ''

export type MenuItem = {
  id: number
  code: string
  title: string
  station: string
  batchSizes: string[]
  cookTimes: Record<string, number>
  enabled: boolean
  recommendedBatch: Record<string, string>
  color?: 'blue' | 'red' | 'green' | 'orange' | null
  imageUrl?: string | null
  holdTime?: number
}

export type MenuResponse = {
  items: MenuItem[]
  menuVersion: number
}

export type CreateMenuItemPayload = {
  code: string
  title: string
  station: 'stirfry' | 'fryer' | 'sides' | 'grill'
  batchSizes: string[]
  cookTimes: Record<string, number>
  enabled?: boolean
  recommendedBatch?: Record<string, string>
  color?: 'blue' | 'red' | 'green' | 'orange' | null
  imageUrl?: string | null
  holdTime?: number
}

export type UpdateMenuItemPayload = Partial<CreateMenuItemPayload>

export async function fetchMenu(): Promise<MenuResponse> {
  const r = await fetch(`${API}/api/menu`)
  if (!r.ok) throw new Error('Failed to fetch menu')
  return r.json()
}

export async function createMenuItem(payload: CreateMenuItemPayload): Promise<MenuItem> {
  const r = await fetch(`${API}/api/menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!r.ok) {
    const err = await r.json().catch(() => ({}))
    throw new Error(err.error || err.message || 'Failed to create')
  }
  return r.json()
}

export async function updateMenuItem(id: number, payload: UpdateMenuItemPayload): Promise<MenuItem> {
  const r = await fetch(`${API}/api/menu/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!r.ok) {
    const err = await r.json().catch(() => ({}))
    throw new Error(err.error || err.message || 'Failed to update')
  }
  return r.json()
}

export async function deleteMenuItem(id: number): Promise<void> {
  const r = await fetch(`${API}/api/menu/${id}`, { method: 'DELETE' })
  if (!r.ok) {
    const err = await r.json().catch(() => ({}))
    throw new Error(err.error || err.message || 'Failed to delete')
  }
}

export async function uploadMenuItemImage(id: number, file: File): Promise<{ imageUrl: string }> {
  const formData = new FormData()
  formData.append('image', file)
  
  const r = await fetch(`${API}/api/menu/${id}/image`, {
    method: 'POST',
    body: formData,
  })
  if (!r.ok) {
    const err = await r.json().catch(() => ({}))
    throw new Error(err.error || err.message || 'Failed to upload image')
  }
  return r.json()
}

export async function deleteMenuItemImage(id: number): Promise<void> {
  const r = await fetch(`${API}/api/menu/${id}/image`, { method: 'DELETE' })
  if (!r.ok) {
    const err = await r.json().catch(() => ({}))
    throw new Error(err.error || err.message || 'Failed to delete image')
  }
}
