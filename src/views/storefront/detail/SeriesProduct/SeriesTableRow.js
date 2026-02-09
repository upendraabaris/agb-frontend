import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Button, Modal } from 'react-bootstrap';

function SeriesTableRow({
  run,
  sellerID,
  index,
  variantName,
  variantID,
  moq,
  serieslocation,
  pincode,
  setPincode,
  trigger,
  setVariantQuantities,
  allPincode,
  active,
}) {
  // console.log("pincode", pincode);

  // console.log("sellerID", sellerID);
  // const [sellerID, setsellerID ] = useState('');
  // const sellerVariantLocation = serieslocation.findIndex((seller) => seller.sellerId === sellerID);
  // console.log("sellerVariantLocation", sellerVariantLocation);

  // const [featureBoxModal, setFeatureBoxModal] = useState(false);
  const minimumqty = 1;
  const { isLogin, currentUser } = useSelector((state) => state.auth);
  // Checking availability at Pincode
  const [available, setAvailable] = useState('');
  // Lowest Price of Every Variant
  const [lowestPrice, setLowestPrice] = useState(Math.min(...serieslocation.map((loc) => loc.price)));
  // Index of Lowest Price for Every Variant
  const [indexOfLowestPrice, setIndexOfLowestPrice] = useState(serieslocation.findIndex((item) => item.price === lowestPrice));
  // Initital Location of lowest Price
  const [location, setLocation] = useState(indexOfLowestPrice);
  const [discount, setDiscount] = useState(
    currentUser?.role?.some((role) => role === 'b2b') ? serieslocation[location].b2bdiscount : serieslocation[location].b2cdiscount
  );
  const { displayStock, price, extraCharge, gstRate } = serieslocation[location];

  const [quantity, setQuantity] = useState(0);
  const priceExtra = price + extraCharge;
  const preGstRate = (priceExtra / ((100 + gstRate) / 100)).toFixed(2);
  const priceafterqty = quantity * moq * priceExtra;
  const discountPrice = ((100 - discount) * priceafterqty) / 100;

  const [sellerPrice, setSellerPrice] = useState(serieslocation[location].price);

  useEffect(() => {
    if (allPincode) {
      // if(product.variant[variantIndex].location[location].allPincode) {
      setAvailable('Available');
    }
  }, [allPincode]);

  const handleOnChange = (e, nameVariant, rate, Vid, locId, disc, stock) => {
    if (sellerPrice === 'Not Sold') {
      toast.info('NOT SOLD by this Seller');
    } else if (available === '') {
      toast.info('Check Availability of Product by entring Pincode!!!');
    } else {
      const qty = e.target.value;
      const MOQ = parseInt(moq, 10);
      const qty1 = MOQ * qty;
      setQuantity(qty);
      setVariantQuantities((previousQuantity) => {
        const existingIndex = previousQuantity.findIndex((item) => item.variantName === nameVariant);
        if (existingIndex !== -1) {
          // Variant ID already exists, update the quantity
          const updatedQuantities = [...previousQuantity];
          updatedQuantities[existingIndex].quantity = qty1 || 0;
          updatedQuantities[existingIndex].rateofvariant = qty1 * rate;
          updatedQuantities[existingIndex].variantID = Vid;
          updatedQuantities[existingIndex].locationId = locId;
          updatedQuantities[existingIndex].availability = available;
          updatedQuantities[existingIndex].discount = disc;
          updatedQuantities[existingIndex].displayStock = stock;
          updatedQuantities[existingIndex].moq = moq;

          return updatedQuantities;
        }
        return [
          ...previousQuantity,
          {
            variantID: Vid,
            locationId: locId,
            quantity: qty1 || 0,
            availability: available,
            variantName: nameVariant,
            rateofvariant: rate * qty1,
            discount: disc,
            displayStock: stock,
            moq,
          },
        ];
      });
    }

    // setVariantQuantities((previousQuantity) => {
    //   const existingIndex = previousQuantity.findIndex((item) => item.variantName === nameVariant);
    //   if (existingIndex !== -1) {
    //     // Variant ID already exists, update the quantity
    //     const updatedQuantities = [...previousQuantity];
    //     updatedQuantities[existingIndex].quantity = qty1 || 0;
    //     updatedQuantities[existingIndex].rateofvariant = qty1 * rate;
    //     updatedQuantities[existingIndex].variantID = Vid;
    //     updatedQuantities[existingIndex].locationId = locId;
    //     updatedQuantities[existingIndex].availability = available;
    //     updatedQuantities[existingIndex].discount = disc;
    //     updatedQuantities[existingIndex].displayStock = stock;
    //     updatedQuantities[existingIndex].moq = moq;

    //     return updatedQuantities;
    //   }
    //   return [
    //     ...previousQuantity,
    //     {
    //       variantID: Vid,
    //       locationId: locId,
    //       quantity: qty1 || 0,
    //       availability: available,
    //       variantName: nameVariant,
    //       rateofvariant: rate * qty1,
    //       discount: disc,
    //       displayStock: stock,
    //       moq,
    //     },
    //   ];
    // });
  };

  useEffect(() => {
    setSellerPrice(serieslocation[location].price);
  }, []);

  // const sellerContent = serieslocation.find((seller) => seller.sellerId === sellerID);
  const sellerVariantLocation = serieslocation.findIndex((seller) => seller.sellerId === sellerID);
  const checkSellerID = serieslocation.some((item) => item.sellerId === sellerID);

  // console.log("sellerVariantLocation", sellerVariantLocation);
  // console.log("checkSellerID", checkSellerID);
  // console.log("pincode", pincode);

  const checkPincode = serieslocation.some((item) => item.pincode.find((pinS) => pinS === pincode));
  const updatedLocation = serieslocation.find((pin) => pin.pincode.find((pinc) => pinc === pincode));
  // const [IndexOfUpdatedLocation, setIndexOfUpdatedLocation] = useState(serieslocation.findIndex((pin) => pin.pincode.find((pinc) => pinc === pincode)));
  const IndexOfUpdatedLocation = serieslocation.findIndex((pin) => pin.pincode.find((pinc) => pinc === pincode));

  // useEffect(() => {
  //   if(sellerID === ''){
  //     console.log("dd");
  //   }
  //   else{
  //   if(checkSellerID)
  //   {
  //     setSellerPrice(serieslocation[sellerVariantLocation].price);
  //    // setAvailable('Enter Pincode');
  //     setLocation(sellerVariantLocation);
  //     setDiscount(
  //       currentUser?.role?.some((role) => role === 'b2b')
  //         ? serieslocation[sellerVariantLocation].b2bdiscount
  //         : serieslocation[sellerVariantLocation].b2cdiscount
  //     );
  //     setVariantQuantities([]);
  //     setQuantity(0);
  //   }
  //   if(checkSellerID === false)
  //   {
  //     setSellerPrice("Not Sold");
  //     // setAvailable('Enter Pincode');
  //     setVariantQuantities([]);
  //     setQuantity(0);
  //   }}
  // }, [sellerID, checkSellerID, sellerVariantLocation]);

  function XYZ() {
    if (pincode !== null) {
      if (checkPincode) {
        setAvailable('Available');
        setLocation(IndexOfUpdatedLocation);
        setSellerPrice(serieslocation[IndexOfUpdatedLocation].price);
        setDiscount(
          currentUser?.role?.some((role) => role === 'b2b')
            ? serieslocation[IndexOfUpdatedLocation].b2bdiscount
            : serieslocation[IndexOfUpdatedLocation].b2cdiscount
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
    } else {
      setAvailable('Enter Pincode');
    }
  }

  function ABC() {
    // setIndexOfUpdatedLocation(sellerVariantLocation);
    if (sellerID === '') {
      console.log('dd');
    } else {
      if (checkSellerID) {
        setPincode(null);
        setSellerPrice(serieslocation[sellerVariantLocation].price);
        setLocation(sellerVariantLocation);
        setDiscount(
          currentUser?.role?.some((role) => role === 'b2b')
            ? serieslocation[sellerVariantLocation].b2bdiscount
            : serieslocation[sellerVariantLocation].b2cdiscount
        );
        setVariantQuantities([]);
        setQuantity(0);
      }
      if (checkSellerID === false) {
        setPincode(null);
        setSellerPrice('Not Sold by Seller');
        setVariantQuantities([]);
        setQuantity(0);
      }
    }
  }

  // console.log("available", available);

  useEffect(() => {
    if (trigger) {
      XYZ();
    }
  }, [trigger, available, pincode]);
  useEffect(() => {
    if (run) {
      ABC();
    }
  }, [run, sellerID, checkSellerID, sellerVariantLocation]);

  return (
    <>
      {active && (
        <tr className="border" key={index}>
          {/* <td className="border">{variantName} <Button className='mx-0 px-0' variant='link' onClick={() => sellerList()} >View Seller</Button></td>  */}
          <td className="border">{variantName}</td>
          <td className="border">{preGstRate}</td>
          <td className="border">{discount}</td>
          <td className="border">{serieslocation[location].gstRate}</td>
          {/* <td className="border">{serieslocation[location].price}</td> */}
          <td className="border">{sellerPrice}</td>
          <td className="border">
            <input
              onChange={(e) => {
                handleOnChange(
                  e,
                  variantName,
                  serieslocation[location].price,
                  variantID,
                  serieslocation[location].id,
                  discount,
                  serieslocation[location].displayStock
                );
              }}
              style={{ width: '50px' }}
              type="number"
              onWheel={(e) => e.target.blur()}
              placeholder="0"
              min={minimumqty}
              max={Math.floor(displayStock / moq)}
              value={quantity}
            />
          </td>
          <td className="border">{available === '' ? <>Enter Pincode</> : <>{available}</>}</td>
          <td className="border">{quantity * moq}</td>
          <td className="border">{discountPrice.toFixed(2)}</td>
        </tr>
      )}
      {/* Pending */}
      {/* <Modal show={featureBoxModal} onHide={() => setFeatureBoxModal(false)}>
        <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
          <Modal.Title>Salient Features</Modal.Title>
        </Modal.Header>
        <Modal.Body className="mx-2 my-2 px-2 py-2">
          <ul> 
            {serieslocation?.map((seller) => 
              <li style={{listStyle: 'none'}} className='cursor-pointer' key={seller.id} onClick={() => handleChangeSeller(seller.sellerId)}>{seller.sellerId}</li>
              )}
          </ul>
        </Modal.Body>
      </Modal> */}
    </>
  );
}

export default SeriesTableRow;
