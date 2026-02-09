import React from 'react';
import { Table, Button, Row, Col } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { useParams, useHistory, NavLink, Link } from 'react-router-dom';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

function Email() {
  const title = 'Email Message';
  const description = 'Email Message';
  const history = useHistory();
  const { dataStoreFeatures1 } = useGlobleContext();
  const templates = [
    {
      title: 'Customer Registration (Customer)',
      subjectPath: '/admin/siteContent/customerRegistrationsubject',
      emailPath: '/admin/siteContent/customerRegistration',
    },
    {
      title: 'Forgot Password Request (Customer)',
      subjectPath: '/admin/siteContent/forgotPasswordsubject',
      emailPath: '/admin/siteContent/forgotPassword',
    },
    {
      title: 'Forgot Password Success (Customer)',
      subjectPath: '/admin/siteContent/updatePasswordsubject',
      emailPath: '/admin/siteContent/updatePassword',
    },
    {
      title: 'Contact Us Enquiry (Customer, Portal Admin)',
      subjectPath: '/admin/siteContent/contactEnquiryPagesubject',
      emailPath: '/admin/siteContent/contactEnquiryPage',
    },
    {
      title: 'B2B Registration (Customer, Portal Admin)',
      subjectPath: '/admin/siteContent/b2bRagistration',
      emailPath: '/admin/siteContent/b2bRagistration',
    },
    {
      title: 'B2B Request Approve (Customer, Portal Admin)',
      subjectPath: '/admin/siteContent/b2bRequestApprove',
      emailPath: '/admin/siteContent/b2bRequestApprove',
    },
    {
      title: 'B2B Request Reject (Customer, Portal Admin)',
      subjectPath: '/admin/siteContent/b2bRequestReject',
      emailPath: '/admin/siteContent/b2bRequestReject',
    },
    {
      title: 'Subscription Newsletter (Customer, Portal Admin)',
      subjectPath: '/admin/siteContent/subscriptionLetter',
      emailPath: '/admin/siteContent/subscriptionLetter',
    },
    {
      title: 'Single Product Enquiry - Product Details Pages (Customer, Portal Admin)',
      subjectPath: '/admin/siteContent/singleEnquirySubjectCustomer',
      emailPath: '/admin/siteContent/singleEnquiryCustomer',
    },
    {
      title: 'Bulk Enquiry Subject - Product Details Pages (Customer, Portal Admin)',
      subjectPath: '/admin/siteContent/bulkEnquirySubjectCustomer',
      emailPath: '/admin/siteContent/bulkEnquiryCustomer',
    },
    {
      title: 'Shopping Cart Enquiry (Customer, Portal Admin)',
      subjectPath: '/admin/siteContent/shoppingCartSubjectEnquiryPage',
      emailPath: '/admin/siteContent/shoppingCartEnquiryPage',
    },
    {
      title: 'Online Payment Failed (Customer, Portal Admin)',
      subjectPath: '/admin/siteContent/onlinepaymentfailedsubject',
      emailPath: '/admin/siteContent/onlinepaymentfailed',
    },
    {
      title: 'Online Order Success (Customer, Portal Admin, Account Admin)',
      subjectPath: '/admin/siteContent/onlineOrderSuccesssubject',
      emailPath: '/admin/siteContent/onlineOrderSuccess',
    },
    {
      title: 'Online Order Success (Seller Admin)',
      subjectPath: '/admin/siteContent/orderSuccessSellersubject',
      emailPath: '/admin/siteContent/orderSuccessSeller',
    },
    {
      title: 'Try Payment Method Online (Customer, Portal Admin)',
      subjectPath: '/admin/siteContent/onlineTryEmailsubject',
      emailPath: '/admin/siteContent/onlineTryEmail',
    },
    {
      title: 'Try Payment Method DMT (Customer, Portal Admin)',
      subjectPath: '/admin/siteContent/buyRequestsubject',
      emailPath: '/admin/siteContent/buyRequest',
    },
    {
      title: 'DMT Payment Proof Submit (Customer, Portal Admin, Account Admin)',
      subjectPath: '/admin/siteContent/dmtpaymentAdminsubject',
      emailPath: '/admin/siteContent/dmtpaymentAdmin',
    },
    {
      key: 'a',
      title: 'DMT Payment Received Success (Customer, Account Admin)',
      subjectPath: '/admin/siteContent/buyRequestProofsubject',
      emailPath: '/admin/siteContent/buyRequestProof',
    },
    {
      key: 'b',
      title: 'DMT Payment Received Success (Seller Admin)',
      subjectPath: '/admin/siteContent/buyRequestReceiptsubject',
      emailPath: '/admin/siteContent/buyRequestReceipt',
    },
    {
      key: 'c',
      title: 'Order Payment Failure (Customer, Portal Admin, Account Admin)',
      subjectPath: '/admin/siteContent/buyRequestFailuresubject',
      emailPath: '/admin/siteContent/buyRequestFailure',
    },
    {
      key: 'd',
      title: 'Order Packed (Customer, Portal Admin, Seller Admin)',
      subjectPath: '/admin/siteContent/orderPackedsubject',
      emailPath: '/admin/siteContent/orderPacked',
    },
    {
      title: 'Order Dispatched (Customer, Portal Admin, Seller Admin)',
      subjectPath: '/admin/siteContent/orderDispatchedsubject',
      emailPath: '/admin/siteContent/orderDispatched',
    },
    {
      title: 'Order Delivery (Customer, Portal Admin, Seller Admin)',
      subjectPath: '/admin/siteContent/orderDeliverysubject',
      emailPath: '/admin/siteContent/orderDelivery',
    },
    {
      title: 'Order Cancel (Portal Admin, Account Admin, Customer)',
      subjectPath: '/admin/siteContent/orderCancelsubject',
      emailPath: '/admin/siteContent/orderCancel',
    },
    {
      title: 'Order Cancel (Seller Admin)',
      subjectPath: '/admin/siteContent/orderCancelSellersubject',
      emailPath: '/admin/siteContent/orderCancelSeller',
    },
    {
      title: 'Product Approval (Portal Admin, Seller Admin)',
      subjectPath: '/admin/siteContent/productapprovesubject',
      emailPath: '/admin/siteContent/productapprove',
    },
    {
      title: 'Product Reject (Portal Admin, Seller Admin)',
      subjectPath: '/admin/siteContent/productrejectsubject',
      emailPath: '/admin/siteContent/productreject',
    },
    {
      title: 'Product Class (Portal Admin, Seller Admin)',
      subjectPath: '/admin/siteContent/productclasssubject',
      emailPath: '/admin/siteContent/productclass',
    },
    {
      title: 'Review (Portal Admin, Seller Admin, Customer)',
      subjectPath: '/admin/siteContent/reviewsubject',
      emailPath: '/admin/siteContent/review',
    },
  ];

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
      <Table bordered hover striped>
        <thead>
          <tr>
            <th>#</th>
            <th>Template Name</th>
            <th>Subject</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td className="fw-bold">{template.title}</td>
              <td>
                <Button className="m-0 p-1 ps-2 px-2" onClick={() => history.push(template.subjectPath)}>
                  Subject
                </Button>
              </td>
              <td>
                <Button className="m-0 p-1 ps-2 px-2" onClick={() => history.push(template.emailPath)}>
                  Email
                </Button>
              </td>
            </tr>
          ))}
          {dataStoreFeatures1?.getStoreFeature?.associate && (
            <>
              {[
                {
                  title: 'Enquiry Associate',
                  base: 'enquiry',
                },
                {
                  title: 'Service Associate',
                  base: 'service',
                },
                {
                  title: 'Seller Associate',
                  base: 'seller',
                },
                {
                  title: 'Business Associate',
                  base: 'business',
                },
                {
                  title: 'Already Registered DA',
                  base: 'dealerAlready',
                },
              ].map((associate, aIndex) => (
                <React.Fragment key={associate.base}>
                  <tr>
                    <td>{templates.length + 1 + aIndex * 2}</td>
                    <td className="fw-bold">{associate.title} Request (Customer, Portal Admin)</td>
                    <td>
                      <Button className="m-0 p-1 ps-2 px-2" onClick={() => history.push(`/admin/siteContent/${associate.base}RegistrationSubject`)}>
                        Subject
                      </Button>
                    </td>
                    <td>
                      <Button className="m-0 p-1 ps-2 px-2" onClick={() => history.push(`/admin/siteContent/${associate.base}Registration`)}>
                        Email
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>{templates.length + 2 + aIndex * 2}</td>
                    <td className="fw-bold">{associate.title} Approve (Customer, Portal Admin)</td>
                    <td>
                      <Button className="m-0 p-1 ps-2 px-2" onClick={() => history.push(`/admin/siteContent/${associate.base}RequestApproveSubject`)}>
                        Subject
                      </Button>
                    </td>
                    <td>
                      <Button className="m-0 p-1 ps-2 px-2" onClick={() => history.push(`/admin/siteContent/${associate.base}RequestApprove`)}>
                        Email
                      </Button>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </>
          )}
          <tr>
            <td>{templates.length + 1} </td>
            <td className="fw-bold">Registered New DA Request (Customer, Portal Admin)</td>
            <td>
              <Button as={NavLink} to="/admin/siteContent/dealerNewRegistrationSubject" className="btn btn-primary m-0 p-1 ps-2 px-2">
                Subject
              </Button>
            </td>
            <td>
              <Button as={NavLink} to="/admin/siteContent/dealerNewRegistration" className="btn btn-primary m-0 p-1 ps-2 px-2">
                Email
              </Button>
            </td>
          </tr>
        </tbody>
      </Table>
    </>
  );
}
export default Email;
