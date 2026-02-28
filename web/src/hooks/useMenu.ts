import { useEffect, useState, useCallback, useRef } from 'react'
import { fetchMenu, type MenuItem, type MenuResponse } from '@/api/menu'

export function useMenu(menuVersion?: number) {
  const [data, setData] = useState<MenuResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchSeqRef = useRef(0)

  const refetch = useCallback(() => {
    const seq = ++fetchSeqRef.current
    return fetchMenu()
      .then((result) => {
        if (seq === fetchSeqRef.current) setData(result)
      })
      .catch((e) => {
        if (seq === fetchSeqRef.current)
          setError(e instanceof Error ? e.message : 'Failed to load menu')
      })
      .finally(() => {
        if (seq === fetchSeqRef.current) setLoading(false)
      })
  }, [])

  useEffect(() => {
    refetch()
  }, [])

  useEffect(() => {
    if (menuVersion != null && menuVersion > 0) {
      refetch()
    }
  }, [menuVersion])

  return { menu: data, loading, error, refetch }
}

/** FOH sections per README: Section 1, 2, 3 (steam table) */
const FOH_SECTION_1_CODES = ['C2', 'C3', 'B3', 'F4', 'M1', 'V1', 'R1', 'R2']
const FOH_SECTION_3_CODES = ['C4', 'E1', 'E2', 'E3']

export function groupMenuByFohSections(items: MenuItem[]) {
  const enabled = items.filter((i) => i.enabled)
  const byCode = Object.fromEntries(enabled.map((i) => [i.code, i]))
  const section1 = FOH_SECTION_1_CODES.map((c) => byCode[c]).filter(Boolean)
  const section3 = FOH_SECTION_3_CODES.map((c) => byCode[c]).filter(Boolean)
  const FOH_SECTION_2_ORDER = ['CB1', 'CB5', 'C1', 'B1', 'B5', 'CB3']
  const knownCodes = new Set([...FOH_SECTION_1_CODES, ...FOH_SECTION_3_CODES])
  const unordered = enabled.filter((i) => !knownCodes.has(i.code))
  const byCode2 = Object.fromEntries(unordered.map((i) => [i.code, i]))
  const ordered = FOH_SECTION_2_ORDER.map((c) => byCode2[c]).filter(Boolean)
  const remaining = unordered.filter((i) => !FOH_SECTION_2_ORDER.includes(i.code))
  const section2 = [...ordered, ...remaining]
  return { section1, section2, section3 }
}

/** Drive-thru: 12 fixed items in 3 sections per README */
export const DRIVE_THRU_ALL_CODES = [
  'M1', 'R2', 'V1', 'C3', 'C2', 'C1', 'C4', 'B1', 'F4', 'B5', 'CB3', 'R1',
]

export function groupMenuByDriveThruSections(items: MenuItem[]) {
  const enabled = items.filter((i) => i.enabled)
  const byCode = Object.fromEntries(enabled.map((i) => [i.code, i]))
  const s1Codes = ['M1', 'R2', 'V1', 'C3', 'C2']
  const s2Codes = ['C1', 'C4', 'B1', 'F4', 'B5', 'CB3']
  const s3Codes = ['R1']
  return {
    section1: s1Codes.map((c) => byCode[c]).filter(Boolean),
    section2: s2Codes.map((c) => byCode[c]).filter(Boolean),
    section3: s3Codes.map((c) => byCode[c]).filter(Boolean),
  }
}
