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
        <td style={{ fontSize: '10px' }}>{data?.products?.length + 1}</td>
        <td style={{ fontSize: '10px' }}>Online Payment Charge</td>
        <td style={{ fontSize: '10px' }} />
        <td style={{ fontSize: '10px', textAlign: 'center' }}>{withoutGstRate.toFixed(2)}</td>
        <td style={{ fontSize: '10px' }} />
        <td style={{ fontSize: '10px', textAlign: 'center' }}>1</td>
        <td style={{ fontSize: '10px', textAlign: 'center' }}>{netAmount.toFixed(2)}</td>
        <td style={{ fontSize: '10px', textAlign: 'center' }}>{sgstRate}</td>
        <td style={{ fontSize: '10px', textAlign: 'center' }}>{sgstAmount.toFixed(2)}</td>
        <td style={{ fontSize: '10px', textAlign: 'center' }}>{cgstRate}</td>
        <td style={{ fontSize: '10px', textAlign: 'center' }}>{cgstAmount.toFixed(2)}</td>
        <td style={{ fontSize: '10px', textAlign: 'center' }}>{igstRate}</td>
        <td style={{ fontSize: '10px', textAlign: 'center' }}>{igstAmount.toFixed(2)}</td>
        <td style={{ fontSize: '10px', textAlign: 'center' }}>{totalAmount.toFixed(2)}</td>
      </tr>
    </>
  );
}

export default PaymentGatwayCharge;
