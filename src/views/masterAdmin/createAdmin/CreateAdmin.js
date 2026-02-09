import React, { useState, useEffect } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { Row, Col, Dropdown, Form, Card, Pagination, Tooltip, OverlayTrigger, Button, Modal } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import CheckAll from 'components/check-all/CheckAll';
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { toast } from 'react-toastify';

function CreateAdmin() {
  const history = useHistory();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const GET_USERS = gql`
    query GetUsers($sortOrder: String, $sortBy: String, $search: String, $limit: Int, $offset: Int) {
      getUsers(sortOrder: $sortOrder, sortBy: $sortBy, search: $search, limit: $limit, offset: $offset) {
        id
        email
        lastName
        firstName
        mobileNo
        role
      }
    }
  `;

  const title = 'User List';
  const description = 'Ecommerce User List Page';
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(5);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('firstName');

  // const limit = 10;
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [getUsers, { error, data, fetchMore, refetch }] = useLazyQuery(GET_USERS);

  if (error) {
    if (error.message === 'Authorization header is missing' || error.message === 'jwt expired') {
      history.push('/login');
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [search]);

  useEffect(() => {
    getUsers({ variables: { offset, limit, sortBy, sortOrder } });
    refetch();
    // Execute the getUsers function when the component mounts
  }, [getUsers, offset, limit, sortBy, sortOrder]);

  const handleSearch = () => {
    getUsers({ variables: { search: debouncedSearch || undefined, limit, offset } });
  };

  const handleSort = (event) => {
    setSortBy(event);
    if (sortOrder === 'asc') {
      setSortOrder('dsc');
    } else {
      setSortOrder('asc');
    }

    getUsers({
      variables: {
        limit,
        offset,
        sortBy,
        sortOrder,
      },
    });
  };

  // const handleKeypress = (event) => {
  //   // it triggers by pressing the enter key
  //   if (event.charCode === 13) {
  //   handleSearch();
  //   } };

  const handlePageChange = (newOffset) => {
    setOffset(newOffset);
    fetchMore({
      variables: { offset: newOffset },
    });
  };

  //   appoint as admin

  const ADD_ADMIN_ROLE = gql`
    mutation AddAdminRole($userId: ID) {
      addAdminRole(userID: $userId) {
        message
      }
    }
  `;
  const REMOVE_ADMIN_ROLE = gql`
    mutation RemoveAdminRole($userId: ID) {
      removeAdminRole(userID: $userId) {
        message
      }
    }
  `;
  const [modalView, setModalView] = useState(false);
  const [admin, setAdmin] = useState(null);

  const [AddAdminRole] = useMutation(ADD_ADMIN_ROLE, {
    onCompleted: (res) => {
      toast.success(res.addAdminRole.message || 'User updated !');
      setModalView(false);
      setAdmin(null);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Something Went Wrong !');
      if (err.message === 'Authorization header is missing' || err.message === 'jwt expired') {
        history.push('/login');
      }
    },
  });
  const [RemoveAdminRole] = useMutation(REMOVE_ADMIN_ROLE, {
    onCompleted: (res) => {
      toast.success(res.removeAdminRole.message || 'User updated !');
      setModalView(false);
      setAdmin(null);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Something Went Wrong !');
      if (err.message === 'Authorization header is missing' || err.message === 'jwt expired') {
        history.push('/login');
      }
    },
  });

  const getUserDetail = (uservalue) => {
    setAdmin(uservalue);
    setModalView(true);
  };

  const addAdmin = async () => {
    await AddAdminRole({
      variables: {
        userId: admin.id,
      },
    });
  };
  const removeadminrole = async () => {
    await RemoveAdminRole({
      variables: {
        userId: admin.id,
      },
    });
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/master_admin/dashboard">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Dashboard</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
            {/* Title End */}
          </Col>
        </Row>
      </div>
      {/* <h2 className="small-title">{title}</h2> */}
      <Row className="mb-3">
        <Col md="5" lg="3" xxl="2" className="mb-1">
          {/* Search Start */}
          <div className="d-inline-block float-md-start me-1 mb-1 search-input-container w-100 shadow bg-foreground">
            <Form.Control id="userSearch" type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
            <span className="search-magnifier-icon" onClick={handleSearch}>
              <CsLineIcons icon="search" />
            </span>
            <span className="search-delete-icon d-none">
              <CsLineIcons icon="close" />
            </span>
          </div>
          {/* Search End */}
        </Col>
        <Col md="7" lg="9" xxl="10" className="mb-1 text-end">
          {/* Length Start */}
          <Dropdown onSelect={(e) => setLimit(parseInt(e, 10))} align={{ xs: 'end' }} className="d-inline-block ms-1">
            <OverlayTrigger delay={{ show: 1000, hide: 0 }} placement="top" overlay={<Tooltip id="tooltip-top">Item Count</Tooltip>}>
              <Dropdown.Toggle variant="foreground-alternate" className="shadow sw-13">
                {limit} Items
              </Dropdown.Toggle>
            </OverlayTrigger>
            <Dropdown.Menu className="shadow dropdown-menu-end">
              <Dropdown.Item eventKey="5">5 Items</Dropdown.Item>
              <Dropdown.Item eventKey="10">10 Items</Dropdown.Item>
              <Dropdown.Item eventKey="15">15 Items</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          {/* Length End */}
        </Col>
      </Row>

      {/* List Header starts */}

      <Row className="g-0 h-100 align-content-center d-none d-lg-flex ps-5 pe-5 mb-2 custom-sort">
        <Col lg="3" className="d-flex flex-column mb-lg-0 pe-1 d-flex ">
          <div className="text-muted text-md cursor-pointer sort" onClick={() => handleSort('email')}>
            EMAIL
          </div>
        </Col>
        <Col lg="2" className="d-flex flex-column pe-1 justify-content-center align-items-lg-center">
          <div className="text-muted text-md cursor-pointer sort" onClick={() => handleSort('firstName')}>
            FIRSTNAME
          </div>
        </Col>
        <Col lg="2" className="d-flex flex-column pe-1 justify-content-center align-items-lg-center ">
          <div className="text-muted text-md cursor-pointer sort" onClick={() => handleSort('lastName')}>
            LASTNAME
          </div>
        </Col>
        <Col lg="2" className="d-flex flex-column pe-1 justify-content-center align-items-lg-center">
          <div className="text-muted text-md cursor-pointer sort" onClick={() => handleSort('mobileNo')}>
            MOBILE No
          </div>
        </Col>

        <Col lg="3" className="d-flex flex-column pe-1 justify-content-center align-items-lg-center">
          <div className="text-muted text-md cursor-pointer sort" onClick={() => handleSort('role')}>
            ROLE
          </div>
        </Col>
        {/* <Col lg="1" className="d-flex flex-column pe-1 justify-content-center align-items-lg-center">
          <div className="text-muted text-md cursor-pointer ">Check</div>
        </Col> */}
      </Row>
      {/* List Header End */}

      {/* List Items Start */}
      {data && (
        <>
          {data.getUsers?.map((user) => {
            return (
              <Card key={user.id} className="mb-2 hover-border-primary">
                <Card.Body className="pt-0 pb-0 sh-30 sh-lg-8">
                  <Row
                    className="g-0 h-100 align-content-center"
                    onClick={() => {
                      getUserDetail(user);
                    }}
                  >
                    <Col xs="10" lg="3" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-1 order-lg-1 ">
                      <div className="text-muted text-small d-lg-none">Email</div>
                      <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip-left">Get details</Tooltip>}>
                        <NavLink to="#/!" className="text-truncate h-100 d-flex align-items-center">
                          {user.email}
                        </NavLink>
                      </OverlayTrigger>
                    </Col>
                    <Col xs="6" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-3 order-lg-2 align-items-lg-center">
                      <div className="text-muted text-small d-lg-none">FirstName</div>
                      <div className="text-alternate">{user.firstName}</div>
                    </Col>
                    <Col xs="6" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-4 order-lg-3 align-items-lg-center">
                      <div className="text-muted text-small d-lg-none">LastName</div>
                      <div className="text-alternate">{user.lastName}</div>
                    </Col>

                    <Col xs="6" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-5 order-lg-4 align-items-lg-center">
                      <div className="text-muted text-small d-lg-none">Mobile No</div>
                      <div className="text-alternate">{user.mobileNo}</div>
                    </Col>
                    <Col xs="6" lg="3" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-5 order-lg-5 align-items-lg-center">
                      <div className="text-muted text-small d-lg-none">Role</div>
                      <div className="text-alternate">{user.role.join(', ').toUpperCase()}</div>
                    </Col>
                    {/* <Col xs="2" lg="1" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-2 order-lg-last align-items-lg-center">
                      <div className="text-muted text-small d-lg-none">Status</div>
                      <Form.Check
                        id={user.id}
                        name="checkBox"
                        className="form-check ps-5 ps-md-2"
                        type="checkbox"
                        checked={selectedItems.includes(user)}
                        onChange={() => checkItem(user)}
                      />
                    </Col> */}
                  </Row>
                </Card.Body>
              </Card>
            );
          })}

          <div className="d-flex justify-content-center mt-5">
            <Pagination>
              <Pagination.Prev className="shadow" onClick={() => handlePageChange(Math.max(offset - limit, 0))} disabled={offset === 0}>
                <CsLineIcons icon="chevron-left" />
              </Pagination.Prev>
              <Pagination.Next className="shadow" onClick={() => handlePageChange(offset + limit)} disabled={data.getUsers?.length < limit}>
                <CsLineIcons icon="chevron-right" />
              </Pagination.Next>
            </Pagination>
          </div>
        </>
      )}
      {/* Pagination End */}

      <Modal size="sm" aria-labelledby="contained-modal-title-vcenter" centered show={modalView} onHide={() => setModalView(!modalView)}>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Create an Portal Admin!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3 filled form-group tooltip-end-top">
            <CsLineIcons icon="user" />
            <Form.Control type="text" name="firstname" readOnly defaultValue={admin?.firstName || ''} />
          </div>

          <div className="mb-3 filled form-group tooltip-end-top">
            <CsLineIcons icon="email" />
            <Form.Control type="email" name="email" readOnly defaultValue={admin?.email || ''} />
          </div>
          <div className="mb-3 d-flex justify-content-around">
            <Button onClick={addAdmin}>Add</Button>
            <Button onClick={removeadminrole} variant="danger">
              Remove
            </Button>
          </div>
        </Modal.Body>
        {/* <Modal.Footer></Modal.Footer> */}
      </Modal>
    </>
  );
}

export default CreateAdmin;
