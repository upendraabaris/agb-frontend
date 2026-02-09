import { gql , useMutation, useLazyQuery} from '@apollo/client';
import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

function Trending() {
  const [productType, setProductType] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [productId, setProductId] = useState("");
  const array = [ 0, 1, 2, 3, 4, 5];

  const UPDATE_TRENDING_SECTION = gql`
    mutation UpdateProductHomeOrder($displaySection: String, $displayOrder: Int, $productType: String, $productId: String) {
      updateProductHomeOrder(displaySection: $displaySection, displayOrder: $displayOrder, productType: $productType, productId: $productId) {
        displaySection
        displayOrder
        productType
        productId
      }
    } 
  `;

  const [updateTrendingSection, { loading, error, data, refetch }] = useMutation(UPDATE_TRENDING_SECTION, {
    onCompleted: () => { 
      toast(`Discover List updated successfully!`);
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const handleTrendingSection = async () => {
    await updateTrendingSection({
      variables : {
        displaySection: "tranding",
        displayOrder,
        productType,
        productId,
      },
    })
  }

  const GET_ALL_PRODUCT = gql`
    query HomePageSearch {
      homePageSearch {
        id
        fullName
        approve
        active
      }
    }
  `;

  const [getProduct, { loading: loadingProd, error: errorProd, data: dataProd, refetch: refetchProd }] = useLazyQuery(GET_ALL_PRODUCT);

  useEffect(() => {
    getProduct();
  }, []);

  return (<>
    <h1 className='text-center'>Trending Section</h1>

    <Form.Label className="fw-bold my-2">Display Order</Form.Label>
    <Form.Select id="EnquirySelect" onChange={(event) => setDisplayOrder(parseInt(event.target.value, 10))} aria-label="Default select example">
      <option>Select Order Number</option>
      {array && array.map((prod) => <option key={prod} value={prod}>{prod + 1}</option>)}
    </Form.Select>

    <Form.Label className="fw-bold my-2">Product Type</Form.Label>
    <Form.Select id="EnquirySelect" onChange={(event) => setProductType(event.target.value)} aria-label="Default select example">
      <option>Select Product Type</option>
      <option value="single">Single</option>
      <option value="custom series">Custom Series</option>
      <option value="fix series">Fixed Series</option>
    </Form.Select>

    <Form.Label className="fw-bold my-2">Product Name</Form.Label>
    <Form.Select id="EnquirySelect" onChange={(event) => setProductId(event.target.value)} aria-label="Default select example">
      <option>Select Product Name</option>
      {dataProd && dataProd?.homePageSearch?.map((prod) => prod?.approve && prod?.active && <option key={prod.id} value={prod.id}>{prod.fullName}</option>)}
    </Form.Select>

    <Button className='my-2' onClick={() => handleTrendingSection()}>Submit</Button>
  </>);
}

export default Trending;