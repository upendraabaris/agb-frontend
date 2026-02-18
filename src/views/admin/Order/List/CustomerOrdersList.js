import React from 'react';
import { NavLink } from 'react-router-dom';
import { Row, Col, Card, Badge, Pagination } from 'react-bootstrap';
import moment from 'moment';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const CustomerOrdersList = ({ orderData, loading }) => {
  if (loading) {
    return <h2>Loading </h2>;
  }
  return (
    <>
      <Row className="g-0 mb-2 d-none d-lg-flex">
        <Row className="g-0 h-100 align-content-center ps-5 pe-4 h-100">
          <Col xs="3" lg="2" className="d-flex flex-column mb-lg-0 pe-3 d-flex">
            <div className="text-muted text-small cursor-pointer sort">Order Id</div>
          </Col>
          <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
            <div className="text-muted text-small cursor-pointer sort">Customer Name</div>
          </Col>
          <Col xs="2" lg="2" className="d-flex flex-column pe-1 justify-content-center">
            <div className="text-muted text-small cursor-pointer sort">Order Date</div>
          </Col>
          <Col xs="2" lg="2" className="d-flex flex-column pe-1 justify-content-center">
            <div className="text-muted text-small cursor-pointer sort">Amount</div>
          </Col>
          <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
            <div className="text-muted text-small cursor-pointer sort">Payment Method</div>
          </Col>
        </Row>
      </Row>
      {/* List Items Start */}
      {orderData && orderData.length > 0 ? (
        orderData
          ?.slice(0)
          .reverse()
          .map((order, index) => (
            <Card key={index} className="mb-2 hover-border-primary">
              <Card.Body className="pt-0 pb-0 sh-21 sh-md-8">
                <Row className="g-0 h-100 align-content-center cursor-default">
                  <Col xs="11" md="2" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-1 order-md-1 h-md-100 position-relative">
                    <div className="text-muted text-small d-md-none">Order ID</div>
                    <NavLink to={`detail/${order.id}`} className="text-truncate h-100 d-flex align-items-center">
                      <span maxLength={2}>{order.id.substring(0, 12)}...</span>
                    </NavLink>
                  </Col>
                  <Col xs="6" md="3" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-3 order-md-2">
                    <div className="text-muted text-small d-md-none">Name</div>
                    <div className="text-alternate">
                      {order?.billingAddress?.firstName} {order?.billingAddress?.lastName}
                    </div>
                  </Col>
                  <Col xs="6" md="2" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-4 order-md-3">
                    <div className="text-muted text-small d-md-none">Order Date</div>
                    <div className="text-alternate">
                      <span>{moment(parseInt(order?.createdAt, 10)).format('LL')}</span>
                      {/* <span>
                        <span className="text-small">₹ </span>
                        {order.totalAmount}
                      </span> */}
                    </div>
                  </Col>
                  <Col xs="6" md="2" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-5 order-md-4">
                    <div className="text-muted text-small d-md-none">Amount </div>
                    <div className="text-alternate">
                      <span>
                        <span className="text-small">₹ </span>
                        {order?.totalAmount}
                      </span>
                    </div>
                  </Col>
                  <Col xs="6" md="3" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-last order-md-5">
                    <div className="text-muted text-small d-md-none">Payment Method</div>
                    <div className='col-12 text-uppercase'>
                      {/* eslint-disable-next-line no-nested-ternary  */}
                      {order?.status === 'pending' ? (                        
                        <Badge className="bg-warning text-uppercase">
                          {order?.paymentMethod} 
                      {order?.paymentMethod && order?.paymentMethod === 'ONLINE' ? (
                        <span>  {' / '} {order?.onlinepaymentStatus} </span> 
                      ) : '' }                     
                      {order?.paymentMethod && order?.paymentMethod === 'DMT' ? (
                        <span> {' / '} {order?.paymentStatus} </span> 
                      ) : '' }
                       {' / '} {order?.status}
                      </Badge>
                      ) : //  eslint-disable-next-line no-nested-ternary
                      order?.status === 'packed' ? (                        
                        <Badge className="bg-secondary text-uppercase">
                          {order?.paymentMethod} 
                      {order?.paymentMethod && order?.paymentMethod === 'ONLINE' ? (
                        <span>  {' / '} {order?.onlinepaymentStatus} </span> 
                      ) : '' }                     
                      {order?.paymentMethod && order?.paymentMethod === 'DMT' ? (
                        <span> {' / '} {order?.paymentStatus} </span> 
                      ) : '' }
                       {' / '} {order?.status}
                      </Badge>
                      ) : //  eslint-disable-next-line no-nested-ternary
                      order?.status === 'shipped' ? (
                        <Badge className="bg-info text-uppercase ">
                          {order?.paymentMethod} 
                      {order?.paymentMethod && order?.paymentMethod === 'ONLINE' ? (
                        <span>  {' / '} {order?.onlinepaymentStatus} </span> 
                      ) : '' }                     
                      {order?.paymentMethod && order?.paymentMethod === 'DMT' ? (
                        <span> {' / '} {order?.paymentStatus} </span> 
                      ) : '' }
                       {' / '} {order?.status}
                      </Badge>                        
                      ) : //  eslint-disable-next-line no-nested-ternary
                      order?.status === 'delivered' ? (
                        <Badge className="bg-success text-uppercase ">
                          {order?.paymentMethod} 
                      {order?.paymentMethod && order?.paymentMethod === 'ONLINE' ? (
                        <span>  {' / '} {order?.onlinepaymentStatus} </span> 
                      ) : '' }                     
                      {order?.paymentMethod && order?.paymentMethod === 'DMT' ? (
                        <span> {' / '} {order?.paymentStatus} </span> 
                      ) : '' }
                       {' / '} {order?.status}
                      </Badge>
                       ) : //  eslint-disable-next-line no-nested-ternary
                       order?.status === 'cancelled' ? (
                         <Badge className="bg-danger text-uppercase ">
                          {order?.paymentMethod} 
                      {order?.paymentMethod && order?.paymentMethod === 'ONLINE' ? (
                        <span>  {' / '} {order?.onlinepaymentStatus} </span> 
                      ) : '' }                     
                      {order?.paymentMethod && order?.paymentMethod === 'DMT' ? (
                        <span> {' / '} {order?.paymentStatus} </span> 
                      ) : '' }
                       {' / '} {order?.status}
                       </Badge>
                      ) : null }  

                      {/* <Badge bg="outline-primary">{order?.paymentMethod} 
                      {order?.paymentMethod && order?.paymentMethod === 'ONLINE' ? (
                        <span>  {' / '} {order?.onlinepaymentStatus} </span> 
                      ) : '' }                     
                      {order?.paymentMethod && order?.paymentMethod === 'DMT' ? (
                        <span> {' / '} {order?.paymentStatus} </span> 
                      ) : '' }
                       {' / '} {order?.status}
                      </Badge> */}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))
      ) : (
        <h2 className="text-center my-4 py-4">Order Not Found</h2>
      )}
      {/* List Items End */}

      <div className="d-flex justify-content-center mt-5">
        <Pagination>
          <Pagination.Prev className="shadow" disabled>
            <CsLineIcons icon="chevron-left" />
          </Pagination.Prev>
          <Pagination.Item className="shadow" active>
            1
          </Pagination.Item>
          <Pagination.Item className="shadow">2</Pagination.Item>
          <Pagination.Item className="shadow">3</Pagination.Item>
          <Pagination.Next className="shadow">
            <CsLineIcons icon="chevron-right" />
          </Pagination.Next>
        </Pagination>
      </div>
    </>
  );
};

export default CustomerOrdersList;
