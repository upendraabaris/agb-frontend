import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useQuery, gql } from '@apollo/client';
import DropdownData from './DropdownData';

const GET_FINAL_PRICE = gql`
  query GetFinalPrice($productAttributeId: ID!) {
    getFinalPrice(productAttributeId: $productAttributeId) {
      id
      title
    }
  }
`;
function FinalPriceTypeData() {
  const attributeId = DropdownData();

  //   if (attributeId == null) {
  //     return <> </>;
  //   }

  const [finalPriceData, setfinalPriceData] = useState([]);

  const { data, error } = useQuery(GET_FINAL_PRICE, {
    variables: { productAttributeId: attributeId },
    onCompleted: () => {
      setfinalPriceData(data.getFinalPrice);
    },
    onError: () => {
      toast.error(error.message || 'Something went wrong!'); 
    },
    skip: attributeId == null, // Skip the query if attributeId is null
  });

  return finalPriceData;
}

export default FinalPriceTypeData;
