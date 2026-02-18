import React, { useEffect, useState } from 'react';

function TableRow({ variantName, moq, section, productdetail, onChange }) {
  const [price, setPrice] = useState('');
  const [b2bDiscount, setB2bDiscount] = useState('');
  const [b2cDiscount, setB2cDiscount] = useState('');
  const [sectionDiff, setSectionDiff] = useState('');

  // useEffect to update input fields when productdetail or variantName changes

  useEffect(() => {
    if (productdetail) {
      // Check if the variant is present in the productdetail and set the corresponding values
      const variant = productdetail.tmtseriesvariant.find((item) => item.variantName === variantName);

      const tmtserieslocation = variant?.tmtserieslocation[0];
      if (tmtserieslocation) {
        setPrice(tmtserieslocation.price || 0);
        setB2bDiscount(tmtserieslocation.b2bdiscount || 0);
        setB2cDiscount(tmtserieslocation.b2cdiscount || 0);
        setSectionDiff(tmtserieslocation.sectionDiff || 0);
      } else {
        setPrice(0);
        setB2bDiscount(0);
        setB2cDiscount(0);
        setSectionDiff(0);
      }
    }
  }, [productdetail, variantName]);

  // Update the state and inform the parent component
  const handleInputChange = (field, value) => {
    if (field === 'price') setPrice(value);
    else if (field === 'b2bdiscount') setB2bDiscount(value);
    else if (field === 'b2cdiscount') setB2cDiscount(value);
    else if (field === 'sectionDiff') setSectionDiff(value);
    onChange(field, value);
  };

  return (
    <>
      <tr className="border">
        <td className="border">{variantName}</td>
        <td className="border">{moq}</td>
        <td className="border">
          <input
            name="price"
            onChange={(e) => handleInputChange('price', e.target.value)}
            value={price || 0}
            style={{ width: '80px' }}
            type="number"
            step="0.01"
            onWheel={(e) => e.target.blur()}
            placeholder="0"
            min={0}
          />
        </td>
        <td className="border">
          <input
            name="b2bdiscount"
            onChange={(e) => handleInputChange('b2bdiscount', e.target.value)}
            value={b2bDiscount || 0}
            style={{ width: '50px' }}
            type="number"
            onWheel={(e) => e.target.blur()}
            placeholder="0"
            min={0}
          />
        </td>
        <td className="border">
          <input
            name="b2cdiscount"
            onChange={(e) => handleInputChange('b2cdiscount', e.target.value)}
            value={b2cDiscount || 0}
            style={{ width: '50px' }}
            type="number"
            onWheel={(e) => e.target.blur()}
            placeholder="0"
            min={0}
          />
        </td>
        {section && (
          <td className="border">
            <input
              name="sectionDiff"
              onChange={(e) => handleInputChange('sectionDiff', e.target.value)}
              value={sectionDiff || 0}
              style={{ width: '60px' }}
              type="number"
              step="0.01"
              onWheel={(e) => e.target.blur()}
              placeholder="0"
            />
          </td>
        )}
      </tr>
    </>
  );
}

export default TableRow;
