import { useState } from 'react';
import { toast } from 'react-toastify';
import { useQuery, gql } from '@apollo/client';
import DropdownData from './DropdownData';

const GET_UNIT_TYPE = gql`
  query GetUnitType($productAttributeId: ID!) {
    getUnitType(productAttributeId: $productAttributeId) {
      id
      title
      symbol
    }
  }
`;

function UnitTypeData() {
  const attributeId = DropdownData();

  //   if (attributeId == null) {
  //     return <> </>;
  //   }

  const [unitData, setUnitData] = useState([]);

  const { data, error } = useQuery(GET_UNIT_TYPE, {
    variables: { productAttributeId: attributeId },
    onCompleted: () => {
      setUnitData(data.getUnitType);
    },
    onError: () => {
      toast.error(error.message || 'Something went wrong!'); 
    },
    skip: attributeId == null, // Skip the query if attributeId is null
  });

  return unitData;
}

export default UnitTypeData;
