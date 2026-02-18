import { React, useEffect, useState } from 'react';
import { useParams, NavLink, withRouter } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { Button, Modal, Form, Row, Col, Card, Tooltip, OverlayTrigger } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { toast } from 'react-toastify';

const GET_B2B = gql`
  query GetB2b($getB2BId: ID!) {
    getB2b(id: $getB2BId) {
      id
      companyName
      gstin
      address
      companyDescription
      mobileNo
      email
      status
    }
  }
`;

const EDIT_B2B = gql`
  mutation UpdateB2b(
    $updateB2BId: ID!
    $companyName: String
    $gstin: String
    $address: String
    $companyDescription: String
    $mobileNo: String
    $email: String
    $status: String
  ) {
    updateB2b(
      id: $updateB2BId
      companyName: $companyName
      gstin: $gstin
      address: $address
      companyDescription: $companyDescription
      mobileNo: $mobileNo
      email: $email
      status: $status
    ) {
      id
      companyName
      gstin
      address
      companyDescription
      mobileNo
      email
      status
    }
  }
`;

function DetailB2B({ history }) {
  const title = 'B2B Detail';
  const description = 'Ecommerce B2B Detail Page';
  const { id } = useParams();
  const [editModal, setEditModal] = useState(false);

  const [registrationStatus, setRegistrationStatus] = useState('Pending');

  const [company, setCompany] = useState('');
  const [desc, setDesc] = useState('');
  const [Email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gst, setGST] = useState('');

  const [deleteModalView, setDeleteModalView] = useState(false);

  const [getB2b, { data, refetch }] = useLazyQuery(GET_B2B);

  useEffect(() => {
    getB2b({
      variables: {
        getB2BId: id,
      },
    });
    // Execute the getUsers function when the component mounts
  }, [id]);

  // Update B2B Details

  const [updateB2b, { loading: loadEdit, data: dataEdit }] = useMutation(EDIT_B2B, {
    onCompleted: () => {
      setEditModal(false);
      refetch();
      toast(`${dataEdit.updateB2b.companyName} is updated successfully!`);
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!'); 
    },
  }); 

  const handleSave = async () => {
    await updateB2b({
      variables: {
        updateB2BId: id,
        address,
        companyName: company,
        gstin: gst,
        companyDescription: desc,
        mobileNo: phone,
        email: Email,
        status: registrationStatus,
      },
    });
  };

  function handleEdit(eventCompanyName, eventDescription, eventMobile, eventGst, eventAddress, eventEmail, eventStatus) {
    // company_name, desc, mobileNo, email, gst, adress
    setEditModal(true);
    setCompany(eventCompanyName);
    setDesc(eventDescription);
    setPhone(eventMobile);
    setGST(eventGst);
    setAddress(eventAddress);
    setEmail(eventEmail);
    setRegistrationStatus(eventStatus);
  }

  const DELETE_B2B = gql`
    mutation DeleteB2b($deleteB2BId: ID!) {
      deleteB2b(id: $deleteB2BId) {
        companyName
        email
        address
        companyDescription
        gstin
        id
        mobileNo
        status
      }
    }
  `;

  const [deleteB2b, res] = useMutation(DELETE_B2B, {
    onCompleted: () => {
      setDeleteModalView(false);
      toast(`${res.data.deleteB2b.companyName} is removed from database.!`);
      setTimeout(() => {
        history.push('/admin/b2b/list');
      }, 2000);
    },
    onError: (err) => {
      // toast.error(err.message || "Something went wrong!"); 
    },
  });

  const handleDelete = async () => {
    setDeleteModalView(true);
  };
  const deleteSellerConfirmed = async () => {
    if (id) {
      await deleteB2b({
        variables: {
          deleteB2BId: id,
        },
      });
    } else {
      toast.error('something went wrong in deleteCategory!');
    }
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      {data && (
        <>
          <div className="page-title-container">
            <Row className="g-0">
              {/* Title Start */}
              <Col className="col-auto mb-3 mb-sm-0 me-auto">
                <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/b2b/list">
                  <CsLineIcons icon="chevron-left" size="13" />
                  <span className="align-middle text-small ms-1">B2B </span>
                </NavLink>
                <h1 className="mb-0 pb-0 display-4" id="title">
                  {title}
                </h1>
              </Col>
              {/* Title End */}
            </Row>
          </div>

          {/* Seller Details Block Start */}
          <Row>
            <Col xl="4">
              <h2 className="small-title">{title}</h2>
              <Card className="mb-5">
                <Card.Body className="mb-n5">
                  <div className="d-flex align-items-center flex-column mb-5">
                    <div className="mb-5 d-flex align-items-center flex-column">
                      <div className="sw-6 sh-6 mb-3 d-inline-block bg-primary d-flex justify-content-center align-items-center rounded-xl">
                        <div className="text-white">
                          <CsLineIcons icon="user" />
                        </div>
                      </div>
                      <div className="h5 mb-1">{data.getB2b.companyName}</div>
                      <div className="text-muted">
                        <CsLineIcons icon="pin" className="me-1" />
                        <span className="align-middle">{data.getB2b.address}</span>
                      </div>
                    </div>
                    <div className="d-flex flex-row justify-content-between w-100 w-sm-50 w-xl-100">
                      <Button
                        variant="outline-primary"
                        className="w-100 me-2"
                        onClick={() => {
                          handleEdit(
                            data.getB2b.companyName,
                            data.getB2b.companyDescription,
                            data.getB2b.mobileNo,
                            data.getB2b.gstin,
                            data.getB2b.address,
                            data.getB2b.email,
                            data.getB2b.status
                          );
                        }}
                      >
                        Edit B2B
                      </Button>
                      <Button variant="outline-primary" className="w-100" onClick={() => handleDelete()}>
                        Delete B2B
                      </Button>
                    </div>
                  </div>
                  <div className="mb-5">
                    <p className="text-md text-muted mb-2">BUSINESS INFORMATION</p>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <OverlayTrigger placement="left" overlay={<Tooltip id="tooltip-left">Business Name</Tooltip>}>
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="suitcase" size="17" className="text-primary" />
                          </div>
                        </OverlayTrigger>
                      </Col>
                      <Col>
                        <Col className="text-alternate">
                          {data.getB2b.companyName}
                          <p className="text-small text-muted mb-2">BUSINESS NAME</p>
                        </Col>
                      </Col>
                    </Row>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <OverlayTrigger placement="left" overlay={<Tooltip id="tooltip-left">Business Description</Tooltip>}>
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="content" size="17" className="text-primary" />
                          </div>
                        </OverlayTrigger>
                      </Col>
                      <Col>
                        <Col className="text-alternate">
                          {data.getB2b.companyDescription}
                          <p className="text-small text-muted mb-2">BUSINESS DESCRIPTION</p>
                        </Col>
                      </Col>
                    </Row>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <OverlayTrigger placement="left" overlay={<Tooltip id="tooltip-left">EMAIL</Tooltip>}>
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="email" size="17" className="text-primary" />
                          </div>
                        </OverlayTrigger>
                      </Col>
                      <Col>
                        <Col className="text-alternate">
                          {data.getB2b.email}
                          <p className="text-small text-muted mb-2">EMAIL</p>
                        </Col>
                      </Col>
                    </Row>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <OverlayTrigger placement="left" overlay={<Tooltip id="tooltip-left">Phone No.</Tooltip>}>
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="phone" size="17" className="text-primary" />
                          </div>
                        </OverlayTrigger>
                      </Col>
                      <Col>
                        <Col className="text-alternate">
                          {data.getB2b.mobileNo}
                          <p className="text-small text-muted mb-2">MOBILE NUMBER</p>
                        </Col>
                      </Col>
                    </Row>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <OverlayTrigger placement="left" overlay={<Tooltip id="tooltip-left">GSTin</Tooltip>}>
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="bookmark" size="17" className="text-primary" />
                          </div>
                        </OverlayTrigger>
                      </Col>
                      <Col>
                        <Col className="text-alternate">
                          {data.getB2b.gstin}
                          <p className="text-small text-muted mb-2">GSTIN</p>
                        </Col>
                      </Col>
                    </Row>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <OverlayTrigger placement="left" overlay={<Tooltip id="tooltip-left">Business Address</Tooltip>}>
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="pin" size="17" className="text-primary" />
                          </div>
                        </OverlayTrigger>
                      </Col>
                      <Col>
                        <Col className="text-alternate">
                          {data.getB2b.address}
                          <p className="text-small text-muted mb-2">BUSINESS ADDRESS</p>
                        </Col>
                      </Col>
                    </Row>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <OverlayTrigger placement="left" overlay={<Tooltip id="tooltip-left">Application Status</Tooltip>}>
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="more-horizontal" size="17" className="text-primary" />
                          </div>
                        </OverlayTrigger>
                      </Col>
                      <Col>
                        <Col className="text-alternate">
                          {data.getB2b.status}
                          <p className="text-small text-muted mb-2">APPLICATION STATUS</p>
                        </Col>
                      </Col>
                    </Row>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {/* Seller Details Block End */}

          {/* Seller Edit Modal Start */}
          <Modal className="modal-right scroll-out-negative" show={editModal} onHide={() => setEditModal(false)} scrollable dialogClassName="full">
            <Modal.Header closeButton>
              <Modal.Title as="h4">Business Information</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <OverlayScrollbarsComponent options={{ overflowBehavior: { x: 'hidden', y: 'scroll' } }} className="scroll-track-visible">
                <Form>
                  <div className="mb-3">
                    <Form.Label className="fw-bold ">Registration Status: {registrationStatus} </Form.Label>
                    <Form.Select id="EnquirySelect" onChange={(event) => setRegistrationStatus(event.target.value)} aria-label="Default select example">
                      <option>Select Registration Status: {registrationStatus} </option>
                      <option value="Approved">Approve</option>
                      <option value="Rejected">Reject</option>
                      <option value="Pending">Pending</option>
                    </Form.Select>
                  </div>
                  <div className="mb-3">
                    <Form.Label>Business Name</Form.Label>
                    <Form.Control type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <Form.Label>Business Description</Form.Label>
                    <Form.Control type="text" value={desc} onChange={(e) => setDesc(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <Form.Label>Mobile no.</Form.Label>
                    <Form.Control type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" value={Email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <Form.Label>GST No.</Form.Label>
                    <Form.Control type="text" value={gst} onChange={(e) => setGST(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <Form.Label>Business Address</Form.Label>
                    <Form.Control type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                </Form>
              </OverlayScrollbarsComponent>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button variant="outline-primary" className="btn-icon btn-icon-only" onClick={() => setEditModal(false)}>
                <CsLineIcons icon="bin" />
              </Button>
              <Button variant="primary" className="btn-icon btn-icon-start" type="button" onClick={() => handleSave()}>
                <CsLineIcons icon="save" /> <span>Save</span>
              </Button>
            </Modal.Footer>
          </Modal>
          {/* Seller Edit Modal End */}

          {/* delete category modal starts */}
          <Modal show={deleteModalView} onHide={() => setDeleteModalView(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Delete Seller</Modal.Title>
            </Modal.Header>
            {data.getB2b.companyName && <Modal.Body>Are you sure you want to delete {data.getB2b.companyName}?</Modal.Body>}
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setDeleteModalView(false)}>
                No, Back!
              </Button>
              <Button variant="primary" onClick={() => deleteSellerConfirmed()}>
                Yes, Continue!
              </Button>
            </Modal.Footer>
          </Modal>
          {/* delete category modal ends */}
        </>
      )}
    </>
  );
}
export default withRouter(DetailB2B);
