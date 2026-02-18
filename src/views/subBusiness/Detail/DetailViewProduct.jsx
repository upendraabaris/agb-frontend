import React, { useState, useEffect } from 'react';
import { NavLink, withRouter, useParams } from 'react-router-dom';
import { useLazyQuery, useMutation, gql } from '@apollo/client';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { toast } from 'react-toastify';

const DetailViewProduct = ({ productId, supervariantId }) => {
  const title = 'View Super Location Details';
  const description = 'View specific super location fields';
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
  });

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
        supervariant {
          id
          variantName
          superlocation {
            displayStock
            allPincode
            mainStock
            pincode
            sellerId
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
    return doc.body.textContent || "";
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
        supervariants: product.supervariant || [],
      });

      const updatedLocations = product.supervariant.map((variant) => {
        const matchingSuperlocation = variant.superlocation.find(
          (location) => location.sellerId === sellerIdFromProfile
        );

        return matchingSuperlocation
          ? {
            allPincode: matchingSuperlocation.allPincode,
            displayStock: matchingSuperlocation.displayStock || '',
            mainStock: matchingSuperlocation.mainStock || '',
            pincode: matchingSuperlocation.pincode || '',
            sellerId: matchingSuperlocation.sellerId || '',
            id: matchingSuperlocation.id || '',
          }
          : {
            allPincode: true,
            displayStock: '',
            mainStock: '',
            pincode: '',
          };
      });

      setSuperLocations(updatedLocations);
    } else {
      console.log("No data or product not found.");
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
    const pincode = typeof location.pincode === 'string'
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

    const superlocationId = productDetails.supervariants[index].superlocation.find(
      (loc) => loc.sellerId === sellerIdFromProfile
    )?.id;
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

      toast.success(`Location ${index + 1} updated successfully!`);
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
        <Row>
          <Col lg={6} xs={12}>
            <Form.Group controlId="fullName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={productDetails.fullName}
                readOnly
              />
            </Form.Group>
          </Col>
          <Col lg={6} xs={12}>
            <Form.Group controlId="brand_name">
              <Form.Label>Brand Name</Form.Label>
              <Form.Control
                type="text"
                name="brand_name"
                value={productDetails.brand_name}
                readOnly
              />
            </Form.Group>
          </Col>
          <Col lg={12} xs={12}>
            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
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
            <Row>
              <Col lg={6} xs={12}>
                <Form.Group controlId="variantName">
                  <Form.Label>Variant Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="variantName"
                    value={variant.variantName}
                    readOnly
                  />
                </Form.Group>
              </Col>

              <Col lg={6} xs={12}>
                <Form.Group controlId={`displayStock-${index}`}>
                  <Form.Label>Display Stock</Form.Label>
                  <Form.Control
                    type="text"
                    name="displayStock"
                    value={superLocations[index]?.displayStock || ''}
                    onChange={(e) => handleSuperLocationChange(index, e)}
                  />
                </Form.Group>
              </Col>

              <Col lg={6} xs={12}>
                <Form.Group controlId={`mainStock-${index}`}>
                  <Form.Label>Main Stock</Form.Label>
                  <Form.Control
                    type="text"
                    name="mainStock"
                    value={superLocations[index]?.mainStock || ''}
                    onChange={(e) => handleSuperLocationChange(index, e)}
                  />
                </Form.Group>
              </Col>

              <Col lg={12} xs={12} className="mb-3">
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
                    className="form-check-inline"
                  />
                </Form.Group>
              </Col>

              {!superLocations[index]?.allPincode && (
                <Col lg={12} xs={12} className="mb-3">
                  <Form.Group controlId={`pincode-${index}`}>
                    <Form.Label>Pincode</Form.Label>
                    <Form.Control
                      type="text"
                      name="pincode"
                      value={superLocations[index]?.pincode || ''}
                      onChange={(e) => handleSuperLocationChange(index, e)}
                      placeholder="Enter Pincode"
                    />
                  </Form.Group>
                </Col>
              )}

              <Button variant="primary" type="submit" disabled={updatingLocation}>
                {updatingLocation ? 'Updating...' : 'Submit'}
              </Button>
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
      <h3>{title}</h3>
      {content}
    </div>
  );
};

export default withRouter(DetailViewProduct);



// import React, { useState, useEffect } from 'react';
// import { NavLink, withRouter, useParams } from 'react-router-dom';
// import { useLazyQuery, useMutation, gql } from '@apollo/client';
// import { Row, Col, Card, Form, Button } from 'react-bootstrap';
// import HtmlHead from 'components/html-head/HtmlHead';
// import { toast } from 'react-toastify';

// const DetailViewProduct = ({ productId, supervariantId }) => {
//   const title = 'View Super Location Details';
//   const description = 'View specific super location fields';
//   const { productname } = useParams();
//   const [profileData, setProfileData] = useState(null);

