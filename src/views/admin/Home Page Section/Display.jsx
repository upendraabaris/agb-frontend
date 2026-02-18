import { gql , useMutation, useLazyQuery} from '@apollo/client';
import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

function Display() {
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
        displaySection: "disply",
        displayOrder,
        productType,
        productId,
      },
    })
  }

  const [dataProd, setDataProd] = useState([]);

  const GET_ALL_SINGLE_PRODUCT = gql`
    query GetAllProduct {
      getAllProduct {
        active
        approve
        fullName
        id
        identifier
        previewName
      }
    }
  `;

  const [getSingleProduct, {data : singleProd} ]= useLazyQuery(GET_ALL_SINGLE_PRODUCT);

  const GET_ALL_TMT_SERIES_PRODUCT = gql`
    query GetAllTMTSeriesProduct {
      getAllTMTSeriesProduct {
        active
        approve
        brand_name
        fullName
        id
        identifier
        previewName
      }
    }
  `;

  const [getTMTProduct, {data : TMTProd} ]= useLazyQuery(GET_ALL_TMT_SERIES_PRODUCT);

  const GET_ALL_SERIES_PRODUCT = gql`
    query GetAllSeriesProduct {
      getAllSeriesProduct {
        active
        brand_name
        previewName
        identifier
        id
        fullName
      }
    }
  `;

  const [getSeriesProduct, {data : SeriesProd} ]= useLazyQuery(GET_ALL_SERIES_PRODUCT);

  useEffect(() => {
    if(productType  === "single") {
      getSingleProduct();
    } else if(productType  === "fix series") {
      getTMTProduct();
    } else if(productType  === "custom series") {
      getSeriesProduct();
    }
  }, [productType]);

  useEffect(() => {
    if(singleProd  && productType  === "single"){
      setDataProd(singleProd?.getAllProduct);
    }
  }, [singleProd, productType]);

  useEffect(() => {
    if(TMTProd  && productType  === "fix series"){
      setDataProd(TMTProd?.getAllTMTSeriesProduct);
    }
  }, [TMTProd, productType]);

  useEffect(() => {
    if(SeriesProd  && productType  === "custom series"){
      setDataProd(SeriesProd?.getAllSeriesProduct);
    }
  }, [SeriesProd, productType]);

  return (<>
    <h1 className='text-center'>Display Section</h1>

    <Form.Label className="fw-bold my-2">Display Order</Form.Label>
    <Form.Select id="EnquirySelect" onChange={(event) => setDisplayOrder(parseInt(event.target.value, 10))} aria-label="Default select example">
      <option hidden >Select Order Number</option>
      {array && array.map((prod) => <option key={prod} value={prod}>{prod + 1}</option>)}
    </Form.Select>

    <Form.Label className="fw-bold my-2">Product Type</Form.Label>
    <Form.Select id="EnquirySelect" onChange={(event) => setProductType(event.target.value)} aria-label="Default select example">
      <option hidden>Select Product Type</option>
      <option value="single">Single</option>
      <option value="custom series">Custom Series</option>
      <option value="fix series">Fixed Series</option>
    </Form.Select>

    <Form.Label className="fw-bold my-2">Product Name</Form.Label>
    <Form.Select id="EnquirySelect" onChange={(event) => setProductId(event.target.value)} aria-label="Default select example">
      <option hidden>Select Product Name</option>
      {dataProd && dataProd?.map((prod) => prod?.approve && prod?.active && <option key={prod.id} value={prod.id}>{prod.fullName}</option>)}
    </Form.Select>
    <Button className='my-2' onClick={() => handleTrendingSection()}>Submit</Button>
  </>)
}

export default Display;