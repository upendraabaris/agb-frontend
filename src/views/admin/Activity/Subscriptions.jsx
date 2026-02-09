import React, { useState } from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';
import { Row, Col, Button, Form, Card, Tooltip, OverlayTrigger, Modal, Spinner } from 'react-bootstrap';
import moment from 'moment';
import HtmlHead from 'components/html-head/HtmlHead';
import { NavLink, useHistory } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

const GET_ALL_ENQUIRY = gql`
  query GetAllEnquery($type: String, $limit: Int, $offset: Int) {
    getAllEnquery(type: $type, limit: $limit, offset: $offset) {
      id
      active            
      email      
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

function SubscriptionEnquiry() {
  const title = 'Subscription Enquiry';
  const description = 'Subscription Enquiry List';

  const history = useHistory();

  const [editModal, setEditModal] = useState(false);
  const [editMessage, setEditMessage] = useState('');
  const [editActive, setEditActive] = useState(false);
  const [editId, setEditId] = useState('');

  const LIMIT = 20;
  const [allEnquiries, setAllEnquiries] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const { loading, error, fetchMore } = useQuery(GET_ALL_ENQUIRY, {
    variables: {
      type: 'subscription_letter',
      limit: LIMIT,
      offset: 0,
    },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    onCompleted: (d) => {
      setAllEnquiries(d.getAllEnquery);
      if (d.getAllEnquery.length < LIMIT) {
        setHasMore(false);
      }
    },
  });

  const loadMore = () => {
    setLoadingMore(true);

    fetchMore({
      variables: {
        type: 'subscription_letter',
        limit: LIMIT,
        offset: allEnquiries.length,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          getAllEnquery: [...prev.getAllEnquery, ...fetchMoreResult.getAllEnquery],
        };
      },
    })
      .then((res) => {
        if (res.data.getAllEnquery.length < LIMIT) {
          setHasMore(false);
        }
      })
      .finally(() => setLoadingMore(false));
  };

  const [editEnquiry] = useMutation(EDIT_ENQUIRY);

  if (error) {
    return <div>Error fetching enquiries: {error.message}</div>;
  }

  const handleEdit = (id, message, active) => {
    setEditId(id);
    setEditMessage(message);
    setEditActive(active);
    setEditModal(true);
  };

  const handleSave = async () => {
    await editEnquiry({
      variables: {
        updateEnqueryId: editId,
        message: editMessage,
        active: editActive,
      },
    });
    setEditModal(false);
  };

  const cartEnquiries = [...allEnquiries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <>
      <HtmlHead title={title} description={description} />

      <div className="page-title-container m-0">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <button type="button" className="muted-link pb-1 d-inline-block bg-transparent border-0" onClick={() => window.history.back()}>
              <span className="text-dark ms-1">Back</span>
            </button>
          </Col>
        </Row>
      </div>
      <Row className="m-0 mb-1 p-1 rounded bg-white align-items-center">
        <Col md="12">
          <h5 className="fw-bold fs-5 ps-2 pt-2">{title}</h5>
        </Col>
      </Row>
      <Col md="12" className="d-flex mt-2 mb-2 justify-content-end align-items-center flex-wrap">
        {[
          { label: 'Add to Carts', path: '/admin/activity/carts' },
          { label: 'Wishlists', path: '/admin/activity/wishlists' },
          { label: 'Contact Enquiries', path: '/admin/activity/contact' },
          { label: 'Product Enquiries', path: '/admin/activity/product' },
          { label: 'Bulk Product Enquiries', path: '/admin/activity/bulk_product' },
          { label: 'Cart Enquiries', path: '/admin/activity/cart_enquiries' },
          { label: 'Subscriptions', path: '/admin/activity/subscriptions' },
        ].map((nav) => (
          <React.Fragment key={nav.path}>
            <NavLink to={nav.path} className={({ isActive }) => `text-decoration-none text-dark p-0 ${isActive ? 'fw-bold text-dark' : ''}`}>
              {nav.label}
            </NavLink>
            <span className="align-middle text-small ms-1 me-1">|</span>
          </React.Fragment>
        ))}
      </Col>

      {/* TABLE HEADER */}
      <div className="row m-0 p-2 bg-white border rounded fw-bold">
        <div className="col-3">Subscription Email</div>
        <div className="col-4">Date</div>
        <div className="col-1" />
      </div>

      {/* LIST */}
      {loading && allEnquiries.length === 0 ? (
        <div className="text-center mt-5">
          <Spinner animation="border" />
        </div>
      ) : (
        cartEnquiries?.map((enquiry) => (
          <Card key={enquiry.id} className="mb-1 single-line-card">
            <div className="p-3 row m-0">
              <div className="col-3">
                <div>{enquiry.email}</div>
              </div>

              <div className="col-4">
                <div className="text-muted small">{moment(Number(enquiry.createdAt)).format('DD-MMM-YYYY')}</div>
              </div>

              <div className="col-1 text-end">
                <OverlayTrigger placement="left" overlay={<Tooltip>Edit</Tooltip>}>
                  <Button variant="link" className="btn-icon btn-icon-only" onClick={() => handleEdit(enquiry.id, enquiry.message, enquiry.active)}>
                    <CsLineIcons icon="edit-square" />
                  </Button>
                </OverlayTrigger>
              </div>
            </div>
          </Card>
        ))
      )}

      {hasMore && (
        <Row className="justify-content-center mt-3">
          <Col xs="auto">
            <Button onClick={loadMore} disabled={loadingMore} className="d-flex align-items-center justify-content-center">
              {loadingMore ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </Col>
        </Row>
      )}

      {/* EDIT MODAL */}
      <Modal centered scrollable show={editModal} onHide={() => setEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Cart Enquiry</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <OverlayScrollbarsComponent>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Message</Form.Label>
                <Form.Control value={editMessage} onChange={(e) => setEditMessage(e.target.value)} />
              </Form.Group>

              <Form.Check type="checkbox" label="Enquiry Resolved" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} />
            </Form>
          </OverlayScrollbarsComponent>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={handleSave}>
            <CsLineIcons icon="save" /> Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default SubscriptionEnquiry;
