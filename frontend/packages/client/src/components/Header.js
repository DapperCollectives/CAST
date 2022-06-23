import React, { useState } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import Sidenavbar from './SideNavbar';
import { Logo, LinkOut } from './Svg';
import WalletConnect from './WalletConnect';

function Header(props) {
  const [showSidenav, setShowSidenav] = useState(false);

  const openNavbarMenu = () => {
    setShowSidenav(true);
  };

  const closeNavbarMenu = () => {
    setShowSidenav(false);
  };

  return (
    <>
      <header
        className={`header ${props.location.pathname} has-background-white is-block navbar is-fixed-top`}
      >
        <div className="px-4 divider">
          <div className="container header-spacing">
            <nav className="navbar is-transparent">
              <div className="navbar-brand">
                <NavLink to="/" className="navbar-item p-0 mr-2">
                  <Logo />
                </NavLink>
                <NavLink
                  to={{
                    pathname: '/about',
                    state: { modal: true },
                  }}
                  className="navbar-item p-0 ml-4 mr-4 is-hidden-mobile"
                >
                  <span className="navbar-item-hover transition-all">
                    About
                  </span>
                </NavLink>
                <NavLink
                  to={{
                    pathname: '/community/create',
                  }}
                  className="navbar-item p-0 ml-4 mr-4 is-hidden-mobile"
                >
                  <span className="navbar-item-hover transition-all">
                    Create Community
                  </span>
                </NavLink>
                <a
                  href="https://github.com/DapperCollectives/CAST"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="navbar-item p-0 ml-4 is-hidden-mobile"
                >
                  <div className="is-flex is-align-items-center navbar-item-hover transition-all">
                    <span className="mr-2">Codebase</span>
                    <LinkOut width="17" height="17" />
                  </div>
                </a>
                <span
                  role="button"
                  className="navbar-burger mr-2"
                  onClick={openNavbarMenu}
                >
                  <span />
                  <span />
                  <span />
                </span>
              </div>
              <div className="navbar-end">
                <span className="navbar-item p-0">
                  <WalletConnect />
                </span>
              </div>
            </nav>
          </div>
        </div>
      </header>
      <Sidenavbar showSidenav={showSidenav} closeSidenav={closeNavbarMenu} />
    </>
  );
}

export default withRouter((props) => <Header {...props} />);
