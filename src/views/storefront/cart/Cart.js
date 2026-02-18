import React, { useEffect, useState } from 'react';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Button } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import Cartitems from 'globalValue/CartItems/Cartitems';
import CartItems from './components/CartItems';
import AddToCartSummary from './components/AddToCartSummary';
import './cart.css';
import Empty from './Empty.avif';

const ADD_TO_CART = gql`
  mutation AddToCart($cartinput: [CartInput]) {
    addToCart(cartinput: $cartinput) {
      id
    }
  }
`;
const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($variantId: ID) {
    removeFromCart(variantId: $variantId) {
      id
    }
  }
`;
const MINIMUM_ORDER = gql`
  query GetSiteContent($key: String!) {
    getSiteContent(key: $key) {
      key
      content
    }
  }
`;

const Cart = () => {
  const title = 'Cart';
  const description = 'Ecommerce Cart Page';
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const [b2b, setB2B] = useState(false);
  const { loading, cartData, error, refetch } = Cartitems();
  const history = useHistory();
  const { dataStoreFeatures1 } = useGlobleContext();
  function handleHomePage() {
    history.push(`/`);
  }
  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    refetch();
  }, [refetch]);
  useEffect(() => {
    if (error?.message === 'Authorization header is missing' || error?.message === 'jwt expired') {
      setTimeout(() => {
        history.push('/login');
      }, 2000);
    }
  }, [error, history]);
  useEffect(() => {
    const role = currentUser?.role?.some((role1) => role1 === 'b2b');
    setB2B(role);
  }, [currentUser]);
  const [AddToCart, { loading: addtocartLoading }] = useMutation(ADD_TO_CART, {
    onError: (erroronadd) => {
      toast.error(erroronadd.message || 'Something went wrong!');
    },
  });
  const [processing, setProcessing] = useState(false);
  const addToCartHandler = async (productID, variantID, moq, minimunQty, locationID, value, quantity, stock) => {
    const newQuantity = quantity + value * moq;
    if (newQuantity < minimunQty) {
      return;
    }
    if (newQuantity > stock) {
      return;
    }
    if (processing) {
      return;
    }
    setProcessing(true);
    try {
      const qty = value * moq;
      if (quantity + qty < minimunQty) {
        return;
      }
      if (quantity + qty > stock) {
        return;
      }
      await AddToCart({
        variables: {
          cartinput: [
            {
              productId: productID,
              variantId: variantID,
              locationId: locationID,
              quantity: qty,
            },
          ],
        },
      });

      refetch();
    } finally {
      setProcessing(false);
    }
  };
  const [RemoveFromCart, { loading: removeLoading }] = useMutation(REMOVE_FROM_CART, {
    onError(err) {
      toast.error(err.message || 'Something went wrong!');
    },
  });
  const [processRemoving, setprocessRemoving] = useState(false);
  const removeItemFromCart = async (variantID) => {
    if (processRemoving) {
      return;
    }
    setprocessRemoving(true);
    try {
      await RemoveFromCart({
        variables: {
          variantId: variantID,
        },
      });
      refetch();
    } finally {
      setprocessRemoving(false);
    }
  };
  const [freeDeliveryValue, setFreeDeliveryValue] = useState(0);
  const [getMinimum] = useLazyQuery(MINIMUM_ORDER, {
    onCompleted: (res) => {
      if (res.getSiteContent.key === 'freeDelivery') {
        setFreeDeliveryValue(parseInt(res.getSiteContent.content, 10));
      }
    },
    onError: (err) => {
      console.error(err);
    },
  });
  useEffect(() => {
    const handlecartterms = async () => {
      await getMinimum({
        variables: {
          key: 'freeDelivery',
        },
      });
    };
    handlecartterms();
  }, []);

  return (
    <>
      <HtmlHead title={title} description={description} />
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
      <Row>
        <Col xs="12" className="col-lg order-lg-0 order-0 ">
          {cartData && cartData?.cartProducts?.length > 0 && (
            <div className="text-center fw-bold py-1 bg_color pt-2 pb-2 rounded">My Cart ({cartData?.cartProducts?.length || 0} Items)</div>
          )}
          <div className="mb-2">
            {loading || removeLoading || addtocartLoading || error?.message === 'Authorization header is missing' || error?.message === 'jwt expired' ? (
              <div className="loader-container">
                <div className="loader">
                  <span className="bar" />
                  <span className="bar" />
                  <span className="bar" />
                </div>
              </div>
            ) : (
              <>
                <div className={addtocartLoading || removeLoading ? 'blur-background' : ''}>
                  {cartData ? (
                    <CartItems data={cartData} addToCartHandler={addToCartHandler} b2b={b2b} removeItemFromCart={removeItemFromCart} />
                  ) : (
                    <div className="text-center">
                      <Row>
                        <Col xs="12" md="6">
                          <img alt="Empty" src={Empty} style={{ borderRadius: '50px', height: '350px', width: '350px' }} />
                        </Col>
                        <Col xs="12" md="6" className="mt-6">
                          <h1 className="mt-6 mb-2">Your Cart is Empty!</h1>
                          <Button className="btn btn-lg btn-primary mt-2" onClick={() => handleHomePage()}>
                            Start Shopping
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          {cartData && cartData?.cartProducts?.length > 0 && !(freeDeliveryValue >= 5000000) && (
            <>
              <Card className="mx-0 px-0 mb-2 mt-2 border border-primary rounded-2 shadow-sm">
                <div className="bg-primary px-3 text-white py-2 rounded-top">🎉 Free Delivery Offer! 🚚</div>
                <p className="my-2 mx-3 text-dark fw-bold">
                  Enjoy <span className="text-primary">FREE DELIVERY</span> across India on Cart Value above ₹{freeDeliveryValue}!
                </p>
              </Card>
            </>
          )}
        </Col>
        <Col xs="12" lg="auto" className="order-1 order-lg-1">
          {cartData && <AddToCartSummary b2b={b2b} cartData={cartData} currentUser={currentUser} />}
        </Col>
      </Row>
    </>
  );
};

export default Cart;
