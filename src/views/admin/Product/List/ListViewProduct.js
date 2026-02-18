import React, { useEffect, useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { Row, Col, Modal, Button, Dropdown, Table, Form, Card, Pagination, Tooltip, OverlayTrigger, Spinner } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { gql, useMutation, useLazyQuery } from '@apollo/client';

const ACTIVE_PRODUCT = gql`
  mutation ActiveProduct($activeProductId: ID, $active: Boolean) {
    activeProduct(id: $activeProductId, active: $active) {
      id
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

const ListViewProduct = () => {
  const title = 'Individual Product List';
  const description = 'Ecommerce Individual Product List Page';
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const GET_ALL_PRODUCT = gql`
    query GetAllProduct($sortOrder: String, $sortBy: String, $search: String, $limit: Int, $offset: Int) {
      getAllProduct(sortOrder: $sortOrder, sortBy: $sortBy, search: $search, limit: $limit, offset: $offset) {
        brand_name
        fullName
        id
        identifier
        thumbnail
        images
        active
        previewName
        variant {
          location {
            sellerId {
              companyName
            }
          }
        }
      }
    }
  `;
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(50);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('firstName');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [getAllProduct, { loading, data, refetch, fetchMore }] = useLazyQuery(GET_ALL_PRODUCT, {
    onError: (error) => {
      console.log(`Error!!! : ${error.message}`);
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
    getAllProduct({ variables: { offset, limit, sortBy, sortOrder } });
    refetch();
  }, [getAllProduct, offset, limit, sortBy, sortOrder, refetch]);

  function handleClick() {
    history.push(`/admin/product/add`);
  }

  const handleSearch = () => {
    getAllProduct({ variables: { search: debouncedSearch || undefined, limit, offset } });
  };

  const handleSort = (event) => {
    setSortBy(event);
    if (sortOrder === 'asc') {
      setSortOrder('dsc');
    } else {
      setSortOrder('asc');
    }
    getAllProduct({
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageLimitChange = (newLimit) => {
    setLimit(newLimit);
    setOffset(0);
    getAllProduct({
      variables: {
        limit: newLimit,
        offset: 0,
        sortBy,
        sortOrder,
      },
    });
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
      toast.success('Product Updated Successfully!');
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
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <span className="align-middle text-dark ms-1">Dashboard</span>
            </NavLink>
            <span className="text-dark text-small ps-2"> / </span>
            <span className="align-middle text-dark ms-1">Single Seller Product List</span>
          </Col>
        </Row>
      </div>
      <Row className="m-0 mb-1 p-1 rounded bg-white align-items-center">
        <Col md="6">
          <h5 className="fw-bold fs-5 ps-2 pt-2">Single Seller Product List</h5>
        </Col>
        <Col md="6" className="d-flex justify-content-end">
          <div className="d-inline-block search-input-container border w-100 shadow bg-foreground">
            <Form.Control
              id="userSearch"
              type="text"
              placeholder="Search by Product Full Name and Brand Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
        </Col>
      </Row>
      <div className="text-end mb-1">
        <NavLink to="/admin/product/review" className="text-decoration-none ">
          Reviews
        </NavLink>
      </div>
      <Table bordered hover responsive className="align-middle bg-white rounded shadow-sm">
        <thead className="fw-bold text-dark">
          <tr>
            <th>Image</th>
            <th className="cursor-pointer" onClick={() => handleSort('fullName')}>
              Product Full Name <CsLineIcons icon="sort" className="text-muted" size="12" />
            </th>
            <th className="cursor-pointer" onClick={() => handleSort('brand_name')}>
              Brand <CsLineIcons icon="sort" className="text-muted" size="12" />
            </th>
            <th>Action</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="text-center">
                <Spinner animation="border" variant="primary" />
              </td>
            </tr>
          ) : (
            data?.getAllProduct?.map((product) => (
              <tr key={product.id}>
                <td className="text-center">
                  {product.images?.[0] ? (
                    <div className="d-inline-block overflow-hidden rounded" style={{ width: '40px', height: '40px' }}>
                      <img
                        src={product.thumbnail || product.images?.[0]}
                        alt="product"
                        className="img-fluid"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.8)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      />
                    </div>
                  ) : (
                    <CsLineIcons icon="image" size="26" className="text-muted" />
                  )}
                </td>

                {/* PRODUCT NAME */}
                <td>
                  <NavLink to={`/product/${product.identifier.replace(/\s/g, '_').toLowerCase()}`} className="text-dark fw-bold">
                    {product.previewName}
                  </NavLink>
                  <div className="text-muted small">Seller: {product.variant?.[0]?.location[0]?.sellerId?.companyName || 'N/A'}</div>
                </td>

                {/* BRAND */}
                <td className="fw-bold">{product.brand_name}</td>

                {/* ACTION BUTTONS */}
                <td>
                  <OverlayTrigger placement="top" overlay={<Tooltip>View Product</Tooltip>}>
                    <NavLink className="btn btn-sm btn-light shadow me-2" to={`details/${product.identifier.replace(/\s/g, '_').toLowerCase()}`}>
                      <CsLineIcons icon="info-hexagon" className="text-primary" size="17" />
                    </NavLink>
                  </OverlayTrigger>

                  <OverlayTrigger placement="top" overlay={<Tooltip>Delete Product</Tooltip>}>
                    <Button variant="light" className="btn-sm shadow" onClick={() => deleteProduct(product.id, product.fullName)}>
                      <CsLineIcons icon="bin" className="text-danger" size="17" />
                    </Button>
                  </OverlayTrigger>
                </td>

                {/* STATUS SWITCH */}
                <td>
                  <Form.Check type="switch" checked={product.active || false} onChange={(e) => liveThisProduct(e, product.id)} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Pagination Start */}
      <div className="d-flex justify-content-center mt-5">
        <Pagination>
          <Pagination.Prev className="shadow" onClick={() => handlePageChange(Math.max(offset - limit, 0))} disabled={offset === 0}>
            <CsLineIcons icon="chevron-left" />
          </Pagination.Prev>
          <Pagination.Next
            className="shadow"
            onClick={() => handlePageChange(offset + limit)}
            disabled={!data || !data.getAllProduct || data.getAllProduct.length < limit}
          >
            <CsLineIcons icon="chevron-right" />
          </Pagination.Next>
        </Pagination>
      </div>
      {/* Pagination End */}

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
            No, I don't want
          </Button>
          <Button variant="primary" onClick={() => deleteProductEntry()}>
            Yes, I want
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ListViewProduct;
