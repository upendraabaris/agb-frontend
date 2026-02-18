import React, { useEffect, useState } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { Row, Col, Button, Dropdown, Form, Card, Badge, Pagination, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import CheckAll from 'components/check-all/CheckAll';
import { useLazyQuery, gql, useQuery, useMutation } from '@apollo/client';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

const ListViewProduct = ({ history }) => {
  const title = 'TMT Product List';
  const description = 'Ecommerce TMT Product List Page';

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);
  const GET_ALL_TMT_MASTER = gql`
    query GetAllTMTSeriesProduct($sortOrder: String, $sortBy: String, $search: String, $limit: Int, $offset: Int) {
      getAllTMTSeriesProduct(sortOrder: $sortOrder, sortBy: $sortBy, search: $search, limit: $limit, offset: $offset) {
        id
        active
        images
        previewName
        brand_name
        thumbnail
        fullName
        sku
        section
        identifier
      }
    }
  `;

  const [getAllTMTSeriesProduct, { error, data, fetchMore, refetch }] = useLazyQuery(GET_ALL_TMT_MASTER);
  // const { error, data, refetch } = useQuery(GET_ALL_TMT_MASTER);

  if (error) {
    console.log(`GET_ALL_TMT_MASTER!!! : ${error.message}`);
  }
  // handle price with section difference

  const UPDATEPRICEBYSD = gql`
    mutation UpdateTMTPriceBySD($updateTmtPriceBySdId: ID, $price: Float) {
      updateTMTPriceBySD(id: $updateTmtPriceBySdId, price: $price) {
        id
      }
    }
  `;

  const [formData, setformData] = useState({ updateTmtPriceBySdId: '', price: null });
  const [modalView, setModalView] = useState(false);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('firstName');

  // const limit = 10;
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [UpdateTMTPriceBySD] = useMutation(UPDATEPRICEBYSD, {
    onCompleted: () => {
      toast.success('Price Updated successfully');
      setModalView(false);
      setformData({ updateTmtPriceBySdId: '', price: null });
    },
    onError: (err) => {
      console.log('UPDATEPRICEBYSD', err);
    },
  });

  const updatePrice = async (tmtID) => {
    setModalView(true);
    setformData((prevFormData) => ({
      ...prevFormData,
      updateTmtPriceBySdId: tmtID,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    await UpdateTMTPriceBySD({
      variables: formData,
    });
  };

  const UPDATE_TMT_SERIES_PRODUCT = gql`
    mutation UpdateTMTSereiesProduct($updateTmtSereiesProductId: ID, $active: Boolean) {
      updateTMTSereiesProduct(id: $updateTmtSereiesProductId, active: $active) {
        id
      }
    }
  `;

  const [UpdateTMTSereiesProduct] = useMutation(UPDATE_TMT_SERIES_PRODUCT, {
    onCompleted: () => {
      toast('Product Updated Successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went Wrong!'); 
    },
  });

  const liveThisProduct = async (e, id) => {
    const { checked } = e.target;

    await UpdateTMTSereiesProduct({
      variables: {
        updateTmtSereiesProductId: id,
        active: checked,
      },
    });
    refetch();
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
    getAllTMTSeriesProduct({ variables: { offset, limit, sortBy, sortOrder } });
    refetch();
    // Execute the getUsers function when the component mounts
  }, [getAllTMTSeriesProduct, offset, limit, sortBy, sortOrder]);

  const handleSearch = () => {
    getAllTMTSeriesProduct({ variables: { search: debouncedSearch || undefined, limit, offset } });
  };

  const handleSort = (event) => {
    setSortBy(event);
    if (sortOrder === 'asc') {
      setSortOrder('dsc');
    } else {
      setSortOrder('asc');
    }

    getAllTMTSeriesProduct({
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
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
          </Col>
          {/* Title End */}
        </Row>
      </div>

      <Row className="m-0 mb-2 p-1 rounded bg-white align-items-center">
        <Col md="6" lg="12" className="mb-1 d-flex">
          <div className="w-50 d-flex align-items-center">
            <h5 className="fw-bold fs-5 ps-2 pt-2" id="title">
              {title}
            </h5>
          </div>
          <div className="w-50">
            <div className="d-flex align-items-center w-100">
              <Form.Control
                id="userSearch"
                type="text"
                placeholder="Search by Product Name, Brand."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
                className="me-2"
              />
              <span className="search-magnifier-icon" onClick={handleSearch}>
                <CsLineIcons icon="search" />
              </span>
            </div>
          </div>
        </Col>
      </Row>


      {/* List Header Start */}
      <Row className="g-0 h-100 align-content-center d-none d-lg-flex fw-bold p-3 bg-white mb-1 rounded ps-5 pe-5 mb-2">
        <Col xs="auto" className="sw-11 d-none d-lg-flex" />
        <Col>
          <Row className="g-0 h-100 align-content-center custom-sort ps-5 pe-4 h-100">
            <Col xs="3" className="d-flex flex-column mb-lg-0 pe-3 d-flex">
              <div className="text-dark text-md cursor-pointer sort">Product Name</div>
            </Col>
            <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-dark text-md cursor-pointer sort">Brand</div>
            </Col>
            <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-dark text-md cursor-pointer sort">View Product</div>
            </Col>
            <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-dark text-md cursor-pointer sort">Status</div>
            </Col>
          </Row>
        </Col>
      </Row>
      {/* List Header End */}

      {/* Single Card Begins Here */}
      {data &&
        data.getAllTMTSeriesProduct?.map((product) => (
          <Card key={product.id} className="mb-2">
            <Row className="g-0 h-100 sh-lg-9 position-relative">
              <Col xs="4" lg="1" className="position-relative h-100">
                <NavLink className="d-block h-100 p-1" to="#/!">
                  <img src={product.thumbnail || (product.images && product.images[0])} alt="product" className="mh-100 border" />
                </NavLink>
              </Col>
              <Col className="py-4 py-lg-0 px-1 ps-lg-5 pe-lg-4  h-100">
                <Row className="g-0 h-100 align-content-center mx-1 px-1">
                  <Col xs="12" lg="3" className="d-flex flex-column mb-lg-0 mb-3 pe-3 d-flex order-1 h-lg-100 justify-content-center">
                    <div className="text-muted text-small d-lg-none mb-1">Product Name</div>
                    <NavLink to={`/product/${product.identifier.replace(/\s/g, '_').toLowerCase()}`}>
                      {product.previewName}
                      <div className="text-small text-muted text-truncate">#{product.sku}</div>
                    </NavLink>
                  </Col>
                  <Col lg="3" xs="12" className="d-flex flex-column mb-2 mb-lg-0 justify-content-center order-3">
                    <div className="text-muted text-small d-lg-none mb-1">Brand Name</div>
                    <div className="lh-1 text-alternate">{product.brand_name}</div>
                  </Col>
                  <Col lg="3" xs="8" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-4">
                    <div className="text-muted text-small d-lg-none mb-1">Action</div>
                    <div>
                      <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">View Product </Tooltip>}>
                        <div className="d-inline-block me-2">
                          <NavLink
                            to={`/product/${product.identifier.replace(/\s/g, '_').toLowerCase()}`}
                            className="text-truncate h-100 d-flex align-items-center"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <CsLineIcons icon="eye" />
                          </NavLink>
                        </div>
                      </OverlayTrigger>
                    </div>
                  </Col>
                  <Col lg="2" xs="4" className="d-flex flex-column pe-1 mb-2 mb-lg-0 align-items-start justify-content-center order-5">
                    <div className="text-muted text-small d-lg-none mb-1">Status</div>
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

      {/* Single Card Ends Here */}
    </>
  );
};

export default withRouter(ListViewProduct);
