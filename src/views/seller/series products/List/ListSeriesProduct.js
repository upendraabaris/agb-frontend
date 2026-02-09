import React, { useState, useEffect } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { Row, Col, Badge, Button, Dropdown, Form, Card, Pagination, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import CheckAll from 'components/check-all/CheckAll';
import { useQuery, gql, useMutation, useLazyQuery } from '@apollo/client';
import { toast } from 'react-toastify';

const GET_ALL_SERIES_PRODUCTS = gql`
  query GetAllSeriesProduct {
    getAllSeriesProduct {
      id
      images
      previewName
      active
      thumbnail
      brand_name
      fullName
      sku
      identifier
      seriesType
    }
  }
`;

const UPDATE_SERIES_PRODUCT = gql`
  mutation UpdateSeriesProduct($updateSeriesProductId: ID, $active: Boolean) {
    updateSeriesProduct(id: $updateSeriesProductId, active: $active) {
      id
    }
  }
`;

function ListSeriesProduct({ history }) {
  const title = 'Series Products List';
  const description = 'Ecommerce Series Products List Page';
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('fullName');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  //   query GetSeriesProductByForSeller($search: String, $offset: Int, $limit: Int, $sortBy: String, $sortOrder: String) {
  //  getSeriesProductByForSeller(search: $search, offset: $offset, limit: $limit, sortBy: $sortBy, sortOrder: $sortOrder) {

  const [getSeriesProducts, { data, fetchMore, refetch }] = useLazyQuery(GET_ALL_SERIES_PRODUCTS, {
    onError: (error) => {
      if (error) {
        toast.error(error.message || 'Something went wrong !');
        if (error.message === 'Authorization header is missing' || error.message === 'jwt expired') {
          setTimeout(() => {
            history.push('/login');
          }, 2000);
        } 
      }
    },
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [search]);

  useEffect(() => {
    getSeriesProducts({ variables: { offset, limit, sortBy, sortOrder } });
    refetch();
    // Execute the getProduct function when the component mounts
  }, [getSeriesProducts, offset, limit, sortBy, sortOrder]);

  const handleSearch = () => {
    getSeriesProducts({ variables: { search: debouncedSearch || undefined, limit, offset } });
  };

  const handleSort = (event) => {
    setSortBy(event);
    if (sortOrder === 'asc') {
      setSortOrder('dsc');
    } else {
      setSortOrder('asc');
    }

    getSeriesProducts({
      variables: {
        limit,
        offset,
        sortBy,
        sortOrder,
      },
    });
  };

  // product live

  const [UpdateSeriesProduct] = useMutation(UPDATE_SERIES_PRODUCT, {
    onCompleted: () => {
      toast('Product Updated Successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went Wrong!'); 
    },
  });

  const liveThisProduct = async (e, id) => {
    const { checked } = e.target;

    await UpdateSeriesProduct({
      variables: {
        updateSeriesProductId: id,
        active: checked,
      },
    });
    refetch();
  };

  const handlePageChange = (newOffset) => {
    setOffset(newOffset);
    fetchMore({
      variables: { offset: newOffset },
    });
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/seller/dashboard">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Dashboard</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
          </Col>
          {/* Title End */}

          {/* Top Buttons Start */}
          {/* Top Buttons End */}
        </Row>
      </div>

      <Row className="mb-3">
        <Col md="5" lg="3" xxl="2" className="mb-1">
          {/* Search Start */}
          <div className="d-inline-block float-md-start me-1 mb-1 search-input-container w-100 shadow bg-foreground">
            <Form.Control id="sellerSelect" type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
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

      {/* List Header Start */}
      <Row className="g-0 mb-2 d-none d-lg-flex">
        <Col xs="auto" className="sw-11 d-none d-lg-flex" />
        <Col>
          <Row className="g-0 h-100 align-content-center custom-sort ps-5 pe-4 h-100">
            <Col xs="3" className="d-flex flex-column mb-lg-0 pe-3 d-flex">
              <div className="text-muted text-small cursor-pointer sort" onClick={() => handleSort('fullName')}>
                PRODUCT FULL NAME
              </div>
            </Col>
            <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-muted text-small cursor-pointer sort" onClick={() => handleSort('brand_name')}>
                BRAND
              </div>
            </Col>
            <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-muted text-small cursor-pointer sort">ACTION</div>
            </Col>
            <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-muted text-small cursor-pointer sort" onClick={() => handleSort('approve')}>
                APPROVED
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
      {/* List Header End */}

      {data &&
        data.getAllSeriesProduct
          ?.filter((product) => product.seriesType === 'normal')
          .map((product) => (
            <Card key={product.id} className="mb-2">
              <Row className="g-0 h-100 sh-lg-9 position-relative">
                <Col xs="1" className="position-relative h-100">
                  <NavLink className="d-block h-100" to="#/!">
                    <img src={product.images[0]} alt="product" className="card-img card-img-horizontal sw-11 mh-100" />
                  </NavLink>
                </Col>
                <Col className="py-4 py-lg-0 ps-5 pe-4 h-100">
                  <Row className="g-0 h-100 align-content-center">
                    <Col xs="11" lg="3" className="d-flex flex-column mb-lg-0 mb-3 pe-3 d-flex order-1 h-lg-100 justify-content-center">
                      <NavLink to={`/product/${product.identifier.replace(/\s/g, '_').toLowerCase()}`} target="_blank">
                        {product.previewName}
                        <div className="text-small text-muted text-truncate">#{product.sku}</div>
                      </NavLink>
                    </Col>
                    <Col lg="3" className="d-flex flex-column pe-1 mb-2 mb-lg-0 justify-content-center order-3">
                      <div className="lh-1 text-alternate">{product.brand_name}</div>
                    </Col>
                    <Col xs="6" lg="3" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-4">
                      <div className="text-muted text-small d-lg-none mb-1">Action</div>
                      <div>
                        <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Add Series Variant</Tooltip>}>
                          <div className="d-inline-block me-2">
                            <NavLink className="btn-icon btn-icon-only shadow" to={`/seller/series/variant_list/${product.id}`}>
                              <CsLineIcons icon="edit-square" />
                            </NavLink>
                          </div>
                        </OverlayTrigger>
                      </div>
                    </Col>
                    {/* <Col lg="2" className="d-flex flex-column pe-1 mb-2 mb-lg-0 align-items-start justify-content-center order-5">
                    <h5>
                      <Badge bg="outline-primary">{product.id}</Badge>
                    </h5>
                  </Col> */}
                    <Col lg="2" className="d-flex flex-column pe-1 mb-2 mb-lg-0 align-items-start justify-content-center order-5">
                      <Form.Check
                        type="switch"
                        name="active"
                        id="quantitySwitch1"
                        checked={product.active || ''}
                        onChange={(e) => liveThisProduct(e, product.id)}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          ))}

      {/* Pagination Start */}
      {data && (
        <div className="d-flex justify-content-center mt-5">
          <Pagination>
            <Pagination.Prev className="shadow" onClick={() => handlePageChange(Math.max(offset - limit, 0))} disabled={offset === 0}>
              <CsLineIcons icon="chevron-left" />
            </Pagination.Prev>
            <Pagination.Next className="shadow" onClick={() => handlePageChange(offset + limit)} disabled={data.getProductByForSeller?.length < limit}>
              <CsLineIcons icon="chevron-right" />
            </Pagination.Next>
          </Pagination>
        </div>
      )}
      {/* Pagination End */}
    </>
  );
}

export default withRouter(ListSeriesProduct);
