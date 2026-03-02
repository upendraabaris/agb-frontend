import React, { useState } from 'react';
import { useQuery, useMutation, gql, useLazyQuery } from '@apollo/client';
import { Row, Col, Card, Button, Badge, Modal, Form, Spinner, Alert, Table } from 'react-bootstrap';
import moment from 'moment';
import { toast } from 'react-toastify';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { NavLink } from 'react-router-dom';

const GET_AD_REQUESTS = gql`
  query GetAdRequestsForApproval($status: String) {
    getAdRequestsForApproval(status: $status) {
      id
      seller_id
      sellerName
      sellerEmail
      category_id
      categoryName
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
      }
      createdAt
      updatedAt
    }
  }
`;

const CHECK_SLOT_AVAILABILITY = gql`
  query CheckSlotAvailability($requestId: ID!, $start_date: String!) {
    checkSlotAvailability(requestId: $requestId, start_date: $start_date) {
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

const APPROVE_AD = gql`
  mutation ApproveAdRequest($input: ApproveAdRequestInput!) {
    approveAdRequest(input: $input) {
      success
      message
      data {
        id
        status
      }
    }
  }
`;

const REJECT_AD = gql`
  mutation RejectAdRequest($input: RejectAdRequestInput!) {
    rejectAdRequest(input: $input) {
      success
      message
      data {
        id
        status
      }
    }
  }
