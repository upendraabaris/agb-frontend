import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLazyQuery, gql, useQuery } from '@apollo/client';
import DOMPurify from 'dompurify';
import { Tooltip } from 'react-bootstrap';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { useGlobleContext } from 'context/styleColor/ColorContext';
// eslint-disable-next-line import/no-extraneous-dependencies
import './style.css';

const GET_ADS = gql`
  query GetAds($key: String!) {
    getAds(key: $key) {
      key
      images
      url
      active
    }
  }
`;
const GET_SITE_CONTENT = gql`
  query GetSiteContent($key: String!) {
    getSiteContent(key: $key) {
      content
      key
    }
  }
`;
const GET_ALL_PRODUCT_CLASS = gql`
  query GetAllProductClass {
    getAllProductClass {
      productClassName
      productClassDescription
      code
      listingCommission
      listingType
      productCommission
      productType
      fixedCommission
      fixedType
      shippingCommission
      shippingType
      specialStatus
    }
  }
`;

function TradeAssociate({ history }) {
  const dispatch = useDispatch();
  const { dataStoreFeatures1 } = useGlobleContext();
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);
  const renderTooltip = (props, message) => (
    <Tooltip id="button-tooltip" {...props} className="bg-dark">
      {message}
    </Tooltip>
  );
  const [getContent, { data: dataSiteContent }] = useLazyQuery(GET_SITE_CONTENT);
  useEffect(() => {
    getContent({
      variables: {
        key: 'tradeassociatedes',
      },
    });
  }, [dataSiteContent, getContent]);

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  const { data: productClassData, loading: productClassLoading, error: productClassError } = useQuery(GET_ALL_PRODUCT_CLASS);

  const [calc, setCalc] = useState({ classCode: '', price: 0, qty: 1 });
  const [feeBreakup, setFeeBreakup] = useState(null);

  // Watch and calculate when any input changes
  useEffect(() => {
    if (!productClassData?.getAllProductClass || !calc.classCode) {
      setFeeBreakup(null);
      return;
    }

    const selectedClass = productClassData.getAllProductClass.find((cls) => cls.code.toLowerCase() === calc.classCode.toLowerCase());

    if (!selectedClass) {
      setFeeBreakup(null);
      return;
    }

    const saleCommission = (calc.price * calc.qty * selectedClass.productCommission) / 100;
    const listingFee = selectedClass.listingCommission * calc.qty;
    const fixedFee = selectedClass.fixedCommission;
    const shippingFee = ((calc.price * selectedClass.shippingCommission) / 100) * calc.qty;

    const total = saleCommission + listingFee + fixedFee + shippingFee;
    const receivable = calc.price * calc.qty - total;

    setFeeBreakup({
      saleCommission,
      listingFee,
      fixedFee,
      shippingFee,
      total,
      receivable,
    });
  }, [calc, productClassData]);

  return (
    <div className="bg-white">
      <h1 className="mb-1 p-2 mark text-center rounded">
        <span className="mb-1 fw-bold text-dark">Fees and Pricing for Sellers Associate</span>
      </h1>
      <div className="container">
        <div className="tab-container-responsive border rounded p-2 pb-4">
          <div>
            {productClassLoading && <p>Loading product classes...</p>}
            {productClassError && <p>Error loading product classes</p>}
            {productClassData && (
              <div className="table-responsive rounded shadow-sm">
                <table className="table table-hover table-bordered align-middle text-center mb-0">
                  <thead className="table-dark ">
                    <tr>
                      <th scope="col" className="text-nowrap text-start">
                        Class Code
                      </th>
                      <th scope="col" className="text-nowrap text-start">
                        Class Name
                      </th>
                      <th scope="col" className="text-nowrap">
                        Sale Commission Fee
                        <br />
                        <small className="text-muted">(Order amount)</small>
                      </th>
                      <th scope="col" className="text-nowrap">
                        Listing Fee
                        <br />
                        <small className="text-muted">(Qty Based)</small>
                      </th>
                      <th scope="col" className="text-nowrap">
                        Fixed Closing Fee
                        <br />
                        <small className="text-muted">(Per Order)</small>
                      </th>
                      <th scope="col" className="text-nowrap">
                        Shipping Fee
                        <br />
                        <small className="text-muted">(Qty Based)</small>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...productClassData.getAllProductClass]
                      .filter((cls) => cls.specialStatus !== true)
                      .sort((a, b) => a.productClassName.localeCompare(b.productClassName))
                      .map((cls, index) => (
                        <tr key={index}>
                          <td className="text-nowrap text-start">{cls.code}</td>
                          <td className="text-start fw-bold">{cls.productClassName}</td>
                          <td className="text-nowrap">{cls.productCommission}%</td>
                          <td className="text-nowrap">₹{cls.listingCommission}</td>
                          <td className="text-nowrap">₹{cls.fixedCommission}</td>
                          <td className="text-nowrap">{cls.shippingCommission}%</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <div className="my-4 border p-3 rounded shadow-sm">
                  <h5 className="fw-bold mb-3">Commission Calculator</h5>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Class Code</label>
                      <input type="text" className="form-control" value={calc.classCode} onChange={(e) => setCalc({ ...calc, classCode: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Product Selling Price (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={calc.price}
                        onChange={(e) => setCalc({ ...calc, price: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        value={calc.qty}
                        onChange={(e) => setCalc({ ...calc, qty: parseInt(e.target.value, 10) || 1 })}
                      />
                    </div>
                  </div>

                  {feeBreakup && (
                    <div className="mt-4">
                      <h6 className="fw-bold">Fee Breakdown:</h6>
                      <ul>
                        <li>Sale Commission Fee: ₹{feeBreakup.saleCommission.toFixed(2)}</li>
                        <li>Listing Fee: ₹{feeBreakup.listingFee.toFixed(2)}</li>
                        <li>Fixed Closing Fee: ₹{feeBreakup.fixedFee.toFixed(2)}</li>
                        <li>Shipping Fee: ₹{feeBreakup.shippingFee.toFixed(2)}</li>
                        <li className="fw-bold text-danger">Total Deductions: ₹{feeBreakup.total.toFixed(2)}</li>
                        <li className="fw-bold text-success">You Will Get: ₹{feeBreakup.receivable.toFixed(2)}</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* <div>
            {dataSiteContent && (
              <div className="p-1" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dataSiteContent.getSiteContent.content.replace(/<br>/g, '')) }} />
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
}
export default TradeAssociate;
