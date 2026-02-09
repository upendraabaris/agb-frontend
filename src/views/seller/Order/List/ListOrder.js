import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Row, Tab, Tabs, Col } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { gql, useQuery } from '@apollo/client';
import CustomerOrdersList from './CustomerOrdersList';

const GET_ORDERS_FOR_SELLER = gql`
  query GetOrderForseller {
    getOrderForseller {
      id
      createdAt
      user {
        firstName
        lastName
        email
      }
      shippingAddress {
        firstName
        lastName
      }
      orderProducts {
        price
        quantity
      }
      paymentMethod
      totalAmount
      status
      paymentStatus
      onlinepaymentStatus
      onlinePaymentChargePercentage
    }
  }
`;

function ListOrder() {
  const title = 'Orders List';
  const description = 'Ecommerce Orders List Page';
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const {
    error,
    data: orderData,
    loading,
  } = useQuery(GET_ORDERS_FOR_SELLER, {
    onError: () => {
      console.log('Error!!!', error?.message);
    },
  });

  // ✅ Filter only orders with paymentStatus === "complete" AND status !== "cancelled"
  const allOrders =
    orderData?.getOrderForseller
      ?.filter((o) => o.paymentStatus === 'complete' && o.status !== 'cancelled')
      ?.sort((a, b) => a.createdAt - b.createdAt)
      ?.map((o) => ({
        ...o,
        createdAtFormatted: new Date(+o.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      })) || [];

  return (
    <>
      <HtmlHead title={title} description={description} />

      <div className="page-title-container mb-2">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/seller/dashboard">
              <span className="align-middle text-dark ms-1">Dashboard</span>
            </NavLink>
            <span className="p-2 small"> / </span>
            <span className="align-middle text-dark ms-1">Orders List</span>
          </Col>
        </Row>
      </div>

      {/* <Tabs defaultActiveKey="all_orders" id="single-tab" className="mb-2" justify>
        <Tab eventKey="all_orders" title={`All Orders (${allOrders.length})`}>
          <CustomerOrdersList orderData={allOrders} loading={loading} />
        </Tab>
      </Tabs> */}

      <div>
        <div className="rounded shadow-sm p-1 pt-2 ps-3 bg-white mb-1 text-dark d-flex flex-column flex-md-row justify-content-between align-items-start">
          <h4 className="fw-bold mb-1">All Orders</h4>
          <small className="text-dark px-3">Total Orders: {allOrders.length}</small>
        </div>
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <CustomerOrdersList orderData={allOrders} loading={loading} />
          </div>
        </div>
      </div>
    </>
  );
}

export default ListOrder;
