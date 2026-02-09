import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { useGlobleContext } from 'context/styleColor/ColorContext';

const GET_SELLER = gql`
  query GetSeller($getSellerId: ID!) {
    getSeller(id: $getSellerId) {
      companyName
      overallrating
      companyDescription
      review {
        description
        userRating
        customerName
        ratingDate
        sellerReply
        sellerReplyDate
        adminReply
        adminReplyDate
      }
    }
  }
`;

const StarRating = ({ rating }) => {
  const fullStars = '★'.repeat(Math.floor(rating));
  const halfStar = rating % 1 !== 0 ? '⯪' : '';
  const emptyStars = '☆'.repeat(5 - Math.ceil(rating));
  return <div className="text-success fs-4">{fullStars + halfStar + emptyStars}</div>;
};

const RatingBreakdown = ({ reviews }) => {
  if (!reviews || reviews.length === 0) return <p className="text-muted ps-2">No reviews yet.</p>;

  const ratingsCount = [0, 0, 0, 0, 0];

  reviews.forEach(({ userRating }) => {
    if (userRating >= 1 && userRating <= 5) {
      ratingsCount[Math.floor(userRating) - 1] += 1;
    }
  });

  const totalReviews = reviews.length || 1;

  return (
    <div className="mt-0">
      {[5, 4, 3, 2, 1].map((star) => {
        const percentage = (ratingsCount[star - 1] / totalReviews) * 100;
        return (
          <div key={star} className="d-flex align-items-center p-2">
            <span className="w-20">{star} star</span>
            <div className="w-100 border p-2 rounded mx-2 position-relative" style={{ height: '8px', overflow: 'hidden' }}>
              <div
                className="position-absolute top-0 start-0"
                style={{
                  width: `${percentage}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #389b40c9, #389b40)',
                }}
              />
            </div>
            <span className="text-gray-700">{ratingsCount[star - 1]}</span>
          </div>
        );
      })}
    </div>
  );
};

const SellerDetails = () => {
  const { id } = useParams();
  const { dataStoreFeatures1 } = useGlobleContext();

  const [visibleReviews, setVisibleReviews] = useState(5);

  const { loading, error, data } = useQuery(GET_SELLER, {
    variables: { getSellerId: id },
  });

  if (loading) return <p className="text-center text-gray-600">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error.message}</p>;

  // ✅ FIX: only ONE declaration
  const { companyName, overallrating, review, companyDescription } = data?.getSeller || {};

  const loadMore = () => {
    setVisibleReviews((prev) => prev + 5);
  };

  return (
    <>
      <div className="max-w-3xl mx-auto p-4 bg-white shadow-lg rounded-lg mb-2">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 fw-bold">
          {dataStoreFeatures1?.getStoreFeature?.sellerMasking ? `Seller Id: ${id}` : companyName}
        </h1>
        {overallrating ? (
          <div className="flex items-center text-lg text-gray-700">
            <div className="ml-2 text-2xl font-bold flex items-center gap-2">
              <StarRating rating={overallrating} />
            </div>
          </div>
        ) : (
          <p className="text-muted">No rating available.</p>
        )}
      </div>

      <div className="max-w-3xl mx-auto p-4 bg-white shadow-lg rounded-lg mb-2">
        <h2 className="fw-bold fs-5 text-dark">About Seller Associate</h2>
        {companyDescription}
      </div>

      <div className="container p-4 bg-white shadow-lg rounded">
        <div className="row">
          <div className="col-md-4">
            <h2 className="fw-bold fs-5 text-dark ps-2 border-bottom pb-2">Ratings</h2>
            <div className="d-flex align-items-center ps-1 mb-2">
              <div className="me-2">
                <StarRating rating={overallrating} />
              </div>
              <p className="mb-0">{overallrating} out of 5</p>
            </div>

            <RatingBreakdown reviews={review || []} />
          </div>

          <div className="col-md-8">
            <h2 className="fw-bold fs-5 text-dark ps-2 border-bottom pb-2 pt-3 pt-md-0">Reviews</h2>
            {review && review.length > 0 ? (
              <div className="mt-2 list-unstyled">
                {review
                  .slice()
                  .reverse()
                  .slice(0, visibleReviews)
                  .map((r, index) => (
                    <div key={index} className="p-3 mb-1 rounded border">
                      <div className="row d-flex align-items-start">
                        <div className="col-md-2 col-12 text-md-start mb-2 mb-md-0">
                          <StarRating rating={r.userRating} />
                        </div>

                        <div className="col-md-10 col-12">
                          <p className="mb-0 pt-2">"{r.description}"</p>
                        </div>

                        {r.customerName && r.ratingDate && (
                          <div className="col-md-12 col-12">
                            <div className="mb-0 pt-2 ps-1 small">
                              By {r.customerName} on {r.ratingDate}
                            </div>

                            {r?.sellerReply?.trim() && (
                              <div className="alert alert-primary py-2 mb-2 mt-2">
                                <strong>Seller Response:</strong> {r.sellerReply}
                              </div>
                            )}

                            {r?.adminReply?.trim() && (
                              <div className="alert alert-info py-2 mb-2 mt-2">
                                <strong>Admin Response:</strong> {r.adminReply}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                {/* Load More Button */}
                {visibleReviews < review.length && (
                  <div className="text-center mt-3">
                    <button type="button" className="btn btn-outline-primary px-4 py-2" onClick={loadMore}>
                      Load More
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted">No reviews available.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SellerDetails;
