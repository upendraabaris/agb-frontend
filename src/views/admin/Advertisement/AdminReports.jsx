import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { toast } from 'react-toastify';
import { Spinner, Table, Form, Button } from 'react-bootstrap';
import { ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';
import HtmlHead from 'components/html-head/HtmlHead';
import BreadcrumbList from 'components/breadcrumb-list/BreadcrumbList';

// ==========================================
// GraphQL Queries
// ==========================================

const GET_ADMIN_REVENUE_REPORT = gql`
  query GetAdminRevenueReport($period: String!, $year: Int!, $month: Int, $quarter: Int) {
    getAdminRevenueReport(period: $period, year: $year, month: $month, quarter: $quarter) {
      totalRevenue
      period
      year
      month
      quarter
      breakdown {
        tierId
        tierName
        revenue
        adCount
      }
    }
  }
`;

const GET_ADMIN_TIER_SALES_REPORT = gql`
  query GetAdminTierSalesReport($startDate: String, $endDate: String) {
    getAdminTierSalesReport(startDate: $startDate, endDate: $endDate) {
      tierId
      tierName
      totalAdsSold
      bannerCount
      stampCount
      revenue
    }
  }
`;

const GET_ADMIN_SLOT_UTILIZATION = gql`
  query GetAdminSlotUtilization {
    getAdminSlotUtilization {
      totalSlots
      occupiedSlots
      availableSlots
      utilizationPercentage
      tierBreakdown {
        tierId
        tierName
        totalSlots
        occupiedSlots
        availableSlots
        utilizationPercentage
      }
    }
  }
`;

const GET_ADMIN_PENDING_APPROVALS = gql`
  query GetAdminPendingApprovals {
    getAdminPendingApprovals {
      count
      requests {
        id
        sellerId
        sellerName
        sellerEmail
        categoryId
        categoryName
        tierId
        tierName
        requestDate
        slotsRequested
      }
    }
  }
`;

const GET_ADMIN_EXPIRY_UPCOMING = gql`
  query GetAdminExpiryUpcoming($days: Int!) {
    getAdminExpiryUpcoming(days: $days) {
      id
      categoryRequestId
      sellerId
      sellerName
      sellerEmail
      categoryId
      categoryName
      tierId
      tierName
      slot
      startDate
      endDate
      remainingDays
    }
  }
`;

const GET_ADMIN_ADVERTISER_SPENDING = gql`
  query GetAdminAdvertiserSpending($startDate: String, $endDate: String) {
    getAdminAdvertiserSpending(startDate: $startDate, endDate: $endDate) {
      sellerId
      sellerName
      sellerEmail
      totalSpent
      adCount
      activeAdsCount
      completedAdsCount
    }
  }
`;

// ==========================================
// Component
// ==========================================

const AdminReports = () => {
    const title = 'Advertisement Reports';
    const description = 'Comprehensive advertisement performance and analytics reports';
    const breadcrumbs = [
        { id: '0', name: 'Dashboard', icon: 'home' },
        { id: '1', name: 'Advertisement' },
        { id: '2', name: 'Reports' }
    ];

    // State for filters
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [revenuePeriod, setRevenuePeriod] = useState('monthly');
    const [revenueYear, setRevenueYear] = useState(currentYear);
    const [revenueMonth, setRevenueMonth] = useState(currentMonth);
    const [revenueQuarter, setRevenueQuarter] = useState(1);

    const [tierSalesStartDate, setTierSalesStartDate] = useState('');
    const [tierSalesEndDate, setTierSalesEndDate] = useState('');

    const [expiryDays, setExpiryDays] = useState(30);

    const [advertiserStartDate, setAdvertiserStartDate] = useState('');
    const [advertiserEndDate, setAdvertiserEndDate] = useState('');

    // GraphQL Queries
    const revenueQuery = useQuery(GET_ADMIN_REVENUE_REPORT, {
        variables: {
            period: revenuePeriod,
            year: revenueYear,
            month: revenuePeriod === 'monthly' ? revenueMonth : null,
            quarter: revenuePeriod === 'quarterly' ? revenueQuarter : null
        },
        onError: (error) => toast.error(`Revenue Report Error: ${error.message}`)
    });

    const tierSalesQuery = useQuery(GET_ADMIN_TIER_SALES_REPORT, {
        variables: {
            startDate: tierSalesStartDate || null,
            endDate: tierSalesEndDate || null
        },
        onError: (error) => toast.error(`Tier Sales Error: ${error.message}`)
    });

    const slotUtilizationQuery = useQuery(GET_ADMIN_SLOT_UTILIZATION, {
        onError: (error) => toast.error(`Slot Utilization Error: ${error.message}`)
    });

    const pendingApprovalsQuery = useQuery(GET_ADMIN_PENDING_APPROVALS, {
        onError: (error) => toast.error(`Pending Approvals Error: ${error.message}`)
    });

    const expiryQuery = useQuery(GET_ADMIN_EXPIRY_UPCOMING, {
        variables: { days: expiryDays },
        onError: (error) => toast.error(`Expiry Report Error: ${error.message}`)
    });

    const advertiserSpendingQuery = useQuery(GET_ADMIN_ADVERTISER_SPENDING, {
        variables: {
            startDate: advertiserStartDate || null,
            endDate: advertiserEndDate || null
        },
        onError: (error) => toast.error(`Advertiser Spending Error: ${error.message}`)
    });

    // Export to CSV function
    const exportToCSV = (data, filename) => {
        if (!data || data.length === 0) {
            toast.warning('No data to export');
            return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Print function
    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <HtmlHead title={title} description={description} />
            <div className="page-wrapper">
                <div className="page-heading d-print-none">
                    <BreadcrumbList items={breadcrumbs} />
                    <div className="page-title">
                        <h1>{title}</h1>
                    </div>
                </div>

                <div className="page-body">
                    <div className="container-fluid p-4 bg-white">
                        {/* Header Section */}
                        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 border-bottom pb-3 d-print-none">
                            <div>
                                <h1 className="h3 fw-bold text-dark mb-1">Advertisement Performance Report</h1>
                                <p className="text-muted small mb-0">Generated on: {new Date().toLocaleDateString()}</p>
                            </div>

                            <div className="d-flex gap-2 mt-3 mt-md-0">
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    className="d-flex align-items-center gap-2"
                                    onClick={handlePrint}
                                >
                                    <PrinterIcon style={{ width: '16px', height: '16px' }} />
                                    Print
                                </Button>
                            </div>
                        </div>

                        {/* ==========================================
                1. REVENUE REPORT
                ========================================== */}
                        <div className="mb-5">
                            <h5 className="fw-bold text-dark border-bottom mb-3 pb-2">1. Revenue Report</h5>

                            {/* Filters */}
                            <div className="row g-3 mb-3 d-print-none">
                                <div className="col-md-3">
                                    <Form.Label>Period</Form.Label>
                                    <Form.Select
                                        value={revenuePeriod}
                                        onChange={(e) => setRevenuePeriod(e.target.value)}
                                        size="sm"
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="annual">Annual</option>
                                    </Form.Select>
                                </div>
                                <div className="col-md-2">
                                    <Form.Label>Year</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={revenueYear}
                                        onChange={(e) => setRevenueYear(parseInt(e.target.value))}
                                        size="sm"
                                    />
                                </div>
                                {revenuePeriod === 'monthly' && (
                                    <div className="col-md-2">
                                        <Form.Label>Month</Form.Label>
                                        <Form.Select
                                            value={revenueMonth}
                                            onChange={(e) => setRevenueMonth(parseInt(e.target.value))}
                                            size="sm"
                                        >
                                            {[...Array(12)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                                            ))}
                                        </Form.Select>
                                    </div>
                                )}
                                {revenuePeriod === 'quarterly' && (
                                    <div className="col-md-2">
                                        <Form.Label>Quarter</Form.Label>
                                        <Form.Select
                                            value={revenueQuarter}
                                            onChange={(e) => setRevenueQuarter(parseInt(e.target.value))}
                                            size="sm"
                                        >
                                            <option value={1}>Q1</option>
                                            <option value={2}>Q2</option>
                                            <option value={3}>Q3</option>
                                            <option value={4}>Q4</option>
                                        </Form.Select>
                                    </div>
                                )}
                            </div>

                            {revenueQuery.loading ? (
                                <div className="text-center p-4"><Spinner animation="border" size="sm" /></div>
                            ) : revenueQuery.error ? (
                                <div className="alert alert-danger">Error loading revenue report</div>
                            ) : (
                                <>
                                    <div className="p-3 bg-light rounded border mb-3">
                                        <span className="d-block text-muted small text-uppercase">Total Revenue</span>
                                        <span className="d-block h3 fw-bold text-dark mb-0">
                                            ₹{revenueQuery.data?.getAdminRevenueReport?.totalRevenue?.toLocaleString() || 0}
                                        </span>
                                        <small className="text-muted">
                                            {revenuePeriod === 'monthly' && `${revenueMonth}/${revenueYear}`}
                                            {revenuePeriod === 'quarterly' && `Q${revenueQuarter} ${revenueYear}`}
                                            {revenuePeriod === 'annual' && `${revenueYear}`}
                                        </small>
                                    </div>

                                    <Table bordered hover responsive size="sm">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Tier Name</th>
                                                <th className="text-end">Revenue (₹)</th>
                                                <th className="text-center">Ad Count</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {revenueQuery.data?.getAdminRevenueReport?.breakdown?.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>{item.tierName}</td>
                                                    <td className="text-end fw-bold">₹{item.revenue?.toLocaleString()}</td>
                                                    <td className="text-center">{item.adCount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>

                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="d-print-none"
                                        onClick={() => exportToCSV(
                                            revenueQuery.data?.getAdminRevenueReport?.breakdown || [],
                                            'revenue_report'
                                        )}
                                    >
                                        <ArrowDownTrayIcon style={{ width: '14px', height: '14px' }} className="me-1" />
                                        Export CSV
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* ==========================================
                2. TIER SALES REPORT
                ========================================== */}
                        <div className="mb-5">
                            <h5 className="fw-bold text-dark border-bottom mb-3 pb-2">2. Sales by Tier</h5>

                            {/* Filters */}
                            <div className="row g-3 mb-3 d-print-none">
                                <div className="col-md-3">
                                    <Form.Label>Start Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={tierSalesStartDate}
                                        onChange={(e) => setTierSalesStartDate(e.target.value)}
                                        size="sm"
                                    />
                                </div>
                                <div className="col-md-3">
                                    <Form.Label>End Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={tierSalesEndDate}
                                        onChange={(e) => setTierSalesEndDate(e.target.value)}
                                        size="sm"
                                    />
                                </div>
                            </div>

                            {tierSalesQuery.loading ? (
                                <div className="text-center p-4"><Spinner animation="border" size="sm" /></div>
                            ) : tierSalesQuery.error ? (
                                <div className="alert alert-danger">Error loading tier sales report</div>
                            ) : (
                                <>
                                    <Table bordered hover responsive size="sm">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Tier Name</th>
                                                <th className="text-center">Total Ads Sold</th>
                                                <th className="text-center">Banners</th>
                                                <th className="text-center">Stamps</th>
                                                <th className="text-end">Revenue (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tierSalesQuery.data?.getAdminTierSalesReport?.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>{item.tierName}</td>
                                                    <td className="text-center fw-bold">{item.totalAdsSold}</td>
                                                    <td className="text-center">{item.bannerCount}</td>
                                                    <td className="text-center">{item.stampCount}</td>
                                                    <td className="text-end">₹{item.revenue?.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>

                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="d-print-none"
                                        onClick={() => exportToCSV(
                                            tierSalesQuery.data?.getAdminTierSalesReport || [],
                                            'tier_sales_report'
                                        )}
                                    >
                                        <ArrowDownTrayIcon style={{ width: '14px', height: '14px' }} className="me-1" />
                                        Export CSV
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* ==========================================
                3. SLOT UTILIZATION
                ========================================== */}
                        <div className="mb-5">
                            <h5 className="fw-bold text-dark border-bottom mb-3 pb-2">3. Slot Utilization</h5>

                            {slotUtilizationQuery.loading ? (
                                <div className="text-center p-4"><Spinner animation="border" size="sm" /></div>
                            ) : slotUtilizationQuery.error ? (
                                <div className="alert alert-danger">Error loading slot utilization</div>
                            ) : (
                                <>
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-3">
                                            <div className="p-3 bg-light rounded border">
                                                <span className="d-block text-muted small">Total Slots</span>
                                                <span className="d-block h4 fw-bold text-dark mb-0">
                                                    {slotUtilizationQuery.data?.getAdminSlotUtilization?.totalSlots || 0}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="p-3 bg-light rounded border">
                                                <span className="d-block text-muted small">Occupied</span>
                                                <span className="d-block h4 fw-bold text-success mb-0">
                                                    {slotUtilizationQuery.data?.getAdminSlotUtilization?.occupiedSlots || 0}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="p-3 bg-light rounded border">
                                                <span className="d-block text-muted small">Available</span>
                                                <span className="d-block h4 fw-bold text-info mb-0">
                                                    {slotUtilizationQuery.data?.getAdminSlotUtilization?.availableSlots || 0}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="p-3 bg-light rounded border">
                                                <span className="d-block text-muted small">Utilization</span>
                                                <span className="d-block h4 fw-bold text-primary mb-0">
                                                    {slotUtilizationQuery.data?.getAdminSlotUtilization?.utilizationPercentage?.toFixed(1) || 0}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <h6 className="fw-bold mt-4 mb-3">Tier-wise Breakdown</h6>
                                    <Table bordered hover responsive size="sm">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Tier Name</th>
                                                <th className="text-center">Total Slots</th>
                                                <th className="text-center">Occupied</th>
                                                <th className="text-center">Available</th>
                                                <th className="text-end">Utilization %</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {slotUtilizationQuery.data?.getAdminSlotUtilization?.tierBreakdown?.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>{item.tierName}</td>
                                                    <td className="text-center">{item.totalSlots}</td>
                                                    <td className="text-center">{item.occupiedSlots}</td>
                                                    <td className="text-center">{item.availableSlots}</td>
                                                    <td className="text-end">{item.utilizationPercentage?.toFixed(1)}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>

                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="d-print-none"
                                        onClick={() => exportToCSV(
                                            slotUtilizationQuery.data?.getAdminSlotUtilization?.tierBreakdown || [],
                                            'slot_utilization_report'
                                        )}
                                    >
                                        <ArrowDownTrayIcon style={{ width: '14px', height: '14px' }} className="me-1" />
                                        Export CSV
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* ==========================================
                4. PENDING APPROVALS
                ========================================== */}
                        <div className="mb-5">
                            <h5 className="fw-bold text-dark border-bottom mb-3 pb-2">4. Pending Approvals</h5>

                            {pendingApprovalsQuery.loading ? (
                                <div className="text-center p-4"><Spinner animation="border" size="sm" /></div>
                            ) : pendingApprovalsQuery.error ? (
                                <div className="alert alert-danger">Error loading pending approvals</div>
                            ) : (
                                <>
                                    <div className="alert alert-warning mb-3">
                                        <strong>{pendingApprovalsQuery.data?.getAdminPendingApprovals?.count || 0}</strong> requests pending approval
                                    </div>

                                    <Table bordered hover responsive size="sm">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Seller Name</th>
                                                <th>Email</th>
                                                <th>Category</th>
                                                <th>Tier</th>
                                                <th>Request Date</th>
                                                <th className="text-center">Slots Requested</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingApprovalsQuery.data?.getAdminPendingApprovals?.requests?.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="fw-bold">{item.sellerName}</td>
                                                    <td>{item.sellerEmail}</td>
                                                    <td>{item.categoryName}</td>
                                                    <td>{item.tierName}</td>
                                                    <td>{new Date(item.requestDate).toLocaleDateString()}</td>
                                                    <td className="text-center">{item.slotsRequested}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>

                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="d-print-none"
                                        onClick={() => exportToCSV(
                                            pendingApprovalsQuery.data?.getAdminPendingApprovals?.requests || [],
                                            'pending_approvals_report'
                                        )}
                                    >
                                        <ArrowDownTrayIcon style={{ width: '14px', height: '14px' }} className="me-1" />
                                        Export CSV
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* ==========================================
                5. EXPIRING ADS
                ========================================== */}
                        <div className="mb-5">
                            <h5 className="fw-bold text-dark border-bottom mb-3 pb-2">5. Expiring Ads</h5>

                            {/* Filter */}
                            <div className="row g-3 mb-3 d-print-none">
                                <div className="col-md-3">
                                    <Form.Label>Days Ahead</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={expiryDays}
                                        onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                                        size="sm"
                                        min="1"
                                    />
                                </div>
                            </div>

                            {expiryQuery.loading ? (
                                <div className="text-center p-4"><Spinner animation="border" size="sm" /></div>
                            ) : expiryQuery.error ? (
                                <div className="alert alert-danger">Error loading expiring ads</div>
                            ) : (
                                <>
                                    <Table bordered hover responsive size="sm">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Seller Name</th>
                                                <th>Category</th>
                                                <th>Tier</th>
                                                <th>Slot</th>
                                                <th>End Date</th>
                                                <th className="text-center">Days Remaining</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expiryQuery.data?.getAdminExpiryUpcoming?.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="fw-bold">{item.sellerName}</td>
                                                    <td>{item.categoryName}</td>
                                                    <td>{item.tierName}</td>
                                                    <td>{item.slot}</td>
                                                    <td>{new Date(item.endDate).toLocaleDateString()}</td>
                                                    <td className="text-center">
                                                        <span className={`badge ${item.remainingDays <= 7 ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                                            {item.remainingDays} days
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>

                                    {(!expiryQuery.data?.getAdminExpiryUpcoming || expiryQuery.data.getAdminExpiryUpcoming.length === 0) && (
                                        <div className="alert alert-info">No ads expiring in the next {expiryDays} days</div>
                                    )}

                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="d-print-none"
                                        onClick={() => exportToCSV(
                                            expiryQuery.data?.getAdminExpiryUpcoming || [],
                                            'expiring_ads_report'
                                        )}
                                    >
                                        <ArrowDownTrayIcon style={{ width: '14px', height: '14px' }} className="me-1" />
                                        Export CSV
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* ==========================================
                6. ADVERTISER SPENDING
                ========================================== */}
                        <div className="mb-4">
                            <h5 className="fw-bold text-dark border-bottom mb-3 pb-2">6. Advertiser Spending</h5>

                            {/* Filters */}
                            <div className="row g-3 mb-3 d-print-none">
                                <div className="col-md-3">
                                    <Form.Label>Start Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={advertiserStartDate}
                                        onChange={(e) => setAdvertiserStartDate(e.target.value)}
                                        size="sm"
                                    />
                                </div>
                                <div className="col-md-3">
                                    <Form.Label>End Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={advertiserEndDate}
                                        onChange={(e) => setAdvertiserEndDate(e.target.value)}
                                        size="sm"
                                    />
                                </div>
                            </div>

                            {advertiserSpendingQuery.loading ? (
                                <div className="text-center p-4"><Spinner animation="border" size="sm" /></div>
                            ) : advertiserSpendingQuery.error ? (
                                <div className="alert alert-danger">Error loading advertiser spending</div>
                            ) : (
                                <>
                                    <Table bordered hover responsive size="sm">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Seller Name</th>
                                                <th>Email</th>
                                                <th className="text-end">Total Spent (₹)</th>
                                                <th className="text-center">Total Ads</th>
                                                <th className="text-center">Active Ads</th>
                                                <th className="text-center">Completed Ads</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {advertiserSpendingQuery.data?.getAdminAdvertiserSpending?.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="fw-bold">{item.sellerName}</td>
                                                    <td>{item.sellerEmail}</td>
                                                    <td className="text-end fw-bold">₹{item.totalSpent?.toLocaleString()}</td>
                                                    <td className="text-center">{item.adCount}</td>
                                                    <td className="text-center">{item.activeAdsCount}</td>
                                                    <td className="text-center">{item.completedAdsCount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>

                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="d-print-none"
                                        onClick={() => exportToCSV(
                                            advertiserSpendingQuery.data?.getAdminAdvertiserSpending || [],
                                            'advertiser_spending_report'
                                        )}
                                    >
                                        <ArrowDownTrayIcon style={{ width: '14px', height: '14px' }} className="me-1" />
                                        Export CSV
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminReports;
