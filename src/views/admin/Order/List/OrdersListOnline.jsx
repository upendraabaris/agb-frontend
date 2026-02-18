import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Row, Col, Dropdown, Form, Card, Badge, Pagination, Tooltip, OverlayTrigger } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { gql, useQuery } from '@apollo/client';

const OrdersList = () => {
  const title = 'Orders List';
  const description = 'Ecommerce Orders List Page';

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const GET_ALL_ORDERS = gql`
    query GetAllOrder {
      getAllOrder {
        id
        user {
          firstName
          lastName
          email
        }
        paymentMethod
        status
      }
    }
  `;

  const { error, data: orderData } = useQuery(GET_ALL_ORDERS);
  if (error) {
    console.log(error.message);
  }
  
  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Home</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
          </Col>
          {/* Title End */}
        </Row>
      </div>

      <Row className="mb-3">
        <Col md="5" lg="3" xxl="2" className="mb-1">
          {/* Search Start */}
          <div className="d-inline-block float-md-start me-1 mb-1 search-input-container w-100 shadow bg-foreground">
            <Form.Control type="text" placeholder="Search" />
            <span className="search-magnifier-icon">
              <CsLineIcons icon="search" />
            </span>
            <span className="search-delete-icon d-none">
              <CsLineIcons icon="close" />
            </span>
          </div>
          {/* Search End */}
        </Col>
        <Col md="7" lg="9" xxl="10" className="mb-1 text-end">
          {/* Length Start */}
          <Dropdown align={{ xs: 'end' }} className="d-inline-block ms-1">
            <OverlayTrigger delay={{ show: 1000, hide: 0 }} placement="top" overlay={<Tooltip id="tooltip-top">Item Count</Tooltip>}>
              <Dropdown.Toggle variant="foreground-alternate" className="shadow sw-13">
                10 Items
              </Dropdown.Toggle>
            </OverlayTrigger>
            <Dropdown.Menu className="shadow dropdown-menu-end">
              <Dropdown.Item href="#">5 Items</Dropdown.Item>
              <Dropdown.Item href="#">10 Items</Dropdown.Item>
              <Dropdown.Item href="#">20 Items</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          {/* Length End */}
        </Col>
      </Row>

      {/* List Header Start */}
      <Row className="g-0 h-100 align-content-center d-none d-lg-flex ps-5 pe-5 mb-2 custom-sort">
        <Col md="2" className="d-flex flex-column mb-lg-0 pe-3 d-flex">
          <div className="text-muted text-small cursor-pointer sort">ID</div>
        </Col>
        <Col md="3" className="d-flex flex-column pe-1 justify-content-center">
          <div className="text-muted text-small cursor-pointer sort">NAME</div>
        </Col>
        <Col md="3" className="d-flex flex-column pe-1 justify-content-center">
          <div className="text-muted text-small cursor-pointer sort">EMAIL</div>
        </Col>
        <Col md="2" className="d-flex flex-column pe-1 justify-content-center">
          <div className="text-muted text-small cursor-pointer sort">DATE</div>
        </Col>
        <Col md="1" className="d-flex flex-column pe-1 justify-content-center">
          <div className="text-muted text-small cursor-pointer sort">STATUS</div>
        </Col>
      </Row>
      {/* List Header End */}

      {/* List Items Start */}
      {orderData?.getAllOrder?.map((order, index) => {
        if (order.paymentMethod === 'ONLINE') {
          return (
            <Card key={index} className="mb-2 hover-border-primary">
              <Card.Body className="pt-0 pb-0 sh-21 sh-md-8">
                <Row className="g-0 h-100 align-content-center cursor-default">
                  <Col xs="11" md="2" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-1 order-md-1 h-md-100 position-relative">
                    <div className="text-muted text-small d-md-none">Id</div>
                    <NavLink to={`/admin/order/detail/${order.id}`} className="text-truncate h-100 d-flex align-items-center">
                      {/* <span maxLength="2">{order.id} </span> */}
                      <span maxLength={2}>{order.id.substring(0, 12)}...</span>
                    </NavLink>
                  </Col>
                  <Col xs="6" md="3" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-3 order-md-2">
                    <div className="text-muted text-small d-md-none">Name</div>
                    <div className="text-alternate">
                      {order.user.firstName} {order.user.lastName}
                    </div>
                  </Col>
                  <Col xs="6" md="3" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-4 order-md-3">
                    <div className="text-muted text-small d-md-none">Email</div>
                    <div className="text-alternate">{order.user.email}</div>
                  </Col>
                  <Col xs="6" md="2" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-5 order-md-4">
                    <div className="text-muted text-small d-md-none">Date</div>
                    <div className="text-alternate">13.09.2023</div>
                  </Col>
                  <Col xs="6" md="2" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-last order-md-5">
                    <div className="text-muted text-small d-md-none">Status</div>
                    <div>
                      <Badge bg="outline-primary">{order.status}</Badge>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          );
        }
        return null;
      })}
      {/* List Items End */}

      {/* Pagination Start */}
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
      {/* Pagination End */}
    </>
  );
};

export default OrdersList;
