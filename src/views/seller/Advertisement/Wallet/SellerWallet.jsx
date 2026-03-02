import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Spinner, Modal, Form, Alert } from 'react-bootstrap';
import { gql, useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { useLocation, useHistory } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';

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
        createdAt
      }
    }
  }
`;

const INITIATE_WALLET_PAYMENT = gql`
  mutation InitiateWalletPayment($amount: Float!) {
    initiateWalletPayment(amount: $amount) {
      success
      transactionId
      amount
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
    const title = 'My Wallet';
    const description = 'View wallet balance and add money via PayU';

    const location = useLocation();
    const history = useHistory();
    const searchParams = new URLSearchParams(location.search);
    const paymentStatus = searchParams.get('status');
    const returnTo = searchParams.get('returnTo');

    const [showAddModal, setShowAddModal] = useState(false);
    const [amountInput, setAmountInput] = useState('');
    const [amountError, setAmountError] = useState('');

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

            const {
                transactionId,
                hash,
                key,
                productinfo,
                firstname,
                email,
                phone,
            } = res.data.initiateWalletPayment;

            const backendBase = process.env.REACT_APP_API_URL || 'http://localhost:4000';

            // Build PayU form and submit — browser navigates to PayU payment page
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = PAYU_ENDPOINT;

            const fields = {
                key,
                txnid: transactionId,
                amount: amount.toFixed(2),
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
                <Alert variant='info' className='d-flex align-items-center justify-content-between mb-4' style={{ borderRadius: 12 }}>
                    <div>
                        <strong>You were redirected here from Ad Submission.</strong>
                        <br />
                        <small className='text-muted'>Recharge your wallet, then go back to continue your ad submission. Your selections are saved.</small>
                    </div>
                    <Button
                        variant='primary'
                        className='ms-3 fw-semibold flex-shrink-0'
                        onClick={() => history.push(returnTo)}
                    >
                        ← Back to Ad Submission
                    </Button>
                </Alert>
            )}

            {/* ── Balance Card ── */}
            <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: 16 }}>
                <Card.Body className="p-4">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                        <div>
                            <p className="text-muted mb-1 small fw-semibold text-uppercase ls-1">
                                Wallet Balance
                            </p>
                            {loading ? (
                                <Spinner animation="border" size="sm" />
                            ) : (
                                <h2 className="fw-bold mb-0" style={{ fontSize: '2.2rem', color: '#1a1a2e' }}>
                                    {formatINR(wallet?.balance ?? 0)}
                                </h2>
                            )}
                            {error && (
                                <p className="text-danger small mt-1">{error.message}</p>
                            )}
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
                            onClick={() => { setAmountInput(''); setAmountError(''); setShowAddModal(true); }}
                            disabled={initiating}
                        >
                            + Add Money
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* ── Recent Transactions ── */}
            <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
                <Card.Header
                    className="fw-bold border-0 bg-transparent pt-4 px-4 pb-0"
                    style={{ fontSize: '1rem' }}
                >
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((txn) => (
                                        <tr key={txn.id}>
                                            <td className="small text-muted">{formatDate(txn.createdAt)}</td>
                                            <td>
                                                <Badge
                                                    bg={txn.type === 'credit' ? 'success' : 'danger'}
                                                    style={{ fontSize: '0.75rem', borderRadius: 6 }}
                                                >
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
                                                <Badge
                                                    bg={statusBadgeBg(txn.status)}
                                                    style={{ fontSize: '0.72rem', borderRadius: 6 }}
                                                >
                                                    {txn.status}
                                                </Badge>
                                            </td>
                                            <td className="small text-muted">{txn.ccav_tracking_id || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        );
                    })()
                    }
                </Card.Body>
            </Card>

            {/* ── Add Money Modal ── */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Add Money to Wallet</Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 pt-2 pb-4">
                    <p className="text-muted small mb-3">
                        You will be redirected to the PayU secure payment page.
                    </p>
                    <Form.Group>
                        <Form.Label className="fw-semibold">Amount (₹)</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="e.g. 500"
                            min="10"
                            value={amountInput}
                            onChange={(e) => { setAmountInput(e.target.value); setAmountError(''); }}
                            style={{ borderRadius: 10, fontSize: '1.1rem', padding: '10px 14px' }}
                            autoFocus
                        />
                        {amountError && <div className="text-danger small mt-1">{amountError}</div>}
                    </Form.Group>
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