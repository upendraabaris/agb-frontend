import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, InputGroup, Modal } from 'react-bootstrap';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import { gql, useMutation, useQuery, useLazyQuery } from '@apollo/client';
import DOMPurify from 'dompurify';
import { NavLink, useHistory } from 'react-router-dom';
import Clamp from 'components/clamp';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import Empty from '../Empty.avif';
import '../cart.css';

const GET_SITE_CONTENT = gql`
  query GetSiteContent($key: String!) {
    getSiteContent(key: $key) {
      content
      key
    }
  }
`;

function CartItems({ data, addToCartHandler, b2b, removeItemFromCart }) {
  const history = useHistory();
  const { dataStoreFeatures1 } = useGlobleContext();
  function handleHomePage() {
    history.push(`/`);
  }

  const [show, setShow] = useState(false);
  const [getContent, { data: dataSiteContent }] = useLazyQuery(GET_SITE_CONTENT);
  useEffect(() => {
    getContent({
      variables: {
        key: 'checkOutMessage',
      },
    });
  }, []);
  const transportChargeType = data?.cartProducts?.some((charge) => charge.locationId.transportChargeType === 'Shipping Charge');
  const preCheckout = () => {
    if (transportChargeType) {
      setShow(true);
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      const button = document.getElementById('myButton');
      if (button) {
        button.click();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
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
      {data.cartProducts?.length > 0 ? (
        data.cartProducts.map((pItem, index) => {
          const { quantity, productId, variantId, locationId } = pItem;
          const discount = b2b ? locationId.b2bdiscount : locationId.b2cdiscount;
          const priceWithExtraCharge = locationId.price + locationId.extraCharge;
          const priceAfterDiscount = (((100 - discount) * priceWithExtraCharge) / 100).toFixed(2);
          const priceWithQty = (priceAfterDiscount * quantity).toFixed(2);
          const stock = locationId?.displayStock <= locationId?.mainStock ? locationId?.displayStock : locationId?.mainStock;
          return (
            <Card className="mb-2" key={index}>
              <div className="m-2">
                <div className="col-3 float-start">
                  <div className="col-12 text-center">
                    <img
                      src={productId.thumbnail || (productId.images && productId.images[0])}
                      className="border-light rounded-md h-100 sh-8 sw-8"
                      alt={productId.fullName}
                    />
                  </div>
                  <div className="col-12 text-center">
                    <Button
                      size="sm"
                      className="text-danger mt-1"
                      variant="foreground-alternate"
                      style={{ fontSize: '16px' }}
                      onClick={() => {
                        removeItemFromCart(variantId.id);
                      }}
                    >
                      <CsLineIcons className="text-danger w-20" />
                      🗑 Delete
                    </Button>
                    <>
                      {stock <= 0 && (
                        <Button
                          id="myButton"
                          size="sm"
                          className="text-white"
                          variant="foreground-alternate"
                          onClick={() => {
                            removeItemFromCart(variantId.id);
                          }}
                        >
                          .
                        </Button>
                      )}
                    </>
                  </div>
                </div>
                <div className="col-9 float-start">
                  <div className="h6 mb-0 mb-2">
                    <Clamp tag="span" clamp="1">
                      <NavLink to={`/product/${productId.identifier?.replace(/\s/g, '_').toLowerCase()}`} className="font_color fw-bold">
                        {productId.brand_name} - {productId.fullName} {variantId?.variantName}
                      </NavLink>
                    </Clamp>
                  </div>
                  <div className="float-start">
                    {discount ? (
                      <>
                        <div className="mb-0 sw-19 d-inline">
                          <del>₹ {priceWithExtraCharge}</del>
                        </div>
                        <p className="d-inline fw-normal fs-6 form-label " style={{ color: '#d73a39' }}>
                          {' '}
                          ₹ {priceAfterDiscount}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="d-inline fw-normal fs-6 form-label" style={{ color: '#d73a39' }}>
                          ₹ {priceAfterDiscount}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="float-start ps-2 pe-2" style={{ paddingTop: '1px' }}>
                    {' '}
                    x {quantity}
                  </div>
                  {/* <InputGroup className="spinner sw-7 float-start">
                    <InputGroup.Text id="basic-addon1">
                      <button
                        type="button"
                        className="spin-down single px-2"
                        onClick={() => {
                          if (quantity <= variantId.moq) {
                            toast.warning('Minimum quantity must be 1.', {
                              autoClose: 6000,
                            });
                            return;
                          }
                          addToCartHandler(productId.id, variantId.id, variantId.moq, variantId.minimunQty, locationId.id, -1, quantity, stock);
                        }}
                      >
                        -
                      </button>
                    </InputGroup.Text>
                    <InputGroup.Text id="basic-addon2">
                      <button
                        type="button"
                        className="spin-up single px-2"
                        onClick={() => {
                          if (quantity >= stock) {
                            toast.warning('Quantity limit has been maximized.', {
                              autoClose: 6000,
                            });
                            return;
                          }
                          addToCartHandler(productId.id, variantId.id, variantId.moq, variantId.minimunQty, locationId.id, 1, quantity, stock);
                        }}
                        disabled={quantity >= stock}
                      >
                        +
                      </button>
                    </InputGroup.Text>
                  </InputGroup> */}
                  <div className="h6 mb-0 float-start pt-1 fw-bold float-end">&#8377; {priceWithQty}</div>
                  <div className="col-12 float-start mt-1">
                    {stock <= 0 ? (
                      <div className="p-2 rounded bg-danger text-dark text-white ">Product currently out of stock.</div>
                    ) : (
                      <>
                        {locationId?.transportChargeType === 'Shipping Charge' ? (
                          <div className="text-dark pe-auto" style={{ cursor: 'pointer' }} onClick={() => preCheckout()}>
                            {' '}
                            Shipping Charge: <span className="text-primary">Extra</span>{' '}
                          </div>
                        ) : (
                          <>{locationId?.transportCharge === 0 ? `Delivery Free` : `${locationId?.transportChargeType}: ₹ ${locationId?.transportCharge}`}</>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })
      ) : (
        <div className="text-center">
          <Row>
            <Col xs="12" md="12" className="rounded p-4 bg-white">
              <img alt="Empty" src={Empty} style={{ borderRadius: '50px', height: '150px', width: '150px' }} />
              <h1 className="mt-4 mb-2 fw-bold">Your Cart is Empty </h1>
              <Button className="btn_color mt-2 mb-4 mt-4" onClick={() => handleHomePage()}>
                Start Shopping
              </Button>
            </Col>
          </Row>
        </div>
      )}

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Body className="mx-2 my-2 px-2 py-2">
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dataSiteContent?.getSiteContent?.content) }} className="mb-3" />
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="primary" className="btn-icon " onClick={() => setShow(false)}>
            <span>Close</span>
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CartItems;
