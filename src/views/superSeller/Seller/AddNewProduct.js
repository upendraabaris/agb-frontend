import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Row, Col, Modal, Form, Card, Tooltip, OverlayTrigger, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { stateList } from 'components/stateList/stateList';
import { CheckCircle, XCircle } from 'react-bootstrap-icons';

const GET_ALL_SELLERS = gql`
  query GetAllSellersByExactMatch($search: String, $limit: Int, $offset: Int, $sortBy: String, $sortOrder: String) {
    getAllSellersByExactMatch(search: $search, limit: $limit, offset: $offset, sortBy: $sortBy, sortOrder: $sortOrder) {
      id
      email
      companyName
      companyDescription
      address
      gstin
      mobileNo
      dealerstatus
      allotted {
        state
        baId
        dastatus
        dealerId
      }
    }
  }
`;

const APPROVE_SELLER = gql`
  mutation ApproveBySuperSeller($sellerid: ID!) {
    approveBySuperSeller(sellerid: $sellerid) {
      id
    }
  }
`;

const REGISTER_USER_WITH_SELLER = gql`
  mutation RegisterUserWithSeller(
    $firstName: String!
    $lastName: String!
    $email: String!
    $mobileNo: String!
    $password: String!
    $companyName: String!
    $gstin: String!
    $fullAddress: String!
    $city: String!
    $state: String!
    $pincode: String!
    $companyDescription: String!
    $status: Boolean
    $bastatus: Boolean
    $dealerstatus: Boolean
  ) {
    registerUserWithSeller(
      firstName: $firstName
      lastName: $lastName
      email: $email
      mobileNo: $mobileNo
      password: $password
      companyName: $companyName
      gstin: $gstin
      fullAddress: $fullAddress
      city: $city
      state: $state
      pincode: $pincode
      companyDescription: $companyDescription
      status: $status
      bastatus: $bastatus
      dealerstatus: $dealerstatus
    ) {
      user {
        firstName
      }
    }
  }
`;

