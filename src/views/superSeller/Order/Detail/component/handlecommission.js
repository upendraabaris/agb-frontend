const handlecommission = (products) => {
  const list = products.map(({ quantity, productId, price }) => {
    let listing = 0;
    let productComm = 0;
    let shippingComm = 0;
    let fixedComm = 0;

    if (productId.listingCommType === 'fix') {
      listing = productId.listingComm;
    } else if (productId.listingCommType === 'percentage') {
      // listing = productId.listingComm / 100;
      listing = ((price / quantity) * productId.listingComm) / 100;
    }

    if (productId.productCommType === 'fix') {
      productComm = productId.productComm * quantity;
    } else if (productId.productCommType === 'percentage') {
      productComm = price * (productId.productComm / 100);
    }

    if (productId.shippingCommType === 'fix') {
      shippingComm = productId.shippingComm * quantity;
    } else if (productId.shippingCommType === 'percentage') {
      shippingComm = price * (productId.productComm / 100);
    }

    if (productId.fixedCommType === 'fix') {
      fixedComm = productId.fixedComm * quantity;
    } else if (productId.fixedCommType === 'percentage') {
      fixedComm = price * (productId.fixedComm / 100);
    }

    return { listing, productComm, shippingComm, fixedComm };
  });

  // Update the state variables

  const totalListingComm = list.reduce((total, item) => total + item.listing, 0);
  const totalProductComm = list.reduce((total, item) => total + item.productComm, 0);
  const totalShippingComm = list.reduce((total, item) => total + item.shippingComm, 0);
  const totalFixedComm = list.reduce((total, item) => total + item.fixedComm, 0);

  return {
    totalListingComm,
    totalProductComm,
    totalShippingComm,
    totalFixedComm,
  };
};

export default handlecommission;
