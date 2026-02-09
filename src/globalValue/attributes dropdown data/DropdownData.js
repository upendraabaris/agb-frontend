import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useQuery, gql, useLazyQuery } from '@apollo/client';

function DropdownData() {
  const [attributeId, setAttributeId] = useState(null);

  const GET_ALL_PRODUCT_ATTRIBUTE = gql`
    query GetAllProductAttributes {
      getAllProductAttributes {
        id
      }
    }
  `;

  const { data } = useQuery(GET_ALL_PRODUCT_ATTRIBUTE, {
    onCompleted: () => {
      if (data.getAllProductAttributes.length > 0) {
        setAttributeId(data.getAllProductAttributes[0].id);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Something went wrong!'); 
    },
  });

  if (attributeId) {
    return attributeId;
  }

  return null;
}

export default DropdownData;
