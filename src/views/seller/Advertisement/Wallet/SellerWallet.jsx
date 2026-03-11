import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Spinner, Modal, Form, Alert } from 'react-bootstrap';
import { gql, useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { useLocation, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import HtmlHead from 'components/html-head/HtmlHead';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';

// ─── GraphQL ─────────────────────────────────────────────────────────────────

const GET_MY_WALLET = gql`
  query GetMyWallet {
    getMyWallet {
      id
      balance
      recentTransactions {
        id
        type
        amount
        source
        description
        status
        ccav_tracking_id
        invoice_id
        createdAt
      }
    }
  }
`;

const GENERATE_WALLET_INVOICE = gql`
  mutation GenerateWalletInvoice($transactionId: ID!) {
    generateWalletInvoice(transactionId: $transactionId) {
      id
      invoiceNumber
      amount
      gatewayTransactionId
      paymentMode
      paymentGateway
      description
      buyerName
      buyerEmail
      buyerPhone
      buyerAddress
      buyerGstin
      companyName
      companyAddress
      companyPan
      companyGstin
      companyWebsite
      baseAmount
      gstRate
      gstType
      cgstRate
      cgstAmount
      sgstRate
      sgstAmount
      igstRate
      igstAmount
      totalAmount
      buyerState
      companyState
      createdAt
    }
  }
`;

const INITIATE_WALLET_PAYMENT = gql`
  mutation InitiateWalletPayment($amount: Float!) {
    initiateWalletPayment(amount: $amount) {
      success
      transactionId
      amount
      baseAmount
      gstAmount
      totalAmount
      gstType
      hash
      key
      productinfo
      firstname
      email
      phone
    }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

// PayU test endpoint — switch to production URL in prod
const PAYU_ENDPOINT = process.env.REACT_APP_PAYU_ENDPOINT || 'https://test.payu.in/_payment';

// Returns Bootstrap bg colour for a transaction status badge
function statusBadgeBg(status) {
  if (status === 'success') return 'success';
  if (status === 'failed') return 'danger';
  return 'warning';
}

// ─── Component ────────────────────────────────────────────────────────────────

const SellerWallet = () => {
  const dispatch = useDispatch();
  const title = 'My Wallet';
  const description = 'View wallet balance and add money via PayU';

  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
  }, [dispatch]);

  const searchParams = new URLSearchParams(location.search);
  const paymentStatus = searchParams.get('status');
  const returnTo = searchParams.get('returnTo');

  const [showAddModal, setShowAddModal] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [amountError, setAmountError] = useState('');
  const [invoiceModal, setInvoiceModal] = useState({ show: false, invoice: null, loading: false });

  const [generateWalletInvoice] = useMutation(GENERATE_WALLET_INVOICE, {
    onError: (err) => {
      setInvoiceModal((s) => ({ ...s, loading: false }));
      toast.error(err.message || 'Failed to generate invoice');
    },
  });

  const handleViewInvoice = async (txn) => {
    setInvoiceModal({ show: true, invoice: null, loading: true });
    try {
      const res = await generateWalletInvoice({ variables: { transactionId: txn.id } });
      setInvoiceModal({ show: true, invoice: res?.data?.generateWalletInvoice ?? null, loading: false });
    } catch (_) {
      setInvoiceModal({ show: false, invoice: null, loading: false });
    }
  };

  const handlePrintInvoice = () => {
    const inv = invoiceModal.invoice;
    const logoUrl = `${window.location.origin}/img/logo/20211213174625apnagharbanao_logo.png`;
    const inr = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(v || 0);
    const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—');

    const companyBlock = `
      <div style="display:flex;align-items:flex-start;gap:14px">
        <img src="${logoUrl}" alt="Logo" style="height:56px;width:auto;object-fit:contain" onerror="this.style.display='none'"/>
        <div>
          <div style="font-size:17px;font-weight:700;color:#1a237e;line-height:1.2">${inv.companyName || 'SAMAR ECOM SOLUTIONS PRIVATE LIMITED'}</div>
          ${inv.companyAddress ? `<div style="font-size:12px;color:#444;margin-top:3px;max-width:320px;line-height:1.5">${inv.companyAddress}</div>` : ''}
          ${inv.companyWebsite ? `<div style="font-size:12px;color:#444;margin-top:2px"><b>Website:</b> ${inv.companyWebsite}</div>` : ''}
          ${inv.companyPan ? `<div style="font-size:12px;color:#444"><b>PAN No.:</b> ${inv.companyPan}</div>` : ''}
          ${inv.companyGstin ? `<div style="font-size:12px;color:#444"><b>GST No.:</b> ${inv.companyGstin}</div>` : ''}
        </div>
      </div>`;

    const invoiceHeaderRight = `
      <div style="text-align:right">
        <div style="font-size:22px;font-weight:800;color:#1a237e;letter-spacing:1px">TAX INVOICE</div>
        <div style="font-size:12px;color:#666;font-style:italic;margin-bottom:10px">(Original for Recipient)</div>
        <table style="margin-left:auto;border-collapse:collapse">
          <tr><td style="padding:3px 8px;font-size:13px;color:#666;text-align:right">Invoice Date:</td><td style="padding:3px 8px;font-size:13px;font-weight:600">${fmtDate(
            inv.createdAt
          )}</td></tr>
          <tr><td style="padding:3px 8px;font-size:13px;color:#666;text-align:right">Invoice No.:</td><td style="padding:3px 8px;font-size:13px;font-weight:600">${
            inv.invoiceNumber
          }</td></tr>
        </table>
      </div>`;

    const billToBlock = `
      <div style="margin-top:18px;padding:12px 16px;border:1px solid #e0e0e0;border-radius:6px;background:#fafafa">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:0.5px;margin-bottom:6px">Bill To</div>
        <div style="font-size:14px;font-weight:700;color:#1a1a2e">${inv.buyerName || '—'}</div>
        ${inv.buyerAddress ? `<div style="font-size:13px;color:#555;margin-top:2px">${inv.buyerAddress}</div>` : ''}
        ${inv.buyerPhone ? `<div style="font-size:13px;color:#555;margin-top:2px"><b>Mobile No.:</b> ${inv.buyerPhone}</div>` : ''}
        ${inv.buyerEmail ? `<div style="font-size:13px;color:#555;margin-top:2px"><b>Email:</b> ${inv.buyerEmail}</div>` : ''}
        ${inv.buyerGstin ? `<div style="font-size:13px;color:#555;margin-top:2px"><b>GST No.:</b> ${inv.buyerGstin}</div>` : ''}
      </div>`;

    const serviceTable = `
      <table style="width:100%;border-collapse:collapse;margin-top:20px">
        <thead>
          <tr style="background:#1a237e;color:#fff">
            <th style="padding:10px 12px;border:1px solid #1a237e;font-size:13px;text-align:center;width:50px">Sr. No.</th>
            <th style="padding:10px 12px;border:1px solid #1a237e;font-size:13px;text-align:left">Category of Service</th>
            <th style="padding:10px 12px;border:1px solid #1a237e;font-size:13px;text-align:left">Description</th>
            <th style="padding:10px 12px;border:1px solid #1a237e;font-size:13px;text-align:right">Taxable Amt</th>
            <th style="padding:10px 12px;border:1px solid #1a237e;font-size:13px;text-align:right">CGST</th>
            <th style="padding:10px 12px;border:1px solid #1a237e;font-size:13px;text-align:right">SGST</th>
            <th style="padding:10px 12px;border:1px solid #1a237e;font-size:13px;text-align:right">IGST</th>
            <th style="padding:10px 12px;border:1px solid #1a237e;font-size:13px;text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:10px 12px;border:1px solid #ddd;font-size:13px;text-align:center">1</td>
            <td style="padding:10px 12px;border:1px solid #ddd;font-size:13px">Digital Wallet Services</td>
            <td style="padding:10px 12px;border:1px solid #ddd;font-size:13px">${inv.description || 'Wallet Recharge / Top-up'} via <span style="text-transform:capitalize">${inv.paymentGateway || ''}</span>${inv.paymentMode ? ` (${inv.paymentMode.toUpperCase()})` : ''}</td>
            <td style="padding:10px 12px;border:1px solid #ddd;font-size:13px;text-align:right;font-weight:600">${inr(inv.baseAmount ?? inv.amount)}</td>
            <td style="padding:10px 12px;border:1px solid #ddd;font-size:13px;text-align:right">${inv.cgstAmount ? inr(inv.cgstAmount) : '—'}</td>
            <td style="padding:10px 12px;border:1px solid #ddd;font-size:13px;text-align:right">${inv.sgstAmount ? inr(inv.sgstAmount) : '—'}</td>
            <td style="padding:10px 12px;border:1px solid #ddd;font-size:13px;text-align:right">${inv.igstAmount ? inr(inv.igstAmount) : '—'}</td>
            <td style="padding:10px 12px;border:1px solid #ddd;font-size:13px;text-align:right;font-weight:600">${inr(inv.totalAmount ?? inv.amount)}</td>
          </tr>
          ${inv.gstRate ? `<tr style="font-size:11px;color:#666;font-style:italic">
            <td colspan="3" style="padding:4px 12px;border:1px solid #ddd;text-align:right">GST Rate @ ${inv.gstRate}%</td>
            <td style="padding:4px 12px;border:1px solid #ddd;text-align:right">${inr(inv.baseAmount ?? inv.amount)}</td>
            <td style="padding:4px 12px;border:1px solid #ddd;text-align:right">${inv.cgstRate ? `${inv.cgstRate}%` : '—'}</td>
            <td style="padding:4px 12px;border:1px solid #ddd;text-align:right">${inv.sgstRate ? `${inv.sgstRate}%` : '—'}</td>
            <td style="padding:4px 12px;border:1px solid #ddd;text-align:right">${inv.igstRate ? `${inv.igstRate}%` : '—'}</td>
            <td style="padding:4px 12px;border:1px solid #ddd"></td>
          </tr>` : ''}
        </tbody>
        <tfoot>
          <tr style="background:#f5f5f5">
            <td colspan="7" style="padding:10px 12px;border:1px solid #ddd;font-size:14px;font-weight:700;text-align:right">Grand Total</td>
            <td style="padding:10px 12px;border:1px solid #ddd;font-size:14px;font-weight:700;text-align:right;color:#1a237e">${inr(inv.totalAmount ?? inv.amount)}</td>
          </tr>
        </tfoot>
      </table>`;

    const refBlock = inv.gatewayTransactionId
      ? `<div style="margin-top:14px;font-size:12px;color:#888">Payment Reference: ${inv.gatewayTransactionId}</div>`
      : '';

    const html = `<html><head><title>Tax Invoice - ${inv.invoiceNumber}</title>
      <style>
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a2e; margin: 0; }
      </style>
    </head><body>
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        ${companyBlock}
        ${invoiceHeaderRight}
      </div>
      <hr style="border:none;border-top:2px solid #1a237e;margin:18px 0"/>
      ${billToBlock}
      ${serviceTable}
      ${refBlock}
      <div style="margin-top:40px;font-size:11px;color:#aaa;text-align:center;border-top:1px solid #eee;padding-top:12px">This is a computer-generated invoice and does not require a signature.</div>
    </body></html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(html);
    win.document.close();
    win.focus();
    win.onafterprint = () => {
      win.close();
      setInvoiceModal({ show: false, invoice: null, loading: false });
      toast.success('✅ Invoice saved successfully!');
    };
    win.print();
  };

  const { data, loading, error, refetch } = useQuery(GET_MY_WALLET, {
    fetchPolicy: 'network-only',
  });

  const [initiateWalletPayment, { loading: initiating }] = useMutation(INITIATE_WALLET_PAYMENT, {
    onError: (err) => toast.error(err.message || 'Payment initiation failed'),
  });

  // Show toast based on redirect status from PayU callback
  useEffect(() => {
    if (paymentStatus === 'success') {
      toast.success('💰 Money added to wallet successfully!');
      refetch();
    } else if (paymentStatus === 'failed') {
      toast.error('Payment failed or was cancelled. Please try again.');
    }
  }, [paymentStatus]);

  const handleAddMoney = async () => {
    const amount = parseFloat(amountInput);
    if (!amount || amount <= 0) {
      setAmountError('Please enter a valid amount greater than ₹0');
      return;
    }
    if (amount < 10) {
      setAmountError('Minimum top-up amount is ₹10');
      return;
    }
    setAmountError('');

    try {
      const res = await initiateWalletPayment({ variables: { amount } });
      if (!res?.data?.initiateWalletPayment) {
        toast.error('Failed to initiate payment. Please try again.');
        return;
      }

      const { transactionId, amount: totalCharged, hash, key, productinfo, firstname, email, phone } = res.data.initiateWalletPayment;

      const backendBase = process.env.REACT_APP_API_URL || 'http://localhost:4000';

      // Build PayU form — use totalCharged (base + GST) as amount sent to PayU
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = PAYU_ENDPOINT;

      const fields = {
        key,
        txnid: transactionId,
        amount: totalCharged.toFixed(2), // totalCharged = base + 18% GST
        productinfo,
        firstname,
        email,
        phone,
        hash,
        surl: `${backendBase}/api/payuWalletSuccess`,
        furl: `${backendBase}/api/payuWalletFailure`,
      };

      Object.keys(fields).forEach((fieldKey) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = fieldKey;
        input.value = fields[fieldKey] || '';
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      // Note: page navigates away after submit — no removeChild needed
    } catch (err) {
      console.error('[SellerWallet] handleAddMoney error:', err);
    }
  };

  const wallet = data?.getMyWallet;
  const transactions = wallet?.recentTransactions || [];

  return (
    <>
      <HtmlHead title={title} description={description} />

      {/* Return-to-ad banner when redirected from ad wizard */}
      {returnTo && (
        <Alert variant="info" className="d-flex align-items-center justify-content-between mb-4" style={{ borderRadius: 12 }}>
          <div>
            <strong>You were redirected here from Ad Submission.</strong>
            <br />
            <small className="text-muted">Recharge your wallet, then go back to continue your ad submission. Your selections are saved.</small>
          </div>
          <Button variant="primary" className="ms-3 fw-semibold flex-shrink-0" onClick={() => history.push(returnTo)}>
            ← Back to Ad Submission
          </Button>
        </Alert>
      )}

      {/* ── Balance Card ── */}
      <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: 16 }}>
        <Card.Body className="p-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <p className="text-muted mb-1 small fw-semibold text-uppercase ls-1">Wallet Balance</p>
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <h2 className="fw-bold mb-0" style={{ fontSize: '2.2rem', color: '#1a1a2e' }}>
                  {formatINR(wallet?.balance ?? 0)}
                </h2>
              )}
              {error && <p className="text-danger small mt-1">{error.message}</p>}
            </div>
            <Button
              className="px-4 py-2 fw-semibold"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: 10,
                color: '#fff',
                fontSize: '0.95rem',
              }}
              onClick={() => {
                setAmountInput('');
                setAmountError('');
                setShowAddModal(true);
              }}
              disabled={initiating}
            >
              + Add Money
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* ── Recent Transactions ── */}
      <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
        <Card.Header className="fw-bold border-0 bg-transparent pt-4 px-4 pb-0" style={{ fontSize: '1rem' }}>
          Recent Transactions
        </Card.Header>
        <Card.Body className="px-4 pb-4">
          {(() => {
            if (loading) {
              return (
                <div className="text-center py-5">
                  <Spinner animation="border" />
                </div>
              );
            }
            if (transactions.length === 0) {
              return (
                <Alert variant="light" className="text-center text-muted mt-3">
                  No transactions yet. Add money to get started!
                </Alert>
              );
            }
            return (
              <Table responsive hover className="mt-3 align-middle">
                <thead>
                  <tr className="text-muted small text-uppercase" style={{ letterSpacing: '0.05em' }}>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Source</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Ref / Tracking</th>
                    <th>Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id}>
                      <td className="small text-muted">{formatDate(txn.createdAt)}</td>
                      <td>
                        <Badge bg={txn.type === 'credit' ? 'success' : 'danger'} style={{ fontSize: '0.75rem', borderRadius: 6 }}>
                          {txn.type === 'credit' ? '▲ Credit' : '▼ Debit'}
                        </Badge>
                      </td>
                      <td className={`fw-semibold ${txn.type === 'credit' ? 'text-success' : 'text-danger'}`}>
                        {txn.type === 'credit' ? '+' : '-'} {formatINR(txn.amount)}
                      </td>
                      <td className="small">
                        <span className="text-capitalize">{txn.source?.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="small text-muted">{txn.description || '—'}</td>
                      <td>
                        <Badge bg={statusBadgeBg(txn.status)} style={{ fontSize: '0.72rem', borderRadius: 6 }}>
                          {txn.status}
                        </Badge>
                      </td>
                      <td className="small text-muted">{txn.ccav_tracking_id || '—'}</td>
                      <td>
                        {txn.type === 'credit' && txn.status === 'success' && ['payu', 'ccavenue'].includes(txn.source) ? (
                          <Button
                            size="sm"
                            variant="outline-primary"
                            style={{ fontSize: '0.75rem', borderRadius: 6, whiteSpace: 'nowrap' }}
                            onClick={() => handleViewInvoice(txn)}
                          >
                            📄 Invoice
                          </Button>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            );
          })()}
        </Card.Body>
      </Card>

      {/* ── Invoice Modal ── */}
      <Modal show={invoiceModal.show} onHide={() => setInvoiceModal({ show: false, invoice: null, loading: false })} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Wallet Recharge Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pt-2 pb-4">
          {invoiceModal.loading && (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          )}
          {!invoiceModal.loading && invoiceModal.invoice && (
            <div id="wallet-invoice-print">
              {/* ── Header: Company (left) + Invoice title (right) ── */}
              <div className="d-flex justify-content-between align-items-start mb-0">
                <div className="d-flex align-items-start gap-3">
                  <img
                    src={`${process.env.PUBLIC_URL}/img/logo/20211213174625apnagharbanao_logo.png`}
                    alt="Logo"
                    style={{ height: 52, width: 'auto', objectFit: 'contain' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1a237e', lineHeight: 1.2 }}>
                      {invoiceModal.invoice.companyName || 'SAMAR ECOM SOLUTIONS PRIVATE LIMITED'}
                    </div>
                    {invoiceModal.invoice.companyAddress && (
                      <div style={{ fontSize: 11, color: '#555', marginTop: 2, maxWidth: 310, lineHeight: 1.5 }}>{invoiceModal.invoice.companyAddress}</div>
                    )}
                    {invoiceModal.invoice.companyWebsite && (
                      <div style={{ fontSize: 11, color: '#555' }}>
                        <strong>Website:</strong> {invoiceModal.invoice.companyWebsite}
                      </div>
                    )}
                    {invoiceModal.invoice.companyPan && (
                      <div style={{ fontSize: 11, color: '#555' }}>
                        <strong>PAN No.:</strong> {invoiceModal.invoice.companyPan}
                      </div>
                    )}
                    {invoiceModal.invoice.companyGstin && (
                      <div style={{ fontSize: 11, color: '#555' }}>
                        <strong>GST No.:</strong> {invoiceModal.invoice.companyGstin}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-end">
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#1a237e', letterSpacing: 1 }}>TAX INVOICE</div>
                  <div style={{ fontSize: 11, color: '#888', fontStyle: 'italic', marginBottom: 8 }}>(Original for Recipient)</div>
                  <table style={{ marginLeft: 'auto', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '2px 8px', fontSize: 12, color: '#666', textAlign: 'right' }}>Invoice Date:</td>
                        <td style={{ padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
                          {invoiceModal.invoice.createdAt
                            ? new Date(invoiceModal.invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
                            : '—'}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 8px', fontSize: 12, color: '#666', textAlign: 'right' }}>Invoice No.:</td>
                        <td style={{ padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>{invoiceModal.invoice.invoiceNumber}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <hr style={{ borderTop: '2px solid #1a237e', margin: '14px 0' }} />

              {/* ── Bill To ── */}
              <div style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: '10px 14px', background: '#fafafa', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#888', letterSpacing: '0.5px', marginBottom: 4 }}>Bill To</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>{invoiceModal.invoice.buyerName || '—'}</div>
                {invoiceModal.invoice.buyerAddress && <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{invoiceModal.invoice.buyerAddress}</div>}
                {invoiceModal.invoice.buyerPhone && (
                  <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
                    <strong>Mobile No.:</strong> {invoiceModal.invoice.buyerPhone}
                  </div>
                )}
                {invoiceModal.invoice.buyerEmail && (
                  <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
                    <strong>Email:</strong> {invoiceModal.invoice.buyerEmail}
                  </div>
                )}
                {invoiceModal.invoice.buyerGstin && (
                  <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
                    <strong>GST No.:</strong> {invoiceModal.invoice.buyerGstin}
                  </div>
                )}
              </div>

              {/* ── Service Table ── */}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#1a237e', color: '#fff' }}>
                    <th style={{ padding: '9px 10px', border: '1px solid #1a237e', fontSize: 12, textAlign: 'center', width: 44 }}>Sr. No.</th>
                    <th style={{ padding: '9px 10px', border: '1px solid #1a237e', fontSize: 12, textAlign: 'left' }}>Category of Service</th>
                    <th style={{ padding: '9px 10px', border: '1px solid #1a237e', fontSize: 12, textAlign: 'left' }}>Description</th>
                    <th style={{ padding: '9px 10px', border: '1px solid #1a237e', fontSize: 12, textAlign: 'right', width: 90 }}>Taxable Amt</th>
                    <th style={{ padding: '9px 10px', border: '1px solid #1a237e', fontSize: 12, textAlign: 'right', width: 72 }}>CGST</th>
                    <th style={{ padding: '9px 10px', border: '1px solid #1a237e', fontSize: 12, textAlign: 'right', width: 72 }}>SGST</th>
                    <th style={{ padding: '9px 10px', border: '1px solid #1a237e', fontSize: 12, textAlign: 'right', width: 72 }}>IGST</th>
                    <th style={{ padding: '9px 10px', border: '1px solid #1a237e', fontSize: 12, textAlign: 'right', width: 100 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const inv = invoiceModal.invoice;
                    const baseAmt  = inv.baseAmount  ?? inv.amount;
                    const totalAmt = inv.totalAmount ?? inv.amount;
                    const inrFmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(v || 0);
                    const hasGst = inv.gstType != null;
                    return (
                      <>
                        <tr>
                          <td style={{ padding: '9px 10px', border: '1px solid #ddd', fontSize: 13, textAlign: 'center' }}>1</td>
                          <td style={{ padding: '9px 10px', border: '1px solid #ddd', fontSize: 13 }}>Digital Wallet Services</td>
                          <td style={{ padding: '9px 10px', border: '1px solid #ddd', fontSize: 13 }}>
                            {inv.description || 'Wallet Recharge / Top-up'} via{' '}
                            <span style={{ textTransform: 'capitalize' }}>{inv.paymentGateway}</span>
                            {inv.paymentMode ? ` (${inv.paymentMode.toUpperCase()})` : ''}
                          </td>
                          <td style={{ padding: '9px 10px', border: '1px solid #ddd', fontSize: 13, textAlign: 'right', fontWeight: 600 }}>{inrFmt(baseAmt)}</td>
                          <td style={{ padding: '9px 10px', border: '1px solid #ddd', fontSize: 13, textAlign: 'right' }}>{hasGst && inv.cgstAmount ? inrFmt(inv.cgstAmount) : '—'}</td>
                          <td style={{ padding: '9px 10px', border: '1px solid #ddd', fontSize: 13, textAlign: 'right' }}>{hasGst && inv.sgstAmount ? inrFmt(inv.sgstAmount) : '—'}</td>
                          <td style={{ padding: '9px 10px', border: '1px solid #ddd', fontSize: 13, textAlign: 'right' }}>{hasGst && inv.igstAmount ? inrFmt(inv.igstAmount) : '—'}</td>
                          <td style={{ padding: '9px 10px', border: '1px solid #ddd', fontSize: 13, textAlign: 'right', fontWeight: 600 }}>{inrFmt(totalAmt)}</td>
                        </tr>
                        {hasGst && (
                          <tr style={{ fontSize: 11, color: '#666', fontStyle: 'italic' }}>
                            <td colSpan={3} style={{ padding: '4px 10px', border: '1px solid #ddd', textAlign: 'right' }}>GST Rate @ {inv.gstRate}%</td>
                            <td style={{ padding: '4px 10px', border: '1px solid #ddd', textAlign: 'right' }}>{inrFmt(baseAmt)}</td>
                            <td style={{ padding: '4px 10px', border: '1px solid #ddd', textAlign: 'right' }}>{inv.cgstRate ? `${inv.cgstRate}%` : '—'}</td>
                            <td style={{ padding: '4px 10px', border: '1px solid #ddd', textAlign: 'right' }}>{inv.sgstRate ? `${inv.sgstRate}%` : '—'}</td>
                            <td style={{ padding: '4px 10px', border: '1px solid #ddd', textAlign: 'right' }}>{inv.igstRate ? `${inv.igstRate}%` : '—'}</td>
                            <td style={{ padding: '4px 10px', border: '1px solid #ddd' }} />
                          </tr>
                        )}
                      </>
                    );
                  })()}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#f5f5f5' }}>
                    <td colSpan={7} style={{ padding: '9px 10px', border: '1px solid #ddd', fontSize: 14, fontWeight: 700, textAlign: 'right' }}>
                      Grand Total
                    </td>
                    <td style={{ padding: '9px 10px', border: '1px solid #ddd', fontSize: 14, fontWeight: 700, textAlign: 'right', color: '#1a237e' }}>
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(invoiceModal.invoice.totalAmount ?? invoiceModal.invoice.amount)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {invoiceModal.invoice.gatewayTransactionId && (
                <div style={{ marginTop: 10, fontSize: 11, color: '#aaa' }}>Payment Reference: {invoiceModal.invoice.gatewayTransactionId}</div>
              )}
            </div>
          )}
          {!invoiceModal.loading && !invoiceModal.invoice && <Alert variant="danger">Could not load invoice. Please try again.</Alert>}
        </Modal.Body>
        {!invoiceModal.loading && invoiceModal.invoice && (
          <Modal.Footer className="border-0">
            <Button variant="outline-secondary" onClick={() => setInvoiceModal({ show: false, invoice: null, loading: false })}>
              Close
            </Button>
            <Button
              onClick={handlePrintInvoice}
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: 8, fontWeight: 600 }}
            >
              🖨️ Print / Download
            </Button>
          </Modal.Footer>
        )}
      </Modal>

      {/* ── Add Money Modal ── */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Add Money to Wallet</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pt-2 pb-4">
          <p className="text-muted small mb-3">You will be redirected to the PayU secure payment page.</p>
          <Form.Group>
            <Form.Label className="fw-semibold">Amount (₹) — Wallet Credit</Form.Label>
            <Form.Control
              type="number"
              placeholder="e.g. 500"
              min="10"
              value={amountInput}
              onChange={(e) => {
                setAmountInput(e.target.value);
                setAmountError('');
              }}
              style={{ borderRadius: 10, fontSize: '1.1rem', padding: '10px 14px' }}
              autoFocus
            />
            {amountError && <div className="text-danger small mt-1">{amountError}</div>}
          </Form.Group>
          {/* GST Preview */}
          {amountInput && parseFloat(amountInput) > 0 && (() => {
            const base = parseFloat(amountInput);
            const gst = Math.round(base * 0.18);
            const total = base + gst;
            return (
              <div className="mt-3 p-3" style={{ background: '#f0f4ff', borderRadius: 8, border: '1px solid #c7d2fe' }}>
                <div className="d-flex justify-content-between" style={{ fontSize: '0.88rem' }}>
                  <span className="text-muted">Wallet Credit (base):</span>
                  <span className="fw-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(base)}</span>
                </div>
                <div className="d-flex justify-content-between" style={{ fontSize: '0.88rem' }}>
                  <span className="text-muted">GST @ 18%:</span>
                  <span className="fw-semibold">+ {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(gst)}</span>
                </div>
                <hr className="my-1" />
                <div className="d-flex justify-content-between" style={{ fontSize: '0.95rem' }}>
                  <span className="fw-bold">Total Charged to PayU:</span>
                  <span className="fw-bold" style={{ color: '#1a237e' }}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(total)}</span>
                </div>
                <div className="mt-1" style={{ fontSize: '0.7rem', color: '#888' }}>* Your wallet will be credited {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(base)} (GST is a government tax, not added to wallet balance)</div>
              </div>
            );
          })()}
          <div className="d-grid mt-4">
            <Button
              onClick={handleAddMoney}
              disabled={initiating}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: 10,
                fontWeight: 600,
                fontSize: '1rem',
                padding: '12px',
              }}
            >
              {initiating ? <Spinner size="sm" animation="border" className="me-2" /> : null}
              {initiating ? 'Redirecting to PayU...' : 'Proceed to Payment'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SellerWallet;
