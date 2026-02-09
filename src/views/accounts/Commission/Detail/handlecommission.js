export const handlecommission = (products, onlinePaymentCharge, onlineCommission) => {
  const list = products.map(({ quantity, productId, price }) => {
    let listing = 0;
    let productComm = 0;
    let shippingComm = 0;
    let fixedComm = 0;
    let paymentGateway = 0;

    if (productId.listingCommType === 'fix') {
      listing = productId.listingComm;
    } else if (productId.listingCommType === 'percentage') {
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
      shippingComm = price * (productId.shippingComm / 100);
    }

    if (productId.fixedCommType === 'fix') {
      fixedComm = productId.fixedComm * quantity;
    } else if (productId.fixedCommType === 'percentage') {
      fixedComm = price * (productId.fixedComm / 100);
    }

    if (onlinePaymentCharge > 0) {
      paymentGateway = price * (onlineCommission / 100);
    } else {
      paymentGateway = 0;
    }

    return { listing, productComm, shippingComm, fixedComm, paymentGateway };
  });

  // Calculate totals for each commission type
  const totalListingComm = parseFloat(list.reduce((total, item) => total + item.listing, 0).toFixed(2));
  const totalProductComm = parseFloat(list.reduce((total, item) => total + item.productComm, 0).toFixed(2));
  const totalShippingComm = parseFloat(list.reduce((total, item) => total + item.shippingComm, 0).toFixed(2));
  const totalFixedComm = parseFloat(list.reduce((total, item) => total + item.fixedComm, 0).toFixed(2));
  const totalPaymentGateway = parseFloat(list.reduce((total, item) => total + item.paymentGateway, 0).toFixed(2));

  return {
    totalListingComm,
    totalProductComm,
    totalShippingComm,
    totalFixedComm,
    totalPaymentGateway,
  };
};

export const monthsList = [
  {
    monthname: 'January',
  },
  {
    monthname: 'February',
  },
  {
    monthname: 'March',
  },
  {
    monthname: 'April',
  },
  {
    monthname: 'May',
  },
  {
    monthname: 'June',
  },
  {
    monthname: 'July',
  },
  {
    monthname: 'August',
  },
  {
    monthname: 'September',
  },
  {
    monthname: 'October',
  },
  {
    monthname: 'November',
  },
  {
    monthname: 'December',
  },
];
