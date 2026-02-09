import React, { useState } from 'react';
import { Row, Col, Button, Form, Card, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';
import { useQuery, gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

function UnitTypeAttributes({ attributeId }) {
  const [unitTitle, setUnitTitle] = useState('');
  const [unitSymbol, setUnitSymbol] = useState('');

  const GET_UNIT_TYPE = gql`
    query GetUnitType($productAttributeId: ID!) {
      getUnitType(productAttributeId: $productAttributeId) {
        id
        title
        symbol
      }
    }
  `;

  const CREATE_UNIT_TYPE = gql`
    mutation CreateUnitType($productAttributeId: ID!, $title: String!, $symbol: String!) {
      createUnitType(productAttributeId: $productAttributeId, title: $title, symbol: $symbol) {
        id
        title
      }
    }
  `;

  const UPDATE_UNIT_TYPE = gql`
    mutation UpdateUnitType($productAttributeId: ID!, $unitTypeId: ID!, $title: String, $symbol: String) {
      updateUnitType(productAttributeId: $productAttributeId, unitTypeID: $unitTypeId, title: $title, symbol: $symbol) {
        id
        title
      }
    }
  `;

  const DELETE_UNIT_TYPE = gql`
    mutation DeleteUnitType($productAttributeId: ID!, $unitTypeId: ID!) {
      deleteUnitType(productAttributeId: $productAttributeId, unitTypeID: $unitTypeId) {
        id
      }
    }
  `;

  // GET GST DATA TO LIST

  const { error, data, refetch } = useQuery(GET_UNIT_TYPE, {
    variables: { productAttributeId: attributeId },
  });

  // if (data.getUnitType) {
  //   setProductAttrGst(data.getUnitType)
  // }

  if (error) {
    toast.error(error.message || 'Something went wrong!');
    console.error('GET_UNIT_TYPE', error);
  }

  // SEND GST DATA TO THE SERVER

  // const [CreateGst, response] = useMutation(CREATE_GST, {

  const [CreateUnitType, response] = useMutation(CREATE_UNIT_TYPE, {
    onCompleted: () => {
      refetch();
      toast(`${response.data.createUnitType.title} Created successfully!`);
      setUnitTitle('');
      setUnitSymbol('');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!'); 
    },
  });

  const addUnitType = async (e) => {
    e.preventDefault();
    if (unitSymbol && unitTitle && attributeId) {
      await CreateUnitType({
        variables: {
          productAttributeId: attributeId,
          title: unitTitle,
          symbol: unitSymbol,
        },
      });
      e.target.reset();
    } else {
      toast.error('All fields are mandetory!');
    }
  };

  // UPDATE UNIT TYPE

  const [modalUnitTitle, setModalUnitTitle] = useState('');
  const [modalUnitSymbol, setModalUnitSymbol] = useState('');
  const [modalunitId, setModalunitId] = useState('');
  const [modalView, setModalview] = useState(false); // hide and show modal

  const [UpdateUnitType, updateResponse] = useMutation(UPDATE_UNIT_TYPE, {
    onCompleted: () => {
      toast.success(`${updateResponse.data.updateUnitType.title} updated successfull!`);
      setModalview(false);
      refetch();
      setModalUnitTitle('');
      setModalUnitSymbol('');
      setModalunitId('');
    },
    onError: (errorinupdate) => {
      toast.error(errorinupdate.message || 'Something went wrong!'); 
    },
  });

  const editUnitType = (editunitId, editunitTitle, editunitSymbol) => {
    setModalunitId(editunitId);
    setModalUnitTitle(editunitTitle);
    setModalUnitSymbol(editunitSymbol);
  };

  const unitTypeUpdate = async (e) => {
    e.preventDefault();
    if (modalUnitTitle && modalUnitSymbol && modalunitId && attributeId) {
      await UpdateUnitType({
        variables: {
          productAttributeId: attributeId,
          unitTypeId: modalunitId,
          symbol: modalUnitSymbol,
          title: modalUnitTitle,
        },
      });
    } else {
      toast.error('All fields are mandetory!');
    }
  };

  // delete UNIT TYPE

  const [deleteModalView, setDeleteModalView] = useState(false);

  const [deleteUnitTypeName, setDeleteUnitTypeName] = useState('');
  const [deleteUnitTypeId, setDeleteUnitTypeId] = useState('');

  const [DeleteUnitType] = useMutation(DELETE_UNIT_TYPE, {
    onCompleted: () => {
      setDeleteModalView(false);
      toast('Deleted successfully!');
      refetch();
      setDeleteUnitTypeId('');
      setDeleteUnitTypeName('');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!'); 
    },
  });

  const deleteUnitType = (gstTypeId, gstTypeName) => {
    setDeleteUnitTypeId(gstTypeId);
    setDeleteUnitTypeName(gstTypeName);
  };

  const deleteUnitEntry = async () => {
    if (deleteUnitTypeId && attributeId) {
      await DeleteUnitType({
        variables: {
          productAttributeId: attributeId,
          unitTypeId: deleteUnitTypeId,
        },
      });
    } else {
      toast.error('something went wrong in deleteUnitEntry!');
    }
  };

  return (
    <>
      <Row>
        <Col xl="6">
          {/* Product Info Start */}
          <Card className="mb-5">
            <Card.Body>
              <Form onSubmit={addUnitType}>
                <Form.Group className="mb-3" controlId="formtitle">
                  <Form.Label className="fs-5">Title</Form.Label>
                  <Form.Control type="text" name="title" onChange={(e) => setUnitTitle(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formsymbol">
                  <Form.Label className="fs-5">Unit Type</Form.Label>
                  <Form.Control type="text" name="symbol" onChange={(e) => setUnitSymbol(e.target.value)} />
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
            data.getUnitType.map((item, index) => (
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
                        <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Edit Gst</Tooltip>}>
                          <div className="d-inline-block me-2">
                            <Button
                              variant="foreground-alternate"
                              className="btn-icon btn-icon-only shadow"
                              onClick={() => {
                                setModalview(true);
                                editUnitType(item.id, item.title, item.symbol);
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

      {/* EDIT UNIT TYPE MODAL starts */}
      <Modal className="modal-right scroll-out-negative" show={modalView} onHide={() => setModalview(false)} scrollable dialogClassName="full">
        <Modal.Header closeButton>
          <Modal.Title as="h5">Edit Unit Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OverlayScrollbarsComponent options={{ overflowBehavior: { x: 'hidden', y: 'scroll' } }} className="scroll-track-visible">
            <Form onSubmit={unitTypeUpdate}>
              <div className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control type="text" defaultValue={modalUnitTitle} onChange={(e) => setModalUnitTitle(e.target.value)} />
              </div>
              <div className="mb-3">
                <Form.Label>Unit Type</Form.Label>
                <Form.Control type="text" defaultValue={modalUnitSymbol} onChange={(e) => setModalUnitSymbol(e.target.value)} />
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

      {/* delete unit type modal starts */}

      <Modal show={deleteModalView} onHide={() => setDeleteModalView(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete unit Type</Modal.Title>
        </Modal.Header>
        {deleteUnitTypeName && <Modal.Body>Are you really want to delete {deleteUnitTypeName} !</Modal.Body>}
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
      {/* delete unit type modal ends */}
    </>
  );
}

export default UnitTypeAttributes;
