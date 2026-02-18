import { gql, useMutation } from '@apollo/client';
import React, { useState, useEffect} from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap'
import { toast } from 'react-toastify';

function AddToCartSingle({productID, variantID, locationID, moq}) {
  const [qty, setQuantity] = useState(moq);

  const tempArray = [];
   // eslint-disable-next-line
  for(var i = 1;  i < 100; i++) {
     tempArray.push(moq*i);
  }
    
  const ADD_TO_CART = gql`
    mutation AddToCart($variantId: ID!, $productId: ID!, $quantity: Int!) {
      addToCart(variantId: $variantId, productId: $productId, quantity: $quantity) {
        cartProducts {
          productId {
            fullName
          }
        }
      }
    }
  `;

  const [addToCart, {loading, error, data}] = useMutation(ADD_TO_CART, {
    onCompleted: () => {
      toast.success('Product added successfully!');
    }, 
    onError: (err) => {
      if (err.message === 'Authorization header is missing') {
        toast('Please Login to add item');
      } else {
        toast.error(err.message || 'Something went wrong!');
      }     
    },
  }
  );

  function AddToCartHandler(){
    if(variantID && productID && qty) 
    { 
      addToCart({
      variables: {  
        variantId: variantID,
        productId: productID,
        quantity: parseInt(qty, 10),
      }
    });
    } else
    {
      toast.info('Please select Quantity of your Product', { position: 'top-center' });
    }
   
  }

  return(
    <Row>
      <Col sm="4" className="mx-1 mb-1">
        <Form.Label>Quantity</Form.Label>
        <Form.Select name="quantity" onChange={(e) => setQuantity(e.target.value)} >
          <option hidden>Select Quantity</option>
            {tempArray.map((quan) =>
              <option key={quan} value={quan}>{quan}</option>)
            }      
        </Form.Select>
      </Col>
      <Col sm="7"  className="mx-1 mb-1 mt-sm-4 pt-sm-1">
      <Button onClick={() => AddToCartHandler()}>Add to Cart</Button>
      </Col>
    </Row>
  );
}

export default AddToCartSingle;