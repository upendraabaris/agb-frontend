import React, { useState } from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { Row, Col, Button, Form, Card, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

function FinalPriceType({ attributeId }) {
  const [finalChargeTitle, setFinalChargeTitle] = useState('');

  const GET_FINAL_PRICE = gql`
    query GetFinalPrice($productAttributeId: ID!) {
      getFinalPrice(productAttributeId: $productAttributeId) {
        id
        title
      }
    }
  `;

  const CREATE_FINAL_PRICE = gql`
    mutation CreateFinalPrice($productAttributeId: ID!, $title: String!) {
      createFinalPrice(productAttributeId: $productAttributeId, title: $title) {
        title
        id
      }
    }
  `;

  const UPDATE_FINAL_PRICE = gql`
    mutation UpdateFinalPrice($productAttributeId: ID!, $finalPriceId: ID!, $title: String) {
      updateFinalPrice(productAttributeId: $productAttributeId, finalPriceID: $finalPriceId, title: $title) {
        id
        title
      }
    }
  `;

  const DELETE_FINAL_PRICE = gql`
    mutation DeleteFinalPrice($productAttributeId: ID!, $finalPriceId: ID!) {
      deleteFinalPrice(productAttributeId: $productAttributeId, finalPriceID: $finalPriceId) {
        id
      }
    }
  `;

  // GET GST DATA TO LIST

  const { error, data, refetch } = useQuery(GET_FINAL_PRICE, {
    variables: { productAttributeId: attributeId },
  });

  if (error) {
    toast.error(error.message || 'Something went wrong!');
    console.error('GET_EXTRA_CHARGES', error);
  }

  // SEND PRICE_TYPE TO THE SERVER

  const [CreateFinalPrice, response] = useMutation(CREATE_FINAL_PRICE, {
    onCompleted: () => {
      refetch();
      toast(`${response.data.createFinalPrice.title} Created successfully!`);
      setFinalChargeTitle('');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
      console.error('CREATE_PRICE_TYPE', err);
    },
  });

  const addFinalChargeType = async (e) => {
    e.preventDefault();
    if (finalChargeTitle && attributeId) {
      await CreateFinalPrice({
        variables: {
          productAttributeId: attributeId,
          title: finalChargeTitle,
        },
      });
      e.target.reset();
    } else {
      toast.error('All fields are mandatory!');
    }
  };

  // UPDATE FINAL PRICE TYPE

  const [modalFinalPriceTitle, setModalFinalPriceTitle] = useState('');
  const [modalFinalPriceId, setModalFinalPriceId] = useState('');
  const [modalView, setModalview] = useState(false); // hide and show modal

  const [UpdateFinalPrice, updateResponse] = useMutation(UPDATE_FINAL_PRICE, {
    onCompleted: () => {
      toast.success(`${updateResponse.data.updateFinalPrice.title} updated successfull!`);
      setModalview(false);
      refetch();
      setModalFinalPriceTitle('');
      setModalFinalPriceId('');
    },
    onError: (errorinupdate) => {
      toast.error(errorinupdate.message || 'Something went wrong!'); 
    },
  });

  const editFinalPrice = (editfinalPriceId, editfinalPriceTitle) => {
    setModalFinalPriceId(editfinalPriceId);
    setModalFinalPriceTitle(editfinalPriceTitle);
  };

  const finalPriceUpdate = async (e) => {
    e.preventDefault();
    if (modalFinalPriceTitle && modalFinalPriceId && attributeId) {
      await UpdateFinalPrice({
        variables: {
          productAttributeId: attributeId,
          finalPriceId: modalFinalPriceId,
          title: modalFinalPriceTitle,
        },
      });
    } else {
      toast.error('All fields are mandetory!');
    }
  };

  // delete FINAL_PRICE TYPE

  const [deleteModalView, setDeleteModalView] = useState(false);
  const [deleteFinalPriceTitle, setDeleteFinalPriceTitle] = useState('');
  const [deleteFinalPriceId, setDeleteFinalPriceId] = useState('');

  const [DeleteFinalPrice] = useMutation(DELETE_FINAL_PRICE, {
    onCompleted: () => {
      refetch();
      setDeleteModalView(false);
      toast('Deleted successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!'); 
    },
  });

  const deleteFinalPriceType = (finalPriceid1, finalPriceTitle1) => {
    setDeleteFinalPriceId(finalPriceid1);
    setDeleteFinalPriceTitle(finalPriceTitle1);
  };

  const deleteTransportChargeEntry = async () => {
    if (deleteFinalPriceId && attributeId) {
      await DeleteFinalPrice({
        variables: {
          productAttributeId: attributeId,
          finalPriceId: deleteFinalPriceId,
        },
      });
    } else {
      toast.error('Something went wrong in deleteTransportChargeEntry!');
    }
  };

  return (
    <>
      <Row>
        <Col xl="6">
          {/* Product Info Start */}
          <Card className="mb-5">
            <Card.Body>
              <Form onSubmit={addFinalChargeType}>
                <Form.Group className="mb-3" controlId="formtitle">
                  <Form.Label className="fs-5">Title</Form.Label>
                  <Form.Control type="text" name="title" onChange={(e) => setFinalChargeTitle(e.target.value)} />
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
            data.getFinalPrice.map((item, index) => (
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
                                editFinalPrice(item.id, item.title);
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
                                deleteFinalPriceType(item.id, item.title);
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

      {/* EDIT Final Price MODAL starts */}

      <Modal className="modal-right scroll-out-negative" show={modalView} onHide={() => setModalview(false)} scrollable dialogClassName="full">
        <Modal.Header closeButton>
          <Modal.Title as="h5">Edit Final Price Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OverlayScrollbarsComponent options={{ overflowBehavior: { x: 'hidden', y: 'scroll' } }} className="scroll-track-visible">
            <Form onSubmit={finalPriceUpdate}>
              <div className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control type="text" defaultValue={modalFinalPriceTitle} onChange={(e) => setModalFinalPriceTitle(e.target.value)} />
              </div>
              <Button variant="primary" type="submit" className="btn-icon btn-icon-start">
                <CsLineIcons icon="save" />
                <span>Update</span>
              </Button>
            </Form>
          </OverlayScrollbarsComponent>
        </Modal.Body>
      </Modal>
      {/* EDIT Final Price ends */}

      {/* delete Transport Charge type modal starts */}

      <Modal show={deleteModalView} onHide={() => setDeleteModalView(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Price Type</Modal.Title>
        </Modal.Header>
        {deleteFinalPriceTitle && <Modal.Body>Are you really want to delete {deleteFinalPriceTitle} !</Modal.Body>}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModalView(false)}>
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

export default FinalPriceType;
