import React from 'react';

function PaymentGatwayCharge({ invoiceData, gstCheck, data, handleFinalAmount, couponDiscount }) {
  const { finalTotalAmount } = handleFinalAmount();
  const gatwaycharge = (finalTotalAmount - couponDiscount) * (invoiceData.onlinePaymentChargePercentage / 100);
  const withoutGstRate = gatwaycharge / 1.18;
  const netAmount = withoutGstRate * 1;
  const sgstRate = gstCheck() ? 18 / 2 : 0;
  const sgstAmount = (netAmount * sgstRate) / 100;
  const cgstRate = gstCheck() ? 18 / 2 : 0;
  const cgstAmount = (netAmount * cgstRate) / 100;
  const igstRate = gstCheck() ? 0 : 18;
  const igstAmount = (netAmount * igstRate) / 100;
  const totalAmount = netAmount + sgstAmount + cgstAmount + igstAmount;

  return (
    <>
      <tr>
        <td style={{ fontSize: '10px', border: '1px solid #000' }}>{data?.products?.length + 1}</td>
        <td style={{ fontSize: '10px', border: '1px solid #000' }}>Online Payment Charge</td>
        <td style={{ fontSize: '10px', textAlign: 'center', border: '1px solid #000' }} > 997159 </td>
        <td style={{ fontSize: '10px' }} />
        <td style={{ fontSize: '10px', textAlign: 'center', border: '1px solid #000' }}>{withoutGstRate.toFixed(2)}</td>
        <td style={{ fontSize: '10px', textAlign: 'center', border: '1px solid #000' }}>1</td>
        <td style={{ fontSize: '10px', textAlign: 'center', border: '1px solid #000' }}>{netAmount.toFixed(2)}</td>
        <td style={{ fontSize: '10px', textAlign: 'center', border: '1px solid #000' }}>{sgstRate}</td>
        <td style={{ fontSize: '10px', textAlign: 'center', border: '1px solid #000' }}>{sgstAmount.toFixed(2)}</td>
        <td style={{ fontSize: '10px', textAlign: 'center', border: '1px solid #000' }}>{cgstRate}</td>
        <td style={{ fontSize: '10px', textAlign: 'center', border: '1px solid #000' }}>{cgstAmount.toFixed(2)}</td>
        <td style={{ fontSize: '10px', textAlign: 'center', border: '1px solid #000' }}>{igstRate}</td>
        <td style={{ fontSize: '10px', textAlign: 'center', border: '1px solid #000' }}>{igstAmount.toFixed(2)}</td>
        <td style={{ fontSize: '10px', textAlign: 'center', border: '1px solid #000' }}>{totalAmount.toFixed(2)}</td>
      </tr>
    </>
  );
}

export default PaymentGatwayCharge;
