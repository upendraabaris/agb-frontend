import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Card, Button, Col, Form, Row, Modal } from 'react-bootstrap';
import { gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

function CheckoutSumary({ b2b, cartData, currentUser, shippingAddressID, billingAddressID, handlePaymentAfterCharges, setcheckoutError, checkoutError }) {
  const [cartValue, setCartValue] = useState(0);
  const [shippingCharges, setShippingCharges] = useState(0);
  const [grandSum, setGrandSum] = useState(0);
  const [freeDeliveryValue, setFreeDeliveryValue] = useState(5000);
  const [minCartValue, setMinCartValue] = useState(100);
  const [orderProduct, setOrderProduct] = useState([]);
  // handle modal view
  const [modalView, setModalView] = useState(false);

  useEffect(() => {
    // Calculate total cart value
    let totalCartValue = 0;
    let shipping = 0;
    const updatedOrderProduct = [];
    cartData.cartProducts?.forEach((pItem) => {
      const { quantity, locationId, productId, variantId } = pItem;
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
        shipping,
        price: parseFloat(priceWithQty),
      });
    });

    // Set the total cart and shipping value
    setCartValue(totalCartValue.toFixed(2));
    setShippingCharges(shipping.toFixed(2));
    const totalSum = totalCartValue + shipping;
    setGrandSum(totalSum.toFixed(2));
    handlePaymentAfterCharges(totalSum);
    // paymentChargesHandler(parseFloat(totalSum.toFixed(2)));

    setOrderProduct(updatedOrderProduct);
  }, [cartData, cartData.cartProducts, b2b, freeDeliveryValue, handlePaymentAfterCharges]);

  // price after payment charges

  const MAKE_PAYMENT = gql`
    mutation MakePayment($amount: String, $firstname: String, $email: String, $phone: String) {
      makePayment(amount: $amount, firstname: $firstname, email: $email, phone: $phone) {
        success
        redirectUrl
      }
    }
  `;
  const CREATE_ORDER = gql`
    mutation CreateOrder(
      $paymentMethod: String
      $totalAmount: Float
      $orderProducts: [OrderProducts]
      $shippingAddress: ID
      $billingAddress: ID
      $status: String
    ) {
      createOrder(
        paymentMethod: $paymentMethod
        totalAmount: $totalAmount
        orderProducts: $orderProducts
        shippingAddress: $shippingAddress
        billingAddress: $billingAddress
        status: $status
      ) {
        id
      }
    }
  `;

  const [MakePayment] = useMutation(MAKE_PAYMENT, {
    onCompleted: (res) => {
      window.location.href = res.makePayment.redirectUrl;
    },
    onError: (err) => {
      console.log('MAKE_PAYMENT', err);
    },
  });

  const paymenthandler = async () => {
    try {
      await MakePayment({
        variables: {
          amount: grandSum,
          firstname: currentUser.firstName,
          email: currentUser.email,
          phone: currentUser.mobileNo,
        },
      });
    } catch (error) {
      toast.error(error.message || 'Payment Error!');
    }
  };

  const [CreateOrder] = useMutation(CREATE_ORDER, {
    onCompleted: (res) => {
      if (res) {
        setModalView(true);
      }
    },
    onError: (err) => {
      // toast.error(err.message || 'Something went wrong!');
      
    },
  });

  const validateForm = () => {
    const errors = {};
    if (!billingAddressID) {
      errors.billingAddressID = 'Billing Address is required!.';
    }

    if (!shippingAddressID) {
      errors.shippingAddressID = 'Shipping Address is required!.';
    }
    if (cartValue <= minCartValue) {
      errors.minCartValueError = `Minimum Cart Value must be ${minCartValue}`;
    }
    return errors;
  };

  const handleCheckout = async () => {
    const errors = await validateForm();

    if (Object.keys(errors).length > 0) {
      setcheckoutError(errors);
      return;
    }
    setcheckoutError({});

    if (!(cartValue >= freeDeliveryValue)) {
      orderProduct.forEach((item) => {
        item.price += item.shipping;
      });
      orderProduct.forEach((item) => {
        delete item.shipping;
      });

      try {
        await CreateOrder({
          variables: {
            paymentMethod: 'ONLINE',
            orderProducts: orderProduct,
            totalAmount: parseFloat(grandSum),
            shippingAddress: shippingAddressID,
            billingAddress: billingAddressID,
            status: 'Pending',
          },
        });
      } catch (error) {
        toast.error(error.message || 'Something went wrong!');
      }
    } else {
      orderProduct.forEach((item) => {
        delete item.shipping;
      });
      try {
        await CreateOrder({
          variables: {
            paymentMethod: 'ONLINE',
            orderProducts: orderProduct,
            totalAmount: parseFloat(grandSum),
            shippingAddress: shippingAddressID,
            billingAddress: billingAddressID,
            status: 'Pending',
          },
        });
      } catch (error) {
        toast.error(error.message || 'Something went wrong!');
      }
    }
  };

  return (
    <>
      <Col lg="auto" className="order-0 order-lg-1">
        <h2 className="small-title text-danger">Shipping Charges above &#8377; {freeDeliveryValue} is 0 !</h2>
        
        <Card className="mb-5 w-100 sw-lg-35">
          <Card.Body>
          <h2 className="small-title bg-primary mb-2 text-white p-2 pt-2 rounded-1">Payment Summary</h2>
            <div className="mb-3">
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
                <p className="text-small text-muted mb-1">SALE</p>
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
                {checkoutError?.minCartValueError && <p className="mt-2 text-danger">{checkoutError.minCartValueError}</p>}
              </div>
            </div>
            {/* {checkoutError && <p className="text-danger">{checkoutError}</p>} */}
            <Button className="btn-icon btn-icon-end w-100 mt-3" variant="primary" onClick={handleCheckout}>
              <span>Make Payment</span> <CsLineIcons icon="chevron-right" />
            </Button>
          </Card.Body>
        </Card>
      </Col>

      <Modal size="sm" aria-labelledby="contained-modal-title-vcenter" centered show={modalView} onHide={() => setModalView(false)}>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">payment !</Modal.Title>
        </Modal.Header>
        <Modal.Body>Proceed to Payment ?</Modal.Body>
        <Modal.Footer>
          <Button onClick={paymenthandler}>Proceed</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CheckoutSumary;
