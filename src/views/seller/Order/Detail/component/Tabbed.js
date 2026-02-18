import React, { useEffect, useState, useRef } from 'react';
import { Row, Col, Button, Card, OverlayTrigger, Tooltip, Modal, Form } from 'react-bootstrap';
import { gql, useMutation, useLazyQuery, useQuery } from '@apollo/client';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
// import generatePDF, { Resolution, Margin } from 'react-to-pdf';
import ItemTraking from './ItemTraking';
import handlecommission from './handlecommission';

const CREATE_BILL = gql`
  mutation CreateBill(
    $orderId: ID
    $packedId: String
    $billedProducts: [BilledProducts]
    $listingComm: Float
    $productComm: Float
    $shippingComm: Float
    $fixedComm: Float
    $paymentGateway: Float
    $tds: Float
    $tcs: Float
    $gstComm: Float
    $orderAmount: Float
    $settlementAmount: Float
  ) {
    createBill(
      orderId: $orderId
      packedID: $packedId
      billedProducts: $billedProducts
      listingComm: $listingComm
      productComm: $productComm
      shippingComm: $shippingComm
      fixedComm: $fixedComm
      paymentGateway: $paymentGateway
      tds: $tds
      tcs: $tcs
      gstComm: $gstComm
      orderAmount: $orderAmount
      settlementAmount: $settlementAmount
    ) {
      id
      billNumber
      createdAt
    }
  }
`;

const GET_STORE_FEATURE = gql`
  query GetStoreFeature {
    getStoreFeature {
      storeName
    }
  }
`;

const GET_SITE_CONTENT = gql`
  query GetSiteContent($key: String!) {
    getSiteContent(key: $key) {
      key
      content
      updatedAt
    }
  }
`;

const GET_BILL_PACKED = gql`
  query GetBillByPackedId($packedId: String) {
    getBillByPackedId(packedID: $packedId) {
      issue_resolved_date
      customer_issue_title
      customer_issue_date
      customer_issue
    }
  }
`;

