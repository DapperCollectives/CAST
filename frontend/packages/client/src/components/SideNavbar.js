import React from "react";
import { Logo, LinkOut } from "./Svg";
import { NavLink } from "react-router-dom";

const Sidenavbar = ({ showSidenav, closeSidenav }) => {
  return (
    <div
      className={`modal is-align-items-flex-start is-justify-content-flex-start is-hidden-tablet has-background-white${
        showSidenav ? " is-active" : ""
      }`}
    >
      <div className="modal-content">
        <button
          className="button is-white is-size-2 has-text-grey-darker px-0 py-0"
          aria-label="close"
          onClick={(e) => {
            e.stopPropagation();
            closeSidenav();
          }}
        >
          &times;
        </button>
        <nav className="is-flex is-flex-grow-1 is-flex-direction-column is-align-items-flex-start pt-6">
          <NavLink
            to="/"
            onClick={closeSidenav}
            className="navbar-item pl-0 py-6"
          >
            <Logo width={"136"} height={"40"} />
          </NavLink>
          <aside className="menu">
            <ul className="menu-list">
              <li>
                <NavLink
                  to={{
                    pathname: "/about",
                    state: { modal: true },
                  }}
                  className="navbar-item pl-0 py-4 is-size-5"
                  onClick={closeSidenav}
                >
                  About
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={{
                    pathname: "/community/create",
                  }}
                  className="navbar-item pl-0 py-4 is-size-5"
                  onClick={closeSidenav}
                >
                  Create Community
                </NavLink>
              </li>
              <li>
                <a
                  target="_blank"
                  rel="noreferrer noopener"
                  href="https://github.com/DapperCollectives/CAST"
                  className="navbar-item pl-0 py-4 is-size-5"
                  onClick={closeSidenav}
                >
                  <span className="mr-2">Codebase</span>
                  <LinkOut />
                </a>
              </li>
            </ul>
          </aside>
        </nav>
      </div>
    </div>
  );
};

export default Sidenavbar;
