import { useState } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { Svg } from '@cast/shared-components';
import Label from './Label';
import Sidenavbar from './SideNavbar';
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
        id="navbar"
        className={`${props.location.pathname} has-background-white is-block navbar is-fixed-top`}
      >
        <div className="px-4 divider">
          <div className="container header-spacing">
            <nav className="navbar is-transparent">
              <div className="navbar-brand">
                <NavLink to="/" className="navbar-item p-0 mr-2">
                  <Svg name="Logo" />
                </NavLink>
                <div className="is-flex is-align-items-center">
                  <Label
                    labelText="Beta"
                    classNames="has-text-weight-bold smallest-text is-uppercase"
                  />
                </div>
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
                <NavLink
                  to={{
                    pathname: '/about',
                    state: { modal: true },
                  }}
                  className="navbar-item p-0 mr-6 is-hidden-mobile"
                >
                  <span className="navbar-item-hover transition-all has-text-weight-bold">
                    About Us
                  </span>
                </NavLink>
                <NavLink
                  to={{
                    pathname: '/community/create',
                  }}
                  className="navbar-item p-0 mr-6 is-hidden-mobile"
                >
                  <span className="navbar-item-hover transition-all has-text-weight-bold">
                    Create a Community
                  </span>
                </NavLink>
                <span className="navbar-item p-0">
                  <WalletConnect expandContainer />
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
