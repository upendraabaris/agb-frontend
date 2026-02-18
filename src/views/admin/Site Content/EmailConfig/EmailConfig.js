import React from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { useParams, useHistory, NavLink } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

function EmailConfig() {
  const title = 'Email Ids';
  const description = 'Email Ids';
  const history = useHistory();

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <span className="text-dark ms-1">Dashboard</span>
            </NavLink>
            <span className="p-2"> / </span>
            <span> {title} </span>           
          </Col>
        </Row>
      </div>
      <Row className="m-0 mb-2 p-1 rounded bg-white align-items-center">
        <Col md="6">
          <span className="fw-bold fs-5 ps-2 pt-2">{title}</span>
        </Col>
      </Row>
      <ol>
        <li>
          <Button
            className="mx-1 my-1"
            onClick={() => {
              history.push(`/admin/siteContent/adminEnquiryEmail`);
            }}
          >
            Admin Enquiry Email{' '}
          </Button>
        </li>
        <li>
          <Button
            className="mx-1 my-1"
            onClick={() => {
              history.push(`/admin/siteContent/accountsEnquiryEmail`);
            }}
          >
            Accounts Enquiry Email{' '}
          </Button>
        </li>
        <li>
          <Button
            className="mx-1 my-1"
            onClick={() => {
              history.push(`/admin/siteContent/contactPageEmail`);
            }}
          >
            Contact Page Email{' '}
          </Button>
        </li>
        <li>
          <Button
            className="mx-1 my-1"
            onClick={() => {
              history.push(`/admin/siteContent/sellerEnquiryEmail`);
            }}
          >
            Seller Enquiry Email{' '}
          </Button>
        </li>
        <li>
          <Button
            className="mx-1 my-1"
            onClick={() => {
              history.push(`/admin/siteContent/bulkEnquiryEmail`);
            }}
          >
            Bulk Enquiry Email{' '}
          </Button>
        </li>
        <li>
          <Button
            className="mx-1 my-1"
            onClick={() => {
              history.push(`/admin/siteContent/shoppingCartEnquiryEmail`);
            }}
          >
            Shopping Cart Enquiry Email{' '}
          </Button>
        </li>
        <li>
          <Button
            className="mx-1 my-1"
            onClick={() => {
              history.push(`/admin/siteContent/sellerB2bEnquiryEmail`);
            }}
          >
            Seller/B2B Enquiry Email{' '}
          </Button>
        </li>
        <li>
          <Button
            className="mx-1 my-1"
            onClick={() => {
              history.push(`/admin/siteContent/orderReceivedEnquiryEmail`);
            }}
          >
            Order Received Enquiry Email{' '}
          </Button>
        </li>
      </ol>
    </>
  );
}

export default EmailConfig;
