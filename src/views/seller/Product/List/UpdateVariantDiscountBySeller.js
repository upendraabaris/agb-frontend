import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Spinner, Card, Button, Modal, Pagination } from 'react-bootstrap';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import HtmlHead from 'components/html-head/HtmlHead';
import { NavLink } from 'react-router-dom';

// 🔹 Updated Query
const GET_PRODUCT_BY_FOR_SELLER = gql`
  query GetProductByForSeller($search: String, $offset: Int, $limit: Int, $sortBy: String, $sortOrder: String) {
    getProductByForSeller(search: $search, offset: $offset, limit: $limit, sortBy: $sortBy, sortOrder: $sortOrder) {
      id
      fullName
      previewName
      brand_name
      approve
      identifier
      active
      variant {
        id
        variantName
        active
        location {
          id
          b2cdiscount
          b2bdiscount
          pincode
          state
        }
      }
    }
  }
`;

// 🔹 Updated Mutation
const UPDATE_VARIANT_PRICES = gql`
  mutation UpdateVariantPricesBySeller($productId: ID!, $variants: [VariantUpdateInput]!) {
    updateVariantPricesBySeller(productId: $productId, variants: $variants) {
      variant {
        id
        location {
          id
          b2cdiscount
          b2bdiscount
        }
      }
    }
  }
`;

