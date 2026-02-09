import { gql, useMutation } from '@apollo/client';
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom/cjs/react-router-dom';
import { useGlobleContext } from 'context/styleColor/ColorContext';

function QuotationTMT({ productID, variantQuantities, quotationData }) {
  const history = useHistory();
  // user is looged in as b2b or customer
  const { isLogin, currentUser } = useSelector((state) => state.auth);
  const roleCheck = currentUser?.role?.some((role) => role === 'seller');
  const { dataStoreFeatures1 } = useGlobleContext();
  // console.log(productID);
  // console.log(variantQuantities);
  // console.log(quotationData);
  // const [trial, setTrial] = useState([{
  //   productId: '',
  //   variantId: '',
  //   locationId: '',
  //   quantity: 0,
  // }]);

  // let arrayDemo = {
  //   productId: '',
  //   variantId: '',
  //   locationId: '',
  //   quantity: '',
  // }

  //   const arraydemonext = variantQuantities.map((item, index) =>  {
  //   setTrial((prevFormData) => ({
  //     ...prevFormData,
  //     productId: productID,
  //     variantId: item.variantID,
  //     locationId: item.locationId,
  //     quantity: parseInt(item.quantity, 10),
  //   }));
  //   return 0;
  // });

  // console.log("arraydemonext", arraydemonext);
  // console.log("trial", trial);

  // const arraydemonext = variantQuantities.map((item, index) =>  {
  //   productId: productID,
  //   variantId: item.variantID,
  //   locationId: item.locationId,
  //   quantity: parseInt(item.quantity, 10),
  // });

  // productId: productID,
  // variantId: item.variantID,
  // locationId: item.locationId,
  // quantity: parseInt(item.quantity, 10),

  const CREATE_QUOTATION = gql`
    mutation CreateQuatation($quatationProducts: [QuatationInput]) {
      createQuatation(quatationProducts: $quatationProducts) {
        id
      }
    }
  `;

  const [createQuotation, { data }] = useMutation(CREATE_QUOTATION, {
    onCompleted: () => {
      toast.success('Product added successfull for Quotation!');
      history.push(`/seller/quotation/detail?quatationID=${data?.createQuatation?.id}`);
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });

  // [
  //   {
  //     productId: productID,
  //     variantId: item.variantID,
  //     locationId: item.locationId,
  //     quantity: parseInt(item.quantity, 10),
  //   }
  // ]

  const [errors, setErrors] = useState('');

  const handleQuotation = () => {
    const quatationDatawithQty = quotationData.filter((variant) => variant.quantity !== 0);

    // console.log('quatationDatawithQty', quatationDatawithQty);

    if (quatationDatawithQty.length > 0) {
      setErrors('');
      createQuotation({
        variables: {
          quatationProducts: quatationDatawithQty,
        },
      });
    } else {
      setErrors('Enter Quantity before Make Quotation.');
      toast.error(`Enter Quantity before Make Quotation.`);
    }
  };
  return (
    <>
      {roleCheck && (
        <> <style>
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
          <Button className="float-end btn_color btn_widht" onClick={() => handleQuotation()}>Make Quotation</Button>
          {/* {errors && <span className="ms-2 text-danger">{errors}</span>} */}
        </>
      )}
    </>
  );
}

export default QuotationTMT;
