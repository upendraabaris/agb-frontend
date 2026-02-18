import React, { useState, useEffect } from 'react';
import { useParams, NavLink, withRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { Row, Col, Button, Form, Card } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { toast } from 'react-toastify';
import VarientPicker from './components/VarientPicker';
import HandleCategory from './components/HandleCategory';

const DetailViewProduct = ({ history }) => {
  const title = 'Product Detail';
  const description = 'Ecommerce Product Detail Page';
  const { productname } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  // Editor
  const modules = {
    toolbar: [
      [{ font: [] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

  // get product details
  const [productdetail, setProductDetail] = useState(null);
  // const [faqData, setFaqData] = useState([]);

  const GET_PRODUCT = gql`
    query GetProduct($name: String!) {
      getProduct(name: $name) {
        brand_name
        cancellationPolicy
        catalogue
        categories
        description
        sku
        faq {
          answer
          question
        }
        fullName
        giftOffer
        id
        images
        previewName
        returnPolicy
        sellerNotes
        shippingPolicy
        thumbnail
        video
        youtubeLink
        variant {
          hsn
          minimunQty
          moq
          silent_features
          variantName
          active
          allPincode
          location {
            b2bdiscount
            displayStock
            b2cdiscount
            extraCharge
            extraChargeType
            finalPrice
            gstRate
            gstType
            mainStock
            pincode
            price
            priceType
            transportCharge
            transportChargeType
            unitType
          }
        }
      }
    }
  `;

  const [GetProduct, { error, data, refetch }] = useLazyQuery(GET_PRODUCT, {
    variables: {
      name: productname.replace(/_/g, ' '),
    },
    onError: () => {
      toast.error(error.message || 'Something went wrong!');
    },
  });

  useEffect(() => {
    if (data && data.getProduct) {
      setProductDetail({
        ...data.getProduct,
        faq: data.getProduct.faq?.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        })),
        variant: data.getProduct.variant?.map((variant) => {
          const { __typename, ...variantWithoutTypename } = variant;

          // eslint-disable-next-line no-shadow
          const locationWithoutTypename = variantWithoutTypename.location.map(({ __typename, ...rest }) => rest);

          return {
            ...variantWithoutTypename,
            location: locationWithoutTypename,
          };
        }),
      });
    }
  }, [data]);

  useEffect(() => {
    if (productname) {
      GetProduct();
    }
    // eslint-disable-next-line
  }, [productname]);

  // update the details
  const UPDATE_PRODUCT = gql`
    mutation UpdateProduct(
      $updateProductId: ID
      $productImages: [Upload]
      $brandName: String
      $previewName: String
      $fullName: String
      $returnPolicy: String
      $thumbnail: String
      $shippingPolicy: String
      $cancellationPolicy: String
      $description: String
      $giftOffer: String
      $sellerNotes: String
      $video: String
      $images: [String]
      $youtubeLink: String
      $catalogue: String
      $categories: [String]
      $faq: [FaqInput]
      $variant: [VariantInput]
    ) {
      updateProduct(
        id: $updateProductId
        productImages: $productImages
        brand_name: $brandName
        previewName: $previewName
        fullName: $fullName
        returnPolicy: $returnPolicy
        thumbnail: $thumbnail
        shippingPolicy: $shippingPolicy
        cancellationPolicy: $cancellationPolicy
        description: $description
        giftOffer: $giftOffer
        sellerNotes: $sellerNotes
        video: $video
        images: $images
        youtubeLink: $youtubeLink
        catalogue: $catalogue
        categories: $categories
        faq: $faq
        variant: $variant
      ) {
        id
      }
    }
  `;

  const [UpdateProduct] = useMutation(UPDATE_PRODUCT, {
    onCompleted: () => {
      toast('Product Updated Successfully!');
      setTimeout(() => {
        history.push('/seller/product/list');
      }, 3000);
    },
    onError: (err) => {
      toast.error(err.message || 'Something went Wrong!');
    },
  });

  const submit = () => {
    console.log('productdetail', productdetail);
  };

  // HANDLE CATALOGUE

  const handleDownload = () => {
    if (productdetail.catalogue) {
      const downloadLink = productdetail.catalogue;
      window.open(downloadLink, '_blank');
    }
  };
  // HANDLE VIDEO

  const handleVideoDownload = () => {
    if (productdetail.video) {
      const downloadLink = productdetail.video;
      window.open(downloadLink, '_blank');
    }
  };
  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/seller/product/add_from_existing_product">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Existing Product List</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
          </Col>
          {/* Title End */}
        </Row>
      </div>
      {data?.getProduct && productdetail && (
        <>
          <Form>
            <Row>
              <Col xl="8">
                <Card className="mb-5">
                  <Card.Body>
                    <div className="mb-2">
                      <Form.Group controlId="fullName">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control type="text" name="fullName" value={productdetail.fullName || ''} disabled />
                      </Form.Group>
                    </div>

                    <div className="row">
                      <div className="mb-2 col-md-6">
                        <Form.Group controlId="previewName">
                          <Form.Label>Preview Name</Form.Label>
                          <Form.Control type="text" name="previewName" value={productdetail.previewName || ''} disabled />
                        </Form.Group>
                      </div>
                      <div className="mb-2 col-md-6">
                        <Form.Group controlId="brand_name">
                          <Form.Label>Brand Name</Form.Label>
                          <Form.Control type="text" name="brand_name" value={productdetail.brand_name || ''} disabled />
                        </Form.Group>
                      </div>
                    </div>
                    <div className="mb-3">
                      <Form.Group controlId="description">
                        <Form.Label className="fs-5">Description</Form.Label>
                        <ReactQuill modules={modules} theme="snow" value={productdetail.description || ''} />
                      </Form.Group>
                    </div>
                    <div className="mb-3">
                      <Form.Group controlId="sellerNotes">
                        <Form.Label className="fs-5">Seller Notes</Form.Label>
                        <ReactQuill modules={modules} theme="snow" placeholder="Seller's Notes" value={productdetail.sellerNotes || ''} />
                      </Form.Group>
                    </div>

                    <div className="mb-3">
                      <Form.Group controlId="returnPolicy">
                        <Form.Label className="fs-5">returnPolicy</Form.Label>
                        <ReactQuill modules={modules} theme="snow" placeholder="return Policy" value={productdetail.returnPolicy || ''} />
                      </Form.Group>
                    </div>
                    <div className="mb-3">
                      <Form.Group controlId="shippingPolicy">
                        <Form.Label className="fs-5">shippingPolicy</Form.Label>
                        <ReactQuill modules={modules} theme="snow" placeholder="Shipping Policy" value={productdetail.shippingPolicy || ''} />
                      </Form.Group>
                    </div>
                    <div className="mb-3">
                      <Form.Group controlId="cancellationPolicy">
                        <Form.Label className="fs-5">cancellationPolicy</Form.Label>
                        <ReactQuill modules={modules} theme="snow" placeholder="Cancellation Policy" value={productdetail.cancellationPolicy || ''} />
                      </Form.Group>
                    </div>
                    <div className="mb-3">
                      <Form.Label className="fs-5">FAQ</Form.Label>
                      {productdetail?.faq.map((item, index) => (
                        <div key={index} className="mb-3 d-flex">
                          <Form.Control type="text" value={item.question || ''} disabled placeholder="Question" />
                          <Form.Control type="text" value={item.answer || ''} className="ms-2" disabled placeholder="Answer" />
                        </div>
                      ))}
                    </div>
                    <HandleCategory productdetail={productdetail} setProductDetail={setProductDetail} />
                  </Card.Body>
                </Card>
              </Col>
              <Col xl="4">
                <Card className="mb-3">
                  <Card.Body>
                    <div className="row mb-3">
                      {productdetail.thumbnail && (
                        <div style={{ height: '75px', width: '75px' }} className="ms-3">
                          <img src={productdetail.thumbnail} alt="thumbnail" className="h-100 w-auto" />
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <Form.Group controlId="thumbnail">
                        <Form.Label className="fs-5">Thumbnail</Form.Label>
                      </Form.Group>
                    </div>
                  </Card.Body>
                </Card>
                <Card className="mb-3">
                  <Card.Body>
                    <div className="row mb-3">
                      {productdetail.images?.map((image, i) => {
                        return (
                          <div key={i} className="col-auto">
                            <div style={{ height: '75px', width: '75px' }} className="ms-3">
                              <img src={image} alt="productImages" className="h-100 w-auto" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mb-3">
                      <Form.Group controlId="productImages">
                        <Form.Label className="fs-5">productImages</Form.Label>
                      </Form.Group>
                    </div>
                  </Card.Body>
                </Card>
                <Card className="mb-3">
                  <Card.Body>
                    {productdetail.catalogue && (
                      <div className="row mb-3">
                        <div className="col-auto">
                          <Button variant="foreground-alternate" className="btn-icon btn-icon-only shadow" onClick={handleDownload}>
                            <CsLineIcons icon="download" className="text-primary" size="17" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="mb-3">
                      <Form.Group controlId="catalogue">
                        <Form.Label className="fs-5">Catalogue</Form.Label>
                      </Form.Group>
                    </div>
                  </Card.Body>
                </Card>
                <Card className="mb-3">
                  <Card.Body>
                    {productdetail.video && (
                      <div className="row mb-3">
                        <div className="col-auto">
                          <Button variant="foreground-alternate" className="btn-icon btn-icon-only shadow" onClick={handleVideoDownload}>
                            <CsLineIcons icon="download" className="text-primary" size="17" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="mb-3">
                      <Form.Group controlId="video">
                        <Form.Label className="fs-5">Video</Form.Label>
                      </Form.Group>
                    </div>
                  </Card.Body>
                </Card>
                <Card className="mb-3">
                  <Card.Body>
                    <div className="row">
                      <div className="mb-3">
                        <Form.Group controlId="sku">
                          <Form.Label className="fs-5">SKU</Form.Label>
                          <Form.Control type="text" name="sku" value={productdetail.sku || ''} disabled />
                        </Form.Group>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
                <Card className="mb-3">
                  <Card.Body>
                    <div className="row">
                      <div className="mb-3">
                        <Form.Group controlId="giftOffer">
                          <Form.Label className="fs-5">Gift Offer</Form.Label>
                          <Form.Control type="text" name="giftOffer" value={productdetail.giftOffer || ''} disabled />
                        </Form.Group>
                      </div>
                      <div className="mb-3">
                        <Form.Group controlId="youtubeLink">
                          <Form.Label className="fs-5">Youtube Link</Form.Label>
                          <Form.Control type="text" name="youtubeLink" value={productdetail.youtubeLink || ''} disabled />
                        </Form.Group>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Form>

          <Row>
            <Col xl="8" className="order-2 order-xl-1">
              <Card className="mb-3">
                <Card.Body>
                  <VarientPicker productVariant={productdetail.variant} setProductDetail={setProductDetail} />
                </Card.Body>
              </Card>
            </Col>
            <Col xl="4" className="order-1 order-xl-2">
              <h2 className="small-title">Variant List</h2>
              <Card className="mb-5">
                <Card.Body>
                  {productdetail.variant?.map((variant, i) => {
                    return (
                      <div key={i}>
                        <p>{variant.variantName}</p>
                      </div>
                    );
                  })}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Button onClick={submit} type="button">
          Submit
          </Button>
          {/* <Button onClick={print} type="button">
            Print
          </Button> */}
        </>
      )}
    </>
  );
};

export default withRouter(DetailViewProduct);
