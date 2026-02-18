import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { Col, Dropdown, Row } from 'react-bootstrap';
import { MENU_PLACEMENT } from 'constants.js';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { layoutShowingNavMenu } from 'layout/layoutSlice';
import { logoutUser } from 'auth/authSlice';
import { NavLink } from 'react-router-dom';

const NavUserMenuContent = ({ user }) => {
  let hrefUrl = '#/!';
  const dispatch = useDispatch();
  // const [hrefUrl, setHrefUrl] = useState("#/!")
  if (user && user.role?.includes('admin')) {
    hrefUrl = '/admin/dashboard';
  } else if (user && user.role?.includes('seller')) {
    hrefUrl = '/seller/dashboard';
  } else if (user && user.role?.includes('enquiry')) {
    hrefUrl = '/enquiry/dashboard';
  } else if (user && user.role?.includes('subBusiness')) {
    hrefUrl = '/subBusiness/dashboard';
  } else if (user && user.role?.includes('accounts')) {
    hrefUrl = '/accounts/dashboard';
  } else if (user && user.role?.includes('superSeller')) {
    hrefUrl = '/superSeller/dashboard';
  } else {
    hrefUrl = 'empty';
  }

  return (
    <div>
      <Row className="mb-0 ms-0 me-0">
        <Col xs="12" className="ps-1 pe-1 pb-2 mb-2 border-bottom">
          <ul className="list-unstyled">
            {hrefUrl !== 'empty' && (
              <li>
                <NavLink to={hrefUrl} className="text-dark fw-bold fs-6">
                  Associate Dashboard
                </NavLink>
              </li>
            )}
          </ul>
        </Col>
        <Col xs="12" className="p-1">
          <ul className="list-unstyled">
            <li>
              <NavLink to="/user/profile" className="text-dark">
                <CsLineIcons icon="sign" className="me-2" size="17" /> Profile
              </NavLink>
            </li>
          </ul>
        </Col>
        <Col xs="12" className="p-1">
          <ul className="list-unstyled">
            <li>
              <NavLink to="/user/orders" className="text-dark">
                <CsLineIcons icon="boxes" className="me-2" size="17" /> Orders
              </NavLink>
            </li>
          </ul>
        </Col>
        <Col xs="12" className="p-1">
          <ul className="list-unstyled">
            <li>
              <NavLink to="/wishlist" className="text-dark">
                <CsLineIcons icon="heart" className="me-2" size="17" /> Wishlist
              </NavLink>
            </li>
          </ul>
        </Col>
        <Col xs="12" className="ps-1 pe-1 border-top mt-2">
          <ul className="list-unstyled m-2 ms-0">
            <li onClick={() => dispatch(logoutUser())}>
              {/* <a href="#/!">
                <CsLineIcons icon="logout" className="me-2" size="17" /> <span className="align-middle">Logout</span>
              </a> */}
              <NavLink to="/">
                <CsLineIcons icon="logout" className="me-2" size="17" /> Logout
              </NavLink>
            </li>
          </ul>
        </Col>
      </Row>
      {/* <Row className="mb-1 ms-0 me-0">
        <Col xs="12" className="p-1 mb-2 pt-2">
          <div className="text-extra-small text-primary">Something</div>
        </Col>
        <Col xs="6" className="ps-1 pe-1">
          <ul className="list-unstyled">
            <li>
              <a href="#/!">Lorem</a>
            </li>
            <li>
              <a href="#/!">Ipsum</a>
            </li>
          </ul>
        </Col>
        <Col xs="6" className="pe-1 ps-1">
          <ul className="list-unstyled">
            <li>
              <a href="#/!">For</a>
            </li>
            <li>
              <a href="#/!">Check</a>
            </li>
          </ul>
        </Col>
      </Row> */}
      <Row className="mb-1 ms-0 me-0">
        {/* <Col xs="12" className="p-1 mb-3 pt-3">
          <div className="separator-light" />
        </Col> */}
        {/* <Col xs="6" className="ps-1 pe-1">
          <ul className="list-unstyled">
            <li>
              <a href="#/!">
                <CsLineIcons icon="help" className="me-2" size="17" /> <span className="align-middle">Help</span>
              </a>
            </li>
            <li>
              <a href="#/!">
                <CsLineIcons icon="file-text" className="me-2" size="17" /> <span className="align-middle">Test</span>
              </a>
            </li>
          </ul>
        </Col> */}
        {/* <Col xs="6" className="pe-1 ps-1">
          <ul className="list-unstyled">
            <li>
              <a href="#/!">
                <CsLineIcons icon="gear" className="me-2" size="17" /> <span className="align-middle">Test</span>
              </a>
            </li>
            <li onClick={() => dispatch(logoutUser())}>
              <a href="#/!">
                <CsLineIcons icon="logout" className="me-2" size="17" /> <span className="align-middle">Logout</span>
              </a>
            </li>
          </ul>
        </Col> */}
      </Row>
    </div>
  );
};

