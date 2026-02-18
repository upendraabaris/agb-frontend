import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Row, Col, Card, Badge, Table } from 'react-bootstrap';
import moment from 'moment';
import { gql, useQuery } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';

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
      paymentMethod
      totalAmount
      status
      onlinepaymentStatus
    }
  }
`;

const ListOrder = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
  }, [dispatch]);

  const { data, loading } = useQuery(GET_ORDERS_FOR_SELLER);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-warning';
      case 'packed':
        return 'bg-secondary';
      case 'shipped':
        return 'bg-info';
      case 'delivered':
        return 'bg-success';
      default:
        return 'bg-light';
    }
  };

  return (
    <>
      <div className="page-title-container">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block" to="/seller/dashboard">
              <span className="align-middle text-dark ms-1">Dealer Dashboard</span>
            </NavLink>
            <span className="p-2 small"> / </span>
            <span className="align-middle text-dark ms-1">Orders List</span>
          </Col>
        </Row>
      </div>

      {loading ? (
        <h2 className="text-center bg-white">Loading...</h2>
      ) : (
        <Table striped bordered hover responsive className="bg-white">
          <thead>
            <tr>
              <th>Order Id</th>
              <th>Customer Name</th>
              <th>Order Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.getOrderForseller.length > 0 ? (
              data.getOrderForseller
                .slice(0)
                .reverse()
                .map((order, index) => (
                  <tr key={index}>
                    <td>
                      <NavLink to={`detail?orderID=${order.id}`} className="text-truncate">
                        {order.id.substring(0, 12)}...
                      </NavLink>
                    </td>
                    <td>
                      {order?.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                    </td>
                    <td>{moment(parseInt(order?.createdAt, 10)).format('LL')}</td>
                    <td>₹{order?.totalAmount}</td>
                    <td>
                      <Badge className={getStatusBadgeClass(order?.status)}>{order?.status?.toUpperCase()}</Badge>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4 fe-bold bg-white">
                  Order Not Found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default ListOrder;
