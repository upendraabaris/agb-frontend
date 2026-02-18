import React, { useState, useEffect } from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';
import { Row, Col, Button, Form, Card, Tooltip, OverlayTrigger, Modal, Tabs, Tab, Spinner } from 'react-bootstrap';
import moment from 'moment';
import HtmlHead from 'components/html-head/HtmlHead';
import { NavLink } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

const GET_ALL_ENQUIRY = gql`
  query GetAllEnquery {
    getAllEnquery {
      active
      types
      id
      message
      customerName
      email
      mobileNo
      fullAddress
      state
      productName
      createdAt
    }
  }
`;
const EDIT_ENQUIRY = gql`
  mutation UpdateEnquery($updateEnqueryId: ID!, $active: Boolean, $message: String) {
    updateEnquery(id: $updateEnqueryId, active: $active, message: $message) {
      id
      message
      active
    }
  }
`;

function ListEnquire() {
  const title = 'List Enquiry';
  const description = 'List Enquiry';
  const [editModal, setEditModal] = useState(false);
  const [editMessage, setEditMessage] = useState('');
  const [editActive, setEditActive] = useState(false);
  const [editId, setEditId] = useState('');
  const { error, loading, data } = useQuery(GET_ALL_ENQUIRY);
  const [editEnquiry] = useMutation(EDIT_ENQUIRY);
  if (error) {
    return <div>Error fetching enquiries: {error.message}</div>;
  }
  const handleSave = () => {
    editEnquiry({
      variables: {
        updateEnqueryId: editId,
        message: editMessage,
        active: editActive,
      },
    }).then(() => {
      setEditModal(false);
    });
  };
  const handleEdit = (id, message, active) => {
    setEditModal(true);
    setEditId(id);
    setEditMessage(message);
    setEditActive(active);
  };
  const sortedFilteredEnquiries = (typeFilter) => {
    return data.getAllEnquery
      .filter((enquiry) => {
        const typesArray = Array.isArray(enquiry.types) ? enquiry.types : enquiry.types.split(',');
        return typesArray.includes(typeFilter);
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };
  const renderEnquiries = (typeFilter) =>
    loading ? (
      <div className="text-center">
        <Spinner animation="border" />
      </div>
    ) : (
      <>
        <div className="row m-0 p-2 bg-white border rounded">
          <div className="float-start col-3">
            <div className="text-dark fw-bold">Customer Details</div>
          </div>
          <div className="float-start col-3">
            <div className="text-md text-dark fw-bold">Message</div>
          </div>
          <div className="float-start col-4">
            <div className="text-dark fw-bold">Product</div>
          </div>
          {/* <div className="float-start col-1">
            <div className="text-md text-dark fw-bold">Status</div>
          </div> */}
          <div className="float-start col-1" /> {/* Changed to self-closing */}
        </div>
        {sortedFilteredEnquiries(typeFilter)
          .slice()
          .reverse()
          .map((enquiry) => (
            <Card key={enquiry.id} className="mb-1 single-line-card">
              <div className="p-3">
                <div className="float-start col-3">
                  <div>{enquiry.customerName}</div>
                  <div>{enquiry.email}</div>
                  <div>{enquiry.mobileNo}</div>
                  <div>
                    {enquiry.fullAddress} {enquiry.state}
                  </div>
                </div>
                <div className="float-start col-3">
                  <div>{enquiry.message}</div>
                </div>
                <div className="float-start col-4">
                  {enquiry.productName && enquiry.productName.split('<br />').map((name, index) => <div key={index}>{name.trim()}</div>)}
                  <div>{moment(parseInt(enquiry.createdAt, 10)).format('LL')}</div>
                </div>
                {/* <div className="float-start col-1">
                <div>{enquiry.active ? 'Resolved' : 'Unresolved'}</div>
              </div> */}
                <div className="float-start col-1">
                  <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-top">Edit</Tooltip>}>
                    <Button
                      variant="link"
                      className="col-1 mb-2 btn-icon btn-icon-only"
                      onClick={() => handleEdit(enquiry.id, enquiry.message, enquiry.active)}
                    >
                      <CsLineIcons icon="edit-square" />
                    </Button>
                  </OverlayTrigger>
                </div>
              </div>
            </Card>
          ))}
      </>
    );

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <span className="text-dark fw-bold ms-1">Dashboard</span>
            </NavLink>
            <span className="ps-1 small fw-bold"> / </span>
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/">
              <span className="text-dark fw-bold ms-1">{title}</span>
            </NavLink>
          </Col>
        </Row>
      </div>

      <Tabs justify>
        <Tab eventKey="contact" title="Contact Enquiry">
          {renderEnquiries('contact_enquiry')}
        </Tab>
        <Tab eventKey="single-product" title="Send Enquiry">
          {renderEnquiries('single_enquiry_product')}
        </Tab>
        <Tab eventKey="bulk_product" title="Bulk Enquiry">
          {renderEnquiries('bulk_enquiry_product')}
        </Tab>
        <Tab eventKey="cart-product" title="Cart Enquiry">
          {renderEnquiries('cart_enquiry_product')}
        </Tab>
        <Tab eventKey="subscription" title="Subscription">
          {renderEnquiries('subscription_letter')}
        </Tab>
        {/* <Tab eventKey="unresolved" title="Unresolved">
          {renderEnquiries('active')}
        </Tab>
        <Tab eventKey="resolved" title="Resolved">
          {renderEnquiries('resolved')}
        </Tab> */}
      </Tabs>

      <Modal
        className="modal-close d-inline-block"
        dialogClassName="modal-semi-full"
        centered
        scrollable
        show={editModal}
        onHide={() => {
          setEditModal(false);
          setEditMessage('');
          setEditActive(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title as="h4">Edit Enquiry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OverlayScrollbarsComponent options={{ overflowBehavior: { x: 'hidden', y: 'scroll' } }} className="scroll-track-visible">
            <Form>
              <div className="mb-3">
                <Form.Label>Enquiry message</Form.Label>
                <Form.Control type="text" value={editMessage} onChange={(e) => setEditMessage(e.target.value)} />
              </div>
              <div className="mb-3">
                <Form.Label>Enquiry Pending???</Form.Label>
                <Form.Check className="form-check" type="checkbox" onChange={(e) => setEditActive(e.currentTarget.checked)} checked={editActive} />
              </div>
            </Form>
          </OverlayScrollbarsComponent>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-primary" className="btn-icon btn-icon-only" onClick={handleSave}>
            <CsLineIcons icon="save" /> <span>Save</span>
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ListEnquire;
