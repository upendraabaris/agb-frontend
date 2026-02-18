import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Row, Col, Dropdown, Form, Card, Tooltip, OverlayTrigger, Tabs, Tab, Pagination } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { gql, useLazyQuery } from '@apollo/client';

const GET_ALL_B2B = gql`
  query GetAllB2b($limit: Int, $search: String, $offset: Int, $sortBy: String, $sortOrder: String) {
    getAllB2b(limit: $limit, search: $search, offset: $offset, sortBy: $sortBy, sortOrder: $sortOrder) {
      companyName
      companyDescription
      address
      email
      gstin
      mobileNo
      id
      status
    }
  }
`;

function ListB2B() {
  const title = 'B2B List';
  const description = 'Ecommerce B2B List Page';
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(3);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('email');
  const [getB2B, { data, fetchMore, refetch }] = useLazyQuery(GET_ALL_B2B);

  const handleSort = (event) => {
    setSortBy(event);
    if (sortOrder === 'asc') {
      setSortOrder('dsc');
    } else {
      setSortOrder('asc');
    }

    getB2B({
      variables: {
        limit,
        offset,
        sortBy,
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

  useEffect(() => {
    getB2B({ variables: { offset, limit, sortBy, sortOrder } });
    refetch();
  }, [getB2B, offset, limit, sortBy, sortOrder]);

  const handleSearch = () => {
    getB2B({ variables: { search: debouncedSearch || undefined, limit, offset } });
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Dashboard</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
          </Col>
        </Row>
      </div>
      <h2 className="small-title">{title}</h2>
      <Row className="mb-3">
        <Col md="5" lg="3" xxl="2" className="mb-1">
          <div className="d-inline-block float-md-start me-1 mb-1 search-input-container w-100 shadow bg-foreground">
            <Form.Control type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
            <span className="search-magnifier-icon" onClick={handleSearch}>
              <CsLineIcons icon="search" />
            </span>
            <span className="search-delete-icon d-none">
              <CsLineIcons icon="close" />
            </span>
          </div>
        </Col>
        <Col md="7" lg="9" xxl="10" className="mb-1 text-end">
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
        </Col>
      </Row>

      <Tabs justify>
        <Tab eventKey="pending" title="Pending">
          <Row className="g-0 h-100 align-content-center d-none d-lg-flex ps-5 pe-5 mb-2 mt-4 custom-sort">
            <Col lg="2" className="d-flex flex-column mb-lg-0 pe-1 d-flex">
              <div className="text-muted text-md cursor-pointer sort" onClick={() => handleSort('companyName')}>
                Business Name
              </div>
            </Col>
            <Col lg="2" className="d-flex flex-column pe-1 justify-content-center align-items-lg-center">
              <div className="text-muted text-md cursor-pointer sort" onClick={() => handleSort('email')}>
                Email
              </div>
            </Col>
            <Col lg="2" className="d-flex flex-column pe-1 justify-content-center align-items-lg-center">
              <div className="text-muted text-md cursor-pointer sort" onClick={() => handleSort('mobileNo')}>
                Mobile No
              </div>
            </Col>
            <Col lg="3" className="d-flex flex-column pe-1 justify-content-center align-items-lg-center">
              <div className="text-muted text-md cursor-pointer sort" onClick={() => handleSort('address')}>
                Business Address
              </div>
            </Col>
            <Col lg="2" className="d-flex flex-column pe-1 justify-content-center align-items-lg-center">
              <div className="text-muted text-md cursor-pointer sort" onClick={() => handleSort('gstin')}>
                GST No.
              </div>
            </Col>
            <Col lg="1" className="d-flex flex-column pe-1 justify-content-center align-items-lg-center">
              <div className="text-muted text-md cursor-pointer sort">Check</div>
            </Col>
          </Row>

          {data &&
            data?.getAllB2b?.map(
              (b2b) =>
                b2b?.status === 'Pending' && (
                  <Card key={b2b?.id} className="mb-2">
                    <Card.Body className="pt-0 pb-0 sh-30 sh-lg-8">
                      <Row className="g-0 h-100 align-content-center">
                        <Col xs="11" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-1 order-lg-1 ">
                          <div className="text-muted text-small d-lg-none">Business Name</div>
                          <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip-top">Get details</Tooltip>}>
                            <NavLink to={`/admin/b2b/detail/${b2b?.id}`} className="text-truncate h-100 d-flex align-items-center">
                              {b2b?.companyName}
                            </NavLink>
                          </OverlayTrigger>
                        </Col>
                        <Col xs="12" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-3 order-lg-2 align-items-lg-center">
                          <div className="text-muted text-small d-lg-none">Description</div>
                          <div className="text-alternate">{b2b?.email}</div>
                        </Col>
                        <Col xs="6" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-2 order-lg-3 align-items-lg-center">
                          <div className="text-muted text-small d-lg-none">Mobile No</div>
                          <div className="text-alternate">{b2b?.mobileNo}</div>
                        </Col>
                        <Col xs="12" lg="3" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-4 order-lg-4 align-items-lg-center">
                          <div className="text-muted text-small d-lg-none">Business Address</div>
                          <div className="text-alternate">{b2b?.address}</div>
                        </Col>
                        <Col xs="6" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-2 order-lg-5 align-items-lg-center">
                          <div className="text-muted text-small d-lg-none">GST No.</div>
                          <div className="text-alternate">{b2b?.gstin}</div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                )
            )}
        </Tab>
        <Tab eventKey="approved" title="Approved">
          <Row className="g-0 h-100 align-content-center d-none d-lg-flex ps-5 pe-5 mb-2 mt-4 custom-sort">
            <Col lg="2" className="d-flex flex-column mb-lg-0 pe-1 d-flex">
              <div className="text-muted text-md cursor-pointer sort" onClick={() => handleSort('companyName')}>
                Business Name
              </div>
            </Col>
            <Col lg="2" className="d-flex flex-column pe-1 justify-content-center align-items-lg-center">
              <div className="text-muted text-md cursor-pointer sort" onClick={() => handleSort('email')}>
                Email
              </div>
            </Col>
            <Col lg="2" className="d-flex flex-column pe-1 justify-content-center align-items-lg-center">
              <div className="text-muted text-md cursor-pointer sort" onClick={() => handleSort('mobileNo')}>
                Mobile No
              </div>
            </Col>
            <Col lg="3" className="d-flex flex-column pe-1 justify-content-center align-items-lg-center">
              <div className="text-muted text-md cursor-pointer sort" onClick={() => handleSort('address')}>
                Business Address
              </div>
            </Col>
            <Col lg="2" className="d-flex flex-column pe-1 justify-content-center align-items-lg-center">
              <div className="text-muted text-md cursor-pointer sort" onClick={() => handleSort('gstin')}>
                GST No.
              </div>
            </Col>
            <Col lg="1" className="d-flex flex-column pe-1 justify-content-center align-items-lg-center">
              <div className="text-muted text-md cursor-pointer sort">Check</div>
            </Col>
          </Row>

          {data &&
            data?.getAllB2b?.map(
              (b2b) =>
                b2b?.status === 'Approved' && (
                  <Card key={b2b?.id} className="mb-2">
                    <Card.Body className="pt-0 pb-0 sh-30 sh-lg-8">
                      <Row className="g-0 h-100 align-content-center">
                        <Col xs="11" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-1 order-lg-1 ">
                          <div className="text-muted text-small d-lg-none">Business Name</div>
                          <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip-top">Get details</Tooltip>}>
                            <NavLink to={`/admin/b2b/detail/${b2b?.id}`} className="text-truncate h-100 d-flex align-items-center">
                              {b2b?.companyName}
                            </NavLink>
                          </OverlayTrigger>
                        </Col>
                        <Col xs="12" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-3 order-lg-2 align-items-lg-center">
                          <div className="text-muted text-small d-lg-none">Description</div>
                          <div className="text-alternate">{b2b?.email}</div>
                        </Col>
                        <Col xs="6" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-2 order-lg-3 align-items-lg-center">
                          <div className="text-muted text-small d-lg-none">Mobile No</div>
                          <div className="text-alternate">{b2b?.mobileNo}</div>
                        </Col>
                        <Col xs="12" lg="3" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-4 order-lg-4 align-items-lg-center">
                          <div className="text-muted text-small d-lg-none">Business Address</div>
                          <div className="text-alternate">{b2b?.address}</div>
                        </Col>
                        <Col xs="6" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-2 order-lg-5 align-items-lg-center">
                          <div className="text-muted text-small d-lg-none">GST No.</div>
                          <div className="text-alternate">{b2b?.gstin}</div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                )
            )}
        </Tab>
        <Tab eventKey="rejected" title="Rejected">
          <Row className="g-0 h-100 align-content-center d-none d-lg-flex ps-5 pe-5 mb-2 mt-4 custom-sort">
            <Col lg="2" className="d-flex flex-column mb-lg-0 pe-1 d-flex">
              <div className="text-muted text-md cursor-pointer sort" onClick={() => handleSort('companyName')}>
                Business Name
              </div>
            </Col>
            <Col lg="2" className="d-flex flex-column pe-1 justify-content-center align-items-lg-center">
              <div className="text-muted text-md cursor-pointer sort" onClick={() => handleSort('email')}>
                Email
              </div>
            </Col>
            <Col lg="2" className="d-flex flex-column pe-1 justify-content-center align-items-lg-center">
              <div className="text-muted text-md cursor-pointer sort" onClick={() => handleSort('mobileNo')}>
                Mobile No
              </div>
            </Col>
            <Col lg="3" className="d-flex flex-column pe-1 justify-content-center align-items-lg-center">
              <div className="text-muted text-md cursor-pointer sort" onClick={() => handleSort('address')}>
                Business Address
              </div>
            </Col>
            <Col lg="2" className="d-flex flex-column pe-1 justify-content-center align-items-lg-center">
              <div className="text-muted text-md cursor-pointer sort" onClick={() => handleSort('gstin')}>
                GST No.
              </div>
            </Col>
            <Col lg="1" className="d-flex flex-column pe-1 justify-content-center align-items-lg-center">
              <div className="text-muted text-md cursor-pointer sort">Check</div>
            </Col>
          </Row>

          {data &&
            data.getAllB2b.map(
              (b2b) =>
                b2b.status === 'Rejected' && (
                  <Card key={b2b.id} className="mb-2">
                    <Card.Body className="pt-0 pb-0 sh-30 sh-lg-8">
                      <Row className="g-0 h-100 align-content-center">
                        <Col xs="11" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-1 order-lg-1 ">
                          <div className="text-muted text-small d-lg-none">Business Name</div>
                          <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip-top">Get details</Tooltip>}>
                            <NavLink to={`/admin/b2b/detail/${b2b.id}`} className="text-truncate h-100 d-flex align-items-center">
                              {b2b.companyName}
                            </NavLink>
                          </OverlayTrigger>
                        </Col>
                        <Col xs="12" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-3 order-lg-2 align-items-lg-center">
                          <div className="text-muted text-small d-lg-none">Description</div>
                          <div className="text-alternate">{b2b.email}</div>
                        </Col>
                        <Col xs="6" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-2 order-lg-3 align-items-lg-center">
                          <div className="text-muted text-small d-lg-none">Mobile No</div>
                          <div className="text-alternate">{b2b.mobileNo}</div>
                        </Col>
                        <Col xs="12" lg="3" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-4 order-lg-4 align-items-lg-center">
                          <div className="text-muted text-small d-lg-none">Business Address</div>
                          <div className="text-alternate">{b2b.address}</div>
                        </Col>
                        <Col xs="6" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-2 order-lg-5 align-items-lg-center">
                          <div className="text-muted text-small d-lg-none">GST No.</div>
                          <div className="text-alternate">{b2b.gstin}</div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                )
            )}
        </Tab>
      </Tabs>

     
    </>
  );
}
export default ListB2B;
