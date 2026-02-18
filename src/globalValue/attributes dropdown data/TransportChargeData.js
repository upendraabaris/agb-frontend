import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useQuery, gql } from '@apollo/client';
import DropdownData from './DropdownData';

const GET_TRANSPORT_CHARGES = gql`
  query GetTransportCharge($productAttributeId: ID!) {
    getTransportCharge(productAttributeId: $productAttributeId) {
      id
      title
    }
  }
`;

function TransportChargeData() {
  const attributeId = DropdownData();

  //   if (attributeId == null) {
  //     return <> </>;
  //   }

  const [transportChargeData, setTransportChargeData] = useState([]);

  const { data, error } = useQuery(GET_TRANSPORT_CHARGES, {
    variables: { productAttributeId: attributeId },
    onCompleted: () => {
      setTransportChargeData(data.getTransportCharge);
    },
    onError: () => {
      toast.error(error.message || 'Something went wrong!'); 
    },
    skip: attributeId == null, // Skip the query if attributeId is null
  });

  return transportChargeData;
}

export default TransportChargeData;
