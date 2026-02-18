import React from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { useParams, useHistory, NavLink } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

function Sms() {
  const title = 'SMS Message';
  const description = 'SMS Message';
  const history = useHistory();

  return (
    <>
      <HtmlHead title={title} description={description} />
     <div className="page-title-container mb-2">
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
              history.push(`/admin/siteContent/customerRegistrationsms`);
            }}
          >
             Registration (Customer){' '}
          </Button>
        </li>

        {/* <li>
          <Button
            className="mx-1 my-1"
            onClick={() => {
              history.push(`/admin/siteContent/dmtpaymentproofsms`);
            }}
          >
            DMT Payment Proof Submit{' '}
          </Button>
        </li> */}

        <li>
          <Button
            className="mx-1 my-1"
            onClick={() => {
              history.push(`/admin/siteContent/ordersuccesssms`);
            }}
          >
            Order Received (Customer){' '}
          </Button>
        </li>
        <li>
          <Button
            className="mx-1 my-1"
            onClick={() => {
              history.push(`/admin/siteContent/ordersuccesssellersms`);
            }}
          >
            Order Received (Seller){' '}
          </Button>
        </li>

        {/* <li>
          <Button
            className="mx-1 my-1"
            onClick={() => {
              history.push(`/admin/siteContent/dmtorderreceiveds`);
            }}
          >
         DMT Order Received Payment Verify By account team :Seller{' '}
          </Button>
        </li>
           
        <li>
          <Button
            className="mx-1 my-1"
            onClick={() => {
              history.push(`/admin/siteContent/dmtorderreceivedc`);
            }}
          >
         DMT Order Received Payment Verify By account team :Customer{' '}
          </Button>
        </li> */}
        <li>
          <Button
            className="mx-1 my-1"
            onClick={() => {
              history.push(`/admin/siteContent/orderpacksms`);
            }}
          >
            Order Packed (Customer){' '}
          </Button>
        </li>
        <li>
          <Button
            className="mx-1 my-1"
            onClick={() => {
              history.push(`/admin/siteContent/ordershipsms`);
            }}
          >
            Order Ship (Customer){' '}
          </Button>
        </li>
        <li>
          <Button
            className="mx-1 my-1"
            onClick={() => {
              history.push(`/admin/siteContent/orderdeliverysms`);
            }}
          >
            Order Delivery (Customer){' '}
          </Button>
        </li>
        {/* <li>
          <Button
            className="mx-1 my-1"
            onClick={() => {
              history.push(`/admin/siteContent/orderCancelSeller`);
            }}
          >
            Order Cancel (Seller){' '}
          </Button>
        </li> */}
        {/* <li>
          <Button
            className="mx-1 my-1"
            onClick={() => {
              history.push(`/admin/siteContent/orderCancelCustomersms`);
            }}
          >
            Order Cancel (Customer){' '}
          </Button>
        </li> */}
        {/* <li>
          <Button
            className="mx-1 my-1"
            onClick={() => {
              history.push(`/admin/siteContent/ordercheckoutsms`);
            }}
          >
            Checkout Page : Shipping Address in Mobile number verification{' '}
          </Button>
        </li> */}
      </ol>
    </>
  );
}

export default Sms;
