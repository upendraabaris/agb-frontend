import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Row, Col, Card } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { useDispatch } from 'react-redux';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { gql, useQuery } from '@apollo/client';
import moment from 'moment';

const GET_ORDER = gql`
  query GetUserorder {
    getUserorder {
      id
      createdAt
      billingAddress {
        firstName
        lastName
      }
      orderProducts {
        productId {
          thumbnail
        }
      }
      paymentMethod
      paymentStatus
      totalAmount
      status
    }
  }
`;

function ListOrder() {
  const title = 'Orders List';
  const description = 'Orders List';
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
  }, [dispatch]);

  const [orders, setOrders] = useState([]);
  const {
    error,
    data: orderData,
    loading,
  } = useQuery(GET_ORDER, {
    onCompleted: () => {
      if (orderData) {
        setOrders(orderData.getUserorder);
      }
    },
    onError: () => {
      console.log('Error!!!', error.message);
    },
  });

  if (loading) {
    return (
      <h2 className="border p-6 text-center">
        Loading
        <img src="/loading.webp" alt="" className="loading-gif" width="20" height="20" />{' '}
      </h2>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="text-center p-5 bg-white border rounded shadow-lg">
          <h2 className="text-dark fw-bold">Order Not Found</h2>
          <p className="text-dark">It seems we couldn't find any orders matching your request.</p>
          <div className="mt-3">
            <NavLink to="/" className="btn btn-primary">
              Go to Home
            </NavLink>
          </div>
        </div>
      </div>
    );
  }
  const getOrderStatusClass = (order) => {
    if (order.paymentStatus === 'failed') return 'bg-danger';
    switch (order.status) {
      case 'pending':
        return 'bg-warning';
      case 'delivered':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      case 'packed':
        return 'bg-info';
      case 'shipped':
      case 'Payment Proof Submited':
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  };

  const getOrderDisplayStatus = (order) => {
    if (order.paymentStatus === 'failed') return 'Payment Failed';
    if (order.status === 'pending') return 'In Process';
    return order.status;
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <Card className="mb-1 shadow-sm border-0 rounded-3 d-none d-md-block">
        <Card.Body className="py-3 px-3">
          <Row className="g-3">
            <Col xs="12" md="4" lg="3">
              <div className="fw-bold ">Order Id</div>
            </Col>
            <Col xs="6" md="3" lg="2">
              <div className="fw-bold">Customer Name</div>
            </Col>
            <Col xs="6" md="2" lg="2">
              <div className="fw-bold">Order Date</div>
            </Col>
            <Col xs="6" md="1" lg="1">
              <div className="fw-bold">Amount</div>
            </Col>
            <Col xs="6" md="2" lg="2">
              <div className="fw-bold">Payment Method</div>
            </Col>
            <Col xs="6" md="2" lg="2">
              <div className="fw-bold">Order Status</div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      {orders
        .slice(0)
        .reverse()
        .map((order, index) => (
          <Card key={index} className="mb-1 shadow-sm border-0 rounded-3">
            <Card.Body className="py-2 px-3">
              <Row className="g-3 align-items-center">
                <Col xs="12" md="4" lg="3">
                  <div className="d-flex justify-content-between d-md-block mb-1">
                    <div className="text-dark d-md-none">Order Id:</div>
                    <NavLink to={`/order/${order.id}`} className="text-dark fw-bold text-decoration-none text-truncate">
                      {order.id}
                    </NavLink>
                  </div>
                </Col>
                <Col xs="6" md="3" lg="2">
                  <div className="text-dark fw-medium">
                    {order.billingAddress.firstName} {order.billingAddress.lastName}
                  </div>
                </Col>
                <Col xs="6" md="2" lg="2">
                  <div className="text-dark">{moment(parseInt(order.createdAt, 10)).format('DD-MMM-yyyy')}</div>
                </Col>
                <Col xs="6" md="1" lg="1">
                  <div className="text-dark">₹ {order.totalAmount}</div>
                </Col>
                <Col xs="6" md="2" lg="2">
                  <NavLink to={`/order/${order.id}`} className="d-flex align-items-center text-dark text-decoration-none text-uppercase">
                    {order.paymentMethod} / {order.paymentStatus}
                  </NavLink>
                </Col>
                <Col xs="6" md="2" lg="2">
                  <NavLink
                    to={`/order/${order.id}`}
                    className={`d-flex align-items-center justify-content-center text-white text-decoration-none 
      text-uppercase rounded small p-1 fw-bold ${getOrderStatusClass(order)}`}
                  >
                    {getOrderDisplayStatus(order)}
                  </NavLink>
                </Col>
                <Col xs="6" md="4" className="d-block d-md-none">
                  <NavLink to={`/order/${order.id}`} className="btn btn-primary p-1 w-100 d-flex justify-content-center align-items-center gap-2 fw-semibold">
                    View Order
                    <CsLineIcons icon="next" size="18" />
                  </NavLink>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))}
    </>
  );
}

export default ListOrder;
