import React, { useRef, useState, useEffect } from 'react';
import HtmlHead from 'components/html-head/HtmlHead';
import { NavLink } from 'react-router-dom';
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import { useReactToPrint } from 'react-to-print';
import { Table, Form, Row, Col, Card } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { toast } from 'react-toastify';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import StoreFeatures from 'globalValue/storeFeatures/StoreFeatures';
import { GET_SELLER } from 'views/admin/Seller/Detail/DetailSeller';
import { GENERATE_COMMISSION_BILL } from 'views/admin/Seller/Commission/Commission';
import { monthsList } from 'views/admin/Seller/Commission/handlecommission';
import GetData from 'views/admin/Seller/Commission/GetData';

const GET_SELLER_BILL = gql`
  query GetSellerBillWithDate($year: Int, $month: Int, $sellerId: ID) {
    getSellerBillWithDate(year: $year, month: $month, sellerId: $sellerId) {
      id
      listingComm
      productComm
      packedID
      shippingComm
      fixedComm
      paymentGateway
      billNumber
      createdAt
    }
  }
`;

const pageStyle = `
@media print {
  thead { display: table-header-group; }
  tfoot { display: table-footer-group; }
}
`;

const getLastDateOfMonth = ({ month, year }) => {
  const input = `${month}-${year.slice(2)}`;
  const output = moment(input, 'MM-YY');
  const endDate = output.endOf('month').format('LL');
  return endDate;
};
function Commission() {
  const { currentUser } = useSelector((state) => state.auth);

  const [id, setid] = useState(null);
  useEffect(() => {
    if (currentUser?.seller) {
      const { seller } = currentUser;

      const { id: id1 } = seller;

      setid(id1);
    }
  }, [currentUser]);

  const title = 'Commission';
  const description = 'Ecommerce Commission Page';

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const componentPDF = useRef();
  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    documentTitle: 'Commission',
    pageStyle,
  });

  // data

  const { getimage } = GetData();
  const storeFeaturess = StoreFeatures();

  const [sellerDetails, setsellerDetails] = useState(null);
  const [addressofSeller, setAddressofSeller] = useState(null);

  const [GetSeller] = useLazyQuery(GET_SELLER, {
    variables: {
      getSellerId: id,
    },
    onCompleted: (res) => {
      setsellerDetails(res.getSeller);
    },
    onError: (error) => {
      console.error('GET_SELLER', error.message);
    },
  });

  const [GenerateSellerBill] = useMutation(GENERATE_COMMISSION_BILL, {
    onError: (error) => {
      console.error('GENERATE_COMMISSION_BILL', error.message);
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      await GetSeller();
    };
    fetchData();
  }, [GetSeller]);

  // handle address
  useEffect(() => {
    function isJsonString(str) {
      try {
        JSON.parse(str);
      } catch (e) {
        return false;
      }
      return true;
    }

    if (sellerDetails) {
      if (isJsonString(sellerDetails.address)) {
        const address1 = sellerDetails?.address;
        if (address1) {
          setAddressofSeller(JSON.parse(address1));
        }
      }
    }
  }, [sellerDetails]);

  const printvalue = () => {
    generatePDF();
  };

  const [timePeriod, settimePeriod] = useState({ month: '', year: '' });

  const [billList, setBillList] = useState([]);
  const [invoiceDate, setInvoiceDate] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    settimePeriod((prev) => ({ ...prev, [name]: value }));
  };

  const [GetSellerBillWithDate] = useLazyQuery(GET_SELLER_BILL, {
    onError: (error) => {
      console.error('GET_SELLER_BILL', error);
    },
  });

  // handle commission

  const [listingComm1, setListingComm] = useState(0);
  const [productComm1, setProductComm] = useState(0);
  const [shippingComm1, setShippingComm] = useState(0);
  const [fixedComm1, setFixedComm] = useState(0);
  const [paymentGateway1, setPaymentGateway] = useState(0);
  const [totalFeeAmount, setTotalFeeAmount] = useState(0);
  const [totalTaxAmount, setTotalTaxAmount] = useState(0);

  const [totalCommission, setTotalCommission] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!parseInt(timePeriod.year, 10) || !parseInt(timePeriod.month, 10)) {
        throw new Error('Please select both Month and Year');
      }
      if (timePeriod.year.length < 4) {
        throw new Error('year should be 4 digit!');
      }

      setLoading(true);
      const { data: data2 } = await GetSellerBillWithDate({
        variables: {
          year: parseInt(timePeriod.year, 10),
          month: parseInt(timePeriod.month, 10),
          sellerId: id,
        },
      });

      if (data2?.getSellerBillWithDate.length > 0) {
        setBillList(data2.getSellerBillWithDate);
        const getInvoiceDate = await getLastDateOfMonth(timePeriod);
        setInvoiceDate(getInvoiceDate);

        const { data: data3 } = await GenerateSellerBill({
          variables: {
            sellerid: id,
            invoicedate: getInvoiceDate,
          },
        });
        if (data3) {
          setInvoiceNumber(data3?.generateSellerBill?.billNumber);
        }
        const commission = data2.getSellerBillWithDate.map(({ listingComm, productComm, shippingComm, fixedComm, paymentGateway }) => ({
          listingComm,
          productComm,
          shippingComm,
          fixedComm,
          paymentGateway,
        }));

        const totalListingCommDate = commission.reduce((total, item) => total + item.listingComm, 0);
        const totalProductCommDate = commission.reduce((total, item) => total + item.productComm, 0);
        const totalShippingCommDate = commission.reduce((total, item) => total + item.shippingComm, 0);
        const totalFixedCommDate = commission.reduce((total, item) => total + item.fixedComm, 0);
        const totalPaymentGatewayDate = commission.reduce((total, item) => total + item.paymentGateway / 1.18, 0);

        setListingComm(totalListingCommDate);
        setProductComm(totalProductCommDate);
        setShippingComm(totalShippingCommDate);
        setFixedComm(totalFixedCommDate);
        setPaymentGateway(totalPaymentGatewayDate);

        const total = totalListingCommDate + totalProductCommDate + totalShippingCommDate + totalFixedCommDate + totalPaymentGatewayDate; // 🆕 include
        setTotalFeeAmount(total);
        setTotalTaxAmount(total * 0.18);
        setTotalCommission(total + total * 0.18);
        generatePDF();
      } else {
        setBillList([]);
        toast.error('No result found for the selected Month and Year.');
      }
      setLoading(false);
    } catch (error) {
      toast.error(error.message || 'something went wrong');
      setLoading(false);
    }
  };

  return (
    <>
      <HtmlHead title={title} description={description} />

      <div className="page-title-container mb-4">
        <Row className="align-items-center">
          <Col xs="auto" className="me-auto">
            <NavLink className="muted-link pb-1 d-inline-flex align-items-center breadcrumb-back" to="/seller/dashboard">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Dashboard</span>
            </NavLink>
            <h1 className="display-6 fw-bold mb-0">{title}</h1>
          </Col>
        </Row>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              {/* Month */}
              <Col md={6}>
                <Form.Group controlId="month">
                  <Form.Label className="fw-semibold">Month</Form.Label>
                  <Form.Select name="month" value={timePeriod.month} onChange={handleDateChange}>
                    <option hidden value="">
                      Select Month Name
                    </option>
                    {monthsList.map((month, i) => (
                      <option key={i} value={i + 1}>
                        {month.monthname}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Year */}
              <Col md={6}>
                <Form.Group controlId="year">
                  <Form.Label className="fw-semibold">
                    Year <small className="text-muted">(4 digit)</small>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="year"
                    placeholder="Enter year"
                    value={timePeriod.year}
                    onChange={(e) => {
                      if (e.target.value.length > 4) return;
                      handleDateChange(e);
                    }}
                  />
                </Form.Group>
              </Col>

              {/* Submit */}
              <Col xs={12} className="text-center mt-4">
                {loading ? (
                  <button type="button" className="btn btn-primary btn-lg px-5" disabled>
                    {/* <span className="spinner-border spinner-border-sm me-2"></span> */}
                    Loading...
                  </button>
                ) : (
                  <button type="submit" className="btn btn-success btn-lg px-5">
                    {/* <i className="bi bi-check-circle me-2"></i> */}
                    Submit
                  </button>
                )}
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <div ref={componentPDF} className="p-5 d-none d-print-block">
        <div>
          <div className="d-flex align-items-center justify-content-between">
            <div className="w-30">{getimage && <img src={getimage} style={{ mixBlendMode: 'darken', height: '70px' }} alt="logo" />}</div>
            <div>
              <div className="fw-bold fs-4 text-end">
                {' '}
                Tax Invoice <br />
              </div>
              <div className="fs-6">(Original for Recipient)</div>
            </div>
          </div>
          <div className="d-flex align-items-center mt-4 justify-content-between">
            {storeFeaturess && (
              <div className="w-50">
                <div>{storeFeaturess.storeBusinessName}</div>
                <div>
                  {storeFeaturess.storeBusinessAddress}, {storeFeaturess.storeBusinessCity}, {storeFeaturess.storeBusinessState}
                </div>
                <div>Website: {storeFeaturess.storeName}</div>
              </div>
            )}

            <div className="w-50">
              {invoiceDate && <div className="float-end">Invoice Date : {invoiceDate} </div>}
              {invoiceNumber && <div className="float-end">Invoice Number : {invoiceNumber} </div>}
            </div>
          </div>
          <div className="mt-4">
            {storeFeaturess && (
              <>
                <div>PAN No. : {storeFeaturess.storeBusinessPanNo} </div>
                <div>GST No. : {storeFeaturess.storeBusinessGstin} </div>
                {/* <div>CIN No. : {storeFeaturess.storeBusinessCinNo} </div> */}
              </>
            )}
          </div>
          <hr className="border" />
          <div className="fw-bold"> Bill To </div>
          <div className="mb-4">
            {sellerDetails && (
              <>
                <div>Name: {sellerDetails.companyName} </div>
                <div>
                  Address: {sellerDetails.fullAddress}, {sellerDetails.city}, {sellerDetails.state}, {sellerDetails.pincode}{' '}
                </div>
                <div>Mobile No.: {sellerDetails.mobileNo} </div>
                <div>Email: {sellerDetails.email} </div>
                <div>GST No.: {sellerDetails.gstin} </div>
              </>
            )}
          </div>
        </div>
        <div className="p-0">
          <Table bordered>
            <thead className="bg-light">
              <tr>
                <th>Sr. No.</th>
                <th>Category of service </th>
                <th>Description of service</th>
                <th>Tax Rate </th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {[
                { no: 1, hsn: '996812', comm: 'Sale Comm. Fee', commAmount: productComm1 },
                { no: 2, hsn: '998599', comm: 'Listing Fee', commAmount: listingComm1 },
                { no: 3, hsn: '998599', comm: 'Fixed Closing Fee', commAmount: fixedComm1 },
                { no: 4, hsn: '996812', comm: 'Shipping Fee', commAmount: shippingComm1 },
                { no: 5, hsn: '997159', comm: 'Payment Gateway Fee', commAmount: paymentGateway1 }, // 🆕
              ].map((obj) => (
                <tr key={obj.no}>
                  <td>{obj.no}</td>
                  <td> {obj.hsn}</td>
                  <td className="p-0">
                    <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                      {' '}
                      {obj.comm}{' '}
                    </div>
                    <div className="p-1">GST</div>
                  </td>
                  <td className="p-0">
                    <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                      <br />
                    </div>
                    <div className="p-1 text-center">18%</div>
                  </td>
                  <td className="p-0 text-end">
                    <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                      INR {obj.commAmount.toFixed(2)}{' '}
                    </div>
                    <div className="p-1">INR {(obj.commAmount * 0.18).toFixed(2)} </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Table bordered className="mb-6">
            <tfoot>
              <tr>
                <th colSpan={4} className="text-end">
                  Total Commission
                </th>
                <td className="text-end"> INR {totalFeeAmount.toFixed(2)}</td>
              </tr>
              <>
                {sellerDetails?.state === storeFeaturess?.storeBusinessState ? (
                  <>
                    <tr>
                      <th colSpan={4} className="text-end">
                        CGST
                      </th>
                      <td className="text-end">INR {(totalTaxAmount / 2).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <th colSpan={4} className="text-end">
                        SGST
                      </th>
                      <td className="text-end">INR {(totalTaxAmount / 2).toFixed(2)}</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <th colSpan={4} className="text-end">
                      IGST
                    </th>
                    <td className="text-end">INR {totalTaxAmount.toFixed(2)}</td>
                  </tr>
                )}
              </>
              {/* <tr>
                <th colSpan={4} className="text-end">
                  TDS(1%)
                </th>
                <td> INR {(totalFeeAmount * 0.01).toFixed(2)}</td>
              </tr>
              <tr>
                <th colSpan={4} className="text-end">
                  TCS(1%)
                </th>
                <td> INR {(totalFeeAmount * 0.01).toFixed(2)}</td>
              </tr> */}
              <tr>
                <th colSpan={4} className="text-end">
                  Gross Total
                </th>
                {/* <td> INR {(totalFeeAmount + totalTaxAmount + totalFeeAmount * 0.02).toFixed(2)}</td> */}
                <td className="text-end"> INR {(totalFeeAmount + totalTaxAmount).toFixed(2)}</td>
              </tr>
            </tfoot>
          </Table>
          <div className="alert alert-info fw-bold">Details of Fees to the above Tax Invoice</div>
          <Table bordered>
            <thead className="bg-light">
              <tr>
                <th>Sr. No.</th>
                <th>Date</th>
                <th>Invoice No. </th>
                <th>Description of service</th>
                <th>Tax Rate </th>
                <th>Fee Amount</th>
                <th>Tax Amount</th>
              </tr>
            </thead>
            <tbody>
              {billList
                .slice(0)
                .reverse()
                .map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{moment(parseInt(item.createdAt, 10)).format('ll')}</td>
                    <td>{item.billNumber}</td>
                    <td className="w-30 p-0">
                      <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                        Sale Comm. Fee
                      </div>
                      <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                        GST
                      </div>
                      <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                        Listing Fee
                      </div>
                      <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                        GST
                      </div>
                      <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                        Fixed Closing Fee
                      </div>
                      <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                        GST
                      </div>
                      <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                        Shipping Fee
                      </div>
                      <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                        GST
                      </div>
                      <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                        Payment Gateway Fee
                      </div>
                      <div className="p-1">GST</div>
                    </td>
                    <td className="p-0">
                      <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                        <br />
                      </div>
                      <div className="p-1 text-center" style={{ borderBottom: '1px solid #000' }}>
                        18%
                      </div>
                      <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                        <br />
                      </div>
                      <div className="p-1 text-center" style={{ borderBottom: '1px solid #000' }}>
                        18%
                      </div>
                      <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                        <br />
                      </div>
                      <div className="p-1 text-center" style={{ borderBottom: '1px solid #000' }}>
                        18%
                      </div>
                      <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                        <br />
                      </div>
                      <div className="p-1 text-center" style={{ borderBottom: '1px solid #000' }}>
                        18%
                      </div>
                      <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                        <br />
                      </div>
                      <div className="p-1 text-center">18%</div>
                    </td>
                    <td className="p-0">
                      <div className="p-1 text-center" style={{ borderBottom: '1px solid #000' }}>
                        {item.productComm.toFixed(2)}
                      </div>
                      <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                        <br />
                      </div>
                      <div className="p-1 text-center" style={{ borderBottom: '1px solid #000' }}>
                        {item.listingComm.toFixed(2)}
                      </div>
                      <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                        <br />
                      </div>
                      <div className="p-1 text-center" style={{ borderBottom: '1px solid #000' }}>
                        {item.fixedComm.toFixed(2)}
                      </div>
                      <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                        <br />
                      </div>
                      <div className="p-1 text-center" style={{ borderBottom: '1px solid #000' }}>
                        {item.shippingComm.toFixed(2)}
                      </div>
                      <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                        <br />
                      </div>
                      <div className="p-1 text-center" style={{ borderBottom: '1px solid #000' }}>
                        {(item.paymentGateway / 1.18).toFixed(2)}
                      </div>
                      <div className="p-1">
                        <br />
                      </div>
                    </td>
                    <td className="p-0">
                      <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                        <br />
                      </div>
                      <div className="p-1 text-center" style={{ borderBottom: '1px solid #000' }}>
                        {(item.productComm * 0.18).toFixed(2)}
                      </div>
                      <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                        <br />
                      </div>
                      <div className="p-1 text-center" style={{ borderBottom: '1px solid #000' }}>
                        {(item.listingComm * 0.18).toFixed(2)}
                      </div>
                      <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                        <br />
                      </div>
                      <div className="p-1 text-center" style={{ borderBottom: '1px solid #000' }}>
                        {(item.fixedComm * 0.18).toFixed(2)}
                      </div>
                      <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                        <br />
                      </div>
                      <div className="p-1 text-center" style={{ borderBottom: '1px solid #000' }}>
                        {(item.shippingComm * 0.18).toFixed(2)}
                      </div>
                      <div className="p-1" style={{ borderBottom: '1px solid #000' }}>
                        <br />
                      </div>
                      <div className="p-1 text-center">{((item.paymentGateway / 1.18) * 0.18).toFixed(2)}</div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>

          <Table bordered>
            <tfoot>
              <tr>
                <th colSpan={4} className="text-end">
                  Total Commission
                </th>
                <td className="text-end"> INR {totalFeeAmount.toFixed(2)}</td>
              </tr>
              <>
                {sellerDetails?.state === storeFeaturess?.storeBusinessState ? (
                  <>
                    <tr>
                      <th colSpan={4} className="text-end">
                        CGST
                      </th>
                      <td className="text-end">INR {(totalTaxAmount / 2).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <th colSpan={4} className="text-end">
                        SGST
                      </th>
                      <td className="text-end">INR {(totalTaxAmount / 2).toFixed(2)}</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <th colSpan={4} className="text-end">
                      IGST
                    </th>
                    <td className="text-end">INR {totalTaxAmount.toFixed(2)}</td>
                  </tr>
                )}
              </>
              {/* <tr>
                <th colSpan={4} className="text-end">
                  TDS(1%)
                </th>
                <td> INR {(totalFeeAmount * 0.01).toFixed(2)}</td>
              </tr>
              <tr>
                <th colSpan={4} className="text-end">
                  TCS(1%)
                </th>
                <td> INR {(totalFeeAmount * 0.01).toFixed(2)}</td>
              </tr> */}
              <tr>
                <th colSpan={4} className="text-end">
                  Gross Total
                </th>
                {/* <td> INR {(totalFeeAmount + totalTaxAmount + totalFeeAmount * 0.02).toFixed(2)}</td> */}
                <td className="text-end"> INR {(totalFeeAmount + totalTaxAmount).toFixed(2)}</td>
              </tr>
            </tfoot>
          </Table>
          <div className="alert alert-info mt-3">
            <strong>Please note:</strong> This invoice is not a demand for payment. <br />
            You can access your <strong>Account Summary</strong> at any time to view your account details.
          </div>
        </div>
      </div>

      <>
        <div className="container my-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white text-dark d-flex align-items-center justify-content-between">
              <h5 className="mb-0">Commission (Ecommerce Commission Page) — Guide</h5>
              <span className="badge bg-warning text-dark">v1.0</span>
            </div>

            <div className="card-body">
              <ol className="list-group">
                <li className="list-group-item">
                  <h6 className="fw-bold mb-2">1) How to reach the page</h6>
                  <p className="mb-0">
                    Go to Seller Dashboard → <span className="badge bg-secondary">Monthly Commission</span>.
                  </p>
                </li>

                {/* <!-- 2) Select Month and Year --> */}
                <li className="list-group-item">
                  <h6 className="fw-bold mb-2">2) Select Month and Year</h6>

                  {/* <!-- Demo UI (for display only) --> */}
                  <div className="row g-2 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label mb-1">Month</label>
                      <div className="input-group">
                        <span className="input-group-text">📅</span>
                        <select className="form-select" disabled>
                          <option selected>Select a month…</option>
                        </select>
                      </div>
                      <div className="form-text">Choose a month from the dropdown.</div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label mb-1">Year</label>
                      <div className="input-group">
                        <span className="input-group-text">🗓️</span>
                        <select className="form-select" disabled>
                          <option selected>Year (4 digit)</option>
                        </select>
                      </div>
                      <div className="form-text">Enter a 4-digit year (more than 4 digits will not be accepted).</div>
                    </div>
                  </div>

                  <div className="alert alert-info py-2 mb-0">
                    <strong>Tip:</strong> Do not submit if month or year is incorrect or incomplete — make sure both are set correctly first.
                  </div>
                </li>

                {/* <!-- 3) Submit --> */}
                <li className="list-group-item">
                  <h6 className="fw-bold mb-2">3) Submit</h6>
                  <p className="mb-2">
                    Click the Submit button. <span className="text-muted">Loading…</span> means data is being loaded.
                  </p>
                  {/* <!-- Demo button (for display only) --> */}
                  <button type="button" className="btn btn-primary btn-sm" disabled>
                    Submit
                  </button>
                </li>

                {/* <!-- 4) Result / Error --> */}
                <li className="list-group-item">
                  <h6 className="fw-bold mb-2">4) Result / Error</h6>

                  <div className="mb-3">
                    <span className="badge bg-success me-2">Records Found</span>
                    <ul className="mb-2">
                      <li>
                        The system automatically generates a <strong>Tax Invoice</strong>.
                      </li>
                      <li>
                        Your browser will open the <strong>Print dialog</strong> (you can Save as PDF or Print).
                      </li>
                      <li>
                        The invoice will have an auto-generated <em>Invoice Date</em> (last day of the month) and <em>Invoice Number</em>.
                      </li>
                    </ul>
                  </div>

                  <div className="mb-3">
                    <span className="badge bg-danger me-2">No Records Found</span>
                    <div className="alert alert-warning py-2 my-2">
                      A message will appear: <strong>“No result found for the selected Month and Year.”</strong>
                    </div>
                    <p className="mb-2">Try a different Month/Year.</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </>
    </>
  );
}

export default Commission;
