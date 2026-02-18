import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'react-bootstrap';

function TableRow({
  section,
  pId,
  variantID,
  variantName1,
  tmtserieslocation,
  setVariantQuantities,
  trigger,
  pincode,
  moq,
  setQuotationData,
  allPincode,
  active,
}) {
  const minimumqty = 0;
  const { isLogin, currentUser } = useSelector((state) => state.auth);

  // Checking availability at Pincode
  const [available, setAvailable] = useState('');

  // Lowest Price of Every Variant
  const [lowestPrice, setLowestPrice] = useState(Math.min(...tmtserieslocation.map((loc) => loc.price)));

  // Index of Lowest Price for Every Variant
  const [indexOfLowestPrice, setIndexOfLowestPrice] = useState(tmtserieslocation.findIndex((item) => item.price === lowestPrice));

  // Initital Location of lowest Price
  const [location, setLocation] = useState(indexOfLowestPrice);
  const [discount, setDiscount] = useState(
    currentUser?.role?.some((role) => role === 'b2b') ? tmtserieslocation[location].b2bdiscount : tmtserieslocation[location].b2cdiscount
  );

  const { price, gstRate, extraCharge, extraChargeType, transportCharge, transportChargeType, displayStock, mainStock } = tmtserieslocation[location];

  const priceT = price + extraCharge;

  const stockValue = displayStock <= mainStock ? displayStock : mainStock;
  const [quantity, setQuantity] = useState(0);
  // const price = (tmtserieslocation[location].price);
  const preGstRate = (priceT / ((100 + gstRate) / 100)).toFixed(2);
  //  (tmtserieslocation[location].price * tmtserieslocation[location].gstRate) / 100 + tmtserieslocation[location].price;

  const priceafterqty = quantity * priceT * moq;
  const discountPrice = ((100 - discount) * priceafterqty) / 100;
  const mainPrice = ((100 - discount) * priceT) / 100;

  useEffect(() => {
    if (allPincode) {
      // if(product.variant[variantIndex].location[location].allPincode) {
      setAvailable('Available');
    }
  }, [allPincode]);

  const handleOnChange = (e, nameVariant, rate, Vid, locId, disc, sellerId, stock, b2cDiscountforquatation) => {
    const qty = e.target.value;
    const MOQ = parseInt(moq, 10);
    const qty1 = MOQ * qty;
    setQuantity(qty);
    setVariantQuantities((prevQuantities) => {
      // Check if the variant ID already exists in prevQuantities
      const existingIndex = prevQuantities.findIndex((item) => item.variantName === nameVariant);

      if (existingIndex !== -1) {
        // Variant ID already exists, update the quantity
        const updatedQuantities = [...prevQuantities];
        updatedQuantities[existingIndex].quantity = qty1 || 0;
        updatedQuantities[existingIndex].rateofvariant = qty1 * rate;
        updatedQuantities[existingIndex].variantID = Vid;
        updatedQuantities[existingIndex].locationId = locId;
        updatedQuantities[existingIndex].availability = available;
        updatedQuantities[existingIndex].discount = disc;
        updatedQuantities[existingIndex].seller = sellerId;
        updatedQuantities[existingIndex].displayStock = stock;
        updatedQuantities[existingIndex].moq = moq;

        return updatedQuantities;
      }
      return [
        ...prevQuantities,
        {
          variantID: Vid,
          locationId: locId,
          quantity: qty1 || 0,
          availability: available,
          variantName: nameVariant,
          rateofvariant: rate * qty1,
          discount: disc,
          seller: sellerId,
          displayStock: stock,
          moq,
        },
      ];
    });
    setQuotationData((prevData) => {
      const existingIndex = prevData.findIndex((item) => item.variantId === Vid);
      if (existingIndex !== -1) {
        // Variant ID already exists, update the quantity
        const updatedQuantities = [...prevData];
        updatedQuantities[existingIndex].productId = pId;
        updatedQuantities[existingIndex].variantId = Vid;
        updatedQuantities[existingIndex].locationId = locId;
        updatedQuantities[existingIndex].quantity = qty1 || 0;
        updatedQuantities[existingIndex].discount = b2cDiscountforquatation || 0;
        return updatedQuantities;
      }
      return [
        ...prevData,
        {
          productId: pId,
          variantId: Vid,
          locationId: locId,
          quantity: qty1,
          discount: b2cDiscountforquatation,
        },
      ];
    });
  };

  const checkPincode = tmtserieslocation.some((item) => item.pincode.find((pinS) => pinS === pincode));
  const updatedLocation = tmtserieslocation.find((pin) => pin.pincode.find((pinc) => pinc === pincode));
  const IndexOfUpdatedLocation = tmtserieslocation.findIndex((pin) => pin.pincode.find((pinc) => pinc === pincode));

  function XYZ() {
    if (checkPincode) {
      setAvailable('Available');
      setLocation(IndexOfUpdatedLocation);
      setDiscount(
        currentUser?.role?.some((role) => role === 'b2b')
          ? tmtserieslocation[IndexOfUpdatedLocation].b2bdiscount
          : tmtserieslocation[IndexOfUpdatedLocation].b2cdiscount
      );
      setVariantQuantities([]);
      setQuantity(0);
    } else if (allPincode) {
      setAvailable('Available');
      setVariantQuantities([]);
      setQuantity(0);
    } else {
      setAvailable('Not Available');
      setVariantQuantities([]);
      setQuantity(0);
    }
  }

  useEffect(() => {
    if (trigger) {
      XYZ();
    }
  }, [trigger, available]);

  return (
    <>
      <tr className="border">
        <td className="border">{variantName1}</td>
        <td className="border text-center">{preGstRate}</td>
        {!section && <td className="border text-center">{discount}</td>}
        <td className="border text-center">{gstRate}</td>
        <td className="border text-center">{mainPrice.toFixed(2)}</td>
        {/* <td className="border">{priceT.toFixed(2)}</td> */}
        <td className="border text-center">
          <input
            onChange={(e) => {
              handleOnChange(
                e,
                variantName1,
                priceT,
                variantID,
                tmtserieslocation[location].id,
                discount,
                tmtserieslocation[location].sellerId,
                stockValue,
                tmtserieslocation[location].b2cdiscount,
                price,
                gstRate,
                extraCharge,
                extraChargeType,
                transportCharge,
                transportChargeType
              );
            }}
            style={{ width: '70px' }}
            type="number"
            onWheel={(e) => e.target.blur()}
            placeholder="0"
            value={quantity}
            min={minimumqty}
            max={Math.floor(stockValue / moq)}
          />
        </td>
        {/* <td className="border">{available === '' ? <>Enter Pincode</> : <>{available}</>}</td>
      <td className="border">{quantity * moq}</td> */}
        <td className="border text-center">{discountPrice.toFixed(2)}</td>
      </tr>
    </>
  );
}

export default TableRow;