const NavUserMenuDropdownToggle = React.memo(
  React.forwardRef(({ onClick, expanded = false, user = {} }, ref) => (
    <a
      href="#/!"
      ref={ref}
      className="d-flex user position-relative"
      data-toggle="dropdown"
      aria-expanded={expanded}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick(e);
      }}
    >
      {user?.profilepic ? (
        <img className="profile" style={{ height: '50px', width: '50px', borderRadius: '35px' }} alt="dp" src={user?.profilepic} />
      ) : (
        <img className="profile" style={{ height: '50px', width: '50px', borderRadius: '35px' }} alt="dp" src="/img/profile/profile-11.webp" />
      )}
      <div className="name">
        {user?.firstName && user.firstName} {user?.lastName && user.lastName}
      </div>
    </a>
  ))
);

// Dropdown needs access to the DOM of the Menu to measure it
const NavUserMenuDropdownMenu = React.memo(
  React.forwardRef(({ style, className, user = {} }, ref) => {
    return (
      <div ref={ref} style={style} className={classNames('dropdown-menu dropdown-menu-end user-menu wide', className)}>
        <NavUserMenuContent user={user} />
      </div>
    );
  })
);

NavUserMenuDropdownMenu.displayName = 'NavUserMenuDropdownMenu';

const MENU_NAME = 'NavUserMenu';

const NavUserMenu = () => {
  const dispatch = useDispatch();
  const {
    placementStatus: { view: placement },
    behaviourStatus: { behaviourHtmlData },
    attrMobile,
    attrMenuAnimate,
  } = useSelector((state) => state.menu);

  const { isLogin, currentUser } = useSelector((state) => state.auth);
  const { color } = useSelector((state) => state.settings);
  const { showingNavMenu } = useSelector((state) => state.layout);

  const onToggle = (status, event) => {
    if (event && event.stopPropagation) event.stopPropagation();
    else if (event && event.originalEvent && event.originalEvent.stopPropagation) event.originalEvent.stopPropagation();
    dispatch(layoutShowingNavMenu(status ? MENU_NAME : ''));
  };

  useEffect(() => {
    dispatch(layoutShowingNavMenu(''));
    // eslint-disable-next-line
  }, [attrMenuAnimate, behaviourHtmlData, attrMobile, color]);

  if (!isLogin) {
    return (
      <div className="user-container d-flex" style={{ minHeight: '50px' }}>
        <NavLink to="/login" className="d-flex user position-relative btn btn-icon">
          Login
        </NavLink>
      </div>
    );
  }

  return (
    <Dropdown as="div" bsPrefix="user-container d-flex" onToggle={onToggle} show={showingNavMenu === MENU_NAME} drop="down">
      <Dropdown.Toggle as={NavUserMenuDropdownToggle} user={currentUser} />
      <Dropdown.Menu
        as={NavUserMenuDropdownMenu}
        user={currentUser}
        className="dropdown-menu dropdown-menu-end user-menu wide"
        popperConfig={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: () => {
                  if (placement === MENU_PLACEMENT.Horizontal) {
                    return [0, 7];
                  }
                  if (window.innerWidth < 768) {
                    return [-84, 7];
                  }

                  return [-78, 7];
                },
              },
            },
          ],
        }}
      />
    </Dropdown>
  );
};
export default React.memo(NavUserMenu);
