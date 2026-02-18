import React from 'react';
import { Form } from 'react-bootstrap';

function DiscountTable({ variantIndex, product, handleDiscountForEach }) {
  return (
    <tr style={{ fontSize: 12 }}>
      <td
        style={{
          textAlign: 'left',
          paddingLeft: 6,
          padding: 4,
          border: '1px solid #dfdfdf',
        }}
      >
        {product.productName} {product.variantName}
      </td>
      <td
        style={{
          textAlign: 'left',
          paddingLeft: 6,
          padding: 4,
          border: '1px solid #dfdfdf',
        }}
      >
        {product.originalDiscount}
      </td>
      <td style={{ border: '1px solid #dfdfdf' }}>
        <Form.Control
          type="text"
          name="discount"
          value={product.discount}
          onChange={(e) => {
            handleDiscountForEach(product.variantName, e, variantIndex, product.originalDiscount);
          }}
        />
      </td>
    </tr>
  );
}

export default DiscountTable;
