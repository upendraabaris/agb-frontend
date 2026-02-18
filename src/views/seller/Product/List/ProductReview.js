import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner, Button, Modal, Image, Form } from 'react-bootstrap';
import { NavLink, useHistory } from 'react-router-dom';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const GET_REVIEWS_BY_SELLER = gql`
  query GetReviewsBySeller {
    getReviewsBySeller {
      id
      user {
        firstName
      }
      productId
      sellerId
      orderId
      images
      rating
      title
      description
      createdAt
      repliesSeller
      repliesSellerDate
    }
  }
`;

const GET_PRODUCTS_BY_SELLER = gql`
  query GetProductByForSeller {
    getProductByForSeller {
      id
      fullName
    }
  }
`;

const UPDATE_REVIEW_REPLY = gql`
  mutation UpdateReviewReply($updateReviewReplyId: ID!, $repliesSeller: String) {
    updateReviewReply(id: $updateReviewReplyId, repliesSeller: $repliesSeller) {
      id
      repliesSeller
    }
  }
`;

const ProductReview = () => {
  const title = 'Product Reviews';
  const description = 'All reviews given by customers on your products';
  const dispatch = useDispatch();
  const history = useHistory();

  const [productsMap, setProductsMap] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  // ✅ Define queries BEFORE useEffect
  const [getReviews, { loading: reviewLoading, data: reviewData }] = useLazyQuery(GET_REVIEWS_BY_SELLER, {
    onError: (error) => {
      toast.error(error.message || 'Something went wrong!');
      if (error.message === 'Authorization header is missing' || error.message === 'jwt expired') {
        setTimeout(() => history.push('/login'), 1500);
      }
    },
  });

  const [getProducts, { data: productData }] = useLazyQuery(GET_PRODUCTS_BY_SELLER, {
    onError: (error) => toast.error(error.message || 'Failed to load products'),
  });

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
  }, [dispatch]);

  // ✅ Run queries after they are defined
  useEffect(() => {
    getReviews();
    getProducts();
  }, [getReviews, getProducts]);

  useEffect(() => {
    if (productData?.getProductByForSeller) {
      const map = {};
      productData.getProductByForSeller.forEach((p) => {
        map[p.id] = p.fullName;
      });
      setProductsMap(map);
    }
  }, [productData]);

  const handleView = (review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedReview(null);
  };

  const handleReply = (review) => {
    setSelectedReview(review);
    setShowReplyModal(true);
  };

  const handleReplyClose = () => {
    setShowReplyModal(false);
    setReplyMessage('');
  };

  const [updateReviewReply, { loading: replyLoading }] = useMutation(UPDATE_REVIEW_REPLY, {
    onCompleted: () => {
      toast.success('Reply submitted successfully!');
      setShowReplyModal(false);
      setReplyMessage('');
      getReviews(); // refresh reviews after reply
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit reply!');
    },
  });

  const handleReplySubmit = async () => {
    if (!replyMessage.trim()) {
      toast.error('Please write your reply!');
      return;
    }

    try {
      await updateReviewReply({
        variables: {
          updateReviewReplyId: selectedReview.id,
          repliesSeller: replyMessage,
        },
      });
    } catch (err) {
      toast.error(err.message || 'Failed to update reply');
    }
  };

  let content;
  if (reviewLoading) {
    content = (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  } else if (reviewData && reviewData.getReviewsBySeller.length > 0) {
    content = (
      <>
        <Row className="g-0 mb-2 d-none d-lg-flex p-2 bg-white rounded shadow-sm">
          <Col xs="auto" className="sw-11 d-none d-lg-flex" />
          <Col>
            <Row className="g-0 align-content-center ps-5 pe-4 fw-bold text-dark">
              <Col lg="2">Product Name</Col>
              <Col lg="3">Review Title</Col>
              <Col lg="2" className="text-center">
                Rating
              </Col>
              <Col lg="2" className="text-center">
                Date
              </Col>
              <Col lg="2" className="text-center">
                Action
              </Col>
            </Row>
          </Col>
        </Row>

        {reviewData.getReviewsBySeller
          ?.slice(0)
          .reverse()
          .map((review) => (
            <Card key={review.id} className="mb-2 hover-border-primary shadow-sm">
              <Row className="g-0 align-items-center">
                <Col xs="auto" className="p-2">
                  {review.images && review.images.length > 0 ? (
                    <img src={review.images[0]} alt="review" className="border rounded p-1" style={{ width: '70px', height: '70px', objectFit: 'cover' }} />
                  ) : (
                    <div className="border rounded d-flex align-items-center justify-content-center bg-light" style={{ width: '70px', height: '70px' }}>
                      <CsLineIcons icon="image" size="20" className="text-muted" />
                    </div>
                  )}
                </Col>

                <Col className="py-3 ps-5 pe-4">
                  <Row className="align-items-center">
                    <Col
                      lg="2"
                      className="text-dark small"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {productsMap[review.productId] || review.productId}
                    </Col>
                    <Col lg="3">
                      <div className="fw-bold text-dark text-truncate">{review.title}</div>
                      <div
                        className="text-dark small"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {review.description}
                      </div>
                    </Col>
                    <Col lg="2" className="text-center">
                      <span className="text-success">
                        {'★'.repeat(Math.floor(review.rating))}
                        {'☆'.repeat(5 - Math.floor(review.rating))}
                        <span className="ms-1 text-dark">({review.rating})</span>
                      </span>
                    </Col>
                    <Col lg="2" className="text-center text-dark small">
                      {moment(parseInt(review?.createdAt, 10)).format('DD-MMM-yy')}
                    </Col>
                    <Col lg="2" className="text-center">
                      <Button className="bg-info text-white" size="sm" onClick={() => handleView(review)}>
                        Info
                      </Button>{' '}
                      <Button className="bg-primary text-white" size="sm" onClick={() => handleReply(review)} disabled={!!review.repliesSeller}>
                        {review.repliesSeller ? 'Replied' : 'Reply'}
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          ))}
      </>
    );
  } else {
    content = <div className="text-center text-dark fw-bold mt-5">No reviews found.</div>;
  }

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-1">
        <Row className="g-0">
          <Col>
            <button type="button" className="muted-link pb-1 d-inline-block bg-transparent border-0" onClick={() => window.history.back()}>
              <span className="text-dark ms-1">Back</span>
            </button>
            <span className="small p-2">/</span>
            <span className="text-dark">{title}</span>
          </Col>
        </Row>
      </div>

      <div className="d-flex bg-white mb-2 rounded p-2 flex-wrap align-items-center justify-content-between">
        <h1 className="mb-0 pb-0 fw-bold text-dark h4 ms-2">{title}</h1>
      </div>

      {content}

      <Modal show={showModal} onHide={handleClose} size="lg" centered>
        <Modal.Body className="pt-3 pb-2">
          {selectedReview && (
            <Row className="align-items-start">
              <p>
                <b className="text-primary">{productsMap[selectedReview.productId] || 'N/A'}</b>
              </p>
              <Col md={4} className="text-cente r">
                {selectedReview.images?.[0] ? (
                  <Image src={selectedReview.images[0]} thumbnail style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 10 }} />
                ) : (
                  <div className="border rounded d-flex align-items-center justify-content-center bg-light mx-auto" style={{ width: 120, height: 120 }}>
                    <CsLineIcons icon="image" size="40" className="text-muted" />
                  </div>
                )}
              </Col>

              <Col md={8}>
                <div>
                  {selectedReview.rating} ⭐ <b>{selectedReview.title}</b>
                </div>
                <div>{selectedReview.description}</div>
                <div className="small">
                  {selectedReview.user?.firstName || 'N/A'} | {moment(+selectedReview.createdAt).format('DD/MM/YY h:mm:ss a')}
                </div>
                <div className="pt-2 border-top mt-2">{selectedReview.repliesSeller || 'No reply from seller yet.'}</div>
                {selectedReview.repliesSellerDate && selectedReview.repliesSellerDate.trim() !== '' && (
                  <div className="small">Seller's Response | {selectedReview.repliesSellerDate}</div>
                )}
              </Col>

              {selectedReview.images?.length > 1 && (
                <Col xs={12} className="mt-2 d-flex flex-wrap gap-2">
                  {selectedReview.images.slice(1).map((img, i) => (
                    <Image key={i} src={img} thumbnail style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 6 }} />
                  ))}
                </Col>
              )}
            </Row>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showReplyModal} onHide={handleReplyClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Seller's Response</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedReview && (
            <>
              <p>
                {selectedReview.rating} ⭐ <b>{selectedReview.title}</b>
              </p>
              <p>{selectedReview.description}</p>
              <Form.Group>
                <Form.Label>Write your reply</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here..."
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleReplyClose}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleReplySubmit} disabled={replyLoading}>
            {replyLoading ? 'Submitting...' : 'Submit Reply'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProductReview;