//   const [superLocation, setSuperLocation] = useState({
//     allPincode: true,
//     displayStock: '',
//     mainStock: '',
//     pincode: '',
//     sellerId: '',
//     id: '',
//   });

//   const [productDetails, setProductDetails] = useState({
//     id: '',
//     superSellerId: '',
//     brand_name: '',
//     description: '',
//     fullName: '',
//     identifier: '',
//     supervariantId: '',
//     variantName: '',
//   });

//   const [sellerIdFromProfile, setSellerIdFromProfile] = useState(null);

//   const GET_PRODUCT = gql`
//     query GetSuperSellerProduct($name: String) {
//       getSuperSellerProduct(name: $name) {
//         id
//         superSellerId
//         brand_name
//         description
//         fullName
//         identifier
//         supervariant {
//           id
//           variantName
//           superlocation {
//             displayStock
//             allPincode
//             mainStock
//             pincode
//             sellerId
//             id
//           }
//         }
//       }
//     }
//   `;

//   const ADD_LOCATION_TO_SUPER_PRODUCT = gql`
//   mutation AddLocationToSuperProduct($productId: ID, $supervariantId: ID, $superlocationId: ID, $location: SuperLocationInput) {
//     addLocationToSuperProduct(productId: $productId, supervariantId: $supervariantId, superlocationId: $superlocationId, location: $location) {
//       id
//       supervariant {
//         id
//         superlocation {
//           allPincode
//           displayStock
//           mainStock
//           pincode
//           id
//         }
//       }
//     }
//   }
// `;

//   const GET_PROFILE = gql`
//     query GetProfile {
//       getProfile {
//         id
//         seller {
//           id
//         }
//       }
//     }
//   `;

//   const [GetSuperSellerProduct, { error, data, refetch }] = useLazyQuery(GET_PRODUCT, {
//     variables: {
//       name: productname.replace(/_/g, ' '),
//     },
//     onError: (err) => {
//       toast.error(err.message || 'Something went wrong!');
//     },
//   });

//   const [getProfile] = useLazyQuery(GET_PROFILE, {
//     onCompleted: (profileResponse) => {
//       const sellerId = profileResponse.getProfile?.seller?.id;
//       setSellerIdFromProfile(sellerId);
//       console.log("Full Profile Response:", sellerId);
//     },
//     onError: (err) => {
//       toast.error(err.message || 'Error fetching profile');
//     },
//   });

//   useEffect(() => {
//     getProfile();
//   }, [getProfile]);

//   const [addLocationToSuperProduct, { loading: updatingLocation }] = useMutation(ADD_LOCATION_TO_SUPER_PRODUCT, {
//     onCompleted: () => {
//       toast.success('Location updated successfully!');
//     },
//     onError: (err) => {
//       toast.error(err.message || 'Error while updating location');
//     },
//   });

//   const stripHtmlTags = (html) => {
//     const doc = new DOMParser().parseFromString(html, 'text/html');
//     return doc.body.textContent || "";
//   };

//   useEffect(() => {
//     if (productname) {
//       GetSuperSellerProduct();
//       refetch();
//     }
//   }, [productname]);

//   useEffect(() => {
//     if (data && data.getSuperSellerProduct) {
//       const product = data.getSuperSellerProduct;
//       const supervariant = data.getSuperSellerProduct.supervariant[0];

//       setProductDetails({
//         id: product.id,
//         superSellerId: product.superSellerId,
//         brand_name: product.brand_name,
//         description: product.description,
//         fullName: product.fullName,
//         identifier: product.identifier,
//         supervariantId: supervariant.id,
//         variantName: supervariant?.variantName || '',
//       });

//       const matchingSuperlocation = supervariant.superlocation.find(
//         (location) => location.sellerId === sellerIdFromProfile
//       );

//       if (matchingSuperlocation) {
//         setSuperLocation({
//           allPincode: matchingSuperlocation.allPincode,
//           displayStock: matchingSuperlocation.displayStock || '',
//           mainStock: matchingSuperlocation.mainStock || '',
//           pincode: matchingSuperlocation.pincode || '',
//           sellerId: matchingSuperlocation.sellerId || '',
//           id: matchingSuperlocation.id || '',
//         });
//       } else {
//         setSuperLocation({
//           allPincode: true,
//           displayStock: '',
//           mainStock: '',
//           pincode: '',
//           sellerId: '',
//         });
//       }
//     } else {
//       console.log("No data or product not found.");
//     }
//   }, [data, supervariantId, sellerIdFromProfile]);

//   useEffect(() => {
//     if (sellerIdFromProfile && productname) {
//       GetSuperSellerProduct();
//       refetch();
//     }
//   }, [productname, sellerIdFromProfile]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setProductDetails((prevState) => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };

//   const handleSuperLocationChange = (e) => {
//     const { name, value } = e.target;
//     setSuperLocation((prevState) => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     const displayStock = parseInt(superLocation.displayStock, 10) || 0;
//     const mainStock = parseInt(superLocation.mainStock, 10) || 0;

