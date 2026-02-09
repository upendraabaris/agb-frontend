import React, { useEffect, useState } from 'react';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { NavLink, useHistory } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { Row, Col, Button, Card, Pagination, Tooltip, OverlayTrigger, Badge } from 'react-bootstrap';

function ApprovedList({ setApprovedCount }) {
  const history = useHistory();
  const APPROVED_PRODUCT = gql`
    query Approvedproduct {
      approvedproduct {
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
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(5);
  const [Approvedproduct, { fetchMore, data, refetch }] = useLazyQuery(APPROVED_PRODUCT, {
    onError: (error) => {
      console.log(`APPROVED_PRODUCT!!! : ${error.message}`);
    },
  });
  const handlePageChange = (newOffset) => {
    setOffset(newOffset);
    fetchMore({
      variables: { offset: newOffset },
    });
  };

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    setApprovedCount(data?.approvedproduct?.filter((product) => !product.reject === true).length || 0);
  }, [data, setApprovedCount]);

  return (
    <>
      <Row className="d-none g-0 d-md-flex bg-white py-3 px-2 mb-0 rounded-3 shadow-sm border">
        <Col md="5" className="fw-bold text-dark ps-4">
          Product Details
        </Col>
        <Col md="3" className="fw-bold text-dark">
          Brand
        </Col>
        <Col md="3" className="fw-bold text-dark text-end pe-4">
          Actions
        </Col>
      </Row>

      {data?.approvedproduct?.filter((p) => !p.reject).length > 0 ? (
        data.approvedproduct
          .filter((p) => !p.reject)
          .map((p) => (
            <Card key={p.id} className="mb-1 border-0 shadow-sm rounded-3 product-row-card">
              <Row className="g-3 align-items-center p-1">
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

                <Col xs="8" md="4">
                  <div className="fw-bold text-dark text-truncate">{p.previewName}</div>
                  <small className="text-muted d-block text-truncate">Seller: {p.variant?.[0]?.location?.[0]?.sellerId?.companyName}</small>
                </Col>

                <Col xs="6" md="3">
                  <div className="text-dark text-truncate">{p.brand_name}</div>
                </Col>

                <Col xs="6" md="3" className="text-end pe-4">
                  <div className="d-inline-flex gap-2">
                    <OverlayTrigger overlay={<Tooltip>View Details</Tooltip>}>
                      <Button size="sm" variant="outline-primary" onClick={() => history.push(`details/${p.identifier?.replace(/\s/g, '_').toLowerCase()}`)}>
                        <CsLineIcons icon="content" size={16} />
                      </Button>
                    </OverlayTrigger>
                  </div>
                </Col>
              </Row>
            </Card>
          ))
      ) : (
        <div className="text-center bg-white py-5">
          <img src="/no_found_result.png" alt="No Products" style={{ width: '90px', opacity: 0.7 }} />
          <h5 className="mt-3 text-muted fw-semibold">No Products Found</h5>
        </div>
      )}

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

export default ApprovedList;
