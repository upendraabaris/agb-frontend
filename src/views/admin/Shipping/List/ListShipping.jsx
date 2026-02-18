import { React, useState } from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { NavLink } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { Row, Col, Button, Form, Card, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';

function ListShipping() {
  const title = 'List Shipping';
  const description = 'Ecommerce List Shipping Page';

  // Edit
  const [editModal, setEditModal] = useState(false);
  const [apiEdit, setApiEdit] = useState('');
  const [urlEdit, setUrlEdit] = useState('');
  const [descEdit, setDescEdit] = useState('');
  const [compEdit, setCompanyEdit] = useState('');
  const [editId, setEditId] = useState('');

  // Delete
  const [deleteModalView, setDeleteModalView] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [deleteTitle, setTitleDelete] = useState('');

  // Display on First Render

  const GET_SHIPPING = gql`
    query GetAllShipping {
      getAllShipping {
        url
        shipping_company
        id
        description
        api
      }
    }
  `;

  const { loading, error, data, refetch } = useQuery(GET_SHIPPING);
  if (loading) {
    console.log(`Loading: ${loading}`);
  }
  if (error) {
    console.log(`Error!!! : ${error.message}`);
  }
  if (data) {
    refetch();
  }

  // Edit

  const EDIT_SHIPPING = gql`
    mutation UpdateShipping($updateShippingId: ID!, $shippingCompany: String, $url: String, $description: String, $api: String) {
      updateShipping(id: $updateShippingId, shipping_company: $shippingCompany, url: $url, description: $description, api: $api) {
        api
        description
        id
        shipping_company
        url
      }
    }
  `;

  const [editShipping, { loading: loadEdit, error: errorEdit, data: dataEdit }] = useMutation(EDIT_SHIPPING);
  if (loadEdit) {
    console.log(`Loading: ${loadEdit}`);
  }
  if (errorEdit) {
    console.log(`Error!!! : ${errorEdit.message}`);
  }
  if (dataEdit) {
    console.log(dataEdit);
  }

  function handleSave() {
    editShipping({
      variables: {
        updateShippingId: editId,
        shippingCompany: compEdit,
        url: urlEdit,
        description: descEdit,
        api: apiEdit,
      },
    });
    setEditModal(false);
  }

  function handleEdit(event, ship, des, ur, ap) {
    const cool = event;
    setEditId(cool);
    setEditModal(true);
    setCompanyEdit(ship);
    setDescEdit(des);
    setUrlEdit(ur);
    setApiEdit(ap);
  }

  // DELETE
  const DELETE_SHIPPING = gql`
    mutation DeleteShipping($deleteShippingId: ID!) {
      deleteShipping(id: $deleteShippingId) {
        api
        description
        id
        shipping_company
        url
      }
    }
  `;

  const [deleteShipping, res] = useMutation(DELETE_SHIPPING, {
    onCompleted: () => {
      toast(`${res.data.deleteShipping.shipping_company} is removed from database.!`);
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });

  function handleDelete(event, event2) {
    setDeleteModalView(true);
    setDeleteId(event);
    setTitleDelete(event2);
  }

  const deleteSellerConfirmed = async () => {
    setDeleteModalView(true);
    await deleteShipping({
      variables: {
        deleteShippingId: deleteId,
      },
    });
    setDeleteModalView(false);
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Dashboard</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
          </Col>
          {/* Title End */}

          {/* Top Buttons Start */}
          {/* <Col xs="12" sm="auto" className="d-flex align-items-end justify-content-end mb-2 mb-sm-0 order-sm-3">
            <Button variant="outline-primary" className="btn-icon btn-icon-only ms-1">
              <CsLineIcons icon="save" />
            </Button>
            <div className="btn-group ms-1 w-100 w-sm-auto">
              <Button variant="outline-primary" className="btn-icon btn-icon-start w-100 w-sm-auto">
                <CsLineIcons icon="send" /> <span>Publish</span>
              </Button>
              <Dropdown>
                <Dropdown.Toggle className="dropdown-toggle dropdown-toggle-split" variant="outline-primary" />
                <Dropdown.Menu>
                  <Dropdown.Item>Delete</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Col> */}
          {/* Top Buttons End */}
        </Row>
      </div>
      <h2 className="small-title">{title}</h2>
      {data &&
        data.getAllShipping.map((getAllShipping) => (
          <Card key={getAllShipping.id} className="mb-5">
            <Card.Body className="mb-3">
              <Row>
                <div className="mb-3 col-lg-11 col-10">
                  <div className="text-md  ">Company</div>
                  <div>{getAllShipping.shipping_company}</div>
                </div>
                <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-top">Edit</Tooltip>}>
                  <Button
                    variant="outline-primary"
                    className="col-1 mb-2 btn-icon btn-icon-only"
                    onClick={() =>
                      handleEdit(getAllShipping.id, getAllShipping.shipping_company, getAllShipping.description, getAllShipping.url, getAllShipping.api)
                    }
                  >
                    <CsLineIcons icon="edit-square" />
                  </Button>
                </OverlayTrigger>
              </Row>
              <Row>
                <div className="mb-3 col-lg-11 col-10">
                  <div className="text-md  ">Description</div>
                  <div>{getAllShipping.description}</div>
                </div>
                <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-top">Delete</Tooltip>}>
                  <Button
                    variant="outline-primary"
                    className="mt-2 col-1 btn-icon btn-icon-only"
                    onClick={() => handleDelete(getAllShipping.id, getAllShipping.shipping_company)}
                  >
                    <CsLineIcons icon="bin" />
                  </Button>
                </OverlayTrigger>
              </Row>
              <div className="mb-3">
                <div className="text-md  ">URL</div>
                <div>{getAllShipping.url}</div>
              </div>
              <div className="mb-3">
                <div className="text-md  ">API</div>
                <div>{getAllShipping.api}</div>
              </div>
            </Card.Body>
          </Card>
        ))}

      {/* Shipping Edit Modal Starts */}
      <Modal className="modal-right scroll-out-negative" show={editModal} onHide={() => setEditModal(false)} scrollable dialogClassName="full">
        <Modal.Header closeButton>
          <Modal.Title as="h4">Edit Shipping Address</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OverlayScrollbarsComponent options={{ overflowBehavior: { x: 'hidden', y: 'scroll' } }} className="scroll-track-visible">
            <Form>
              <div className="mb-3">
                <Form.Label>Company</Form.Label>
                <Form.Control type="text" value={compEdit} onChange={(e) => setCompanyEdit(e.target.value)} />
              </div>
              <div className="mb-3">
                <Form.Label>Url</Form.Label>
                <Form.Control type="text" value={urlEdit} onChange={(e) => setUrlEdit(e.target.value)} />
              </div>
              <div className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control type="text" value={descEdit} onChange={(e) => setDescEdit(e.target.value)} />
              </div>
              <div className="mb-3">
                <Form.Label>API</Form.Label>
                <Form.Control type="text" value={apiEdit} onChange={(e) => setApiEdit(e.target.value)} />
              </div>
            </Form>
          </OverlayScrollbarsComponent>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-primary" className="btn-icon btn-icon-only " onClick={() => setEditModal(false)} >
            <CsLineIcons icon="bin" />
          </Button>
          <Button variant="primary" className="btn-icon btn-icon-start" type="button" onClick={() => handleSave()}>
            <CsLineIcons icon="save" />
            <span> Save</span>
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Shipping Edit Modal Ends */}

      {/* Delete Email Modal Starts */}
      <Modal show={deleteModalView} onHide={() => setDeleteModalView(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Email</Modal.Title>
        </Modal.Header>
        {deleteTitle && (
          <Modal.Body>
            <b>{deleteTitle}</b> will be deleted.
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModalView(false)}>
            No, Go Back!
          </Button>
          <Button variant="primary" onClick={() => deleteSellerConfirmed()}>
            Yes, Continue!
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Delete Email Modal Ends */}
    </>
  );
}

export default ListShipping;
