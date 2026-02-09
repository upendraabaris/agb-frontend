import React, { useState } from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { Row, Col, Button, Form, Card, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

function ExtraChargeType({ attributeId }) {
  const [extraChargesTitle, setExtraChargesTitle] = useState('');

  const GET_EXTRA_CHARGES = gql`
    query GetExtraCharge($productAttributeId: ID!) {
      getExtraCharge(productAttributeId: $productAttributeId) {
        id
        title
      }
    }
  `;

  const CREATE_EXTRA_CHARGES = gql`
    mutation CreateExtraCharge($productAttributeId: ID!, $title: String!) {
      createExtraCharge(productAttributeId: $productAttributeId, title: $title) {
        id
        title
      }
    }
  `;

  const UPDATE_EXTRA_CHARGES = gql`
    mutation UpdateExtraCharge($productAttributeId: ID!, $extraChargeId: ID!, $title: String) {
      updateExtraCharge(productAttributeId: $productAttributeId, extraChargeID: $extraChargeId, title: $title) {
        id
        title
      }
    }
  `;

  const DELETE_EXTRA_CHARGES = gql`
    mutation DeleteExtraCharge($productAttributeId: ID!, $extraChargeId: ID!) {
      deleteExtraCharge(productAttributeId: $productAttributeId, extraChargeID: $extraChargeId) {
        id
      }
    }
  `;

  // GET GST DATA TO LIST

  const { error, data, refetch } = useQuery(GET_EXTRA_CHARGES, {
    variables: { productAttributeId: attributeId },
  });

  if (error) {
    toast.error(error.message || 'Something went wrong!');
    console.error('GET_EXTRA_CHARGES', error);
  }

  // SEND PRICE_TYPE TO THE SERVER

  const [CreatePriceType, response] = useMutation(CREATE_EXTRA_CHARGES, {
    onCompleted: () => {
      refetch();
      toast(`${response.data.createExtraCharge.title} Created successfully!`);
      setExtraChargesTitle('');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
      console.error('CREATE_PRICE_TYPE', err);
    },
  });

  const addExtraChargesType = async (e) => {
    e.preventDefault();
    if (extraChargesTitle && attributeId) {
      await CreatePriceType({
        variables: {
          productAttributeId: attributeId,
          title: extraChargesTitle,
        },
      });
      e.target.reset();
    } else {
      toast.error('All fields are mandetory!');
    }
  };

  // UPDATE EXTRA CHARGES TYPE

  const [modalExtraChargeTitle, setModalExtraChargeTitle] = useState('');
  const [modalExtraChargeId, setModalExtraChargeId] = useState('');
  const [modalView, setModalview] = useState(false); // hide and show modal

  const [UpdateExtraCharge, updateResponse] = useMutation(UPDATE_EXTRA_CHARGES, {
    onCompleted: () => {
      toast.success(`${updateResponse.data.updateExtraCharge.title} updated successfull!`);
      setModalview(false);
      refetch();
      setModalExtraChargeTitle('');
      setModalExtraChargeId('');
    },
    onError: (errorinupdate) => {
      toast.error(errorinupdate.message || 'Something went wrong!'); 
    },
  });

  const editPriceType = (editpriceId, editpriceTitle) => {
    setModalExtraChargeId(editpriceId);
    setModalExtraChargeTitle(editpriceTitle);
  };

  const unitTypeUpdate = async (e) => {
    e.preventDefault();
    if (modalExtraChargeTitle && modalExtraChargeId && attributeId) {
      await UpdateExtraCharge({
        variables: {
          productAttributeId: attributeId,
          extraChargeId: modalExtraChargeId,
          title: modalExtraChargeTitle,
        },
      });
    } else {
      toast.error('All fields are mandatory!');
    }
  };

  // delete EXTRA_CHARGES TYPE

  const [deleteModalView, setDeleteModalView] = useState(false);

  const [deleteExtraChargeTitle, setDeleteExtraChargeTitle] = useState('');
  const [deleteExtraChargeId, setDeleteExtraChargeId] = useState('');

  const [DeleteExtraCharge] = useMutation(DELETE_EXTRA_CHARGES, {
    onCompleted: () => {
      refetch();
      setDeleteModalView(false);
      toast('Deleted successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!'); 
    },
  });

  const deleteExtraCharge = (extChargeId, extChargeTitle) => {
    setDeleteExtraChargeId(extChargeId);
    setDeleteExtraChargeTitle(extChargeTitle);
  };

  const deleteExtraChargeEntry = async () => {
    if (deleteExtraChargeId && attributeId) {
      await DeleteExtraCharge({
        variables: {
          productAttributeId: attributeId,
          extraChargeId: deleteExtraChargeId,
        },
      });
    } else {
      toast.error('Something went wrong in deleteExtraChargeEntry!');
    }
  };

  return (
    <>
      <Row>
        <Col xl="6">
          {/* Product Info Start */}
          <Card className="mb-5">
            <Card.Body>
              <Form onSubmit={addExtraChargesType}>
                <Form.Group className="mb-3" controlId="formTitle">
                  <Form.Label className="fs-5">Title</Form.Label>
                  <Form.Control type="text" name="title" onChange={(e) => setExtraChargesTitle(e.target.value)} />
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
            data.getExtraCharge.map((item, index) => (
              <Card key={index} className="mb-2">
                <Card.Body className="pt-0 pb-0 sh-8 sh-lg-6">
                  <Row className="g-0 h-100 align-content-center">
                    <Col xs="6" lg="4" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-3 order-lg-2">
                      <div className="text-alternate">{item.title}</div>
                    </Col>
                    {/* <Col xs="6" lg="4" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-3 order-lg-2">
                     <div className="text-alternate">item.gstRate</div>
                     </Col> */}
                    <Col xs="6" lg="4" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-last order-lg-5">
                      <div className="text-muted text-small d-lg-none mb-1">Action</div>
                      <div>
                        <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Edit extra charge</Tooltip>}>
                          <div className="d-inline-block me-2">
                            <Button
                              variant="foreground-alternate"
                              className="btn-icon btn-icon-only shadow"
                              onClick={() => {
                                setModalview(true);
                                editPriceType(item.id, item.title);
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
                                deleteExtraCharge(item.id, item.title);
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

      {/* EDIT UNIT TYPE MODAL starts */}
      <Modal className="modal-right scroll-out-negative" show={modalView} onHide={() => setModalview(false)} scrollable dialogClassName="full">
        <Modal.Header closeButton>
          <Modal.Title as="h5">Edit Extra price Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OverlayScrollbarsComponent options={{ overflowBehavior: { x: 'hidden', y: 'scroll' } }} className="scroll-track-visible">
            <Form onSubmit={unitTypeUpdate}>
              <div className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control type="text" defaultValue={modalExtraChargeTitle} onChange={(e) => setModalExtraChargeTitle(e.target.value)} />
              </div>
              <Button variant="primary" type="submit" className="btn-icon btn-icon-start">
                <CsLineIcons icon="save" />
                <span>Update</span>
              </Button>
            </Form>
          </OverlayScrollbarsComponent>
        </Modal.Body>
      </Modal>

      {/* EDIT UNIT TYPE ends */}

      {/* delete Price type modal starts */}

      <Modal show={deleteModalView} onHide={() => setDeleteModalView(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Price Type</Modal.Title>
        </Modal.Header>
        {deleteExtraChargeTitle && <Modal.Body>Are you really want to delete {deleteExtraChargeTitle} !</Modal.Body>}
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setDeleteModalView(false);
            }}
          >
            No, I don't want
          </Button>
          <Button variant="primary" onClick={() => deleteExtraChargeEntry()}>
            Yes, I want
          </Button>
        </Modal.Footer>
      </Modal>
      {/* delete Price type modal ends */}
    </>
  );
}

export default ExtraChargeType;
