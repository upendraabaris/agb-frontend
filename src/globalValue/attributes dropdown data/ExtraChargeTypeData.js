import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useQuery, gql } from '@apollo/client';
import DropdownData from './DropdownData';

function ExtraChargeTypeData() {
  const GET_EXTRA_CHARGES = gql`
    query GetExtraCharge($productAttributeId: ID!) {
      getExtraCharge(productAttributeId: $productAttributeId) {
        id
        title
      }
    }
  `;

  const attributeId = DropdownData();

  //   if (attributeId == null) {
  //     return <> </>;
  //   }

  const [extraChargeData, setExtraChargeData] = useState([]);

  const { data, error } = useQuery(GET_EXTRA_CHARGES, {
    variables: { productAttributeId: attributeId },
    onCompleted: () => {
      setExtraChargeData(data.getExtraCharge);
    },
    onError: () => {
      toast.error(error.message || 'Something went wrong!'); 
    },
    skip: attributeId == null, // Skip the query if attributeId is null
  });

  return extraChargeData;
}

export default ExtraChargeTypeData;
