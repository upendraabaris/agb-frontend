import React from 'react';
import { NavLink } from 'react-router-dom';
import { Row, Col, Card, Badge, Pagination } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import moment from 'moment';
import { useGlobleContext } from 'context/styleColor/ColorContext';

const CustomerOrdersList = ({ orderData, loading }) => {
  if (loading) {
    return (
      <h2 className="border p-6 text-center">
        Loading
        <img src="/loading.webp" alt="" className="loading-gif" width="20" height="20" />{' '}
      </h2>
    );
  }
  const { dataStoreFeatures1 } = useGlobleContext();
  return (
    <>
      {/* List Items Start */}
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
      <Row className="g-0 border d-none d-lg-flex">
        <Row className="g-0 pb-2 bg-white h-100 align-content-center pt-2 ps-5 pe-4 h-100">
          <Col xs="3" lg="4" className="d-flex flex-column mb-lg-0 pe-3 d-flex">
            <div className="text-dark fw-bold cursor-pointer sort">Order Id</div>
          </Col>
          <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
            <div className="text-dark fw-bold cursor-pointer sort">Customer Name</div>
          </Col>
          <Col xs="2" lg="2" className="d-flex flex-column pe-1 justify-content-center">
            <div className="text-dark fw-bold cursor-pointer sort">Order Date</div>
          </Col>
          <Col xs="2" lg="1" className="d-flex flex-column pe-1 justify-content-center">
            <div className="text-dark fw-bold cursor-pointer sort">Amount</div>
          </Col>
          <Col xs="2" lg="2" className="d-flex flex-column pe-1 justify-content-center">
            <div className="text-dark fw-bold cursor-pointer sort">Payment Method</div>
          </Col>
        </Row>
      </Row>

      {orderData && orderData.length > 0 ? (
        orderData
          ?.slice(0)
          .reverse()
          .map((order, index) => (
            <Card key={index} className="mb-2">
              <Card.Body className="pt-0 pb-0 sh-21 sh-md-8">
                <Row className="g-0 h-100 align-content-center cursor-default">
                  <Col xs="11" md="4" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-1 order-md-1 h-md-100 position-relative">
                    <div className="text-dark text-small d-md-none">Order Id</div>
                    <NavLink to={`/order/${order.id}`} className="text-truncate text-dark h-100 d-flex align-items-center">
                      <span maxLength={2}>{order.id}</span>
                    </NavLink>
                  </Col>
                  <Col xs="6" md="3" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-3 order-md-2">
                    <div className="text-dark text-small d-md-none">Name</div>
                    <div className="text-dark">
                      {order.billingAddress.firstName} {order.billingAddress.lastName}
                    </div>
                  </Col>
                  <Col xs="6" md="2" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-4 order-md-3">
                    <div className="text-dark text-small d-md-none">Order Date</div>
                    <div className="text-dark">
                      <span>{moment(parseInt(order.createdAt, 10)).format('LL')}</span>
                    </div>
                  </Col>
                  <Col xs="6" md="1" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-5 order-md-4">
                    <div className="text-dark text-small d-md-none">Amount </div>
                    <div className="text-dark">
                      <span>
                        <span className="text-small">₹ </span>
                        {order.totalAmount}
                      </span>
                    </div>
                  </Col>
                  <Col xs="6" md="2" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-last order-md-5">
                    <div className="text-dark text-small d-md-none">Payment Method</div>
                    <NavLink to={`/order/${order.id}`} className="rounded d-flex font_color">
                      {order.paymentMethod} <CsLineIcons icon="chevron-right" width="20" className="ps-2" />
                    </NavLink>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))
      ) : (
        <h2 className="text-center py-4 border p-8"> Order Not Found</h2>
      )}
      {/* List Items End */}
    </>
  );
};

export default CustomerOrdersList;
