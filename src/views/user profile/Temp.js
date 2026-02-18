import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import { gql, useMutation, useQuery } from '@apollo/client';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import HtmlHead from 'components/html-head/HtmlHead';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { Row, Col, Button,  Card, Badge, Form, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

function Temp() {
  const title = 'User Profile';
  const description = 'Ecommerce User Profile Page';

  const [editModal, setEditModal] = useState(false);
  const [id, setId] = useState('');
  const [fName, setfName] = useState('');
  const [lName, setlName] = useState('');
  const [mail, setMail] = useState('');
  const [phone, setPhone] = useState('');

  // Modal for adding Address Section
  const [addressModal, setAddressModal] = useState(false);

  // Modal for editing Address
  const [editAddressModal, setEditAddressModal] = useState(false);
  const [addressID, setAddressID] = useState('');
  const [address1Edit, setAddress1Edit] = useState('');
  const [address2Edit, setAddress2Edit] = useState('');
  const [cityEdit, setCityEdit] = useState('');
  const [stateEdit, setStateEdit] = useState('');
  const [countryEdit, setCountryEdit] = useState('');
  const [postalEdit, setPostalEdit] = useState('');

  // Delete Addres
  const [deleteModalView, setDeleteModalView] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  // const [deleteTitle, setTitleDelete] = useState('');

  const GET_USER_DETAIL = gql`
    query GetProfile {
      getProfile {
        id
        firstName
        lastName
        email
        mobileNo
        password
        role
        addresses {
          id
          addressLine1
          addressLine2
          city
          state
          postalCode
          country
        }
      }
    }
  `;

  const { loading, error, data, refetch } = useQuery(GET_USER_DETAIL);

  const EDIT_USER_PROFILE = gql`
    mutation UpdateUser($updateUserId: ID!, $firstName: String, $lastName: String, $mobileNo: String, $email: String, $password: String) {
      updateUser(id: $updateUserId, firstName: $firstName, lastName: $lastName, mobileNo: $mobileNo, email: $email, password: $password) {
        addresses {
          id
          addressLine1
          addressLine2
          city
          state
          postalCode
          country
        }
        email
        firstName
        id
        lastName
        mobileNo
        password
      }
    }
  `;

  const [editUser, { loading: loadEdit, error: errorEdit, data: dataEdit }] = useMutation(EDIT_USER_PROFILE, {
    onCompleted: () => {
      toast(`${dataEdit.updateUser.firstName}'s detail is Updated!`);
      refetch();
    },
    onError: () => {
      toast.error(errorEdit.message || 'Something went wrong!');
    },
  });

  // Edit function
  function handleEditValues(ID, firstname, lastname, mobileno, mails) {
    setEditModal(true);
    setId(ID);
    setfName(firstname);
    setlName(lastname);
    setPhone(mobileno);
    setMail(mails);
  }

  // Updating function of userProfile

  function handleSave() {
    editUser({
      variables: {
        updateUserId: id,
        firstName: fName,
        lastName: lName,
        mobileNo: phone,
        email: mail,
      },
    });
    setEditModal(false);
  }

  // Address Section
  const CREATE_ADDRESS = gql`
    mutation CreateAddress($addressLine1: String!, $city: String!, $state: String!, $postalCode: String!, $country: String!) {
      createAddress(addressLine1: $addressLine1, city: $city, state: $state, postalCode: $postalCode, country: $country) {
        addressLine1
        city
        country
        postalCode
        state
      }
    }
  `;

  const [submitAddress, { loading: loadADD, error: errorADD, data: dataADD }] = useMutation(CREATE_ADDRESS, {
    onCompleted: () => {
      toast(`Address is added`);
      refetch();
    },
    onError: () => {
      toast.error(errorADD.message || 'Something went wrong!');
    },
  });

  const onSubmit = (values, { resetForm }) => {
    submitAddress({
      variables: {
        addressLine1: values.address,
        addressLine2: values.address2,
        city: values.city,
        state: values.state,
        postalCode: values.pincode,
        country: values.country,
      },
    });
    setTimeout(() => {
      resetForm({ values: '' });
    }, 10);
    setAddressModal(false);
  };

  const validationSchema = Yup.object().shape({
    address: Yup.string().required('Enter Address'),
    address2: Yup.string().required('Enter Landmark'),
    city: Yup.string().required('Enter your City name'),
    pincode: Yup.string().required('Enter Pincode'),
    state: Yup.string().required('Enter your state'),
    country: Yup.string().required('Country Name is required'),
  });
  const initialValues = { address: '', address2: '', city: '', pincode: '', state: '', country: '' };
  const formik = useFormik({ initialValues, validationSchema, onSubmit });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  const EDIT_ADDRESS = gql`
    mutation UpdateAddress(
      $updateAddressId: ID!
      $addressLine1: String!
      $city: String!
      $state: String!
      $postalCode: String!
      $country: String!
      $addressLine2: String
    ) {
      updateAddress(
        id: $updateAddressId
        addressLine1: $addressLine1
        city: $city
        state: $state
        postalCode: $postalCode
        country: $country
        addressLine2: $addressLine2
      ) {
        addressLine1
        addressLine2
        city
        country
        id
        postalCode
        state
      }
    }
  `;
  const [editAddress, { loading: loadEditAdd, error: errEditAdd, data: dataEditAdd }] = useMutation(EDIT_ADDRESS, {
    onCompleted: () => {
      toast(`Address is Edited`);
      refetch();
    },
    onError: () => {
      toast.error(errEditAdd.message || 'Something went wrong!');
    },
  });

  function handleEditAddress(ID, add1, add2, CT, postal, stateAdd, countryAdd) {
    setEditAddressModal(true);
    setAddressID(ID);
    setAddress1Edit(add1);
    setAddress2Edit(add2);
    setCityEdit(CT);
    setPostalEdit(postal);
    setStateEdit(stateAdd);
    setCountryEdit(countryAdd);
  }

  function handleSaveAddressEdit() {
    editAddress({
      variables: {
        updateAddressId: addressID,
        addressLine1: address1Edit,
        addressLine2: address2Edit,
        city: cityEdit,
        state: stateEdit,
        postalCode: postalEdit,
        country: countryEdit,
      },
    });
    setEditAddressModal(false);
  }

  // Delete Address

  const DELETE_ADDRESS = gql`
    mutation DeleteAddress($deleteAddressId: ID!) {
      deleteAddress(id: $deleteAddressId) {
        id
        addressLine1
        addressLine2
        city
        state
        postalCode
        country
      }
    }
  `;

  const [deleteAddress, { loading: loadDel, error: errorDel, data: dataDel }] = useMutation(DELETE_ADDRESS, {
    onCompleted: () => {
      toast(`Address is Deleted`);
      refetch();
    },
    onError: () => {
      toast.error(errorDel.message || 'Something went wrong!');
    },
  });

  const handleDeleteAddress = async (ID) => {
    setDeleteId(ID);
    setDeleteModalView(true);
  };
  const deleteAddressConfirmed = async () => {
    await deleteAddress({
      variables: {
        deleteAddressId: deleteId,
      },
    });
    setDeleteModalView(false);
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <h2>Dashboard</h2>
      {data && data.getProfile && (
        <Row>
          <Col xl="4">
            <h2 className="small-title">Your Info</h2>
            <Card className="mb-5">
              <Card.Body className="mb-n5">
                <div className="d-flex align-items-center flex-column mb-5">
                  <div className="mb-5 d-flex align-items-center flex-column">
                    <div className="sw-6 sh-6 mb-3 d-inline-block bg-primary d-flex justify-content-center align-items-center rounded-xl">
                      <div className="text-white">
                        <CsLineIcons icon="user" />
                      </div>
                    </div>
                    <div className="h5 mb-1">
                      {data.getProfile.firstName} {data.getProfile.lastName}
                    </div>
                    {data.getProfile.addresses.length > 0 && (
                      <div className="text-muted">
                        <CsLineIcons icon="pin" className="me-1" />
                        <span className="align-middle">
                          {data.getProfile.addresses[0].city}, {data.getProfile.addresses[0].country}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="d-flex flex-row justify-content-between w-100 w-sm-50 w-xl-100">
                    <Button
                      variant="primary"
                      className="w-100 me-2"
                      onClick={() => {
                        handleEditValues(
                          data.getProfile.id,
                          data.getProfile.firstName,
                          data.getProfile.lastName,
                          data.getProfile.mobileNo,
                          data.getProfile.email
                        );
                      }}
                    >
                      Edit
                    </Button>
                    <Button onClick={() => setAddressModal(true)}>Add Address</Button>
                  </div>
                </div>
                <div className="mb-5">
                  <p className="text-small text-muted mb-2">ADDRESS</p>
                  <Row className="g-0 mb-2">
                    <Col xs="auto">
                      <div className="sw-3 me-1">
                        <CsLineIcons icon="user" size="17" className="text-primary" />
                      </div>
                    </Col>
                    <Col className="text-alternate">
                      {data.getProfile.firstName} {data.getProfile.lastName}
                    </Col>
                  </Row>
                  {data.getProfile.addresses.length > 0 && (
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="pin" size="17" className="text-primary" />
                        </div>
                      </Col>
                      <Col className="text-alternate">
                        {data.getProfile.addresses[0].addressLine1}
                        {data.getProfile.addresses[0].addressLine2},{data.getProfile.addresses[0].city},{data.getProfile.addresses[0].country}
                      </Col>
                    </Row>
                  )}
                  <Row className="g-0 mb-2">
                    <Col xs="auto">
                      <div className="sw-3 me-1">
                        <CsLineIcons icon="phone" size="17" className="text-primary" />
                      </div>
                    </Col>
                    <Col className="text-alternate">{data.getProfile.mobileNo}</Col>
                  </Row>
                  <Row className="g-0 mb-2">
                    <Col xs="auto">
                      <div className="sw-3 me-1">
                        <CsLineIcons icon="email" size="17" className="text-primary" />
                      </div>
                    </Col>
                    <Col className="text-alternate">{data.getProfile.email}</Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {addressModal && (
            <Col xl="8" lg="8" md="6" sm="6" xs="12">
              <h2 className="small-title">Add ADDRESS </h2>
              <Card className="mb-5">
                <Card.Body>
                  <form id="sellerForm" className="tooltip-end-bottom" onSubmit={handleSubmit}>
                    <div className="mb-3 filled form-group tooltip-end-top">
                      <CsLineIcons icon="home" />
                      <Form.Control
                        type="text"
                        autoComplete="street-address"
                        name="address"
                        onChange={handleChange}
                        placeholder="Enter House No, Colony name..."
                        value={values.address}
                      />
                      {errors.address && touched.address && <div className="d-block invalid-tooltip">{errors.address}</div>}
                    </div>
                    <div className="mb-3 filled form-group tooltip-end-top">
                      <CsLineIcons icon="home" />
                      <Form.Control type="text" name="address2" onChange={handleChange} placeholder="Enter Street No, Area, Landmark" value={values.address2} />
                      {errors.address2 && touched.address2 && <div className="d-block invalid-tooltip">{errors.address2}</div>}
                    </div>
                    <div className="mb-3 filled form-group tooltip-end-top">
                      <CsLineIcons icon="building-large" />
                      <Form.Control type="text" name="city" onChange={handleChange} placeholder="Enter City" value={values.city} />
                      {errors.city && touched.city && <div className="d-block invalid-tooltip">{errors.city}</div>}
                    </div>
                    <div className="mb-3 filled form-group tooltip-end-top">
                      <CsLineIcons icon="bookmark" />
                      <Form.Control type="text" name="pincode" onChange={handleChange} placeholder="Enter Pincode" value={values.pincode} />
                      {errors.pincode && touched.pincode && <div className="d-block invalid-tooltip">{errors.pincode}</div>}
                    </div>
                    <div className="mb-3 filled form-group tooltip-end-top">
                      <CsLineIcons icon="plane" />
                      <Form.Control type="text" name="state" onChange={handleChange} placeholder="Enter State" value={values.state} />
                      {errors.state && touched.state && <div className="d-block invalid-tooltip">{errors.state}</div>}
                    </div>
                    <div className="mb-3 filled form-group tooltip-end-top">
                      <CsLineIcons icon="web" />
                      <Form.Control type="text" name="country" onChange={handleChange} placeholder="Enter Country" value={values.country} />
                      {errors.country && touched.country && <div className="d-block invalid-tooltip">{errors.country}</div>}
                    </div>
                    <div className="text-center">
                      <Button onClick={() => setAddressModal(false)} variant="outline-primary" className="btn-icon btn-icon-only me-2">
                        <CsLineIcons icon="bin" />
                      </Button>
                      <Button variant="primary" className="btn-icon btn-icon-start" type="submit">
                        Submit Address
                      </Button>
                    </div>
                  </form>
                </Card.Body>
              </Card>
            </Col>
          )}

          <Col xl="5" lg="5" md="6" sm="6" xs="12">
            {data.getProfile.addresses.length > 0 ? <h2 className="small-title">ALL ADDRESS </h2> : <h4 className='border p-2'>No Address Listed, Add Address !!!</h4>}
            {data.getProfile.addresses.map((address, index) => (
              <Card key={address.id} className="mb-5">
                <Card.Body className="mb-3">
                  <Row>
                    <Col lg="10">
                      <div className="mb-3">
                        <div className="text-md text-muted mb-2">Address {index + 1}</div>
                        <div>
                          {address.addressLine1}, {address.addressLine2}{' '}
                        </div>
                        <div>
                          {address.city}, {address.postalCode}{' '}
                        </div>
                        <div>
                          {address.state}, {address.country}
                        </div>
                      </div>
                    </Col>
                    <Col lg="2">
                      <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-top">Edit</Tooltip>}>
                        <Button
                          onClick={() =>
                            handleEditAddress(
                              address.id,
                              address.addressLine1,
                              address.addressLine2,
                              address.city,
                              address.postalCode,
                              address.state,
                              address.country
                            )
                          }
                          variant="outline-primary"
                          className="col-1 mb-2 me-2 btn-icon btn-icon-only"
                        >
                          <CsLineIcons icon="edit-square" />
                        </Button>
                      </OverlayTrigger>

                      <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-top">Remove</Tooltip>}>
                        <Button onClick={() => handleDeleteAddress(address.id)} variant="outline-primary" className="col-1 mb-2 me-2 btn-icon btn-icon-only">
                          <CsLineIcons icon="bin" />
                        </Button>
                      </OverlayTrigger>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </Col>
        </Row>
      )}

      <h2 className="mb-4">Order List</h2>
      <Row className="g-0 h-100 align-content-center d-none d-lg-flex ps-5 pe-5 mb-2 custom-sort">
        <Col md="2" className="d-flex flex-column mb-lg-0 pe-3 d-flex">
          <div className="text-muted text-small cursor-pointer sort">ID</div>
        </Col>
        <Col md="3" className="d-flex flex-column pe-1 justify-content-center">
          <div className="text-muted text-small cursor-pointer sort">NAME</div>
        </Col>
        <Col md="2" className="d-flex flex-column pe-1 justify-content-center">
          <div className="text-muted text-small cursor-pointer sort">PURCHASE</div>
        </Col>
        <Col md="2" className="d-flex flex-column pe-1 justify-content-center">
          <div className="text-muted text-small cursor-pointer sort">DATE</div>
        </Col>
        <Col md="2" className="d-flex flex-column pe-1 justify-content-center">
          <div className="text-muted text-small cursor-pointer sort">STATUS</div>
        </Col>
      </Row>

      <Row>
        <Card>
          {/* className={`mb-2 ${selectedItems.includes(1) && 'selected'}`}> */}
          <Card.Body className="pt-0 pb-0 sh-21 sh-md-8">
            <Row className="g-0 h-100 align-content-center cursor-default">
              {/* onClick={() => checkItem(1)} */}
              <Col xs="11" md="2" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-1 order-md-1 h-md-100 position-relative">
                <div className="text-muted text-small d-md-none">Id</div>
                <NavLink to="/order/detail" className="text-truncate h-100 d-flex align-items-center">
                  1239
                </NavLink>
              </Col>
              <Col xs="6" md="3" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-3 order-md-2">
                <div className="text-muted text-small d-md-none">Name</div>
                <div className="text-alternate">Joisse Kaycee</div>
              </Col>
              <Col xs="6" md="2" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-4 order-md-3">
                <div className="text-muted text-small d-md-none">Purchase</div>
                <div className="text-alternate">
                  <span>
                    <span className="text-small">$</span>
                    321.75
                  </span>
                </div>
              </Col>
              <Col xs="6" md="2" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-5 order-md-4">
                <div className="text-muted text-small d-md-none">Date</div>
                <div className="text-alternate">13.09.2021</div>
              </Col>
              <Col xs="6" md="2" className="d-flex flex-column justify-content-center mb-2 mb-md-0 order-last order-md-5">
                <div className="text-muted text-small d-md-none">Status</div>
                <div>
                  <Badge bg="outline-primary">CONFIRMED</Badge>
                </div>
              </Col>
              <Col xs="1" md="1" className="d-flex flex-column justify-content-center align-items-md-end mb-2 mb-md-0 order-2 text-end order-md-last">
                <Form.Check className="form-check mt-2 ps-5 ps-md-2" type="checkbox" />
                {/* checked={selectedItems.includes(1)} onChange={() => { }}  */}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Row>

      {/* Edit User Detail Modal Start */}
      {data && data.getProfile && (
        <Modal className="modal-right scroll-out-negative" show={editModal} onHide={() => setEditModal(false)} scrollable dialogClassName="full">
          <Modal.Header closeButton>
            <Modal.Title as="h5">User Detail</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <OverlayScrollbarsComponent options={{ overflowBehavior: { x: 'hidden', y: 'scroll' } }} className="scroll-track-visible">
              <Form>
                <div className="mb-3">
                  <Form.Label htmlFor="userEditFirstName">First Name</Form.Label>

                  <Form.Control id="userEditFirstName" type="text" value={fName} onChange={(e) => setfName(e.target.value)} />
                </div>
                <div className="mb-3">
                  <Form.Label htmlFor="userEditLastName">Last Name</Form.Label>

                  <Form.Control id="userEditLastName" type="text" value={lName} onChange={(e) => setlName(e.target.value)} />
                </div>
                <div className="mb-3">
                  <Form.Label htmlFor="userEditMail">Email</Form.Label>

                  <Form.Control id="userEditMail" type="text" value={mail} onChange={(e) => setMail(e.target.value)} />
                </div>
                <div className="mb-3">
                  <Form.Label htmlFor="userEditPhone">Mobile no.</Form.Label>

                  <Form.Control id="userEditPhone" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
      )}
      {/* Edit User Detail Modal End */}

      {/* Edit Address Modal Start */}
      <Modal className="modal-right scroll-out-negative" show={editAddressModal} onHide={() => setEditAddressModal(false)} scrollable dialogClassName="full">
        <Modal.Header closeButton>
          <Modal.Title as="h5">Edit your Address</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OverlayScrollbarsComponent options={{ overflowBehavior: { x: 'hidden', y: 'scroll' } }} className="scroll-track-visible">
            <Form>
              <div className="mb-3">
                <Form.Label htmlFor="userEditFirstName">Address Lane 1</Form.Label>
                <Form.Control id="userEditFirstName" type="text" value={address1Edit} onChange={(e) => setAddress1Edit(e.target.value)} />
              </div>
              <div className="mb-3">
                <Form.Label htmlFor="userEditLastName">Address Lane 2</Form.Label>
                <Form.Control id="userEditLastName" type="text" value={address2Edit} onChange={(e) => setAddress2Edit(e.target.value)} />
              </div>
              <div className="mb-3">
                <Form.Label htmlFor="userEditMail">City</Form.Label>
                <Form.Control id="userEditMail" type="text" value={cityEdit} onChange={(e) => setCityEdit(e.target.value)} />
              </div>
              <div className="mb-3">
                <Form.Label htmlFor="userEditPhone">Pincode</Form.Label>
                <Form.Control id="userEditPhone" type="text" value={postalEdit} onChange={(e) => setPostalEdit(e.target.value)} />
              </div>
              <div className="mb-3">
                <Form.Label htmlFor="userEditPhone">State</Form.Label>
                <Form.Control id="userEditPhone" type="text" value={stateEdit} onChange={(e) => setStateEdit(e.target.value)} />
              </div>
              <div className="mb-3">
                <Form.Label htmlFor="userEditPhone">Country</Form.Label>
                <Form.Control id="userEditPhone" type="text" value={countryEdit} onChange={(e) => setCountryEdit(e.target.value)} />
              </div>
            </Form>
          </OverlayScrollbarsComponent>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-primary" className="btn-icon btn-icon-only" onClick={() => setEditAddressModal(false)}>
            <CsLineIcons icon="bin" />
          </Button>
          <Button variant="primary" className="btn-icon btn-icon-start" type="button" onClick={() => handleSaveAddressEdit()}>
            <CsLineIcons icon="save" /> <span>Save</span>
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Edit Address Modal End */}

      {/* Delete Address Modal Starts */}
      <Modal show={deleteModalView} onHide={() => setDeleteModalView(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Seller</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete Address?</Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModalView(false)}>
            No
          </Button>
          <Button variant="primary" onClick={() => deleteAddressConfirmed()}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Delete Address Modal Ends */}
    </>
  );
}

export default Temp;
