/* eslint-disable no-dupe-keys */
/* eslint-disable no-undef */
/* eslint-disable object-shorthand */
/* eslint-disable react/jsx-no-bind */
import { gql, useMutation } from '@apollo/client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom/cjs/react-router-dom';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import Cartitems from 'globalValue/CartItems/Cartitems';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import ItemCounter from './Quantity/ItemCounter';

function AddToCartMultiple({ productID, variantID, locationID, mainStock, unitType }) {
  const { dataStoreFeatures1 } = useGlobleContext();  
  const [stock, setStock] = useState(mainStock);
  const [qty, setQuantity] = useState(0);
  const [moq, setmoq] = useState(1);
  const [minimumQty, setminimumQty] = useState(1);
  const [formvalue, setformvalue] = useState(0);
  const [errors, seterrors] = useState('');
  const history = useHistory();
  const { refetch } = Cartitems();

  useEffect(() => {
    setStock(mainStock);
  }, [mainStock]);

  useEffect(() => {
    setQuantity(formvalue);
  }, [formvalue]);

  const ADD_TO_CART = gql`
    mutation AddToCart($cartinput: [CartInput]) {
      addToCart(cartinput: $cartinput) {
        id
      }
    }
  `;

  const CartToast = () => {
    return (
      <div className="p-2">
        <h6 className="fw-bold text-dark mb-3">Product is added to cart.</h6>

        <a href="/cart" className="btn btn-success btn-sm w-100 fw-semibold" style={{ borderRadius: '6px' }}>
          Go to Cart
        </a>
      </div>
    );
  };

  const [addToCart] = useMutation(ADD_TO_CART, {
    onCompleted: () => {
      refetch();
      toast(<CartToast />, {
        autoClose: 6000,
        closeOnClick: true,
        draggable: true,
        pauseOnHover: true,
        hideProgressBar: false,
        position: 'top-right',
      });
    },
    onError: (err) => {
      if (err.message === 'Authorization header is missing') {
        history.push('/login', {
          warningMessage: 'You must login before adding any item to the cart',
        });
      } else {
        toast.error(err.message || 'Something went wrong!');
      }
    },
  });

  async function AddToCartHandler() {
    if (variantID && productID && qty && locationID) {
      seterrors('');
      await addToCart({
        variables: {
          cartinput: [
            {
              productId: productID,
              variantId: variantID,
              locationId: locationID,
              quantity: parseInt(qty, 10),
              // quantity: parseInt(moq * qty, 10),
            },
          ],
        },
      });
    } else {
      seterrors(`Please select Quantity of your Product`);
    }
  }

  return (
    <Row>
      <style>
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
      <Col className="mx-0 col-auto ms-0 me-2 mb-1 px-0">
        <ItemCounter defVal={minimumQty} min={minimumQty} max={stock / moq} setformvalue={setformvalue} />
      </Col>
      <Col className="col-auto mx-0 mb-1 px-0">
        <Button onClick={AddToCartHandler} className="btn_color">
          Add to <CsLineIcons icon="cart" size="14" className="me-1" />
          {moq > 1 && <span className="ms-1">{`${moq * qty} ${unitType}`}</span>}
        </Button>
        <br />
      </Col>
      {errors && <p className="mx-0 my-1 py-0 px-0 text-danger">{errors}</p>}
    </Row>
  );
}

export default AddToCartMultiple;
