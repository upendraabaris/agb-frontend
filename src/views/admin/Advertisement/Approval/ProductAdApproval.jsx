import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Row, Col, Card, Button, Badge, Modal, Form, Spinner, Alert, Table, Pagination } from 'react-bootstrap';
import moment from 'moment';
import { toast } from 'react-toastify';
import { NavLink } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

// ─── GraphQL ────────────────────────────────────────────────────────────────

const GET_PRODUCT_AD_REQUESTS = gql`
  query GetProductAdRequestsForApproval($status: String) {
    getProductAdRequestsForApproval(status: $status) {
      id
      seller_id
      sellerName
      sellerEmail
      sellerCompanyName
      sellerBusinessEmail
      sellerBusinessPhone
      product_id
      productName
      brandName
      productThumbnail
      tier_id
      status
      medias {
        id
        slot
        media_type
        mobile_image_url
        desktop_image_url
        redirect_url
        mobile_redirect_url
        desktop_redirect_url
        url_type
      }
            durations {
        id
        slot
        duration_days
        start_date
        end_date
        status
        start_preference
        quarters_covered
        pricing_breakdown {
          quarter
          start
          end
          days
          rate_per_day
          subtotal
        }
        total_price
        coupon_code
        coupon_discount_type
        coupon_discount_value
        coupon_discount_amount
        final_price
      }
      createdAt
      updatedAt
    }
  }
`;

const APPROVE_PRODUCT_AD = gql`
  mutation ApproveProductAdRequest($input: ApproveProductAdRequestInput!) {
    approveProductAdRequest(input: $input) {
      success
      message
      data {
        id
        status
      }
    }
  }
`;

const REJECT_PRODUCT_AD = gql`
  mutation RejectProductAdRequest($input: RejectProductAdRequestInput!) {
    rejectProductAdRequest(input: $input) {
      success
      message
      data {
        id
        status
      }
    }
  }
`;

const CHECK_PRODUCT_SLOT_AVAILABILITY = gql`
  query CheckProductSlotAvailability($requestId: ID!, $start_date: String!) {
    checkProductSlotAvailability(requestId: $requestId, start_date: $start_date) {
      available
      details {
        slot
        startDate
        endDate
        conflict
        conflictId
      }
    }
  }
`;



// ─── Helpers ────────────────────────────────────────────────────────────────

const getStatusBadge = (status) => {
    switch (status) {
        case 'pending': return <Badge bg="warning">Pending</Badge>;
        case 'approved': return <Badge bg="success">Approved</Badge>;
        case 'rejected': return <Badge bg="danger">Rejected</Badge>;
        case 'running': return <Badge bg="info">Running</Badge>;
        default: return <Badge bg="secondary">{status}</Badge>;
    }
};

const FILTER_VARIANTS = {
    all: { active: 'primary', inactive: 'outline-primary' },
    pending: { active: 'warning', inactive: 'outline-warning' },
    approved: { active: 'success', inactive: 'outline-success' },
    rejected: { active: 'danger', inactive: 'outline-danger' },
};

const getFilterVariant = (f, isActive) => {
    const variants = FILTER_VARIANTS[f] || FILTER_VARIANTS.all;
    return isActive ? variants.active : variants.inactive;
};

// ─── Component ──────────────────────────────────────────────────────────────