`;

function AdApproval() {
  const title = 'Ad Approvals';
  const description = 'Manage and approve seller advertisements';

  const [currentFilter, setCurrentFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [allRequests, setAllRequests] = useState([]);

  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [checkAvailability, { loading: checkingAvailability }] = useLazyQuery(
    CHECK_SLOT_AVAILABILITY,
    {
      fetchPolicy: 'network-only',
      onCompleted: (data) => {
        if (data && data.checkSlotAvailability) {
          setAvailabilityResult(data.checkSlotAvailability);
        } else {
          setAvailabilityResult(null);
        }
      },
      onError: () => {
        setAvailabilityResult(null);
      }
    }
  );

  const { loading, error, data, refetch } = useQuery(GET_AD_REQUESTS, {
    variables: { status: currentFilter },
    fetchPolicy: 'network-only',
  });

  // Update allRequests when data changes
  React.useEffect(() => {
    if (data?.getAdRequestsForApproval) {
      setAllRequests(data.getAdRequestsForApproval);
    }
  }, [data]);

  // whenever a new request is selected, check slot availability using stored start_date
  React.useEffect(() => {
    const storedStartDate = selectedRequest?.durations?.[0]?.start_date;
    if (selectedRequest && storedStartDate) {
      checkAvailability({ variables: { requestId: selectedRequest.id, start_date: storedStartDate } });
    } else {
      setAvailabilityResult(null);
    }
  }, [selectedRequest, checkAvailability]);

  // compute projected total price across ALL durations/slots
  const computeProjectedTotal = () => {
    if (!selectedRequest?.durations || selectedRequest.durations.length === 0) return 0;
    return selectedRequest.durations.reduce((total, dur) => {
      if (dur.pricing_breakdown && dur.pricing_breakdown.length > 0) {
        return total + dur.pricing_breakdown.reduce((sum, b) => sum + (b.subtotal || 0), 0);
      }
      return total + (dur.total_price || 0);
    }, 0);
  };

  // human-readable slot label
  const slotLabel = (slot) => {
    if (!slot) return 'Unknown Slot';
    const match = slot.match(/^(banner|stamp)(\d+)$/i);
    if (match) return `${match[1].charAt(0).toUpperCase() + match[1].slice(1)} ${match[2]}`;
    return slot;
  };

  const [approveAd, { loading: approveLoading }] = useMutation(APPROVE_AD, {
    onCompleted: (response) => {
      if (response.approveAdRequest.success) {
        toast.success(response.approveAdRequest.message || 'Ad approved successfully!');
        setShowApprovalModal(false);
        setSelectedRequest(null);
        refetch();
      }
    },
    onError: (approvalError) => {
      toast.error(approvalError.message || 'Failed to approve ad');
    },
  });

  const [rejectAd, { loading: rejectLoading }] = useMutation(REJECT_AD, {
    onCompleted: (response) => {
      if (response.rejectAdRequest.success) {
        toast.success('Ad rejected successfully!');
        setShowRejectionModal(false);
        setSelectedRequest(null);
        setRejectionReason('');
        refetch();
      }
    },
    onError: (rejectionError) => {
      toast.error(rejectionError.message || 'Failed to reject ad');
    },
  });

  const handleApprove = async () => {
    await approveAd({
      variables: {
        input: {
          requestId: selectedRequest.id,
        },
      },
    });
  };

  const handleReject = async () => {
    await rejectAd({
      variables: {
        input: {
          requestId: selectedRequest.id,
          rejection_reason: rejectionReason || null,
        },
      },
    });
  };

  const handleFilterChange = (newFilter) => {
    setCurrentFilter(newFilter);
    setSelectedRequest(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
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

  const requests = allRequests;

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
          </Col>
        </Row>
      </div>

      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex gap-2 flex-wrap">
            <Button
              variant={currentFilter === 'all' ? 'primary' : 'outline-primary'}
              onClick={() => handleFilterChange('all')}
            >
              All
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
              Approved
            </Button>
            <Button
              variant={currentFilter === 'rejected' ? 'danger' : 'outline-danger'}
              onClick={() => handleFilterChange('rejected')}
            >
              Rejected
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          {error && (
            <Alert variant="danger">
              <CsLineIcons icon="warning-hexagon" className="me-2" />
              Error loading requests: {error.message}
            </Alert>
          )}

          {loading && (
            <div className="text-center">
              <Spinner animation="border" role="status" />
            </div>
          )}

          {!loading && requests.length === 0 && (
            <Alert variant="info" className="mb-0">
              <CsLineIcons icon="info" className="me-2" />
              No ad requests found.
            </Alert>
          )}

          {!loading && requests.length > 0 && (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Seller</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Images</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <div className="fw-bold">{request.sellerName}</div>
                        <div className="text-muted text-small">{request.sellerEmail}</div>
                      </td>
                      <td>{request.categoryName}</td>
                      <td>{getStatusBadge(request.status)}</td>
                      <td>
                        <small className="text-muted">
                          {moment(request.createdAt).format('DD MMM YYYY')}
                        </small>
                      </td>
                      <td>
                        {request.medias && request.medias.length > 0 ? (
                          <div className="d-flex gap-1">
                            {request.medias.slice(0, 2).map((media) => (
                              <img
                                key={media.id}
                                src={media.mobile_image_url || media.desktop_image_url}
                                alt="Ad"
                                style={{
                                  maxWidth: '40px',
                                  maxHeight: '40px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                }}
                                data-bs-toggle="modal"
                                data-bs-target={`#imageModal${media.id}`}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        {request.status === 'pending' && (
                          <div className="d-flex gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowApprovalModal(true);
                              }}
                            >
                              <CsLineIcons icon="check" className="me-1" />
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowRejectionModal(true);
                              }}
                            >
                              <CsLineIcons icon="close" className="me-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        {request.status !== 'pending' && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowApprovalModal(true);
                            }}
                          >
                            <CsLineIcons icon="eye" className="me-1" />
                            View
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Approval Modal */}
      <Modal show={showApprovalModal} onHide={() => setShowApprovalModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedRequest?.status === 'pending' ? 'Approve Advertisement' : 'View Details'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div>
              <h6 className="mb-3">Seller Information</h6>
              <div className="mb-3">
                <small className="text-muted">Name</small>
                <div className="fw-bold">{selectedRequest.sellerName}</div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Email</small>
                <div className="fw-bold">{selectedRequest.sellerEmail}</div>
              </div>

              <hr />

              <h6 className="mb-3">Advertisement Details</h6>
              <div className="mb-3">
                <small className="text-muted">Category</small>
                <div className="fw-bold">{selectedRequest.categoryName}</div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Status</small>
                <div>{getStatusBadge(selectedRequest.status)}</div>
              </div>

              <hr />

              <h6 className="mb-3">Media</h6>
              <div className="row g-2 mb-3">
                {selectedRequest.medias &&
                  selectedRequest.medias.map((media) => (
                    <div key={media.id} className="col-md-6">
                      <div className="card p-2">
                        <img
                          src={media.mobile_image_url || media.desktop_image_url}
                          alt={media.slot}
                          style={{ maxWidth: '100%', borderRadius: '4px', marginBottom: '8px' }}
                        />
                        <small className="text-muted">Slot: {media.slot}</small>
                        <small>Type: {media.media_type}</small>
                        {media.redirect_url && (
                          <small className="text-break">
                            Redirect:{' '}
                            <a href={media.redirect_url} target="_blank" rel="noopener noreferrer">
                              {media.redirect_url}
                            </a>
                          </small>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              <hr />

              <h6 className="mb-3">Duration & Pricing</h6>
              {selectedRequest.durations && selectedRequest.durations.length > 0 && (
                <>
                  {/* Per-slot breakdown */}
                  {selectedRequest.durations.map((dur) => (
                    <Card key={dur.id} className="mb-3 border">
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong>{slotLabel(dur.slot)}</strong>
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
                              {dur.pricing_breakdown.map((b, i) => (
                                <li key={i}>
                                  <strong>{b.quarter}</strong>
                                  {b.start && b.end && ` (${new Date(b.start).toLocaleDateString()} – ${new Date(b.end).toLocaleDateString()})`}
                                  : {b.days}d × ₹{b.rate_per_day}/d = ₹{b.subtotal}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="text-end">
                          <small className="text-muted">Slot Total: </small>
                          <strong>₹{dur.total_price || (dur.pricing_breakdown ? dur.pricing_breakdown.reduce((s, b) => s + (b.subtotal || 0), 0) : 0)}</strong>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}

                  {/* Grand total */}
                  <div className="mb-3 p-3 bg-light rounded d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Grand Total ({selectedRequest.durations.length} slot{selectedRequest.durations.length > 1 ? 's' : ''})</h6>
                    <h5 className="mb-0 text-primary">₹{computeProjectedTotal()}</h5>
                  </div>
                </>
              )}

              {selectedRequest.status === 'pending' && (
                <div className="mb-0">
                  {availabilityResult && (
                    <div className="mb-3">
                      <small className="text-muted">Slot availability</small>
                      {availabilityResult.available ? (
                        <div className="text-success">✓ All slots free for the chosen quarters.</div>
                      ) : (
                        <div className="text-danger">
                          <strong>✗ Conflicts detected:</strong>
                          <ul className="mb-0">
                            {availabilityResult.details.map((d) => (
                              <li key={d.slot}>
                                {d.slot}: Already booked{d.conflictQuarters ? ` in ${d.conflictQuarters}` : ''}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>
            Cancel
          </Button>
          {selectedRequest?.status === 'pending' && (
            <Button
              variant="success"
              onClick={handleApprove}
              disabled={
                approveLoading ||
                (availabilityResult && !availabilityResult.available)
              }
            >
              {approveLoading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
              Approve
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Rejection Modal */}
      <Modal show={showRejectionModal} onHide={() => setShowRejectionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Advertisement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div>
              <p>
                <strong>Seller:</strong> {selectedRequest.sellerName}
              </p>
              <p>
                <strong>Category:</strong> {selectedRequest.categoryName}
              </p>
              <Form.Group>
                <Form.Label>Rejection Reason (Optional)</Form.Label>
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
          <Button variant="secondary" onClick={() => setShowRejectionModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject} disabled={rejectLoading}>
            {rejectLoading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
            Reject
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AdApproval;
