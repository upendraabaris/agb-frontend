import React, { useState, useRef, useEffect, memo, forwardRef } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import StoreFeatures from 'globalValue/storeFeatures/StoreFeatures';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { Dropdown } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { USE_MULTI_LANGUAGE } from 'config.js';
import { layoutShowingNavMenu } from 'layout/layoutSlice';
// import { menuChangeCollapseAll } from './menuSlice.js';
import './main.css'; // Import your CSS file

const GET_SELLER_PERMISSION = gql`
  query GetSellerPermission {
    getSellerPermission {
      enquiryAssociate
    }
  }
`;

const HorizontalMenuDropdownToggle = memo(
  forwardRef(({ children, onClick, href = '#', active = false }, ref) => (
    <a
      ref={ref}
      className={classNames('dropdown-toggle', { active })}
      data-toggle="dropdown"
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
    >
      {children}
    </a>
  ))
);

const SidebarMenuItems = React.memo(({ menuItems = [] }) => {
  const storeFeaturess = StoreFeatures();
  const { isLogin, currentUser } = useSelector((state) => state.auth);
  const { loading, error, data } = useQuery(GET_SELLER_PERMISSION);
  const a = storeFeaturess?.fixSeries;
  const b = storeFeaturess?.customSeries;
  const c = data?.getSellerPermission?.enquiryAssociate;
  const currentUserRoles = ['seller', 'superSeller']; 
  const h = currentUserRoles.includes('seller');
  const i = currentUserRoles.includes('superSeller'); 

  return menuItems.map((item, index) => {
    if (item.path === '/admin/series') {
      return (
        <div key={`menu.${item.path}.${index}`}>
          {a ? <SidebarMenuItem id={item.path} item={item} /> : ''}
        </div>
      );
    }
    if (item.path === '/admin/tmt') {
      return (
        <div key={`menu.${item.path}.${index}`}>
          {b ? <SidebarMenuItem id={item.path} item={item} /> : ''}
        </div>
      );
    }
    if (item.path === '/seller/seller') {
      return (
        <div key={`menu.${item.path}.${index}`}>
          {h ? <SidebarMenuItem id={item.path} item={item} /> : ''}
        </div>
      );
    }
    if (item.path === '/seller/superSeller') {
      return (
        <div key={`menu.${item.path}.${index}`}>
          {i ? <SidebarMenuItem id={item.path} item={item} /> : ''}
        </div>
      );
    }
    if (item.path === '/seller/series') {
      return (
        <div key={`menu.${item.path}.${index}`}>
          {a ? <SidebarMenuItem id={item.path} item={item} /> : ''}
        </div>
      );
    }
    if (item.path === '/seller/tmt_product') {
      return (
        <div key={`menu.${item.path}.${index}`}>
          {b ? <SidebarMenuItem id={item.path} item={item} /> : ''}
        </div>
      );
    }
    if (item.path === '/seller/quotation') {
      return (
        <div key={`menu.${item.path}.${index}`}>
          {a ? <SidebarMenuItem id={item.path} item={item} /> : ''}
        </div>
      );
    }
    // if (item.path === '/seller/productenquiry') {
    //   return (
    //     <div key={`menu.${item.path}.${index}`}>
    //       {c ? <SidebarMenuItem id={item.path} item={item} /> : ''}
    //     </div>
    //   );
    // }
    return <SidebarMenuItem key={`menu.${item.path}.${index}`} id={item.path} item={item} />;
  });
});
SidebarMenuItems.displayName = 'SidebarMenuItems';

const SidebarMenuItem = ({ item, id }) => {
  const dispatch = useDispatch();
  const dropdownMenuRef = useRef();
  const { collapseAll } = useSelector((state) => state.menu);
  const { showingNavMenu } = useSelector((state) => state.layout);
  const { pathname } = useLocation();
  const { formatMessage: f } = useIntl();

  const isActive = item.path.startsWith('#') ? false : pathname === item.path || pathname.indexOf(`${item.path}/`) > -1;
  const [horizontalDropdownIsOpen, setHorizontalDropdownIsOpen] = useState(false);

  const getLabel = (icon, label) => (
    <>
      {icon && (
        <>
          <CsLineIcons icon={icon} className="cs-icon icon" />{' '}
        </>
      )}
      <span className="label">{USE_MULTI_LANGUAGE ? f({ id: label }) : label}</span>
    </>
  );

  const onToggleItem = (isOpen) => {
    setHorizontalDropdownIsOpen(isOpen);
  };

  const onHorizontalMenuDropdownToggleClick = () => {
    onToggleItem(!horizontalDropdownIsOpen);
    dispatch(layoutShowingNavMenu(''));
  };

  useEffect(() => {
    if (showingNavMenu !== '' && horizontalDropdownIsOpen) {
      onToggleItem(false);
    }
  }, [showingNavMenu, horizontalDropdownIsOpen]);

  if (item.subs) {
    return (
      <Dropdown as="li" key={id} onToggle={onToggleItem} show={horizontalDropdownIsOpen} className="side-menu">
        <Dropdown.Toggle as={HorizontalMenuDropdownToggle} onClick={onHorizontalMenuDropdownToggleClick} href={item.path} active={isActive}>
          {getLabel(item.icon, item.label)}
        </Dropdown.Toggle>
        <Dropdown.Menu ref={dropdownMenuRef} renderOnMount as="ul" align="left" className="opacityIn side-menu">
          <SidebarMenuItems menuItems={item.subs} />
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  if (item.isExternal) {
    return (
      <li key={id} className="side-menu">
        <a href={item.path} target="_blank" rel="noopener noreferrer">
          {getLabel(item.icon, item.label)}
        </a>
      </li>
    );
  }
  return (
    <li className="side-menu">
      <NavLink to={item.path} className={classNames({ active: isActive })} activeClassName="">
        {getLabel(item.icon, item.label)}
      </NavLink>
    </li>
  );
};

export default SidebarMenuItems;
