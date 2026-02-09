import React, { useState, useEffect } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { Row, Col, Form, Pagination, Table, Spinner, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { toast } from 'react-toastify';

const ACTIVE_PRODUCT = gql`
  mutation ActiveProduct($activeProductId: ID, $active: Boolean) {
    activeProduct(id: $activeProductId, active: $active) {
      id
    }
  }
`;
const GET_PRODUCT_BY_FOR_SELLER = gql`
  query GetSuperSellerProductForSeller {
    getSuperSellerProductForSeller {
      approve
      fullName
      superSellerId
      id
      images
      previewName
      thumbnail
      active
      brand_name
      sku
      identifier
      supervariant {
        variantName
        superlocation {
          sellerarray {
            status
            pincode
            sellerId {
              companyName
              id
            }
          }
        }
      }
    }
  }
`;
const GET_SELLER = gql`
  query GetSeller($getSellerId: ID!) {
    getSeller(id: $getSellerId) {
      id
      companyName
    }
  }
`;
const UPDATE_DEALER_LOCATION = gql`
  mutation UpdateDealerLocation($updateDealerLocationId: ID!, $status: Boolean) {
    updateDealerLocation(id: $updateDealerLocationId, status: $status) {
      fullName
      id
    }
  }
`;
const GET_CURRENT_USER = gql`
  query GetProfile {
    getProfile {
      id
      seller {
        id
      }
    }
  }
`;

const ListViewProduct = () => {
  const title = 'Products List';
  const description = 'Products List';
  const history = useHistory();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(100);
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

  const [getUser, { data: userData }] = useLazyQuery(GET_CURRENT_USER, {
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

  const [companyNames, setCompanyNames] = useState({});
  const [getSeller, { data: sellerData }] = useLazyQuery(GET_SELLER);

  const fetchCompanyName = async (superSellerId) => {
    try {
      const { data: responseData } = await getSeller({ variables: { getSellerId: superSellerId } });
      if (responseData && responseData.getSeller) {
        setCompanyNames((prev) => ({
          ...prev,
          [superSellerId]: responseData.getSeller.companyName,
        }));
      }
    } catch (error) {
      console.error('Error fetching company name', error);
    }
  };
  useEffect(() => {
    if (data && data.getSuperSellerProductForSeller) {
      data.getSuperSellerProductForSeller.forEach((product) => {
        if (!companyNames[product.superSellerId]) {
          fetchCompanyName(product.superSellerId);
        }
      });
    }
  }, [data]);
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
  }, [getProduct, offset, limit, sortBy, sortOrder]);
  useEffect(() => {
    getUser();
  }, []);
  useEffect(() => {
    if (debouncedSearch) {
      getProduct({ variables: { search: debouncedSearch, limit, offset } });
    } else {
      getProduct({ variables: { limit, offset } });
    }
  }, [debouncedSearch, getProduct, limit, offset]);
  const handleSearch = () => {
    getProduct({ variables: { search: debouncedSearch, limit, offset } });
  };
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [search]);
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
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  const [updateDealerLocation] = useMutation(UPDATE_DEALER_LOCATION, {
    onCompleted: (response) => {
      if (response.updateDealerLocation) {
        toast.success(`Dealer location updated successfully`);
        refetch();
      }
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });
  const getProductStatus = (product, seller1) => {
    if (!product?.supervariant) return false;
    const statusArray = product.supervariant
      .flatMap((variant) => variant?.superlocation?.flatMap((location) => location?.sellerarray?.find((seller) => seller.sellerId.id === seller1)))
      .filter(Boolean);
    const finalStatus = statusArray.find((s) => s?.sellerId?.id === seller1) ?? false;
    return finalStatus;
  };
  const handleToggle = async (id, product, sellerId) => {
    try {
      const currentStatus = product;
      const newStatus = !currentStatus;
      await updateDealerLocation({
        variables: {
          updateDealerLocationId: id,
          status: newStatus,
        },
      });
      refetch();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-2">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/subBusiness/dashboard">
              <span className="align-middle text-dark ms-1">Dealer Dashboard</span>
            </NavLink>
            <span className="text-dark ps-2"> / </span>
            <span className="align-middle text-dark ms-1">{title}</span>
          </Col>
        </Row>
      </div>
      <Row className="m-0 mb-2 p-1 rounded bg-white align-items-center">
        <Col md="6">
          <span className="fw-bold fs-5 ps-2 pt-2">{title}</span>
          <span className="small ps-2"> {data && data.getSuperSellerProductForSeller ? `(${data.getSuperSellerProductForSeller.length})` : ''} </span>
        </Col>
        <Col md="6" className="d-flex justify-content-end">
          <div className="d-inline-block search-input-container border w-100 shadow bg-foreground">
            <Form.Control
              id="userSearch"
              type="text"
              placeholder="Search by Product name and Brand"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
        </Col>
      </Row>
      <div className="table-responsive">
        <Table bordered hover className="align-middle bg-white">
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <>
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Product Name</th>
                  <th>Brand</th>
                  <th className="text-center align-middle">Actions</th>
                  <th className="text-center align-middle">Status</th>
                </tr>
              </thead>
              {data && data.getSuperSellerProductForSeller.length > 0 ? (
                <tbody>
                  {data.getSuperSellerProductForSeller.map((product) => {
                    return (
                      <tr key={product.id}>
                        <td>
                          <NavLink to="#/!">
                            <img
                              src={product.thumbnail || (product.images && product.images[0])}
                              alt="product"
                              className="border rounded p-1"
                              width="70"
                              height="70"
                            />
                          </NavLink>
                        </td>
                        <td>
                          <NavLink to={`/product/${product.identifier.replace(/\s/g, '_').toLowerCase()}`} target="_blank" className="fw-bold">
                            {product.fullName}
                          </NavLink>
                          {companyNames[product.superSellerId] && <div className="w-100 small">BA Name: {companyNames[product.superSellerId]}</div>}
                        </td>
                        <td>{product.brand_name}</td>
                        <td className="text-center align-middle">
                          <NavLink
                            className="btn-icon btn-icon-only shadow me-2"
                            to={`/product/${product.identifier?.replace(/\s/g, '_').toLowerCase()}`}
                            target="_blank"
                          >
                            <CsLineIcons icon="navigate-diagonal" className="text-primary" size="17" />
                          </NavLink>
                        </td>
                        <td className="text-center align-middle">
                          {currentUser?.seller?.dealerstatus ? (
                            <Form.Check
                              type="switch"
                              id={`toggle-${product.id}`}
                              className="form-switch"
                              checked={getProductStatus(product, userData.getProfile.seller.id).status}
                              onChange={() =>
                                handleToggle(product.id, getProductStatus(product, userData.getProfile.seller.id).status, userData.getProfile.seller.id)
                              }
                            />
                          ) : (
                            <span className="small text-danger d-inline-flex align-items-center gap-1">
                              <CsLineIcons icon="clock" size="16" />
                              <span>Account Approval Pending</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td colSpan="5">
                      <div className="text-center fw-bold p-4 bg-white">
                        <div className="fs-4 mb-2">No products found!</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              )}
            </>
          )}
        </Table>
      </div>
      {data && (
        <div className="d-flex justify-content-center mt-5">
          <Pagination>
            <Pagination.Prev className="shadow" onClick={() => handlePageChange(Math.max(offset - limit, 0))} disabled={offset === 0}>
              <CsLineIcons icon="chevron-left" />
            </Pagination.Prev>
            <Pagination.Next className="shadow" onClick={() => handlePageChange(offset + limit)} disabled={data.getSuperSellerProductForSeller?.length < limit}>
              <CsLineIcons icon="chevron-right" />
            </Pagination.Next>
          </Pagination>
        </div>
      )}
    </>
  );
};

export default ListViewProduct;
