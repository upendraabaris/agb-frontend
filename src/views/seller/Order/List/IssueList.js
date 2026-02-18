import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Row, Col, Card, Badge, Spinner, Table } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { gql, useQuery } from '@apollo/client';
import moment from 'moment';
import HtmlHead from 'components/html-head/HtmlHead';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';

// 🔹 GraphQL Query
const GET_ORDERS_FOR_SELLER = gql`
  query GetSellerIssueOrders {
    getSellerIssueOrders {
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
  const title = 'Orders with Issues';
  const description = 'Ecommerce Orders List Page';
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
  }, [dispatch]);

  const {
    error,
    data: orderData,
    loading,
  } = useQuery(GET_ORDERS_FOR_SELLER, {
    onError: () => {
      console.log('Error!!!', error?.message);
    },
  });

  // ✅ Filter & Format Orders
  const allOrders =
    orderData?.getSellerIssueOrders
      ?.filter((o) => o.paymentStatus === 'complete' && o.status !== 'cancelled')
      ?.sort((a, b) => a.createdAt - b.createdAt)
      ?.map((o) => ({
        ...o,
        createdAtFormatted: new Date(+o.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      })) || [];

  return (
    <>
      <HtmlHead title={title} description={description} />

      <div className="page-title-container mb-3">
        <nav className="breadcrumb bg-transparent p-0 m-0">
          <button type="button" className="btn btn-link p-0 text-decoration-none text-dark" onClick={() => window.history.back()}>
            Back
          </button>
          <span className="mx-2 text-muted">/</span>
          <NavLink to="/seller/dashboard" className="text-decoration-none text-dark breadcrumb-item">
            Dashboard
          </NavLink>
          <span className="mx-2 text-muted">/</span>
          <span className="fw-semibold text-dark breadcrumb-item active" aria-current="page">
            {title}
          </span>
        </nav>
      </div>

      <div className="rounded shadow-sm p-1 pt-2 ps-3 bg-white mb-1 text-dark d-flex flex-column flex-md-row justify-content-between align-items-start">
        <h4 className="fw-bold mb-1">Orders with Issues</h4>
        <small className="text-dark px-3">Total Orders: {allOrders.length}</small>
      </div>

      {loading && (
        <div className="text-center py-5 bg-white border rounded">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading Orders...</p>
        </div>
      )}

      {!loading && !allOrders?.length && (
        <div className="text-center py-5 bg-white border rounded">
          <h5>No Orders with issues found</h5>
        </div>
      )}

      {!loading && allOrders?.length > 0 && (
        <div className="table-responsive mt-2">
          <Table bordered hover size="sm" className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Order Id</th>
                <th>Customer Name</th>
                <th>Order Date</th>
                <th>Amount</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>

            <tbody>
              {[...allOrders].reverse().map((order) => (
                <tr key={order.id}>
                  <td>
                    <NavLink to={`issuedetail?orderID=${order.id}`} className="text-decoration-none">
                      {order.id.slice(-12)}
                    </NavLink>
                  </td>
                  <td className="fw-semibold">
                    {order?.shippingAddress?.firstName} {order?.shippingAddress?.lastName}
                  </td>
                  <td>{moment(parseInt(order?.createdAt, 10)).format('DD-MMM-YYYY')}</td>
                  <td>
                    ₹
                    {(
                      order.orderProducts?.reduce((total, item) => total + (item.price || 0), 0) *
                      (1 + (order?.onlinePaymentChargePercentage || 0) / 100)
                    ).toFixed(2)}
                  </td>
                  <td className="text-end">
                    <NavLink to={`issuedetail?orderID=${order.id}`} className="btn btn-sm btn-primary">
                      Check
                    </NavLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </>
  );
}

export default ListOrder;
