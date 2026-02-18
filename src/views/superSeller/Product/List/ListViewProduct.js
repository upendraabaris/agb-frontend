import React, { useState, useEffect } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { Row, Col, Button, Dropdown, Form, Card, Modal, Pagination, Tooltip, OverlayTrigger, Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import CheckAll from 'components/check-all/CheckAll';
import { gql, useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { toast } from 'react-toastify';

const ListViewProduct = () => {
  const title = 'BA Products';
  const description = 'BA Products';
  const history = useHistory();
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(100);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('fullName');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const GET_PRODUCT_BY_FOR_SELLER = gql`
    query GetSuperProductBySuperId {
      getSuperProductBySuperId {
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
    onCompleted: (fetchedData) => {
      setProducts(fetchedData.getSuperProductBySuperId); // Store the fetched products in local state
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
    getProduct({ variables: { offset, limit, sortBy, sortOrder } });
    refetch();
    // Execute the getProduct function when the component mounts
  }, [getProduct, offset, limit, sortBy, sortOrder]);

  const handleSearch = (searchTerm) => {
    setSearch(searchTerm);
  };

  const filteredProducts = products.filter((product) => {
    const fullNameMatches = product.fullName?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const brandMatches = product.brand_name?.toLowerCase().includes(debouncedSearch.toLowerCase());
    return fullNameMatches || brandMatches;
  });

  useEffect(() => {
    if (debouncedSearch) {
      getProduct({ variables: { search: debouncedSearch, limit, offset } });
    } else {
      getProduct({ variables: { limit, offset } });
    }
  }, [debouncedSearch, getProduct, limit, offset]);

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
  };

  function handleClick() {
    history.push('/superSeller/product/add');
  }

  const DELETE_INDIVIDUAL_PRODUCT = gql`
    mutation DeleteSuperSellerProduct($deleteSuperSellerProductId: ID) {
      deleteSuperSellerProduct(id: $deleteSuperSellerProductId) {
        id
      }
    }
  `;

  // delete Product
  const [deleteModalView, setDeleteModalView] = useState(false);
  const [deleteProductName, setDeleteProductName] = useState('');
  const [deleteIndividualProductId, setDeleteIndividualProductId] = useState('');

  const [DeleteSuperSellerProduct] = useMutation(DELETE_INDIVIDUAL_PRODUCT, {
    onCompleted: () => {
      toast.error('Deleted successfully!');
      setDeleteModalView(false);
      refetch();
      setDeleteProductName('');
      setDeleteIndividualProductId('');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });

  const deleteSuperSellerProduct = (prodId, prodfullName) => {
    setDeleteModalView(true);
    setDeleteIndividualProductId(prodId);
    setDeleteProductName(prodfullName);
  };

  const deleteProductEntry = async () => {
    if (deleteIndividualProductId) {
      await DeleteSuperSellerProduct({
        variables: {
          deleteSuperSellerProductId: deleteIndividualProductId,
        },
      });
    } else {
      toast.error('Something went wrong in DELETE_INDIVIDUAL_PRODUCT!');
    }
  };

  const ACTIVE_PRODUCT = gql`
    mutation ActiveProduct($activeProductId: ID, $active: Boolean) {
      activeProduct(id: $activeProductId, active: $active) {
        id
      }
    }
  `;

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
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/superSeller/dashboard">
              <span className="text-dark ms-1">BA Dashboard</span>
            </NavLink>
            <spna className="small p-2"> / </spna>
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="#">
              <span className="text-dark ms-1">{title}</span>
            </NavLink>
          </Col>
          {/* Title End */}

          {/* Top Buttons Start */}
          <Col xs="12" sm="auto" className="d-flex align-items-end justify-content-end mb-2 mb-sm-0 order-sm-3">
            <Button variant="outline-primary" onClick={() => handleClick()} className="btn-icon btn-icon-start ms-0 ms-sm-1 w-100 w-md-auto">
              <span>Add Product</span>
            </Button>
          </Col>
          {/* Top Buttons End */}
        </Row>
      </div>

      <Row className="mb-3">
        <Col md="5" lg="6" xxl="2" className="mb-1">
          {/* Search Start */}
          <div className="d-inline-block float-md-start me-1 mb-1 search-input-container w-100 shadow bg-foreground">
            <Form.Control type="text" placeholder="Search by Product Full Name and Brand" value={search} onChange={(e) => handleSearch(e.target.value)} />
            <span className="search-magnifier-icon" onClick={() => handleSearch(search)}>
              <CsLineIcons icon="search" />
            </span>
          </div>
          {/* Search End */}
        </Col>
        <Col md="7" lg="6" xxl="10" className="mb-1 text-end">
          {/* Length Start */}
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
          {/* Length End */}
        </Col>
      </Row>

      {/* List Header Start */}
      <Row className="g-0 mb-2 d-none d-lg-flex p-2 bg-white rounded">
        <Col xs="auto" className="sw-11 d-none d-lg-flex" />
        <Col>
          <Row className="g-0 h-100 align-content-center custom-sort ps-5 pe-4 h-100">
            <Col xs="3" lg="5" className="d-flex flex-column mb-lg-0 pe-3 d-flex">
              <div className="text-dark" onClick={() => handleSort('fullName')}>
                Product Full Name
              </div>
            </Col>
            <Col xs="2" lg="2" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-dark text-center cursor-pointer " onClick={() => handleSort('brand_name')}>
                Brand
              </div>
            </Col>
            <Col xs="2" lg="2" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-dark text-center cursor-pointer">Action</div>
            </Col>
            <Col xs="2" lg="3" className="d-flex flex-column pe-1 text-center">
              <div className="text-dark text-center cursor-pointer" onClick={() => handleSort('approve')}>
                Approved
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
      {/* List Header End */}

      {/* Single Card Begins Here */}
      {loading && (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {!loading && filteredProducts.length === 0 && <div className="p-6 text-center rounded bg-white fw-bold">No products found.</div>}

      {!loading &&
        filteredProducts.length > 0 &&
        filteredProducts.reverse().map((product) => (
          <Card key={product.id} className="mb-2 hover-border-primary">
            <Row className="g-0 h-100 sh-lg-9 position-relative">
              <Col xs="1" className="position-relative p-2 h-100"> 
                <NavLink to="#/!" className="d-block h-100">
                  <img src={product.thumbnail || (product.images && product.images[0])} alt="product" className="border rounded card-img-horizontal p-1" />
                </NavLink>
              </Col>
              <Col className="py-4 py-lg-0 ps-5 pe-4 h-100">
                <Row className="g-0 h-100 align-content-center">
                  <Col xs="11" lg="5" className="d-flex flex-column mb-lg-0 mb-3 pe-3 d-flex order-1 h-lg-100 justify-content-center">
                    <NavLink to={`/product/${product.identifier.replace(/\s/g, '_').toLowerCase()}`} target="_blank" className="fw-bold">
                      {product.fullName}
                    </NavLink>
                  </Col>
                  <Col lg="2" className="d-flex flex-column pe-1 mb-2 mb-lg-0 justify-content-center order-3">
                    <div className="lh-1 text-center fw-bold">{product.brand_name}</div>
                  </Col>
                  <Col xs="6" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-4">
                    <div className="  text-small d-lg-none mb-1">Action</div>
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
                              deleteSuperSellerProduct(product.id, product.fullName);
                            }}
                          >
                            <CsLineIcons icon="bin" className="text-primary" size="17" />
                          </Button>
                        </div>
                      </OverlayTrigger>
                      <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Live Product </Tooltip>}>
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
                  <Col lg="1" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-4 col-lg-3 col-6">
                    <div className="lh-1 text-alternate">
                      {product.approve ? (
                        <div className="bg-success p-2 border rounded text-center">Approved</div>
                      ) : (
                        <div className="bg-warning p-2 border rounded text-center">Not Approved</div>
                      )}
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        ))}

      {/* Single Card Ends Here */}

      {/* Pagination Start */}
      {data && (
        <div className="d-flex justify-content-center mt-5">
          <Pagination>
            <Pagination.Prev className="shadow" onClick={() => handlePageChange(Math.max(offset - limit, 0))} disabled={offset === 0}>
              <CsLineIcons icon="chevron-left" />
            </Pagination.Prev>
            <Pagination.Next className="shadow" onClick={() => handlePageChange(offset + limit)} disabled={data.getSuperProductBySuperId?.length < limit}>
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
