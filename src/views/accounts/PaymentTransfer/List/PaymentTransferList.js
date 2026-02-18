import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Row, Col, Form, Pagination, Table, Spinner, Button, Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';

// ✅ Query: All Bills
const GET_ALL_BILLS = gql`
  query GetAllBills {
    getAllBills {
      id
      billNumber
      sellerId
      settlementAmount
      payment_status
      payment_mode
      transaction_ref_no
      transaction_date
      accounts_status
      listingComm
      productComm
      shippingComm
      fixedComm
      paymentGateway
      tds
      tcs
      gstComm
      orderAmount
    }
  }
`;

// ✅ Mutation: Update Bill Payment
const UPDATE_BILL_PAYMENT = gql`
  mutation UpdateBillPayment($id: ID!, $payment_status: String, $payment_mode: String, $transaction_ref_no: String, $transaction_date: String) {
    updateBillPayment(
      id: $id
      payment_status: $payment_status
      payment_mode: $payment_mode
      transaction_ref_no: $transaction_ref_no
      transaction_date: $transaction_date
    ) {
      id
      payment_status
      payment_mode
      transaction_ref_no
      transaction_date
    }
  }
`;

// ✅ Seller query (for name display)
const GET_SELLER = gql`
  query GetSeller($getSellerId: ID!) {
    getSeller(id: $getSellerId) {
      id
      companyName
    }
  }
`;

