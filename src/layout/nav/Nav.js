import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { MENU_BEHAVIOUR, MENU_PLACEMENT } from 'constants.js';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import NavUserMenu from './NavUserMenu';
import NavIconMenu from './NavIconMenu';
import MainMenu from './main-menu/MainMenu';
import NavLogo from './NavLogo';
import NavMobileButtons from './NavMobileButtons';
import { menuChangeAttrMenuAnimate, menuChangeCollapseAll } from './main-menu/menuSlice';
import NavLanguageSwitcher from './NavLanguageSwitcher';

const DELAY = 80;

const Nav = () => {
  const { dataStoreFeatures1 } = useGlobleContext();
  const dispatch = useDispatch();
  const { navClasses, placementStatus, behaviourStatus, attrMobile, menuPadding } = useSelector((state) => state.menu);
  const mouseActionTimer = useRef(null);

  // Vertical menu semihidden state showing
  // Only works when the vertical menu is active and mobile menu closed
  const onMouseEnterDelay = () => {
    if (placementStatus.placementHtmlData === MENU_PLACEMENT.Vertical && behaviourStatus.behaviourHtmlData === MENU_BEHAVIOUR.Unpinned && attrMobile !== true) {
      dispatch(menuChangeCollapseAll(false));
      dispatch(menuChangeAttrMenuAnimate('show'));
    }
  };

  // Delayed one that hides or shows the menu. It's required to prevent collapse animation getting stucked
  const onMouseEnter = () => {
    if (mouseActionTimer.current) clearTimeout(mouseActionTimer.current);

    mouseActionTimer.current = setTimeout(() => {
      onMouseEnterDelay();
    }, DELAY);
  };

  // Vertical menu semihidden state hiding
  // Only works when the vertical menu is active and mobile menu closed
  const onMouseLeaveDelay = () => {
    if (placementStatus.placementHtmlData === MENU_PLACEMENT.Vertical && behaviourStatus.behaviourHtmlData === MENU_BEHAVIOUR.Unpinned && attrMobile !== true) {
      dispatch(menuChangeCollapseAll(true));
      dispatch(menuChangeAttrMenuAnimate('hidden'));
    }
  };

  const onMouseLeave = () => {
    if (mouseActionTimer.current) clearTimeout(mouseActionTimer.current);
    mouseActionTimer.current = setTimeout(() => {
      onMouseLeaveDelay();
    }, DELAY);
  };

  return (
    <div
      id="nav"
      style={{ background: dataStoreFeatures1?.getStoreFeature?.bgColor }}
      className={classNames('nav-container d-flex', navClasses)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <style>
        {`.bg_color {
          background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
          color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
        }`}
        {`.font_color {
          color: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
        }`}
        {`
          .btn_color {
            background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
            color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
            transition: background 0.3s ease;
            padding: 10px 30px;
            border: none;
            cursor: pointer;            
          }
          .btn_color:hover {
            background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
            filter: brightness(80%);       
          }
        `}
      </style>
      <div
        className="nav-content d-flex bg_color overflow-hidden"
        style={placementStatus.placementHtmlData === MENU_PLACEMENT.Horizontal && menuPadding ? { paddingRight: menuPadding } : {}}
      >
        <NavLogo />
        {/* <NavLanguageSwitcher /> */}
        <NavUserMenu />
        <NavIconMenu />
        <MainMenu />
        <NavMobileButtons />
      </div>
      <div className="nav-shadow" />
    </div>
  );
};
export default React.memo(Nav);
