import { SignatureLogo } from './SignatureLogo'

export function Header() {
  return (
    <header className="navbar navbar-expand-md navbar-dark pf-header">
      <div className="pf-container pf-header-inner">
        <div className="d-flex flex-wrap align-items-center justify-content-between w-100 pb-3 pb-lg-4 pf-header-rule">
          <SignatureLogo />
          <button
            className="navbar-toggler pf-navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
            aria-controls="mainNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon pf-navbar-toggler-icon" />
          </button>
          <nav className="collapse navbar-collapse justify-content-lg-end" id="mainNav">
            <ul className="navbar-nav gap-lg-4 mt-3 mt-lg-0 align-items-lg-center ms-lg-auto text-center text-lg-end">
              <li className="nav-item">
                <a className="nav-link pf-nav-link" href="#home">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link pf-nav-link" href="#about">
                  About
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link pf-nav-link" href="#contact">
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
