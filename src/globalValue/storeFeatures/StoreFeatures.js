import { useEffect, useState } from 'react';
import { gql, useQuery } from '@apollo/client';

function StoreFeatures() {
  const [storeFeaturess, setstoreFeaturess] = useState(null);
  const GET_STORE_FEATURE = gql`
    query GetStoreFeature {
      getStoreFeature {
        id
        storeName
        key
        solt
        pincode
        online
        dmt
        cod
        fixSeries
        customSeries
        storeBusinessName
        storeBusinessAddress
        storeBusinessCity
        storeBusinessState
        storeBusinessPanNo
        storeBusinessGstin
        storeBusinessCinNo
        comBillFormate
        sellerBillFormate
        ccKey
        ccSolt
      }
    }
  `;

  const { error, data } = useQuery(GET_STORE_FEATURE);

  useEffect(() => {
    if (data) {
      setstoreFeaturess(data.getStoreFeature);
    }
  }, [data]);

  if (error) {
    console.log('GET_STORE_FEATURE', error);
  }

  return storeFeaturess;
}

export default StoreFeatures;
