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
        mobile_redirect_url
        desktop_redirect_url
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
  const [approvalDate, setApprovalDate] = useState('');
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

  // whenever a new request is selected or the proposed date changes, check slot availability
  React.useEffect(() => {
    if (selectedRequest && approvalDate) {
      checkAvailability({ variables: { requestId: selectedRequest.id, start_date: approvalDate } });
    } else {
      setAvailabilityResult(null);
    }
  }, [selectedRequest, approvalDate, checkAvailability]);

  React.useEffect(() => {
    if (selectedRequest) {
      const pref = selectedRequest.durations?.[0]?.start_preference || 'today';
      let defaultDate = moment().format('YYYY-MM-DD');
      if (pref === 'next_quarter') {
        const now = new Date();
        const m = now.getUTCMonth();
        const y = now.getUTCFullYear();
        if (m <= 2) defaultDate = moment(Date.UTC(y, 3, 1)).format('YYYY-MM-DD');
        else if (m <= 5) defaultDate = moment(Date.UTC(y, 6, 1)).format('YYYY-MM-DD');
        else if (m <= 8) defaultDate = moment(Date.UTC(y, 9, 1)).format('YYYY-MM-DD');
        else defaultDate = moment(Date.UTC(y + 1, 0, 1)).format('YYYY-MM-DD');
      }
      setApprovalDate(defaultDate);
    } else {
      setApprovalDate('');
    }
  }, [selectedRequest]);

  // compute projected total price if breakdown exists, otherwise estimate from first duration
  const computeProjectedTotal = () => {
    if (!selectedRequest?.durations || selectedRequest.durations.length === 0) return 0;
    const durFirst = selectedRequest.durations[0];
    if (durFirst.pricing_breakdown && durFirst.pricing_breakdown.length > 0) {
      return durFirst.pricing_breakdown.reduce((sum, b) => sum + (b.subtotal || 0), 0);
    }
    // fallback: estimate if no breakdown yet (shouldn't happen for pending requests)
    return durFirst.total_price || 0;
  };

  const [approveAd, { loading: approveLoading }] = useMutation(APPROVE_AD, {
    onCompleted: (response) => {
      if (response.approveAdRequest.success) {
        toast.success('Ad approved successfully!');
        setShowApprovalModal(false);
        setSelectedRequest(null);
        setApprovalDate('');
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
    if (!approvalDate) {
      toast.error('Please select a start date');
      return;
    }
    await approveAd({
      variables: {
        input: {
          requestId: selectedRequest.id,
          start_date: approvalDate,
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
    setApprovalDate('');
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
                        {media.mobile_redirect_url && (
                          <small className="text-break">
                            Redirect:{' '}
                            <a href={media.mobile_redirect_url} target="_blank" rel="noopener noreferrer">
                              {media.mobile_redirect_url}
                            </a>
                          </small>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              <hr />

              <h6 className="mb-3">Duration</h6>
              {selectedRequest.durations && selectedRequest.durations.length > 0 && (
                <div className="mb-3">
                  <small className="text-muted">Duration Days</small>
                  <div className="fw-bold">{selectedRequest.durations[0].duration_days} days</div>
                </div>
              )}
              {selectedRequest.durations && selectedRequest.durations.length > 0 && (
                <>
                  <div className="mb-3">
                    <small className="text-muted">Total Price</small>
                    <div className="fw-bold">₹{selectedRequest.durations[0].total_price || computeProjectedTotal()}</div>
                  </div>
                  {selectedRequest.durations[0].quarters_covered && selectedRequest.durations[0].quarters_covered.length > 0 && (
                    <div className="mb-3">
                      <small className="text-muted">Quarters Covered</small>
                      <div className="fw-bold">
                        {selectedRequest.durations[0].quarters_covered.join(', ')}
                      </div>
                    </div>
                  )}
                  {selectedRequest.durations[0].pricing_breakdown && selectedRequest.durations[0].pricing_breakdown.length > 0 && (
                    <div className="mb-3">
                      <small className="text-muted">Pricing Breakdown</small>
                      <ul className="mb-0">
                        {selectedRequest.durations[0].pricing_breakdown.map((b, i) => (
                          <li key={i}>{`${b.quarter}: ${b.days}d @ ₹${b.rate_per_day}/d = ₹${b.subtotal}`}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {selectedRequest.status === 'pending' && (
                <div className="mb-0">
                  <Form.Group className="mb-3">
                    <Form.Label>Select Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={approvalDate}
                      onChange={(e) => setApprovalDate(e.target.value)}
                      min={moment().format('YYYY-MM-DD')}
                    />
                    <Form.Text className="text-muted">
                      End date will be calculated as: {approvalDate && approvalDate} +{' '}
                      {selectedRequest.durations?.[0]?.duration_days || 30} days
                    </Form.Text>
                  </Form.Group>
                  <div className="mb-3">
                    <small className="text-muted">Projected Total Price</small>
                    {selectedRequest.status === 'pending' && (!selectedRequest.durations[0].pricing_breakdown || selectedRequest.durations[0].pricing_breakdown.length === 0) ? (
                      <div className="text-muted"><em>Will be calculated upon approval</em></div>
                    ) : (
                      <div className="fw-bold">₹{computeProjectedTotal()}</div>
                    )}
                  </div>
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
                approveLoading || !approvalDate ||
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
