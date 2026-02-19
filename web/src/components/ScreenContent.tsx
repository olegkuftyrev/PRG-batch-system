import { ScreenFOH } from '@/components/ScreenFOH'
import { ScreenDriveThru } from '@/components/ScreenDriveThru'
import { ScreenBOH } from '@/components/ScreenBOH'
import { ScreenMenu } from '@/components/ScreenMenu'
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder'
import type { ScreenId } from '@/types/screen'
import type { SocketState } from '@/hooks/useSocket'

type Props = { screen: ScreenId; socketState: SocketState }

export function ScreenContent({ screen, socketState }: Props) {
  if (screen === 1) return <ScreenFOH socketState={socketState} />
  if (screen === 2) return <ScreenDriveThru socketState={socketState} />
  if (screen === 3 || screen === 4 || screen === 5) {
    return <ScreenBOH screen={screen} socketState={socketState} />
  }
  if (screen === 'menu') {
    return <ScreenMenu menuVersion={socketState.menuVersion} />
  }
  return <ScreenPlaceholder screen={screen} />
}
