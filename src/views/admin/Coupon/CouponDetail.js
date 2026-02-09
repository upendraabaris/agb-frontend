import React, { useState } from 'react';
import { gql, useMutation, useLazyQuery, useQuery } from '@apollo/client';
import { Row, Col, Button, Card, Form, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import Rating from 'react-rating';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { toast } from 'react-toastify';

function CouponDetail() {
  const PROD = '650c34fda371aaf0702f3350';
  // Review section

  const [reviewImage, setReviewImage] = useState([]);

  const REVIEW_PRODUCT = gql`
    mutation CreateReview($productId: ID!, $rating: Int!, $reviewImages: [Upload], $comment: String) {
      createReview(productId: $productId, rating: $rating, reviewImages: $reviewImages, comment: $comment) {
        id
        user
        productId
        images
        rating
        comment
      }
    }
  `;

  const [reviewProduct, { loading, error, data, refetch }] = useMutation(REVIEW_PRODUCT, {
    onCompleted: () => {
      toast.success('Review Submitted Successfully');
    },
    onError: () => {
      toast.error('Some Error Occured');
      console.error('Error: ', error.message);
    },
  });
  let tempRate = 0;
  if (data) { 
    tempRate = data.createReview.rating;
  }
  const [rating, setRating] = useState(tempRate);
  const [review, setReview] = useState('');

  // if(data)
  // {
  //   setRating("");
  //     setReview(0);
  //     setReviewImage([]);
  // }
 
  async function handleReview() {
    await reviewProduct({
      variables: {
        productId: PROD,
        rating,
        comment: review,
        reviewImages: reviewImage,
      },
    });
  }
  const handleImageSelection = () => {
    document.getElementById('myFileInput').click();
  };

  const fileStyle = {
    display: 'none',
  };
  const handleImageChange = (e) => {
    // Get the selected files from the input element.
    const selectedImages = Array.from(e.target.files);

    // Update the state to include the selected images.
    setReviewImage([...reviewImage, ...selectedImages]);
  };

  return (
    <>
      {/* <div>CouponDetail</div> */}
      <h1>Review Section</h1>
      <div>
        <h5>Write a Review</h5>
        <Form.Label>Comment</Form.Label>
        <Form.Control type="text" onChange={(e) => setReview(e.target.value)} />
        <Form.Label>Add Rating</Form.Label>
        <Rating
          className="me-2 my-2"
          placeholderRating={rating}
          initialRating={rating}
          value={rating}
          emptySymbol={<i className="cs-star text-primary" />}
          fullSymbol={<i className="cs-star-full text-primary" />}
          // onChange={setRating}
          onChange={(sel) => setRating(sel)}
        />
        <br />

        <p className="fs-6 text-muted mt-1 mb-0 pb-0">Add Review Image</p>
        {reviewImage.length > 0 &&
          reviewImage?.map((item, index) => (
            <img
              style={{ height: '50px', width: '50px', border: '1px solid #1ea8e7' }}
              className="mx-1 my-1"
              key={item}
              src={URL.createObjectURL(item)}
              alt={`item ${index}`}
            />
          ))}
        <input type="file" style={fileStyle} id="myFileInput" onChange={handleImageChange} multiple />
        <Button onClick={() => handleImageSelection()} className="ms-0 mb-2" variant="outline-primary">
          <CsLineIcons icon="plus" />
        </Button>

        <br />
        <Button className="my-1 ms-0" onClick={() => handleReview()}>
          Submit Review
        </Button>
      </div>
    </>
  );
}

export default CouponDetail;
