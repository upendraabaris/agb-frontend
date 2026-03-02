import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Row, Col, Card, Button, Badge, Modal, Form, Spinner, Alert, Table } from 'react-bootstrap';
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
      }
      durations {
        id
        slot
        duration_days
        start_date
        end_date
        status
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

    const [currentFilter, setCurrentFilter] = useState('pending');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [approvalDate, setApprovalDate] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    const { loading, error, data, refetch } = useQuery(GET_PRODUCT_AD_REQUESTS, {
        variables: { status: currentFilter },
        fetchPolicy: 'network-only',
    });

    const requests = data?.getProductAdRequestsForApproval || [];

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

    // ─── Handlers ─────────────────────────────────────────────────────────────

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

    const openApproval = (req) => { setSelectedRequest(req); setApprovalDate(''); setShowApprovalModal(true); };
    const openRejection = (req) => { setSelectedRequest(req); setRejectionReason(''); setShowRejectionModal(true); };

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
                <Card.Body>
                    <div className="d-flex gap-2 flex-wrap">
                        {['all', 'pending', 'approved', 'rejected'].map((f) => (
                            <Button
                                key={f}
                                variant={getFilterVariant(f, currentFilter === f)}
                                onClick={() => setCurrentFilter(f)}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                                {f !== 'all' && ` (${requests.filter((r) => r.status === f).length})`}
                            </Button>
                        ))}
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

                    {!loading && requests.length === 0 && (
                        <Alert variant="info" className="mb-0">
                            <CsLineIcons icon="info" className="me-2" />
                            No product ad requests found for "{currentFilter}".
                        </Alert>
                    )}

                    {!loading && requests.length > 0 && (
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
                                    {requests.map((req) => {
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
                                                    <div className="fw-bold">{req.sellerName}</div>
                                                    <small className="text-muted">{req.sellerEmail}</small>
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
                                                                    {moment(firstDuration.start_date).format('DD MMM YY')} → {moment(firstDuration.end_date).format('DD MMM YY')}
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
                                                        <Button variant="outline-primary" size="sm" onClick={() => openApproval(req)}>
                                                            <CsLineIcons icon="eye" className="me-1" />View
                                                        </Button>
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
                            <h6 className="text-muted mb-2">Seller</h6>
                            <Row className="mb-3">
                                <Col sm={6}><strong>{selectedRequest.sellerName}</strong></Col>
                                <Col sm={6} className="text-muted">{selectedRequest.sellerEmail}</Col>
                            </Row>
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
                                                    {moment(d.start_date).format('DD MMM')} → {moment(d.end_date).format('DD MMM YY')}
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
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
                                    <Form.Group>
                                        <Form.Label className="fw-bold">Select Ad Start Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={approvalDate}
                                            onChange={(e) => setApprovalDate(e.target.value)}
                                            min={moment().format('YYYY-MM-DD')}
                                        />
                                        <Form.Text className="text-muted">
                                            End date: start date + {selectedRequest.durations?.[0]?.duration_days || 30} days
                                        </Form.Text>
                                    </Form.Group>
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
