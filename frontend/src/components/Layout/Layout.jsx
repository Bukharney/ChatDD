import React from "react";
import { NavLink, useLocation, useNavigate, Outlet } from "react-router-dom";
import Logo from "../../assets/Logo";
import ProfileIcon from "../../assets/Profile";
import ChatIcon from "../../assets/Chat";
import LogoutIcon from "../../assets/Logout";
import Arrow from "../../assets/Arrow";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const renderNavLink = (to, IconComponent) => (
    <NavLink to={to}>
      {({ isActive }) => (
        <li
          className={
            isActive
              ? "w-12 h-12 bg-dark-gray rounded-lg flex items-center justify-center p-1"
              : "w-12 h-12 flex items-center justify-center p-1"
          }
        >
          <IconComponent />
        </li>
      )}
    </NavLink>
  );

  const getTitle = () => {
    switch (location.pathname) {
      case "/profile":
        return "Profile";
      case "/chat":
        return "Chat";
      case "/logout":
        return "Logout";
      case "/register":
        return "Register";
      default:
        return "Home";
    }
  };

  return (
    <div className="flex flex-row bg-black max-h-screen max-w-screen">
      <aside className="h-screen">
        <nav className="flex flex-col justify-between h-full gap-6 py-6 border-r border-dark-gray">
          <ul className="h-full flex flex-col items-center px-3 lg:px-4 gap-4">
            <li className="w-full flex items-center justify-center mb-12">
              <NavLink to="/">
                <Logo className="w-8 h-8" />
              </NavLink>
            </li>
            {renderNavLink("/profile", ProfileIcon)}
            {renderNavLink("/chat", ChatIcon)}
          </ul>
          <ul className="w-full flex items-center justify-center">
            {renderNavLink("/logout", LogoutIcon)}
          </ul>
        </nav>
      </aside>
      <div className="flex-1 h-screen overflow-hidden flex flex-col">
        <nav className="py-4 lg:py-6 px-6 border-b border-dark-gray">
          <div className="flex flex-row gap-3 items-center">
            <button onClick={() => navigate(-1)}>
              <Arrow className="w-4 h-4 text-dark-gray" />
            </button>
            <h1 className="text-white text-lg lg:text-xl font-medium">{getTitle()}</h1>
          </div>
        </nav>
        <div className="flex-1 overflow-hidden">
          <main className="h-full"><Outlet /></main>
        </div>
      </div>
    </div>
  );
};

export default Layout;