import React, { useState, useEffect } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { Row, Col, Form, Card, Pagination, Tooltip, OverlayTrigger, Spinner, Table } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useLazyQuery, gql } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import moment from 'moment';

const GET_USERS = gql`
  query GetUsers($sortOrder: String, $sortBy: String, $search: String, $limit: Int, $offset: Int) {
    getUsers(sortOrder: $sortOrder, sortBy: $sortBy, search: $search, limit: $limit, offset: $offset) {
      id
      email
      lastName
      firstName
      mobileNo
      role
      createdAt
    }
  }
`;

function ListViewUser() {
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const title = 'User List';
  const description = 'Ecommerce User List Page';
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(100);
  const [sortOrder, setSortOrder] = useState('dsc');
  const [sortBy, setSortBy] = useState('createdAt');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [getUsers, { error, data, fetchMore, refetch }] = useLazyQuery(GET_USERS, {
    onCompleted: () => setLoading(false),
    onError: () => setLoading(false),
  });

  if (error) {
    if (error.message === 'Authorization header is missing') {
      history.push('/login');
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    getUsers({ variables: { search: debouncedSearch || undefined, offset, limit, sortBy, sortOrder } });
    refetch();
  }, [debouncedSearch, getUsers, offset, limit, sortBy, sortOrder]);

  const handleSort = (event) => {
    const newSortOrder = sortOrder === 'asc' ? 'dsc' : 'asc';
    setSortBy(event);
    setSortOrder(newSortOrder);
    setLoading(true);
    getUsers({ variables: { limit, offset, sortBy: event, sortOrder: newSortOrder } });
  };

  const handlePageChange = (newOffset) => {
    setOffset(newOffset);
    fetchMore({ variables: { offset: newOffset } });
  };

  function renderRole(role) {
    if (Array.isArray(role)) {
      const roleMap = {
        customer: 'Cust',
        admin: 'PA',
        masterAdmin: 'MA',
        superSeller: 'BA',
        seller: 'SA',
        subBusiness: 'DA',
        accounts: 'AC',
        enquiry: 'EA',
        service: 'SPA',
      };
      return role.map((r) => roleMap[r] || r).join(', ');
    }
    return role;
  }

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-2">
        <Row className="align-items-center">
          <Col className="col-auto d-flex align-items-center">
            <NavLink className="text-decoration-none d-flex align-items-center me-2" to="/admin/dashboard">
              <span className="fw-medium text-dark">Dashboard</span>
            </NavLink>
            <span className="">/</span>
            <span className="ms-2 fw-semibold text-dark">User List</span>
          </Col>
        </Row>
      </div>

      <Row className="m-0 mb-2 p-1 rounded bg-white align-items-center">
        <Col md="6">
          <span className="fw-bold fs-5 ps-2 pt-2">User List</span>
          <span className="small ps-2">{data?.getUsers ? `(${data.getUsers.length})` : ''}</span>
        </Col>
        <Col md="6">
          <div className="input-group shadow-sm rounded border bg-light">
            <span className="input-group-text bg-white border-0">
              <CsLineIcons icon="search" className="text-muted" />
            </span>
            <Form.Control
              id="userSearch"
              type="text"
              placeholder="Search by Email, First Name, Last Name or Mobile No."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0"
            />
          </div>
        </Col>
      </Row>

      <div className="table-responsive">
        <Table bordered hover className="align-middle bg-white">
          <thead>
            <tr>
              <th className="cursor-pointer sort col-2" onClick={() => handleSort('firstName')}>
                First Name <CsLineIcons icon="filter" width="12px" />
              </th>
              <th className="cursor-pointer sort" onClick={() => handleSort('email')}>
                Email <CsLineIcons icon="filter" width="12px" />
              </th>
              <th>Mobile No.</th>
              <th style={{ width: '120px' }}>Date</th>
              <th>
                Role
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id="tooltip-role">
                      Cust: Customer, EA: Enquiry Associate, SPA: Service Provider Associate, SA: Seller Associate, BA: Business Associate, Dealer: D, PS:
                      Portal Admin, MA: Master Admin
                    </Tooltip>
                  }
                >
                  <span className="cursor-pointer ms-1 text-dark">
                    <CsLineIcons icon="info-hexagon" width="12px" />
                  </span>
                </OverlayTrigger>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center">
                  <Spinner animation="border" variant="primary" />
                </td>
              </tr>
            ) : (
              <>
                {data?.getUsers?.length > 0 ? (
                  data.getUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        {user.firstName} {user.lastName}
                      </td>
                      <td>
                        <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip-left">Get details</Tooltip>}>
                          <NavLink to={`/admin/user/detail/${user.id}`} className="text-truncate h-100 d-flex align-items-center">
                            {user.email}
                          </NavLink>
                        </OverlayTrigger>
                      </td>
                      <td>{user.mobileNo}</td>
                      <td>{moment(parseInt(user.createdAt, 10)).format('DD-MMM-yy')}</td>
                      <td className="text-capitalize">{renderRole(user.role)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-dark fw-bold bg-white p-6 rounded">
                      <strong>User Not Found</strong>
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </Table>
      </div>

      {data && (
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
      )}
    </>
  );
}

export default ListViewUser;
