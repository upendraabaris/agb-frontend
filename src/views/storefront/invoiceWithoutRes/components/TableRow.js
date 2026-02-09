import React from 'react';

function TableRow({ index, item }) {
  const withoutDiscount = (item.iprice * (100 - item.idiscount)) / 100;
  const withoutGstRate = withoutDiscount;
  const netAmount = withoutGstRate * item.quantity;
  const extraChargewithoutDiscount = (item.iextraCharge * (100 - item.idiscount)) / 100;
  const extraChargewithoutGstRate = extraChargewithoutDiscount / 1.18;
  const extraChargeNetAmount = extraChargewithoutGstRate * item.quantity;
  const transportChargewithoutGstRate = item.itransportCharge;
  const transportChargeNetAmount = transportChargewithoutGstRate * item.quantity;
  const totalAmount = netAmount + extraChargeNetAmount + transportChargeNetAmount;

  return (
    <>
      <tr>
        <td style={{ fontSize: '10px', padding: '4px', border: '1px solid black', color: 'black', fontWeight: 'bold', verticalAlign: 'top' }}>{index + 1}</td>
        <td style={{ fontSize: '10px', padding: '4px', border: '1px solid black', color: 'black', fontWeight: 'bold' }}>
          {item.productId.brand_name} - {item.productId.fullName} {item.variantId.variantName}
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
        <td
          style={{ fontSize: '10px', padding: '4px', border: '1px solid black', color: 'black', textAlign: 'center', fontWeight: 'bold', verticalAlign: 'top' }}
        >
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
          {totalAmount.toFixed(2)}
          <br />
        </td>
      </tr>
    </>
  );
}

export default TableRow;
