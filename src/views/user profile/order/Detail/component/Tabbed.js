import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Row, Col, Button, Card, Modal, Form } from 'react-bootstrap';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { withRouter } from 'react-router-dom';
import Rating from 'react-rating';
import { toast } from 'react-toastify';
import moment from 'moment';
import ItemTraking from './ItemTraking';

const GET_BILL = gql`
  query GetBillByPackedId($packedId: String) {
    getBillByPackedId(packedID: $packedId) {
      id
      packedID
      billNumber
      createdAt
      customer_issue_title
      customer_issue
      customer_issue_date
      accounts_status
    }
  }
`;

const REVIEW_PRODUCT = gql`
  mutation CreateReview($productId: ID!, $rating: Int!, $sellerId: ID, $orderId: ID, $title: String, $description: String, $reviewImages: [Upload]) {
    createReview(
      productId: $productId
      rating: $rating
      sellerId: $sellerId
      orderId: $orderId
      title: $title
      description: $description
      reviewImages: $reviewImages
    ) {
      id
    }
  }
`;

const UPDATE_SELLER_REVIEW = gql`
  mutation UpdateSellerReview($updateSellerReviewId: ID!, $description: String, $rating: Float) {
    updateSellerReview(id: $updateSellerReviewId, description: $description, rating: $rating) {
      id
      review {
        description
        userRating
      }
    }
  }
`;

const CUSTOMER_ISSUE = gql`
  mutation CustomerIssue($customerIssueId: ID!, $customerIssue: String, $customerIssueTitle: String, $images: [Upload]) {
    customerIssue(id: $customerIssueId, customer_issue: $customerIssue, customer_issue_title: $customerIssueTitle, images: $images) {
      id
    }
  }
`;

const GETREVIEWBYORDERID = gql`
  query GetReviewByOrderId($getReviewByOrderIdId: ID!) {
    getReviewByOrderId(id: $getReviewByOrderIdId) {
      id
      orderId
      productId
      sellerId
      description
      title
      rating
    }
  }
`;

