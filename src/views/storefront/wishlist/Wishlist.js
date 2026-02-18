import React, { useEffect } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { Row, Col, Button, Card, Tooltip, OverlayTrigger } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { NavLink } from 'react-router-dom';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { toast } from 'react-toastify';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import img from './wishlist.png';

const GET_WISHLIST_ITEMS = gql`
  query Wishlist {
    wishlist {
      id
      wishlistProducts {
        productId {
          id
          fullName
          brand_name
          identifier
          images
        }
      }
    }
  }
`;

const REMOVE_WISHLIST = gql`
  mutation RemoveFromWishlist($productId: ID) {
    removeFromWishlist(productId: $productId) {
      wishlistProducts {
        productId {
          brand_name
          fullName
          identifier
          id
        }
      }
    }
  }
`;

const ADD_TO_CART = gql`
  mutation AddToCart($productId: ID!, $quantity: Int!) {
    addToCart(productId: $productId, quantity: $quantity) {
      id
    }
  }
`;

function Wishlist() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);
  const title = 'Wishlist';
  const description = 'Wishlist ';
  const { loading, error, data, refetch } = useQuery(GET_WISHLIST_ITEMS);
  useEffect(() => {
    refetch();
  }, []);
  const [removeFromWishlist] = useMutation(REMOVE_WISHLIST, {
    onCompleted: () => {
      toast.success('Remove from wishlist');
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });
  async function handleRemoveWishlist(event) {
    await removeFromWishlist({
      variables: {
        productId: event,
      },
    });
  }
  const [AddToCart] = useMutation(ADD_TO_CART, {
    onCompleted: () => {
      toast('Product added to cart');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });
  const addToCartHandler = async (event) => {
    await AddToCart({
      variables: {
        productId: event,
        quantity: 1,
      },
    });
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container py-1 mb-2 borde">
        <Row className="g-0 align-items-center">
          <Col className="col-auto me-auto">
            <NavLink className="text-dark fw-bold" to="/">
              <span className="d-inline-block">Home</span>
            </NavLink>
            <span className="px-2 text-muted">/</span>
            <span className="fw-bold text-dark">Wishlist</span>
          </Col>
        </Row>
      </div>

      <Row>
        {data && data?.wishlist?.wishlistProducts?.length > 0 ? (
          <div className="mb-5">
            {data?.wishlist?.wishlistProducts?.map((wishlist) => (
              <Card key={wishlist?.productId?.id} className="mb-3 shadow-sm border-0">
                <Row className="g-0 p-3 align-items-center">
                  <Col xs="auto">
                    <img
                      className="rounded border"
                      style={{ height: '100px', width: '100px', objectFit: 'cover' }}
                      src={wishlist?.productId?.images[0]}
                      alt={wishlist?.productId?.fullName}
                    />
                  </Col>
                  <Col className="ps-3 d-flex justify-content-between align-items-center flex-wrap">
                    <div className="flex-grow-1">
                      <h5 className="mb-1">{wishlist?.productId?.fullName}</h5>
                      <p className="mb-1">Brand: {wishlist?.productId?.brand_name}</p>
                    </div>
                    <div className="d-flex align-items-center mt-2 mt-md-0">
                      <NavLink to={`/product/${wishlist?.productId?.identifier?.replace(/\s/g, '_').toLowerCase()}`} target="_blank">
                        <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip-cart">Product View</Tooltip>}>
                          <Button variant="outline-success" className="btn-icon btn-icon-only me-2">
                            <CsLineIcons icon="eye" />
                          </Button>
                        </OverlayTrigger>
                      </NavLink>
                      <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip-remove">Remove from Wishlist</Tooltip>}>
                        <Button variant="outline-danger" className="btn-icon btn-icon-only" onClick={() => handleRemoveWishlist(wishlist?.productId?.id)}>
                          <CsLineIcons icon="bin" />
                        </Button>
                      </OverlayTrigger>
                    </div>
                  </Col>
                </Row>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white rounded p-5 shadow-sm">
            <img src={img} alt="Empty Wishlist" style={{ height: '120px', width: '120px', borderRadius: '15px' }} />
            <h4 className="mt-4 text-dark">Your Wishlist is Empty</h4>
            <p className="text-secondary">Browse products and add your favorites!</p>
            <NavLink to="/" className="btn btn-primary mt-3">
              Continue Shopping
            </NavLink>
          </div>
        )}
      </Row>
    </>
  );
}

export default Wishlist;
