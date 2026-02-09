import React, { useState, useEffect } from 'react';
import { useParams, useHistory, NavLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import HtmlHead from 'components/html-head/HtmlHead';
import { Row, Col, Button, Badge, Card, Form, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import moment from 'moment';

const GET_USER = gql`
  query GetUser($getUserId: ID!) {
    getUser(id: $getUserId) {
      id
      firstName
      lastName
      email
      mobileNo
      password
      role
      profilepic
      seller {
        id
      }
      addresses {
        id
        firstName
        lastName
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
const GET_USER_ORDER = gql`
  query GetUserAllOrder($userId: ID) {
    getUserAllOrder(userId: $userId) {
      id
      status
      totalAmount
      createdAt
    }
  }
`;
const GET_SELLER = gql`
  query GetSeller($getSellerId: ID!) {
    getSeller(id: $getSellerId) {
      id
      superSellerId {
        id
        companyName
      }
      companyName
      gstin
      fullAddress
      city
      state
      pincode
      companyDescription
      mobileNo
      email
    }
  }
`;
const EDIT_USER = gql`
  mutation UpdateUser($updateUserId: ID!, $firstName: String, $lastName: String, $mobileNo: String, $email: String) {
    updateUser(id: $updateUserId, firstName: $firstName, lastName: $lastName, mobileNo: $mobileNo, email: $email) {
      firstName
      lastName
    }
  }
`;
const DELETE_USER = gql`
  mutation Mutation($deleteUserId: ID!) {
    deleteUser(id: $deleteUserId) {
      firstName
      lastName
      mobileNo
      email
      password
    }
  }
`;
const REMOVE_ROLE_FROM_USER = gql`
  mutation RemoveRole($role: String, $userId: ID) {
    removeRole(role: $role, userId: $userId) {
      role
    }
  }
`;
const ADD_ROLE_TO_USER = gql`
  mutation AddRoleTouser($role: String, $userId: ID) {
    addRoleTouser(role: $role, userId: $userId) {
      role
    }
  }
`;

function DetailViewUser() {
  // Used for page title and SEO description
  const title = 'User Detail';
  const description = 'Ecommerce User Detail Page';

  // Used to dispatch global UI or state actions
  const dispatch = useDispatch();

  // Enable sidebar when this page is loaded
  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  // Get user ID from URL params
  const { id } = useParams();

  // Get user ID from URL params
  const history = useHistory();

  // User basic information
  const [fName, setfName] = useState('');
  const [lName, setlName] = useState('');
  const [mail, setMail] = useState('');
  const [phone, setPhone] = useState('');

  // Modal state handling
  const [editModal, setEditModal] = useState(false);
  const [deleteModalView, setDeleteModalView] = useState(false);

  // ----------------------------------------------------------------------------
  // GraphQL: Lazy Query for fetching user details
  // ----------------------------------------------------------------------------
  const [getUser, { loading, error, data, refetch }] = useLazyQuery(GET_USER, {
    variables: {
      getUserId: id,
    },
  });

  // ----------------------------------------------------------------------------
  // Allowed roles configuration
  // ----------------------------------------------------------------------------
  // List of roles that are allowed access
  const allowedRoles = ['enquiry', 'seller', 'superSeller', 'service', 'subBusiness'];
  const role = allowedRoles.some((r) => data?.getUser?.role?.includes(r));

  const [getSeller, { data: sellerData }] = useLazyQuery(GET_SELLER, {
    variables: {
      getSellerId: data?.getUser?.seller?.id,
    },
    onError: (err) => {
      console.log('GET_SELLER Error:', err);
    },
  });
  const seller = Array.isArray(sellerData?.getSeller) ? sellerData.getSeller.filter((item) => item !== null)[0] : sellerData?.getSeller;

  if (error) {
    console.log('GraphQL Error:', error);
  }

  if (error) {
    console.log(`Error!!! : ${error.message}`);
  }

  const upgradeSeller = (event) => {
    history.push(`/admin/seller/add/${event}`);
  };

  const [GetUserAllOrder, { data: orderData }] = useLazyQuery(GET_USER_ORDER, {
    variables: {
      userId: id,
    },
    onError: (err) => {
      console.log('GET_USER_ORDER', err);
    },
  });

  useEffect(() => {
    getUser();
    getSeller();
    GetUserAllOrder();
  }, [id]);

  const [editUser, { loading: loadingEdit, error: errorEdit, data: dataEdit }] = useMutation(EDIT_USER, {
    onCompleted: () => {
      toast.success(`${dataEdit.updateUser.firstName} ${dataEdit.updateUser.lastName}'s information is Updated!`);
      refetch();
    },
    onError: () => {
      toast.error(errorEdit.message || 'Something went wrong!');
    },
  });

  if (errorEdit) {
    console.log(`error: ${errorEdit.message}`);
  }

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

  function handleEditValues(event, event2, event3, event4, event5) {
    setEditModal(true);
    setfName(event);
    setlName(event2);
    setPhone(event3);
    setMail(event4);
  }

  const [deleteUser, res] = useMutation(DELETE_USER, {
    onCompleted: () => {
      toast(`${res.data.deleteUser.firstName} is removed from database.!`);
      setTimeout(() => {
        history.push('/admin/user/list');
      }, 2000);
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });

  const handleDelete = async () => {
    setDeleteModalView(true);
  };

  const deleteSellerConfirmed = async () => {
    if (id) {
      await deleteUser({
        variables: {
          deleteUserId: id,
        },
      });
    } else {
      toast.error("something went wrong in, can't delete User!");
    }
  };

  const [newRole, setNewRole] = useState('');

  const [changeUserRole, { data: RoleData }] = useMutation(ADD_ROLE_TO_USER, {
    onCompleted: () => {
      toast.success(`New Role is updated successfully.`);
      refetch();
    },
    onError: (err) => {
      if (err.message === 'Error: you can not add b2b and seller directly') {
        toast.error('To add Seller or B2B, Click on button below.');
      } else if (err.message === 'Error: User is already this role') {
        toast.error(`User is already a ${newRole}.`);
      }
    },
  });

  function changeRole(userID) {
    changeUserRole({
      variables: {
        role: newRole,
        userId: userID,
      },
    });
  }

  const [removeRoleFromUser, { data: removeRoleData }] = useMutation(REMOVE_ROLE_FROM_USER, {
    onCompleted: () => {
      toast.success(`Selected Role is Removed successfully!`);
      refetch();
    },
    onError: (err) => {
      if (err.message === 'Error: you can not remove b2b and seller directly') {
        toast.error('To Remove Seller or B2B, Click on button below.');
      } else {
        toast.error(err.message || 'Some Error Occured');
      }
    },
  });

  function removeRole(userID) {
    removeRoleFromUser({
      variables: {
        role: newRole,
        userId: userID,
      },
    });
  }

  const getRoleName = (item) => {
    if (item === 'masterAdmin') return 'Master Admin';
    if (item === 'admin') return 'Portal Admin';
    if (item === 'customer') return 'Customer';
    if (item === 'seller') return 'Seller Associate';
    if (item === 'superSeller') return 'Business Associate';
    if (item === 'subBusiness') return 'Dealer Associate';
    if (item === 'accounts') return 'Accounts Associate';
    if (item === 'enquiry') return 'Enquiry Associate';
    if (item === 'service') return 'Service Associate';
    return item.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase();
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-2">
        <Row className="align-items-center">
          <Col className="col-auto d-flex align-items-center">
            <NavLink className="text-decoration-none d-flex align-items-center me-2" to="/admin/dashboard">
              <span className="fw-medium text-dark">Dashboard</span>
            </NavLink>
            <span className="text-dark">/</span>
            <NavLink className="text-decoration-none d-flex align-items-center ms-2 me-2" to="/admin/user/list">
              <span className="fw-medium text-dark">User List</span>
            </NavLink>
            <span className="text-dark">/</span>
            <span className="ms-2 fw-semibold text-dark">User Detail</span>
          </Col>
        </Row>
      </div>

      {data && (
        <>
          <Row className="m-0 mb-2 p-1 rounded bg-white align-items-center">
            <Col md="12">
              <span className="fw-bold fs-5 ps-2 pt-2">User detail</span>
            </Col>
          </Row>
          <Row>
            <Col xl="4">
              <div className="small-title bg-primary rounded text-white text-center p-2">Profile</div>
              <Card className="mb-5 mx-1 px-1">
                <Card.Body className="mb-n5 mx-1 px-2">
                  <div className="d-flex align-items-center flex-column mb-5">
                    <div className="mb-5 d-flex align-items-center flex-column">
                      <div className="sw-6 sh-6 mb-3 d-inline-block bg-primary d-flex justify-content-center align-items-center rounded-xl">
                        <div>
                          {data?.getUser?.profilepic ? (
                            <img className="profile" style={{ height: '50px', width: '50px', borderRadius: '5px' }} alt="dp" src={data?.getUser?.profilepic} />
                          ) : (
                            <img
                              className="profile"
                              style={{ height: '50px', width: '50px', borderRadius: '5px' }}
                              alt="dp"
                              src="/img/profile/profile-11.webp"
                            />
                          )}
                        </div>
                      </div>
                      <div className="h5 fw-bold mb-1">
                        {data.getUser.firstName} {data.getUser.lastName}
                      </div>
                      {data.getUser.addresses.length !== 0 && (
                        <div className="text-dark">
                          <CsLineIcons icon="pin" className="me-1" />
                          <span className="align-middle">
                            {data.getUser.addresses[0].city}, {data.getUser.addresses[0].country}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="d-flex flex-row justify-content-between">
                      <Button
                        variant="primary"
                        className="w-100 me-2"
                        onClick={() => {
                          handleEditValues(data.getUser.firstName, data.getUser.lastName, data.getUser.mobileNo, data.getUser.email, data.getUser.role);
                        }}
                      >
                        Edit
                      </Button>
                      <Button variant="outline-primary" className="w-100 me-2" onClick={() => handleDelete()}>
                        Delete
                      </Button>
                    </div>
                    {!role && (
                      <div className="d-flex mt-2 flex-row justify-content-center">
                        <Button className="w-100 me-2" onClick={() => upgradeSeller(id)}>
                          Upgrade in Associate
                        </Button>
                      </div>
                    )}
                    <Row>
                      <Form.Label className="fw-bold fs-6 text-dark mb-0 pb-0 mt-4 justify-content-center">Select a Role</Form.Label>
                      <Col>
                        <div className="my-2  mx-0 px-0">
                          <Form.Select
                            className="mt-1 w-100"
                            id="EnquirySelect"
                            onChange={(event) => setNewRole(event.target.value)}
                            aria-label="Default select example"
                          >
                            <option>Select a Role</option>
                            <option value="accounts">Accounts Admin</option>
                            {role === true ? <option value="seller">Seller Associate</option> : null}
                            {role === true ? <option value="enquiry">Enquiry Associate</option> : null}
                            {role === true ? <option value="service">Service Associate</option> : null}
                            {role === true ? <option value="superSeller">Business Associate</option> : null}

                            {/* <option value="categoryManager">Category Manager</option> */}
                            {/* <option value="sellerManager">Seller Manager</option> */}
                            {/* <option value="siteManager">Site Manager</option> */}
                            {/* <option value="blogManager">Blog Manager</option> */}
                            {/* <option value="seriesManager">Series Manager</option> */}
                            {/* <option value="attribueManager">Attribute Manager</option> */}
                            {/* <option value="b2bManager">B2B Manager</option> */}
                            {/* <option value="inventoryManager">Inventory Manager</option> */}
                            {/* <option value="orderManager">Order Manager</option> */}
                            {/* <option value="productPriceUpdateManager">Product Price Update Manager</option> */}
                          </Form.Select>
                        </div>
                      </Col>
                      <Col className="mt-2  mx-0 px-0">
                        <div className="d-flex  flex-row justify-content-center">
                          <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Save Selected Role</Tooltip>}>
                            <Button variant="outline-primary" className="btn-icon btn-icon-only me-2" onClick={() => changeRole(id)}>
                              <CsLineIcons icon="save" />
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Remove Selected Role</Tooltip>}>
                            <Button variant="outline-primary" className="btn-icon btn-icon-only me-2" onClick={() => removeRole(id)}>
                              <CsLineIcons icon="bin" />
                            </Button>
                          </OverlayTrigger>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  <div className="mb-2">
                    <div className="border-bottom p-2">
                      <div className="fw-bold text-dark pb-2">Registration Details</div>
                      <Row className="g-0 mb-2">
                        <Col xs="auto">
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="user" size="17" className="text-primary" />
                          </div>
                        </Col>
                        <Col className="text-dark ">
                          {data.getUser.firstName} {data.getUser.lastName}
                        </Col>
                      </Row>
                      {data.getUser.addresses.length !== 0 && (
                        <Row className="g-0 mb-2">
                          <Col xs="auto">
                            <div className="sw-3 me-1">
                              <CsLineIcons icon="pin" size="17" className="text-primary" />
                            </div>
                          </Col>
                          <Col className="text-dark ">
                            {data.getUser.addresses[0].addressLine1}
                            {data.getUser.addresses[0].addressLine2},{data.getUser.addresses[0].city},{data.getUser.addresses[0].country}
                          </Col>
                        </Row>
                      )}
                      <Row className="g-0 mb-2">
                        <Col xs="auto">
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="phone" size="17" className="text-primary" />
                          </div>
                        </Col>
                        <Col className="text-dark ">{data.getUser.mobileNo}</Col>
                      </Row>
                      <Row className="g-0 mb-2">
                        <Col xs="auto">
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="email" size="17" className="text-primary" />
                          </div>
                        </Col>
                        <Col className="text-dark ">{data.getUser.email}</Col>
                      </Row>
                    </div>
                    <div className="border-bottom p-2">
                      <Row className="g-0 mb-2">
                        <Col className="text-dark">
                          <div className="fw-bold text-dark pb-2">User Roles</div>
                          <ul className="mx-0 px-0 mb-0">
                            {/* {data.getUser.role.map((item, index) => (
                            <li className="mx-0 ps-3 pb-1" key={index} style={{ listStyle: 'none' }}>
                              {item === 'subBusiness' ? (
                                <a href="/dealer-dashboard" style={{ textDecoration: 'none', color: 'blue' }}>
                                  {getRoleName(item)}
                                </a>
                              ) : (
                                getRoleName(item)
                              )}
                            </li>
                          ))} */}
                            {data.getUser.role.map((item, index) => (
                              <li className="mx-0 ps-3 pb-1" key={index} style={{ listStyle: 'none' }}>
                                {getRoleName(item)}
                              </li>
                            ))}
                          </ul>
                        </Col>
                      </Row>
                    </div>
                    {seller?.superSellerId?.length > 0 && (
                      <div className="p-2">
                        <Row className="g-0 mb-2">
                          <Col className="text-dark">
                            <div className="fw-bold text-dark pb-2">Your BA Name</div>
                            <div className="mb-2">
                              {seller.superSellerId
                                .slice(0)
                                .reverse()
                                .map(
                                  (seller1, index) =>
                                    index < 5 && (
                                      <ul key={index} className="mx-0 px-0 mb-0 ps-3">
                                        <span>{seller1?.companyName}</span>
                                      </ul>
                                    )
                                )}
                            </div>
                          </Col>
                        </Row>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xl="8">
              <div>
                {orderData?.getUserAllOrder?.length > 0 ? (
                  <div className="small-title bg-primary rounded text-white text-center p-2">
                    <div>Orders</div>
                  </div>
                ) : (
                  <div className="border p-6 bg-white rounded w-100 text-center">No Orders Found</div>
                )}
              </div>
              <div className="mb-2">
                {orderData?.getUserAllOrder.length > 0 &&
                  orderData?.getUserAllOrder
                    .slice(0)
                    .reverse()
                    .map(
                      (order, index) =>
                        index < 5 && (
                          <Card key={index} className="mb-2">
                            <Card.Body className="sh-16 sh-md-8 py-0">
                              <Row className="g-0 h-100 align-content-center">
                                <Col xs="6" md="3" className="d-flex flex-column justify-content-center mb-2 mb-md-0 h-md-100">
                                  <div className="text-dark text-small d-md-none">Id</div>
                                  <NavLink to={`/admin/order/detail/${order.id}`} className="text-truncate h-100 d-flex align-items-center">
                                    <span maxLength={2}>{order.id.substring(0, 12)}...</span>
                                  </NavLink>
                                </Col>
                                <Col xs="6" md="4" className="d-flex flex-column justify-content-center mb-2 mb-md-0">
                                  <div className="text-dark text-small d-md-none">Total Amount</div>
                                  <div className="text-dark ">
                                    <span>
                                      <span className="text-small">₹ </span>
                                      {order.totalAmount}
                                    </span>
                                  </div>
                                </Col>
                                <Col xs="6" md="2" className="d-flex flex-column justify-content-center mb-2 mb-md-0">
                                  <div className="text-dark text-small d-md-none">Date</div>
                                  <div className="text-dark ">
                                    {' '}
                                    <span>{moment(parseInt(order.createdAt, 10)).format('LL')}</span>
                                  </div>
                                </Col>
                                <Col xs="6" md="3" className="d-flex flex-column justify-content-center mb-2 mb-md-0 align-items-md-end">
                                  <div className="text-dark text-small d-md-none">Status</div>
                                  <Badge bg="outline-tertiary">{order.status}</Badge>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        )
                    )}
                {orderData?.getUserAllOrder?.length > 0 && (
                  <div className="w-100 mb-2">
                    <NavLink to={`/admin/user/orderlist/${id}`} className="text-truncate h-100 d-flex float-end">
                      View All Orders
                    </NavLink>
                  </div>
                )}
              </div>
              {data.getUser.addresses.length > 0 ? (
                <div className="small-title bg-primary rounded text-white p-2 text-center">All Address</div>
              ) : (
                <div className="border text-center rounded p-6 bg-white">No Address Found</div>
              )}
              {data.getUser.addresses.map((address, index) => (
                <Card key={address.id} className="mb-1 me-2">
                  <div className="p-3">
                    <Row>
                      <Col>
                        <div className="mb-1">
                          <div className="text-md text-dark mb-2 fw-bold">Address {index + 1}</div>
                          <div className="ps-4">
                            {address.firstName} {address.lastName} <br />
                            {address.addressLine1}, {address.addressLine2}
                            <br />
                            {address.city}, {address.postalCode}
                            <br />
                            {address.state}, {address.country}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Card>
              ))}
            </Col>
          </Row>

          {/* Edit User Detail Modal Start */}
          <Modal className="modal-right scroll-out-negative" show={editModal} onHide={() => setEditModal(false)} scrollable dialogClassName="full">
            <Modal.Header closeButton>
              <Modal.Title className="text-dark fw-bold" as="h5">
                User Detail
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <OverlayScrollbarsComponent options={{ overflowBehavior: { x: 'hidden', y: 'scroll' } }} className="scroll-track-visible">
                <Form>
                  <div className="mb-3">
                    <Form.Label className="text-dark" htmlFor="userEditFirstName">
                      First Name <span className="text-danger"> *</span>{' '}
                    </Form.Label>
                    <Form.Control id="userEditFirstName" type="text" value={fName} onChange={(e) => setfName(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <Form.Label className="text-dark" htmlFor="userEditLastName">
                      Last Name <span className="text-danger"> *</span>{' '}
                    </Form.Label>
                    <Form.Control id="userEditLastName" type="text" value={lName} onChange={(e) => setlName(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <Form.Label className="text-dark" htmlFor="userEditMail">
                      Email <span className="text-danger"> *</span>{' '}
                    </Form.Label>
                    <Form.Control id="userEditMail" type="text" value={mail} onChange={(e) => setMail(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <Form.Label className="text-dark" htmlFor="userEditPhone">
                      Mobile no. <span className="text-danger"> *</span>{' '}
                    </Form.Label>
                    <Form.Control id="userEditPhone" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <Form.Label className="text-dark" id="userEditRole">
                      Role{' '}
                    </Form.Label>
                    <Form.Control id="userEditRole" type="text" defaultValue={data.getUser.role.join(', ').toUpperCase()} readOnly />
                  </div>
                </Form>
              </OverlayScrollbarsComponent>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button variant="primary" className="btn-icon btn-icon-start" type="button" onClick={() => handleSave()}>
                <span> Save </span>
              </Button>
            </Modal.Footer>
          </Modal>
          {/* Edit User Detail Modal End */}

          <Modal show={deleteModalView} onHide={() => setDeleteModalView(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Delete Seller</Modal.Title>
            </Modal.Header>
            {data.getUser.firstName && (
              <Modal.Body>
                <b>
                  {data.getUser.firstName} {data.getUser.lastName}
                </b>{' '}
                will be deleted?
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
        </>
      )}
    </>
  );
}
export default DetailViewUser;
