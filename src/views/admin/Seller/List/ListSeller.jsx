import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Row, Col, Dropdown, Form, Card, Pagination, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { gql, useLazyQuery } from '@apollo/client';

function ListSeller() {
  const title = 'Seller List';
  const description = 'Ecommerce Seller List Page';
  const dispatch = useDispatch();
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(100);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('email');

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const GET_ALL_SELLERS = gql`
    query GetAllSellers($search: String, $limit: Int, $offset: Int, $sortBy: String, $sortOrder: String) {
      getAllSellers(search: $search, limit: $limit, offset: $offset, sortBy: $sortBy, sortOrder: $sortOrder) {
        id
        email
        companyName
        companyDescription
        address
        gstin
        mobileNo
      }
    }
  `;
  const [getAllSeller, { error, data, fetchMore, refetch }] = useLazyQuery(GET_ALL_SELLERS);
  if (error) {
    console.error('GET_ALL_SELLERS', error);
  }
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSort = (event) => {
    setSortBy(event);
    if (sortOrder === 'asc') {
      setSortOrder('dsc');
    } else {
      setSortOrder('asc');
    }

    getAllSeller({
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
    getAllSeller({ variables: { offset, limit, sortBy, sortOrder } });
    refetch();
    // Execute the getUsers function when the component mounts
  }, [getAllSeller, offset, limit, sortBy, sortOrder]);

  const handleSearch = () => {
    getAllSeller({ variables: { search: debouncedSearch || undefined, limit, offset } });
  };
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      handleSearch();
    }
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
            <CsLineIcons icon="chevron-left" size="13" />
            <span className="align-middle text-small ms-1">Seller List</span>
          </Col>
          {/* Title End */}
        </Row>
      </div>

      <Row className="mb-3">
        <Col md="5" lg="3" xxl="2" className="mb-1">
          {/* Search Start */}
          <div className="d-inline-block float-md-start me-1 mb-1 search-input-container w-100 shadow bg-foreground">
            <Form.Control
              id="sellerSelect"
              type="text"
              placeholder="Search"
              onKeyPress={handleKeyPress}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="search-magnifier-icon" onClick={handleSearch}>
              <CsLineIcons icon="search" />
            </span>
            <span className="search-delete-icon d-none">
              <CsLineIcons icon="close" />
            </span>
          </div>
          {/* Search End */}
        </Col>
      </Row>

      {/* List Header Start */}
      <Row className="g-0 h-100 align-content-center d-none d-lg-flex p-3 rounded bg-white ps-5 mb-2 fw-bold custom-sort">
        <Col xs="6" lg="3" className="d-flex flex-column mb-lg-0 pe-3 d-flex ">
          <div className="text-dark text-md cursor-pointer sort" onClick={() => handleSort('email')}>
            Email
          </div>
        </Col>
        <Col lg="4" className="d-flex flex-column pe-1 justify-content-center">
          <div className="text-dark text-md cursor-pointer sort" onClick={() => handleSort('companyName')}>
            Company Name
          </div>
        </Col>
        <Col lg="2" className="d-flex flex-column pe-1 justify-content-center align-items-lg-center">
          <div className="text-dark text-md cursor-pointer sort" onClick={() => handleSort('mobileNo')}>
            Mobile No.
          </div>
        </Col>
        <Col lg="2" className="d-flex flex-column pe-1 justify-content-center align-items-lg-center">
          <div className="text-dark text-md cursor-pointer sort" onClick={() => handleSort('gstin')}>
            GST Number
          </div>
        </Col>
      </Row>
      {/* List Header End */}

      {data?.getAllSellers?.length > 0 &&
        data.getAllSellers.map((seller) => (
          <Card key={seller.id} className="mb-2 hover-border-primary">
            <Card.Body className="pt-0 pb-0 sh-30 sh-lg-8 fw-bold">
              <Row className="g-0 h-100 align-content-center">
                <Col xs="11" lg="3" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-1 order-lg-1 ">
                  <div className="text-dark text-small d-lg-none">Email</div>
                  <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip-top">Get details</Tooltip>}>
                    <NavLink to={`/admin/seller/detail/${seller.id}`} className="text-truncate h-100 d-flex align-items-center">
                      {seller.email}
                    </NavLink>
                  </OverlayTrigger>
                </Col>
                <Col xs="4" lg="4" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-4 order-lg-2">
                  <div className="text-dark text-small d-lg-none">Company Name</div>
                  <div className="text-alternate">{seller.companyName}</div>
                </Col>
                <Col xs="12" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-3 order-lg-3 align-items-lg-center">
                  <div className="text-dark text-small d-lg-none">Mobile No</div>
                  <div className="text-alternate">{seller.mobileNo}</div>
                </Col>
                <Col xs="8" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-last order-lg-4 align-items-lg-center">
                  <div className="text-dark text-small d-lg-none">GST No.</div>
                  <div className="text-alternate">{seller.gstin}</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))}

      {/* Pagination Start */}
      {data && (
        <div className="d-flex justify-content-center mt-5">
          <Pagination>
            <Pagination.Prev className="shadow" onClick={() => handlePageChange(Math.max(offset - limit, 0))} disabled={offset === 0}>
              <CsLineIcons icon="chevron-left" />
            </Pagination.Prev>
            <Pagination.Next className="shadow" onClick={() => handlePageChange(offset + limit)} disabled={data.getAllSellers?.length < limit}>
              <CsLineIcons icon="chevron-right" />
            </Pagination.Next>
          </Pagination>
        </div>
      )}
      {/* Pagination End */}
    </>
  );
}
export default ListSeller;
