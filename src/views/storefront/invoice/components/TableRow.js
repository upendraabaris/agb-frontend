import React from 'react';

function TableRow({ index, item, gstCheck }) {
  const withoutDiscount = (item.iprice * (100 - item.idiscount)) / 100;
  const withoutGstRate = withoutDiscount / ((100 + item.igst) / 100);
  const netAmount = withoutGstRate * item.quantity;
  const sgstRate = gstCheck() ? item.igst / 2 : 0;
  const sgstAmount = (netAmount * sgstRate) / 100;
  const cgstRate = gstCheck() ? item.igst / 2 : 0;
  const cgstAmount = (netAmount * cgstRate) / 100;
  const igstRate = gstCheck() ? 0 : item.igst;
  const igstAmount = (netAmount * igstRate) / 100;
  const totalAmount = netAmount + sgstAmount + cgstAmount + igstAmount;
  const extraChargewithoutDiscount = (item.iextraCharge * (100 - item.idiscount)) / 100;
  const extraChargewithoutGstRate = extraChargewithoutDiscount / 1.18;
  const extraChargeNetAmount = extraChargewithoutGstRate * item.quantity;
  const sgstRateForextraCharge = gstCheck() ? 9 : 0;
  const cgstRateForextraCharge = gstCheck() ? 9 : 0;
  const igstRateForextraCharge = gstCheck() ? 0 : 18;
  const extraChargesgstAmount = (extraChargeNetAmount * sgstRateForextraCharge) / 100;
  const extraChargecgstAmount = (extraChargeNetAmount * cgstRateForextraCharge) / 100;
  const extraChargeigstAmount = (extraChargeNetAmount * igstRateForextraCharge) / 100;
  const extraChargetotalAmount = extraChargeNetAmount + extraChargesgstAmount + extraChargecgstAmount + extraChargeigstAmount;
  const transportChargewithoutGstRate = item.itransportCharge / 1.18;
  const transportChargeNetAmount = transportChargewithoutGstRate * item.quantity;
  const sgstRateFortransportCharge = gstCheck() ? 9 : 0;
  const cgstRateFortransportCharge = gstCheck() ? 9 : 0;
  const igstRateFortransportCharge = gstCheck() ? 0 : 18;
  const transportChargesgstAmount = (transportChargeNetAmount * sgstRateFortransportCharge) / 100;
  const transportChargecgstAmount = (transportChargeNetAmount * cgstRateFortransportCharge) / 100;
  const transportChargeigstAmount = (transportChargeNetAmount * igstRateFortransportCharge) / 100;
  const transportChargetotalAmount = transportChargeNetAmount + transportChargesgstAmount + transportChargecgstAmount + transportChargeigstAmount;

  return (
    <>
      <tr className="">
        <td style={{ fontSize: '10px', padding: '4px', border: '1px solid black', color: 'black', fontWeight: 'bold' }}>{index + 1}</td>
        <td style={{ fontSize: '10px', padding: '4px', border: '1px solid black', color: 'black', fontWeight: 'bold' }}>
          {item.productId.brand_name}
          {'- '} {item.productId.fullName} {item.variantId.variantName}
          <br />
          {item.iextraCharge ? (
            <span>
              {item.iextraChargeType}
              <br />
            </span>
          ) : null}
          {item.itransportCharge ? <span>{item.itransportChargeType}</span> : null}
        </td>
        <td style={{ fontSize: '10px', padding: '4px', border: '1px solid black', color: 'black', textAlign: 'center', fontWeight: 'bold' }}>
          {item.variantId.hsn}
          <br />
          {item.iextraCharge ? (
            <span>
              998540
              <br />
            </span>
          ) : null}
          {item.itransportCharge ? <span>996812</span> : null}
        </td>
        <td style={{ fontSize: '10px', padding: '4px', border: '1px solid black', color: 'black', textAlign: 'center', fontWeight: 'bold' }}>
          {item.locationId.unitType}
        </td>
        <td style={{ fontSize: '10px', padding: '4px', border: '1px solid black', color: 'black', textAlign: 'center', fontWeight: 'bold' }}>
          {withoutGstRate.toFixed(2)}
          <br />
          {item.iextraCharge ? (
            <span>
              {extraChargewithoutGstRate.toFixed(2)}
              <br />
            </span>
          ) : null}
          {item.itransportCharge ? <span>{transportChargewithoutGstRate.toFixed(2)}</span> : null}
        </td>
        <td style={{ fontSize: '10px', padding: '4px', border: '1px solid black', color: 'black', textAlign: 'center', fontWeight: 'bold' }}>
          {item.quantity}
          <br />
          {item.iextraCharge ? (
            <span>
              {item.quantity}
              <br />
            </span>
          ) : null}
        </td>
        <td style={{ fontSize: '10px', padding: '4px', border: '1px solid black', color: 'black', textAlign: 'center', fontWeight: 'bold' }}>
          {netAmount.toFixed(2)}
          <br />
          {item.iextraCharge ? (
            <span>
              {extraChargeNetAmount.toFixed(2)}
              <br />
            </span>
          ) : null}
          {item.itransportCharge ? <span>{transportChargeNetAmount.toFixed(2)}</span> : null}
        </td>
        <td style={{ fontSize: '10px', padding: '4px', border: '1px solid black', color: 'black', textAlign: 'center', fontWeight: 'bold' }}>
          {sgstRate}
          <br />
          {item.iextraCharge ? (
            <span>
              {sgstRateForextraCharge}
              <br />
            </span>
          ) : null}
          {item.itransportCharge ? <span>{sgstRateFortransportCharge}</span> : null}
        </td>
        <td style={{ fontSize: '10px', padding: '4px', border: '1px solid black', color: 'black', textAlign: 'center', fontWeight: 'bold' }}>
          {sgstAmount.toFixed(2)}
          <br />
          {item.iextraCharge ? (
            <span>
              {extraChargesgstAmount.toFixed(2)}
              <br />
            </span>
          ) : null}
          {item.itransportCharge ? <span>{transportChargesgstAmount.toFixed(2)}</span> : null}
        </td>
        <td style={{ fontSize: '10px', padding: '4px', border: '1px solid black', color: 'black', textAlign: 'center', fontWeight: 'bold' }}>
          {cgstRate}
          <br />
          {item.iextraCharge ? (
            <span>
              {cgstRateForextraCharge}
              <br />
            </span>
          ) : null}
          {item.itransportCharge ? <span>{cgstRateFortransportCharge}</span> : null}
        </td>
        <td style={{ fontSize: '10px', padding: '4px', border: '1px solid black', color: 'black', textAlign: 'center', fontWeight: 'bold' }}>
          {cgstAmount.toFixed(2)}
          <br />
          {item.iextraCharge ? (
            <span>
              {extraChargecgstAmount.toFixed(2)}
              <br />
            </span>
          ) : null}
          {item.itransportCharge ? <span>{transportChargecgstAmount.toFixed(2)}</span> : null}
        </td>
        <td style={{ fontSize: '10px', padding: '4px', border: '1px solid black', color: 'black', textAlign: 'center', fontWeight: 'bold' }}>
          {igstRate}
          <br />
          {item.iextraCharge ? (
            <span>
              {igstRateForextraCharge}
              <br />
            </span>
          ) : null}
          {item.itransportCharge ? <span>{igstRateFortransportCharge}</span> : null}
        </td>
        <td style={{ fontSize: '10px', padding: '4px', border: '1px solid black', color: 'black', textAlign: 'center', fontWeight: 'bold' }}>
          {igstAmount.toFixed(2)}
          <br />
          {item.iextraCharge ? (
            <span>
              {extraChargeigstAmount.toFixed(2)}
              <br />
            </span>
          ) : null}
          {item.itransportCharge ? <span>{transportChargeigstAmount.toFixed(2)}</span> : null}
        </td>
        <td style={{ fontSize: '10px', padding: '4px', border: '1px solid black', color: 'black', textAlign: 'center', fontWeight: 'bold' }}>
          {totalAmount.toFixed(2)}
          <br />
          {item.iextraCharge ? (
            <span>
              {extraChargetotalAmount.toFixed(2)}
              <br />
            </span>
          ) : null}
          {item.itransportCharge ? <span>{transportChargetotalAmount.toFixed(2)}</span> : null}
        </td>
      </tr>
    </>
  );
}

export default TableRow;
