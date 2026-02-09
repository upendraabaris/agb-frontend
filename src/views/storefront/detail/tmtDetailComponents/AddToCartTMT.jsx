import { gql, useMutation } from '@apollo/client';
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom/cjs/react-router-dom';
import Cartitems from 'globalValue/CartItems/Cartitems';
import { toast } from 'react-toastify';
import { useGlobleContext } from 'context/styleColor/ColorContext';

const ADD_TO_CART = gql`
  mutation AddToCart($cartinput: [CartInput]) {
    addToCart(cartinput: $cartinput) {
      id
      cartProducts {
        productId {
          id
        }
        variantId {
          id
        }
        locationId {
          id
        }
        quantity
      }
      createdAt
      updatedAt
    }
  }
`;

function AddToCartTMT({ productID, variantQuantities }) {
  const history = useHistory();
  const { refetch } = Cartitems();
  const { dataStoreFeatures1 } = useGlobleContext();

  const CartToast = () => {
    return (
      <div className="p-2">
        <h6 className="fw-bold text-dark mb-3">Product is added to cart</h6>
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
      const options = {
        autoClose: 10000,
      };
      if (err.message === 'Authorization header is missing') {
        toast.warning('First, "Login" and add product to your cart', options);
        history.push('/login');
      } else {
        toast.error(err.message || 'Something went wrong!');
      }
    },
  });

  const [errors, setErrors] = useState(null);
  const AddToCartHandler = async () => {
    const arrayWithCartItems1 = variantQuantities.filter((item) => item.quantity !== 0).map((item) => item);
    const newarray = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < arrayWithCartItems1.length; i++) {
      if (arrayWithCartItems1[i].quantity === 0) {
        toast.error(`The Quantity of item is Zero 0  for ${arrayWithCartItems1[i].variantName}`);
        // eslint-disable-next-line no-continue
        continue;
      } else if (arrayWithCartItems1[i].quantity > arrayWithCartItems1[i].displayStock) {
        toast.warn(
          `Order Quantity should be less than ${arrayWithCartItems1[i].displayStock / arrayWithCartItems1[i].moq} for ${arrayWithCartItems1[i].variantName}`
        );
        // eslint-disable-next-line no-continue
        continue;
      } else if (arrayWithCartItems1[i].availability !== 'Available') {
        toast.error(`Check Availability of Product by entering Pincode for ${arrayWithCartItems1[i].variantName}`);
      } else {
        newarray.push(arrayWithCartItems1[i]);
      }
    }
    const finalarray = newarray.map((item) => ({
      variantId: item.variantID,
      locationId: item.locationId,
      productId: productID,
      quantity: item.quantity,
    }));

    if (finalarray.length > 0) {
      setErrors('');
      await addToCart({
        variables: {
          cartinput: finalarray,
        },
      });
    } else {
      setErrors('Enter Quantity.');
      toast.error(`Enter Quantity.`);
    }
  };

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
        {`.btn_widht {
          width: 236px;
        }`}
      </style>

      <div>
        <Button className="float-end btn_color btn_widht" onClick={() => AddToCartHandler()}>
          Add to Cart
        </Button>
        {/* {errors && <div className="float-end alert-danger p-2 rounded">{errors}</div>} */}
      </div>
    </>
  );
}

export default AddToCartTMT;
