import React, { useState, useContext, useEffect, useRef, useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from './Button';
import Notifications from './Notifications';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext.jsx';

// Custom hook to detect clicks outside of a component
const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-textSecondary hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  );
};


const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  
  const dropdownContainerRef = useRef(null);
  const hamburgerButtonRef = useRef(null);

  // Close dropdowns when clicking outside
  useOnClickOutside(dropdownContainerRef, () => setOpenDropdown(null));

  const toggleDropdown = (category) => {
    setOpenDropdown(openDropdown === category ? null : category);
  };
  
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeMenus = () => {
    setIsDrawerOpen(false);
    setOpenDropdown(null);
  };
  
  // Memoize navigation structure to prevent recalculation on every render
  const navStructure = useMemo(() => [
    {
      category: t('header.growth'),
      condition: user,
      links: [
        { to: '/skill-trees', label: t('header.skillTrees'), condition: user },
        { to: '/projects', label: t('header.projects'), condition: user },
        { to: '/leaderboard', label: t('header.leaderboard'), condition: user },
      ],
    },
    {
      category: t('header.community'),
      condition: user,
      links: [
        { to: '/forums', label: t('header.forums'), condition: user },
        { to: '/events', label: t('header.events'), condition: user },
        { to: '/resources', label: t('header.knowledgeBase'), condition: user },
        { to: '/roadmap', label: t('header.roadmap'), condition: user },
      ],
    },
    {
      category: t('header.mentorship'),
      condition: user,
      links: [
        { to: '/mentors', label: t('header.browseMentors'), condition: user },
        { to: '/premium-content', label: t('header.premiumContent'), condition: user?.premium?.subscriptionStatus === 'active' },
      ],
    },
  ].filter(item => item.condition), [t, user, i18n.language]); // Bug Fix: Add i18n.language to dependency array


  const renderNavLinks = (isMobile = false) => (
    <>
      {/* --- Direct Links --- */}
      <NavLink to="/" onClick={closeMenus} className={({isActive}) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "text-primary bg-primary/10" : "text-textSecondary hover:text-primary hover:bg-primary/10"}`}>
        {t('header.home')}
      </NavLink>
      <NavLink to="/exchange/find" onClick={closeMenus} className={({isActive}) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "text-primary bg-primary/10" : "text-textSecondary hover:text-primary hover:bg-primary/10"}`}>
        {t('header.findMatches')}
      </NavLink>
      {user && (
        <NavLink to="/dashboard" onClick={closeMenus} className={({isActive}) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "text-primary bg-primary/10" : "text-textSecondary hover:text-primary hover:bg-primary/10"}`}>
          {t('header.dashboard')}
        </NavLink>
      )}
       {user?.exchangesAsTeacherCount > 0 && (
        <NavLink to="/teacher/dashboard" onClick={closeMenus} className={({isActive}) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "text-primary bg-primary/10" : "text-textSecondary hover:text-primary hover:bg-primary/10"}`}>
          {t('header.teacherAnalytics')}
        </NavLink>
      )}

      {/* MODIFICATION START */}
      {user?.role === 'support' || user?.role === 'admin' ? (
        <NavLink to="/support/dashboard" onClick={closeMenus} className={({isActive}) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "text-primary bg-primary/10" : "text-textSecondary hover:text-primary hover:bg-primary/10"}`}>
          Support
        </NavLink>
      ) : null}
      {user?.role === 'admin' ? (
        <NavLink to="/admin/dashboard" onClick={closeMenus} className={({isActive}) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "text-primary bg-primary/10" : "text-textSecondary hover:text-primary hover:bg-primary/10"}`}>
          Admin
        </NavLink>
      ) : null}
      {/* MODIFICATION END */}

      {/* --- Dropdown Links --- */}
      {navStructure.map(item => (
        <div key={item.category} className={isMobile ? 'w-full' : 'relative'}>
          <button 
            onClick={() => toggleDropdown(item.category)} 
            className="px-3 py-2 rounded-md text-sm font-medium text-textSecondary hover:text-primary hover:bg-primary/10 flex items-center justify-between w-full"
            aria-haspopup="true"
            aria-expanded={openDropdown === item.category}
          >
            <span>{item.category}</span>
            <svg className={`w-4 h-4 ml-1 transform transition-transform ${openDropdown === item.category ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          
          <div className={`transition ease-out duration-200 transform ${openDropdown === item.category ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
            <ul className={isMobile ? 'pl-4 mt-2 space-y-2' : 'absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg z-20 py-1'}>
              {item.links.filter(link => link.condition).map(link => (
                <li key={link.to}>
                    <NavLink to={link.to} onClick={closeMenus} className={({isActive}) => `block w-full text-left px-4 py-2 text-sm ${isActive ? "text-primary font-bold" : "text-textSecondary hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                      {link.label}
                    </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </>
  );

  return (
    <>
      <header className="bg-surface shadow-md sticky top-0 z-30">
        <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" onClick={closeMenus} className="text-2xl font-bold text-primary flex-shrink-0">
            Knowle
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2" ref={dropdownContainerRef}>
            {renderNavLinks(false)}
          </div>

          {/* Right side Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <div className="hidden lg:flex items-center space-x-3">
                  <NavLink to="/profile" className={({isActive}) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "text-primary bg-primary/10" : "text-textSecondary hover:text-primary hover:bg-primary/10"}`}>{t('header.profile')}</NavLink>
                  <Notifications />
                </div>
                <Button onClick={logout} variant="outline" className="hidden lg:block">{t('header.logout')}</Button>
              </>
            ) : (
              <div className="hidden lg:flex items-center space-x-2">
                <Link to="/login"><Button variant="outline">{t('header.login')}</Button></Link>
                <Link to="/register"><Button>{t('header.signUp')}</Button></Link>
              </div>
            )}
            <ThemeSwitcher />
            <LanguageSwitcher />
            
            {/* Hamburger Menu Button */}
            <div className="lg:hidden">
              <button 
                ref={hamburgerButtonRef}
                onClick={toggleDrawer} 
                aria-label="Open menu"
                aria-controls="mobile-menu"
                aria-expanded={isDrawerOpen}
              >
                <svg className="w-6 h-6 text-textPrimary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </button>
            </div>
          </div>
        </nav>
      </header>
      
      {/* Mobile Drawer */}
      <div className={`fixed inset-0 z-40 lg:hidden transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={toggleDrawer}></div>
        <div id="mobile-menu" role="dialog" aria-modal="true" className="relative w-72 max-w-[80vw] h-full bg-surface shadow-xl flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <Link to="/" onClick={closeMenus} className="text-2xl font-bold text-primary">Knowle</Link>
            <button onClick={toggleDrawer} aria-label="Close menu">
              <svg className="w-6 h-6 text-textPrimary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <nav className="flex-grow flex flex-col space-y-2 overflow-y-auto">
            {renderNavLinks(true)}
            <hr className="my-4"/>
             {user ? (
                <>
                  <NavLink to="/profile" onClick={closeMenus} className={({isActive}) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "text-primary bg-primary/10" : "text-textSecondary hover:text-primary hover:bg-primary/10"}`}>{t('header.profile')}</NavLink>
                  <div className="px-3 py-2 flex justify-between items-center">
                    <span className="font-medium text-textSecondary">Notifications</span>
                    <Notifications />
                  </div>
                  <Button onClick={() => { logout(); closeMenus(); }} variant="outline" className="w-full mt-4">{t('header.logout')}</Button>
                </>
              ) : (
                <div className="space-y-2 mt-4">
                  <Link to="/login" onClick={closeMenus} className="w-full"><Button variant="outline" className="w-full">{t('header.login')}</Button></Link>
                  <Link to="/register" onClick={closeMenus} className="w-full"><Button className="w-full">{t('header.signUp')}</Button></Link>
                </div>
              )}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;