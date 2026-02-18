import React, { useEffect, useState } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { Row, Col, Button, Dropdown, Form, Card, Pagination, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import CheckAll from 'components/check-all/CheckAll';
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';

const GET_ALL_SERIES_PRODUCT = gql`
  query GetAllSeriesProduct($sortOrder: String, $sortBy: String, $search: String, $limit: Int, $offset: Int) {
    getAllSeriesProduct(sortOrder: $sortOrder, sortBy: $sortBy, search: $search, limit: $limit, offset: $offset) {
      id
      images
      active
      previewName
      thumbnail
      brand_name
      fullName
      sku
      seriesType
      identifier
    }
  }
`;

const DELETE_SERIES_PRODUCT = gql`
  mutation DeleteSeriesProduct($deleteSeriesProductId: ID!) {
    deleteSeriesProduct(id: $deleteSeriesProductId) {
      id
    }
  }
`;

const ADD_SERIES_VARIANT = gql`
  mutation AddSeriesVariant($seriesvariant: [SeriesVariantInput], $addSeriesVariantId: ID) {
    addSeriesVariant(seriesvariant: $seriesvariant, id: $addSeriesVariantId) {
      fullName
      seriesvariant {
        variantName
      }
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

function ListSeries({ history }) {
  const title = 'Single Product Multiple Seller';
  const description = 'Single Product Multiple Seller';
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const [getAllSeriesProduct, { error, data, fetchMore, refetch }] = useLazyQuery(GET_ALL_SERIES_PRODUCT);

  const [deleteModalView, setDeleteModalView] = useState(false);
  const [deleteSeriesProductName, setDeleteSeriesProductName] = useState('');
  const [deleteseriesProductId, setDeleteSeriesProductId] = useState('');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('firstName');

  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [DeleteSeriesProduct] = useMutation(DELETE_SERIES_PRODUCT, {
    onCompleted: () => {
      toast('Deleted successfully!');
      setDeleteModalView(false);
      refetch();
      setDeleteSeriesProductName('');
      setDeleteSeriesProductId('');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!'); 
    },
  });

  const deleteSeriesProduct = (tmtId, tmtfullName) => {
    setDeleteModalView(true);
    setDeleteSeriesProductId(tmtId);
    setDeleteSeriesProductName(tmtfullName);
  };

  const deleteSeriesEntry = async () => {
    if (deleteseriesProductId) {
      await DeleteSeriesProduct({
        variables: {
          deleteSeriesProductId: deleteseriesProductId,
        },
      });
    } else {
      toast.error('Something went wrong in Delete TMT Series!');
    }
  };

  const [UpdateSeriesProduct] = useMutation(UPDATE_SERIES_PRODUCT, {
    onCompleted: () => {
      toast.success('Active status changed Successfully!');
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
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [search]);

  useEffect(() => {
    getAllSeriesProduct({ variables: { offset, limit, sortBy, sortOrder } });
    refetch();
  }, [getAllSeriesProduct, offset, limit, sortBy, sortOrder]);

  const handleSearch = () => {
    getAllSeriesProduct({ variables: { search: debouncedSearch || undefined, limit, offset } });
  };

  const handleSort = (event) => {
    setSortBy(event);
    if (sortOrder === 'asc') {
      setSortOrder('dsc');
    } else {
      setSortOrder('asc');
    }

    getAllSeriesProduct({
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

  const [show, setShow] = useState(false);
  const [variantName, setVariantName] = useState('');
  const [hsn, setHsn] = useState('');

  const [addSeriesVariantMutation, { loading }] = useMutation(ADD_SERIES_VARIANT, {
    onCompleted: () => {
      toast.success('Variant added successfully!');
      setVariantName('');
      setHsn('');
      setShow(false);
      if (refetch) refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Error while adding variant');
      console.error('ADD_SERIES_VARIANT ERROR:', err);
    },
  });

  const [currentSeriesId, setCurrentSeriesId] = useState(null);
  const [currentProductName, setCurrentProductName] = useState('');

  const handleClose = () => setShow(false);
  const handleShow = (product) => {
    setCurrentSeriesId(product.id);
    setCurrentProductName(product.previewName || product.fullName || '');
    setShow(true);
  };

  const handleSave = () => {
    if (!variantName || !hsn) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!currentSeriesId) {
      toast.error('Series ID not found!');
      return;
    }

    const seriesVariantInput = [
      {
        variantName,
        hsn,
        serieslocation: [{}],
        active: null,
        moq: null,
        silent_features: null,
      },
    ];

    addSeriesVariantMutation({
      variables: {
        seriesvariant: [
          {
            variantName,
            hsn,
            serieslocation: [{}],
            active: null,
            moq: null,
            silent_features: null,
          },
        ],
        addSeriesVariantId: currentSeriesId,
      },
    });
  };

  return (
    <>
      <style>{`
        .custom-tooltip .tooltip-inner {
          background-color: #000 !important;
          color: #fff !important;
        }
        .custom-tooltip.bs-tooltip-top .tooltip-arrow::before,
        .custom-tooltip.bs-tooltip-bottom .tooltip-arrow::before,
        .custom-tooltip.bs-tooltip-start .tooltip-arrow::before,
        .custom-tooltip.bs-tooltip-end .tooltip-arrow::before {
          background-color: #000 !important;
        }
      `}</style>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-2">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <span className="align-middle text-dark ms-1">Dashboard</span>
            </NavLink>
            <span className="text-dark text-small ps-2"> / </span>
            <span className="align-middle text-dark ms-1">Multiple Seller Product List</span>
          </Col>
        </Row>
      </div>
      <div className="mb-3">
        <Row className="g-2 align-items-center justify-content-between">
          <Col md="6">
            <h5 className="fw-bold fs-5 ps-2 pt-2">Multiple Seller Product List</h5>
          </Col>
          <Col xs={12} md={6} lg={4}>
            <div className="search-input-container w-100 shadow bg-foreground position-relative">
              <Form.Control
                id="userSearch"
                type="text"
                placeholder="Search by Product Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <span
                className="search-magnifier-icon position-absolute end-0 top-50 translate-middle-y me-3"
                onClick={handleSearch}
                style={{ cursor: 'pointer' }}
              >
                <CsLineIcons icon="search" />
              </span>
            </div>
          </Col>

          {/* Add Series Product Button */}
          <Col xs={12} md="auto" className="text-md-end">
            <Button variant="outline-primary" onClick={() => history.push('/admin/product/multipleseller')} className="btn-icon btn-icon-start w-100 w-md-auto">
              <span>Add New Product</span>
            </Button>
          </Col>
        </Row>
      </div>
      {/* List Header Start */}
      <Row className="g-0 h-100 align-content-center d-none d-lg-flex fw-bold p-3 bg-white mb-1 rounded ps-5 pe-5 mb-2">
        <Col>
          <Row className="g-0 h-100 align-content-center custom-sort ps-5 pe-4 h-100">
            <Col xs="3" className="d-flex flex-column mb-lg-0 pe-3 d-flex">
              <div className="text-dark text-md cursor-pointer text-center">Product Full Name</div>
            </Col>
            <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-dark text-md cursor-pointer text-center">Brand</div>
            </Col>
            <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-dark text-md cursor-pointer text-center">Action</div>
            </Col>
            <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-dark text-md cursor-pointer ">Status</div>
            </Col>
          </Row>
        </Col>
      </Row>
      {/* List Header End */}
      {data && data.getAllSeriesProduct?.length > 0 ? (
        data.getAllSeriesProduct
          .filter((product) => product.seriesType === 'multiseller')
          .map((product) => (
            <Card key={product.id} className="mb-2">
              <Row className="g-0 h-100 sh-lg-9 position-relative">
                <Col xs="4" lg="1" className="position-relative h-100">
                  <NavLink to={`/product/${product.identifier.replace(/\s/g, '_').toLowerCase()}`} className="d-block h-100">
                    <img src={product.thumbnail || product.images[0]} alt="product" className="card-img card-img-horizontal sw-11 mh-100" />
                  </NavLink>
                </Col>
                <Col className="py-4 py-lg-0 px-1 ps-lg-5 pe-lg-4 h-100">
                  <Row className="g-0 h-100 align-content-center mx-1 px-1">
                    <Col xs="12" lg="3" className="d-flex flex-column mb-lg-0 mb-3  d-flex order-1 h-lg-100 justify-content-center">
                      <div className="text-muted text-small d-lg-none">Product Full Name</div>
                      <NavLink className="text-truncate" to={`/product/${product.identifier.replace(/\s/g, '_').toLowerCase()}`} title={product.fullName}>
                        {product.fullName}
                        <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">List</Tooltip>}>
                          <div className="d-inline-block me-2">
                            <NavLink className="btn-icon btn-icon-only shadow" to={`/admin/product/seriesproductdetail/${product.id}`}>
                              <CsLineIcons icon="content" className="text-primary" size="17" />
                            </NavLink>
                          </div>
                        </OverlayTrigger>
                        <div className="text-small text-muted text-truncate">#{product.sku}</div>
                      </NavLink>
                    </Col>
                    <Col xs="12" lg="3" className="d-flex flex-column  mb-2 mb-lg-0 justify-content-center order-3">
                      <div className="text-muted text-small d-lg-none">Brand</div>
                      <div className="lh-1 text-alternate">{product.brand_name}</div>
                    </Col>
                    <Col xs="8" lg="3" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-4">
                      <div className="text-muted text-small d-lg-none mb-1">Actions</div>
                      <div>
                        <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Add Variant</Tooltip>}>
                          <div className="d-inline-block me-2">
                            <NavLink
                              to={`/admin/Product/VariantName/${product.id}`}
                              state={{ product }} // 👈 send product along with navigation
                              className="p-0 m-0 border-0 bg-transparent shadow-none"
                            >
                              <Button variant="link" className="p-0 m-0 border-0 bg-transparent shadow-none">
                                <CsLineIcons icon="plus" className="text-primary" size="20" />
                              </Button>
                            </NavLink>
                          </div>
                        </OverlayTrigger>
                        <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Edit</Tooltip>}>
                          <div className="d-inline-block me-2">
                            <NavLink className="btn-icon btn-icon-only shadow" to={`/admin/product/seriesdetail/${product.id}`}>
                              <CsLineIcons icon="edit-square" className="text-primary" size="17" />
                            </NavLink>
                          </div>
                        </OverlayTrigger>
                        <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Delete Product</Tooltip>}>
                          <div className="d-inline-block me-2">
                            <Button
                              variant="foreground-alternate"
                              className="btn-icon btn-icon-only shadow"
                              onClick={() => {
                                deleteSeriesProduct(product.id, product.fullName);
                              }}
                            >
                              <CsLineIcons icon="bin" className="text-primary" size="17" />
                            </Button>
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
          ))
      ) : (
        <div className="text-center mt-1 bg-white p-4">
          <h5>No Products Found</h5>
        </div>
      )}
      {/* Pagination Start */}
      <div className="d-flex justify-content-center mt-5">
        <Pagination>
          <Pagination.Prev className="shadow" disabled>
            <CsLineIcons icon="chevron-left" />
          </Pagination.Prev>
          <Pagination.Next className="shadow">
            <CsLineIcons icon="chevron-right" />
          </Pagination.Next>
        </Pagination>
      </div>
      {/* Pagination End */}
      <Modal show={deleteModalView} onHide={() => setDeleteModalView(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Product</Modal.Title>
        </Modal.Header>

        <Modal.Body>Are you really want to delete {deleteSeriesProductName} ?</Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setDeleteModalView(false);
            }}
          >
            No
          </Button>
          <Button variant="primary" onClick={() => deleteSeriesEntry()}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Popup (Modal) */}
      {/* Variant Modal */}
      {/* <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Add Variant {currentProductName ? `for ${currentProductName}` : ''} {currentSeriesId ? `(ID: ${currentSeriesId})` : ''}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="variantName">
              <Form.Label className="fw-bold text-dark">
                Variant Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control type="text" placeholder="Enter variant name" value={variantName} onChange={(e) => setVariantName(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="hsn">
              <Form.Label className="fw-bold text-dark">
                HSN <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control type="text" placeholder="Enter HSN number" value={hsn} onChange={(e) => setHsn(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal> */}
    </>
  );
}
export default withRouter(ListSeries);
