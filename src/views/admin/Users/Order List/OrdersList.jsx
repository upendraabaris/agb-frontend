import React, { useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Row, Col, Card, Badge } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { gql, useLazyQuery } from '@apollo/client';
import moment from 'moment';

const GET_USER_ORDER = gql`
  query GetUserAllOrder($userId: ID) {
    getUserAllOrder(userId: $userId) {
      id
      totalAmount
      status
      createdAt
      user {
        id
      }
    }
  }
`;

const OrdersList = () => {
  const title = 'Orders List';
  const description = 'Ecommerce Orders List Page';
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);
  const { userID } = useParams();
  const [GetUserAllOrder, { data: orderData }] = useLazyQuery(GET_USER_ORDER, {
    variables: {
      userId: userID,
    },
    onError: (err) => {
      console.log('GET_USER_ORDER', err);
    },
  });
  useEffect(() => {
    GetUserAllOrder();
  }, [userID]);

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to={`/admin/user/detail/${userID}`}>
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">User</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
          </Col>
          {/* Title End */}
        </Row>
      </div>

      {/* List Items Start */}
      {orderData?.getUserAllOrder.length > 0 &&
        orderData?.getUserAllOrder
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
                    <div className="text-alternate">
                      {' '}
                      <span>{moment(parseInt(order.createdAt, 10)).format('LL')}</span>
                    </div>
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
