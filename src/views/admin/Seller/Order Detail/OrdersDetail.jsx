import React, { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { Row, Col, Button, Dropdown, Card } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { gql, useLazyQuery } from '@apollo/client';

const OrdersDetail = () => {
  const title = 'Order Detail';
  const description = 'Ecommerce Order Detail Page';
  const { sellerID, orderid } = useParams();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const ORDER_DETAIL = gql`
    query GetSingleOrderBySellerId($orderId: ID, $sellerId: ID) {
      getSingleOrderBySellerId(orderId: $orderId, sellerId: $sellerId) {
        id
        shippingAddress {
          id
          addressLine1
          addressLine2
          city
          country
          state
          postalCode
          user {
            firstName
            lastName
            mobileNo
          }
        }
        billingAddress {
          id
          user {
            firstName
            lastName
            mobileNo
          }
          addressLine1
          addressLine2
          city
          state
          postalCode
          country
        }
        status
        totalAmount
        paymentMethod
        user {
          id
          firstName
          lastName
          email
          mobileNo
          profilepic
        }
        orderProducts {
          variantId {
            id
            variantName
            hsn
          }
          locationId {
            id
            gstRate
            b2cdiscount
            b2bdiscount
            unitType
          }
          productId {
            id
            brand_name
            fullName
            images
            thumbnail
            fixedComm
            fixedCommType
            listingComm
            listingCommType
            productComm
            productCommType
            shippingComm
            shippingCommType
          }
          quantity
          price
        }
      }
    }
  `;

  const [GetSingleOrderBySellerId, { data: orderDetailData }] = useLazyQuery(ORDER_DETAIL, {
    variables: {
      orderId: orderid,
      sellerId: sellerID,
    },
    onError: (error) => {
      console.error('ORDER_DETAIL', error);
    },
  });

  useEffect(() => {
    GetSingleOrderBySellerId();
  }, []);

  const [totalCartValue, setTotalCartValue] = useState(0);

  useEffect(() => {
    if (orderDetailData && orderDetailData.getSingleOrderBySellerId) {
      const { orderProducts } = orderDetailData.getSingleOrderBySellerId;

      const calculatedTotalCartValue = orderProducts.reduce((total, product) => total + product.price, 0);

      setTotalCartValue(calculatedTotalCartValue);
    }
  }, [orderDetailData]);

  // handle comission

  const [listingComm1, setListingComm] = useState(0);
  const [productComm1, setProductComm] = useState(0);
  const [shippingComm1, setShippingComm] = useState(0);
  const [fixedComm1, setFixedComm] = useState(0);

  useEffect(() => {
    if (orderDetailData && orderDetailData.getSingleOrderBySellerId) {
      const { orderProducts } = orderDetailData.getSingleOrderBySellerId;

      const list = orderProducts.map(({ quantity, productId }) => {
        let listing = 0;
        let productComm = 0;
        let shippingComm = 0;
        let fixedComm = 0;

        if (productId.listingCommType === 'fix') {
          listing = productId.listingComm;
        } else if (productId.listingCommType === 'percentage') {
          listing = productId.listingComm / 100;
        }

        if (productId.productCommType === 'fix') {
          productComm = productId.productComm * quantity;
        } else if (productId.productCommType === 'percentage') {
          productComm = (productId.productComm / 100) * quantity;
        }

        if (productId.shippingCommType === 'fix') {
          shippingComm = productId.shippingComm * quantity;
        } else if (productId.shippingCommType === 'percentage') {
          shippingComm = (productId.shippingComm / 100) * quantity;
        }

        if (productId.fixedCommType === 'fix') {
          fixedComm = productId.fixedComm * quantity;
        } else if (productId.fixedCommType === 'percentage') {
          fixedComm = (productId.fixedComm / 100) * quantity;
        }

        return { listing, productComm, shippingComm, fixedComm };
      });

      // Update the state variables
      const totalListingComm = list.reduce((total, item) => total + item.listing, 0);
      const totalProductComm = list.reduce((total, item) => total + item.productComm, 0);
      const totalShippingComm = list.reduce((total, item) => total + item.shippingComm, 0);
      const totalFixedComm = list.reduce((total, item) => total + item.fixedComm, 0);

      setListingComm(parseFloat(totalListingComm.toFixed(2)));
      setProductComm(parseFloat(totalProductComm.toFixed(2)));
      setShippingComm(parseFloat(totalShippingComm.toFixed(2)));
      setFixedComm(parseFloat(totalFixedComm.toFixed(2)));
    }
  }, [orderDetailData]);

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to={`/admin/seller/detail/${sellerID}`}>
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Seller</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
          </Col>
          {/* Title End */}

          {/* Top Buttons Start */}
          <Col xs="12" sm="auto" className="d-flex align-items-end justify-content-end mb-2 mb-sm-0 order-sm-3">
            <Dropdown className="w-100 w-md-auto">
              <Dropdown.Toggle className="w-100 w-md-auto" variant="outline-primary">
                Status: Delivered
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>Status: Pending</Dropdown.Item>
                <Dropdown.Item>Status: Shipped</Dropdown.Item>
                <Dropdown.Item>Status: Delivered</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown className="ms-1">
              <Dropdown.Toggle className="btn-icon btn-icon-only dropdown-toggle-no-arrow" variant="outline-primary">
                <CsLineIcons icon="more-horizontal" />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>Edit</Dropdown.Item>
                <Dropdown.Item>View Invoice</Dropdown.Item>
                <Dropdown.Item>Track Package</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
          {/* Top Buttons End */}
        </Row>
      </div>

      {orderDetailData && (
        <Row>
          <Col xl="8" xxl="9">
            {/* Status Start */}
            <h2 className="small-title">Status</h2>
            <Row className="g-2 mb-5">
              <Col sm="6">
                <Card className="sh-13 sh-lg-15 sh-xl-14">
                  <Card.Body className="h-100 py-3 d-flex align-items-center">
                    <Row className="g-0 align-items-center">
                      <Col xs="auto" className="pe-3">
                        <div className="border border-primary sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center">
                          <CsLineIcons icon="tag" className="text-primary" />
                        </div>
                      </Col>
                      <Col>
                        <div className="d-flex align-items-center lh-1-25">Order Id</div>
                        <div className="text-primary">{orderDetailData.getSingleOrderBySellerId.id}</div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
              <Col sm="6">
                <Card className="sh-13 sh-lg-15 sh-xl-14">
                  <Card.Body className="h-100 py-3 d-flex align-items-center">
                    <Row className="g-0 align-items-center">
                      <Col xs="auto" className="pe-3">
                        <div className="border border-primary sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center">
                          <CsLineIcons icon="clipboard" className="text-primary" />
                        </div>
                      </Col>
                      <Col>
                        <div className="d-flex align-items-center lh-1-25">Order Status</div>
                        <div className="text-primary">{orderDetailData.getSingleOrderBySellerId.status}</div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
              <Col sm="6">
                <Card className="sh-13 sh-lg-15 sh-xl-14">
                  <Card.Body className="h-100 py-3 d-flex align-items-center">
                    <Row className="g-0 align-items-center">
                      <Col xs="auto" className="pe-3">
                        <div className="border border-primary sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center">
                          <CsLineIcons icon="calendar" className="text-primary" />
                        </div>
                      </Col>
                      <Col>
                        <div className="d-flex align-items-center lh-1-25">Delivery Date</div>
                        <div className="text-primary">{orderDetailData.getSingleOrderBySellerId.paymentMethod.replace('_', ' ').toUpperCase()} 17.11.2023</div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
              <Col sm="6">
                <Card className="sh-13 sh-lg-15 sh-xl-14">
                  <Card.Body className="h-100 py-3 d-flex align-items-center">
                    <Row className="g-0 align-items-center">
                      <Col xs="auto" className="pe-3">
                        <div className="border border-primary sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center">
                          <CsLineIcons icon="shipping" className="text-primary" />
                        </div>
                      </Col>
                      <Col>
                        <div className="d-flex align-items-center lh-1-25">Tracking Code</div>
                        <div className="text-primary">US4244290109</div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            {/* Status End */}

            {/* Cart Start */}
            <h2 className="small-title">Cart</h2>
            <Card className="mb-5">
              <Card.Body>
                <div className="mb-5">
                  {orderDetailData?.getSingleOrderBySellerId?.orderProducts.length > 0 && (
                    <table className="table">
                      <thead>
                        <tr>
                          <th scope="col">Product</th>
                          <th scope="col">Commission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetailData.getSingleOrderBySellerId.orderProducts.map((product, index) => (
                          <tr key={index}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={product.productId.thumbnail || (product.productId.images && product.productId.images)}
                                  className="card-img rounded-md h-100 sw-10"
                                  alt="thumb"
                                />
                                <div className="ps-3">
                                  <div>{product.productId.fullName}</div>
                                  <div className="text-muted text-small">{product.variantId.variantName}</div>
                                  <div className="text-muted text-small">{product.productId.brand_name}</div>
                                  <Row className="g-0">
                                    <Col xs="6" className="d-flex flex-row pe-2 align-items-end text-alternate">
                                      <span>{product.quantity}</span>
                                      <span className="text-muted ms-1 me-1">x</span>
                                      <span>{product.price / product.quantity}</span>
                                    </Col>
                                    <Col xs="6" className="d-flex flex-row align-items-end justify-content-end text-alternate">
                                      <span>
                                        <span className="text-small">₹ </span>
                                        {product.price}
                                      </span>
                                    </Col>
                                  </Row>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                <Row className="g-0">
                                  <Col xs="6" className="d-flex flex-row pe-2 align-items-end text-muted text-small">
                                    <span>Listing Comm</span>
                                  </Col>
                                  <Col xs="6" className="d-flex flex-row align-items-end justify-content-end text-alternate">
                                    <span>
                                      {product.productId.listingCommType === 'fix' ? product.productId.listingComm : `${product.productId.listingComm / 100} %`}
                                    </span>
                                  </Col>
                                </Row>
                              </div>
                              <div>
                                <Row className="g-0">
                                  <Col xs="6" className="d-flex flex-row pe-2 align-items-end text-muted text-small">
                                    <span>Fixed Comm</span>
                                  </Col>
                                  <Col xs="6" className="d-flex flex-row align-items-end justify-content-end text-alternate">
                                    <span>
                                      {product.productId.fixedCommType === 'fix' ? product.productId.fixedComm : `${product.productId.fixedComm / 100} %`}
                                    </span>
                                    <span className="text-muted mx-1">x</span>
                                    <span>{product.quantity}</span>

                                    <span className="text-muted mx-1"> = </span>
                                    <span className="text-muted mx-1">
                                      {(product.productId.fixedCommType === 'fix' ? product.productId.fixedComm : product.productId.fixedComm / 100) *
                                        product.quantity}
                                    </span>
                                  </Col>
                                </Row>
                              </div>
                              <div>
                                <Row className="g-0">
                                  <Col xs="6" className="d-flex flex-row pe-2 align-items-end text-muted text-small">
                                    <span>Product Comm</span>
                                  </Col>
                                  <Col xs="6" className="d-flex flex-row align-items-end justify-content-end text-alternate">
                                    <span>
                                      {product.productId.productCommType === 'fix' ? product.productId.productComm : `${product.productId.productComm / 100} %`}
                                    </span>
                                    <span className="text-muted ms-1 me-1">x</span>
                                    <span>{product.quantity}</span>
                                    <span className="text-muted mx-1"> = </span>
                                    <span className="text-muted mx-1">
                                      {(product.productId.productCommType === 'fix' ? product.productId.productComm : product.productId.productComm / 100) *
                                        product.quantity}
                                    </span>
                                  </Col>
                                </Row>
                              </div>
                              <div>
                                <Row className="g-0">
                                  <Col xs="6" className="d-flex flex-row pe-2 align-items-end text-muted text-small">
                                    <span>shipping Comm</span>
                                  </Col>
                                  <Col xs="6" className="d-flex flex-row align-items-end justify-content-end text-alternate">
                                    <span>
                                      {product.productId.shippingCommType === 'fix'
                                        ? product.productId.shippingComm
                                        : `${product.productId.shippingComm / 100} %`}
                                    </span>
                                    <span className="text-muted ms-1 me-1">x</span>
                                    <span>{product.quantity}</span>
                                    <span className="text-muted mx-1"> = </span>
                                    <span className="text-muted mx-1">
                                      {(product.productId.shippingCommType === 'fix' ? product.productId.shippingComm : product.productId.shippingComm / 100) *
                                        product.quantity}
                                    </span>
                                  </Col>
                                </Row>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div>
                  <Row className="g-0 mb-2">
                    <Col xs="auto" className="ms-auto ps-3 text-muted">
                      Total
                    </Col>
                    <Col xs="auto" className="sw-13 text-end">
                      <span>
                        <span className="text-muted">₹ </span>
                        {totalCartValue && totalCartValue}
                      </span>
                    </Col>
                  </Row>
                  <Row className="g-0 mb-2">
                    <Col xs="auto" className="ms-auto ps-3 text-muted">
                      Listing Commission
                    </Col>
                    <Col xs="auto" className="sw-13 text-end">
                      <span>
                        <span className="text-muted">₹ </span>
                        {listingComm1 && listingComm1}
                      </span>
                    </Col>
                  </Row>
                  <Row className="g-0 mb-2">
                    <Col xs="auto" className="ms-auto ps-3 text-muted">
                      Product Commission
                    </Col>
                    <Col xs="auto" className="sw-13 text-end">
                      <span>
                        <span className="text-muted">₹ </span>
                        {productComm1 && productComm1}
                      </span>
                    </Col>
                  </Row>
                  <Row className="g-0 mb-2">
                    <Col xs="auto" className="ms-auto ps-3 text-muted">
                      Shipping Fee
                    </Col>
                    <Col xs="auto" className="sw-13 text-end">
                      <span>
                        <span className="text-muted">₹ </span>
                        {shippingComm1 && shippingComm1}
                      </span>
                    </Col>
                  </Row>
                  <Row className="g-0 mb-2">
                    <Col xs="auto" className="ms-auto ps-3 text-muted">
                      Fixed Commission
                    </Col>
                    <Col xs="auto" className="sw-13 text-end">
                      <span>
                        <span className="text-muted">₹ </span>
                        {fixedComm1 && fixedComm1}
                      </span>
                    </Col>
                  </Row>
                  <Row className="g-0 mb-2">
                    <Col xs="auto" className="ms-auto ps-3 text-muted">
                      Payment after commession
                    </Col>
                    <Col xs="auto" className="sw-13 text-end">
                      <span>
                        <span className="text-muted">₹ </span>
                        {totalCartValue - (listingComm1 + productComm1 + shippingComm1 + fixedComm1)}
                      </span>
                    </Col>
                  </Row>
                  {/* <Row className="g-0 mb-2">
                    <Col xs="auto" className="ms-auto ps-3 text-muted">
                      Shipping
                    </Col>
                    <Col xs="auto" className="sw-13 text-end">
                      <span>
                        <span className="text-small text-muted">$</span>
                        12.50
                      </span>
                    </Col>
                  </Row> */}
                  {/* <Row className="g-0 mb-2">
                    <Col xs="auto" className="ms-auto ps-3 text-muted">
                      Grand Total
                    </Col>
                    <Col xs="auto" className="sw-13 text-end">
                      <span>
                        <span className="text-small text-muted">$</span>
                        321.50
                      </span>
                    </Col>
                  </Row> */}
                </div>
              </Card.Body>
            </Card>
            {/* Cart End */}

            {/* Activity Start */}
            <h2 className="small-title">Activity</h2>
            <Card className="mb-5">
              <Card.Body>
                <Row className="g-0">
                  <Col xs="auto" className="sw-1 d-flex flex-column justify-content-center align-items-center position-relative me-4">
                    <div className="w-100 d-flex sh-1" />
                    <div className="rounded-xl shadow d-flex flex-shrink-0 justify-content-center align-items-center">
                      <div className="bg-gradient-light sw-1 sh-1 rounded-xl position-relative" />
                    </div>
                    <div className="w-100 d-flex h-100 justify-content-center position-relative">
                      <div className="line-w-1 bg-separator h-100 position-absolute" />
                    </div>
                  </Col>
                  <Col className="mb-4">
                    <div className="h-100">
                      <div className="d-flex flex-column justify-content-start">
                        <div className="d-flex flex-column">
                          <Button variant="link" className="p-0 pt-1 heading text-start">
                            Delivered
                          </Button>
                          <div className="text-alternate">21.12.2021</div>
                          <div className="text-muted mt-1">
                            Jujubes tootsie roll liquorice cake jelly beans pudding gummi bears chocolate cake donut. Jelly-o sugar plum fruitcake bonbon bear
                            claw cake cookie chocolate bar. Tiramisu soufflé apple pie.
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row className="g-0">
                  <Col xs="auto" className="sw-1 d-flex flex-column justify-content-center align-items-center position-relative me-4">
                    <div className="w-100 d-flex sh-1 position-relative justify-content-center">
                      <div className="line-w-1 bg-separator h-100 position-absolute" />
                    </div>
                    <div className="rounded-xl shadow d-flex flex-shrink-0 justify-content-center align-items-center">
                      <div className="bg-gradient-light sw-1 sh-1 rounded-xl position-relative" />
                    </div>
                    <div className="w-100 d-flex h-100 justify-content-center position-relative">
                      <div className="line-w-1 bg-separator h-100 position-absolute" />
                    </div>
                  </Col>
                  <Col className="mb-4">
                    <div className="h-100">
                      <div className="d-flex flex-column justify-content-start">
                        <div className="d-flex flex-column">
                          <Button variant="link" className="p-0 pt-1 heading text-start">
                            Shipped
                          </Button>
                          <div className="text-alternate">15.10.2021</div>
                          <div className="text-muted mt-1">Chocolate apple pie powder tart chupa chups bonbon. Donut biscuit chocolate cake pie topping. </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row className="g-0">
                  <Col xs="auto" className="sw-1 d-flex flex-column justify-content-center align-items-center position-relative me-4">
                    <div className="w-100 d-flex sh-1 position-relative justify-content-center">
                      <div className="line-w-1 bg-separator h-100 position-absolute" />
                    </div>
                    <div className="rounded-xl shadow d-flex flex-shrink-0 justify-content-center align-items-center">
                      <div className="bg-gradient-light sw-1 sh-1 rounded-xl position-relative" />
                    </div>
                    <div className="w-100 d-flex h-100 justify-content-center position-relative" />
                  </Col>
                  <Col>
                    <div className="h-100">
                      <div className="d-flex flex-column justify-content-start">
                        <div className="d-flex flex-column">
                          <Button variant="link" className="p-0 pt-1 heading text-start">
                            Order Received
                          </Button>
                          <div className="text-alternate">08.06.2021</div>
                          <div className="text-muted mt-1">Chocolate apple pie powder tart chupa chups bonbon. Donut biscuit chocolate cake pie topping.</div>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            {/* Activity End */}
          </Col>

          <Col xl="4" xxl="3">
            {/* Address Start */}
            <h2 className="small-title">Address</h2>
            <Card className="mb-5">
              <Card.Body className="mb-n5">
                <div className="mb-5">
                  <p className="text-small text-muted mb-2">CUSTOMER</p>
                  <Row className="g-0 mb-2">
                    <Col xs="auto">
                      <div className="sw-3 me-1">
                        <CsLineIcons icon="user" size="17" className="text-primary" />
                      </div>
                    </Col>
                    <Col className="text-alternate">
                      {orderDetailData.getSingleOrderBySellerId.user.firstName} {orderDetailData.getSingleOrderBySellerId.user.lastName}
                    </Col>
                  </Row>
                  <Row className="g-0 mb-2">
                    <Col xs="auto">
                      <div className="sw-3 me-1">
                        <CsLineIcons icon="email" size="17" className="text-primary" />
                      </div>
                    </Col>
                    <Col className="text-alternate">{orderDetailData.getSingleOrderBySellerId.user.email}</Col>
                  </Row>
                </div>
                <div className="mb-5">
                  <p className="text-small text-muted mb-2">SHIPPING ADDRESS</p>
                  <Row className="g-0 mb-2">
                    <Col xs="auto">
                      <div className="sw-3 me-1">
                        <CsLineIcons icon="user" size="17" className="text-primary" />
                      </div>
                    </Col>
                    <Col className="text-alternate">
                      {orderDetailData.getSingleOrderBySellerId.shippingAddress.user.firstName}{' '}
                      {orderDetailData.getSingleOrderBySellerId.shippingAddress.user.lastName}
                    </Col>
                  </Row>
                  <Row className="g-0 mb-2">
                    <Col xs="auto">
                      <div className="sw-3 me-1">
                        <CsLineIcons icon="pin" size="17" className="text-primary" />
                      </div>
                    </Col>
                    <Col className="text-alternate">
                      {orderDetailData.getSingleOrderBySellerId.shippingAddress.addressLine1}{' '}
                      {orderDetailData.getSingleOrderBySellerId.shippingAddress.addressLine2}, {orderDetailData.getSingleOrderBySellerId.shippingAddress.city},{' '}
                      {orderDetailData.getSingleOrderBySellerId.shippingAddress.postalCode}, {orderDetailData.getSingleOrderBySellerId.shippingAddress.state},{' '}
                      {orderDetailData.getSingleOrderBySellerId.shippingAddress.country}
                    </Col>
                  </Row>
                  <Row className="g-0 mb-2">
                    <Col xs="auto">
                      <div className="sw-3 me-1">
                        <CsLineIcons icon="phone" size="17" className="text-primary" />
                      </div>
                    </Col>
                    <Col className="text-alternate">{orderDetailData.getSingleOrderBySellerId.shippingAddress.user.mobileNo}</Col>
                  </Row>
                </div>
                <div className="mb-5">
                  <p className="text-small text-muted mb-2">BILLING ADDRESS</p>
                  <Row className="g-0 mb-2">
                    <Col xs="auto">
                      <div className="sw-3 me-1">
                        <CsLineIcons icon="user" size="17" className="text-primary" />
                      </div>
                    </Col>
                    <Col className="text-alternate">
                      {orderDetailData.getSingleOrderBySellerId.billingAddress.user.firstName}{' '}
                      {orderDetailData.getSingleOrderBySellerId.billingAddress.user.lastName}
                    </Col>
                  </Row>
                  <Row className="g-0 mb-2">
                    <Col xs="auto">
                      <div className="sw-3 me-1">
                        <CsLineIcons icon="pin" size="17" className="text-primary" />
                      </div>
                    </Col>
                    <Col className="text-alternate">
                      {orderDetailData.getSingleOrderBySellerId.billingAddress.addressLine1}{' '}
                      {orderDetailData.getSingleOrderBySellerId.billingAddress.addressLine2}, {orderDetailData.getSingleOrderBySellerId.billingAddress.city},{' '}
                      {orderDetailData.getSingleOrderBySellerId.billingAddress.postalCode}, {orderDetailData.getSingleOrderBySellerId.billingAddress.state},{' '}
                      {orderDetailData.getSingleOrderBySellerId.billingAddress.country}
                    </Col>
                  </Row>
                  <Row className="g-0 mb-2">
                    <Col xs="auto">
                      <div className="sw-3 me-1">
                        <CsLineIcons icon="phone" size="17" className="text-primary" />
                      </div>
                    </Col>
                    <Col className="text-alternate">{orderDetailData.getSingleOrderBySellerId.billingAddress.user.mobileNo}</Col>
                  </Row>
                </div>
                <div className="mb-5">
                  <p className="text-small text-muted mb-2">PAYMENT (CREDIT CARD)</p>
                  <Row className="g-0 mb-2">
                    <Col xs="auto">
                      <div className="sw-3 me-1">
                        <CsLineIcons icon="credit-card" size="17" className="text-primary" />
                      </div>
                    </Col>
                    <Col className="text-alternate">3452 42** **** 4251</Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
            {/* Address End */}
          </Col>
        </Row>
      )}
    </>
  );
};

export default OrdersDetail;
