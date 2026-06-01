import { useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../app/hooks'
import { closeUserMenu, toggleUserMenu } from '../features/ui/uiSlice'

export function UserMenu() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isOpen = useAppSelector((state) => state.ui.userMenuOpen)

  const onToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    dispatch(toggleUserMenu())
  }

  const onLogout = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    dispatch(closeUserMenu())
    navigate('/')
  }

  return (
    <div className="user-menu" onClick={(event) => event.stopPropagation()}>
      <button className="user-menu-trigger" type="button" onClick={onToggle}>
        <span className="user-menu-arrow">▾</span>
        <span className="user-menu-name">مهمان</span>
        <span className="user-menu-avatar">👤</span>
      </button>

      {isOpen ? (
        <div className="user-menu-popover">
          <button className="user-menu-item" type="button" onClick={onLogout}>
            خروج
          </button>
        </div>
      ) : null}
    </div>
  )
}