function ProductAdApproval() {
    const title = 'Product Ad Approvals';
    const description = 'Review and approve seller product-level advertisements';

    const ITEMS_PER_PAGE = 10;
    const [currentFilter, setCurrentFilter] = useState('pending');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [startDateMode, setStartDateMode] = useState('today'); // 'today' | 'custom'
    const [approvalDate, setApprovalDate] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');


    const { loading, error, data, refetch } = useQuery(GET_PRODUCT_AD_REQUESTS, {
        variables: { status: 'all' },
        fetchPolicy: 'network-only',
    });

    const requests = data?.getProductAdRequestsForApproval || [];

    const displayRequests = currentFilter === 'all' ? requests : requests.filter((r) => r.status === currentFilter);

    const totalPages = Math.ceil(displayRequests.length / ITEMS_PER_PAGE);
    const paginatedRequests = displayRequests.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );




    // ─── Mutations ────────────────────────────────────────────────────────────

    const [approveProductAd, { loading: approveLoading }] = useMutation(APPROVE_PRODUCT_AD, {
        onCompleted: (res) => {
            if (res.approveProductAdRequest.success) {
                toast.success('Product ad approved!');
                setShowApprovalModal(false);
                setSelectedRequest(null);
                setApprovalDate('');
                refetch();
            } else {
                toast.error(res.approveProductAdRequest.message);
            }
        },
        onError: (err) => toast.error(err.message || 'Failed to approve'),
    });

    const [rejectProductAd, { loading: rejectLoading }] = useMutation(REJECT_PRODUCT_AD, {
        onCompleted: (res) => {
            if (res.rejectProductAdRequest.success) {
                toast.success('Product ad rejected');
                setShowRejectionModal(false);
                setSelectedRequest(null);
                setRejectionReason('');
                refetch();
            } else {
                toast.error(res.rejectProductAdRequest.message);
            }
        },

        onError: (err) => toast.error(err.message || 'Failed to reject'),
    });

    // compute projected total price across ALL durations/slots
    const computeProjectedTotal = () => {
        if (!selectedRequest?.durations || selectedRequest.durations.length === 0) return 0;
        return selectedRequest.durations.reduce((total, dur) => total + (dur.total_price || 0), 0);
    };

    // Compute total after coupon discount
    const computeDiscountedTotal = () => {
        if (!selectedRequest?.durations || selectedRequest.durations.length === 0) return 0;
        return selectedRequest.durations.reduce((total, dur) => {
            return total + (dur.final_price != null && dur.final_price > 0 ? dur.final_price : dur.total_price || 0);
        }, 0);
    };

    // Check if any duration has a coupon applied
    const hasCouponApplied = () => {
        return selectedRequest?.durations?.some((d) => d.coupon_code) || false;
    };

    // human-readable slot label
    const slotLabel = (slot) => {
        if (!slot) return 'Unknown Slot';
        return slot.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    // ─── Availability Query ──────────────────────────────────────────────────

    const { data: availData, loading: availLoading } = useQuery(CHECK_PRODUCT_SLOT_AVAILABILITY, {
        variables: {
            requestId: selectedRequest?.id,
            start_date: startDateMode === 'today' ? moment().format('YYYY-MM-DD') : approvalDate
        },
        skip: !selectedRequest || (startDateMode === 'custom' && !approvalDate),
        fetchPolicy: 'network-only',
    });

    const availability = availData?.checkProductSlotAvailability;

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const handleFilterChange = (newFilter) => {
        setCurrentFilter(newFilter);
        setSelectedRequest(null);
    };

    const handleApprove = () => {
        if (!approvalDate) { toast.error('Please select a start date'); return; }
        approveProductAd({
            variables: { input: { requestId: selectedRequest.id, start_date: approvalDate } },
        });
    };

    const handleReject = () => {
        rejectProductAd({
            variables: { input: { requestId: selectedRequest.id, rejection_reason: rejectionReason || null } },
        });
    };

    const openApproval = (req) => {
        setSelectedRequest(req);

        // Smart Default Logic
        const requestedStart = req.durations?.[0]?.start_date;
        const today = moment().format('YYYY-MM-DD');

        if (requestedStart && moment(requestedStart).isAfter(today, 'day')) {
            // Future request: Default to Custom Date with their requested date
            setStartDateMode('custom');
            setApprovalDate(moment.utc(requestedStart).format('YYYY-MM-DD'));
        } else {
            // Past or Today request: Default to Start Today
            setStartDateMode('today');
            setApprovalDate(today);
        }

        setShowApprovalModal(true);
    };
    const openRejection = (req) => { setSelectedRequest(req); setRejectionReason(''); setShowRejectionModal(true); };

    // ─── Event Handlers ───────────────────────────────────────────────────────

    const handleModeChange = (mode) => {
        setStartDateMode(mode);
        if (mode === 'today') {
            setApprovalDate(moment().format('YYYY-MM-DD'));
        } else {
            const requestedStart = selectedRequest?.durations?.[0]?.start_date;
            setApprovalDate(requestedStart ? moment.utc(requestedStart).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'));
        }
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <>
            <HtmlHead title={title} description={description} />

            <div className="page-title-container">
                <Row className="g-0">
                    <Col className="col-auto mb-3 mb-sm-0 me-auto">
                        <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
                            <CsLineIcons icon="chevron-left" size="13" />
                            <span className="align-middle text-small ms-1">Home</span>
                        </NavLink>
                        <h1 className="mb-0 pb-0 display-4">{title}</h1>
                        <div className="text-muted fs-base">{description}</div>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-end">
                        <Button variant="outline-secondary" size="sm" onClick={() => refetch()}>
                            <CsLineIcons icon="refresh-horizontal" className="me-1" />
                            Refresh
                        </Button>
                    </Col>
                </Row>
            </div>

            {/* Filter bar */}
            <Card className="mb-3">
                {/* <Card.Body>
                    <div className="d-flex gap-2 flex-wrap">
                        {['all', 'pending', 'approved', 'rejected'].map((f) => (
                            <Button
                                key={f}
                                variant={getFilterVariant(f, currentFilter === f)}
                                onClick={() => { setCurrentFilter(f); setCurrentPage(1); }}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                                {f !== 'all' && ` (${requests.filter((r) => r.status === f).length})`}
                            </Button>
                        ))}
                    </div>
                </Card.Body> */}
                <Card.Body>
                    <div className="d-flex gap-2 flex-wrap">
                        <Button
                            variant={currentFilter === 'all' ? 'primary' : 'outline-primary'}
                            onClick={() => handleFilterChange('all')}
                        >
                            All ({requests.filter((r) => r.status === 'pending' || r.status === 'approved' || r.status === 'rejected').length})
                        </Button>
                        <Button
                            variant={currentFilter === 'pending' ? 'warning' : 'outline-warning'}
                            onClick={() => handleFilterChange('pending')}
                        >
                            Pending ({requests.filter((r) => r.status === 'pending').length})
                        </Button>
                        <Button
                            variant={currentFilter === 'approved' ? 'success' : 'outline-success'}
                            onClick={() => handleFilterChange('approved')}
                        >
                            Approved ({requests.filter((r) => r.status === 'approved').length})
                        </Button>
                        <Button
                            variant={currentFilter === 'rejected' ? 'danger' : 'outline-danger'}
                            onClick={() => handleFilterChange('rejected')}
                        >
                            Rejected ({requests.filter((r) => r.status === 'rejected').length})
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* Table */}
            <Card>
                <Card.Body>
                    {error && (
                        <Alert variant="danger">
                            <CsLineIcons icon="warning-hexagon" className="me-2" />
                            {error.message}
                        </Alert>
                    )}

                    {loading && (
                        <div className="text-center py-5">
                            <Spinner animation="border" />
                        </div>
                    )}

                    {!loading && displayRequests.length === 0 && (
                        <Alert variant="info" className="mb-0">
                            <CsLineIcons icon="info" className="me-2" />
                            No product ad requests found for "{currentFilter}".
                        </Alert>
                    )}

                    {!loading && displayRequests.length > 0 && (
                        <div className="table-responsive">
                            <Table hover className="align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Product</th>
                                        <th>Seller</th>
                                        <th>Slots</th>
                                        <th>Duration</th>
                                        <th>Status</th>
                                        <th>Submitted</th>
                                        <th>Images</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedRequests.map((req) => {
                                        const firstMedia = req.medias?.[0];
                                        const firstDuration = req.durations?.[0];
                                        return (
                                            <tr key={req.id}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        {req.productThumbnail && (
                                                            <img
                                                                src={req.productThumbnail}
                                                                alt={req.productName}
                                                                style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4 }}
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="fw-semibold">{req.productName}</div>
                                                            {req.brandName && <small className="text-muted">{req.brandName}</small>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="fw-bold">{req.sellerCompanyName}</div>
                                                    <div className="text-muted text-small">{req.sellerName}</div>
                                                    <small className="text-muted text-small">{req.sellerEmail}</small>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {(req.durations || []).map((d) => (
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
                                                                    {moment.utc(firstDuration.start_date).format('DD MMM YY')} → {moment.utc(firstDuration.end_date).format('DD MMM YY')}
                                                                </small>
                                                            )}
                                                        </div>
                                                    ) : '—'}
                                                </td>
                                                <td>{getStatusBadge(req.status)}</td>
                                                <td>
                                                    <small className="text-muted">{moment(req.createdAt).format('DD MMM YYYY')}</small>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        {firstMedia?.mobile_image_url && (
                                                            <a href={firstMedia.mobile_image_url} target="_blank" rel="noopener noreferrer">
                                                                <img src={firstMedia.mobile_image_url} alt="mobile" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4 }} />
                                                            </a>
                                                        )}
                                                        {firstMedia?.desktop_image_url && (
                                                            <a href={firstMedia.desktop_image_url} target="_blank" rel="noopener noreferrer">
                                                                <img src={firstMedia.desktop_image_url} alt="desktop" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4 }} />
                                                            </a>
                                                        )}
                                                        {!firstMedia?.mobile_image_url && !firstMedia?.desktop_image_url && (
                                                            <span className="text-muted">—</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    {req.status === 'pending' ? (
                                                        <div className="d-flex gap-2">
                                                            <Button variant="success" size="sm" onClick={() => openApproval(req)}>
                                                                <CsLineIcons icon="check" className="me-1" />Approve
                                                            </Button>
                                                            <Button variant="danger" size="sm" onClick={() => openRejection(req)}>
                                                                <CsLineIcons icon="close" className="me-1" />Reject
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex gap-2">
                                                            <Button variant="outline-primary" size="sm" onClick={() => openApproval(req)}>
                                                                <CsLineIcons icon="eye" className="me-1" />View
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <small className="text-muted">
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, displayRequests.length)} of {displayRequests.length}
                            </small>
                            <Pagination className="mb-0">
                                <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                                <Pagination.Prev onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1} />
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                                    .reduce((acc, p, idx, arr) => {
                                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push('ellipsis');
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((item, idx) =>
                                        item === 'ellipsis' ? (
                                            <Pagination.Ellipsis key={`e-${idx}`} disabled />
                                        ) : (
                                            <Pagination.Item
                                                key={item}
                                                active={item === currentPage}
                                                onClick={() => setCurrentPage(item)}
                                            >
                                                {item}
                                            </Pagination.Item>
                                        )
                                    )}
                                <Pagination.Next onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages} />
                                <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                            </Pagination>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* ── Approval / View Modal ─────────────────────────────────────────── */}
            <Modal show={showApprovalModal} onHide={() => setShowApprovalModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {selectedRequest?.status === 'pending' ? 'Approve Product Ad' : 'Ad Details'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedRequest && (
                        <div>
                            {/* Seller Info */}
                            <h6 className="mb-3">Seller Information</h6>
                            <div className="mb-3">
                                <small className="text-muted">Name</small>
                                <div className="fw-bold">{selectedRequest.sellerName}</div>
                            </div>
                            <div className="mb-3">
                                <small className="text-muted">Email</small>
                                <div className="fw-bold">{selectedRequest.sellerEmail}</div>
                            </div>
                            <div className="mb-3">
                                <small className="text-muted">Seller Company</small>
                                <div className="fw-bold">{selectedRequest.sellerCompanyName || 'N/A'}</div>
                            </div>
                            <div className="mb-3">
                                <small className="text-muted">Seller Business Email</small>
                                <div className="fw-bold">{selectedRequest.sellerBusinessEmail || 'N/A'}</div>
                            </div>
                            <div className="mb-3">
                                <small className="text-muted">Seller Business Phone</small>
                                <div className="fw-bold">{selectedRequest.sellerBusinessPhone || 'N/A'}</div>
                            </div>
                            <hr />

                            {/* Product Info */}
                            <h6 className="text-muted mb-2">Product</h6>
                            <div className="d-flex align-items-center gap-3 mb-3">
                                {selectedRequest.productThumbnail && (
                                    <img
                                        src={selectedRequest.productThumbnail}
                                        alt={selectedRequest.productName}
                                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                                    />
                                )}
                                <div>
                                    <div className="fw-bold">{selectedRequest.productName}</div>
                                    {selectedRequest.brandName && <small className="text-muted">{selectedRequest.brandName}</small>}
                                </div>
                                <div className="ms-auto">{getStatusBadge(selectedRequest.status)}</div>
                            </div>
                            <hr />

                            {/* Slots */}
                            <h6 className="text-muted mb-2">Slots &amp; Duration</h6>
                            <div className="d-flex flex-wrap gap-2 mb-3">
                                {(selectedRequest.durations || []).map((d) => (
                                    <div key={d.id} className="border rounded p-2 text-center" style={{ minWidth: 100 }}>
                                        <div className="fw-bold text-capitalize">{d.slot.replace('_', ' ')}</div>
                                        <small className="text-muted">{d.duration_days} days</small>
                                        {d.start_date && (
                                            <div>
                                                <small className="text-success d-block">
                                                    {moment.utc(d.start_date).format('DD MMM')} → {moment.utc(d.end_date).format('DD MMM YY')}
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <hr />

                            {/* Media */}
                            <h6 className="text-muted mb-2">Ad Creatives</h6>
                            <hr />
                            <h6 className="mb-3">Duration & Pricing</h6>
                            {selectedRequest.durations && selectedRequest.durations.length > 0 && (
                                <>
                                    {/* Per-slot breakdown */}
                                    {selectedRequest.durations.map((dur) => {
                                        const media = selectedRequest.medias?.find(m => m.slot === dur.slot);
                                        const isExternal = media?.url_type === 'external';

                                        return (
                                            <Card key={dur.id} className="mb-3 border">
                                                <Card.Body className="p-3">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <div>
                                                            <strong>{slotLabel(dur.slot)}</strong>
                                                            {isExternal && (
                                                                <Badge bg="warning" text="dark" className="ms-2">
                                                                    External URL
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <Badge bg="outline-primary" className="text-primary border">{dur.duration_days} days</Badge>
                                                    </div>

                                                    {dur.quarters_covered && dur.quarters_covered.length > 0 && (
                                                        <div className="mb-2">
                                                            <small className="text-muted">Quarters:</small>{' '}
                                                            <span className="fw-bold">{dur.quarters_covered.join(', ')}</span>
                                                        </div>
                                                    )}

                                                    {dur.pricing_breakdown && dur.pricing_breakdown.length > 0 && (
                                                        <div className="mb-2">
                                                            <small className="text-muted d-block mb-1">Pricing Breakdown</small>
                                                            <ul className="mb-0 ps-3">
                                                                {dur.pricing_breakdown.map((b, i) => {
                                                                    if (b.days === 0 && b.subtotal > 0) {
                                                                        const label = b.quarter.includes('External') || isExternal ? 'External URL Surcharge' : b.quarter;
                                                                        return (
                                                                            <li key={i} style={{ color: '#d97706', fontWeight: 600, listStyle: 'none', marginLeft: '-1rem' }}>
                                                                                ⚠ {label}: +₹{b.subtotal}
                                                                            </li>
                                                                        );
                                                                    }
                                                                    return (
                                                                        <li key={i}>
                                                                            <strong>{b.quarter}</strong>
                                                                            {b.start && b.end && ` (${moment(b.start).format('D MMMM YYYY')} – ${moment(b.end).format('D MMMM YYYY')})`}
                                                                            : {b.days}d × ₹{b.rate_per_day}/d = ₹{b.subtotal}
                                                                        </li>
                                                                    );
                                                                })}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    <div className="text-end">
                                                        <small className="text-muted">Slot Total: </small>
                                                        <strong>₹{dur.total_price || 0}</strong>
                                                    </div>

                                                    {dur.coupon_code && (
                                                        <div className="mt-2 p-2 rounded" style={{ backgroundColor: '#f0fff4', border: '1px solid #c6f6d5' }}>
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div>
                                                                    <span className="badge bg-success me-2">🏷️ {dur.coupon_code}</span>
                                                                    <small className="text-muted">
                                                                        {dur.coupon_discount_type === 'flat' ? `₹${dur.coupon_discount_value} flat` : `${dur.coupon_discount_value}% off`}
                                                                    </small>
                                                                </div>
                                                                <div>
                                                                    <small className="text-danger me-2">-₹{dur.coupon_discount_amount}</small>
                                                                    <strong className="text-success">₹{dur.final_price}</strong>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Card.Body>
                                            </Card>
                                        );
                                    })}

                                    {/* Grand total */}
                                    <div className="mb-3 p-3 bg-light rounded d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0">Grand Total ({selectedRequest.durations.length} slot{selectedRequest.durations.length > 1 ? 's' : ''})</h6>
                                        <div className="text-end">
                                            {hasCouponApplied() ? (
                                                <>
                                                    <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9rem', marginRight: '8px' }}>₹{computeProjectedTotal()}</span>
                                                    <span className="h5 mb-0 text-success fw-bold">₹{computeDiscountedTotal()}</span>
                                                    <div>
                                                        <small className="text-success">Coupon discount: -₹{computeProjectedTotal() - computeDiscountedTotal()}</small>
                                                    </div>
                                                </>
                                            ) : (
                                                <h5 className="mb-0 text-primary">₹{computeProjectedTotal()}</h5>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            <hr />

                            {/* Media */}
                            <h6 className="text-muted mb-2">Ad Creatives</h6>
                            <Row className="g-2 mb-3">
                                {(selectedRequest.medias || []).map((m) => (
                                    <Col key={m.id} md={6}>
                                        <div className="border rounded p-2">
                                            {m.mobile_image_url && (
                                                <a href={m.mobile_image_url} target="_blank" rel="noopener noreferrer">
                                                    <img
                                                        src={m.mobile_image_url}
                                                        alt={m.slot}
                                                        className="img-fluid mb-1"
                                                        style={{ maxHeight: 120, borderRadius: 4, display: 'block' }}
                                                    />
                                                </a>
                                            )}
                                            {m.desktop_image_url && (
                                                <a href={m.desktop_image_url} target="_blank" rel="noopener noreferrer">
                                                    <img
                                                        src={m.desktop_image_url}
                                                        alt={m.slot}
                                                        className="img-fluid mb-1"
                                                        style={{ maxHeight: 120, borderRadius: 4, display: 'block' }}
                                                    />
                                                </a>
                                            )}
                                            <div>
                                                <small className="text-muted">Slot: </small>
                                                <Badge bg={m.slot.startsWith('banner') ? 'primary' : 'secondary'} className="text-capitalize">
                                                    {m.slot.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            {m.mobile_redirect_url && (
                                                <small className="text-break d-block mt-1">
                                                    <span className="text-muted">↗ </span>
                                                    <a href={m.mobile_redirect_url} target="_blank" rel="noopener noreferrer">
                                                        {m.mobile_redirect_url}
                                                    </a>
                                                </small>
                                            )}
                                        </div>
                                    </Col>
                                ))}
                            </Row>

                            {/* Approval date picker (pending only) */}
                            {selectedRequest.status === 'pending' && (
                                <>
                                    <hr />
                                    <h6 className="mb-3">Approval Settings</h6>

                                    {/* Seller Requested Date View */}
                                    {selectedRequest.durations?.[0]?.start_date && (
                                        <Alert variant="info" className="d-flex align-items-center mb-4">
                                            <CsLineIcons icon="info-circle" className="me-2" />
                                            <div>
                                                Seller requested to start on: <strong>{moment.utc(selectedRequest.durations[0].start_date).format('DD MMMM YYYY')}</strong>
                                            </div>
                                        </Alert>
                                    )}

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold d-block mb-2">Campaign Start Logic</Form.Label>
                                        <div className="d-flex gap-4">
                                            <Form.Check
                                                type="radio"
                                                id="mode-today"
                                                label="Start Today (Pro-rata)"
                                                checked={startDateMode === 'today'}
                                                onChange={() => handleModeChange('today')}
                                                className="fw-medium"
                                                hidden={selectedRequest.durations?.[0]?.start_date && moment.utc(selectedRequest.durations?.[0]?.start_date).isAfter(moment(), 'day')}
                                            />
                                            <Form.Check
                                                type="radio"
                                                id="mode-custom"
                                                label="Custom Start Date"
                                                checked={startDateMode === 'custom'}
                                                onChange={() => handleModeChange('custom')}
                                                className="fw-medium"
                                            />
                                        </div>
                                    </Form.Group>

                                    {startDateMode === 'custom' && (
                                        <Form.Group className="mb-4">
                                            <Form.Label>Select Custom Start Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={approvalDate}
                                                onChange={(e) => setApprovalDate(e.target.value)}
                                                min={moment().format('YYYY-MM-DD')}
                                            />
                                            {selectedRequest.durations?.[0]?.start_date && approvalDate !== moment.utc(selectedRequest.durations[0].start_date).format('YYYY-MM-DD') && (
                                                <small className="text-warning fw-bold mt-1 d-block">
                                                    ⚠️ Warning: You are overriding the seller's requested date.
                                                </small>
                                            )}
                                        </Form.Group>
                                    )}

                                    {/* Availability Breakdown */}
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <Form.Label className="fw-bold mb-0">Slot Availability Check</Form.Label>
                                            {availLoading && <Spinner animation="border" size="sm" />}
                                        </div>

                                        {!availLoading && availability && (
                                            <div className="border rounded bg-light p-3">
                                                {availability.details.map((slotAvail, idx) => (
                                                    <div key={idx} className={`d-flex justify-content-between align-items-center ${idx > 0 ? 'mt-2 pt-2 border-top' : ''}`}>
                                                        <div>
                                                            <div className="fw-bold text-capitalize">{slotAvail.slot.replace('_', ' ')}</div>
                                                            <small className="text-muted">
                                                                {moment.utc(slotAvail.startDate).format('DD MMM')} — {moment.utc(slotAvail.endDate).format('DD MMM YY')}
                                                            </small>
                                                        </div>
                                                        <div>
                                                            {slotAvail.conflict ? (
                                                                <Badge bg="danger">
                                                                    <CsLineIcons icon="close" size="10" className="me-1" />
                                                                    Occupied
                                                                </Badge>
                                                            ) : (
                                                                <Badge bg="success">
                                                                    <CsLineIcons icon="check" size="10" className="me-1" />
                                                                    Available
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                {!availability.available && (
                                                    <Alert variant="danger" className="mt-3 mb-0 py-2 small">
                                                        Some of the requested slots are already booked for this period.
                                                        Approving now will displace existing ads or fail.
                                                    </Alert>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>Cancel</Button>
                    {selectedRequest?.status === 'pending' && (
                        <Button variant="success" onClick={handleApprove} disabled={approveLoading || !approvalDate}>
                            {approveLoading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
                            Approve
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

            {/* ── Rejection Modal ───────────────────────────────────────────────── */}
            <Modal show={showRejectionModal} onHide={() => setShowRejectionModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Reject Product Ad</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedRequest && (
                        <div>
                            <p>
                                <strong>Product:</strong> {selectedRequest.productName}<br />
                                <strong>Seller:</strong> {selectedRequest.sellerName}
                            </p>
                            <Form.Group>
                                <Form.Label>Rejection Reason (optional)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Why are you rejecting this advertisement?"
                                />
                            </Form.Group>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRejectionModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleReject} disabled={rejectLoading}>
                        {rejectLoading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
                        Reject
                    </Button>
                </Modal.Footer>
            </Modal>

        </>
    );
}

export default ProductAdApproval;
