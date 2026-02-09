import { React, useRef, useEffect, useState } from 'react';
import { useQuery, gql, useMutation, useLazyQuery } from '@apollo/client';
import { toast } from 'react-toastify';
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import moment from 'moment';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { Row, Col, Button, Form, Card, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import StoreFeatures from 'globalValue/storeFeatures/StoreFeatures';
// eslint-disable-next-line import/no-extraneous-dependencies
import generatePDF, { Resolution, Margin } from 'react-to-pdf';
import TableRow from './components/TableRow';
import DiscountTable from './components/DiscountTable';

const GET_QUOTATION_DATA = gql`
  query Singlequatation($singlequatationId: ID) {
    singlequatation(id: $singlequatationId) {
      id
      customerName
      customerAddress
      customerGSTIN
      customerBusinessName
      customerMobile
      quatationProducts {
        productId {
          id
          fullName
          brand_name
          brandCompareCategory
        }
        variantId {
          id
          variantName
        }
        locationId {
          id
          price
          b2cdiscount
          gstRate
        }
        discount
        quantity
      }
    }
  }
`;
const GET_TMT_PROUDCT_BY_COMPARE = gql`
  query GetTMTSeriesProductByCompare($name: String) {
    getTMTSeriesProductByCompare(name: $name) {
      id
      fullName
      brand_name
      tmtseriesvariant {
        id
        variantName
        tmtserieslocation {
          id
          price
          gstRate
          b2cdiscount
        }
      }
    }
  }
`;
const CREATE_QUOTATION = gql`
  mutation CreateQuatation(
    $quatationProducts: [QuatationInput]
    $customerName: String
    $customerGstin: String
    $customerBusinessName: String
    $customerMobile: String
    $customerAddress: String
  ) {
    createQuatation(
      quatationProducts: $quatationProducts
      customerName: $customerName
      customerGSTIN: $customerGstin
      customerBusinessName: $customerBusinessName
      customerMobile: $customerMobile
      customerAddress: $customerAddress
    ) {
      id
    }
  }
`;
const UPDATE_QUOTATION = gql`
  mutation UpdateQuatation(
    $updateQuatationId: ID
    $customerName: String
    $customerGstin: String
    $customerBusinessName: String
    $customerMobile: String
    $customerAddress: String
    $quatationProducts: [QuatationInput]
  ) {
    updateQuatation(
      id: $updateQuatationId
      customerName: $customerName
      customerGSTIN: $customerGstin
      customerBusinessName: $customerBusinessName
      customerMobile: $customerMobile
      customerAddress: $customerAddress
      quatationProducts: $quatationProducts
    ) {
      id
    }
  }
`;

function Quotation() {
  const title = 'Quotation Detail Page';
  const description = 'Ecommerce Quotation Detail Page';
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const quatationID = queryParams.get('quatationID');
  const { currentUser } = useSelector((state) => state.auth); 
  const storeFeaturess = StoreFeatures();

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);

  const [Singlequatation, { data, refetch }] = useLazyQuery(GET_QUOTATION_DATA, {
    variables: {
      singlequatationId: quatationID,
    },
    onCompleted: (res) => {
      console.log('res', res?.singlequatation);
    },
    onError: (err) => {
      toast.error(err.message || 'Something Went Wrong !'); 
    },
  });

  useEffect(() => {
    if (quatationID) {
      Singlequatation();
    }
  }, [Singlequatation, quatationID]);
  const [totalQuantity, setTotalQuantity] = useState(null);
  let totalpricewithoutGst = 0;
  let totalGstApplied = 0;
  useEffect(() => {
    function getSum(total, num) {
      return total + num.quantity;
    }
    const sumWithInitial = data?.singlequatation?.quatationProducts.reduce(getSum, 0);
    setTotalQuantity(sumWithInitial);
  }, [data]);

  const handleGST = (appliedGst) => {
    function getPriceSum(total, product) {
      return total + (((100 - product.discount) * product.locationId.price) / 100) * product.quantity;
    }
    const totalPriceSum = data?.singlequatation?.quatationProducts.reduce(getPriceSum, 0);
    const ProductSaleGST = totalPriceSum - appliedGst;
    return ProductSaleGST.toFixed(2);
  };

  const GrandTotalAmount = () => {
    const AppliedGst = handleGST(totalGstApplied);
    const priceWithoutGst = totalpricewithoutGst;
    const finalPrice = parseFloat(AppliedGst) + parseFloat(priceWithoutGst);
    return finalPrice.toFixed(2);
  };

  const [brandCompare, setbrandCompare] = useState(null);

  const [GetTMTSeriesProductByCompare] = useLazyQuery(GET_TMT_PROUDCT_BY_COMPARE, {
    onCompleted: (res) => {
      setbrandCompare(res.getTMTSeriesProductByCompare);
    },
    onError: (err) => {
      console.error('err', err);
    },
  });

  useEffect(() => {
    if (data && data?.singlequatation?.quatationProducts) {
      GetTMTSeriesProductByCompare({
        variables: {
          name: data && data?.singlequatation?.quatationProducts[0].productId.brandCompareCategory,
        },
      });
    }
  }, [GetTMTSeriesProductByCompare, data]);
  const [comapareModalShow, setComapareModalShow] = useState(false);
  const history = useHistory();

  const [createQuotation] = useMutation(CREATE_QUOTATION, {
    onCompleted: (res) => {
      history.push(`/seller/quotation/detail?quatationID=${res?.createQuatation?.id}`);
      Singlequatation();
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });

  const handleBrandChange = async (product) => {
    // Create an array to store matching variant objects
    const matchingVariants = [];

    // Loop through each object in tmtseriesvariant
    // eslint-disable-next-line no-restricted-syntax
    for (const tmtVariant of product.tmtseriesvariant) {
      const tmtVariantName = tmtVariant.variantName;
      const matchingQuatationProduct = data?.singlequatation?.quatationProducts.find((item) => item.variantId.variantName === tmtVariantName);

      if (matchingQuatationProduct) {
        matchingVariants.push({
          productId: product.id,
          variantId: tmtVariant.id,
          locationId: tmtVariant.tmtserieslocation[0].id,
          discount: tmtVariant.tmtserieslocation[0].b2cdiscount,
          quantity: matchingQuatationProduct.quantity,
        });
      }
    }

    if (data?.singlequatation) {
      const { customerName, customerGSTIN, customerBusinessName, customerMobile, customerAddress } = data.singlequatation;

      await createQuotation({
        variables: {
          quatationProducts: matchingVariants,
          customerName,
          customerGstin: customerGSTIN,
          customerBusinessName,
          customerMobile,
          customerAddress,
        },
      });
    }
    setComapareModalShow(false);
  };
  const initialCustomerDetail = {
    customerName: '',
    customerAddress: '',
    customerMobile: '',
    customerBusinessName: '',
    customerGSTIN: '',
  };
  const [customerDetailModalshow, setcustomerDetailModalShow] = useState(false);
  const [customerDetail, setcustomerDetail] = useState(initialCustomerDetail);
  const handleCustomerdetailModal = (e) => {
    setcustomerDetailModalShow(true);
    if (data?.singlequatation) {
      const { customerName, customerGSTIN, customerBusinessName, customerMobile, customerAddress } = data.singlequatation;

      setcustomerDetail({
        customerName,
        customerAddress,
        customerMobile,
        customerBusinessName,
        customerGSTIN,
      });
    }
  };
  const handleCustomerDetail = (e) => {
    const { name, value } = e.target;

    setcustomerDetail((prevValue) => ({
      ...prevValue,
      [name]: value,
    }));
  };

  const [UpdateQuatation] = useMutation(UPDATE_QUOTATION, {
    onCompleted: (res) => {
      // history.push(`/seller/quotation/detail?quatationID=${res?.createQuatation?.id}`);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};

    if (!customerDetail.customerName?.trim()) {
      tempErrors.customerName = "Customer name is required";
    }
    if (!customerDetail.customerMobile?.trim()) {
      tempErrors.customerMobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(customerDetail.customerMobile)) {
      tempErrors.customerMobile = "Enter a valid 10-digit mobile number";
    }
    if (!customerDetail.customerAddress?.trim()) {
      tempErrors.customerAddress = "Address is required";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const updateCustomerDetail = async (e) => {
    e.preventDefault();
    if (!validate()) return; // stop submission if errors exist

    await UpdateQuatation({
      variables: {
        updateQuatationId: quatationID,
        customerGstin: customerDetail.customerGSTIN,
        ...customerDetail,
      },
    });
    setcustomerDetailModalShow(false);
  };

  const [discountmodalView, setDiscountmodalView] = useState(false);
  const [discountForAll, setDiscountForAll] = useState('');
  const [variantListForDiscount, setvariantListForDiscount] = useState([]);
  const handleDiscountForEach = (variantName, e, variantIndex, originalDiscount) => {
    const { value, name } = e.target;
    const updatedVariantList = [...variantListForDiscount];
    const targetObject = updatedVariantList[variantIndex];

    if (originalDiscount < value) {
      return;
    }
    if (targetObject) {
      targetObject[name] = value ? parseInt(value, 10) : 0;
      setvariantListForDiscount(updatedVariantList);
    }
  };

  const SubmitDiscount = async () => {
    if (data?.singlequatation) {
      const { quatationProducts } = data.singlequatation;
      const updatedQuatationProducts = quatationProducts.map((product) => {
        const foundItem = variantListForDiscount.find((item) => item.variantName === product.variantId.variantName);
        if (foundItem) {
          return {
            productId: product.productId.id,
            variantId: product.variantId.id,
            locationId: product.locationId.id,
            discount: foundItem.discount,
            quantity: product.quantity,
          };
        }
        return product;
      });

      await UpdateQuatation({
        variables: {
          updateQuatationId: quatationID,
          quatationProducts: updatedQuatationProducts,
        },
      });
      setDiscountmodalView(false);
    }
  };

  const handleDiscountvalueandModal = () => {
    setDiscountmodalView(true);
    if (data?.singlequatation) {
      const { quatationProducts } = data.singlequatation;
      const discountvariantList = quatationProducts.map(({ discount, variantId, locationId, productId }) => ({
        discount,
        originalDiscount: locationId.b2cdiscount,
        variantName: variantId.variantName,
        productName: productId.fullName,
      }));
      setvariantListForDiscount(discountvariantList);
    }
  };

  const handleDiscountForAll = (e) => {
    const { value } = e.target;
    const newValue = value ? parseInt(value, 10) : 0;
    setDiscountForAll(newValue);

    const updatedArray = variantListForDiscount.map((variant) => {
      if (newValue < variant.originalDiscount) {
        return {
          ...variant,
          discount: newValue,
        };
      }
      return variant;
    });
    setvariantListForDiscount(updatedArray);
  };
  const options = {
    resolution: Resolution.MEDIUM,
    page: {
      margin: {
        top: Margin.SMALL,
        right: Margin.SMALL,
        bottom: Margin.SMALL,
        left: Margin.SMALL,
      },

      // default is 'A4'
      format: 'A4',
      // default is 'portrait'
      orientation: 'portrait',
    },
  };

  const getTargetElement = () => document.getElementById('testId');
  const [loading, setLoading] = useState(false);
  const downloadinvoice = async () => {
    setLoading(true);
    const something = await generatePDF(getTargetElement, options);
    if (something) {
      setLoading(false);
    }
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/seller/dashboard">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Dashboard</span>
            </NavLink>
            {/* <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1> */}
            <h1
              style={{ backgroundColor: '#CEE6EA' }}
              className="fw-bold text-dark p-2 mb-2 border rounded
       text-center fs-5"
            >
              {title}
            </h1>
          </Col>
        </Row>
      </div>
      {data?.singlequatation && (
        <div className="container">
          <div style={{ margin: '0px 3px' }}>
            <div style={{ margin: '0px 100px', color: 'black' }} id="testId">
              <div>
                {storeFeaturess && (
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <div>
                      <b style={{ fontSize: 15, textAlign: 'center' }}>{storeFeaturess.storeName}</b>
                    </div>
                    <div>
                      <b style={{ fontSize: 18, textAlign: 'center' }}>Quotation</b>
                    </div>
                    {/* <div>
                    <b style={{ padding: 10 }} />
                  </div> */}
                    <div
                      style={{
                        float: 'left',
                        textAlign: 'left',
                        width: '40%',
                        fontSize: 12,
                      }}
                    >
                      <b> Quotation No. : </b>
                      {quatationID}
                    </div>
                    <div
                      style={{
                        float: 'right',
                        textAlign: 'right',
                        width: '60%',
                        fontSize: 12,
                      }}
                    >
                      <b> Date : </b> {moment().format('LL')}
                    </div>
                  </div>
                )}
                {data?.singlequatation && (
                  <table className="table-bordered col-sm-12" style={{ width: '100%' }}>
                    <tbody>
                      <tr style={{ border: '1px solid #dfdfdf' }}>
                        <td
                          style={{
                            width: '45%',
                            fontSize: 12,
                            border: '1px solid #dfdfdf',
                            backgroundColor: '#EEEEEE',
                            padding: 6,
                          }}
                        >
                          <b>From </b>
                        </td>
                        <td
                          style={{
                            width: '55%',
                            fontSize: 12,
                            border: '1px solid #dfdfdf',
                            backgroundColor: '#EEEEEE',
                            paddingLeft: 10,
                          }}
                        >
                          <b>To </b>
                        </td>
                      </tr>
                      <tr>
                        {currentUser && (
                          <td
                            style={{
                              fontSize: 12,
                              border: '1px solid #dfdfdf',
                              paddingLeft: 10,
                            }}
                          >
                            <div style={{ paddingBottom: 3 }}>{currentUser.seller?.companyName}</div>
                            <div style={{ paddingBottom: 3 }}>Address : {currentUser.seller?.address}</div>
                            <div style={{ paddingBottom: 3 }}>GSTIN : {currentUser.seller?.gstin}</div>
                            <div style={{ paddingBottom: 3 }}>Mobile Number :{currentUser.seller?.mobileNo} </div>
                            <div style={{ paddingBottom: 3 }}>Email : {currentUser.seller?.email}</div>
                          </td>
                        )}
                        <td
                          style={{
                            fontSize: 12,
                            border: '1px solid #dfdfdf',
                            paddingLeft: 10,
                            verticalAlign: 'top',
                          }}
                        >
                          <div style={{ paddingBottom: 3 }}>
                            <b> Name : </b>
                            {data?.singlequatation?.customerName}
                          </div>
                          <div style={{ paddingBottom: 3 }}>
                            <b> Address : </b>
                            <span> {data?.singlequatation?.customerAddress}</span>
                          </div>
                          <div style={{ paddingBottom: 3 }}>
                            <b> Mobile : </b>
                            {data?.singlequatation?.customerMobile}
                          </div>
                          <div style={{ paddingBottom: 3 }}>
                            <div style={{ width: '100%', paddingBottom: 3 }}>
                              <b>Business Name : </b> {data?.singlequatation?.customerBusinessName}
                            </div>
                            <div style={{ width: '100%' }}>
                              <b>GSTIN : </b> {data?.singlequatation?.customerGSTIN}
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
                {/* <button
                  type="button"
                  style={{
                    backgroundColor: '#fff',
                    float: 'right',
                    color: 'blue',
                    border: '1px solid #fff',
                    fontSize: 13,
                  }}
                >
                  Add New Product
                </button>
                <button
                  type="button"
                  style={{
                    backgroundColor: '#fff',
                    float: 'right',
                    color: 'blue',
                    border: '1px solid #fff',
                    fontSize: 13,
                  }}
                >
                  Add Adhoc Product
                </button> */}
                {/* <button
                type="button"
                style={{
                  backgroundColor: '#fff',
                  float: 'right',
                  color: 'blue',
                  border: '1px solid #fff',
                  fontSize: 13,
                }}
              >
                Add Site Product
              </button> */}
                {data?.singlequatation?.quatationProducts.length > 0 && (
                  <table className="table-bordered col-sm-12" style={{ color: 'black', textAlign: 'center', width: '100%' }}>
                    <tbody>
                      <tr>
                        <td
                          style={{
                            textAlign: 'left',
                            fontSize: 12,
                            border: '1px solid #dfdfdf',
                            backgroundColor: '#EEEEEE',
                            padding: 6,
                          }}
                        >
                          <div>
                            <b>Product Name</b>
                          </div>
                        </td>
                        <td
                          style={{
                            width: '10%',
                            fontSize: 12,
                            border: '1px solid #dfdfdf',
                            backgroundColor: '#EEEEEE',
                            padding: 6,
                          }}
                        >
                          <div>
                            <b>Billing Price</b>
                          </div>
                          <div>
                            <b style={{ fontSize: 10 }}>(Without GST)</b>
                          </div>
                        </td>
                        <td
                          style={{
                            width: 72,
                            fontSize: 12,
                            border: '1px solid #dfdfdf',
                            backgroundColor: '#EEEEEE',
                            padding: 6,
                          }}
                        >
                          <div>
                            <b>Discount</b>
                          </div>
                          <div>
                            <b>%</b>
                          </div>
                        </td>
                        <td
                          style={{
                            width: 72,
                            fontSize: 12,
                            border: '1px solid #dfdfdf',
                            backgroundColor: '#EEEEEE',
                            padding: 6,
                          }}
                        >
                          <div>
                            <b>GST</b>
                          </div>
                          <div>
                            <b>%</b>
                          </div>
                        </td>
                        <td
                          style={{
                            fontSize: 12,
                            border: '1px solid #dfdfdf',
                            width: 70,
                            backgroundColor: '#EEEEEE',
                            padding: 6,
                          }}
                        >
                          <div>
                            <b>Qty.</b>
                          </div>
                          <div style={{ color: '#EEEEEE' }}>.</div>
                        </td>
                        <td
                          style={{
                            width: '15%',
                            fontSize: 12,
                            border: '1px solid #dfdfdf',
                            backgroundColor: '#EEEEEE',
                            padding: 6,
                          }}
                        >
                          <div>
                            <b>Total</b>
                          </div>
                          <div style={{ color: '#EEEEEE' }}>.</div>
                        </td>
                      </tr>

                      {data.singlequatation.quatationProducts.map((product, index) => {
                        const preGstRate = product.locationId.price / ((100 + product.locationId.gstRate) / 100);
                        const priceAfterDiscount = ((100 - product.discount) * preGstRate) / 100;
                        totalpricewithoutGst += priceAfterDiscount * product.quantity;
                        totalGstApplied += priceAfterDiscount * product.quantity;
                        return <TableRow product={product} key={index} preGstRate={preGstRate.toFixed(2)} priceAfterDiscount={priceAfterDiscount.toFixed(2)} />;
                      })}
                      <tr style={{ fontSize: 12, backgroundColor: '#f9f7f7' }}>
                        <td
                          colSpan={4}
                          style={{
                            textAlign: 'right',
                            padding: 4,
                            border: '1px solid #dfdfdf',
                          }}
                        >
                          <b>Product Sale Amount Before GST</b>
                        </td>
                        <td style={{ border: '1px solid #dfdfdf' }}>{totalQuantity && totalQuantity}</td>
                        <td style={{ border: '1px solid #dfdfdf' }}>{totalpricewithoutGst && totalpricewithoutGst.toFixed(2)}</td>
                      </tr>
                      <tr style={{ fontSize: 12, backgroundColor: '#f9f7f7' }}>
                        <td
                          colSpan={4}
                          style={{
                            textAlign: 'right',
                            padding: 4,
                            border: '1px solid #dfdfdf',
                          }}
                        >
                          <b>Product Sale GST</b>
                        </td>
                        <td style={{ border: '1px solid #dfdfdf' }} />
                        <td style={{ border: '1px solid #dfdfdf' }}>{totalGstApplied && handleGST(totalGstApplied)} </td>
                      </tr>
                      <tr style={{ fontSize: 12, backgroundColor: '#f9f7f7' }}>
                        <td
                          colSpan={4}
                          style={{
                            paddingBottom: 2,
                            border: '1px solid #dfdfdf',
                            textAlign: 'right',
                            padding: 4,
                          }}
                        >
                          <b>Cart Total Amount </b>
                        </td>
                        <td style={{ border: '1px solid #dfdfdf' }}> </td>
                        <td style={{ border: '1px solid #dfdfdf' }}>
                          <b> {GrandTotalAmount()}</b>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-around mt-3" style={{ margin: '0px 150px' }}>
              <Button size="sm" onClick={handleDiscountvalueandModal}>
                Edit Discount
              </Button>
              <Button size="sm" onClick={handleCustomerdetailModal}>
                Edit Customer Info
              </Button>

              {/* <PdfDownloader toPDF={toPDF} /> */}
              {loading ? (
                <Button size="sm">Loading Quatation</Button>
              ) : (
                <Button size="sm" onClick={downloadinvoice}>
                  Download Quotation
                </Button>
              )}

              {/* <button type="button" >
                Download Quatation
              </button> */}
              <Button size="sm" onClick={() => setComapareModalShow(true)}>
                Quotation for Other Brands
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal show={comapareModalShow} onHide={() => setComapareModalShow(false)}>
        <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
          <Modal.Title>Brand List </Modal.Title>
        </Modal.Header>
        {brandCompare && (
          <Modal.Body className="mx-2 my-2 px-2 py-2">
            {brandCompare.map((product, index) => (
              <Button className="mt-2 me-2" key={index} onClick={() => handleBrandChange(product)}>
                {product.brand_name}
              </Button>
            ))}
          </Modal.Body>
        )}
      </Modal>

      <Modal show={customerDetailModalshow} onHide={() => setcustomerDetailModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Customer Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={updateCustomerDetail}>
            <Form.Group className="mb-3" controlId="customerName">
              <Form.Label>Customer Name<span className="text-danger"> * </span></Form.Label>
              <Form.Control
                type="text"
                name="customerName"
                autoFocus
                value={customerDetail.customerName || ""}
                onChange={handleCustomerDetail}
                isInvalid={!!errors.customerName}
              />
              <Form.Control.Feedback type="invalid">
                {errors.customerName}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="customerMobile">
              <Form.Label>Customer Mobile<span className="text-danger"> * </span></Form.Label>
              <Form.Control
                type="text"
                name="customerMobile"
                value={customerDetail.customerMobile || ""}
                onChange={handleCustomerDetail}
                maxLength={10}
                isInvalid={!!errors.customerMobile}
              />
              <Form.Control.Feedback type="invalid">
                {errors.customerMobile}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="customerAddress">
              <Form.Label>Customer Address<span className="text-danger"> * </span></Form.Label>
              <Form.Control
                type="text"
                name="customerAddress"
                value={customerDetail.customerAddress || ""}
                onChange={handleCustomerDetail}
                isInvalid={!!errors.customerAddress}
              />
              <Form.Control.Feedback type="invalid">
                {errors.customerAddress}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="customerBusinessName">
              <Form.Label>Customer Business Name</Form.Label>
              <Form.Control type="text" name="customerBusinessName" value={customerDetail.customerBusinessName || ''} onChange={handleCustomerDetail} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="customerGSTIN">
              <Form.Label>Customer GSTIN</Form.Label>
              <Form.Control type="text" name="customerGSTIN" value={customerDetail.customerGSTIN || ''} onChange={handleCustomerDetail} />
            </Form.Group>
            <Button type="submit">Submit</Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal size="lg" show={discountmodalView} onHide={() => setDiscountmodalView(false)} aria-labelledby="example-modal-sizes-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">Edit Discount</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table className="table-bordered col-sm-12" style={{ color: 'black', textAlign: 'center', width: '100%' }}>
            <tbody>
              <tr>
                <td
                  style={{
                    textAlign: 'left',
                    fontSize: 12,
                    border: '1px solid #dfdfdf',
                    backgroundColor: '#EEEEEE',
                    padding: 6,
                  }}
                >
                  <div>
                    <b>Product Name</b>
                  </div>
                </td>
                <td
                  style={{
                    textAlign: 'left',
                    fontSize: 12,
                    border: '1px solid #dfdfdf',
                    backgroundColor: '#EEEEEE',
                    padding: 6,
                  }}
                >
                  <div>
                    <b>Original Discount</b>
                  </div>
                </td>

                <td>
                  <Form.Control
                    type="text"
                    name="discountForall"
                    placeholder="discount for all"
                    autoFocus
                    value={discountForAll}
                    onChange={handleDiscountForAll}
                  />
                </td>
              </tr>

              {variantListForDiscount?.length > 0 &&
                variantListForDiscount.map((product, index) => {
                  return (
                    <DiscountTable
                      key={index}
                      variantIndex={index}
                      product={product}
                      handleDiscountForEach={handleDiscountForEach}
                      discountForAll={discountForAll}
                    />
                  );
                })}
            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={SubmitDiscount}>Save</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Quotation;
