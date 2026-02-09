import { gql, useMutation } from '@apollo/client';
import React, { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
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

function AddToCartSuperSeller({ productID, variantQuantities }) {
  const history = useHistory();
  const { refetch } = Cartitems();
  const { dataStoreFeatures1 } = useGlobleContext();
  const [loading, setLoading] = useState(false);

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
      setLoading(false); // Stop loading
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
      setLoading(false); // Stop loading
      const options = {
        autoClose: 10000,
      };
      if (err.message === 'Authorization header is missing') {
        history.push('/login', {
          warningMessage: 'You must login before adding any item to the cart',
        });
      } else {
        toast.error(err.message || 'Something went wrong!');
      }
    },
  });

  const [errors, setErrors] = useState(null);

  const AddToCartHandler = async () => {
    try {
      if (!productID) {
        toast.error('Product ID is missing.');
        return;
      }
      const variantArray = Object.values(variantQuantities);
      const newArray = variantArray.slice(0, -1);
      const filteredItems = newArray.filter((item) => {
        // console.log("item", item);

        if (item.quantity === 0) {
          // toast.error(`The Quantity of item is Zero for ${item.variantName}`);
          return false;
        }
        if (item.quantity > item.displayStock) {
          toast.warn(`Order Quantity should be less than ${item.displayStock / item.moq} for ${item.variantName}`);
          return false;
        }
        if (item.availability !== 'Available') {
          toast.error(`Check Availability of Product by entering Pincode for ${item.variantName}`);
          return false;
        }
        return true;
      });
      if (filteredItems.length === 0) {
        setErrors('Enter Quantity.');
        toast.error('Enter Quantity.');
        return;
      }

      const finalarray = filteredItems.map((item) => ({
        variantId: item.variantID,
        locationId: item.locationId,
        productId: productID,
        sellerId: variantQuantities.seller,
        quantity: item.quantity,
      }));

      setErrors('');
      setLoading(true);
      await addToCart({
        variables: {
          cartinput: finalarray,
        },
      });
    } catch (error) {
      setLoading(false);
      toast.error('Something went wrong. Please try again.');
      console.error('Error in AddToCartHandler:', error);
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
        <Button className="btn_color" onClick={() => AddToCartHandler()} disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : 'Add to Cart'}
        </Button>
      </div>
    </>
  );
}

export default AddToCartSuperSeller;
