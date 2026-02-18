import React, { useState } from 'react';
import { Row, Col, Button, Form, Card, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useQuery, gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

function GstTypeAttributes({ attributeId }) {
  const [gstTitle, setGstTitle] = useState('');
  const [gstrate, setGstRate] = useState('');

  const GETGST = gql`
    query GetGst($productAttributeId: ID!) {
      getGst(productAttributeId: $productAttributeId) {
        gstRate
        title
        id
      }
    }
  `;

  const CREATE_GST = gql`
    mutation CreateGst($productAttributeId: ID!, $title: String!, $gstRate: Float!) {
      createGst(productAttributeId: $productAttributeId, title: $title, gstRate: $gstRate) {
        title
      }
    }
  `;

  const UPDATE_GST = gql`
    mutation UpdateGst($productAttributeId: ID!, $gstId: ID!, $title: String, $gstRate: Float) {
      updateGst(productAttributeId: $productAttributeId, gstId: $gstId, title: $title, gstRate: $gstRate) {
        title
        id
      }
    }
  `;

  const DELETE_GST = gql`
    mutation DeleteGst($productAttributeId: ID!, $gstId: ID!) {
      deleteGst(productAttributeId: $productAttributeId, gstId: $gstId) {
        id
      }
    }
  `;

  // GET GST DATA TO LIST

  const { error, data, refetch } = useQuery(GETGST, {
    variables: { productAttributeId: attributeId },
  });
  if (error) {
    toast.error(error.message || 'Something went wrong!'); 
  }

  // SEND GST DATA TO THE SERVER

  const [CreateGst, response] = useMutation(CREATE_GST, {
    onCompleted: () => {
      toast(`${response.data.createGst.title} added successfully!`);
      refetch();
      setGstTitle('');
      setGstRate('');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!'); 
    },
  });

  const addGst = async (e) => {
    e.preventDefault();
    if (gstrate && gstTitle && attributeId) {
      await CreateGst({
        variables: {
          productAttributeId: attributeId,
          title: gstTitle,
          gstRate: parseFloat(gstrate),
        },
      });
    } else {
      toast.error('All fields are mandetory!');
    }
  };

  // UPDATE GST TYPE

  const [modalGstTitle, setModalGstTitle] = useState('');
  const [modalGstRate, setModalGstRate] = useState('');
  const [modalgstId, setModalgstId] = useState('');
  const [modalView, setModalview] = useState(false); // hide and show modal

  const [UpdateGst, updateResponse] = useMutation(UPDATE_GST, {
    onCompleted: () => {
      toast.success(`${updateResponse.data.updateGst.title} updated successfull!`);
      setModalview(false);
      refetch();
      setModalGstTitle('');
      setModalGstRate('');
      setModalgstId('');
    },
    onError: (errorinupdate) => {
      toast.error(errorinupdate.message || 'Something went wrong!'); 
    },
  });

  const editGst = (gstid, gsttitle, gstratee) => {
    setModalgstId(gstid);
    setModalGstTitle(gsttitle);
    setModalGstRate(gstratee);
  };

  const gstUpdate = async (e) => {
    e.preventDefault();
    if (modalGstTitle && modalGstRate && modalgstId && attributeId) {
      await UpdateGst({
        variables: {
          productAttributeId: attributeId,
          gstId: modalgstId,
          gstRate: parseFloat(modalGstRate),
          title: modalGstTitle,
        },
      });
    } else {
      toast.error('All fields are mandatory!');
    }
  };

  // delete GST

  const [deleteModalView, setDeleteModalView] = useState(false);
  const [deleteGstTypeName, setDeleteGstTypeName] = useState('');
  const [deleteGstTypeId, setDeleteGstTypeId] = useState('');

  const [DeleteGst] = useMutation(DELETE_GST, {
    onCompleted: () => {
      toast('Deleted successfully!');
      refetch();
      setDeleteModalView(false);
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!'); 
    },
  });

  const deleteGstType = (gstTypeId, gstTypeName) => {
    setDeleteModalView(true);
    setDeleteGstTypeId(gstTypeId);
    setDeleteGstTypeName(gstTypeName);
  };

  const deleteGstEntry = async () => {
    if (deleteGstTypeId && attributeId) {
      await DeleteGst({
        variables: {
          productAttributeId: attributeId,
          gstId: deleteGstTypeId,
        },
      });
    } else {
      toast.error('Something went wrong in deleteGstEntry!');
    }
  };

  return (
    <>
      <Row>
        <Col xl="6">
          {/* Product Info Start */}
          <Card className="mb-5">
            <Card.Body>
              <Form onSubmit={addGst}>
                <Form.Group className="mb-3" controlId="formTitle">
                  <Form.Label className="fs-5">Title</Form.Label>
                  <Form.Control type="text" name="title" value={gstTitle} onChange={(e) => setGstTitle(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formgstrate">
                  <Form.Label className="fs-5">GST Rate</Form.Label>
                  <Form.Control
                    type="number"
                    onWheel={(e) => e.target.blur()}
                    step="0.01"
                    name="gstrate"
                    value={gstrate}
                    onChange={(e) => setGstRate(e.target.value)}
                    min={0}
                  />
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
            <div className="text-md cursor-pointer sort">GST Rate</div>
          </Col>
          <Col lg="4" className="d-flex flex-column pe-1 justify-content-center">
            <div className="text-md cursor-pointer sort">Action</div>
          </Col>
        </Row>
        <div>
          {data &&
            data.getGst.map((item, index) => (
              <Card key={index} className="mb-2">
                <Card.Body className="pt-0 pb-0 sh-8 sh-lg-6">
                  <Row className="g-0 h-100 align-content-center">
                    <Col xs="6" lg="4" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-3 order-lg-2">
                      <div className="text-alternate">{item.title}</div>
                    </Col>
                    <Col xs="6" lg="4" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-3 order-lg-2">
                      <div className="text-alternate">{item.gstRate}</div>
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
                                editGst(item.id, item.title, item.gstRate);
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
                                // ShowDeleteModal();
                                deleteGstType(item.id, item.title);
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

      {/* EDIT GST MODAL starts */}
      <Modal className="modal-right scroll-out-negative" show={modalView} onHide={() => setModalview(false)} scrollable dialogClassName="full">
        <Modal.Header closeButton>
          <Modal.Title as="h5">Edit Gst Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OverlayScrollbarsComponent options={{ overflowBehavior: { x: 'hidden', y: 'scroll' } }} className="scroll-track-visible">
            <Form onSubmit={gstUpdate}>
              <div className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control type="text" defaultValue={modalGstTitle} onChange={(e) => setModalGstTitle(e.target.value)} />
              </div>
              <div className="mb-3">
                <Form.Label>Gst Rate</Form.Label>
                <Form.Control
                  type="number"
                  onWheel={(e) => e.target.blur()}
                  step="0.01"
                  min={0}
                  defaultValue={modalGstRate}
                  onChange={(e) => setModalGstRate(e.target.value)}
                />
              </div>
              <Button variant="primary" type="submit" className="btn-icon btn-icon-start">
                <CsLineIcons icon="save" />
                <span>Update</span>
              </Button>
            </Form>
          </OverlayScrollbarsComponent>
        </Modal.Body>
      </Modal>
      {/* EDIT GST MODAL ends */}

      {/* delete gst type modal starts */}

      <Modal show={deleteModalView} onHide={() => setDeleteModalView(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Gst Type</Modal.Title>
        </Modal.Header>
        {deleteGstTypeName && <Modal.Body>Are you really want to delete {deleteGstTypeName} !</Modal.Body>}
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setDeleteModalView(false);
              setDeleteGstTypeId('');
              setDeleteGstTypeName('');
            }}
          >
            No, I don't want
          </Button>
          <Button variant="primary" onClick={() => deleteGstEntry()}>
            Yes, I want
          </Button>
        </Modal.Footer>
      </Modal>
      {/* delete gst type modal ends */}
    </>
  );
}

export default GstTypeAttributes;
