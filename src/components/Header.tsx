import './Header.css'
import logoPolaris from '../assets/P-Polaris.jpeg'

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-logo-container">
          <img src={logoPolaris} alt="Polaris Software" className="header-logo" />
        </div>
        <h1 className="logo">OrçaTech</h1>
        <p className="subtitle">Gerador de Orçamentos Profissionais</p>
        <p className="empresa">Polaris Software</p>
      </div>
    </header>
  )
}

export default Header

