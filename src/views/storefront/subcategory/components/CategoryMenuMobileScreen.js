import React, { useState, useRef } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { NavLink, useParams } from 'react-router-dom';

const CategoryMenuMobileScreen = ({ subcatValue }) => {
  const params = useParams();
  const items = subcatValue.getCategoryByName?.children || [];
  const itemsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(0);

  const maxPage = Math.ceil(items.length / itemsPerPage) - 1;
  const startIndex = currentPage * itemsPerPage;
  const currentItems = items.slice(startIndex, startIndex + itemsPerPage);

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 0));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, maxPage));

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleSwipeGesture = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;

    if (distance > 50) {
      // Swiped left
      handleNext();
    } else if (distance < -50) {
      // Swiped right
      handlePrev();
    }

    // Reset
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    handleSwipeGesture();
  };

  return (
    <>
      {items.length > 0 ? (
        <>
          <Row className="g-1 px-2 justify-content-center mt-2" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            {currentItems.map((subcat, index) => (
              <Col key={index} xs={4} className="d-flex flex-column align-items-center">
                <NavLink to={`/category/${subcat.name.replace(/\s/g, '_').toLowerCase()}`} className="text-center text-decoration-none text-dark">
                  <img
                    src={encodeURI(subcat.image || 'https://demofree.sirv.com/nope-not-here.jpg')}
                    alt={subcat.name}
                    className="rounded-circle shadow-sm mb-2"
                    style={{
                      width: '65px',
                      height: '65px',
                      objectFit: 'cover',
                      border: '2px solid #ddd',
                    }}
                  />
                  <div style={{ fontSize: '13px', fontWeight: '500', wordBreak: 'break-word' }}>{subcat.name}</div>
                </NavLink>
              </Col>
            ))}
          </Row>

          <div className="d-flex justify-content-between align-items-center position-relative" style={{ top: '-70px' }}>
            {currentPage > 0 ? (
              <Button className="text-white bg-dark p-2 fw-bold" size="sm" onClick={handlePrev}>
                &lt;
              </Button>
            ) : (
              <div style={{ width: '42px' }} />
            )}

            {currentPage < maxPage && (
              <Button className="text-white bg-dark p-2 fw-bold" size="sm" onClick={handleNext}>
                &gt;
              </Button>
            )}
          </div>
        </>
      ) : null}
    </>
  );
};

export default CategoryMenuMobileScreen;
