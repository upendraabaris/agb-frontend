import React, { useState, useEffect } from 'react';
import { Badge, Modal, Form, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { gql, useMutation, useSubscription, useLazyQuery } from '@apollo/client';
import { NavLink, useHistory } from 'react-router-dom';
import { MENU_BEHAVIOUR } from 'constants.js';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { toast } from 'react-toastify';
import { settingsChangeColor } from 'settings/settingsSlice';
import { useWindowSize } from 'hooks/useWindowSize';
import Cartitems from 'globalValue/CartItems/Cartitems';
import IconMenuNotifications from './notifications/Notifications';
import SearchModal from './search/SearchModal';
import { menuChangeBehaviour } from './main-menu/menuSlice';
import './Cart.css';

const NavIconMenu = () => {
  const { pinButtonEnable, behaviour } = useSelector((state) => state.menu);
  const { color } = useSelector((state) => state.settings);
  const { isLogin } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const history = useHistory();

  // handle cart length
  const [cartLegth, setCartLength] = useState(0);
  const { loading, cartData } = Cartitems();

  useEffect(() => {
    setCartLength(cartData);
  }, [cartData, loading]);

  const [show, setShow] = useState(false);

  const onPinButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (pinButtonEnable) {
      dispatch(menuChangeBehaviour(behaviour === MENU_BEHAVIOUR.Pinned ? MENU_BEHAVIOUR.Unpinned : MENU_BEHAVIOUR.Pinned));
    }
    return false;
  };
  const onDisabledPinButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onLightDarkModeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(settingsChangeColor(color.includes('light') ? color.replace('light', 'dark') : color.replace('dark', 'light')));
  };
  const [showSearchModal, setShowSearchModal] = useState(false);

  const onSearchIconClick = (e) => {
    e.preventDefault();
  };

  const SEARCH = gql`
    query HomePageSearch($search: String) {
      homePageSearch(search: $search) {
        fullName
        approve
      }
    }
  `;

  const [isLoaded, setIsLoaded] = useState(false);

  const { themeValues } = useSelector((state) => state.settings);
  const xlBreakpoint = parseInt(themeValues.xl.replace('px', ''), 10);
  const { width } = useWindowSize();
  const [isXlScreen, setIsXlScreen] = useState(false);
  const [isOpenCategoriesModal, setIsOpenCategoriesModal] = useState(false);

  useEffect(() => {
    if (width) {
      if (width >= xlBreakpoint) {
        if (!isXlScreen) setIsXlScreen(true);
        if (isOpenCategoriesModal) setIsOpenCategoriesModal(false);
      } else if (isXlScreen) setIsXlScreen(false);
    }
    return () => {};
    // eslint-disable-next-line
  }, [width]);

  const [query, setQuery] = useState('');

  function handleSearch() {
    if (query === '') {
      toast.warning('Please enter a product name to search.');
    } else {
      history.push(`/search?query=${query.replace(/\s/g, '_').toLowerCase()}`);
      setShow(false);
    }
  }

  function handleSearchMoveToNextPage() {
    if (query === '') {
      toast.warning('Please enter a product name to search.');
    } else {
      history.push(`/search?query=${query.replace(/\s/g, '_').toLowerCase()}`);
      setShow(false);
    }
  }

  function handleSearch2() {
    setShow(true);
  }

  return (
    <>
      <ul className="list-unstyled list-inline text-center menu-icons">
        {isXlScreen && (
          <>
            <li className="list-inline-item">
              <div className="input-group rounded">
                <input
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  placeholder="Search for products, brands and more"
                  type="search"
                  style={{ width: '600px', height: '50px' }}
                  className="form-control rounded mt-3 mb-2 SearchBar"
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </li>
            <li className="list-inline-item">
              <a href="#/" onClick={() => handleSearch()}>
                <CsLineIcons icon="search" size="18" />
              </a>
            </li>
          </>
        )}
        {!isXlScreen && (
          <li className="list-inline-item">
            <a href="#/" onClick={() => handleSearch2()}>
              <CsLineIcons icon="search" size="18" />
            </a>
          </li>
        )}
        {/* {isLogin && (
          <li className="list-inline-item">
            <NavLink to="/wishlist">
              <CsLineIcons icon="heart" size="18" />
            </NavLink>
          </li>
        )} */}
        <li className="list-inline-item ">
          <NavLink to="/cart" className="position-relative">
            <CsLineIcons icon="cart" size="18" />
            {cartLegth?.cartProducts?.length > 0 && (
              <Badge pill bg="light" text="dark" className="position-absolute e-n2 cart-pc">
                {cartLegth?.cartProducts?.length}
              </Badge>
            )}
          </NavLink>
        </li>
        {/* <li className="list-inline-item">
          <a
            href="#/"
            id="pinButton"
            onClick={pinButtonEnable ? onPinButtonClick : onDisabledPinButtonClick}
            className={classNames('pin-button', { disabled: !pinButtonEnable })}
          >
            <CsLineIcons icon="lock-on" size="18" className="unpin" />
            <CsLineIcons icon="lock-off" size="18" className="pin" />
          </a>
        </li> */}
        {/* <li className="list-inline-item">
          <a href="#/" id="colorButton" onClick={onLightDarkModeClick}>
            <CsLineIcons icon="light-on" size="18" className="light" />
            <CsLineIcons icon="light-off" size="18" className="dark" />
          </a>
        </li> */}
        {/* <IconMenuNotifications /> */}
      </ul>
      <Modal id="searchPagesModal" className="modal-under-nav modal-search modal-close-out mt-5" size="lg" show={show} onHide={() => setShow(false)}>
        <div className="fw-bold p-5 pb-2 fs-6 ">Search for Products and Brands</div>
        <Modal.Header closeButton className="ps-5 pt-3 pe-5 border-0 p-0">
          <Form.Control
            type="text"
            placeholder='Search for products, brands and more'
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchMoveToNextPage();
              }
            }}
          />
        </Modal.Header>
        <Modal.Body className="ps-5 pe-5 pb-0 border-0">
          <Button className="mx-2 w-100 mb-4 mt-0" onClick={() => handleSearchMoveToNextPage()}>
            Search
          </Button>
          {/* {searchData?.homePageSearch && (
            <div>
              {searchData.homePageSearch.map((item) => (
                <p className="cursor-pointer" onClick={() => handleSelection(item.fullName)} key={item}>
                  {item.fullName}
                </p>
              ))}
            </div>
          )} */}
        </Modal.Body>
        {/* <Modal.Footer className="border-top justify-content-start ps-5 pe-5 pb-3 pt-3 border-0">
        <span className="text-alternate d-inline-block m-0 me-3">
          <CsLineIcons icon="arrow-bottom" size="15" className="text-alternate align-middle me-1" />
          <span className="align-middle text-medium">Navigate</span>
        </span>
        <span className="text-alternate d-inline-block m-0 me-3">
          <CsLineIcons icon="arrow-bottom-left" size="15" className="text-alternate align-middle me-1" />
          <span className="align-middle text-medium">Select</span>
        </span>
      </Modal.Footer> */}
      </Modal>
      {/* <SearchModal show={showSearchModal} setShow={setShowSearchModal} /> */}
    </>
  );
};

export default React.memo(NavIconMenu);
