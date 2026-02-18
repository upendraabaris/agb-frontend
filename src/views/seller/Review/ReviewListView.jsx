import { React, useEffect, useState } from 'react';
import { useHistory, NavLink } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import { useLazyQuery, gql, useMutation, useQuery } from '@apollo/client';
import { Button, Modal, Form, Row, Col, Card, Image } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import moment from 'moment';
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
      superSellerId {
        companyName
      }
      companyName
      bill
      gstin
      pancardNo
      gstinComposition
      fullAddress
      city
      pincode
      companyDescription
      mobileNo
      email
      state
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
      overallrating
    }
  }
`;

const ADD_SELLER_REPLY = gql`
  mutation AddSellerReply($reviewId: ID!, $sellerId: ID!, $sellerReply: String!) {
    addSellerReply(reviewId: $reviewId, sellerId: $sellerId, sellerReply: $sellerReply) {
      review {
        sellerReply
        sellerReplyDate
      }
    }
  }
`;

const GET_USER_DETAIL = gql`
  query GetProfile {
    getProfile {
      id
      seller {
        id
      }
    }
  }
`;

function DetailSeller() {
  const title = 'Seller Reviews';
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const { data: data1 } = useQuery(GET_USER_DETAIL);
  const sellerId = data1?.getProfile?.seller?.id;
  const id = sellerId;
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const [GetSeller, { data, refetch }] = useLazyQuery(GET_SELLER, {
    variables: {
      getSellerId: id,
    },
    onCompleted: (response) => {
      console.log('GET_SELLER Response:');
    },
    onError: (error) => {
      console.error('GET_SELLER Error:', error);
    },
  });
  useEffect(() => {
    const fetchData = async () => {
      await GetSeller();
    };
    fetchData();
  }, [GetSeller]);

  const [addSellerReply] = useMutation(ADD_SELLER_REPLY, {
    onCompleted: () => {
      toast.success('Reply added successfully!');
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const [sellerReplyText, setSellerReplyText] = useState({});
  const [replyMessage, setReplyMessage] = useState('');
  const [hideReplyBox, setHideReplyBox] = useState(false);
  const [replyError, setReplyError] = useState({});

  const handleReplySubmit = async (reviewId) => {
    if (!sellerReplyText[reviewId]) {
      setReplyError((prev) => ({
        ...prev,
        [reviewId]: 'Reply is required!',
      }));
      return;
    }

    await addSellerReply({
      variables: {
        reviewId,
        sellerId: id,
        sellerReply: sellerReplyText[reviewId],
      },
    });

    // Clear text and hide textbox
    setSellerReplyText((prev) => ({
      ...prev,
      [reviewId]: '',
    }));

    setHideReplyBox((prev) => ({
      ...prev,
      [reviewId]: true,
    }));
  };

  return (
    <>
      <style>
        {`
      .blink-required {
        animation: blink 1s infinite;
        font-size: 1.2rem;
      }

      @keyframes blink {
        0% { opacity: 1; }
        50% { opacity: 0; }
        100% { opacity: 1; }
      }
    `}
      </style>
      {data && (
        <>
          <HtmlHead title={title} />
          <div className="page-title-container mb-2">
            <Row className="align-items-center">
              <Col className="col-auto d-flex align-items-center">
                <button type="button" className="muted-link pb-1 d-inline-block bg-transparent border-0" onClick={() => window.history.back()}>
                  <span className="text-dark ms-1">Back</span>
                </button>
                <span className="text-dark">/</span>
                <NavLink className="text-decoration-none d-flex align-items-center ms-2 me-2" to="#">
                  <span className="fw-medium text-dark ms-1">{title}</span>
                </NavLink>
              </Col>
            </Row>
          </div>

          <Row className="m-0 mb-3 p-1 rounded bg-white align-items-center">
            <Col md="6">
              <span className="fw-bold fs-5 pt-2"> {data.getSeller.companyName}</span>
              <div>
                {data.getSeller.overallrating ? (
                  <span className="text-success">
                    {'★'.repeat(Math.floor(data.getSeller.overallrating))}
                    {'☆'.repeat(5 - Math.floor(data.getSeller.overallrating))}
                    <span className="ms-1 text-dark">({data.getSeller.overallrating})</span>
                  </span>
                ) : (
                  'N/A'
                )}
              </div>
            </Col>
          </Row>
          <Row>
            <Col xl="12">
              <Card className="mb-1 shadow-sm bg-light">
                <Card.Body className="p-0">
                  {data.getSeller.review && data.getSeller.review.length > 0 ? (
                    [...data.getSeller.review].reverse().map((review, index) => (
                      <Card key={index} className="mb-3 border">
                        <Card.Body className="p-3">
                          <Row className="gy-2">
                            <Col md={12}>
                              <div>
                                <span className="text-success">
                                  {'★'.repeat(Math.floor(review.userRating))}
                                  {'☆'.repeat(5 - Math.floor(review.userRating))}
                                  <span className="ms-1 text-dark">({review.userRating})</span>
                                </span>
                              </div>
                            </Col>
                            <Col md={12}>
                              <div>{review.description || 'No review text.'}</div>
                            </Col>
                            <Col md={12}>
                              <div className="text-muted small">
                                {review.customerName || 'N/A'} | {moment(review.ratingDate).format('DD-MMM-YYYY')}
                              </div>
                            </Col>

                            {/* ⭐ Already saved reply show */}
                            {review.sellerReply && (
                              <Col md={12} className="m-2 p-2 alert alert-primary rounded">
                                <div>
                                  {' '}
                                  <strong>Seller Response:</strong> {review.sellerReply}
                                </div>
                                <small className="text-muted">{moment(review.sellerReplyDate).format('DD-MMM-YYYY')}</small>
                              </Col>
                            )}

                            {/* ⭐ Already saved reply show */}
                            {review.adminReply && (
                              <Col md={12} className="m-2 p-2 alert alert-info rounded">
                                <div>
                                  {' '}
                                  <strong>Admin Response:</strong> {review.adminReply}
                                </div>
                                <small className="text-muted">{moment(review.adminReplyDate).format('DD-MMM-YYYY')}</small>
                              </Col>
                            )}

                            {/* ⭐ Textbox Only When: No reply + Not hidden */}
                            {!review.sellerReply && !hideReplyBox[review.id] && (
                              <>
                                <Col md={12} className="mt-3">
                                  <Form.Control
                                    as="textarea"
                                    rows={2}
                                    placeholder="Write your reply..."
                                    value={sellerReplyText[review.id] || ''}
                                    onChange={(e) =>
                                      setSellerReplyText((prev) => ({
                                        ...prev,
                                        [review.id]: e.target.value,
                                      }))
                                    }
                                  />
                                  {replyError[review.id] && <div className="text-danger small mt-1">{replyError[review.id]}</div>}
                                </Col>

                                <Col md={12} className="mt-2">
                                  <Button variant="primary" size="sm" onClick={() => handleReplySubmit(review.id)}>
                                    Submit Reply
                                  </Button>
                                </Col>
                              </>
                            )}
                          </Row>
                        </Card.Body>
                      </Card>
                    ))
                  ) : (
                    <div className="w-100 bg-white text-center py-5 text-muted">No reviews found for this seller.</div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
}
export default DetailSeller;
