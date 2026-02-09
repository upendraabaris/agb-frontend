import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Badge, Dropdown } from 'react-bootstrap';
import { gql, useMutation, useSubscription, useLazyQuery } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import Cartitems from 'globalValue/CartItems/Cartitems';
import { toast } from 'react-toastify';
import { NavLink, useHistory } from 'react-router-dom';
import ScrollspyMobile from 'components/scrollspy/ScrollspyMobile';
import CategoryMenuContent from 'views/storefront/home/components/CategoryMenuContent';
import { menuChangeAttrMobile, menuChangeNavClasses } from './main-menu/menuSlice';
import './Cart.css';

const NavMobileButtons = () => {
  const dispatch = useDispatch();
  const { isLogin } = useSelector((state) => state.auth);
  const history = useHistory();
  const { navClasses } = useSelector((state) => state.menu);
  const { items: scrollspyItems } = useSelector((state) => state.scrollspy);

  // handle cart length
  const [cartLegth, setCartLength] = useState(0);
  const { loading, cartData } = Cartitems();

  const SEARCH = gql`
    query HomePageSearch($search: String) {
      homePageSearch(search: $search) {
        fullName
        approve
      }
    }
  `;

  useEffect(() => {
    setCartLength(cartData);
  }, [cartData, loading]);

  const [show, setShow] = useState(false);
  const [query, setQuery] = useState('');
  const [searchError, setSearchError] = useState('');

  function handleSearch() {
    if (query === '') {
      setSearchError('Please enter a product name to search');
    } else {
      history.push(`/search?query=${query.replace(/\s/g, '_').toLowerCase()}`);
      setShow(false);
    }
  }

  function handleSearchMoveToNextPage() {
    if (query === '') {
      setSearchError('Please enter a product name to search');
    } else {
      history.push(`/search?query=${query.replace(/\s/g, '_').toLowerCase()}`);
      setShow(false);
    }
  }

  // Starts mobile menu opening sequence
  const showMobileMenu = (e) => {
    e.preventDefault();
    dispatch(menuChangeAttrMobile(true));
    let newNavClasses = {
      ...navClasses,
      'mobile-top-out': true,
      'mobile-top-in': false,
      'mobile-top-ready': false,
    };
    dispatch(menuChangeNavClasses(newNavClasses));
    setTimeout(() => {
      newNavClasses = {
        ...newNavClasses,
        'mobile-top-out': false,
        'mobile-side-ready': true,
      };
      dispatch(menuChangeNavClasses(newNavClasses));
    }, 200);
    setTimeout(() => {
      newNavClasses = {
        ...newNavClasses,
        'mobile-side-in': true,
      };
      dispatch(menuChangeNavClasses(newNavClasses));
    }, 230);
  };

  // Starts mobile menu closing sequence
  const hideMobileMenu = () => {
    let newNavClasses = {
      ...navClasses,
      'mobile-side-out': true,
      'mobile-side-ready': true,
      'mobile-side-in': false,
    };
    dispatch(menuChangeNavClasses(newNavClasses));
    setTimeout(() => {
      newNavClasses = {
        ...newNavClasses,
        'mobile-side-ready': false,
        'mobile-side-out': false,
        'mobile-top-ready': true,
      };
      dispatch(menuChangeNavClasses(newNavClasses));
    }, 200);
    setTimeout(() => {
      newNavClasses = {
        ...newNavClasses,
        'mobile-top-in': true,
        'mobile-top-ready': true,
      };
      dispatch(menuChangeNavClasses(newNavClasses));
      dispatch(menuChangeAttrMobile(false));
    }, 230);
  };

  useEffect(() => {
    if (navClasses && navClasses['mobile-side-in']) {
      window.addEventListener('click', hideMobileMenu);
    }
    return () => {
      window.removeEventListener('click', hideMobileMenu);
    };
    // eslint-disable-next-line
  }, [navClasses]);

  function handleSearch2() {
    setShow(true);
  }

  return (
    // mobile view code for menu
    <div className="mobile-buttons-container px-2">
      <div className="mx-2">
        <div>
          <a href="#/" onClick={() => handleSearch2()}>
            <CsLineIcons icon="search" size="18" className="text-white" />
          </a>
        </div>
        <Modal id="searchPagesModal" className="modal-under-nav modal-search modal-close-out mt-5" size="lg" show={show} onHide={() => setShow(false)}>
          <div className="fw-bold p-5 pb-2 fs-6 ">Search for Products and Brands</div>
          <Modal.Header className="ps-5 pt-3 pe-5 border-0 p-0">
            <div className="w-100">
              <Form.Control
                type="text"
                placeholder="Search for products, brands and more"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchMoveToNextPage();
                  }
                }}
              />
              {searchError && <div className="text-danger small mt-1">{searchError}</div>}
            </div>
          </Modal.Header>

          <Modal.Body className=" mx-3 ms-0 border-0 modal-body">
            <Button className="mx-2 w-100 mb-4 mt-0" onClick={() => handleSearchMoveToNextPage()}>
              Search
            </Button>
          </Modal.Body>
        </Modal>
      </div>
      {isLogin ? (
        <div className="mx-1">
          <NavLink to="/cart" className="position-relative text-white">
            <CsLineIcons icon="cart" size="18" />
            {cartLegth?.cartProducts?.length > 0 && (
              <Badge pill bg="light" text="dark" className="position-absolute e-n2 cart-mobile">
                {cartLegth?.cartProducts?.length}
              </Badge>
            )}
          </NavLink>
        </div>
      ) : (
        ''
      )}
      {scrollspyItems && scrollspyItems.length > 0 && <ScrollspyMobile items={scrollspyItems} />}
      <a href="#/" id="mobileMenuButton" className="menu-button" onClick={showMobileMenu}>
        <CsLineIcons icon="menu" />
      </a>
      {isLogin ? (
        <img className="profile" style={{ height: '22px', width: '22px', borderRadius: '35px' }} alt="dp" src="/img/profile/profile-11.webp" />
      ) : (
        <NavLink to="/login" className="ps-1 small">
          <span className="small text-center">Login</span>
        </NavLink>
      )}
    </div>
  );
};
export default React.memo(NavMobileButtons);
