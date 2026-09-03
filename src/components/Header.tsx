import { useState } from 'react'
import { SignatureLogo } from './SignatureLogo'

export function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false)

  const closeNav = () => setIsNavOpen(false)

  return (
    <header className="navbar navbar-expand-md navbar-dark pf-header">
      <div className="pf-container pf-header-inner">
        <div className="d-flex flex-wrap align-items-center justify-content-between w-100 pb-3 pb-lg-4 pf-header-rule">
          <SignatureLogo />
          <button
            className="navbar-toggler pf-navbar-toggler"
            type="button"
            aria-controls="mainNav"
            aria-expanded={isNavOpen}
            aria-label="Toggle navigation"
            onClick={() => setIsNavOpen((prev) => !prev)}
          >
            <span className="navbar-toggler-icon pf-navbar-toggler-icon" />
          </button>
          <nav
            className={`collapse navbar-collapse justify-content-lg-end${isNavOpen ? ' show' : ''}`}
            id="mainNav"
          >
            <ul className="navbar-nav gap-lg-4 mt-3 mt-lg-0 align-items-lg-center ms-lg-auto text-center text-lg-end">
              <li className="nav-item">
                <a className="nav-link pf-nav-link" href="#home" onClick={closeNav}>
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link pf-nav-link" href="#about" onClick={closeNav}>
                  About
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link pf-nav-link" href="#contact" onClick={closeNav}>
                  Connect
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}
