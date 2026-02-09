import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Card, Spinner, Table } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { gql, useQuery } from '@apollo/client';

const GET_SERIES_PRODUCT = gql`
  query GetSeriesProduct($id: ID) {
    getSeriesProduct(id: $id) {
      id
      brand_name
      previewName
      fullName
      identifier
      thumbnail
      sku
      active
      returnPolicy
      shippingPolicy
      cancellationPolicy
      description
      giftOffer
      sellerNotes
      policy
      video
      youtubeLink
      catalogue
      images
      categories
      seriesvariant {
        id
        variantName
        active
        allPincode
        hsn
        silent_features
        moq
        serieslocation {
          id
          pincode
          unitType
          priceType
          price
          gstType
          gstRate
          extraChargeType
          extraCharge
          transportChargeType
          transportCharge
          finalPrice
          b2cdiscount
          b2bdiscount
          mainStock
          displayStock
          sellerId {
            companyName
          }
        }
      }
      faq {
        answer
        question
      }
    }
  }
`;

const ListViewProduct = () => {
  const title = 'Product Variants';
  const description = 'Seller based product variant list';
  const { seriesId } = useParams();

  const { loading, error, data, refetch } = useQuery(GET_SERIES_PRODUCT, {
    variables: { id: seriesId },
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    refetch();
  }, [seriesId, refetch]);

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status" variant="primary" />
      </div>
    );
  }
  if (error) {
    return <div className="text-danger text-center">Error: {error.message}</div>;
  }

  const product = data?.getSeriesProduct;

  const variants = product?.seriesvariant || [];

  return (
    <>
      <HtmlHead title={title} description={description} />

      {/* ✅ Product details ek hi bar */}
      <Card className="mb-1 shadow-sm">
        <Row className="mb-1 pt-3">
          {/* Left Side - Image */}
          <Col md={4} className="text-center">
            <img src={product.images} alt={product.previewName} className="img-fluid rounded" style={{ maxHeight: '150px' }} />
          </Col>

          {/* Right Side - Product Details */}
          <Col md={8}>
            <Table bordered hover size="sm">
              <tbody>
                <tr>
                  <th className="border w-25">Product Name</th>
                  <td className="border w-75">{product.fullName}</td>
                </tr>
                <tr>
                  <th>Preview Name</th>
                  <td>{product.previewName}</td>
                </tr>
                <tr>
                  <th>Brand</th>
                  <td>{product.brand_name}</td>
                </tr>
                <tr>
                  <th>Description</th>
                  <td dangerouslySetInnerHTML={{ __html: product.description }} />
                </tr>
                {product.listingComm > 0 && (
                  <tr>
                    <th>Listing Commission</th>
                    <td>
                      {product.listingComm} {product.listingCommType && `(${product.listingCommType})`}
                    </td>
                  </tr>
                )}

                {product.fixedComm > 0 && (
                  <tr>
                    <th>Fixed Commission</th>
                    <td>
                      {product.fixedComm} {product.fixedCommType && `(${product.fixedCommType})`}
                    </td>
                  </tr>
                )}

                {product.shippingComm > 0 && (
                  <tr>
                    <th>Shipping Commission</th>
                    <td>
                      {product.shippingComm} {product.shippingCommType && `(${product.shippingCommType})`}
                    </td>
                  </tr>
                )}

                {product.productComm > 0 && (
                  <tr>
                    <th>Product Commission</th>
                    <td>
                      {product.productComm} {product.productCommType && `(${product.productCommType})`}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Card>

      {/* ✅ Variants loop */}
      {variants.map((variant, index) => (
        <Card key={index} className="mb-1 shadow-sm">
          <Card.Body>
            <h6 className="mt-1 fw-bold">Variant Details</h6>
            <Table bordered hover size="sm">
              <tbody>
                <tr>
                  <th>Variant Name</th>
                  <td>{variant.variantName}</td>
                </tr>
                <tr>
                  <th>HSN</th>
                  <td>{variant.hsn}</td>
                </tr>
                <tr>
                  <th>Active</th>
                  <td>{variant.active ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <th>MOQ</th>
                  <td>{variant.moq}</td>
                </tr>
                <tr>
                  <th>Silent Features</th>
                  <td>{variant.silent_features}</td>
                </tr>
              </tbody>
            </Table>

            <h6 className="mt-3 fw-bold">Available Locations</h6>
            {variant.serieslocation && variant.serieslocation.length > 0 ? (
              variant.serieslocation.map((loc) => (
                <div key={loc.id} className="mb-3">
                  <div className="table-responsive">
                    <Table bordered hover size="sm" className="mb-0">
                      <tbody>
                        {loc.sellerId?.companyName && (
                          <tr>
                            <th>SA Name</th>
                            <td>{loc.sellerId.companyName}</td>
                          </tr>
                        )}
                        {loc.price > 0 && (
                          <tr>
                            <th>{loc.priceType}</th>
                            <td>
                              ₹{loc.price} Per {loc.unitType}
                            </td>
                          </tr>
                        )}
                        {loc.extraCharge > 0 && (
                          <tr>
                            <th>{loc.extraChargeType}</th>
                            <td>{loc.extraCharge}</td>
                          </tr>
                        )}
                        <tr>
                          <th>Final Price</th>
                          <td>₹ {loc.price + loc.extraCharge}</td>
                        </tr>
                        <tr>
                          <th>GST</th>
                          <td>{loc.gstRate}%</td>
                        </tr>
                        {loc.transportCharge > 0 && (
                          <tr>
                            <th>{loc.transportChargeType}</th>
                            <td>{loc.transportCharge}</td>
                          </tr>
                        )}
                        <tr>
                          <th>Discount B2B</th>
                          <td>{loc.b2bdiscount}</td>
                        </tr>
                        <tr>
                          <th>Discount B2C</th>
                          <td>{loc.b2cdiscount}</td>
                        </tr>
                        {loc.displayStock > 0 && (
                          <tr>
                            <th>Display Stock</th>
                            <td>{loc.displayStock}</td>
                          </tr>
                        )}
                        {loc.mainStock > 0 && (
                          <tr>
                            <th>Main Stock</th>
                            <td>{loc.mainStock}</td>
                          </tr>
                        )}
                        {loc.pincode && (
                          <tr>
                            <th>Pincode</th>
                            <td>
                              {variant.serieslocation
                                .map((locs) => locs.pincode)
                                .filter((p) => p)
                                .join(' , ')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted">No locations available for this variant.</p>
            )}


          </Card.Body>
        </Card>
      ))}
    </>
  );
};

export default ListViewProduct;
