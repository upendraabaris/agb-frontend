import React, { useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import SeriesDetail from './SeriesDetail';
import SingleDetail from './SingleDetail';
import TMTDetail from './TMTDetail';
import SuperSellerDetail from './SuperSellerDetail';

const GETINDIVIDUALPRODUCT = gql`
  query GetProduct($name: String!) {
    getProduct(name: $name) {
      id
      variant {
        id
        location {
          id
          pincode
          unitType
          priceType
          price
          gstType
          gstRate
          extraChargeType
          extraCharge
          transportChargeType
          transportCharge
          b2cdiscount
          b2bdiscount
          finalPrice
          mainStock
          displayStock
          sellerId {
            companyName
            mobileNo
            companyDescription
            id
            overallrating
          }
        }
        variantName
        active
        hsn
        silent_features
        moq
        allPincode
        minimunQty
      }
      faq {
        id
        question
        answer
      }
      brand_name
      previewName
      fullName
      thumbnail
      sku
      returnPolicy
      shippingPolicy
      cancellationPolicy
      description
      giftOffer
      sellerNotes
      policy
      identifier
      video
      youtubeLink
      catalogue
      approve
      active
      reject
      rejectReason
      images
      categories
      listingComm
      listingCommType
      fixedComm
      fixedCommType
      shippingComm
      shippingCommType
      productComm
      productCommType
    }
  }
`;
const GETSERIESPRODUCT = gql`
  query GetSeriesProducts($name: String!) {
    getSeriesProducts(name: $name) {
      id
      seriesType
      seriesvariant {
        id
        serieslocation {
          id
          pincode
          unitType
          priceType
          price
          gstType
          gstRate
          extraChargeType
          extraCharge
          transportChargeType
          transportCharge
          finalPrice
          b2cdiscount
          b2bdiscount
          mainStock
          displayStock
          sellerId {
            companyDescription
            companyName
            email
            mobileNo
            id
          }
        }
        variantName
        active
        allPincode
        hsn
        silent_features
        moq
      }
      faq {
        question
        answer
      }
      brand_name
      previewName
      fullName
      identifier
      thumbnail
      sku
      active
      returnPolicy
      shippingPolicy
      cancellationPolicy
      description
      giftOffer
      sellerNotes
      policy
      video
      youtubeLink
      catalogue
      images
      categories
      listingComm
      listingCommType
      fixedComm
      fixedCommType
      shippingComm
      shippingCommType
      productComm
      productCommType
      table
    }
  }
`;
const GETTMTPRODUCT = gql`
  query GetTMTSeriesProductByName($name: String) {
    getTMTSeriesProductByName(name: $name) {
      id
      seriesType
      priceUpdateDate
      tmtseriesvariant {
        id
        allPincode
        tmtserieslocation {
          id
          pincode
          unitType
          priceType
          price
          gstType
          gstRate
          extraChargeType
          extraCharge
          transportChargeType
          transportCharge
          finalPrice
          b2cdiscount
          b2bdiscount
          sectionDiff
          mainStock
          displayStock
          sellerId {
            companyDescription
            companyName
            mobileNo
            id
          }
        }
        variantName
        active
        hsn
        silent_features
        moq
      }
      faq {
        question
        answer
      }
      brand_name
      previewName
      fullName
      thumbnail
      sku
      section
      returnPolicy
      shippingPolicy
      cancellationPolicy
      description
      giftOffer
      sellerNotes
      video
      youtubeLink
      brandCompareCategory
      catalogue
      images
      categories
      listingCommType
      fixedComm
      fixedCommType
      shippingComm
      shippingCommType
      productComm
      productCommType
    }
  }
`;
const GETSUPERSLLERPRODUCT = gql`
  query GetSuperSellerProduct($name: String) {
    getSuperSellerProduct(name: $name) {
      id
      superSellerId
      seriesType
      silent_features
      supervariant {
        id
        variantName
        superlocation {
          id
          pincode
          mainStock
          displayStock
          sellerarray {
            sellerId {
              companyName
              id
              sellerMasking
              overallrating
            }
            pincode
            status
          }

          allPincode
          status
          unitType
          finalPrice
          priceType
          price
          gstRate
          extraChargeType
          extraCharge
          transportChargeType
          transportCharge
          b2cdiscount
          b2bdiscount
          state
          sellerId {
            id
            companyName
            gstin
            companyDescription
          }
        }
        status
      }

      brand_name
      approve
      previewName
      fullName
      identifier
      thumbnail
      sku
      active
      reject
      rejectReason
      returnPolicy
      shippingPolicy
      cancellationPolicy
      description
      giftOffer
      sellerNotes
      video
      youtubeLink
      catalogue
      images
      categories
      priceUpdateDate
      faq {
        question
        answer
      }
    }
  }
`;

function Detail() {
  const params = useParams();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);

  const [getProduct, { data }] = useLazyQuery(GETINDIVIDUALPRODUCT, {
    variables: { name: params.identifier.replace(/_/g, ' ') },
  });

  const [getSeriesProductByName, { data: dataSeries }] = useLazyQuery(GETSERIESPRODUCT, {
    variables: { name: params.identifier.replace(/_/g, ' ') },
  });

  const [getTMTProductByName, { data: dataTMT }] = useLazyQuery(GETTMTPRODUCT, {
    variables: { name: params.identifier.replace(/_/g, ' ') },
  });

  const [getSuperSellerProductByName, { data: dataSuperSeller }] = useLazyQuery(GETSUPERSLLERPRODUCT, {
    variables: { name: params.identifier.replace(/_/g, ' ') },
  });

  useEffect(() => {
    getProduct();
    getSeriesProductByName();
    getTMTProductByName();
    getSuperSellerProductByName();
    // eslint-disable-next-line
  }, [params]);

  const displayMessage = () => {
    if (dataSeries && dataSeries.getSeriesProducts) {
      return <SeriesDetail product={dataSeries.getSeriesProducts} />;
    }
    if (data && data.getProduct) {
      return <SingleDetail product={data.getProduct} />;
    }
    if (dataTMT && dataTMT.getTMTSeriesProductByName) {
      return <TMTDetail product={dataTMT.getTMTSeriesProductByName} />;
    }
    if (dataSuperSeller && dataSuperSeller.getSuperSellerProduct) {
      return <SuperSellerDetail product={dataSuperSeller.getSuperSellerProduct} />; // Display SuperSellerProduct
    }
    return <div />;
  };

  return (
    <>
      <div>{displayMessage()}</div>
    </>
  );
}

export default Detail;
