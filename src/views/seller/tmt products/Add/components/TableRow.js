import React, { useEffect, useState } from 'react';

function TableRow({ variantName, moq, section, brandCompareVariant, onChange }) {
  const [price, setPrice] = useState('');
  const [b2bdiscount, setB2bDiscount] = useState(0);
  const [b2cdiscount, setB2cDiscount] = useState(0);
  const [sectionDiff, setSectionDiff] = useState('');

  // useEffect to update input fields when brandCompareVariant or variantName changes
  useEffect(() => {
    if (brandCompareVariant) {
      // Check if the variant is present in the brandCompareVariant and set the corresponding values
      const variant = brandCompareVariant.tmtseriesvariant.find((item) => item.variantName === variantName);

      if (variant) {
        setPrice(variant.price || '');
        setB2bDiscount(variant.b2bdiscount || 0);
        setB2cDiscount(variant.b2cdiscount || 0);
        setSectionDiff(variant.sectionDiff || '');
      } else {
        setPrice('');
        setB2bDiscount(0);
        setB2cDiscount(0);
        setSectionDiff('');
      }
    }
  }, [brandCompareVariant, variantName]);

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
            value={price}
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
            value={b2bdiscount}
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
            value={b2cdiscount}
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
              value={sectionDiff}
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