function ListSeller({ history }) {
  const title = 'Add Dealer';
  const description = 'Add Dealer';
  const dispatch = useDispatch();
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(100);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('email');
  const allStatesList = stateList();
  const [showModal, setShowModal] = useState(false);
  const [isshowModal, setIsShowModal] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isSearchPerformed, setIsSearchPerformed] = useState(false);
  const { currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
  }, [dispatch]);

  const [getAllSeller, { error: fetchError, data, fetchMore, refetch }] = useLazyQuery(GET_ALL_SELLERS, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });

  const [approveSeller, { loading: approvingLoading, error: approveError }] = useMutation(APPROVE_SELLER);

  if (fetchError) {
    console.error('GET_ALL_SELLERS', fetchError);
  }

  const handleSort = (event) => {
    setSortBy(event);
    setSortOrder(sortOrder === 'asc' ? 'dsc' : 'asc');
    getAllSeller({
      variables: {
        limit,
        offset,
        sortBy: event,
        sortOrder,
      },
    });
  };

  const handlePageChange = (newOffset) => {
    setOffset(newOffset);
    fetchMore({
      variables: { offset: newOffset },
    });
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [search]);

  const handleSearch = () => {
    setIsSearchPerformed(true);
    if (debouncedSearch) {
      getAllSeller({ variables: { search: debouncedSearch, limit, offset, sortBy, sortOrder } });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const openModal = (seller) => {
    setSelectedSeller(seller);
    setShowModal(true);
  };

  const handleApprove = async () => {
    if (selectedSeller) {
      try {
        await approveSeller({ variables: { sellerid: selectedSeller.id } });
        setShowModal(false);
        toast.success('DA request submitted successfully');
        getAllSeller({ variables: { search: debouncedSearch, limit, offset, sortBy, sortOrder } });
      } catch (error) {
        console.error('Error approving seller:', error);
      }
    }
  };

  const [registerUser, { loading, error }] = useMutation(REGISTER_USER_WITH_SELLER);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNo: '',
    password: '',
    companyName: '',
    gstin: '',
    fullAddress: '',
    city: '',
    state: '',
    pincode: '',
    companyDescription: '',
    status: true,
    bastatus: false,
    dealerstatus: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser({ variables: formData });
      setTimeout(() => {
        history.push('/superSeller/seller/list');
      });
      getAllSeller({ variables: { search: debouncedSearch, limit, offset, sortBy, sortOrder } });
      setIsShowModal(true);
    } catch (err) {
      toast.error('Error registering dealer');
    }
  };

  const currentBaId = currentUser?.seller?.id;
  const currentBaName = currentUser?.seller?.companyName;
  const isSellerFound = data?.getAllSellersByExactMatch?.length > 0;

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-2">
        <Row className="g-0">
          <Col className="col-6 mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/superSeller/dashboard">
              <span className="align-middle text-dark ms-1">Dashboard</span>
            </NavLink>
            <span className="text-dark text-small ps-2"> / </span>
            <span className="align-middle text-dark ms-1">Add Dealer Associate</span>
          </Col>
        </Row>
      </div>
      <Row className="m-0 mb-2 p-1 rounded bg-white align-items-center">
        <Col md="6">
          <h5 className="fw-bold fs-5 ps-2 pt-2">Add Dealer Associate</h5>
        </Col>
        <Col className="col-6 text-end">
          <NavLink className="btn btn-link border border-primary rounded" to="/superSeller/seller/list">
            Dealer List Associate
          </NavLink>
        </Col>
      </Row>
      <div className="rounded p-0 mt-1 bg-white">
        <div className="rounded p-2 mt-1 bg-white">
          <Row className="justify-content-center mb-4 p-6 pb-2">
            <Col xs="12" md="8" lg="7">
              <div className="text-center mb-3">
                <h5 className="fw-bold mb-1 fs-5">Find or Onboard Dealer Associate</h5>
                <p className="text-muted small mb-0">
                  Enter GST number, email, or mobile to check if the dealer already exists. If found, approve and onboard them. If not found, complete a new
                  registration.
                </p>
              </div>

              <div className="position-relative">
                <Form.Control
                  id="sellerSelect"
                  type="text"
                  placeholder="Search by GST / Email / Mobile"
                  value={search}
                  onKeyPress={handleKeyPress}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s+/g, '');
                    setSearch(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === ' ') e.preventDefault();
                  }}
                  className="py-2 ps-5 pe-5 shadow-sm rounded-pill text-center"
                />

                <span className="position-absolute top-50 end-0 translate-middle-y pe-3 text-primary cursor-pointer" onClick={handleSearch}>
                  <CsLineIcons icon="search" size={16} />
                </span>

                {search && (
                  <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted cursor-pointer" onClick={() => setSearch('')}>
                    <CsLineIcons icon="close" size={14} />
                  </span>
                )}
              </div>
            </Col>
          </Row>

          {data?.getAllSellersByExactMatch?.length > 0 ? (
            <div className="table-responsive d-none d-lg-block mb-2">
              <table className="table table-bordered table-hover align-middle shadow-sm bg-white">
                <thead className="table-light">
                  <tr>
                    <th>Associate Name</th>
                    <th>Email</th>
                    <th>Mobile No.</th>
                    <th>GST Number</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {data.getAllSellersByExactMatch.map((seller) => {
                    const allottedEntry = seller?.allotted?.find((item) => item.baId === currentBaId);

                    return (
                      <tr key={seller.id}>
                        <td>
                          <NavLink to={`/superSeller/seller/detail/${seller.id}`} className="text-decoration-none fw-semibold text-dark">
                            {seller.companyName}
                          </NavLink>
                        </td>
                        <td>{seller.email}</td>
                        <td>{seller.mobileNo}</td>
                        <td>{seller.gstin}</td>
                        <td className="text-center">
                          {!allottedEntry && (
                            <OverlayTrigger
                              placement="bottom"
                              overlay={
                                <Tooltip>If you wish to convert this Associate into a Dealer Associate under your account, kindly raise a request</Tooltip>
                              }
                            >
                              <span className="text-primary fw-semibold cursor-pointer" onClick={() => openModal(seller)}>
                                Register as DA under you
                              </span>
                            </OverlayTrigger>
                          )}
                          {allottedEntry && allottedEntry.dastatus === false && <span className="badge bg-warning text-dark">Under Review</span>}
                          {allottedEntry && allottedEntry.dastatus === true && <span className="badge bg-success">Approved</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            isSearchPerformed && (
              <div className="rounded border p-0 mt-1 bg-white">
                <div className="rounded p-2 mt-1 bg-white">
                  <div className="border-bottom pb-3">
                    <h5 className="fw-bold fs-5 ps-2 mb-0 pt-2 w-100">Register New Dealer Associate</h5>
                    <p className="text-muted small ps-2 mb-0 ">Create and onboard a new Dealer Associate from scratch.</p>
                  </div>
                  <Form onSubmit={handleSubmit} className="p-4 rounded">
                    <Row className="mb-4">
                      <Col md="6">
                        <Form.Group>
                          <Form.Label className="fw-bold text-dark">
                            First Name <span className="text-danger"> *</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Enter first name"
                            required
                            className="shadow-sm rounded"
                          />
                        </Form.Group>
                      </Col>
                      <Col md="6">
                        <Form.Group>
                          <Form.Label className="fw-bold text-dark">
                            Last Name <span className="text-danger"> *</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Enter last name"
                            required
                            className="shadow-sm rounded"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mb-4">
                      <Col md="6">
                        <Form.Group>
                          <Form.Label className="fw-bold text-dark">
                            Email <span className="text-danger"> *</span>
                          </Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\s/g, '');
                              handleChange({ target: { name: 'email', value } });
                            }}
                            placeholder="Enter email address"
                            required
                            className="shadow-sm rounded"
                          />
                        </Form.Group>
                      </Col>
                      <Col md="6">
                        <Form.Group>
                          <Form.Label className="fw-bold text-dark">
                            Mobile No <span className="text-danger"> *</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="mobileNo"
                            value={formData.mobileNo}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 10) {
                                handleChange({ target: { name: 'mobileNo', value } });
                              }
                            }}
                            placeholder="Enter mobile number"
                            required
                            className="shadow-sm rounded"
                            maxLength={10}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mb-4">
                      <Col md="6">
                        <Form.Group>
                          <Form.Label className="fw-bold text-dark">
                            Dealer Name <span className="text-danger"> *</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            placeholder="Enter company name"
                            required
                            className="shadow-sm rounded"
                          />
                        </Form.Group>
                      </Col>
                      <Col md="6">
                        <Form.Group>
                          <Form.Label className="fw-bold text-dark">
                            GSTIN <span className="text-danger"> *</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="gstin"
                            value={formData.gstin}
                            onChange={(e) => {
                              const value = e.target.value.slice(0, 15);
                              handleChange({ target: { name: 'gstin', value } });
                            }}
                            placeholder="Enter GSTIN"
                            required
                            className="shadow-sm rounded"
                            maxLength={15}
                            pattern="^[A-Za-z0-9]{15}$"
                            title="GSTIN must be exactly 15 alphanumeric characters."
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mb-4">
                      <Col md="6">
                        <Form.Group>
                          <Form.Label className="fw-bold text-dark">
                            Full Address <span className="text-danger"> *</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="fullAddress"
                            value={formData.fullAddress}
                            onChange={handleChange}
                            placeholder="Enter full address"
                            required
                            className="shadow-sm rounded"
                          />
                        </Form.Group>
                      </Col>
                      <Col md="6">
                        <Form.Group>
                          <Form.Label className="fw-bold text-dark">
                            City <span className="text-danger"> *</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="Enter city"
                            required
                            className="shadow-sm rounded"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mb-4">
                      <Col md="6">
                        <Form.Group>
                          <Form.Label className="fw-bold text-dark">
                            State <span className="text-danger"> *</span>
                          </Form.Label>
                          <Form.Select name="state" onChange={handleChange} value={formData.state} aria-label="Default select example">
                            <option value="" hidden>
                              Select State
                            </option>
                            {allStatesList.map((state, index) => (
                              <option value={state.value} key={index}>
                                {state.displayValue}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md="6">
                        <Form.Group>
                          <Form.Label className="fw-bold text-dark">
                            Pincode <span className="text-danger"> *</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 6) {
                                handleChange({ target: { name: 'pincode', value } });
                              }
                            }}
                            placeholder="Enter pincode"
                            required
                            className="shadow-sm rounded"
                            maxLength={6}
                            pattern="^\d{6}$"
                            title="Pincode must be exactly 6 digits."
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mb-4">
                      <Col md="12">
                        <Form.Group>
                          <Form.Label className="fw-bold text-dark">
                            Dealer Description <span className="text-danger"> *</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            as="textarea"
                            name="companyDescription"
                            value={formData.companyDescription}
                            onChange={handleChange}
                            placeholder="Enter company description"
                            required
                            className="shadow-sm rounded"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button type="submit" variant="primary" disabled={loading} className="w-100 mt-3 shadow-sm">
                      Submit
                    </Button>
                    {error && <p className="text-danger mt-3 text-center">{error.message}</p>}
                  </Form>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header className="p-2 ps-4" closeButton>
          <Modal.Title className="fw-bold p-2">Confirm Dealer Associate Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSeller && (
            <>
              <div className="mb-3">
                <div>
                  <strong>Dealer Name:</strong> {selectedSeller.companyName}
                </div>
                <div>
                  <strong>Email:</strong> {selectedSeller.email}
                </div>
                <div>
                  <strong>Mobile No:</strong> {selectedSeller.mobileNo}
                </div>
                <div>
                  <strong>GST Number:</strong> {selectedSeller.gstin}
                </div>
                {selectedSeller.companyDescription && (
                  <div>
                    <strong>Description:</strong> {selectedSeller.companyDescription}
                  </div>
                )}
              </div>

              <div className="alert alert-warning mb-0">
                Does <strong>{currentBaName}</strong> as a Business Associate (BA) want to send a request to add <strong>{selectedSeller.companyName}</strong>{' '}
                as a Dealer Associate (DA) to their network?
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>

          <Button variant="primary" onClick={handleApprove} disabled={approvingLoading}>
            {approvingLoading ? 'Sending Request...' : 'Send Approval Request'}
          </Button>

          {approveError && <p className="text-danger mt-2 mb-0">{approveError.message}</p>}
        </Modal.Footer>
      </Modal>

      <Modal show={isshowModal} onHide={() => setIsShowModal(false)}>
        <Modal.Header className="p-2 ps-4" closeButton>
          <Modal.Title className="fw-bold p-2">Registration Successful</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>Dealer has been registered successfully – Dealer account is currently under review.</div>
        </Modal.Body>
        <Modal.Footer>
          {approveError && <p className="text-danger mt-2">{approveError.message}</p>}
          <button type="button" className="btn btn-secondary" onClick={() => setIsShowModal(false)}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ListSeller;