function Tabbed({ orderDetailData, OrderPacked, loading, history }) {
  const [packageIdentifier1, setpackageIdentifier] = useState([]);
  const [shippingAddress1, setShippingAddress] = useState(null);
  const [sellerDetails, setSellerDetails] = useState(null);
  const { data: storeFeatureData, loading: storeFeatureLoading, error: storeFeatureError } = useQuery(GET_STORE_FEATURE);
  const storeName = storeFeatureData?.getStoreFeature?.storeName || '';
  const onlinePaymentCharge = orderDetailData?.getSingleOrderForseller?.onlinePaymentCharge || '';
  const [commissionModal, setCommissionModal] = useState(false);
  const [productForCommissions, setProductForCommission] = useState(null);
  const [listingComm1, setListingComm] = useState(0);
  const [productComm1, setProductComm] = useState(0);
  const [shippingComm1, setShippingComm] = useState(0);
  const [fixedComm1, setFixedComm] = useState(0);
  const [paymentGateway1, setPaymentGateway] = useState(0);

  const [packageTotalValue, setpackageTotalValue] = useState(0);
  const [afterCommissionValue, setAfterCommissionValue] = useState(0);
  const [chargesoncommission, setChargesoncommission] = useState({
    gst: 0,
    tds: 0,
    tcs: 0,
  });

  useEffect(() => {
    const handlepackeditem = async () => {
      if (orderDetailData?.getSingleOrderForseller) {
        const { orderProducts, shippingAddress } = orderDetailData.getSingleOrderForseller;
        if (shippingAddress) {
          setShippingAddress(shippingAddress);
        }
        if (orderProducts.length > 0) {
          let seller;
          if (!orderProducts[0]?.sellerId) {
            seller = orderProducts[0]?.locationId[0]?.sellerId;
          } else {
            seller = orderProducts[0]?.sellerId;
          }
          setSellerDetails({ ...seller, ...JSON.parse(seller.address) });
        }
        if (orderProducts) {
          const groupedProducts = orderProducts.reduce((acc, product) => {
            const { packageIdentifier } = product;
            if (packageIdentifier) {
              if (!acc[packageIdentifier]) {
                acc[packageIdentifier] = { packageIdentifier, products: [] };
              }
              acc[packageIdentifier].products.push(product);
            }

            return acc;
          }, {});
          const groupedProductsArray = Object.values(groupedProducts);
          setpackageIdentifier(groupedProductsArray);
        }
      }
    };
    if (orderDetailData?.getSingleOrderForseller) {
      handlepackeditem();
    }
  }, [orderDetailData]);

  const onlineCommission = orderDetailData?.getSingleOrderForseller?.onlinePaymentChargePercentage;
  const [uploadpkdImgmodal, setUploadpkdImgmodal] = useState(false);
  const [packedproductsforuploadimage, setpackedproductsforuploadimage] = useState(null);
  const initialFormData = {
    orderPackedId: orderDetailData.getSingleOrderForseller.id,
    status: 'packed',
    packedDate: '',
    file: null,
  };
  const [packedFormData, setpackedFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const uploadPackedImage = (item1) => {
    setUploadpkdImgmodal(true);
    setpackedproductsforuploadimage(item1);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setpackedFormData((prevValue) => ({
        ...prevValue,
        [name]: files[0],
      }));
    } else {
      setpackedFormData((prevValue) => ({
        ...prevValue,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!packedFormData.file) {
      errors.file = 'Package Image is required.';
    }
    if (!packedFormData.packedDate.trim()) {
      errors.packedDate = 'Packed date is required.';
    }
    if (!packedproductsforuploadimage.products.length) {
      errors.productlist = 'Product Selection is required.';
    }
    return errors;
  };

  const submituploadImage = async (e) => {
    e.preventDefault();
    const errors = await validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    try {
      const orderProducts = packedproductsforuploadimage.products.map(({ variantId }) => ({
        variantId: variantId.id,
      }));
      await OrderPacked({
        variables: {
          ...packedFormData,
          orderProducts,
        },
      });
      setUploadpkdImgmodal(false);
      setpackedproductsforuploadimage(null);
      setpackedFormData(initialFormData);
    } catch (error) {
      console.error('error', error);
      toast.error(error.message || 'Something went Wrong !');
    }
  };

  const componentRef = useRef();

  const generatePDF = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Shipping Slip',
  });

  const downloadShippingSlipPDF = () => {
    generatePDF();
  };

  const [CreateBill] = useMutation(CREATE_BILL, {
    onError: (error) => {
      toast.error(error.message || 'Something Went Wrong !');
    },
  });

  const createInvoice = (item2, billno, createdDate) => {
    const sellerDetailsS = orderDetailData?.getSingleOrderForseller?.orderProducts?.[0]?.sellerId;
    if (sellerDetailsS?.gstin && sellerDetailsS?.gstinComposition === false) {
      history.push(`/invoiceRes?orderID=${orderDetailData?.getSingleOrderForseller?.id}`, {
        data: item2,
        billno,
        createdDate,
      });
    } else {
      history.push(`/invoiceWithoutRes?orderID=${orderDetailData?.getSingleOrderForseller?.id}`, {
        data: item2,
        billno,
        createdDate,
      });
    }
  };

  const downloadInvoice = async (item1) => {
    const { packageIdentifier, products } = item1;

    const { totalListingComm, totalProductComm, totalShippingComm, totalFixedComm, totalPaymentGateway } = handlecommission(
      products,
      onlinePaymentCharge,
      onlineCommission
    );

    const calculatedTotalCartValue = products.reduce((total, product) => total + product.price, 0);
    const payGTYPer = orderDetailData?.getSingleOrderForseller?.onlinePaymentChargePercentage;
    const onlinePaymentChargew = (calculatedTotalCartValue * payGTYPer) / 100;

    const paymentGatewayWithoutGST = onlinePaymentChargew / 1.18;
    const gstoncommission = (totalListingComm + totalProductComm + totalShippingComm + totalFixedComm + paymentGatewayWithoutGST) * 0.18;

    const totalBasePrice =
      products.reduce((total, { price, igst }) => {
        const rate = parseFloat(String(igst).replace('%', ''));
        return total + (price * 100) / (100 + rate);
      }, 0) + parseFloat(paymentGatewayWithoutGST || 0);

    const tdsoncommission = (totalBasePrice * 0.1) / 100;
    const tcsoncommission = (totalBasePrice * 0.5) / 100;

    const afterComissionandCharges =
      calculatedTotalCartValue +
      onlinePaymentChargew -
      (totalListingComm +
        totalProductComm +
        totalShippingComm +
        totalFixedComm +
        gstoncommission +
        paymentGatewayWithoutGST +
        tdsoncommission +
        tcsoncommission);

    const billedProducts = products.map((product) => ({
      variantName: product.variantId.variantName,
      qty: product.quantity,
      productName: product.productId.fullName,
      price: product.iprice,
      gst: product.igst,
      discount: product.idiscount,
    }));

    const { data: createthebill } = await CreateBill({
      variables: {
        packedId: packageIdentifier,
        billedProducts,
        listingComm: parseFloat(totalListingComm.toFixed(2)),
        productComm: parseFloat(totalProductComm.toFixed(2)),
        shippingComm: parseFloat(totalShippingComm.toFixed(2)),
        fixedComm: parseFloat(totalFixedComm.toFixed(2)),
        paymentGateway: parseFloat(onlinePaymentChargew.toFixed(2)),
        tds: parseFloat(tdsoncommission.toFixed(2)),
        tcs: parseFloat(tcsoncommission.toFixed(2)),
        gstComm: parseFloat(gstoncommission.toFixed(2)),
        orderAmount: parseFloat((calculatedTotalCartValue + onlinePaymentChargew).toFixed(2)),
        settlementAmount: parseFloat(afterComissionandCharges.toFixed(2)),
        orderId: orderDetailData?.getSingleOrderForseller?.id,
      },
    });

    if (createthebill?.createBill?.billNumber) {
      createInvoice(item1, createthebill?.createBill?.billNumber, createthebill?.createBill?.createdAt);
    }
  };

  const handlecommissionModal = (pkage) => {
    try {
      if (pkage) {
        const { products } = pkage;
        const { totalListingComm, totalProductComm, totalFixedComm, totalPaymentGateway } = handlecommission(products);
        const totalShippingComm = 0;
        const calculatedTotalCartValue = products.reduce((total, product) => total + product.price, 0);
        const payGTYPer = orderDetailData?.getSingleOrderForseller?.onlinePaymentChargePercentage;
        const onlinePaymentChargew = (calculatedTotalCartValue * payGTYPer) / 100;

        setpackageTotalValue(calculatedTotalCartValue);
        setListingComm(totalListingComm);
        setProductComm(totalProductComm);
        setShippingComm(totalShippingComm);
        setFixedComm(totalFixedComm);
        setPaymentGateway(onlinePaymentChargew);

        const totalComission = totalListingComm + totalProductComm + totalShippingComm + totalFixedComm;
        const paymentGatewayWithoutGST = onlinePaymentChargew / 1.18;

        const gstoncommission = (totalComission + paymentGatewayWithoutGST) * 0.18;
        const totalBasePrice =
          products.reduce((total, { price, igst }) => {
            const rate = parseFloat(String(igst).replace('%', ''));
            return total + (price * 100) / (100 + rate);
          }, 0) + parseFloat(paymentGatewayWithoutGST || 0);

        const tdsoncommission = (totalBasePrice * 0.1) / 100;
        const tcsoncommission = (totalBasePrice * 0.5) / 100;
        const afterComissionandCharges =
          calculatedTotalCartValue + onlinePaymentChargew - (totalComission + gstoncommission + paymentGatewayWithoutGST + tdsoncommission + tcsoncommission);
        setAfterCommissionValue(afterComissionandCharges);

        setChargesoncommission((prevData) => ({
          ...prevData,
          gst: gstoncommission,
          tds: tdsoncommission,
          tcs: tcsoncommission,
        }));
      }
      setProductForCommission(pkage);
      setCommissionModal(true);
    } catch (error) {
      toast.error(error.message || 'some went wrong !');
      console.error(error);
    }
  };

  const rawDate = orderDetailData?.getSingleOrderForseller?.createdAt;
  const orderDate = rawDate ? moment(parseInt(rawDate, 10)).format('YYYY-MM-DD') : '';
  const todayDate = moment().format('YYYY-MM-DD');
  const minDate = moment(orderDate).isAfter(todayDate) ? todayDate : orderDate;

  return (
    <>
      {packageIdentifier1.length > 0 &&
        packageIdentifier1.map((pakage, index) => (
          <Row className="g-2 mb-3" key={index}>
            <Col>
              <Card>
                <div className="h-100 m-2">
                  <Row>
                    {pakage?.products.length > 0 && (
                      <div className="d-flex justify-content-around bg-primary rounded-top p-2">
                        <div className="text-white col text-start "> {pakage?.products[0].locationId?.sellerId?.companyName}</div>
                        <div className="text-white float-end  px-2"> {pakage.products[0].productStatus}</div>
                        <div>
                          {!pakage.products[0].packedImage && (
                            <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Upload Packed Image</Tooltip>}>
                              <div className="small  float-end">
                                <Button
                                  onClick={() => uploadPackedImage(pakage)}
                                  className="btn-link border p-1 btn btn-white  btn btn-primary btn btn-primary"
                                >
                                  Upload Packed Image
                                </Button>
                              </div>
                            </OverlayTrigger>
                          )}
                        </div>
                      </div>
                    )}
                  </Row>
                  <Row className="g-0 mb-4 mt-1">
                    {pakage?.products.length > 0 && (
                      <div className="bg-white p-2">
                        <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Print Shipping Slip </Tooltip>}>
                          <div className="small  float-end">
                            <Button onClick={downloadShippingSlipPDF} className="btn-link border p-1 btn btn-white  btn btn-primary btn btn-primary">
                              Print Shipping Slip
                            </Button>
                          </div>
                        </OverlayTrigger>
                        <div>
                          <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Download Invoice</Tooltip>}>
                            <div className="small me-2 float-end">
                              <Button onClick={() => downloadInvoice(pakage)} className="btn-link border p-1 btn btn-white  btn btn-primary btn btn-primary">
                                Download Invoice
                              </Button>
                            </div>
                          </OverlayTrigger>
                        </div>
                      </div>
                    )}
                  </Row>
                  <ItemTraking tracking={pakage.products[0]} />
                  <Row className="g-0 pt-2 mt-4">
                    {pakage?.products.length > 0 &&
                      pakage.products.map((cart, index1) => (
                        <Row key={index1} className="g-0 mb-2 border-top pt-2">
                          <Col xs="auto">
                            <img
                              src={cart.productId.thumbnail || (cart.productId.images.length > 0 && cart.productId.images[0])}
                              className="rounded-md sw-10 img-thumbnail"
                              alt={cart.productId.fullName}
                            />
                          </Col>
                          <Col>
                            <div className="ps-4 pt-0 pb-0 pe-0 h-100">
                              <Row className="g-0 align-items-start align-content-center">
                                <Col xs="12" className="d-flex flex-column text-truncate">
                                  <div>
                                    {cart.productId.brand_name} : {cart.productId.fullName} {cart.variantId.variantName}
                                  </div>
                                </Col>
                                <Col xs="12" className="d-flex flex-column mb-md-0 ">
                                  <Row className="g-0">
                                    <Col xs="9" className="d-flex flex-row pe-2 align-items-end text-alternate">
                                      <div className="small text-dark">
                                        {' '}
                                        Price : ₹ {(cart.iprice + cart.iextraCharge - ((cart.iprice + cart.iextraCharge) * cart.idiscount) / 100).toFixed(2)}
                                        {cart.itransportCharge === '0' ? null : (
                                          <span>
                                            {' '}
                                            <br /> {cart.itransportChargeType} : ₹ {cart.itransportCharge}{' '}
                                          </span>
                                        )}
                                        <br />
                                        Qty : {cart.quantity}
                                      </div>
                                    </Col>
                                    <Col xs="3" className="d-flex flex-row fw-bold align-items-end justify-content-end text-alternate">
                                      <span className="text-dark">₹ {cart.price}</span>
                                    </Col>
                                  </Row>
                                </Col>
                              </Row>
                            </div>
                          </Col>
                        </Row>
                      ))}

                    <div className="bg-white py-2 border-top mt-2">
                      <div className="small me-2">
                        <Button onClick={() => handlecommissionModal(pakage)} className="btn-link border p-1 btn btn-white btn btn-primary btn btn-primary">
                          Commission Details
                        </Button>
                      </div>
                    </div>
                  </Row>
                </div>
              </Card>
            </Col>
          </Row>
        ))}
      {packedproductsforuploadimage && uploadpkdImgmodal && (
        <Modal show={uploadpkdImgmodal} onHide={() => setUploadpkdImgmodal(false)}>
          <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
            <Modal.Title className="fs-6 fw-bold text-dark">Packed Image Upload</Modal.Title>
          </Modal.Header>
          <Modal.Body className="mx-2 my-2 px-2 py-2">
            <Form onSubmit={submituploadImage}>
              <div className="mb-3">
                <div className="fw-bold pb-1">Packing Image</div>
                <Form.Control type="file" accept="image/*" name="file" onChange={handleChange} />
                {formErrors.file && <div className="mt-1 text-danger">{formErrors.file}</div>}
              </div>
              <div className="mb-3">
                <div className="fw-bold pb-1">Packing Date</div>
                <Form.Control type="date" name="packedDate" onChange={handleChange} min={minDate} max={todayDate} />
                {formErrors.packedDate && <div className="mt-1 text-danger">{formErrors.packedDate}</div>}
              </div>
              <div className="mb-3">
                {packedproductsforuploadimage?.products.length > 0 && (
                  <>
                    {formErrors.productlist && <div className="mt-1 text-danger">{formErrors.productlist}</div>}
                    <table className="table">
                      <thead>
                        <tr>
                          <th scope="col">Product</th>
                        </tr>
                      </thead>
                      <tbody>
                        {packedproductsforuploadimage.products.map((product, index) => (
                          <tr key={index}>
                            <td>
                              <div className="d-flex align-items-center">
                                {index + 1}. {'  '}
                                <div className="ps-3">
                                  {product.productId.fullName} {product.variantId.variantName}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
              <div className="d-flex justify-content-center mt-4">{loading ? <Button>Loading</Button> : <Button type="submit">Submit</Button>}</div>
            </Form>
          </Modal.Body>
        </Modal>
      )}

      {commissionModal && productForCommissions && (
        <Modal size="lg" show={commissionModal} onHide={() => setCommissionModal(false)}>
          <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
            <Modal.Title className="fw-bold">Commission Detail</Modal.Title>
          </Modal.Header>
          <Modal.Body className="mx-2 my-2 px-2 py-2">
            <div className="table-responsive">
              <table className="table-bordered border-dark table align-middle">
                <thead className="bg-light">
                  <tr>
                    <th>Product Name</th>
                    <th className="text-center">
                      Sale Commission Fee
                      <div className="text-small w-100">(Amount Based)</div>{' '}
                    </th>
                    <th className="text-center">
                      Listing Fee <div className="text-small w-100">(Qty Based)</div>{' '}
                    </th>
                    <th className="text-center">
                      Fixed Closing Fee <div className="text-small w-100">(Per Product Fixed)</div>{' '}
                    </th>
                    <th className="text-center">
                      Shipping Fee <div className="text-small w-100">(Qty Based)</div>{' '}
                    </th>
                    <th className="text-center">Product Sales Amount </th>
                  </tr>
                </thead>
                <tbody className="table-group-divider">
                  {productForCommissions.products.map((product, index) => {
                    return (
                      <tr key={index} className="text-end">
                        <td className="text-start small">
                          {product.productId.fullName} {product.variantId.variantName}
                          <div className="text-dark"> Brand Name : {product.productId.brand_name}</div>
                        </td>
                        <td className="text-center">
                          {/* eslint-disable-next-line no-nested-ternary */}₹
                          {product.productId.productComm
                            ? product.productId.productCommType === 'fix'
                              ? product.productId.productComm * product.quantity
                              : ((product.price * product.productId.productComm) / 100).toFixed(2)
                            : 0}
                          <div className="text-muted small w-100">{product.productId.productComm}%</div>
                        </td>
                        <td className="text-center">
                          {/* eslint-disable-next-line no-nested-ternary */}₹
                          {product.productId.listingComm
                            ? product.productId.listingCommType === 'fix'
                              ? product.productId.listingComm * product.quantity
                              : (((product.price / product.quantity) * product.productId.listingComm) / 100).toFixed(2)
                            : 0}
                          <div className="text-muted small w-100">₹{product.productId.listingComm}</div>
                        </td>
                        <td className="text-center">
                          {/* eslint-disable-next-line no-nested-ternary */}
                          {product.productId.fixedComm
                            ? product.productId.fixedCommType === 'fix'
                              ? product.productId.fixedComm
                              : ((product.price * product.productId.fixedComm) / 100).toFixed(2)
                            : 0}

                          <div className="text-muted small w-100">₹{product.productId.fixedComm}</div>
                        </td>
                        <td className="text-center">
                          {/* eslint-disable-next-line no-nested-ternary */}₹{' '}
                          {product.productId.shippingComm
                            ? product.productId.shippingCommType === 'fix'
                              ? product.productId.shippingComm * product.quantity
                              : ((product.price * product.productId.shippingComm) / 100).toFixed(2)
                            : 0}
                          <div className="text-muted small w-100">{product.productId.shippingComm}%</div>
                        </td>
                        <td className="text-center w-20">₹ {product.price}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="text-dark">
                  <tr className="mark">
                    <th className="text-start">Total</th>
                    <td className="text-center fw-bold"> ₹ {productComm1.toFixed(2)}</td>
                    <td className="text-center fw-bold"> ₹ {listingComm1.toFixed(2)}</td>
                    <td className="text-center fw-bold"> ₹ {fixedComm1.toFixed(2)}</td>
                    <td className="text-center fw-bold">₹ {shippingComm1.toFixed(2)}</td>
                    <td className="text-center fw-bold">₹ {packageTotalValue.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <th colSpan="5">Payment Gateway Charge</th>
                    <td className="text-center"> ₹ {paymentGateway1.toFixed(2)}</td>
                  </tr>
                  <tr className="mark">
                    <th className="fw-bold" colSpan="5">
                      Total Product Amount + Payment Gateway Charge (Amount Paid by Customer)
                    </th>
                    <td className="fw-bold text-center"> ₹ {(packageTotalValue + paymentGateway1).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <th colSpan="5">Total Commission</th>
                    <td className="fw-bold text-center"> ₹ - {(listingComm1 + fixedComm1 + productComm1 + shippingComm1).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <th colSpan="5">Payment Gateway Charge (Deducted)</th>
                    <td className="fw-bold text-center">₹ - {(paymentGateway1 / 1.18).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <th colSpan="5">GST 18% on (Product Sales Amount + Payment Gateway Charge)</th>
                    <td className="fw-bold text-center">₹ - {chargesoncommission.gst.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <th colSpan="5">TDS (0.1%)</th>
                    <td className="fw-bold text-center">₹ - {chargesoncommission.tds.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <th colSpan="5">TCS (0.5%)</th>
                    <td className="fw-bold text-center">₹ - {chargesoncommission.tcs.toFixed(2)}</td>
                  </tr>
                  <tr className="mark">
                    <th className="fw-bold" colSpan="5">
                      Amount Receivable after Commission and Tax Deduction
                    </th>
                    <td className="fw-bold text-center">₹ {afterCommissionValue.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Modal.Body>
        </Modal>
      )}

      {shippingAddress1 && (
        <div className="p-4" style={{ display: 'none' }}>
          <div className="bg-white fw-bold p-6" ref={componentRef}>
            <div className="fw-bold pt-2 text-center fs-5">{storeName}</div>
            <div className="p-2 pt-0 fw-bold text-center">(Registered Parcel)</div>
            <div className="p-2 fw-bold">
              <span className="fw-bold">To, </span>
              <br />
              {`${shippingAddress1.firstName}${shippingAddress1.lastName ? ` ${shippingAddress1.lastName}` : ''}`} <br />
              {`${shippingAddress1.addressLine1},  ${shippingAddress1.addressLine2}`}
              <br />
              {`${shippingAddress1.city}, ${shippingAddress1.postalCode},  ${shippingAddress1.state}`}
              <br />
              {`Mobile Number - ${shippingAddress1.mobileNo}`}
              {shippingAddress1.mobileNo && <span>, {shippingAddress1.altrMobileNo}</span>}
            </div>
            {sellerDetails && (
              <div className="p-2 fw-bold">
                <span className="fw-bold">From, </span>
                <br />
                {sellerDetails.companyName}
                <br />
                {`${sellerDetails.address}`}
                <br />
                {`${sellerDetails.address2}`}
                <br />

                {`${sellerDetails.city}, ${sellerDetails.pincode},  ${sellerDetails.state}`}
                <br />
                {`Mobile Number - ${sellerDetails.mobileNo}`}
              </div>
            )}
            <div className="p-2 mt-2 border fw-bold border-dark text-center">PLEASE RECORD A VIDEO WHILE OPENING.</div>
          </div>
        </div>
      )}
    </>
  );
}

export default withRouter(Tabbed);
