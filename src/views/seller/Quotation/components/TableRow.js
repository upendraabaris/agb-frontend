import React from 'react';

function TableRow({ product, preGstRate, priceAfterDiscount }) {
  return (
    <tr style={{ fontSize: 12, height: '38px' }}>
      <td
        style={{
          textAlign: 'left',
          paddingLeft: 6,
          padding: 4,
          border: '2px solid #dfdfdf',
        }}
      >
        {product.productId.brand_name} {product.productId.fullName} {product.variantId.variantName}
      </td>
      <td style={{ border: '1px solid #dfdfdf' }}>{preGstRate}</td>
      <td style={{ border: '1px solid #dfdfdf' }}>{product.discount} </td>
      <td style={{ border: '1px solid #dfdfdf' }}>{product.locationId.gstRate} </td>
      <td style={{ border: '1px solid #dfdfdf' }}>{product.quantity}</td>
      <td className="tdids" style={{ border: '1px solid #dfdfdf' }}>
        {(priceAfterDiscount * product.quantity).toFixed(2)}
      </td>
    </tr>
  );
}

export default TableRow;
