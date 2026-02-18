import React, { useMemo, useState, useEffect } from 'react';
import { Col, Card, Button, Form, Modal, Row } from 'react-bootstrap';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import DOMPurify from 'dompurify';
import { useHistory } from 'react-router-dom';
import { gql, useMutation, useQuery, useLazyQuery } from '@apollo/client';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';

function AddToCartSummary({ cartData, b2b }) {
  const [cartValue, setCartValue] = useState(0);
  const [shippingCharges, setShippingCharges] = useState(0);
  const [grandSum, setGrandSum] = useState(0);
  const [checkoutError, setCheckoutError] = useState('');
  const [disableCheckoutButton, setDisableCheckoutButton] = useState(false);
  const { dataStoreFeatures1 } = useGlobleContext();
  // const [freeDelivery, setFreeDelivery] = useState(false);
  const [freeDeliveryValue, setFreeDeliveryValue] = useState(0);
  const [minCartValue, setMinCartValue] = useState(0);

  // Coupon Code
  const [couponCode, setCouponCode] = useState('');
  const [DiscountPercentage, setDiscountPercentage] = useState(0);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const [show, setShow] = useState(false);


  // GET SITE CONTENT
  const GET_SITE_CONTENT = gql`
    query GetSiteContent($key: String!) {
      getSiteContent(key: $key) {
        content
        key
      }
    }
  `;

  const [getContent, { data: dataSiteContent }] = useLazyQuery(GET_SITE_CONTENT);

  useEffect(() => {
    getContent({
      variables: {
        key: 'checkOutMessage',
      },
    });
  }, [dataSiteContent, getContent]);

  // handle free delivery
  const MINIMUM_ORDER = gql`
    query GetSiteContent($key: String!) {
      getSiteContent(key: $key) {
        key
        content
      }
    }
  `;

  const [getMinimum] = useLazyQuery(MINIMUM_ORDER, {
    onCompleted: (res) => {
      if (res?.getSiteContent?.key === 'minimumOrder') {
        setMinCartValue(parseInt(res?.getSiteContent?.content, 10));
      }
      if (res.getSiteContent.key === 'freeDelivery') {
        setFreeDeliveryValue(parseInt(res?.getSiteContent?.content, 10));
      }
    },
    onError: (err) => {
      console.log('MINIMUM_ORDER', err);
    },
  });

  useEffect(() => {
    const handlecartterms = async () => {
      await getMinimum({
        variables: {
          key: 'minimumOrder',
        },
      });
      await getMinimum({
        variables: {
          key: 'freeDelivery',
        },
      });
    };
    handlecartterms();
  }, []);

  const [invalidCoupon, setInvalidCoupon] = useState('');

  const GET_COUPON_DETAIL = gql`
    query GetCouponCodeByName($code: String) {
      getCouponCodeByName(code: $code) {
        id
        couponName
        discount
        couponCode
      }
    }
  `;

  const CART_ENQURY_MAIL = gql`
    mutation CartEnquryMail($message: String) {
      cartEnquryMail(message: $message) {
        message
      }
    }
  `;

  const [getCouponDiscount, { data: CouponData }] = useLazyQuery(GET_COUPON_DETAIL, {
    onCompleted: () => {
      if (CouponData?.getCouponCodeByName === null) {
        setInvalidCoupon('Invalid Coupon Code');
        toast.error('Invalid Coupon Code');
      } else if (CouponData) {
        setInvalidCoupon('Valid Code');
        setDiscountPercentage(CouponData?.getCouponCodeByName?.discount);
        toast.success('Coupon Code Applied');
      }
    },
    onError: (err) => {
      console.error('Coupon Code Error', err);
      toast.error('Invalid Coupon Code');
    },
  });
  const transportChargeType = cartData?.cartProducts?.some((charge) => charge.locationId.transportChargeType === 'Shipping Charge');

  useEffect(() => {
    // Calculate total cart value

    let totalCartValue = 0;
    let shipping = 0;
    let DiscountPercentage1 = 0;
    cartData.cartProducts?.forEach((pItem) => {
      const { quantity, locationId } = pItem;
      const shippingcharge = locationId.transportCharge * quantity;
      // const transportChargeType = locationId.transportChargeType;
      const discount = b2b ? locationId.b2bdiscount : locationId.b2cdiscount;
      const priceWithExtraCharge = locationId.price + locationId.extraCharge;
      const priceAfterDiscount = (((100 - discount) * priceWithExtraCharge) / 100).toFixed(2);
      const priceWithQty = (priceAfterDiscount * quantity).toFixed(2);
      totalCartValue += parseFloat(priceWithQty);
      if (totalCartValue >= freeDeliveryValue) {
        shipping = 0;
      } else {
        shipping += parseFloat(shippingcharge);
      }
    });
    if (CouponData?.getCouponCodeByName?.discount > 0) {
      const DiscountPercentage11 = CouponData?.getCouponCodeByName?.discount;
      DiscountPercentage1 = DiscountPercentage11;
    } else {
      DiscountPercentage1 = 0;
    }
    if (couponCode === '') {
      DiscountPercentage1 = 0;
    }
    if (couponCode !== CouponData?.getCouponCodeByName?.couponCode) {
      DiscountPercentage1 = 0;
    }
    const DiscountedPrice = ((100 - DiscountPercentage1) * totalCartValue) / 100;

    setCouponDiscount(DiscountedPrice.toFixed(2));

    // Set the total cart and shipping value
    // setCartValue(DiscountedPrice.toFixed(2));
    setCartValue(totalCartValue.toFixed(2));
    setShippingCharges(shipping.toFixed(2));
    const totalSum = DiscountedPrice + shipping;
    setGrandSum(totalSum.toFixed(2));
  }, [cartData.cartProducts, b2b, freeDeliveryValue, couponCode, CouponData, couponDiscount]);

  const history = useHistory();
  function handleHomePage() {
    history.push(`/`);
  }

  useEffect(() => {
    if (minCartValue) {
      if (cartValue <= minCartValue) {
        setDisableCheckoutButton(true);
        setCheckoutError(`Minimum Cart Value must be ₹ ${minCartValue}`);
      } else {
        setDisableCheckoutButton(false);
        // setCheckoutError(`Minimum Cart value must be ${minCartValue}`);
        setCheckoutError('');
      }
    }
  }, [minCartValue, cartValue, disableCheckoutButton]);

  const checkout = () => {
    const cartLength = cartData.cartProducts?.length;
    if (cartLength) {
      if (cartValue >= minCartValue) {
        history.push('/checkout', {
          state: cartValue - couponDiscount ? DiscountPercentage : 0,
          couponCode: cartValue - couponDiscount ? couponCode : '',
          couponDiscountAmount: cartValue - couponDiscount,
        });
      } else {
        setCheckoutError(`Minimum Cart Value must be ₹ ${minCartValue}`);
      }
    } else {
      setCheckoutError('Add Item to Chec kout !');
    }
  };

  const preCheckout = () => {
    if (transportChargeType) {
      setShow(true);
    } else {
      checkout();
    }
  };
  const validationSchema = Yup.object().shape({
    message: Yup.string().required('Message is required'),
  });
  const [enquiryModal, setEnquiryModal] = useState(false);
  const [sendEnqueryMail, { loading }] = useMutation(CART_ENQURY_MAIL);
  const onSubmit = async (values, { resetForm }) => {
    try {
      const response = await sendEnqueryMail({
        variables: { ...values },
        onCompleted: () => {
          setEnquiryModal(false);
          toast.success('Your Cart Enquiry has been received. A representative will contact you shortly.', {
            autoClose: 8000, // Duration in milliseconds
          });
          setTimeout(() => {
            history.push('/cart');
          }, 2000);
        },
        onError: (error) => {
          console.error(error.message);
        },
      });
      // eslint-disable-next-line no-alert
      alert(response.data.bulkEnqueryMail.message);
      resetForm();
    } catch (error) {
      console.error(error);
      // eslint-disable-next-line no-alert
      // toast.error('Some error occurred');
    }
  };

  const initialValues = { message: '' };
  const formik = useFormik({ initialValues, validationSchema, onSubmit });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  function handleSendEnquiry() {
    setEnquiryModal(true);
    // history.push('/send');
  }
  function EnquirySend() {
    toast.success('successfull');
    setEnquiryModal(false);
  }

  function handleCoupon() {
    getCouponDiscount({
      variables: {
        code: couponCode,
      },
    });
  }

  // console.log("CRAP", Number.isNaN(DiscountPercentage));

  return (
    <>
      <style>
        {`.bg_color {
          background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
          color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
        }`}
        {`.font_color {
          color: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
        }`}
        {`
          .btn_color {
            background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
            color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
            transition: background 0.3s ease;
            padding: 10px 30px;
            border: none;
            cursor: pointer;            
          }
          .btn_color:hover {
            background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
            filter: brightness(80%);       
          }
        `}
      </style>
      {/* <h2 className="small-title text-danger">Shipping Charges above &#8377; {freeDeliveryValue} is 0 !</h2> */}
      {cartData && cartData?.cartProducts?.length > 0 && (
        <Card className="mb-2 w-100 sw-lg-50">
          <div className="text-center fw-bold py-1 bg_color pt-2 pb-2 rounded">Payment Summary</div>
          <Card.Body>
            <div className="mb-4">
              <div className="mb-2">
                <Row>
                  <Col className="col-md-8 col-sm-7 col-8">
                    <p className="mb-1">Cart Value</p>
                  </Col>
                  <Col className="text-end">
                    <p>&#8377; {cartValue}</p>
                  </Col>
                </Row>
              </div>
              {/* {DiscountPercentage > 0 && } COUPON DISCOUNTED PRICE   */}
              {couponDiscount && (
                <div className="mb-2">
                  <Row>
                    <Col className="col-md-8 col-sm-7 col-8">
                      <p className="mb-1">Coupon Discount</p>
                    </Col>
                    <Col className="text-end">
                      <p>{!DiscountPercentage || DiscountPercentage <= 0 ? <>&#8377; 0.00 </> : <> - &#8377; {(cartValue - couponDiscount).toFixed(2)}</>}</p>
                    </Col>
                  </Row>
                </div>
              )}
              {/* <div className="mb-2">
              <p className="text-small text-muted mb-1">COUPON DISCOUNT</p>
              <p>
                <span className="text-alternate">{DiscountPercentage}% OFF</span>
              </p>
            </div> */}
              <div className="mb-2">
                <Row>
                  <Col className="col-md-8 col-sm-7 col-8">
                    {' '}
                    <p className=" mb-1">Delivery Charge</p>{' '}
                  </Col>
                  <Col className="text-end">
                    {' '}
                    <p>&#8377; {shippingCharges} </p>{' '}
                  </Col>
                </Row>
              </div>
              <div className="mb-2">
                <Row>
                  <Col className="col-md-8 col-sm-7 col-8">
                    <p className=" mb-1">Cart Total</p>
                  </Col>
                  <Col className="text-end">
                    {grandSum && <p className="mb-1 fw-bolder"> &#8377; {grandSum}</p>}

                    {/* {grandSum && (
                  <div className="cta-2">
                    <span>
                      <span className="text-small text-muted cta-2">&#8377; </span>
                      
                    </span>
                  </div>
                )} */}
                  </Col>
                </Row>
              </div>
            </div>

            {checkoutError && <p className="text-danger">{checkoutError}</p>}
            {/* coupon code */}
            <div className=" w-100">
              <div className="col-8 float-start">
                <Form.Control className="w-100" type="text" placeholder="Coupon Code" onChange={(e) => setCouponCode(e.target.value)} />
              </div>
              <div className="col-4 float-start">
                <Button disabled={couponCode === ''} className="btn-icon btn-icon-end w-100 ms-1 bg_color" onClick={() => handleCoupon()}>
                  <span>Apply </span>
                </Button>
              </div>
            </div>
            {/* coupon code */}
            <Button className="btn-icon btn-icon-end w-100 bg_color mt-3" disabled={disableCheckoutButton} onClick={() => preCheckout()}>
              <span>Place Order</span> <CsLineIcons icon="chevron-right" />
            </Button>
            <Button className="btn-icon btn-icon-end bg_color w-100 mt-3" onClick={() => handleSendEnquiry()}>
              <span> Send Cart Enquiry</span> <CsLineIcons icon="chevron-right" />
            </Button>
            <Button className="btn btn-lg bg_color btn-icon-end w-100 mt-3" onClick={() => handleHomePage()}>
              {' '}
              <span>Continue Shopping</span> <CsLineIcons icon="chevron-right" />
            </Button>
          </Card.Body>
        </Card>
      )}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Body className="mx-2 my-2 px-2 py-2">
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dataSiteContent?.getSiteContent?.content) }} className="mb-3" />
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="primary" className="btn-icon " onClick={() => setShow(false)}>
            <span>Go Back</span>
          </Button>
          <Button variant="primary" className="btn-icon btn-icon-start" type="button" onClick={() => checkout()}>
            <span>Place Order</span>
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={enquiryModal} onHide={() => setEnquiryModal(false)}>
        <Modal.Body className="mx-2 my-2 px-2 py-2">
          <div className="mb-2 mt-3">
            <div className="w-100">
              <h4 className="fw-bold mb-"> Send Cart Enquiry</h4>
            </div>
            <form id="sellerForm" className="tooltip-end-bottom" onSubmit={handleSubmit}>
              <div className="p-3">
                <div className="mb-1 filled form-group">
                  <CsLineIcons icon="suitcase" />
                  <Form.Control
                    type="text"
                    name="message"
                    as="textarea"
                    className="bg-white border"
                    placeholder="Enter Cart Enquiry Message"
                    value={values.message}
                    onChange={handleChange}
                  />
                  {errors.message && touched.message && <div className="d-block text-danger p-1">Message is required</div>}
                </div>
                <div className="text-center mt-3">
                  <button className="btn btn-primary btn_color btn-lg" type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </Modal.Body>
        {/* <Modal.Footer className="border-0">
          <Button variant="primary" className="btn-icon " onClick={() => setEnquiryModal(false)}>
            <span>Go Back</span>
          </Button>
          <Button variant="primary" className="btn-icon btn-icon-start" type="button" onClick={() => setEnquiryModal()}>
            <span>Checkout</span>
          </Button>
        </Modal.Footer> */}
      </Modal>
    </>
  );
}

export default AddToCartSummary;
