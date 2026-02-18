import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useQuery, gql } from '@apollo/client';
import DropdownData from './DropdownData';

const GET_PRICE_TYPE = gql`
  query GetPriceType($productAttributeId: ID!) {
    getPriceType(productAttributeId: $productAttributeId) {
      id
      symbol
      title
    }
  }
`;

function PriceTypeData() {
  const attributeId = DropdownData();

  //   if (attributeId == null) {
  //     return <> </>;
  //   }

  const [priceData, setPriceData] = useState([]);

  const { data, error } = useQuery(GET_PRICE_TYPE, {
    variables: { productAttributeId: attributeId },
    onCompleted: () => {
      setPriceData(data.getPriceType);
    },
    onError: () => {
      toast.error(error.message || 'Something went wrong!'); 
    },
    skip: attributeId == null, // Skip the query if attributeId is null
  });

  return priceData;
}

export default PriceTypeData;
