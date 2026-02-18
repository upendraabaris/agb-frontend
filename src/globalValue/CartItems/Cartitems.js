import { useEffect, useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from 'auth/authSlice';
import { toast } from 'react-toastify';

const GET_CART_DETAILS = gql`
  query Cart {
    cart {
      cartProducts {
        productId {
          previewName
          thumbnail
          brand_name
          identifier
          fullName
          images
          id
        }
        variantId {
          variantName
          moq
          id
          minimunQty
        }
        locationId {
          id
          b2cdiscount
          b2bdiscount
          displayStock
          extraCharge
          extraChargeType
          finalPrice
          gstType
          gstRate
          mainStock
          pincode
          priceType
          price
          transportChargeType
          transportCharge
          unitType
          sellerId {
            gstin
            gstinComposition
          }
        }
        quantity
        sellerId
      }
    }
  }
`;

function Cartitems() {
  const dispatch = useDispatch();
  const [cartData, setCartData] = useState(null);
  const [CartProducts, { data, refetch, error, loading }] = useLazyQuery(GET_CART_DETAILS, {
    onCompleted() {
      setCartData(data.cart);
    },
    onError() {
      if (error?.message === 'Authorization header is missing') {
        // Do nothing here
      } else if (error?.message === 'jwt expired' || error?.message === 'User not found') {
        dispatch(logoutUser());
      } else {
        toast.error(error.message || 'Something went wrong!');
        console.error('GET_CART_DETAILS', error);
      }
    },
  });

  useEffect(() => {
    CartProducts();
  }, [CartProducts]);

  return { loading, cartData, error, refetch };
}

export default Cartitems;
