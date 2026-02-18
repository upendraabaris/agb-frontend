import React, { useState, useEffect } from 'react';
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
  const { orderid } = useParams();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const ORDER_DETAIL = gql`
    query GetOrder($getOrderId: ID!) {
      getOrder(id: $getOrderId) {
        id
        shippingAddress {
          firstName
          lastName
          mobileNo
          addressLine1
          addressLine2
          city
          state
          postalCode
          country
          altrMobileNo
          businessName
          gstin
        }
        billingAddress {
          firstName
          lastName
          mobileNo
          addressLine1
          addressLine2
          city
          state
          postalCode
          country
          altrMobileNo
          businessName
          gstin
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
          }
          quantity
          price
        }
      }
    }
  `;

  const [getOrderDetail, { data: orderDetailData }] = useLazyQuery(ORDER_DETAIL, {
    variables: {
      getOrderId: orderid,
    },
    onError: (error) => {
      console.error('ORDER_DETAIL', error);
    },
  });

  useEffect(() => {
    getOrderDetail();
  }, []);

  const [totalCartValue, setTotalCartValue] = useState(0);
  useEffect(() => {
    if (orderDetailData && orderDetailData.getOrder) {
      const { orderProducts } = orderDetailData.getOrder;

      const calculatedTotalCartValue = orderProducts.reduce((total, product) => total + product.price, 0);

      setTotalCartValue(calculatedTotalCartValue);
    }
  }, [orderDetailData]);

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to={`/admin/user/detail/${orderDetailData?.getOrder?.user?.id}`}>
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">User</span>
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
                Status: Pending
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
                        <div className="text-primary">{orderDetailData.getOrder.id}</div>
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
                        <div className="text-primary">{orderDetailData.getOrder.status}</div>
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
                        <div className="text-primary">{orderDetailData.getOrder.paymentMethod.replace('_', ' ').toUpperCase()} 17.11.2020</div>
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
                  {orderDetailData &&
                    orderDetailData.getOrder.orderProducts.map((cart, index) => (
                      <Row key={index} className="g-0 sh-9 mb-3">
                        <Col xs="auto">
                          <img
                            src={cart.productId.thumbnail || (cart.productId.images && cart.productId.images)}
                            className="card-img rounded-md h-100 sw-10"
                            alt="thumb"
                          />
                        </Col>
                        <Col>
                          <div className="ps-4 pt-0 pb-0 pe-0 h-100">
                            <Row className="g-0 h-100 align-items-start align-content-center">
                              <Col xs="12" className="d-flex flex-column mb-2">
                                <div>{cart.productId.fullName}</div>
                                <div className="text-muted text-small">{cart.productId.brand_name}</div>
                                <div className="text-muted text-small">{cart.variantId.variantName}</div>
                              </Col>
                              <Col xs="12" className="d-flex flex-column mb-md-0 pt-1">
                                <Row className="g-0">
                                  <Col xs="6" className="d-flex flex-row pe-2 align-items-end text-alternate">
                                    <span>{cart.quantity}</span>
                                    <span className="text-muted ms-1 me-1">x</span>
                                    <span>{cart.price / cart.quantity}</span>
                                  </Col>
                                  <Col xs="6" className="d-flex flex-row align-items-end justify-content-end text-alternate">
                                    <span>
                                      <span className="text-small">₹ </span>
                                      {cart.price}
                                    </span>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                          </div>
                        </Col>
                      </Row>
                    ))}
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
                  {/* <Row className="g-0 mb-2">
                    <Col xs="auto" className="ms-auto ps-3 text-muted">
                      Grand Total
                    </Col>
                    <Col xs="auto" className="sw-13 text-end">
                      <span>
                        <span className="text-small text-muted">₹</span>
                        {orderDetailData.getOrder.totalAmount}
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
                      {orderDetailData.getOrder.user.firstName} {orderDetailData.getOrder.user.lastName}
                    </Col>
                  </Row>
                  <Row className="g-0 mb-2">
                    <Col xs="auto">
                      <div className="sw-3 me-1">
                        <CsLineIcons icon="email" size="17" className="text-primary" />
                      </div>
                    </Col>
                    <Col className="text-alternate">{orderDetailData.getOrder.user.email}</Col>
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
                      {orderDetailData.getOrder.shippingAddress.firstName} {orderDetailData.getOrder.shippingAddress.lastName}
                    </Col>
                  </Row>
                  <Row className="g-0 mb-2">
                    <Col xs="auto">
                      <div className="sw-3 me-1">
                        <CsLineIcons icon="pin" size="17" className="text-primary" />
                      </div>
                    </Col>
                    <Col className="text-alternate">
                      {orderDetailData.getOrder.shippingAddress.addressLine1} {orderDetailData.getOrder.shippingAddress.addressLine2},{' '}
                      {orderDetailData.getOrder.shippingAddress.city}, {orderDetailData.getOrder.shippingAddress.postalCode},{' '}
                      {orderDetailData.getOrder.shippingAddress.state}, {orderDetailData.getOrder.shippingAddress.country}
                    </Col>
                  </Row>
                  <Row className="g-0 mb-2">
                    <Col xs="auto">
                      <div className="sw-3 me-1">
                        <CsLineIcons icon="phone" size="17" className="text-primary" />
                      </div>
                    </Col>
                    <Col className="text-alternate">{orderDetailData.getOrder.shippingAddress.mobileNo}</Col>
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
                      {orderDetailData.getOrder.billingAddress.firstName} {orderDetailData.getOrder.billingAddress.lastName}
                    </Col>
                  </Row>
                  <Row className="g-0 mb-2">
                    <Col xs="auto">
                      <div className="sw-3 me-1">
                        <CsLineIcons icon="pin" size="17" className="text-primary" />
                      </div>
                    </Col>
                    <Col className="text-alternate">
                      {orderDetailData.getOrder.billingAddress.addressLine1} {orderDetailData.getOrder.billingAddress.addressLine2},{' '}
                      {orderDetailData.getOrder.billingAddress.city}, {orderDetailData.getOrder.billingAddress.postalCode},{' '}
                      {orderDetailData.getOrder.billingAddress.state}, {orderDetailData.getOrder.billingAddress.country}
                    </Col>
                  </Row>
                  <Row className="g-0 mb-2">
                    <Col xs="auto">
                      <div className="sw-3 me-1">
                        <CsLineIcons icon="phone" size="17" className="text-primary" />
                      </div>
                    </Col>
                    <Col className="text-alternate">{orderDetailData.getOrder.billingAddress.mobileNo}</Col>
                  </Row>
                </div>
                <div className="mb-5">
                  <p className="text-small text-muted mb-2">PAYMENT METHOD</p>
                  <Row className="g-0 mb-2">
                    <Col xs="auto">
                      <div className="sw-3 me-1">
                        <CsLineIcons icon="credit-card" size="17" className="text-primary" />
                      </div>
                    </Col>
                    <Col className="text-alternate">{orderDetailData.getOrder.paymentMethod}</Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default OrdersDetail;
