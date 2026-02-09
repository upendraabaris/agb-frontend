import React, { useState } from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { Row, Col, Button, Form, Card, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

function TransportChargeType({ attributeId }) {
  const [transportChargeTitle, setTransportChargeTitle] = useState('');

  const GET_TRANSPORT_CHARGES = gql`
    query GetTransportCharge($productAttributeId: ID!) {
      getTransportCharge(productAttributeId: $productAttributeId) {
        id
        title
      }
    }
  `;

  const CREATE_TRANSPORT_CHARGES = gql`
    mutation CreateTransportCharge($productAttributeId: ID!, $title: String!) {
      createTransportCharge(productAttributeId: $productAttributeId, title: $title) {
        id
        title
      }
    }
  `;

  const UPDATE_TRANSPORT_CHARGES = gql`
    mutation UpdateTransportCharge($productAttributeId: ID!, $transportChargeId: ID!, $title: String) {
      updateTransportCharge(productAttributeId: $productAttributeId, transportChargeID: $transportChargeId, title: $title) {
        id
        title
      }
    }
  `;

  const DELETE_TRANSPORT_CHARGES = gql`
    mutation DeleteTransportCharge($productAttributeId: ID!, $transportChargeId: ID!) {
      deleteTransportCharge(productAttributeId: $productAttributeId, transportChargeID: $transportChargeId) {
        id
      }
    }
  `;

  // GET GST DATA TO LIST

  const { error, data, refetch } = useQuery(GET_TRANSPORT_CHARGES, {
    variables: { productAttributeId: attributeId },
  });

  if (error) {
    toast.error(error.message || 'Something went wrong!');
    console.error('GET_EXTRA_CHARGES', error);
  }

  // SEND PRICE_TYPE TO THE SERVER

  const [CreateTransportCharge, response] = useMutation(CREATE_TRANSPORT_CHARGES, {
    onCompleted: () => {
      refetch();
      toast(`${response.data.createTransportCharge.title} Created successfully!`);
      setTransportChargeTitle('');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
      console.error('CREATE_PRICE_TYPE', err);
    },
  });

  const addTransportChargeType = async (e) => {
    e.preventDefault();
    if (transportChargeTitle && attributeId) {
      await CreateTransportCharge({
        variables: {
          productAttributeId: attributeId,
          title: transportChargeTitle,
        },
      });
      e.target.reset();
    } else {
      toast.error('All fields are mandetory!');
    }
  };

  // UPDATE_TRANSPORT_CHARGES TYPE

  const [modalTransportChargeTitle, setModalTransportChargeTitle] = useState('');
  const [modalTransportChargeId, setModalTransportChargeId] = useState('');
  const [modalView, setModalview] = useState(false); // hide and show modal

  const [UpdateTransportCharge, updateResponse] = useMutation(UPDATE_TRANSPORT_CHARGES, {
    onCompleted: () => {
      toast.success(`${updateResponse.data.updateTransportCharge.title} updated successfull!`);
      setModalview(false);
      refetch();
      setModalTransportChargeTitle('');
      setModalTransportChargeId('');
    },
    onError: (errorinupdate) => {
      toast.error(errorinupdate.message || 'Something went wrong!'); 
    },
  });

  const editTransportCharge = (edittransportchargeId, edittransportChargeTitle) => {
    setModalTransportChargeId(edittransportchargeId);
    setModalTransportChargeTitle(edittransportChargeTitle);
  };

  const TransportChargeUpdate = async (e) => {
    e.preventDefault();
    if (modalTransportChargeTitle && modalTransportChargeId && attributeId) {
      await UpdateTransportCharge({
        variables: {
          productAttributeId: attributeId,
          transportChargeId: modalTransportChargeId,
          title: modalTransportChargeTitle,
        },
      });
    } else {
      toast.error('All fields are mandatory!');
    }
  };

  // delete TRANSPORT_CHARGES TYPE

  const [deleteModalView, setDeleteModalView] = useState(false);

  const [deleteTransportChargeTitle, setDeleteTransportChargeTitle] = useState('');
  const [deleteTransportChargeId, setDeleteTransportChargeId] = useState('');

  const [DeleteTransportCharge] = useMutation(DELETE_TRANSPORT_CHARGES, {
    onCompleted: () => {
      refetch();
      setDeleteModalView(false);
      toast('Deleted successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!'); 
    },
  });

  const deleteTransportCharge = (transChargeId, transChargeTitle) => {
    setDeleteTransportChargeId(transChargeId);
    setDeleteTransportChargeTitle(transChargeTitle);
  };

  const deleteTransportChargeEntry = async () => {
    if (deleteTransportChargeId && attributeId) {
      await DeleteTransportCharge({
        variables: {
          productAttributeId: attributeId,
          transportChargeId: deleteTransportChargeId,
        },
      });
    } else {
      toast.error('Something went wrong in deleteTransportChargeEntry!!!');
    }
  };

  return (
    <>
      <Row>
        <Col xl="6">
          {/* Product Info Start */}
          <Card className="mb-5">
            <Card.Body>
              <Form onSubmit={addTransportChargeType}>
                <Form.Group className="mb-3" controlId="formtitle">
                  <Form.Label className="fs-5">Title</Form.Label>
                  <Form.Control type="text" name="title" onChange={(e) => setTransportChargeTitle(e.target.value)} />
                </Form.Group>
                <div className="text-center">
                  <Button className="btn-icon btn-icon-start d-inline-block" type="submit">
                    <CsLineIcons icon="save" />
                    <span> Save</span>
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Row className="g-0 h-100 align-content-center d-none d-lg-flex ps-5 pe-2 mb-2 custom-sort">
          <Col lg="4" className="d-flex flex-column pe-1 justify-content-center">
            <div className="text-md cursor-pointer sort">Title</div>
          </Col>
          <Col lg="4" className="d-flex flex-column pe-1 justify-content-center">
            <div className="text-md cursor-pointer sort">Action</div>
          </Col>
        </Row>
        <div>
          {data &&
            data.getTransportCharge.map((item, index) => (
              <Card key={index} className="mb-2">
                <Card.Body className="pt-0 pb-0 sh-8 sh-lg-6">
                  <Row className="g-0 h-100 align-content-center">
                    <Col xs="6" lg="4" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-3 order-lg-2">
                      <div className="text-alternate">{item.title}</div>
                    </Col>
                    <Col xs="6" lg="4" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-last order-lg-5">
                      <div className="text-muted text-small d-lg-none mb-1">Action</div>
                      <div>
                        <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Edit Gst</Tooltip>}>
                          <div className="d-inline-block me-2">
                            <Button
                              variant="foreground-alternate"
                              className="btn-icon btn-icon-only shadow"
                              onClick={() => {
                                setModalview(true);
                                editTransportCharge(item.id, item.title);
                              }}
                            >
                              <CsLineIcons icon="edit-square" className="text-primary" size="17" />
                            </Button>
                          </div>
                        </OverlayTrigger>
                        <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Delete Gst</Tooltip>}>
                          <div className="d-inline-block me-2">
                            <Button
                              variant="foreground-alternate"
                              className="btn-icon btn-icon-only shadow"
                              onClick={() => {
                                setDeleteModalView(true);
                                deleteTransportCharge(item.id, item.title);
                              }}
                            >
                              <CsLineIcons icon="bin" className="text-primary" size="17" />
                            </Button>
                          </div>
                        </OverlayTrigger>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
        </div>
      </Row>

      {/* EDIT Transport Charge MODAL starts */}
      <Modal className="modal-right scroll-out-negative" show={modalView} onHide={() => setModalview(false)} scrollable dialogClassName="full">
        <Modal.Header closeButton>
          <Modal.Title as="h5">Edit Transport Charge Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OverlayScrollbarsComponent options={{ overflowBehavior: { x: 'hidden', y: 'scroll' } }} className="scroll-track-visible">
            <Form onSubmit={TransportChargeUpdate}>
              <div className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control type="text" defaultValue={modalTransportChargeTitle} onChange={(e) => setModalTransportChargeTitle(e.target.value)} />
              </div>
              <Button variant="primary" type="submit" className="btn-icon btn-icon-start">
                <CsLineIcons icon="save" />
                <span>Update</span>
              </Button>
            </Form>
          </OverlayScrollbarsComponent>
        </Modal.Body>
      </Modal>

      {/* EDIT Transport Charge ends */}

      {/* delete Transport Charge type modal starts */}

      <Modal show={deleteModalView} onHide={() => setDeleteModalView(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Price Type</Modal.Title>
        </Modal.Header>
        {deleteTransportChargeTitle && <Modal.Body>Are you really want to delete {deleteTransportChargeTitle} !</Modal.Body>}
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setDeleteModalView(false);
            }}
          >
            No, I don't want
          </Button>
          <Button variant="primary" onClick={() => deleteTransportChargeEntry()}>
            Yes, I want
          </Button>
        </Modal.Footer>
      </Modal>
      {/* delete Transport Charge type modal ends */}
    </>
  );
}

export default TransportChargeType;
