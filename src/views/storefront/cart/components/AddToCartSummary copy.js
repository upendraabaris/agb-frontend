import React, { useMemo, useState, useEffect } from 'react';
import { Col, Card, Button } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useHistory } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';

function AddToCartSummary({ cartData, b2b }) {
  const [cartValue, setCartValue] = useState(0);
  const [shippingCharges, setShippingCharges] = useState(0);
  const [grandSum, setGrandSum] = useState(0);
  const [checkoutError, setCheckoutError] = useState('');

  // const [freeDelivery, setFreeDelivery] = useState(false);
  const [freeDeliveryValue, setFreeDeliveryValue] = useState(5000);
  const [minCartValue, setMinCartValue] = useState(100);

  useEffect(() => {
    // Calculate total cart value
    let totalCartValue = 0;
    let shipping = 0;
    cartData.cartProducts?.forEach((pItem) => {
      const { quantity, locationId } = pItem;
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
    });

    // Set the total cart and shipping value
    setCartValue(totalCartValue.toFixed(2));
    setShippingCharges(shipping.toFixed(2));
    const totalSum = totalCartValue + shipping;
    setGrandSum(totalSum.toFixed(2));
  }, [cartData.cartProducts, b2b, freeDeliveryValue]);

  const history = useHistory();

  const checkout = () => {
    const cartLength = cartData.cartProducts?.length;
    if (cartLength) {
      if (cartValue >= minCartValue) {
        history.push('/checkout');
      } else {
        setCheckoutError(`Minimum Cart value must be ${minCartValue}`);
      }
    } else {
      setCheckoutError('Add Item to Chec kout !');
    }
  };

  function handleSendEnquiry() { 
    history.push('/send');
  }
  return (
    <Col xs="12" lg="auto" className="order-0 order-lg-1">
      <h2 className="small-title text-danger">Shipping Charges above &#8377; {freeDeliveryValue} is 0 !</h2>
      <h2 className="small-title">Summary</h2>
      <Card className="mb-5 w-100 sw-lg-35">
        <Card.Body>
          <div className="mb-4">
            <div className="mb-2">
              <p className="text-small text-muted mb-1">ITEMS</p>
              <p>
                <span className="text-alternate">{cartData.cartProducts.length || 0}</span>
              </p>
            </div>
            <div className="mb-2">
              <p className="text-small text-muted mb-1">TOTAL</p>
              <p>
                <span className="text-alternate">
                  <span className="text-small text-muted">&#8377; </span>
                  {cartValue}
                </span>
              </p>
            </div>
            <div className="mb-2">
              <p className="text-small text-muted mb-1">SHIPPING</p>
              <p>
                <span className="text-alternate">
                  <span className="text-small text-muted">&#8377; </span>
                  {shippingCharges}
                </span>
              </p>
            </div>
            <div className="mb-2">
              <p className="text-small text-muted mb-1">Coupon Discount</p>
              <p>
                <span className="text-alternate">
                  <span className="text-small text-muted">&#8377; </span>0
                </span>
              </p>
            </div>
            <div className="mb-2">
              <p className="text-small text-muted mb-1">GRAND TOTAL</p>
              {grandSum && (
                <div className="cta-2">
                  <span>
                    <span className="text-small text-muted cta-2">&#8377; </span>
                    {grandSum}
                  </span>
                </div>
              )}
            </div>
          </div>
          {checkoutError && <p className="text-danger">{checkoutError}</p>}
          <Button className="btn-icon btn-icon-end w-100" variant="primary" onClick={checkout}>
            <span>Checkout</span> <CsLineIcons icon="chevron-right" />
          </Button>
          <Button className="btn-icon btn-icon-end w-100 mt-3" variant="primary" onClick={() => handleSendEnquiry()}>
            <span> Send Item Enquiry</span> <CsLineIcons icon="chevron-right" />
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
}

export default AddToCartSummary;