const UpdateVariantPricesBySeller = () => {
  const title = 'Bulk Discount Update';
  const description = 'Bulk Discount Update by Seller';

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(50);
  const [sortBy, setSortBy] = useState('fullName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [discountUpdates, setDiscountUpdates] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedPincodes, setSelectedPincodes] = useState([]);

  const handleShow = (pincodes) => {
    setSelectedPincodes(pincodes);
    setShowModal(true);
  };

  // 🔹 Query
  const [getProduct, { loading, data, refetch }] = useLazyQuery(GET_PRODUCT_BY_FOR_SELLER, {
    onError: (error) => toast.error(error.message || 'Something went wrong!'),
  });

  // 🔹 Mutation
  const [updatePrices, { loading: updating }] = useMutation(UPDATE_VARIANT_PRICES, {
    onCompleted: () => toast.success('Discount updated successfully!'),
    onError: (error) => toast.error(error.message || 'Failed to update discounts!'),
  });

  // 🔹 Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // 🔹 Fetch Data
  useEffect(() => {
    getProduct({ variables: { offset, limit, sortBy, sortOrder } });
  }, [getProduct, offset, limit, sortBy, sortOrder]);

  useEffect(() => {
    if (debouncedSearch.trim() !== '') {
      getProduct({ variables: { search: debouncedSearch, offset, limit, sortBy, sortOrder } });
    } else {
      getProduct({ variables: { offset, limit, sortBy, sortOrder } });
    }
  }, [debouncedSearch]);

  // 🔹 Handle Discount Changes
  const handleFieldChange = (productId, variantId, locationId, field, value) => {
    setDiscountUpdates((prev) => {
      const updated = { ...prev };
      if (!updated[productId]) updated[productId] = {};
      if (!updated[productId][variantId]) updated[productId][variantId] = {};
      if (!updated[productId][variantId][locationId]) updated[productId][variantId][locationId] = {};
      updated[productId][variantId][locationId][field] = parseFloat(value) || 0;
      return updated;
    });
  };

  // 🔹 Save All Discounts for a Product
  const [savingProductId, setSavingProductId] = useState(null);

  const handleSave = async (product) => {
    setSavingProductId(product.id);

    const variantsData = product.variant.map((variant) => {
      const locData = variant.location.map((loc) => ({
        id: loc.id,
        b2cdiscount: discountUpdates?.[product.id]?.[variant.id]?.[loc.id]?.b2cdiscount ?? loc.b2cdiscount ?? 0,
        b2bdiscount: discountUpdates?.[product.id]?.[variant.id]?.[loc.id]?.b2bdiscount ?? loc.b2bdiscount ?? 0,
      }));
      return { variantId: variant.id, locations: locData };
    });

    await updatePrices({
      variables: { productId: product.id, variants: variantsData },
    });

    setSavingProductId(null);
    refetch();
  };

  const handlePageChange = (newOffset) => {
    if (newOffset < 0) return;

    setOffset(newOffset);

    refetch({
      search: debouncedSearch || undefined,
      offset: newOffset,
      limit,
      sortBy,
      sortOrder,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <HtmlHead title={title} description={description} />

      {/* 🔹 Page Header */}
      <div className="page-title-container">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <button type="button" className="muted-link pb-1 d-inline-block bg-transparent border-0" onClick={() => window.history.back()}>
              <span className="text-dark ms-1">Back</span>
            </button>
            <spna className="small p-2"> / </spna>
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="#">
              <span className="text-dark ms-1">{title}</span>
            </NavLink>
          </Col>
        </Row>

        {/* 🔹 Search Bar */}
        <div className="d-flex bg-white rounded p-2 flex-wrap align-items-center justify-content-between">
          <h1 className="mb-0 pb-0 fw-bold text-dark h4 ms-2">{title}</h1>
          <div className="d-flex justify-content-end" style={{ width: '50%' }}>
            <div className="search-input-container shadow-sm bg-foreground d-flex align-items-center px-2 rounded w-100">
              <Form.Control
                type="text"
                placeholder="Search by Product Full Name or Brand"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 shadow-none flex-grow-1"
              />
              <Button variant="link" className="text-primary p-0 ms-2">
                <CsLineIcons icon="search" size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Loader */}
      {loading && (
        <div className="text-center mt-5">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {/* 🔹 Product List */}
      {!loading &&
        data?.getProductByForSeller?.map((product) => (
          <Card key={product.id} className="mb-2 p-2 shadow-sm border-primary rounded-3 overflow-hidden hover-shadow-sm">
            <Card.Body className="bg-light-subtle p-0">
              {product.variant.map((variant) => (
                <div key={variant.id} className="border rounded-3 bg-white shadow-sm p-3 mb-2">
                  <div className="fw-bold text-dark mb-3 border-bottom pb-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>
                        {product.brand_name} - {product.previewName} {variant.variantName}
                        {product.active ? '✅' : '❌'}
                      </span>
                      {variant.location.length >= 2 && <span className="badge bg-light text-dark border">{variant.location.length} Locations</span>}
                    </div>
                    <div className="text-muted small mt-1">
                      ({product.fullName} {variant.variantName})
                    </div>
                  </div>

                  <Row className="m-0">
                    {variant.location.map((loc, lIndex) => {
                      const pinList = Array.isArray(loc.pincode) ? loc.pincode : [];
                      const showPins = pinList.slice(0, 3).join(', ');
                      const hasMorePins = pinList.length > 3;

                      return (
                        <Col
                          key={loc.id}
                          xs={12}
                          sm={6}
                          lg={4}
                          className={`p-2 rounded bg-white mb-2 border ${variant.active ? 'border-light' : 'border-danger'}`}
                        >
                          <div className="fw-semibold small text-dark mb-1">
                            {variant.location.length >= 2 && <>Location {lIndex + 1} </>}
                            {pinList.length > 0 && (
                              <span className="text-muted">
                                ({showPins}
                                {hasMorePins && (
                                  <>
                                    ,{' '}
                                    <button
                                      type="button"
                                      className="btn btn-link btn-sm p-0 m-0 align-baseline text-primary"
                                      onClick={() => handleShow(pinList)}
                                    >
                                      +more
                                    </button>
                                  </>
                                )}
                                )
                              </span>
                            )}
                          </div>

                          {/* 🔹 Discount Fields */}
                          <div className="d-flex gap-2 flex-wrap align-items-center">
                            {[
                              { label: 'B2C Discount (%)', field: 'b2cdiscount' },
                              { label: 'B2B Discount (%)', field: 'b2bdiscount' },
                            ].map(({ label, field }) => (
                              <div key={field} style={{ width: '45%' }}>
                                <Form.Label className="small text-muted mb-1 d-block">{label}</Form.Label>
                                <Form.Control
                                  type="number"
                                  min="0"
                                  className="form-control-sm rounded-1 shadow-none border-secondary p-1"
                                  value={discountUpdates?.[product.id]?.[variant.id]?.[loc.id]?.[field] ?? loc[field] ?? ''}
                                  onChange={(e) => handleFieldChange(product.id, variant.id, loc.id, field, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              ))}

              {/* Save Button */}
              <Button
                size="sm"
                variant="primary"
                className="rounded px-3 fw-semibold mb-2 ms-0 w-100 w-md-auto"
                disabled={savingProductId === product.id}
                onClick={() => handleSave(product)}
              >
                {savingProductId === product.id ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                    Saving...
                  </>
                ) : (
                  'Submit Discounts'
                )}
              </Button>
            </Card.Body>
          </Card>
        ))}

      {!loading && (!data?.getProductByForSeller || data.getProductByForSeller.length === 0) && (
        <div className="text-center mt-5 fw-bold text-muted">No Products Found</div>
      )}

      {data && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.Prev className="shadow" onClick={() => handlePageChange(offset - limit)} disabled={offset === 0}>
              <CsLineIcons icon="chevron-left" />
            </Pagination.Prev>

            <Pagination.Next className="shadow" onClick={() => handlePageChange(offset + limit)} disabled={data?.getProductByForSeller?.length < limit}>
              <CsLineIcons icon="chevron-right" />
            </Pagination.Next>
          </Pagination>
        </div>
      )}

      {/* 🔹 Pincode Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>All Pincodes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPincodes.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {selectedPincodes.map((pin, i) => (
                <span key={i} className="badge bg-light text-dark border">
                  {pin}
                </span>
              ))}
            </div>
          ) : (
            <p>No pincodes available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UpdateVariantPricesBySeller;
