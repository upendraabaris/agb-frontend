import React, { useState, useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Row, Col, Button, Dropdown, Form, Card, Badge, Pagination, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import CheckAll from 'components/check-all/CheckAll';
import { gql, useMutation, useQuery, useLazyQuery } from '@apollo/client';
import moment from 'moment';

const OrdersList = () => {
  const title = 'Seller Orders List';
  const description = 'Ecommerce Seller Orders List Page';

  const { sellerID } = useParams();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const GET_SELLER_ORDER = gql`
    query GetOrderBySellerId($sellerId: ID) {
      getOrderBySellerId(sellerId: $sellerId) {
        id
        status
        totalAmount
        createdAt
      }
    }
  `;

  const [GetOrderBySellerId, { data: orderData }] = useLazyQuery(GET_SELLER_ORDER, {
    variables: {
      sellerId: sellerID,
    },
    onError: (err) => {
      console.log('GET_SELLER_ORDER', err);
    },
  });

  useEffect(() => {
    GetOrderBySellerId();
  }, [sellerID]);

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-3">
        <nav className="breadcrumb bg-transparent p-0 m-0">
          <button type="button" className="btn btn-link p-0 text-decoration-none text-dark" onClick={() => window.history.back()}>
            Back
          </button>
        </nav>
      </div>

      {/* List Items Start */}
      {orderData &&
        orderData?.getOrderBySellerId
          .slice(0)
          .reverse()
          .map((order, index) => (
            <Card key={index} className="mb-2">
              <Card.Body className="sh-16 sh-md-8 py-0">
                <Row className="g-0 h-100 align-content-center">
                  <Col xs="6" md="3" className="d-flex flex-column justify-content-center mb-2 mb-md-0 h-md-100">
                    <div className="text-muted text-small d-md-none">Id</div>
                    <NavLink to={`/admin/order/detail/${order.id}`} className="text-truncate h-100 d-flex align-items-center">
                      {/* 1239 */}
                      <span maxLength={2}>{order.id.substring(0, 12)}...</span>
                    </NavLink>
                  </Col>
                  <Col xs="6" md="4" className="d-flex flex-column justify-content-center mb-2 mb-md-0">
                    <div className="text-muted text-small d-md-none">Total Amount</div>
                    <div className="text-alternate">
                      <span>
                        <span className="text-small">₹ </span>
                        {order.totalAmount}
                      </span>
                    </div>
                  </Col>
                  <Col xs="6" md="2" className="d-flex flex-column justify-content-center mb-2 mb-md-0">
                    <div className="text-muted text-small d-md-none">Date</div>
                    <div className="text-alternate">{moment(parseInt(order.createdAt, 10)).format('DD-MMM-YYYY')}</div>
                  </Col>
                  <Col xs="6" md="3" className="d-flex flex-column justify-content-center mb-2 mb-md-0 align-items-md-end">
                    <div className="text-muted text-small d-md-none">Status</div>
                    <Badge bg="outline-tertiary">{order.status}</Badge>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
      {/* List Items End */}
    </>
  );
};

export default OrdersList;
