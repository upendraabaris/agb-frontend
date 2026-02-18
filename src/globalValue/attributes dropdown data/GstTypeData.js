import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useQuery, gql } from '@apollo/client';
import DropdownData from './DropdownData';

const GET_GST = gql`
  query GetGst($productAttributeId: ID!) {
    getGst(productAttributeId: $productAttributeId) {
      gstRate
      title
      id
    }
  }
`;

function GstTypeData() {
  const attributeId = DropdownData();

  //   if (attributeId == null) {
  //     return <> </>;
  //   }

  const [gstData, setGstData] = useState([]);

  const { data, error } = useQuery(GET_GST, {
    variables: { productAttributeId: attributeId },
    onCompleted: () => {
      setGstData(data.getGst);
    },
    onError: () => {
      toast.error(error.message || 'Something went wrong!'); 
    },
    skip: attributeId == null, // Skip the query if attributeId is null
  });

  return gstData;
}

export default GstTypeData;
