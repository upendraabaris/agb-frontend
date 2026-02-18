import React, { useEffect, useState } from 'react';
import { gql, useMutation, useSubscription, useQuery } from '@apollo/client';
import { NavLink, useHistory } from 'react-router-dom';

import { toast } from 'react-toastify';

function Cartitems() {
  const GET_CART_DETAILS = gql`
    query CartProducts {
      cart {
        cartProducts {
          quantity
          variantId {
            variantName
            moq
            id
          }
          productId {
            id
            fullName
            images
          }
          locationId {
            id
            price
            b2bdiscount
            b2cdiscount
            extraCharge
            extraChargeType
            finalPrice
            gstRate
            gstType
            pincode
            priceType
            transportCharge
            transportChargeType
            unitType
          }
        }
      }
    }
  `;

  const CART_SUBCRIPTION = gql`
    subscription CartUpdated {
      cartUpdated {
        id
        cartProducts {
          variantId {
            variantName
            moq
            id
          }
          quantity
          productId {
            brand_name
            fullName
            id
            images
          }
          locationId {
            id
            price
            b2bdiscount
            b2cdiscount
            extraCharge
            extraChargeType
            finalPrice
            gstRate
            gstType
            pincode
            priceType
            transportCharge
            transportChargeType
            unitType
          }
        }
      }
    }
  `;

  const history = useHistory();

  const [cartData, setCartData] = useState(null);

  const { data, refetch, error, loading } = useQuery(GET_CART_DETAILS, {
    onCompleted() {
      setCartData(data.cart);
    },
    onError() {
      if (error?.message === 'Authorization header is missing' || error?.message === 'jwt expired') {
        console.error('GET_CART_DETAIL', error);
      } else {
        toast.error(error.message || 'Something went wrong!');
        console.error('GET_CART_DETAIL', error);
      }
    },
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  useSubscription(CART_SUBCRIPTION, {
    onData: (subscriptionData) => {
      const updatedCartData = subscriptionData?.data?.data?.cartUpdated;
      setCartData(updatedCartData);
    },
    onError: (err) => {
      console.error('Subscription Error:', err);
      toast.error(err.message || 'Something went wrong!');
    },
  });

  return { loading, cartData, error };
}

export default Cartitems;