function ListSeller() {
  const title = 'Accounts ';
  const description = 'Accounts ';
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit] = useState(100);
  const [loading, setLoading] = useState(false);
  const [sellerNames, setSellerNames] = useState({});

  // ✅ Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  // ✅ Add states for Info Modal
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoBill, setInfoBill] = useState(null);

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const [getAllBills, { data, fetchMore, refetch }] = useLazyQuery(GET_ALL_BILLS);
  const [getSeller] = useLazyQuery(GET_SELLER);

  const [updateBillPayment] = useMutation(UPDATE_BILL_PAYMENT);

  useEffect(() => {
    setLoading(true);
    getAllBills().finally(() => setLoading(false));
  }, [getAllBills]);

  useEffect(() => {
    if (data?.getAllBills?.length > 0) {
      data.getAllBills.forEach(async (bill) => {
        if (bill.sellerId && !sellerNames[bill.sellerId]) {
          const res = await getSeller({ variables: { getSellerId: bill.sellerId } });
          if (res?.data?.getSeller) {
            setSellerNames((prev) => ({
              ...prev,
              [bill.sellerId]: res.data.getSeller.companyName,
            }));
          }
        }
      });
    }
  }, [data, getSeller]);

  // ✅ Page change
  const handlePageChange = (newOffset) => {
    setOffset(newOffset);
    fetchMore({
      variables: { offset: newOffset },
    });
  };

  // ✅ Update function
  const handleUpdate = async () => {
    try {
      await updateBillPayment({
        variables: {
          id: selectedBill.id,
          payment_status: selectedBill.payment_status,
          payment_mode: selectedBill.payment_mode,
          transaction_ref_no: selectedBill.transaction_ref_no,
          transaction_date: selectedBill.transaction_date,
        },
      });

      toast.success('Payment status updated successfully');
      setShowModal(false);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-2">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/accounts/dashboard">
              <span className="align-middle text-dark ms-1">Accounts Dashboard</span>
            </NavLink>
            <span className="text-dark text-small ps-2"> / </span>
            <span className="align-middle text-dark ms-1">Accounts Payment Transfer List</span>
          </Col>
        </Row>
      </div>

      <Row className="m-0 mb-2 p-1 rounded bg-white align-items-center">
        <Col md="6">
          <span className="fw-bold fs-5 ps-2 pt-2">Payment Transfer List</span>
          <span className="small ps-2">{data?.getAllBills ? `(${data.getAllBills.filter((bill) => bill.accounts_status === true).length})` : ''}</span>
        </Col>
        <Col md="6" className="d-flex justify-content-end">
          <div className="d-inline-block search-input-container border w-100 shadow bg-foreground position-relative">
            <Form.Control type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <span className="position-absolute top-50 end-0 translate-middle-y pe-3">
              <CsLineIcons icon="search" />
            </span>
          </div>
        </Col>
      </Row>

      <div className="table-responsive">
        <Table bordered hover className="align-middle bg-white">
          <thead>
            <tr>
              <th>SA Name</th>
              <th>Bill Number</th>
              <th>Settlement Amount</th>
              <th>Transaction Ref No</th>
              <th>Payment Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center">
                  <Spinner animation="border" />
                </td>
              </tr>
            ) : (
              <>
                {data?.getAllBills?.length > 0 ? (
                  data.getAllBills
                    .filter(
                      (bill) =>
                        bill.accounts_status === true &&
                        (sellerNames[bill.sellerId]?.toLowerCase().includes(search.toLowerCase()) ||
                          bill.billNumber?.toLowerCase().includes(search.toLowerCase()) ||
                          bill.transaction_ref_no?.toLowerCase().includes(search.toLowerCase()) ||
                          bill.payment_status?.toLowerCase().includes(search.toLowerCase()))
                    )
                    .slice()
                    .reverse()
                    .map((bill) => (
                      <tr key={bill.id}>
                        <td>{sellerNames[bill.sellerId] || bill.sellerId}</td>
                        <td>{bill.billNumber}</td>
                        <td>{Number(bill.settlementAmount).toFixed(2)}</td>
                        <td>{bill.transaction_ref_no}</td>
                        <td>
                          {{
                            Pending: <span className="text-warning">⏳ Pending</span>,
                            Processing: <span className="text-info">🔄 Processing</span>,
                            Success: <span className="text-success">✅ Success</span>,
                          }[bill.payment_status?.trim() || 'Pending'] || <span className="text-secondary">❓ Unknown</span>}
                        </td>

                        <td>
                          <Button
                            size="sm"
                            variant="info"
                            className="me-2"
                            onClick={() => {
                              setInfoBill(bill);
                              setShowInfoModal(true);
                            }}
                          >
                            Info
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              setSelectedBill({ ...bill });
                              setShowModal(true);
                            }}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center fw-bold">
                      <strong>No Bills Found</strong>
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </Table>
      </div>

      {data && (
        <div className="d-flex justify-content-center mt-5">
          <Pagination>
            <Pagination.Prev className="shadow" onClick={() => handlePageChange(Math.max(offset - limit, 0))} disabled={offset === 0}>
              <CsLineIcons icon="chevron-left" />
            </Pagination.Prev>
            <Pagination.Next className="shadow" onClick={() => handlePageChange(offset + limit)} disabled={data.getAllBills?.length < limit}>
              <CsLineIcons icon="chevron-right" />
            </Pagination.Next>
          </Pagination>
        </div>
      )}

      {/* ✅ Info Modal */}
      <Modal show={showInfoModal} onHide={() => setShowInfoModal(false)}>
        <Modal.Header closeButton className="p-3">
          <Modal.Title>
            <div className="pt-1 fw-bold">{infoBill && (sellerNames[infoBill.sellerId] || infoBill.sellerId)}</div>
            <div className="pt-1 text-dark" style={{ fontSize: '0.7rem' }}>
              (Invoice No.: {infoBill?.billNumber})
            </div>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-3">
          {infoBill && (
            <div className="table-responsive">
              {/* 🔹 Section Configs */}
              {[
                {
                  title: 'Commission Breakdown',
                  fields: [
                    ['Listing Commission', infoBill.listingComm.toFixed(2)],
                    ['Product Commission', infoBill.productComm.toFixed(2)],
                    ['Fixed Commission', infoBill.fixedComm.toFixed(2)],
                    ['Shipping Commission', infoBill.shippingComm.toFixed(2)],
                    ['Payment Gateway Charge', infoBill.paymentGateway.toFixed(2)],
                    ['TDS', infoBill.tds.toFixed(2)],
                    ['TCS', infoBill.tcs.toFixed(2)],
                    ['GST on total commission', infoBill.gstComm.toFixed(2)],
                    [
                      'Total Commission',
                      (
                        infoBill.listingComm +
                        infoBill.productComm +
                        infoBill.fixedComm +
                        infoBill.shippingComm +
                        infoBill.paymentGateway +
                        infoBill.tds +
                        infoBill.tcs +
                        infoBill.gstComm
                      ).toFixed(2),
                    ],
                  ],
                },
                {
                  title: 'Payment Info',
                  fields: [
                    ['Payment Status', infoBill.payment_status],
                    ['Payment Mode', infoBill.payment_mode],
                    ['Transaction Ref No', infoBill.transaction_ref_no],
                    ['Transaction Date', infoBill.transaction_date ? infoBill.transaction_date.split('T')[0] : ''],
                    ['Order Amount', infoBill.orderAmount],
                    [
                      'Total Commission (-)',
                      (
                        infoBill.listingComm +
                        infoBill.productComm +
                        infoBill.fixedComm +
                        infoBill.shippingComm +
                        infoBill.paymentGateway +
                        infoBill.tds +
                        infoBill.tcs +
                        infoBill.gstComm
                      ).toFixed(2),
                    ],
                    ['Settlement Amount', Number(infoBill.settlementAmount).toFixed(2)],
                  ],
                },
              ].map((section, idx) => (
                <div key={idx} className="mb-4">
                  <h6 className={`fw-bold mb-2 ${section.color}`}>{section.title}</h6>
                  <Table bordered size="sm">
                    <tbody>
                      {section.fields.map(([label, value], i) => (
                        <tr key={i}>
                          <th className="w-60">{label}</th>
                          <td className="w-40">{value || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInfoModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="text-dark">Edit Bill Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBill && (
            <Form>
              {[
                {
                  label: 'Payment Status',
                  type: 'select',
                  key: 'payment_status',
                  options: ['Pending', 'Processing', 'Success'],
                },
                {
                  label: 'Payment Mode',
                  type: 'select',
                  key: 'payment_mode',
                  options: ['RTGS', 'NEFT', 'IMPS', 'UPI', 'Cheque', 'Cash'],
                },
                {
                  label: 'Transaction Ref No',
                  type: 'text',
                  key: 'transaction_ref_no',
                },
                {
                  label: 'Transaction Date',
                  type: 'date',
                  key: 'transaction_date',
                },
              ].map((field, i) => (
                <Form.Group className="mb-3" key={i}>
                  <Form.Label className="text-dark">{field.label}</Form.Label>
                  {field.type === 'select' ? (
                    <Form.Select
                      className="text-dark"
                      required
                      value={selectedBill[field.key] || ''}
                      onChange={(e) => setSelectedBill({ ...selectedBill, [field.key]: e.target.value })}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <Form.Control
                      type={field.type}
                      className="text-dark"
                      required
                      value={field.type === 'date' ? selectedBill[field.key]?.split('T')[0] || '' : selectedBill[field.key] || ''}
                      onChange={(e) => setSelectedBill({ ...selectedBill, [field.key]: e.target.value })}
                    />
                  )}
                </Form.Group>
              ))}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ListSeller;
