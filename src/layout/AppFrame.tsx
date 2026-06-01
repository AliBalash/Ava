import type { PropsWithChildren } from 'react'

import { useAppDispatch } from '../app/hooks'
import { UserMenu } from '../components/UserMenu'
import { closeUserMenu } from '../features/ui/uiSlice'
import { SideNav } from './SideNav'

export function AppFrame({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch()

  return (
    <div className="app-frame" onClick={() => dispatch(closeUserMenu())}>
      <UserMenu />
      <SideNav />
      <main className="content-area">{children}</main>
    </div>
  )
}
