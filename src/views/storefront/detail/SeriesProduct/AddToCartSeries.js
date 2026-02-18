import { gql, useMutation, useLazyQuery } from '@apollo/client';
import React from 'react';
import { Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom/cjs/react-router-dom';
import Cartitems from 'globalValue/CartItems/Cartitems';
import { toast } from 'react-toastify';

function AddToCartSeries({ productID, variantQuantities }) {
  const history = useHistory();
  const { refetch } = Cartitems();

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

  const [addToCart, { loading, error, data }] = useMutation(ADD_TO_CART, {
    onCompleted: () => {
      toast.success('Product successfully added to your shopping cart.');
      refetch();
    },
    onError: (err) => {
      if (err.message === 'Authorization header is missing') {
        toast('Please Login to add item');
        history.push('/login');
      } else {
        toast.error(err.message || 'Something went wrong!');
      }
    },
  });

  const AddToCartHandler = async () => {
    const arrayWithCartItems = variantQuantities.map((item, index) => {
      if (item.quantity === 0) {
        toast.error('The Quantity of item is Zero 0');
      } else if (item.availability !== 'Available') {
        toast.error('Check Availability of Product by entring Pincode!!!');
      } else if (item.quantity > item.displayStock) {
        toast.warn(`Order Quantity should be less than ${item.displayStock / item.moq}`);
      } else if (item.availability === 'Available') {
        return {
          productId: productID,
          variantId: item.variantID,
          locationId: item.locationId,
          quantity: parseInt(item.quantity, 10),
        };
      }
      return 0;
    });

    await addToCart({
      variables: {
        cartinput: arrayWithCartItems,
      },
    });

    // setTimeout(() => {
    //   addToCart({
    //     variables: {
    //       variantId: item.variantID,
    //       locationId: item.locationId,
    //       productId: productID,
    //       quantity: parseInt(item.quantity, 10),
    //     },
    //   });
    // }, 1000 * index);
  };

  return (
    <div>
      <Button onClick={() => AddToCartHandler()}>Add to Cart</Button>
    </div>
  );
}

export default AddToCartSeries;
