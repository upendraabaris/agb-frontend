import React, { useState, useEffect } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { Row, Col, Button, Dropdown, Form, Card, Modal, Pagination, Tooltip, OverlayTrigger, Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { toast } from 'react-toastify';

const GET_PRODUCT_BY_FOR_SELLER = gql`
  query GetProductByForSeller($search: String, $offset: Int, $limit: Int, $sortBy: String, $sortOrder: String) {
    getProductByForSeller(search: $search, offset: $offset, limit: $limit, sortBy: $sortBy, sortOrder: $sortOrder) {
      approve
      fullName
      id
      images
      previewName
      thumbnail
      active
      brand_name
      sku
      identifier
    }
  }
`;

const DELETE_INDIVIDUAL_PRODUCT = gql`
  mutation DeleteProduct($deleteProductId: ID!) {
    deleteProduct(id: $deleteProductId) {
      id
    }
  }
`;

const ACTIVE_PRODUCT = gql`
  mutation ActiveProduct($activeProductId: ID, $active: Boolean) {
    activeProduct(id: $activeProductId, active: $active) {
      id
    }
  }
`;

const ListViewProduct = () => {
  const title = 'Individual Products';
  const description = 'Ecommerce Individual Product List Page';
  const history = useHistory();
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(50);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('fullName');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const [getProduct, { loading, data, fetchMore, refetch }] = useLazyQuery(GET_PRODUCT_BY_FOR_SELLER, {
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
    const variables = {
      offset,
      limit,
      sortBy,
      sortOrder,
    };

    if (debouncedSearch) {
      variables.search = debouncedSearch;
    }

    getProduct({ variables });
  }, [debouncedSearch, offset, limit, sortBy, sortOrder]);

  const handleSearch = (searchTerm) => {
    setSearch(searchTerm);
  };

  const handleSort = (event) => {
    setSortBy(event);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    getProduct({
      variables: {
        limit,
        offset,
        sortBy: event,
        sortOrder: sortOrder === 'asc' ? 'desc' : 'asc',
      },
    });
  };

  const handlePageChange = (newOffset) => {
    setOffset(newOffset);
    fetchMore({
      variables: { offset: newOffset },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const goToProduct = (type) => {
    if (type === 'simple') {
      history.push('/seller/product/add?type=simple');
    } else if (type === 'variant') {
      history.push('/seller/product/addvariant?type=variant');
    }
    handleClose();
  };

  const [deleteModalView, setDeleteModalView] = useState(false);
  const [deleteProductName, setDeleteProductName] = useState('');
  const [deleteIndividualProductId, setDeleteIndividualProductId] = useState('');

  const [DeleteProduct] = useMutation(DELETE_INDIVIDUAL_PRODUCT, {
    onCompleted: () => {
      toast('Deleted successfully!');
      setDeleteModalView(false);
      refetch();
      setDeleteProductName('');
      setDeleteIndividualProductId('');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });

  const deleteProduct = (prodId, prodfullName) => {
    setDeleteModalView(true);
    setDeleteIndividualProductId(prodId);
    setDeleteProductName(prodfullName);
  };

  const deleteProductEntry = async () => {
    if (deleteIndividualProductId) {
      await DeleteProduct({
        variables: {
          deleteProductId: deleteIndividualProductId,
        },
      });
    } else {
      toast.error('Something went wrong in DELETE_INDIVIDUAL_PRODUCT!');
    }
  };

  const [ActiveProduct] = useMutation(ACTIVE_PRODUCT, {
    onCompleted: () => {
      toast('Product Updated Successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went Wrong!');
    },
  });

  const liveThisProduct = async (e, id) => {
    const { checked } = e.target;

    await ActiveProduct({
      variables: {
        activeProductId: id,
        active: checked,
      },
    });
    refetch();
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/seller/dashboard">
              <span className="text-dark ms-1">SA Dashboard</span>
            </NavLink>

            <spna className="small p-2"> / </spna>
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/seller/product/individualProducts">
              <span className="text-dark ms-1">{title}</span>
            </NavLink>

            <spna className="small p-2"> / </spna>
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/seller/product/list">
              <span className="text-dark ms-1">Single Seller Products List</span>
            </NavLink>
          </Col>

          <Col xs="12" sm="auto" className="d-flex align-items-end justify-content-end mb-2 mb-sm-0 order-sm-3">
            <Button variant="outline-primary" onClick={handleShow} className="btn-icon btn-icon-start ms-0 ms-sm-1 w-100 w-md-auto">
              <span>Add Product</span>
            </Button>
          </Col>

          <Modal show={show} onHide={handleClose} centered dialogClassName="modal-sm">
            <Modal.Header style={{ backgroundColor: '#3f80c5ff' }} className="justify-content-center">
              <Modal.Title className="fw-bold text-white">Select Product Type</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              <div className="d-grid gap-3">
                <Button variant="outline-primary" size="lg" className="fw-semibold" onClick={() => goToProduct('simple')}>
                  Product without Variant
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-top" className="custom-tooltip">
                        For single-version products without different sizes, colors, or styles.
                      </Tooltip>
                    }
                  >
                    <div className="d-inline-block ms-2">
                      <CsLineIcons icon="info-hexagon" size="17" />
                    </div>
                  </OverlayTrigger>
                </Button>
                <Button variant="outline-success" size="lg" className="fw-semibold" onClick={() => goToProduct('variant')}>
                  Product with Variant
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-top" className="custom-tooltip">
                        For products with multiple options like size, color, or style — each with its own details.
                      </Tooltip>
                    }
                  >
                    <div className="d-inline-block ms-2">
                      <CsLineIcons icon="info-hexagon" size="17" />
                    </div>
                  </OverlayTrigger>
                </Button>
              </div>
            </Modal.Body>
          </Modal>
        </Row>
      </div>
      <Row className="mb-0">
        <Col md="5" lg="6" xxl="2" className="mb-1">
          <div className="d-inline-block float-md-start me-1 mb-1 search-input-container shadow bg-foreground" style={{ width: '500px' }}>
            <Form.Control type="text" placeholder="Search by Product Full Name and Brand" value={search} onChange={(e) => handleSearch(e.target.value)} />
            <span className="search-magnifier-icon" onClick={() => handleSearch(search)}>
              <CsLineIcons icon="search" />
            </span>
          </div>
        </Col>
        <Col md="7" lg="6" xxl="10" className="mb-1 text-end">
          <Dropdown onSelect={(e) => setLimit(parseInt(e, 10))} align={{ xs: 'end' }} className="d-inline-block ms-1">
            <OverlayTrigger delay={{ show: 1000, hide: 0 }} placement="top" overlay={<Tooltip id="tooltip-top">Item Count</Tooltip>}>
              <Dropdown.Toggle variant="foreground-alternate" className="shadow sw-15">
                {limit} Products
              </Dropdown.Toggle>
            </OverlayTrigger>
            <Dropdown.Menu className="shadow dropdown-menu-end">
              <Dropdown.Item eventKey="100">100 Products</Dropdown.Item>
              <Dropdown.Item eventKey="200">200 Products</Dropdown.Item>
              <Dropdown.Item eventKey="500">500 Products</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>
      <div className="mb-2 text-end w-100">
        <NavLink className="pb-1 d-inline-block hidden breadcrumb-back" to="/seller/product/updateVariantPricesBySeller">
          <span className="text-primary ms-1">Bulk Price Update</span>
        </NavLink>
        {' | '}
        <NavLink className="pb-1 d-inline-block hidden breadcrumb-back" to="/seller/product/updateVariantDiscountBySeller">
          <span className="text-primary ms-1">Bulk Discount Update</span>
        </NavLink>
        {' | '}
        <NavLink className="pb-1 d-inline-block hidden breadcrumb-back" to="/seller/product/updateVariantStockBySeller">
          <span className="text-primary ms-1">Bulk Stock Update</span>
        </NavLink>
        {' | '}
        <NavLink className="pb-1 d-inline-block hidden breadcrumb-back" to="/seller/product/productReview">
          <span className="text-primary ms-1">Review</span>
        </NavLink>
      </div>
      <Row className="g-0 mb-2 d-none d-lg-flex p-2 bg-white rounded">
        <Col xs="auto" className="sw-11 d-none d-lg-flex" />
        <Col>
          <Row className="g-0 h-100 align-content-center custom-sort ps-5 pe-4 h-100">
            <Col xs="3" lg="5" className="d-flex flex-column mb-lg-0 pe-3 d-flex">
              <div className="text-dark cursor-pointer sort" onClick={() => handleSort('fullName')}>
                Product Full Name
              </div>
            </Col>
            <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-dark text-center cursor-pointer sort" onClick={() => handleSort('brand_name')}>
                Brand
              </div>
            </Col>
            <Col xs="2" lg="2" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-dark text-center cursor-pointer">Action</div>
            </Col>
            <Col xs="2" lg="1" className="d-flex flex-column pe-1 text-center">
              <div className="text-dark text-center cursor-pointer" onClick={() => handleSort('approve')}>
                Approved
              </div>
            </Col>
          </Row>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        data &&
        (data.getProductByForSeller.length > 0 ? (
          <>
            {data.getProductByForSeller
              ?.slice(0)
              .reverse()
              .map((product) => (
                <Card key={product.id} className="mb-2 hover-border-primary">
                  <Row className="g-0 h-100 sh-lg-9 position-relative">
                    <Col xs="1" className="position-relative p-2 h-100">
                      <NavLink to="#/!" className="d-block h-100">
                        <img
                          src={product.thumbnail || (product.images && product.images[0])}
                          alt="product"
                          className="border rounded card-img-horizontal p-1"
                        />
                      </NavLink>
                    </Col>
                    <Col className="py-4 py-lg-0 ps-5 pe-4 h-100">
                      <Row className="g-0 h-100 align-content-center">
                        <Col xs="11" lg="5" className="d-flex flex-column mb-lg-0 mb-3 pe-3 d-flex order-1 h-lg-100 justify-content-center">
                          <NavLink
                            to={`/product/${product.identifier.replace(/\s/g, '_').toLowerCase()}`}
                            target="_blank"
                            title={product.fullName}
                            className="fw-bold text-truncate"
                          >
                            {product.fullName}
                          </NavLink>
                        </Col>
                        <Col lg="3" className="d-flex flex-column pe-1 mb-2 mb-lg-0 justify-content-center order-3">
                          <div className="lh-1 text-center fw-bold text-truncate">{product.brand_name}</div>
                        </Col>
                        <Col xs="6" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-4">
                          <div className="text-small d-lg-none mb-1">Action</div>
                          <div>
                            <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Edit Product Details</Tooltip>}>
                              <div className="d-inline-block me-2">
                                <NavLink
                                  className="btn-icon btn-icon-only shadow"
                                  to={`details/${product.identifier?.replace(/\s/g, '_').toLowerCase()}`}
                                  target="_blank"
                                >
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
                                    deleteProduct(product.id, product.fullName);
                                  }}
                                >
                                  <CsLineIcons icon="bin" className="text-primary" size="17" />
                                </Button>
                              </div>
                            </OverlayTrigger>
                            <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Live Product</Tooltip>}>
                              <div className="d-inline-block me-2">
                                <Col lg="1" className="d-flex flex-column pe-1 mb-2 mb-lg-0 align-items-start justify-content-center order-5">
                                  <Form.Check
                                    type="switch"
                                    name="active"
                                    checked={product.active || ''}
                                    id="quantitySwitch1"
                                    onChange={(e) => liveThisProduct(e, product.id)}
                                  />
                                </Col>
                              </div>
                            </OverlayTrigger>
                          </div>
                        </Col>
                        <Col lg="1" className="d-flex flex-column justify-content-center align-items-center mb-2 mb-lg-0 order-4 col-lg-1 col-6">
                          <span className={`badge rounded-pill px-3 py-2 fw-semibold ${product.approve ? 'bg-success' : 'bg-danger'}`}>
                            {product.approve ? '✔ Approved' : '⛔ Not Approved'}
                          </span>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card>
              ))}
          </>
        ) : (
          <div className="text-center mt-5 fw-bold text-muted">Product not found</div>
        ))
      )}

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
      <Modal show={deleteModalView} onHide={() => setDeleteModalView(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you really want to delete {deleteProductName} ?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setDeleteModalView(false);
            }}
          >
            No
          </Button>
          <Button variant="primary" onClick={() => deleteProductEntry()}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ListViewProduct;
