import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'تبدیل گفتار', icon: '◉' },
  { to: '/archive', label: 'آرشیو', icon: '▣' },
]

export function SideNav() {
  return (
    <aside className="side-nav" aria-label="منوی اصلی">
      <div className="side-nav-pattern" />

      <div className="side-nav-brand">
        <span className="side-nav-brand-text">آوا</span>
        <span className="side-nav-brand-icon" aria-hidden>
          <i />
          <i />
          <i />
        </span>
      </div>

      <nav className="side-nav-links">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              isActive ? 'side-nav-link side-nav-link-active' : 'side-nav-link'
            }
          >
            <span className="side-nav-link-icon" aria-hidden>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="side-nav-language-mark">Goftar</div>
    </aside>
  )
}
