import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { gql, useMutation } from '@apollo/client';
import { NavLink } from 'react-router-dom';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Cartitems from 'globalValue/CartItems/Cartitems';
import { toast } from 'react-toastify';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import AddToCartTMT from '../AddToCartTMT';

const ADD_TO_CART = gql`
  mutation AddToCart($cartinput: [CartInput]) {
    addToCart(cartinput: $cartinput) {
      id
    }
  }
`;

function Comaprebrand({ otherBrand, variantQuantities, name, product, pincode }) {
  const { dataStoreFeatures1 } = useGlobleContext();
  const { refetch } = Cartitems();
  const { fullName, brand_name: brandName, active, tmtseriesvariant, id } = otherBrand;
  const productID = id;
  const { isLogin, currentUser } = useSelector((state) => state.auth);
  const itemwithQty = variantQuantities.filter((item) => item.rateofvariant !== 0);
  const variantNameforComparison = tmtseriesvariant.filter(({ variantName }) => itemwithQty.some((item) => item.variantName === variantName));
  const commonValues = tmtseriesvariant
    .filter(({ variantName }) => itemwithQty.some((item) => item.variantName === variantName))
    .map((tmtseriesObj) => {
      const qtyObj = itemwithQty.find((item) => item.variantName === tmtseriesObj.variantName);
      return { ...tmtseriesObj, ...qtyObj };
    });
  const totalsum = commonValues.map(({ quantity, tmtserieslocation }) => {
    const preGstRate = ((tmtserieslocation[0].price + tmtserieslocation[0].extraCharge) / ((100 + tmtserieslocation[0].gstRate) / 100)).toFixed(2);
    const discount = currentUser?.role?.some((role) => role === 'b2b') ? tmtserieslocation[0].b2bdiscount : tmtserieslocation[0].b2cdiscount;
    const priceafterqty = quantity * tmtserieslocation[0].price + tmtserieslocation[0].extraCharge;
    const discountPrice = ((100 - discount) * priceafterqty) / 100;
    return discountPrice;
  });
  const [totalsum1, setTotalSum] = useState(0);
  useEffect(() => {
    const sum = totalsum.reduce((sum1, item) => {
      return sum1 + item;
    }, 0);
    setTotalSum(sum);
  }, [totalsum]);

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
  
  const [addToCart, { loading }] = useMutation(ADD_TO_CART, {
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
      } else {
        toast.error(err.message || 'Something went wrong!');
      }
    },
  });

  const AddToCartHandler = async () => {
    const newarray = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < commonValues.length; i++) {
      if (commonValues[i].quantity === 0) {
        toast.error(`The Quantity of item is Zero 0  for ${commonValues[i].variantName}`);
        // eslint-disable-next-line no-continue
        continue;
      } else if (commonValues[i].quantity > commonValues[i].tmtserieslocation.displayStock) {
        toast.warn(
          `Order Quantity should be less than ${commonValues[i].tmtserieslocation.displayStock / commonValues[i].moq} for ${commonValues[i].variantName}`
        );
        // eslint-disable-next-line no-continue
        continue;
      } else if (commonValues[i].availability !== 'Available') {
        toast.error(`Check Availability of Product by entering Pincode for ${commonValues[i].variantName}`);
      } else {
        newarray.push(commonValues[i]);
      }
    }

    const finalarray = newarray.map((item) => ({
      variantId: item.id,
      locationId: item.tmtserieslocation[0].id,
      productId: productID,
      quantity: item.quantity,
    }));

    if (finalarray.length > 0) {
      await addToCart({
        variables: {
          cartinput: finalarray,
        },
      });
    } else {
      toast.error('Add Quantity.');
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
      {active === true ? (
        <tr className="border">
          <td className="p-2 border">
            <div className="fw-bold mb-1">
              {brandName} {fullName}
            </div>
            <small className="text-muted">Seller: {tmtseriesvariant[0].tmtserieslocation[0].sellerId.companyName}</small>
          </td>
          <td className="border fw-bold">
            ₹ {totalsum1.toFixed(2)}
            <div className="text-primary">
              <a href={`/product/${otherBrand.identifier}`} target="_blank" rel="noopener noreferrer" className="ms-1 text-primary text-decoration-none">
                View Product
              </a>
            </div>
          </td>

          <td className="border">
            <Button size="sm" type="button" className="btn_color" onClick={() => AddToCartHandler()}>
              Add to Cart
            </Button>
          </td>
        </tr>
      ) : null}
    </>
  );
}

export default Comaprebrand;
