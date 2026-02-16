import type { ScreenId } from '@/types/screen'

type Props = { screen: ScreenId }

const LABELS: Record<ScreenId, string> = {
  1: 'Front of House',
  2: 'Drive-thru',
  3: 'BOH Stir fry',
  4: 'BOH Fryer',
  5: 'BOH Sides + Grill',
  menu: 'Menu',
}

export function ScreenPlaceholder({ screen }: Props) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-2xl font-semibold text-muted-foreground">
        {LABELS[screen]}
      </h2>
      <p className="mt-2 text-muted-foreground">
        Screen {screen} — placeholder content
      </p>
    </main>
  )
}
