import React, { useState, useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { NavLink, useHistory } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { Button, Row, Col, Card, Pagination, Tooltip, OverlayTrigger } from 'react-bootstrap';

function RejectedList({ setRejectedCount }) {
  const history = useHistory();

  const REJECTED_PRODUCT = gql`
    query Pendingapprove {
      pendingapprove {
        brand_name
        fullName
        id
        approve
        sku
        thumbnail
        images
        previewName
        identifier
        reject
        rejectReason
        variant {
          location {
            sellerId {
              companyName
            }
          }
        }
      }
    }
  `;
  const [loadRejectedProducts, { fetchMore, data, refetch }] = useLazyQuery(REJECTED_PRODUCT, {
    onError: (error) => {
      console.log(`REJECTED_PRODUCT!!! : ${error.message}`);
    },
  });
  const [limit, setLimit] = useState(5);
  const [offset, setOffset] = useState(0);
  const handlePageChange = (newOffset) => {
    setOffset(newOffset);
    fetchMore({
      variables: { offset: newOffset },
    });
  };

  useEffect(() => {
    loadRejectedProducts();
  }, [loadRejectedProducts]);

  useEffect(() => {
    setRejectedCount(data?.pendingapprove?.filter((product) => product.reject === true).length || 0);
  }, [data, setRejectedCount]);

  return (
    <>
      {/* Header for Desktop */}
      <Row className="d-none d-md-flex g-0 bg-white py-3 px-2 mb-0 rounded-3 shadow-sm border">
        <Col md="5" className="fw-bold text-dark ps-4">
          Product Details
        </Col>
        <Col md="2" className="fw-bold text-dark">
          Brand
        </Col>
        <Col md="3" className="fw-bold text-dark">
          Reject Reason
        </Col>
        <Col md="2" className="fw-bold text-dark text-end pe-4">
          Actions
        </Col>
      </Row>

      {/* Compact Header for Mobile */}
      <Row className="d-flex d-md-none g-0 bg-white py-2 px-2 rounded-3 shadow-sm border mb-2">
        <Col xs="7" className="fw-bold text-dark">
          Product
        </Col>
        <Col xs="5" className="fw-bold text-dark text-end">
          Actions
        </Col>
      </Row>

      {data && (
        <>
          {data.pendingapprove
            ?.filter((p) => p.reject === true)
            .map((p) => (
              <Card key={p.id} className="mb-1 border-0 shadow-sm rounded-3 product-row-card">
                <Row className="g-3 align-items-center p-1">
                  {/* IMAGE */}
                  <Col xs="4" sm="3" md="1">
                    <div className="image-container">
                      <img
                        src={p.thumbnail || p.images?.[0]}
                        alt={p.previewName}
                        className="img-fluid rounded border"
                        style={{ height: '40px', objectFit: 'cover' }}
                      />
                    </div>
                  </Col>

                  {/* NAME + SELLER */}
                  <Col xs="8" md="4">
                    <div className="fw-bold text-dark text-truncate">{p.previewName}</div>
                    <small className="text-muted d-block text-truncate">Seller: {p.variant?.[0]?.location?.[0]?.sellerId?.companyName}</small>
                  </Col>

                  {/* BRAND */}
                  <Col xs="6" md="3">
                    <div className="text-dark text-truncate">{p.brand_name}</div>
                    <span className="badge bg-danger mt-1">Rejected</span>
                  </Col>

                  {/* REJECT REASON */}
                  <Col xs="6" md="2">
                    <small className="text-danger text-truncate fw-semibold">{p.rejectReason || 'No reason provided'}</small>
                  </Col>

                  {/* ACTION BUTTON */}
                  <Col xs="12" md="2" className="text-md-end">
                    <OverlayTrigger overlay={<Tooltip>View Details</Tooltip>}>
                      <Button size="sm" variant="outline-primary" onClick={() => history.push(`details/${p.identifier?.replace(/\s/g, '_').toLowerCase()}`)}>
                        <CsLineIcons icon="content" size={16} />
                      </Button>
                    </OverlayTrigger>
                  </Col>
                </Row>
              </Card>
            ))}
        </>
      )}

      {/* Single Card Ends Here */}

      {/* Pagination Start */}
      {data && (
        <div className="d-flex justify-content-center mt-5">
          <Pagination>
            <Pagination.Prev className="shadow" onClick={() => handlePageChange(Math.max(offset - limit, 0))} disabled={offset === 0}>
              <CsLineIcons icon="chevron-left" />
            </Pagination.Prev>
            <Pagination.Next className="shadow" onClick={() => handlePageChange(offset + limit)} disabled={data.getUsers?.length < limit}>
              <CsLineIcons icon="chevron-right" />
            </Pagination.Next>
          </Pagination>
        </div>
      )}
      {/* Pagination End */}
    </>
  );
}

export default RejectedList;
