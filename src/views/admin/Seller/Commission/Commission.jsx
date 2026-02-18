import React, { useRef, useState, useEffect } from 'react';
import HtmlHead from 'components/html-head/HtmlHead';
import { useParams, Link, NavLink } from 'react-router-dom';
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import { useReactToPrint } from 'react-to-print';
import { Table, Form, Row, Col } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { toast } from 'react-toastify';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import StoreFeatures from 'globalValue/storeFeatures/StoreFeatures';
import GetData from './GetData';
import { monthsList } from './handlecommission';
import { GET_SELLER } from '../Detail/DetailSeller';
import gstCheck from './checkGst';

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
export const GENERATE_COMMISSION_BILL = gql`
  mutation GenerateSellerBill($sellerid: ID, $invoicedate: String) {
    generateSellerBill(sellerid: $sellerid, invoicedate: $invoicedate) {
      id
      billNumber
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
  const { id } = useParams();
  const title = 'Seller Commission';
  const description = 'Ecommerce Seller Commission Page';
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
      console.log('GET_SELLER', error.message);
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

  const [GetSellerBillWithDate, { data, refetch }] = useLazyQuery(GET_SELLER_BILL, {
    onError: (error) => {
      console.error('GET_SELLER_BILL', error);
    },
  });

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
        throw new Error('select the date!');
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
      <div className="page-title-container">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to={`/admin/seller/detail/${id}`}>
              <span className="align-middle text-dark ms-1">Sellers</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4 fw-bold" id="title">
              {title}
            </h1>
          </Col>
        </Row>
      </div>

      <Form onSubmit={handleSubmit}>
        <div className="row bg-white border rounded m-1 p-2 pt-4">
          <div className="col-6">
            <div className="mb-3">
              <Form.Label className="fw-bold text-dark">Select Month</Form.Label>
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
            </div>
          </div>
          <div className="col-6">
            <div className="mb-3">
              <Form.Label className="fFw-bold text-dark">Select Year (4 digit Number )</Form.Label>
              <Form.Control
                type="number"
                name="year"
                value={timePeriod.year}
                onChange={(e) => {
                  if (e.target.value.length > 4) {
                    return;
                  }
                  handleDateChange(e);
                }}
              />
            </div>
          </div>
          <div className="col-12 text-center my-2">
            {loading ? (
              <button type="button" className="btn btn-primary btn-lg">
                Loading
              </button>
            ) : (
              <button type="submit" className="btn btn-primary btn-lg">
                Submit
              </button>
            )}
          </div>
        </div>
      </Form>

      <div ref={componentPDF} className="p-5 bg-white m-1 rounded">
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
      {billList.length > 0 ? null : <div className="text-center text-danger fs-4">No Record</div>}
    </>
  );
}

export default Commission;
