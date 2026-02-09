import { gql, useLazyQuery } from '@apollo/client';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const GET_STORE_FEATURES = gql`
    query GetStoreFeature {
      getStoreFeature {
        bgColor
        fontColor
        associate
        storeName
        sellerMasking
      }
    }
  `;
  // GET STORE FEATURES
  const [getStoreFeatures, { data: dataStoreFeatures1, loading }] = useLazyQuery(GET_STORE_FEATURES);

  useEffect(() => {
    getStoreFeatures();
  }, [loading, dataStoreFeatures1]);

  return <AppContext.Provider value={{ dataStoreFeatures1 }}>{children}</AppContext.Provider>;
};

export const useGlobleContext = () => {
  return useContext(AppContext);
};

export { AppProvider, AppContext };
