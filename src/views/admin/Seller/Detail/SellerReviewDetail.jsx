import { React, useEffect, useState } from 'react';
import { useParams, useHistory, NavLink } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import { Button, Modal, Form, Row, Col, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';

export const GET_SELLER = gql`
  query GetSeller($getSellerId: ID!) {
    getSeller(id: $getSellerId) {
      id
      user {
        firstName
        lastName
        mobileNo
        email
      }
      review {
        id
        description
        userRating
        customerName
        ratingDate
        sellerReply
        sellerReplyDate
        adminReply
        adminReplyDate
      }
      companyName
      overallrating
    }
  }
`;

const ADD_SELLER_REPLY = gql`
  mutation AddSellerReply($reviewId: ID!, $sellerId: ID!, $adminReply: String) {
    addSellerReply(reviewId: $reviewId, sellerId: $sellerId, adminReply: $adminReply) {
      review {
        sellerReply
        adminReply
      }
    }
  }
`;

const GET_SELLER_ORDER = gql`
  query GetOrderBySellerId($sellerId: ID) {
    getOrderBySellerId(sellerId: $sellerId) {
      id
      status
      totalAmount
      createdAt
    }
  }
`;

function DetailSeller() {
  const title = 'Seller Reviews';
  const description = 'Seller Reviews';
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const { id } = useParams();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyReview, setReplyReview] = useState(null);

  const [GetSeller, { data, refetch }] = useLazyQuery(GET_SELLER, {
    variables: {
      getSellerId: id,
    },
    onCompleted: (response) => {
      console.log('✅ GET_SELLER Response:', response);
    },
    onError: (error) => {
      console.error('❌ GET_SELLER Error:', error.message);
    },
  });
  const [GetOrderBySellerId, { data: orderData }] = useLazyQuery(GET_SELLER_ORDER, {
    variables: {
      sellerId: id,
    },
    onError: (err) => {
      console.log('GET_SELLER_ORDER', err);
    },
  });
  useEffect(() => {
    const fetchData = async () => {
      await GetSeller();
      await GetOrderBySellerId();
    };
    fetchData();
  }, [GetOrderBySellerId, GetSeller]);

  const [showInfo, setShowInfo] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const handleView = (reviewItem) => {
    setSelectedReview(reviewItem);
    setShowInfo(true);
  };

  const [addSellerReply] = useMutation(ADD_SELLER_REPLY, {
    onCompleted: () => {
      toast.success('Reply added successfully!');
      refetch();
      setShowReplyModal(false);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleReply = (reviewItem) => {
    setReplyReview(reviewItem);
    setReplyText('');
    setShowReplyModal(true);
  };

  const submitAdminReply = async () => {
    if (!replyText.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    await addSellerReply({
      variables: {
        reviewId: replyReview.id,
        sellerId: id,
        adminReply: replyText,
      },
    });
  };

  return (
    <>
      {data && (
        <>
          <HtmlHead title={title} description={description} />
          <div className="page-title-container mb-2">
            <Row className="g-0">
              <Col className="col-auto mb-3 mb-sm-0 me-auto">
                <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to={`/admin/seller/detail/${id}`}>
                  <span className="text-dark ms-1">Back</span>
                </NavLink>
                {' / '}
                <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to={`/admin/seller/detail/${id}`}>
                  <span className="text-dark ms-1">Seller Associate</span>
                </NavLink>
                {' / '}
                <span className="text-dark ms-1">{title}</span>
              </Col>
            </Row>
          </div>
          <Row className="m-0 mb-3 p-1 rounded bg-white align-items-center">
            <Col md="6">
              <div className="fw-bold fs-5 pt-2">{data?.getSeller?.companyName}</div>
              <span className="text-success">
                {'★'.repeat(Math.floor(data?.getSeller?.overallrating))}
                {'☆'.repeat(5 - Math.floor(data?.getSeller?.overallrating))}
                <span className="ms-1 text-dark">({data?.getSeller?.overallrating})</span>
              </span>
            </Col>
          </Row>
          <Row>
            <Col xl="12">
              <div className="bg-white">
                <Table bordered hover responsive className="align-middle bg-white">
                  <thead className="bg-light fw-bold text-dark">
                    <tr>
                      <th style={{ width: '30%' }}>Customer Review</th>
                      <th style={{ width: '30%' }}>Seller Review</th>
                      <th style={{ width: '25%' }}>Admin Review</th>
                      <th style={{ width: '15%' }} className="text-center">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.getSeller.review
                      ?.slice(0)
                      .reverse()
                      .map((reviewItem) => (
                        <tr key={reviewItem.id}>
                          <td>
                            <span className="text-truncate d-inline-block" style={{ maxWidth: '300px' }}>
                              <span className="text-success">
                                {'★'.repeat(Math.floor(reviewItem.userRating))}
                                {'☆'.repeat(5 - Math.floor(reviewItem.userRating))}
                                <span className="ms-1 text-dark">({reviewItem.userRating})</span>
                              </span>{' '}
                              {reviewItem.description}
                            </span>
                            <span className="fw-semibold text-muted small ">
                              <br />
                              {reviewItem.customerName} | {reviewItem.ratingDate}
                            </span>
                          </td>

                          <td>
                            <div className="fw-semibold text-dark small">
                              {reviewItem.sellerReply}
                              <br />
                              <span className="fw-semibold text-muted small ">{reviewItem.sellerReplyDate}</span>
                            </div>
                          </td>
                          <td>
                            <div className="fw-semibold text-dark small">
                              {reviewItem.adminReply} <br />
                              <span className="fw-semibold text-muted small ">{reviewItem.adminReplyDate}</span>
                            </div>
                          </td>

                          <td className="text-center">
                            <Button className="bg-info text-white me-2" size="sm" onClick={() => handleView(reviewItem)}>
                              Info
                            </Button>

                            <Button
                              className="bg-primary text-white"
                              size="sm"
                              onClick={() => handleReply(reviewItem)}
                              disabled={!!reviewItem.adminReply || !reviewItem.sellerReply}
                            >
                              {reviewItem.adminReply && 'Replied'}
                              {!reviewItem.adminReply && !reviewItem.sellerReply && 'Awaiting Seller Reply'}
                              {!reviewItem.adminReply && reviewItem.sellerReply && 'Reply'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </div>
            </Col>

            {selectedReview && (
              <Modal show={showInfo} onHide={() => setShowInfo(false)} centered size="md">
                <Modal.Body>
                  <div className="mb-3">
                    <span className="text-success">
                      {'★'.repeat(Math.floor(selectedReview.userRating))}
                      {'☆'.repeat(5 - Math.floor(selectedReview.userRating))}
                      <span className="ms-1 text-dark">({selectedReview.userRating})</span>
                    </span>
                    <div>{selectedReview.description}</div>
                    <div className="text-muted small">
                      {selectedReview.customerName} | {selectedReview.ratingDate}
                    </div>
                  </div>

                  {selectedReview.sellerReply && (
                    <div className="mb-3 p-2 bg-light rounded">
                      <strong>Seller Response:</strong>
                      <div className="text-dark">{selectedReview.sellerReply}</div>
                      <small className="text-muted">{selectedReview.sellerReplyDate}</small>
                    </div>
                  )}

                  {selectedReview.adminReply && (
                    <div className="mb-3 p-2 bg-light rounded">
                      <strong>Admin Response:</strong>
                      <div className="text-dark">{selectedReview.adminReply}</div>
                      <small className="text-muted">{selectedReview.adminReplyDate}</small>
                    </div>
                  )}
                </Modal.Body>

                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowInfo(false)}>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
            )}

            {showReplyModal && (
              <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)} centered>
                <Modal.Header className="p-3" closeButton>
                  <Modal.Title className="fw-bold">Write Admin Reply</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Reply Message</Form.Label>
                    <Form.Control as="textarea" rows={4} value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write your reply..." />
                  </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowReplyModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={submitAdminReply}>
                    Submit Reply
                  </Button>
                </Modal.Footer>
              </Modal>
            )}
          </Row>
        </>
      )}
    </>
  );
}
export default DetailSeller;
