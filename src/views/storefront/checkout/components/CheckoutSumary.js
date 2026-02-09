import React, { useState, useEffect } from 'react';
import { Card, Button, Col, Modal } from 'react-bootstrap';
import { useLocation, useHistory } from 'react-router-dom';
import { useGlobleContext } from 'context/styleColor/ColorContext';

function CheckoutSumary({ b2b, cartData, handlePaymentAfterCharges, checkoutError, freeDeliveryValue, paymentCharge, dmtCommission }) {
  const [cartValue, setCartValue] = useState(0);
  const [shippingCharges, setShippingCharges] = useState(0);
  const [grandSum, setGrandSum] = useState(0);
  const [modalView, setModalView] = useState(false);
  const { dataStoreFeatures1 } = useGlobleContext();
  // handle discount

  const location = useLocation();
  const history = useHistory();

  const DiscountPercentage = location?.state?.state;

  useEffect(() => {
    if (DiscountPercentage === undefined) {
      history.push('/cart');
    }
  }, [DiscountPercentage, history]);

  const [couponDiscount, setCouponDiscount] = useState(0);

  useEffect(() => {
    // Calculate total cart value
    let totalCartValue = 0;
    let shipping = 0;

    const updatedOrderProduct = [];
    cartData.cartProducts?.forEach((pItem) => {
      const { quantity, locationId, productId, variantId, sellerId } = pItem;
      const shippingcharge = locationId.transportCharge * quantity;
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

      updatedOrderProduct.push({
        locationId: locationId.id,
        productId: productId.id,
        quantity,
        variantId: variantId.id,
        sellerId,
        shipping: parseFloat(shippingcharge),
        price: parseFloat(priceWithQty),
        iprice: locationId.price,
        igst: locationId.gstRate,
        idiscount: discount,
        iextraChargeType: locationId.extraChargeType,
        iextraCharge: locationId.extraCharge,
        itransportChargeType: locationId.transportChargeType,
        itransportCharge: locationId.transportCharge,
      });
    });

    const DiscountedPrice = ((100 - DiscountPercentage) * totalCartValue) / 100;

    setCouponDiscount(DiscountedPrice.toFixed(2));

    // Set the total cart and shipping value
    setCartValue(totalCartValue.toFixed(2));
    setShippingCharges(shipping.toFixed(2));
    // const totalSum = totalCartValue + shipping;
    const totalSum = DiscountedPrice + shipping;

    setGrandSum(totalSum.toFixed(2));
    handlePaymentAfterCharges(totalSum, updatedOrderProduct, totalCartValue, shipping);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartData, cartData.cartProducts, b2b, freeDeliveryValue, paymentCharge, dmtCommission]);

  // price after payment charges

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
      <Col lg="auto" className="order-0 order-lg-0">
        {/* <h2 className="small-title text-danger">Shipping Charges above &#8377; {freeDeliveryValue} is 0 !</h2> */}

        <Card className="mb-5 w-100 sw-lg-35">
          <div>
            <div className="text-center fw-bold py-1 bg_color pt-2 pb-2  rounded">Payment Summary </div>
            <div className=" p-3 rounded-bottom">
              <div className="mb-2">
                <div className="col-12">
                  <span className="text-dark">My Cart</span>
                  <span className="mb-1 bolder float-end">{cartData.cartProducts.length || 0} Items</span>
                </div>
              </div>
              <div className="mb-2 mt-4">
                <div className="col-12">
                  <span className="  text-dark">Cart Value</span>
                  <span className="mb-1 bolder float-end">&#8377; {cartValue}</span>
                </div>
              </div>
              {/* {DiscountPercentage > 0 && } COUPON DISCOUNTED PRICE   */}
              <div className="mb-2 mt-4">
                <div className="col-12">
                  <span className=" text-dark">Coupon Discount</span>
                  <span className="mb-1 bolder text-dark float-end">
                    {!DiscountPercentage || DiscountPercentage <= 0 ? (
                      <span>
                        <span className="text-small text-muted text-dark">&#8377; </span>0.00
                      </span>
                    ) : (
                      <span className="text-dark">
                        <span className="text-dark">- &#8377; </span>
                        {(cartValue - couponDiscount).toFixed(2)}
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <div className="mb-2 mt-4">
                <div className="col-12">
                  <span className="  text-dark">Delivery Charge</span>
                  <span className="mb-1 bolder float-end">
                    <span className="text-small text-dark">&#8377; </span>
                    {shippingCharges}
                  </span>
                </div>
              </div>
              <div className="mb-2 mt-4">
                <div className="col-12">
                  <span className="  text-dark">Cart Total</span>
                  <span className="mb-1 bolder float-end cta-4 ">
                    {grandSum && (
                      <div className="cta-4 fw-bold">
                        <span>
                          <span className="text-small cta-4 fw-bold">&#8377; </span>
                          {grandSum}
                        </span>
                      </div>
                    )}
                  </span>
                </div>
                {checkoutError?.minCartValueError && (
                  <div className="alert alert-danger d-flex align-items-center mt-4 p-2 small" role="alert">
                    {checkoutError.minCartValueError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </Col>

      <Modal size="sm" aria-labelledby="contained-modal-title-vcenter" centered show={modalView} onHide={() => setModalView(false)}>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">payment !</Modal.Title>
        </Modal.Header>
        <Modal.Body>Proceed to Payment ?</Modal.Body>
        <Modal.Footer>
          <Button>Proceed</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CheckoutSumary;
