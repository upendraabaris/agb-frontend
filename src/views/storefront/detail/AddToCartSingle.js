import { gql, useMutation, useLazyQuery } from '@apollo/client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Button, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import { useHistory } from 'react-router-dom/cjs/react-router-dom';
import { toast } from 'react-toastify';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import Cartitems from 'globalValue/CartItems/Cartitems';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import ItemCounter from './Quantity/ItemCounter';

const ADD_TO_CART = gql`
  mutation AddToCart($cartinput: [CartInput]) {
    addToCart(cartinput: $cartinput) {
      id
    }
  }
`;

const CHECK_WISHLIST_DUPLICACY = gql`
  query Wishlist {
    wishlist {
      id
      userId {
        id
      }
      updatedAt
      createdAt
      wishlistProducts {
        productId {
          brand_name
          fullName
          id
          identifier
          images
          thumbnail
        }
      }
    }
  }
`;

const CREATE_WISHLIST = gql`
  mutation Mutation($productId: ID!) {
    createWishlist(productId: $productId) {
      userId {
        id
      }
      wishlistProducts {
        productId {
          brand_name
        }
      }
    }
  }
`;

function AddToCartSingle({ productID, variantID, locationID, moq, available, minimumQty, displayStock, mainStock, unitType }) {
  const { dataStoreFeatures1 } = useGlobleContext();
  const [stock, setStock] = useState(null);
  const history = useHistory();

  useEffect(() => {
    if (displayStock <= mainStock) {
      setStock(displayStock);
    } else {
      setStock(mainStock);
    }
  }, [displayStock, mainStock]);
  const [qty, setQuantity] = useState(0);
  const [formvalue, setformvalue] = useState(0);

  useEffect(() => {
    setQuantity(formvalue);
  }, [formvalue]);

  const { refetch } = Cartitems();
  const [click, setClick] = useState(false);
  const [wish, setWish] = useState(false);

  const [checkDuplicacy, resultDuplicacy] = useLazyQuery(CHECK_WISHLIST_DUPLICACY, {
    onCompleted: () => {
      // console.log('resultDup', resultDup);
      // console.log(resultDuplicacy);
    },
    onError(error) {
      // toast.error(error.message || 'Something went wrong!');
      console.error('GET_ITEM_DETAIL', error);
    },
  });

  useEffect(() => {
    checkDuplicacy();
  }, [checkDuplicacy]);

  let idea = '';

  if (productID && resultDuplicacy.data) {
    if (resultDuplicacy.data.wishlist && resultDuplicacy.data.wishlist.userId.id) {
      idea = resultDuplicacy.data.wishlist.wishlistProducts.some((c) => c.productId.id === productID);
    } else {
      console.log('');
    }
  } else {
    // console.log('Product and resultDuplicacy.data is not yet received');
  }

  useEffect(() => {
    setWish(idea);
  }, [idea]);

  const [createWishlist] = useMutation(CREATE_WISHLIST, {
    onCompleted: () => {
      toast.success('Product have been added to wishlist');
    },
    onError: (err) => {
      toast('Already added in Wishlist' || 'Something went wrong!');
    },
  });

  const changeButton = () => {
    return (
      <Button className="p-0 ps-1 px-1 bg-transparent mt-2">
        <span>
          <CsLineIcons icon="heart" className="text-primary" style={{ color: '#007bff', backgroundColor: '#007bff' }} />
        </span>
      </Button>
    );
  };

  const handleWishlist = async (event) => {
    await createWishlist({
      variables: {
        productId: event,
      },
    });
    await setClick(true);
    changeButton();
  };

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

  const [addToCart, { loading, error, data }] = useMutation(ADD_TO_CART, {
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
        history.push('/login', {
          warningMessage: 'You must login before adding any item to the cart',
        });
      } else {
        toast.error(err.message || 'Something went wrong!');
      }
    },
  });

  const [errors, seterrors] = useState('');
  async function AddToCartHandler() {
    if (available === 'Available') {
      if (variantID && productID && qty && locationID) {
        if (moq * qty >= minimumQty) {
          if (moq * qty <= stock) {
            seterrors('');
            await addToCart({
              variables: {
                cartinput: [
                  {
                    productId: productID,
                    variantId: variantID,
                    locationId: locationID,
                    quantity: parseInt(moq * qty, 10),
                  },
                ],
              },
            });
          } else {
            seterrors(`Order quantity must be less than ${Math.floor(stock / moq)}`);
          }
        } else {
          seterrors(`Minimum quantity of order must be ${minimumQty}`);
        }
      } else {
        seterrors(`Please select Quantity of your Product`);
      }
    } else {
      seterrors(`Please enter your delivery pincode, then proceed to Add to Cart.`);
    }
  }

  return (
    <Row>
      <style>
        {`.bg_color {
          background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
          color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
        }`}
        {`.font_color {
          color: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
        }`}
        {`.border_color {
          border: 1px solid ${dataStoreFeatures1?.getStoreFeature?.bgColor};
        }
        .border_color:hover {
          background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
          color: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
        }
        `}
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
        <Button onClick={() => AddToCartHandler()} className="btn_color">
          Add to Cart
          {moq > 1 && <span className="ms-1">{`${moq * qty} ${unitType}`}</span>}
        </Button>
        <br />
      </Col>
      <Col className="col-auto mx-0 mb-1 px-0">
        {!wish && !click && (
          <Button className="p-0 ps-1 px-1 bg-transparent mt-2" onClick={() => handleWishlist(productID)}>
            <span>
              <CsLineIcons icon="heart" className="font_color" />
            </span>
          </Button>
        )}
        {click && changeButton()}
        {/* {wish && (
          <Button variant="primary" className="btn-icon btn-icon-end mx-1 mb-1">
            <span>
              Wishlist <CsLineIcons icon="check" />
            </span>
          </Button>
        )} */}
      </Col>
      {errors && <p className="mx-0 my-1 py-0 px-0 text-danger">{errors}</p>}
    </Row>
  );
}

export default AddToCartSingle;