function Tabbed({ orderDetailData, id, history }) {
  const [packageIdentifier1, setpackageIdentifier] = useState([]);
  const { currentUser } = useSelector((state) => state.auth);
  const isLoggedIn = currentUser?.id === orderDetailData?.getOrder?.user?.id;
  const userId = orderDetailData?.getOrder?.user?.id;

  useEffect(() => {
    const handlepackeditem = async () => {
      if (orderDetailData?.getOrder) {
        const { orderProducts } = orderDetailData.getOrder;
        if (orderProducts) {
          const groupedProducts = orderProducts.reduce((acc, product) => {
            const { packageIdentifier } = product;
            if (packageIdentifier) {
              if (!acc[packageIdentifier]) {
                acc[packageIdentifier] = { packageIdentifier, products: [] };
              }
              acc[packageIdentifier].products.push(product);
            }
            return acc;
          }, {});
          const groupedProductsArray = Object.values(groupedProducts);
          setpackageIdentifier(groupedProductsArray);
        }
      }
    };
    if (orderDetailData?.getOrder) {
      handlepackeditem();
    }
  }, [orderDetailData]);

  const [GetBillByPackedId, { data: dataBill }] = useLazyQuery(GET_BILL, {
    onCompleted: (data) => {
      console.log(' ');
    },
    onError: (error) => {
      console.error('❌ GET_BILL error:', error);
    },
  });

  useEffect(() => {
    if (packageIdentifier1?.[0]?.packageIdentifier) {
      GetBillByPackedId({
        variables: { packedId: packageIdentifier1[0].packageIdentifier },
      });
    }
  }, [packageIdentifier1]);

  useEffect(() => {
    if (dataBill) {
      // console.log('✅ dataBill:', dataBill);
    }
  }, [dataBill]);

  const createInvoice = (item2, billno, createdDate) => {
    history.push(`/invoice?orderID=${orderDetailData?.getOrder?.id}`, {
      data: item2,
      billno,
      createdDate,
    });
  };

  const downloadInvoice = async (item1) => {
    const { packageIdentifier } = item1;
    const { data } = await GetBillByPackedId({
      variables: {
        packedId: packageIdentifier,
      },
    });
    if (data?.getBillByPackedId?.billNumber) {
      createInvoice(item1, data?.getBillByPackedId?.billNumber, data?.getBillByPackedId?.createdAt);
    }
  };

  const initialState = {
    product: null,
    title: '',
    reviewImages: [],
    description: '',
  };

  const [formData, setFormData] = useState(initialState);
  const [formErrors, setFormErrors] = useState({});
  const [reviewModal, setreviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const handleReview = (product) => {
    setreviewModal(true);
    setFormData((prev) => ({
      ...prev,
      product,
    }));
  };

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (name === 'reviewImages') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: files,
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  const [CreateReview, { loading }] = useMutation(REVIEW_PRODUCT, {
    onCompleted: () => {
      setFormData(initialState);
      setreviewModal(false);
    },
    onError: (err) => {
      console.log('REVIEW_PRODUCT', err);
    },
  });

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required.';
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required.';
    }
    if (rating === 0) {
      errors.rating = 'Rating is required.';
    }
    return errors;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errors = await validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    const { product, reviewImages, description, title } = formData;
    await CreateReview({
      variables: {
        productId: product.productId.id,
        sellerId: product.locationId.sellerId.id,
        orderId: id,
        rating,
        reviewImages,
        description,
        title,
      },
    });
    setreviewModal(false);
    setFormData(initialState);
    toast.success('Product Review submitted successfully!');
  };

  const [sellerReviewModal, setSellerReviewModal] = useState(false);
  const [sellerRating, setSellerRating] = useState(0);
  const [sellerReviewData, setSellerReviewData] = useState({
    id: '',
    description: '',
  });

  const [updateSellerReview, { loading: sellerReviewLoading }] = useMutation(UPDATE_SELLER_REVIEW, {
    onCompleted: () => {
      setSellerReviewData({ id: '', description: '' });
      setSellerRating(0);
      setSellerReviewModal(false);
      toast.success('Seller Review submitted successfully!');
    },
    onError: (err) => {
      console.log('UPDATE_SELLER_REVIEW', err);
    },
  });

  const handleSellerReview = (sellerId, existingReview) => {
    setSellerReviewModal(true);
    setSellerReviewData({
      id: sellerId,
      description: existingReview?.description || '',
    });
    setSellerRating(existingReview?.userRating || 0);
  };

  const submitSellerReview = async (e) => {
    e.preventDefault();

    if (!sellerReviewData.description.trim() || sellerRating === 0) {
      toast.error('Please provide both a description and a rating.');
      return;
    }

    await updateSellerReview({
      variables: {
        updateSellerReviewId: sellerReviewData.id,
        description: sellerReviewData.description,
        rating: sellerRating,
      },
    });
  };

  const [customerIssueModal, setCustomerIssueModal] = useState(false);
  const [customerIssueText, setCustomerIssueText] = useState('');
  const [currentBillId, setCurrentBillId] = useState(null);
  const [customerIssueTitle, setCustomerIssueTitle] = useState('');
  const [customerIssueImages, setCustomerIssueImages] = useState([]);

  const [customerIssueMutation, { loading: issueLoading }] = useMutation(CUSTOMER_ISSUE, {
    onCompleted: () => {
      toast.success('Issue submitted successfully!');
      setCustomerIssueText('');
      setCustomerIssueModal(false);
    },
    onError: (err) => {
      console.error('CUSTOMER_ISSUE', err);
      toast.error('Something went wrong!');
    },
  });

  const handleCustomerIssue = async (packedId) => {
    try {
      const { data } = await GetBillByPackedId({
        variables: { packedId },
      });

      if (data?.getBillByPackedId?.id) {
        setCurrentBillId(data.getBillByPackedId.id);
        setCustomerIssueModal(true);
      } else {
        toast.error('Invoice Number not found for this package.');
      }
    } catch (error) {
      console.error('❌ Error fetching invoice for issue:', error);
      toast.error('Something went wrong while fetching bill details.');
    }
  };

  const submitCustomerIssue = async (e) => {
    e.preventDefault();

    if (!customerIssueTitle.trim()) {
      toast.error('Please enter issue title.');
      return;
    }

    if (!customerIssueText.trim()) {
      toast.error('Please write your issue.');
      return;
    }

    if (!currentBillId) {
      toast.error('Invoice ID not found.');
      return;
    }

    try {
      await customerIssueMutation({
        variables: {
          customerIssueId: currentBillId,
          customerIssue: customerIssueText,
          customerIssueTitle,
          images: customerIssueImages,
        },
      });

      setCustomerIssueText('');
      setCustomerIssueTitle('');
      setCustomerIssueImages([]);
      setCustomerIssueModal(false);
    } catch (error) {
      toast.error('Something went wrong while submitting issue.');
    }
  };

  const [getReviewByOrderId, { data: reviewData }] = useLazyQuery(GETREVIEWBYORDERID, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (id) {
      getReviewByOrderId({ variables: { getReviewByOrderIdId: id } });
    }
  }, [id]);

  return (
    <>
      {packageIdentifier1.length > 0 &&
        packageIdentifier1.map((pakage, index) => (
          <Row className="g-2 mb-3" key={index}>
            <Col>
              <Card>
                <div className="h-100 align-items-center">
                  <Row className="g-0 mb-4">
                    {pakage?.products.length > 0 && (
                      <div className="d-flex justify-content-around rounded-top bg_color p-2">
                        <div className="text-white col text-start">Sold by: {pakage?.products[0].locationId?.sellerId?.companyName}</div>
                        <div className="text-white float-end"> {pakage.products[0].productStatus}</div>
                      </div>
                    )}
                    {pakage.products[0].delivered && isLoggedIn && (
                      <div>
                        <Button
                          style={{
                            fontSize: '12px',
                            padding: '4px 12px',
                            borderRadius: '5px',
                            background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
                            border: 'none',
                            color: 'white',
                            width: '110px',
                          }}
                          onClick={() => downloadInvoice(pakage)}
                          className="float-end border p-1 ps-2 px-2 text-white"
                        >
                          Download Invoice
                        </Button>
                      </div>
                    )}
                  </Row>
                  <ItemTraking tracking={pakage.products[0]} />
                  <Row className="g-0 p-1">
                    {pakage?.products.length > 0 &&
                      pakage.products.map((cart, index1) => (
                        <Row key={index1} className="g-0 mb-1 border-top pt-2 pb-2">
                          <Col xs="auto">
                            <img
                              src={cart.productId.thumbnail || (cart.productId.images.length > 0 && cart.productId.images[0])}
                              className="mx-auto img-thumbnail rounded-md sw-10"
                              alt="thumb"
                            />
                          </Col>
                          <Col>
                            <div className="ps-4 pt-0 pb-0 pe-0 h-100">
                              <Row className="g-0 h-100 align-items-start align-content-center">
                                <Col xs="12" className="d-flex flex-column mb-0">
                                  <div className="d-flex justify-content-between">
                                    {cart.productId.fullName} {cart.variantId.variantName}
                                  </div>
                                  <div className="text-dark"> Brand Name: {cart.productId.brand_name}</div>
                                </Col>
                                <Col xs="12" className="d-flex flex-column mb-md-0 pt-1">
                                  <Row className="g-0">
                                    <Col xs="6" className="d-flex flex-row pe-2 align-items-end">
                                      <span> ₹ {(cart.price / cart.quantity).toFixed(2)}</span>
                                      <span className="text-dark ms-1 me-1">x</span>
                                      <span>{cart.quantity}</span>
                                    </Col>
                                    <Col xs="6" className="d-flex flex-row align-items-end justify-content-end">
                                      <span>
                                        <span className="text-small">₹ </span>
                                        {cart.price.toFixed(2)}
                                      </span>
                                    </Col>
                                  </Row>
                                </Col>
                              </Row>
                            </div>
                          </Col>
                          <Col xs="12" className="d-flex justify-content-end align-items-center w-100 border-top pt-3">
                            <div className="d-flex justify-content-between">
                              {cart?.productStatus === 'Order Delivered' ? (
                                <div className="d-inline-block">
                                  {isLoggedIn && (
                                    <Button
                                      onClick={() => handleReview(cart)}
                                      style={{
                                        fontSize: '12px',
                                        padding: '4px 12px',
                                        borderRadius: '5px',
                                        background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
                                        border: 'none',
                                        color: 'white',
                                      }}
                                    >
                                      Product Review
                                    </Button>
                                  )}
                                </div>
                              ) : null}
                              {/* {cart?.productStatus === 'Order Delivered' && (
                                <div className="d-inline-block">
                                  {reviewData?.getReviewByOrderId?.some(
                                    (rev) => rev.productId === cart.productId.id && rev.sellerId === cart.locationId.sellerId.id
                                  )
                                    ? reviewData.getReviewByOrderId
                                        .filter((rev) => rev.productId === cart.productId.id && rev.sellerId === cart.locationId.sellerId.id)
                                        .map((rev, idx) => (
                                          <div key={idx}>
                                            <div className="d-flex align-items-center mb-2">
                                              {rev?.rating > 0 && (
                                                <Rating
                                                  readonly
                                                  initialRating={rev?.rating}
                                                  emptySymbol={<i className="cs-star" />}
                                                  fullSymbol={<i className="cs-star-full text-success" />}
                                                />
                                              )}
                                              <h5 className="fw-bolder ps-2 mt-1">{rev?.title}</h5>
                                            </div>
                                            <p className="mb-2">{rev?.description}</p>
                                          </div>
                                        ))
                                    : isLoggedIn && (
                                        <Button
                                          onClick={() => handleReview(cart)}
                                          style={{
                                            fontSize: '12px',
                                            padding: '4px 12px',
                                            borderRadius: '5px',
                                            background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
                                            border: 'none',
                                            color: 'white',
                                          }}
                                        >
                                          Product Review
                                        </Button>
                                      )}
                                </div>
                              )} */}
                            </div>
                          </Col>
                        </Row>
                      ))}
                  </Row>
                  <Row className="g-0 p-1">
                    {pakage.products[0].delivered && isLoggedIn && (
                      <div className="d-flex justify-content-end align-items-center w-100 pt-2 pb-2 border-top border-bottom">
                        <Button
                          onClick={() =>
                            handleSellerReview(pakage?.products[0].locationId?.sellerId?.id, pakage?.products[0].locationId?.sellerId?.review?.[0])
                          }
                          style={{
                            fontSize: '12px',
                            padding: '4px 12px',
                            borderRadius: '5px',
                            background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
                            border: 'none',
                            color: 'white',
                            width: '110px',
                          }}
                        >
                          Seller Review
                        </Button>
                      </div>
                    )}
                    {/* {pakage.products[0].delivered && isLoggedIn && (
                      <div className="d-flex justify-content-end align-items-center w-100 pt-2 pb-2 border-top border-bottom">
                        {(() => {
                          const seller = pakage?.products[0].locationId?.sellerId;
                          const reviews = seller?.review || [];
                          const hasReviewed = reviews.some((rev) => rev.user === userId && rev.seller === seller?.id);

                          return hasReviewed ? (
                            <NavLink
                              to={`/SellerReview/${seller?.id}`}
                              target="_blank"
                              className="text-success fw-bold small m-0"
                              style={{ textDecoration: 'underline', cursor: 'pointer' }}
                            >
                              Review Submitted 🔗
                            </NavLink>
                          ) : (
                            <Button
                              onClick={() => handleSellerReview(seller?.id)}
                              className="px-3 py-1"
                              style={{
                                fontSize: '12px',
                                borderRadius: '5px',
                                background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
                                border: 'none',
                                color: 'white',
                                width: '110px',
                              }}
                            >
                              Seller Review
                            </Button>
                          );
                        })()}
                      </div>
                    )} */}
                  </Row>

                  {pakage?.products[0]?.delivered && (
                    <>
                      {dataBill?.getBillByPackedId?.customer_issue && dataBill?.getBillByPackedId?.packedID === pakage?.products[0]?.packageIdentifier ? (
                        <div className="alert alert-white border m-2 shadow-sm" role="alert">
                          <p className="text-danger fw-bold mb-1">
                            Issue Reported:
                            <span className="text-dark"> {dataBill.getBillByPackedId.customer_issue_title} </span>
                          </p>
                          <p className="mb-2 text-dark">{dataBill.getBillByPackedId.customer_issue}</p>
                          {dataBill.getBillByPackedId.customer_issue_date && (
                            <p className="text-muted small mb-0">
                              Reported on: <span className="fw-semibold">{dataBill.getBillByPackedId.customer_issue_date}</span>
                            </p>
                          )}
                        </div>
                      ) : (
                        !dataBill?.getBillByPackedId?.accounts_status &&
                        isLoggedIn && (
                          <div className="ms-2 pt-2">
                            <Button
                              style={{
                                fontSize: '12px',
                                padding: '4px 12px',
                                borderRadius: '5px',
                                background: 'linear-gradient(90deg, #cb7411ff 0%, #fc4225ff 100%)',
                                border: 'none',
                                color: 'white',
                              }}
                              onClick={() => handleCustomerIssue(pakage?.products[0]?.packageIdentifier)}
                            >
                              Report an Issue
                            </Button>
                            <p className="small mb-2 mb-0 w-100">
                              <em>Note:</em> You can report an issue only within <strong>3 days</strong> from the delivery date
                              <span> {moment(parseInt(pakage.products[0].deliveredDate, 10)).format('DD-MMM-YYYY')}</span>
                            </p>
                          </div>
                        )
                      )}
                    </>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        ))}

      <Modal show={reviewModal} onHide={() => setreviewModal(false)}>
        <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
          <Modal.Title className="fw-bold">Product Review Form</Modal.Title>
        </Modal.Header>
        <div className="p-3">
          <div className="d-flex border-bottom pb-2 ">
            <img
              src={formData?.product?.productId.thumbnail || (formData?.product?.productId.images.length > 0 && formData?.product?.productId.images[0])}
              className="img-thumbnail rounded-md h-100 sw-10"
              alt="thumb"
            />
            <div className="float-start ps-2 fw-bold">{`${formData?.product?.productId?.fullName}`}</div>
          </div>
          <Form onSubmit={submit}>
            <div className="row my-3">
              <div className="col-md-5 pt-2">
                <Form.Label>
                  <span className="fw-bold text-dark">How would you rate it?</span> <span className="text-danger"> * </span>
                </Form.Label>
              </div>
              <div className="col-md-7">
                <Rating
                  className="me-2 my-2"
                  placeholderRating={rating}
                  initialRating={rating}
                  value={rating}
                  emptySymbol={<i className="cs-star text-primary" />}
                  fullSymbol={<i className="cs-star-full text-primary" />}
                  onChange={(sel) => setRating(sel)}
                />
              </div>
            </div>

            <div className="row my-3">
              <div className=" col-md-5">
                <Form.Label>
                  <span className="fw-bold text-dark">Title your review</span> <span className="text-danger"> * </span>
                </Form.Label>
              </div>
              <div className=" col-md-7">
                <Form.Control
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="What's most important to know?"
                  type="text"
                  style={{ fontSize: 14 }}
                  name="title"
                />
                {formErrors.title && <div className="mt-1 text-danger">{formErrors.title}</div>}
              </div>
            </div>
            <div className="row my-3">
              <div className=" col-md-5">
                <Form.Label>
                  <span className="fw-bold text-dark">Write your review </span> <span className="text-danger"> * </span>
                </Form.Label>
              </div>
              <div className=" col-md-7">
                <Form.Control
                  as="textarea"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What did you like about the product? What did you use this product for?"
                  type="text"
                  style={{ fontSize: 14 }}
                  name="description"
                />
                {formErrors.description && <div className="mt-1 text-danger">{formErrors.description}</div>}
              </div>
            </div>
            <div className="row my-3">
              <div className=" col-md-5">
                <Form.Label>
                  <span className="fw-bold text-dark">Product image </span>
                </Form.Label>
              </div>
              <div className=" col-md-7">
                <Form.Control type="file" accept="image/*" multiple name="reviewImages" onChange={handleChange} />
              </div>
            </div>
            <div className="row justify-content-end my-3 small">
              <div className="col-md-6">
                {loading ? (
                  <Button className="w-80" disabled>
                    Loading
                  </Button>
                ) : (
                  <Button type="submit" className="w-80">
                    Submit
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </div>
      </Modal>
      <Modal show={sellerReviewModal} onHide={() => setSellerReviewModal(false)}>
        <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
          <Modal.Title className="fw-bold">Seller Review Form</Modal.Title>
        </Modal.Header>
        <div className="p-3">
          <Form onSubmit={submitSellerReview}>
            <div className="row">
              <div className="col-md-5 pt-2">
                <Form.Label>
                  <span className="fw-bold text-dark">Rate the Seller</span> <span className="text-danger"> * </span>
                </Form.Label>
              </div>
              <div className="col-md-7">
                <Rating
                  className="me-2 my-2"
                  placeholderRating={sellerRating}
                  initialRating={sellerRating}
                  emptySymbol={<i className="cs-star text-primary" />}
                  fullSymbol={<i className="cs-star-full text-primary" />}
                  onChange={(sel) => setSellerRating(sel)}
                />
              </div>
            </div>
            <div className="row my-3">
              <div className="col-md-5">
                <Form.Label>
                  <span className="fw-bold text-dark">Write your review</span> <span className="text-danger"> * </span>
                </Form.Label>
              </div>
              <div className="col-md-7">
                <Form.Control
                  as="textarea"
                  value={sellerReviewData.description}
                  onChange={(e) => setSellerReviewData({ ...sellerReviewData, description: e.target.value })}
                  placeholder="Share your experience with this seller"
                />
              </div>
            </div>
            <div className="row justify-content-end my-3 small">
              <div className="col-md-6">
                {sellerReviewLoading ? (
                  <Button className="w-80" disabled>
                    Loading
                  </Button>
                ) : (
                  <Button type="submit" className="w-80">
                    Submit
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </div>
      </Modal>
      <Modal show={customerIssueModal} onHide={() => setCustomerIssueModal(false)}>
        <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
          <Modal.Title className="fw-bold">Report an Issue</Modal.Title>
        </Modal.Header>
        <div className="p-3">
          <Form onSubmit={submitCustomerIssue}>
            <div className="row">
              <div className="col-md-12 mb-3">
                <Form.Label>
                  <span className="fw-bold text-dark">Issue Title</span> <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={customerIssueTitle}
                  onChange={(e) => setCustomerIssueTitle(e.target.value)}
                  placeholder="Short title for your issue..."
                />
              </div>

              <div className="col-md-12 mb-3">
                <Form.Label>
                  <span className="fw-bold text-dark">Describe Your Issue</span> <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={customerIssueText}
                  onChange={(e) => setCustomerIssueText(e.target.value)}
                  placeholder="Write your issue here..."
                />
              </div>

              {/* <div className="col-md-12">
                <Form.Label>
                  <span className="fw-bold text-dark">Attach Images (Optional)</span>
                </Form.Label>
                <Form.Control type="file" accept="image/*" multiple onChange={(e) => setCustomerIssueImages(Array.from(e.target.files))} />
              </div> */}
            </div>

            <div className="row justify-content-end my-3 small">
              <div className="col-md-6">
                {issueLoading ? (
                  <Button className="w-80" disabled>
                    Loading...
                  </Button>
                ) : (
                  <Button type="submit" className="w-80">
                    Submit
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  );
}

export default withRouter(Tabbed);