//     const pincode = typeof superLocation.pincode === 'string'
//       ? superLocation.pincode
//         .split(',')
//         .map(code => parseInt(code.trim(), 10))
//         .filter(code => !Number.isNaN(code))
//       : [];

//     const locationData = {
//       allPincode: superLocation.allPincode,
//       displayStock,
//       mainStock,
//       pincode,
//     };

//     if (superLocation.id) {
//       locationData.id = superLocation.id;
//     }

//     const submissionData = {
//       productId: productDetails.id,
//       supervariantId: productDetails.supervariantId,
//       superlocationId: locationData.id,
//       location: locationData,
//     };

//     addLocationToSuperProduct({
//       variables: submissionData,
//     });
//   };

//   const matchingSeller = sellerIdFromProfile === superLocation.sellerId;

//   let content;

//   if (error) {
//     content = <p className="text-danger">Error: {error.message}</p>;
//   } else if (data && data.getSuperSellerProduct) {
//     content = (
//       <Form onSubmit={handleSubmit}>
//         <Row>
//           <Col lg={6} xs={12}>
//             <Form.Group controlId="fullName">
//               <Form.Label>Full Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="fullName"
//                 value={productDetails.fullName}
//                 onChange={handleInputChange}
//                 readOnly
//               />
//             </Form.Group>
//           </Col>
//           <Col lg={6} xs={12}>
//             <Form.Group controlId="brand_name">
//               <Form.Label>Brand Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="brand_name"
//                 value={productDetails.brand_name}
//                 onChange={handleInputChange}
//                 readOnly
//               />
//             </Form.Group>
//           </Col>
//           <Col lg={12} xs={12}>
//             <Form.Group controlId="description">
//               <Form.Label>Description</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 name="description"
//                 value={stripHtmlTags(productDetails.description)}
//                 onChange={handleInputChange}
//                 readOnly
//                 className="responsive-textarea"
//               />
//             </Form.Group>
//           </Col>

//           {productDetails.variantName && productDetails.variantName !== "" && (
//             <Col lg={6} xs={12}>
//               <Form.Group controlId="variantName">
//                 <Form.Label>Variant Name</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="variantName"
//                   value={productDetails.variantName}
//                   onChange={handleInputChange}
//                   readOnly
//                 />
//               </Form.Group>
//             </Col>
//           )}
//         </Row>

//         <Row>
//           <Col lg={6} xs={12}>
//             <Form.Group controlId="displayStock">
//               <Form.Label>Display Stock</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="displayStock"
//                 value={superLocation.displayStock}
//                 onChange={handleSuperLocationChange}
//               />
//             </Form.Group>
//           </Col>

//           <Col lg={6} xs={12}>
//             <Form.Group controlId="mainStock">
//               <Form.Label>Main Stock</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="mainStock"
//                 value={superLocation.mainStock}
//                 onChange={handleSuperLocationChange}
//               />
//             </Form.Group>
//           </Col>

//           <Row className="mt-4">
//             <Col lg={12} xs={12} className="mb-3">
//               <Form.Group controlId="allPincode">
//                 <Form.Check
//                   type="checkbox"
//                   label="All India Delivered"
//                   name="allPincode"
//                   checked={superLocation.allPincode}
//                   onChange={(e) =>
//                     setSuperLocation((prevState) => ({
//                       ...prevState,
//                       allPincode: e.target.checked,
//                     }))
//                   }
//                   className="form-check-inline"
//                 />
//               </Form.Group>
//             </Col>

//             {!superLocation.allPincode && (
//               <Col lg={12} xs={12} className="mb-3">
//                 <Form.Group controlId="pincode">
//                   <Form.Label>Pincode</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="pincode"
//                     value={superLocation.pincode}
//                     onChange={handleSuperLocationChange}
//                     placeholder="Enter Pincode"
//                   />
//                 </Form.Group>
//               </Col>
//             )}
//           </Row>
//         </Row>

//         <Button variant="primary" type="submit" disabled={updatingLocation}>
//           {updatingLocation ? 'Updating...' : 'Submit'}
//         </Button>
//       </Form>
//     );
//   } else {
//     content = <p>Loading...</p>;
//   }

//   return (
//     <>
//       <HtmlHead title={title} description={description} />
//       <div className="page-title-container m-0">
//         <Row className="g-0">
//           <Col className="col-auto mb-3 mb-sm-0 me-auto">
//             <NavLink className="muted-link pb-1 d-inline-block" to="/seller/product/list">
//               Back to Product List
//             </NavLink>
//           </Col>
//         </Row>
//       </div>
//       <h1 className="mb-0 fw-bold text-center">{title}</h1>

//       <Card className="mb-3">
//         <Card.Body>
//           {content}
//         </Card.Body>
//       </Card>
//     </>
//   );
// };

// export default withRouter(DetailViewProduct);
