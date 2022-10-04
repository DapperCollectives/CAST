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

  const classNamesLinks =
    'navbar-item p-0 mr-6-desktop mr-5-tablet is-hidden-mobile';

  return (
    <>
      <header
        id="navbar"
        className={`${props.location.pathname} has-background-white is-block navbar is-fixed-top`}
      >
        <div className="px-6-desktop px-5-tablet px-4-mobile divider">
          <div className="container header-spacing">
            <nav className="navbar is-transparent">
              <div className="navbar-brand">
                <span
                  role="button"
                  className="navbar-burger mr-2"
                  onClick={openNavbarMenu}
                >
                  <span />
                  <span />
                  <span />
                </span>
                <NavLink to="/" className="navbar-item p-0 mr-2">
                  <div className="is-hidden-tablet is-flex is-align-items-center">
                    <Svg name="Logo" width={104} height={24} />
                  </div>
                  <div className="is-hidden-mobile is-flex is-align-items-center">
                    <Svg name="Logo" />
                  </div>
                </NavLink>
                <div className="is-flex is-align-items-center">
                  <Label
                    padding="py-1 px-3"
                    labelText="Beta"
                    classNames="has-text-weight-bold smallest-text is-uppercase"
                  />
                </div>
              </div>
              <div className="navbar-end">
                <NavLink
                  to={{
                    pathname: '/about',
                    state: { modal: true },
                  }}
                  className={classNamesLinks}
                >
                  <span className="navbar-item-hover transition-all has-text-weight-bold has-text-black">
                    About Us
                  </span>
                </NavLink>
                <NavLink
                  to={{
                    pathname: '/browse-communities',
                    state: { modal: true },
                  }}
                  className={classNamesLinks}
                >
                  <span className="navbar-item-hover transition-all has-text-weight-bold has-text-black">
                    Browse
                  </span>
                </NavLink>
                <NavLink
                  to={{
                    pathname: '/community/create',
                  }}
                  className={classNamesLinks}
                >
                  <span className="navbar-item-hover transition-all has-text-weight-bold has-text-black">
                    Create a Community
                  </span>
                </NavLink>
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
