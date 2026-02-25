import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Row, Col, Card, Table, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { NavLink } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import moment from 'moment';

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

const getStatusBadge = (status) => {
    switch (status) {
        case 'pending': return <Badge bg="warning">Pending Review</Badge>;
        case 'approved': return <Badge bg="success">Approved</Badge>;
        case 'rejected': return <Badge bg="danger">Rejected</Badge>;
        case 'running': return <Badge bg="info">Running</Badge>;
        default: return <Badge bg="secondary">{status}</Badge>;
    }
};

const MyProductAds = () => {
    const title = 'My Product Advertisements';
    const description = 'View and manage your product-level ad submissions';

    const { data, loading, error } = useQuery(GET_MY_PRODUCT_ADS, { fetchPolicy: 'network-only' });

    if (error) toast.error(error.message || 'Failed to load product ads');

    const ads = data?.getMyProductAds || [];

    return (
        <>
            <HtmlHead title={title} description={description} />
            <div className="container-xl">
                <Row className="mb-4">
                    <Col>
                        <h1 className="mb-0 pb-0 display-4">{title}</h1>
                        <div className="text-muted fs-base">{description}</div>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-end gap-2">
                        <NavLink to="/seller/advertisement/ads-product" className="btn btn-primary">
                            <CsLineIcons icon="plus" className="me-2" />
                            New Product Ad
                        </NavLink>
                        <NavLink to="/seller/advertisement/list" className="btn btn-outline-secondary">
                            <CsLineIcons icon="grid-5" className="me-2" />
                            Category Ads
                        </NavLink>
                    </Col>
                </Row>

                <Card>
                    <Card.Body>
                        {loading && (
                            <div className="text-center py-5">
                                <Spinner animation="border" />
                            </div>
                        )}

                        {!loading && ads.length === 0 && (
                            <Alert variant="info" className="mb-0">
                                <CsLineIcons icon="info" className="me-2" />
                                No product advertisements yet.{' '}
                                <NavLink to="/seller/advertisement/ads-product">Submit your first product ad</NavLink>
                            </Alert>
                        )}

                        {!loading && ads.length > 0 && (
                            <div className="table-responsive">
                                <Table hover className="align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Product</th>
                                            <th>Brand</th>
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
                                                                <div className="fw-semibold">{ad.productName}</div>
                                                                {ad.brandName && (
                                                                    <small className="text-muted">{ad.brandName}</small>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{ad.brandName || '—'}</td>
                                                    <td>{getStatusBadge(ad.status)}</td>
                                                    <td>
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {(ad.durations || []).map((d) => (
                                                                <Badge
                                                                    key={d.id}
                                                                    bg={d.slot.startsWith('banner') ? 'primary' : 'secondary'}
                                                                    className="text-capitalize"
                                                                >
                                                                    {d.slot.replace('_', ' ')}
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
                                                        ) : '—'}
                                                    </td>
                                                    <td>
                                                        <small className="text-muted">
                                                            {moment(ad.createdAt).format('DD MMM YYYY')}
                                                        </small>
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
            </div>
        </>
    );
};

export default MyProductAds;
