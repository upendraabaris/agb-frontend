import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { useLocation, withRouter } from 'react-router-dom';
import moment from 'moment';
import { gql, useLazyQuery } from '@apollo/client';
import { useReactToPrint } from 'react-to-print';
import StoreFeatures from 'globalValue/storeFeatures/StoreFeatures';
import TableRow from './TableRow';
import PaymentGatwayCharge from './PaymentGatwayCharge';

const GET_ORDER = gql`
  query GetOrder($getOrderId: ID!) {
    getOrder(id: $getOrderId) {
      id
      onlinePaymentChargePercentage
      dmtPaymentDiscountPercentage
      couponDiscountPercentage
      createdAt
      status
      totalAmount
      acutalTotalAmount
      freeDelivery
      couponDiscount
      couponName
      dmtPaymentDiscount
      onlinePaymentCharge
      shippingAddress {
        firstName
        lastName
        mobileNo
        addressLine1
        addressLine2
        city
        state
        postalCode
        country
        altrMobileNo
        businessName
        gstin
      }
      billingAddress {
        firstName
        lastName
        mobileNo
        addressLine1
        addressLine2
        city
        state
        postalCode
        country
        altrMobileNo
        businessName
        gstin
      }
      orderProducts {
        sellerId {
          companyName
          fullAddress
          address
          city
          state
          pincode
          pancardNo
          gstin
          gstinComposition
          mobileNo
        }
        quantity
        price
      }
    }
  }
`;

