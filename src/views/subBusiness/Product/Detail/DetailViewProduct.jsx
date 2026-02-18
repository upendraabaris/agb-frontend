import React, { useState, useEffect } from 'react';
import { NavLink, withRouter, useParams } from 'react-router-dom';
import { useLazyQuery, useMutation, gql } from '@apollo/client';
import { Row, Col, Form, Button } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { toast } from 'react-toastify';

const DetailViewProduct = ({ productId, supervariantId }) => {
  const title = 'Product Details';
  const description = 'Product Details';
  const { productname } = useParams();
  const [profileData, setProfileData] = useState(null);

  const [superLocations, setSuperLocations] = useState([]);
  const [productDetails, setProductDetails] = useState({
    id: '',
    superSellerId: '',
    brand_name: '',
    description: '',
    fullName: '',
    identifier: '',
    supervariants: [],
    images: [],
  });

  useEffect(() => {
    console.log('Product Details:', productDetails);
  }, [productDetails]);

  const [sellerIdFromProfile, setSellerIdFromProfile] = useState(null);

  const GET_PRODUCT = gql`
    query GetSuperSellerProduct($name: String) {
      getSuperSellerProduct(name: $name) {
        id
        superSellerId
        brand_name
        description
        fullName
        identifier
        images
        supervariant {
          id
          variantName
          price
          b2bdiscount
          b2cdiscount
          priceType
          transportCharge
          extraCharge
          extraChargeType
          transportChargeType
          gstRate
          superlocation {
            displayStock
            allPincode
            mainStock
            pincode
            sellerId {
              id
            }
            id
          }
        }
      }
    }
  `;

  const ADD_LOCATION_TO_SUPER_PRODUCT = gql`
    mutation AddLocationToSuperProduct($productId: ID, $supervariantId: ID, $superlocationId: ID, $location: SuperLocationInput) {
      addLocationToSuperProduct(productId: $productId, supervariantId: $supervariantId, superlocationId: $superlocationId, location: $location) {
        id
        supervariant {
          id
          superlocation {
            allPincode
            displayStock
            mainStock
            pincode
            id
          }
        }
      }
    }
  `;

  const GET_PROFILE = gql`
    query GetProfile {
      getProfile {
        id
        seller {
          id
        }
      }
    }
  `;

  const [GetSuperSellerProduct, { error, data, refetch }] = useLazyQuery(GET_PRODUCT, {
    variables: {
      name: productname.replace(/_/g, ' '),
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });

  const [getProfile] = useLazyQuery(GET_PROFILE, {
    onCompleted: (profileResponse) => {
      const sellerId = profileResponse.getProfile?.seller?.id;
      setSellerIdFromProfile(sellerId);
    },
    onError: (err) => {
      toast.error(err.message || 'Error fetching profile');
    },
  });

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  const [addLocationToSuperProduct, { loading: updatingLocation }] = useMutation(ADD_LOCATION_TO_SUPER_PRODUCT, {
    onCompleted: () => {
      toast.success('Location updated successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Error while updating location');
    },
  });

  const stripHtmlTags = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  useEffect(() => {
    if (productname) {
      GetSuperSellerProduct();
      refetch();
    }
  }, [productname]);

  useEffect(() => {
    if (data && data.getSuperSellerProduct) {
      const product = data.getSuperSellerProduct;

      setProductDetails({
        id: product.id,
        superSellerId: product.superSellerId,
        brand_name: product.brand_name,
        description: product.description,
        fullName: product.fullName,
        identifier: product.identifier,
        images: product.images || [],
        supervariants: product.supervariant || [],
      });

      const updatedLocations = product.supervariant.map((variant) => {
        const matchingSuperlocation = variant.superlocation.find((location) => location.sellerId === sellerIdFromProfile);

        return matchingSuperlocation
          ? {
              allPincode: matchingSuperlocation.allPincode,
              displayStock: matchingSuperlocation.displayStock || '9999999',
              mainStock: matchingSuperlocation.mainStock || '9999999',
              pincode: matchingSuperlocation.pincode || '',
              id: matchingSuperlocation.id || '',
            }
          : {
              allPincode: true,
              displayStock: '9999999',
              mainStock: '9999999',
              pincode: '',
            };
      });

      setSuperLocations(updatedLocations);
    } else {
      console.log('No data or product not found.');
    }
  }, [data, sellerIdFromProfile]);

  useEffect(() => {
    if (sellerIdFromProfile && productname) {
      GetSuperSellerProduct();
      refetch();
    }
  }, [productname, sellerIdFromProfile]);

  const handleSuperLocationChange = (index, e) => {
    const { name, value } = e.target;
    const updatedLocations = [...superLocations];
    updatedLocations[index] = {
      ...updatedLocations[index],
      [name]: value,
    };
    setSuperLocations(updatedLocations);
  };

  const handleSubmit = async (e, index) => {
    e.preventDefault();

    const location = superLocations[index];
    const displayStock = parseInt(location.displayStock, 10) || 0;
    const mainStock = parseInt(location.mainStock, 10) || 0;
    const pincode =
      typeof location.pincode === 'string'
        ? location.pincode
            .split(',')
            .map((code) => parseInt(code.trim(), 10))
            .filter((code) => !Number.isNaN(code))
        : [];

    const updatedLocation = {
      ...location,
      displayStock,
      mainStock,
      pincode,
    };

    const superlocationId = productDetails.supervariants[index].superlocation.find((loc) => loc.sellerId === sellerIdFromProfile)?.id;
    const submissionData = {
      productId: productDetails.id,
      supervariantId: productDetails.supervariants[index].id,
      superlocationId,
      location: {
        ...updatedLocation,
      },
    };
    try {
      await addLocationToSuperProduct({
        variables: submissionData,
      });
    } catch (err) {
      toast.error(`Error updating location ${index + 1}: ${err.message}`);
    }
  };

  let content;

  if (error) {
    content = <p className="text-danger">Error: {error.message}</p>;
  } else if (data && data.getSuperSellerProduct) {
    content = (
      <>
        <Row className="border rounded p-2 m-1 bg-white">
          <Col lg={4} xs={12}>
            <Form.Group controlId="productImage">
              <img src={productDetails.images} alt="Product" className="img-fluid  p-1 w-100" />
            </Form.Group>
          </Col>

          <Col lg={8} xs={12}>
            <Form.Group controlId="fullName">
              <Form.Label className="fw-bold text-dark pt-2">Full Name</Form.Label>
              <Form.Control type="text" name="fullName" value={productDetails.fullName} readOnly />
            </Form.Group>

            <Form.Group controlId="brand_name">
              <Form.Label className="fw-bold text-dark pt-2">Brand Name</Form.Label>
              <Form.Control type="text" name="brand_name" value={productDetails.brand_name} readOnly />
            </Form.Group>

            <Form.Group controlId="description">
              <Form.Label className="fw-bold text-dark pt-2">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                name="description"
                value={stripHtmlTags(productDetails.description)}
                readOnly
                className="responsive-textarea"
              />
            </Form.Group>
          </Col>
        </Row>

        {productDetails.supervariants.map((variant, index) => (
          <Form onSubmit={(e) => handleSubmit(e, index)} key={variant.id}>
            <Row className="border rounded p-2 m-1 bg-white">
              <Col lg={6} xs={12}>
                <Form.Group controlId="variantName">
                  <Form.Label className="fw-bold text-dark pt-2">Variant Name</Form.Label>
                  <Form.Control type="text" name="variantName" value={variant.variantName} readOnly />
                </Form.Group>
              </Col>
              <Col lg={6} xs={12}>
                <Form.Group controlId="variantName">
                  <Form.Label className="fw-bold text-dark pt-2">{variant.priceType}</Form.Label>
                  <Form.Control type="text" name="variantName" value={variant.price} readOnly />
                </Form.Group>
              </Col>
              <Col lg={6} xs={12}>
                <Form.Group controlId="variantName">
                  <Form.Label className="fw-bold text-dark pt-2">{variant.extraChargeType}</Form.Label>
                  <Form.Control type="text" name="variantName" value={variant.extraCharge} readOnly />
                </Form.Group>
              </Col>
              <Col lg={6} xs={12}>
                <Form.Group controlId="variantName">
                  <Form.Label className="fw-bold text-dark pt-2">{variant.transportChargeType}</Form.Label>
                  <Form.Control type="text" name="variantName" value={variant.transportCharge} readOnly />
                </Form.Group>
              </Col>
              <Col lg={6} xs={12}>
                <Form.Group controlId="variantName">
                  <Form.Label className="fw-bold text-dark pt-2">B2C Discount</Form.Label>
                  <Form.Control type="text" name="variantName" value={variant.b2cdiscount} readOnly />
                </Form.Group>
              </Col>
              <Col lg={6} xs={12}>
                <Form.Group controlId="variantName">
                  <Form.Label className="fw-bold text-dark pt-2">B2B Discount</Form.Label>
                  <Form.Control type="text" name="variantName" value={variant.b2bdiscount} readOnly />
                </Form.Group>
              </Col>
              <Col lg={6} xs={12}>
                <Form.Group controlId={`displayStock-${index}`}>
                  <Form.Label className="fw-bold text-dark pt-2">
                    Display Stock <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="displayStock"
                    value={superLocations[index]?.displayStock || ''}
                    onChange={(e) => handleSuperLocationChange(index, e)}
                    disabled
                  />
                </Form.Group>
              </Col>

              <Col lg={6} xs={12}>
                <Form.Group controlId={`mainStock-${index}`}>
                  <Form.Label className="fw-bold text-dark pt-2">
                    Main Stock <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="mainStock"
                    value={superLocations[index]?.mainStock || ''}
                    onChange={(e) => handleSuperLocationChange(index, e)}
                    disabled
                  />
                </Form.Group>
              </Col>

              <Col lg={4} xs={12} className="mb-3 mt-2">
                <Form.Group controlId={`allPincode-${index}`}>
                  <Form.Check
                    type="checkbox"
                    label="All India Delivered"
                    name="allPincode"
                    checked={superLocations[index]?.allPincode || false}
                    onChange={(e) =>
                      handleSuperLocationChange(index, {
                        target: { name: 'allPincode', value: e.target.checked },
                      })
                    }
                    className="form-check-inline fw-bold"
                  />
                </Form.Group>
              </Col>

              {!superLocations[index]?.allPincode && (
                <Col lg={8} xs={12} className="mb-3">
                  <Form.Group controlId={`pincode-${index}`}>
                    <Form.Label className="fw-bold text-dark pt-2">Pincode</Form.Label>
                    <Form.Control
                      type="text"
                      name="pincode"
                      as="textarea"
                      rows={6}
                      value={superLocations[index]?.pincode || ''}
                      onChange={(e) => handleSuperLocationChange(index, e)}
                      placeholder="Enter Pincode"
                    />
                  </Form.Group>
                </Col>
              )}
              <Col lg={12}>
                <Button variant="primary" type="submit" disabled={updatingLocation} className="float-end">
                  {updatingLocation ? 'Updating...' : 'Submit'}
                </Button>
              </Col>
            </Row>
          </Form>
        ))}
      </>
    );
  } else {
    content = <p>Loading...</p>;
  }

  return (
    <div>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-2">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/subBusiness/dashboard">
              <span className="align-middle text-dark ms-1">Dealer Dashboard</span>
            </NavLink>
            <span className="text-dark ps-2"> / </span>
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/subBusiness/product/list">
              <span className="align-middle text-dark ms-1">Dealer Product</span>
            </NavLink>
            <span className="text-dark ps-2"> / </span>
            <span className="align-middle text-dark ms-1">{title}</span>
          </Col>
        </Row>
      </div>
      {content}
    </div>
  );
};

export default withRouter(DetailViewProduct);
