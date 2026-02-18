import React, { useState } from 'react';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useQuery, gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { Row, Col, Button, Form, Card, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

function PriceType({ attributeId }) {
  const [priceTitle, setPriceTitle] = useState('');
  const [priceSymbol, setPriceSymbol] = useState('');

  const GET_PRICE_TYPE = gql`
    query GetPriceType($productAttributeId: ID!) {
      getPriceType(productAttributeId: $productAttributeId) {
        id
        symbol
        title
      }
    }
  `;

  const CREATE_PRICE_TYPE = gql`
    mutation CreatePriceType($productAttributeId: ID!, $title: String!, $symbol: String!) {
      createPriceType(productAttributeId: $productAttributeId, title: $title, symbol: $symbol) {
        title
        id
      }
    }
  `;

  const UPDATE_PRICE_TYPE = gql`
    mutation UpdatePriceType($productAttributeId: ID!, $priceTypeId: ID!, $title: String, $symbol: String) {
      updatePriceType(productAttributeId: $productAttributeId, priceTypeID: $priceTypeId, title: $title, symbol: $symbol) {
        title
        id
      }
    }
  `;

  const DELETE_PRICE_TYPE = gql`
    mutation DeletePriceType($productAttributeId: ID!, $priceTypeId: ID!) {
      deletePriceType(productAttributeId: $productAttributeId, priceTypeID: $priceTypeId) {
        id
      }
    }
  `;

  // GET GST DATA TO LIST

  const { error, data, refetch } = useQuery(GET_PRICE_TYPE, {
    variables: { productAttributeId: attributeId },
  });

  if (error) {
    toast.error(error.message || 'Something went wrong!');
    console.error('GET_PRICE_TYPE', error);
  }

  // SEND PRICE_TYPE TO THE SERVER

  const [CreatePriceType, response] = useMutation(CREATE_PRICE_TYPE, {
    onCompleted: () => {
      refetch();
      toast(`${response.data.createPriceType.title} Created successfully!`);
      setPriceTitle('');
      setPriceSymbol('');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
      console.error('CREATE_PRICE_TYPE', err);
    },
  });

  const addPriceType = async (e) => {
    e.preventDefault();
    if (priceSymbol && priceTitle && attributeId) {
      await CreatePriceType({
        variables: {
          productAttributeId: attributeId,
          title: priceTitle,
          symbol: priceSymbol,
        },
      });
      e.target.reset();
    } else {
      toast.error('All fields are mandetory!');
    }
  };

  // UPDATE PRICE TYPE

  const [modalPriceTitle, setModalPriceTitle] = useState('');
  const [modalPriceSymbol, setModalPriceSymbol] = useState('');
  const [modalPriceId, setModalPriceId] = useState('');
  const [modalView, setModalview] = useState(false); // hide and show modal

  const [UpdatePriceType, updateResponse] = useMutation(UPDATE_PRICE_TYPE, {
    onCompleted: () => {
      toast.success(`${updateResponse.data.updatePriceType.title} updated successfull!`);
      setModalview(false);
      refetch();
      setModalPriceTitle('');
      setModalPriceSymbol('');
      setModalPriceId('');
    },
    onError: (errorinupdate) => {
      toast.error(errorinupdate.message || 'Something went wrong!'); 
    },
  });

  const editPriceType = (editpriceId, editpriceTitle, editpriceSymbol) => {
    setModalPriceId(editpriceId);
    setModalPriceTitle(editpriceTitle);
    setModalPriceSymbol(editpriceSymbol);
  };

  const unitTypeUpdate = async (e) => {
    e.preventDefault();
    if (modalPriceTitle && modalPriceSymbol && modalPriceId && attributeId) {
      await UpdatePriceType({
        variables: {
          productAttributeId: attributeId,
          priceTypeId: modalPriceId,
          symbol: modalPriceSymbol,
          title: modalPriceTitle,
        },
      });
    } else {
      toast.error('All fields are mandatory!');
    }
  };

  // delete Price TYPE

  const [deleteModalView, setDeleteModalView] = useState(false);

  const [deletePriceTypeName, setDeletePriceTypeName] = useState('');
  const [deletePriceTypeId, setDeletePriceTypeId] = useState('');

  const [DeletePriceType] = useMutation(DELETE_PRICE_TYPE, {
    onCompleted: () => {
      refetch();
      setDeleteModalView(false);
      toast('Deleted successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!'); 
    },
  });

  const deleteUnitType = (gstTypeId, gstTypeName) => {
    setDeletePriceTypeId(gstTypeId);
    setDeletePriceTypeName(gstTypeName);
  };

  const deleteUnitEntry = async () => {
    if (deletePriceTypeId && attributeId) {
      await DeletePriceType({
        variables: {
          productAttributeId: attributeId,
          priceTypeId: deletePriceTypeId,
        },
      });
    } else {
      toast.error('Something went wrong in deleteUnitEntry!');
    }
  };

  return (
    <>
      <Row>
        <Col xl="6">
          {/* Product Info Start */}
          <Card className="mb-5">
            <Card.Body>
              <Form onSubmit={addPriceType}>
                <Form.Group className="mb-3" controlId="formtitle">
                  <Form.Label className="fs-5">Title</Form.Label>
                  <Form.Control type="text" name="title" onChange={(e) => setPriceTitle(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formsymbol">
                  <Form.Label className="fs-5">Unit Type</Form.Label>
                  <Form.Control type="text" name="symbol" onChange={(e) => setPriceSymbol(e.target.value)} />
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
            <div className="text-md cursor-pointer sort">Unit Type</div>
          </Col>
          <Col lg="4" className="d-flex flex-column pe-1 justify-content-center">
            <div className="text-md cursor-pointer sort">Action</div>
          </Col>
        </Row>
        <div>
          {data &&
            data.getPriceType.map((item, index) => (
              <Card key={index} className="mb-2">
                <Card.Body className="pt-0 pb-0 sh-8 sh-lg-6">
                  <Row className="g-0 h-100 align-content-center">
                    <Col xs="6" lg="4" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-3 order-lg-2">
                      <div className="text-alternate">{item.title}</div>
                    </Col>
                    <Col xs="6" lg="4" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-3 order-lg-2">
                      <div className="text-alternate">{item.symbol}</div>
                    </Col>
                    <Col xs="6" lg="4" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-last order-lg-5">
                      <div className="text-muted text-small d-lg-none mb-1">Action</div>
                      <div>
                        <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Edit Price</Tooltip>}>
                          <div className="d-inline-block me-2">
                            <Button
                              variant="foreground-alternate"
                              className="btn-icon btn-icon-only shadow"
                              onClick={() => {
                                setModalview(true);
                                editPriceType(item.id, item.title, item.symbol);
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
                                deleteUnitType(item.id, item.title);
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

      {/* EDIT Price TYPE MODAL starts */}
      <Modal className="modal-right scroll-out-negative" show={modalView} onHide={() => setModalview(false)} scrollable dialogClassName="full">
        <Modal.Header closeButton>
          <Modal.Title as="h5">Edit Price Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OverlayScrollbarsComponent options={{ overflowBehavior: { x: 'hidden', y: 'scroll' } }} className="scroll-track-visible">
            <Form onSubmit={unitTypeUpdate}>
              <div className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control type="text" defaultValue={modalPriceTitle} onChange={(e) => setModalPriceTitle(e.target.value)} />
              </div>
              <div className="mb-3">
                <Form.Label>Price Tag</Form.Label>
                <Form.Control type="text" defaultValue={modalPriceSymbol} onChange={(e) => setModalPriceSymbol(e.target.value)} />
              </div>
              <Button variant="primary" type="submit" className="btn-icon btn-icon-start">
                <CsLineIcons icon="save" />
                <span>Update</span>
              </Button>
            </Form>
          </OverlayScrollbarsComponent>
        </Modal.Body>
      </Modal>

      {/* EDIT Price TYPE ends */}

      {/* delete Price type modal starts */}

      <Modal show={deleteModalView} onHide={() => setDeleteModalView(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Price Type</Modal.Title>
        </Modal.Header>
        {deletePriceTypeName && <Modal.Body>Are you really want to delete {deletePriceTypeName} !</Modal.Body>}
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setDeleteModalView(false);
            }}
          >
            No, I don't want
          </Button>
          <Button variant="primary" onClick={() => deleteUnitEntry()}>
            Yes, I want
          </Button>
        </Modal.Footer>
      </Modal>
      {/* delete Price type modal ends */}
    </>
  );
}

export default PriceType;