function ReactToPdf({ history }) {
  const componentPDF = useRef();
  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    documentTitle: 'Invoice',
  });
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const { data, billno, createdDate } = location.state || '';
  const orderID = queryParams.get('orderID');
  if (!data || !billno) {
    history.push('/');
  }
  const storeFeatures = StoreFeatures();
  const [invoiceData, setInvoiceData] = useState(null);
  const [GetOrder] = useLazyQuery(GET_ORDER, {
    variables: {
      getOrderId: orderID,
    },
    onCompleted: (res) => {
      setInvoiceData(res.getOrder);
    },
    onError: (error) => {
      console.error('GET_ORDER', error);
    },
  });
  useEffect(() => {
    GetOrder();
  }, []);
  const [sellerAddress, setSellerAddress] = useState(null);
  const [couponDiscount1, setCouponDiscount] = useState(0);
  useEffect(() => {
    if (invoiceData?.orderProducts?.length > 0) {
      const sellerAdd = invoiceData.orderProducts[0].sellerId;
      setSellerAddress(() => ({ ...sellerAdd, ...JSON.parse(sellerAdd?.address) }));
    }
  }, [invoiceData]);
  const gstCheck = useCallback(() => {
    if (invoiceData && sellerAddress) {
      const { billingAddress } = invoiceData;
      if (billingAddress.state === sellerAddress.state) {
        return true;
      }
      return false;
    }
    return null;
  }, [invoiceData, sellerAddress]);

  const handleFinalAmount = useCallback(() => {
    let finalNetAmount = 0;
    let finalsgstAmount = 0;
    let finalcgstAmount = 0;
    let finaligstAmount = 0;
    let finalTotalAmount = 0;
    let finalTotalAmountWithoutTransportCharge = 0;
    data?.products.forEach((item) => {
      const withoutDiscount = (item.iprice * (100 - item.idiscount)) / 100;
      const withoutGstRate = withoutDiscount / ((100 + item.igst) / 100);
      const netAmount = withoutGstRate * item.quantity;
      const extraChargewithoutDiscount = (item.iextraCharge * (100 - item.idiscount)) / 100;
      const extraChargewithoutGstRate = extraChargewithoutDiscount / 1.18;
      const extraChargeNetAmount = extraChargewithoutGstRate * item.quantity;
      const transportChargewithoutGstRate = item.itransportCharge / 1.18;
      const transportChargeNetAmount = transportChargewithoutGstRate * item.quantity;
      finalNetAmount += netAmount + extraChargeNetAmount + transportChargeNetAmount;
      const sgstRate = gstCheck() ? item.igst / 2 : 0;
      const sgstRateForextraCharge = gstCheck() ? 9 : 0;
      const sgstRateFortransportCharge = gstCheck() ? 9 : 0;
      const sgstAmount = (netAmount * sgstRate) / 100;
      const extraChargesgstAmount = (extraChargeNetAmount * sgstRateForextraCharge) / 100;
      const transportChargesgstAmount = (transportChargeNetAmount * sgstRateFortransportCharge) / 100;
      finalsgstAmount += sgstAmount + extraChargesgstAmount + transportChargesgstAmount;
      const cgstRate = gstCheck() ? item.igst / 2 : 0;
      const cgstRateForextraCharge = gstCheck() ? 9 : 0;
      const cgstRateFortransportCharge = gstCheck() ? 9 : 0;
      const cgstAmount = (netAmount * cgstRate) / 100;
      const extraChargecgstAmount = (extraChargeNetAmount * cgstRateForextraCharge) / 100;
      const transportChargecgstAmount = (transportChargeNetAmount * cgstRateFortransportCharge) / 100;
      finalcgstAmount += cgstAmount + extraChargecgstAmount + transportChargecgstAmount;
      const igstRate = gstCheck() ? 0 : item.igst;
      const igstRateForextraCharge = gstCheck() ? 0 : 18;
      const igstRateFortransportCharge = gstCheck() ? 0 : 18;
      const igstAmount = (netAmount * igstRate) / 100;
      const extraChargeigstAmount = (extraChargeNetAmount * igstRateForextraCharge) / 100;
      const transportChargeigstAmount = (transportChargeNetAmount * igstRateFortransportCharge) / 100;
      finaligstAmount += igstAmount + extraChargeigstAmount + transportChargeigstAmount;
      const totalAmount = netAmount + sgstAmount + cgstAmount + igstAmount;
      const extraChargetotalAmount = extraChargeNetAmount + extraChargesgstAmount + extraChargecgstAmount + extraChargeigstAmount;
      const transportChargetotalAmount = transportChargeNetAmount + transportChargesgstAmount + transportChargecgstAmount + transportChargeigstAmount;
      finalTotalAmount += totalAmount + extraChargetotalAmount + transportChargetotalAmount;
      finalTotalAmountWithoutTransportCharge += totalAmount + extraChargetotalAmount;
    });

    return {
      finalNetAmount,
      finalsgstAmount,
      finalcgstAmount,
      finaligstAmount,
      finalTotalAmount,
      finalTotalAmountWithoutTransportCharge,
    };
  }, [data?.products, gstCheck]);

  useEffect(() => {
    if (invoiceData) {
      const { finalTotalAmountWithoutTransportCharge } = handleFinalAmount();
      const coupon = finalTotalAmountWithoutTransportCharge * (invoiceData?.couponDiscountPercentage / 100);
      setCouponDiscount(coupon);
    }
  }, [handleFinalAmount, invoiceData]);

  const handleFinalAmountWithGatwayCharges = () => {
    let { finalNetAmount, finalsgstAmount, finalcgstAmount, finaligstAmount, finalTotalAmount } = handleFinalAmount();
    const gatwaycharge = (finalTotalAmount - couponDiscount1) * (0 / 100);
    const netAmountBygatway = gatwaycharge / 1.18;
    finalNetAmount += netAmountBygatway;
    const sgstRateBygatway = gstCheck() ? 9 : 0;
    const sgstAmountBygatway = (netAmountBygatway * sgstRateBygatway) / 100;
    finalsgstAmount += sgstAmountBygatway;
    const cgstRateBygatway = gstCheck() ? 9 : 0;
    const cgstAmountBygatway = (netAmountBygatway * cgstRateBygatway) / 100;
    finalcgstAmount += cgstAmountBygatway;
    const igstRateBygatway = gstCheck() ? 0 : 18;
    const igstAmountBygatway = (netAmountBygatway * igstRateBygatway) / 100;
    finaligstAmount += igstAmountBygatway;
    const totalAmountBygatway = netAmountBygatway + sgstAmountBygatway + cgstAmountBygatway + igstAmountBygatway;
    finalTotalAmount += totalAmountBygatway;

    return {
      finalNetAmount,
      finalsgstAmount,
      finalcgstAmount,
      finaligstAmount,
      finalTotalAmount,
    };
  };

  const printvalue = () => {
    generatePDF();
  };

  return (
    <>
      <div className="container">
        <div className="row">
          {data && (
            <div className="col-md-12">
              <div className="d-grid d-md-flex justify-content-md-end mb-0">
                <button type="button" onClick={printvalue} className="btn btn-primary">
                  Convert to PDF
                </button>
              </div>
              <div ref={componentPDF} className="check" style={{ width: '100%', margin: '40 px', fontWeight: 'bold' }}>
                {invoiceData && (
                  <div style={{ marginTop: '10px', marginLeft: '30px', marginRight: '30px', marginBottom: '40px', fontWeight: 'bold' }}>
                    <div className="text-center">
                      <h2 style={{ fontWeight: 'bold' }}>GST INVOICE</h2>
                    </div>
                    <div>
                      <Table size="sm" className="mb-1">
                        <thead>
                          <tr className="d-flex justify-content-between" style={{ border: '1px solid black', fontWeight: 'bold' }}>
                            <th style={{ borderRight: '1px solid black' }}>
                              <b style={{ fontSize: '16px', color: 'black', fontWeight: 'bold' }}>{storeFeatures?.storeName} </b>
                            </th>
                            <th style={{ borderLeft: '1px solid black' }}>
                              <b style={{ fontSize: '10px', color: 'black', fontWeight: 'bold' }}>Tax Invoice/Bill of Supply </b>
                              <div style={{ fontSize: '10px', color: 'black', fontWeight: 'bold' }}>(Original for Recipient)</div>
                            </th>
                          </tr>
                        </thead>
                      </Table>
                    </div>
                    <Table bordered size="xl" className="mb-1">
                      <thead>
                        <tr style={{ border: '1px solid black' }}>
                          <th style={{ fontSize: '10px', color: 'black', fontWeight: 'bold' }}>Sold by</th>
                          <th style={{ fontSize: '10px', color: 'black', fontWeight: 'bold' }}>Bill To</th>
                          <th style={{ fontSize: '10px', color: 'black', fontWeight: 'bold' }}>Ship To</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {sellerAddress && (
                            <td style={{ fontSize: '10px', border: '1px solid black', color: 'black', fontWeight: 'bold' }}>
                              {sellerAddress?.companyName}
                              <br />
                              {sellerAddress?.fullAddress} {','}
                              <br />
                              {`${sellerAddress?.city}, ${sellerAddress?.state} - ${sellerAddress?.pincode}`}
                              <br />
                              Mobile No: - {sellerAddress.mobileNo}
                              <br />
                              {sellerAddress?.gstin && <>GST No.: {sellerAddress.gstin} </>}
                              {sellerAddress?.pancardNo && <>PAN No.: {sellerAddress.pancardNo} </>}
                            </td>
                          )}
                          <td style={{ fontSize: '10px', border: '1px solid black', color: 'black' }}>
                            {invoiceData.billingAddress.firstName} {invoiceData.billingAddress.lastName}
                            <br />
                            {invoiceData.billingAddress.addressLine1}, {invoiceData.billingAddress.addressLine2}
                            <br />
                            {invoiceData.billingAddress.city}, {invoiceData.billingAddress.state} - {invoiceData.billingAddress.postalCode}
                            <br />
                            Mobile No.: - {invoiceData.billingAddress.mobileNo}
                            {invoiceData.billingAddress.altrMobileNo && <span>, {invoiceData.billingAddress.altrMobileNo}</span>}
                            {invoiceData.billingAddress.businessName && (
                              <span>
                                {' '}
                                <br /> Firm Name: {invoiceData.billingAddress.businessName}
                              </span>
                            )}
                            {invoiceData.billingAddress.gstin && (
                              <span>
                                {' '}
                                <br /> GST No.: {invoiceData.billingAddress.gstin}
                              </span>
                            )}
                          </td>

                          <td style={{ fontSize: '10px', border: '1px solid black', color: 'black' }}>
                            {invoiceData.shippingAddress.firstName} {invoiceData.shippingAddress.lastName}
                            <br />
                            {invoiceData.shippingAddress.addressLine1}, {invoiceData.shippingAddress.addressLine2}
                            <br />
                            {invoiceData.shippingAddress.city}, {invoiceData.shippingAddress.state} - {invoiceData.shippingAddress.postalCode}
                            <br />
                            Mobile No: - {invoiceData.shippingAddress.mobileNo}
                            {invoiceData.shippingAddress.altrMobileNo && <span>, {invoiceData.shippingAddress.altrMobileNo}</span>}
                            {invoiceData.shippingAddress.businessName && (
                              <span>
                                {' '}
                                <br /> Firm Name: {invoiceData.shippingAddress.businessName}
                              </span>
                            )}
                            {invoiceData.shippingAddress.gstin && (
                              <span>
                                {' '}
                                <br /> GST No.: {invoiceData.shippingAddress.gstin}
                              </span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                    <div>
                      <Table bordered size="sm" className="mb-1">
                        <thead>
                          <tr>
                            <th style={{ border: '1px solid black' }}>
                              <b style={{ fontSize: '10px', fontWeight: 'bold', color: 'black' }}>Order No: </b>
                              <span style={{ fontSize: '10px', color: 'black' }}>{orderID}</span>
                            </th>
                            <th style={{ border: '1px solid black' }}>
                              <b style={{ fontSize: '10px', fontWeight: 'bold', color: 'black' }}>Order Date : </b>
                              <span style={{ fontSize: '10px', color: 'black' }}> {moment(parseInt(invoiceData.createdAt, 10)).format('LL')}</span>
                            </th>
                            <th style={{ border: '1px solid black' }}>
                              <b style={{ fontSize: '10px', fontWeight: 'bold', color: 'black' }}>Invoice No: </b>
                              <span style={{ fontSize: '10px', color: 'black' }}>{billno}</span>
                            </th>
                            <th style={{ border: '1px solid black' }}>
                              <b style={{ fontSize: '10px', fontWeight: 'bold', color: 'black' }}>Invoice Date: </b>
                              <span style={{ fontSize: '10px', color: 'black' }}>{moment(parseInt(createdDate, 10)).format('LL')}</span>
                            </th>
                          </tr>
                        </thead>
                      </Table>
                    </div>
                    <table className="mb-1 border w-100">
                      <thead>
                        <tr>
                          <th style={{ fontSize: '10px', fontWeight: 'bold', padding: '4px', border: '1px solid black', color: 'black' }}>Sr. No.</th>
                          <th style={{ fontSize: '10px', fontWeight: 'bold', padding: '4px', border: '1px solid black', color: 'black' }}>Product Name</th>
                          <th style={{ fontSize: '10px', textAlign: 'center', padding: '4px', border: '1px solid black', fontWeight: 'bold', color: 'black' }}>
                            HSN
                          </th>
                          <th style={{ fontSize: '10px', textAlign: 'center', padding: '4px', border: '1px solid black', fontWeight: 'bold', color: 'black' }}>
                            Unit
                          </th>
                          <th style={{ fontSize: '10px', textAlign: 'center', padding: '4px', border: '1px solid black', fontWeight: 'bold', color: 'black' }}>
                            Unit Price <div style={{ fontSize: '8px' }}>(Without GST)</div>
                          </th>
                          <th style={{ fontSize: '10px', textAlign: 'center', padding: '4px', border: '1px solid black', fontWeight: 'bold', color: 'black' }}>
                            Qty
                          </th>
                          <th style={{ fontSize: '10px', textAlign: 'center', padding: '4px', border: '1px solid black', fontWeight: 'bold', color: 'black' }}>
                            Net Amount
                          </th>
                          <th style={{ fontSize: '10px', textAlign: 'center', padding: '4px', border: '1px solid black', fontWeight: 'bold', color: 'black' }}>
                            SGST <div style={{ fontSize: '8px' }}>Rate %</div>
                          </th>
                          <th style={{ fontSize: '10px', textAlign: 'center', padding: '4px', border: '1px solid black', fontWeight: 'bold', color: 'black' }}>
                            SGST <div style={{ fontSize: '8px' }}>Amount</div>
                          </th>
                          <th style={{ fontSize: '10px', textAlign: 'center', padding: '4px', border: '1px solid black', fontWeight: 'bold', color: 'black' }}>
                            CGST <div style={{ fontSize: '8px' }}>Rate %</div>
                          </th>
                          <th style={{ fontSize: '10px', textAlign: 'center', padding: '4px', border: '1px solid black', fontWeight: 'bold', color: 'black' }}>
                            CGST<div style={{ fontSize: '8px' }}> Amount</div>
                          </th>
                          <th style={{ fontSize: '10px', textAlign: 'center', padding: '4px', border: '1px solid black', fontWeight: 'bold', color: 'black' }}>
                            IGST <div style={{ fontSize: '8px' }}>Rate %</div>
                          </th>
                          <th style={{ fontSize: '10px', textAlign: 'center', padding: '4px', border: '1px solid black', fontWeight: 'bold', color: 'black' }}>
                            IGST <div style={{ fontSize: '8px' }}>Amount</div>
                          </th>
                          <th style={{ fontSize: '10px', textAlign: 'center', padding: '4px', border: '1px solid black', fontWeight: 'bold', color: 'black' }}>
                            Total Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.products?.length > 0 &&
                          data?.products.map((item, index) => {
                            return (
                              <TableRow
                                key={index}
                                item={item}
                                index={index}
                                invoiceData={invoiceData}
                                gstCheck={gstCheck}
                                freeDelivery={invoiceData.freeDelivery}
                              />
                            );
                          })}
                        {data?.products?.length > 0 && invoiceData?.onlinePaymentCharge ? (
                          <PaymentGatwayCharge
                            gstCheck={gstCheck}
                            invoiceData={invoiceData}
                            data={data}
                            handleFinalAmount={handleFinalAmount}
                            couponDiscount={couponDiscount1}
                          />
                        ) : null}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td style={{ border: '1px solid black' }} colSpan={6} />
                          <td style={{ textAlign: 'center', padding: '4px', border: '1px solid black' }}>
                            <b style={{ fontSize: '10px', fontWeight: 'bold', color: 'black' }}>
                              {' '}
                              {handleFinalAmountWithGatwayCharges().finalNetAmount.toFixed(2)}
                            </b>
                          </td>
                          <td style={{ textAlign: 'center', padding: '4px', border: '1px solid black' }} />
                          <td style={{ textAlign: 'center', padding: '4px', border: '1px solid black' }}>
                            <b style={{ fontSize: '10px', fontWeight: 'bold', color: 'black' }}>
                              {handleFinalAmountWithGatwayCharges().finalsgstAmount.toFixed(2)}
                            </b>
                          </td>
                          <td style={{ border: '1px solid black' }} />
                          <td style={{ textAlign: 'center', padding: '4px', border: '1px solid black' }}>
                            <b style={{ fontSize: '10px', fontWeight: 'bold', color: 'black' }}>
                              {handleFinalAmountWithGatwayCharges().finalcgstAmount.toFixed(2)}
                            </b>
                          </td>
                          <td style={{ border: '1px solid black' }} />
                          <td style={{ textAlign: 'center', padding: '4px', border: '1px solid black' }}>
                            <b style={{ fontSize: '10px', fontWeight: 'bold', color: 'black' }}>
                              {handleFinalAmountWithGatwayCharges().finaligstAmount.toFixed(2)}
                            </b>
                          </td>
                          <td style={{ textAlign: 'center', padding: '4px', border: '1px solid black' }}>
                            <b style={{ fontSize: '10px', fontWeight: 'bold', color: 'black' }}>
                              {handleFinalAmountWithGatwayCharges().finalTotalAmount.toFixed(2)}
                            </b>
                          </td>
                        </tr>
                        {/* {invoiceData?.couponName ? (
                          <tr style={{ fontSize: '10px' }}>
                            <td style={{ padding: '4px', border: '1px solid black' }}>Note: </td>
                            <td className="text-nowrap" style={{ padding: '4px', border: '1px solid black', color: 'black' }}>
                              Coupon Code Discount{' '}
                            </td>
                            <td className="text-nowrap" style={{ padding: '4px', border: '1px solid black', color: 'black' }}>
                              ₹ {couponDiscount1.toFixed(2)} ({invoiceData?.couponName})
                            </td>
                            <td colSpan={11} style={{ textAlign: 'center', padding: '4px', border: '1px solid black' }} />
                          </tr>
                        ) : null}
                        {invoiceData?.dmtPaymentDiscount ? (
                          <tr style={{ fontSize: '10px' }}>
                            <td style={{ border: '1px solid black' }} />
                            <td className="text-nowrap" style={{ padding: '4px', border: '1px solid black', color: 'black' }}>
                              DMT Discount{' '}
                            </td>
                            <td className="text-nowrap" style={{ textAlign: 'center', padding: '4px', border: '1px solid black', color: 'black' }}>
                              ₹{' '}
                              {(
                                ((handleFinalAmountWithGatwayCharges().finalTotalAmount - couponDiscount1) * invoiceData.dmtPaymentDiscountPercentage) /
                                100
                              ).toFixed(2)}
                            </td>
                            <td colSpan={11} style={{ border: '1px solid black' }} />
                          </tr>
                        ) : null} */}
                      </tfoot>
                    </table>
                    
                    {(invoiceData?.couponName || invoiceData?.dmtPaymentDiscount) && (
                      <table
                        className="mb-1 w-100"
                        style={{
                          borderCollapse: 'collapse',
                          fontSize: '11px',
                          border: '1px solid #000',
                          width: '100%',
                        }}
                      >
                        <thead>
                          <tr>
                            <td style={{ padding: '6px', verticalAlign: 'top' }}>
                              {(() => {
                                const total = handleFinalAmountWithGatwayCharges().finalTotalAmount;
                                const coupon = invoiceData?.couponName ? couponDiscount1 : 0;
                                const dmt = invoiceData?.dmtPaymentDiscount ? ((total - coupon) * invoiceData.dmtPaymentDiscountPercentage) / 100 : 0;
                                const final = total - coupon - dmt;

                                return (
                                  <div style={{ lineHeight: '1.5', color: '#212529' }}>
                                    <div>
                                      <span className='fw-bold'>Note:</span>
                                    </div>
                                    <div>
                                      <span style={{ fontWeight: 600 }}>Total Amount:</span> ₹{total.toFixed(2)}
                                    </div>

                                    {invoiceData?.couponName && (
                                      <div>
                                        <span style={{ fontWeight: 600 }}>Coupon Discount:</span> ₹{coupon.toFixed(2)}{' '}
                                        <span style={{ color: '#6c757d' }}>({invoiceData.couponName})</span>
                                      </div>
                                    )}

                                    {invoiceData?.dmtPaymentDiscount && (
                                      <div>
                                        <span style={{ fontWeight: 600 }}>DMT Discount:</span> ₹{dmt.toFixed(2)}
                                      </div>
                                    )}

                                    <div>Payable Amount: ₹{final.toFixed(2)}</div>
                                    <div className='small'>(This section is provided for your reference. It shows the total billed amount and the amount paid.)</div>
                                  </div>
                                );
                              })()}
                            </td>
                          </tr>
                        </thead>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default withRouter(ReactToPdf);
