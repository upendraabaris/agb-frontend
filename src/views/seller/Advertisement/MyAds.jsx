import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useQuery, gql } from '@apollo/client';
import { Row, Col, Card, Table, Badge, Spinner, Alert, Nav } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import moment from 'moment';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';

// ─── GraphQL Queries ─────────────────────────────────────────────────────────

const GET_MY_ADS = gql`
  query GetMyAds {
    getMyAds {
      id
      category_id
      categoryName
      tier_id
      status
      createdAt
      updatedAt
      medias {
        id
        slot
        media_type
        mobile_image_url
        desktop_image_url
        redirect_url
      }
      durations {
        id
        slot
        duration_days
        start_date
        end_date
        status
      }
    }
  }
`;

const GET_MY_PRODUCT_ADS = gql`
  query GetMyProductAds {
    getMyProductAds {
      id
      product_id
      productName
      brandName
      productThumbnail
      tier_id
      status
      createdAt
      updatedAt
      medias {
        id
        slot
        media_type
        mobile_image_url
        desktop_image_url
        redirect_url
      }
      durations {
        id
        slot
        duration_days
        start_date
        end_date
        status
      }
    }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStatusBadge = (status) => {
  switch (status) {
    case 'pending':
      return <Badge bg="warning">Pending Review</Badge>;
    case 'approved':
      return <Badge bg="success">Approved</Badge>;
    case 'rejected':
      return <Badge bg="danger">Rejected</Badge>;
    case 'running':
      return <Badge bg="info">Running</Badge>;
    default:
      return <Badge bg="secondary">{status}</Badge>;
  }
};

// ─── Category Ads Tab ─────────────────────────────────────────────────────────

const CategoryAdsTab = () => {
  const { data, loading, error } = useQuery(GET_MY_ADS, { fetchPolicy: 'network-only' });

  if (error) toast.error(error.message || 'Failed to fetch category ads');

  const ads = data?.getMyAds || [];

  return (
    <Card>
      <Card.Header className="d-flex align-items-center justify-content-between py-3">
        <span className="fw-semibold">Category Advertisements</span>
        <NavLink to="/seller/advertisement/add" className="btn btn-sm btn-primary">
          <CsLineIcons icon="plus" size="14" className="me-1" />
          Book Ad at Categories
        </NavLink>
      </Card.Header>
      <Card.Body className="p-0">
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <span className="ms-2 text-muted">Loading category ads…</span>
          </div>
        )}
        {!loading && ads.length === 0 && (
          <Alert variant="info" className="m-3 mb-0">
            <CsLineIcons icon="info" className="me-2" />
            No category advertisements yet.{' '}
            <NavLink to="/seller/advertisement/add">Submit your first category ad</NavLink>
          </Alert>
        )}
        {!loading && ads.length > 0 && (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Category</th>
                  <th>Slot</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Submitted</th>
                  <th>Mobile Image</th>
                  <th>Desktop Image</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad) => {
                  const firstMedia = ad.medias?.[0];
                  const firstDuration = ad.durations?.[0];
                  return (
                    <tr key={ad.id}>
                      <td className="fw-semibold">{ad.categoryName}</td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {(ad.durations || []).map((d) => (
                            <Badge
                              key={d.id}
                              bg={d.slot?.startsWith('banner') ? 'primary' : 'secondary'}
                              className="text-capitalize"
                            >
                              {d.slot?.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td>{getStatusBadge(ad.status)}</td>
                      <td>
                        {firstDuration ? (
                          <div>
                            <div>{firstDuration.duration_days} days</div>
                            {firstDuration.start_date && (
                              <small className="text-muted">
                                {moment(firstDuration.start_date).format('DD MMM YY')} →{' '}
                                {moment(firstDuration.end_date).format('DD MMM YY')}
                              </small>
                            )}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(ad.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </small>
                      </td>
                      <td>
                        {firstMedia?.mobile_image_url ? (
                          <a href={firstMedia.mobile_image_url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={firstMedia.mobile_image_url}
                              alt="mobile"
                              style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }}
                            />
                          </a>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>
                        {firstMedia?.desktop_image_url ? (
                          <a href={firstMedia.desktop_image_url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={firstMedia.desktop_image_url}
                              alt="desktop"
                              style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }}
                            />
                          </a>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

// ─── Product Ads Tab ──────────────────────────────────────────────────────────

const ProductAdsTab = () => {
  const { data, loading, error } = useQuery(GET_MY_PRODUCT_ADS, { fetchPolicy: 'network-only' });

  if (error) toast.error(error.message || 'Failed to load product ads');

  const ads = data?.getMyProductAds || [];

  return (
    <Card>
      <Card.Header className="d-flex align-items-center justify-content-between py-3">
        <span className="fw-semibold">Product Advertisements</span>
        <NavLink to="/seller/advertisement/ads-product" className="btn btn-sm btn-primary">
          <CsLineIcons icon="plus" size="14" className="me-1" />
          Book Ad at Products
        </NavLink>
      </Card.Header>
      <Card.Body className="p-0">
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <span className="ms-2 text-muted">Loading product ads…</span>
          </div>
        )}
        {!loading && ads.length === 0 && (
          <Alert variant="info" className="m-3 mb-0">
            <CsLineIcons icon="info" className="me-2" />
            No product advertisements yet.{' '}
            <NavLink to="/seller/advertisement/ads-product">Submit your first product ad</NavLink>
          </Alert>
        )}
        {!loading && ads.length > 0 && (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Slots</th>
                  <th>Duration</th>
                  <th>Submitted</th>
                  <th>Images</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad) => {
                  const firstMedia = ad.medias?.[0];
                  const firstDuration = ad.durations?.[0];
                  return (
                    <tr key={ad.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {ad.productThumbnail && (
                            <img
                              src={ad.productThumbnail}
                              alt={ad.productName}
                              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }}
                            />
                          )}
                          <div>
                            <div className="fw-semibold" style={{ maxWidth: 180 }}>
                              {ad.productName}
                            </div>
                            {ad.brandName && <small className="text-muted">{ad.brandName}</small>}
                          </div>
                        </div>
                      </td>
                      <td>{getStatusBadge(ad.status)}</td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {(ad.durations || []).map((d) => (
                            <Badge
                              key={d.id}
                              bg={d.slot?.startsWith('banner') ? 'primary' : 'secondary'}
                              className="text-capitalize"
                            >
                              {d.slot?.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td>
                        {firstDuration ? (
                          <div>
                            <div>{firstDuration.duration_days} days</div>
                            {firstDuration.start_date && (
                              <small className="text-muted">
                                {moment(firstDuration.start_date).format('DD MMM YY')} →{' '}
                                {moment(firstDuration.end_date).format('DD MMM YY')}
                              </small>
                            )}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <small className="text-muted">{moment(ad.createdAt).format('DD MMM YYYY')}</small>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          {firstMedia?.mobile_image_url && (
                            <a href={firstMedia.mobile_image_url} target="_blank" rel="noopener noreferrer">
                              <img
                                src={firstMedia.mobile_image_url}
                                alt="mobile"
                                style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                              />
                            </a>
                          )}
                          {firstMedia?.desktop_image_url && (
                            <a href={firstMedia.desktop_image_url} target="_blank" rel="noopener noreferrer">
                              <img
                                src={firstMedia.desktop_image_url}
                                alt="desktop"
                                style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                              />
                            </a>
                          )}
                          {!firstMedia?.mobile_image_url && !firstMedia?.desktop_image_url && (
                            <span className="text-muted">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const MyAds = () => {
  const dispatch = useDispatch();
  const title = 'My Ads';
  const description = 'View and manage all your category and product advertisements';
  const location = useLocation();
  const history = useHistory();
  const tabParam = new URLSearchParams(location.search).get('tab');
  const activeTab = (tabParam === 'product') ? 'product' : 'category';

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
  }, [dispatch]);

  const setActiveTab = (key) => {
    history.push(`/seller/advertisement/list?tab=${key}`);
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-3">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <h1 className="mb-0 pb-0 display-4">{title}</h1>
            <div className="text-muted fs-base">{description}</div>
          </Col>
        </Row>
      </div>

      {/* Tab Navigation */}
      <Nav
        variant="tabs"
        className="mb-0"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        style={{ borderBottom: 'none' }}
      >
        <Nav.Item>
          <Nav.Link
            eventKey="category"
            className="d-flex align-items-center gap-2"
            style={{
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              fontWeight: activeTab === 'category' ? 600 : 400,
            }}
          >
            <CsLineIcons icon="grid-5" size="15" />
            Category Ads
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            eventKey="product"
            className="d-flex align-items-center gap-2"
            style={{
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              fontWeight: activeTab === 'product' ? 600 : 400,
            }}
          >
            <CsLineIcons icon="tag" size="15" />
            Product Ads
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Tab Content */}
      {activeTab === 'category' && <CategoryAdsTab />}
      {activeTab === 'product' && <ProductAdsTab />}
    </>
  );
};

export default MyAds;
