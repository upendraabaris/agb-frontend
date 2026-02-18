import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Row, Col, Form, Pagination, Table, Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { gql, useLazyQuery } from '@apollo/client';

function ListSeller() {
  const title = 'Seller Associate';
  const description = 'Seller Associate';
  const dispatch = useDispatch();
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(100);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('email');
  const [loading, setLoading] = useState(false);

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
        pancardNo
        gstinComposition
        mobileNo
        sellerAssociate
      }
    }
  `;

  const [getAllSeller, { error, data, fetchMore, refetch, loading: queryLoading }] = useLazyQuery(GET_ALL_SELLERS, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    getAllSeller();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSort = (event) => {
    setSortBy(event);
    setSortOrder(sortOrder === 'asc' ? 'dsc' : 'asc');

    getAllSeller({
      variables: {
        limit,
        offset,
        sortBy: event,
        sortOrder: sortOrder === 'asc' ? 'dsc' : 'asc',
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
    setLoading(true);
    getAllSeller({ variables: { search: debouncedSearch || null, offset, limit, sortBy, sortOrder } }).finally(() => {
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllSeller, offset, limit, sortBy, sortOrder, debouncedSearch]);

  const handleSearch = () => {
    getAllSeller({ variables: { search: debouncedSearch || null, limit, offset } });
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
      <div className="page-title-container mb-2">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <span className="align-middle text-dark ms-1">Dashboard</span>
            </NavLink>
            <span className="text-dark text-small ps-2"> / </span>
            <span className="align-middle text-dark ms-1">Seller Associate</span>
          </Col>
        </Row>
      </div>

      <Row className="m-0 mb-2 p-1 rounded bg-white align-items-center">
        <Col md="6">
          <span className="fw-bold fs-5 ps-2 pt-2">Seller Associate</span>
          <span className="small ps-2">({data?.getAllSellers?.filter((seller) => seller.sellerAssociate === true)?.length || 0})</span>
        </Col>
        <Col md="6" className="d-flex justify-content-end">
          <div className="d-inline-block search-input-container border w-100 shadow bg-foreground position-relative">
            <Form.Control
              id="userSearch"
              type="text"
              placeholder="Search by Email, Firm Name and Mobile No."
              value={search}
              onKeyPress={handleKeyPress}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="position-absolute top-50 end-0 translate-middle-y pe-3" onClick={handleSearch}>
              <CsLineIcons icon="search" />
            </span>
          </div>
        </Col>
      </Row>

      <div className="table-responsive">
        <Table bordered hover className="align-middle bg-white">
          <thead>
            <tr>
              <th className="cursor-pointer sort" onClick={() => handleSort('companyName')}>
                Firm Name <CsLineIcons icon="filter" width="12px" />
              </th>
              <th className="cursor-pointer sort" onClick={() => handleSort('email')}>
                Email <CsLineIcons icon="filter" width="12px" />
              </th>
              <th className="cursor-pointer sort" onClick={() => handleSort('mobileNo')}>
                Mobile No. <CsLineIcons icon="filter" width="12px" />
              </th>
              <th className="cursor-pointer sort" onClick={() => handleSort('gstin')}>
                GST <CsLineIcons icon="filter" width="12px" />
              </th>
              <th className="cursor-pointer sort" onClick={() => handleSort('gstin')}>
                PAN <CsLineIcons icon="filter" width="12px" />
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center">
                  <Spinner animation="border" />
                </td>
              </tr>
            ) : (
              <>
                {data?.getAllSellers?.filter((seller) => seller.sellerAssociate === true)?.length > 0 ? (
                  data.getAllSellers
                    .filter((seller) => seller.sellerAssociate === true)
                    .map((seller) => (
                      <tr key={seller.id}>
                        <td>{seller.companyName}</td>
                        <td>
                          <NavLink to={`/admin/seller/detail/${seller.id}`}>{seller.email}</NavLink>
                        </td>
                        <td>{seller.mobileNo}</td>
                        <td>
                          {seller.gstin && (
                            <div>
                              {seller.gstin}
                              {seller.gstinComposition && <div>Composition ✅</div>}
                            </div>
                          )}
                        </td>
                        <td>{!seller.gstin && seller.pancardNo && <div>{seller.pancardNo}</div>}</td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-dark fw-bold bg-white p-6 rounded">
                      <strong>Seller Associate Not Found</strong>
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
            <Pagination.Next className="shadow" onClick={() => handlePageChange(offset + limit)} disabled={data.getAllSellers?.length < limit}>
              <CsLineIcons icon="chevron-right" />
            </Pagination.Next>
          </Pagination>
        </div>
      )}
    </>
  );
}

export default ListSeller;
