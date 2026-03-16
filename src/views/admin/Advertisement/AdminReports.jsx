import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { toast } from 'react-toastify';
import { Spinner, Table, Form, Button, Nav, Tab } from 'react-bootstrap';
import { ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';
import HtmlHead from 'components/html-head/HtmlHead';
import BreadcrumbList from 'components/breadcrumb-list/BreadcrumbList';

// ==========================================
// GraphQL Queries
// ==========================================

const GET_ADMIN_REVENUE_REPORT = gql`
  query GetAdminRevenueReport($period: String!, $year: Int!, $quarter: Int, $half: Int) {
    getAdminRevenueReport(period: $period, year: $year, quarter: $quarter, half: $half) {
      totalRevenue
      totalCouponDiscount
      totalNetRevenue
      period
      year
      month
      quarter
      breakdown {
        tierId
        tierName
        revenue
        couponDiscount
        netRevenue
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
      couponDiscount
      netRevenue
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
      totalCouponDiscount
      adCount
      activeAdsCount
      completedAdsCount
    }
  }
`;

// ==========================================
// Product Ad GraphQL Queries
// ==========================================

const GET_ADMIN_PRODUCT_AD_REVENUE_REPORT = gql`
  query GetAdminProductAdRevenueReport($period: String!, $year: Int!, $quarter: Int, $half: Int) {
    getAdminProductAdRevenueReport(period: $period, year: $year, quarter: $quarter, half: $half) {
      totalRevenue
      totalCouponDiscount
      totalNetRevenue
      period
      year
      month
      quarter
      breakdown {
        tierId
        tierName
        revenue
        couponDiscount
        netRevenue
        adCount
      }
    }
  }
`;

const GET_ADMIN_PRODUCT_AD_TIER_SALES_REPORT = gql`
  query GetAdminProductAdTierSalesReport($startDate: String, $endDate: String) {
    getAdminProductAdTierSalesReport(startDate: $startDate, endDate: $endDate) {
      tierId
      tierName
      totalAdsSold
      bannerCount
      stampCount
      revenue
      couponDiscount
      netRevenue
    }
  }
`;

const GET_ADMIN_PRODUCT_AD_PENDING_APPROVALS = gql`
  query GetAdminProductAdPendingApprovals {
    getAdminProductAdPendingApprovals {
      count
      requests {
        id
        sellerId
        sellerName
        sellerEmail
        productId
        productName
        tierId
        tierName
        requestDate
      }
    }
  }
`;

const GET_ADMIN_PRODUCT_AD_EXPIRY_UPCOMING = gql`
  query GetAdminProductAdExpiryUpcoming($days: Int!) {
    getAdminProductAdExpiryUpcoming(days: $days) {
      id
      productAdRequestId
      sellerId
      sellerName
      sellerEmail
      productId
      productName
      tierId
      tierName
      slot
      startDate
      endDate
      remainingDays
    }
  }
`;

const GET_ADMIN_PRODUCT_AD_ADVERTISER_SPENDING = gql`
  query GetAdminProductAdAdvertiserSpending($startDate: String, $endDate: String) {
    getAdminProductAdAdvertiserSpending(startDate: $startDate, endDate: $endDate) {
      sellerId
      sellerName
      sellerEmail
      totalSpent
      totalCouponDiscount
      adCount
      activeAdsCount
      completedAdsCount
    }
  }
`;

// ==========================================
// Component
// ==========================================

const formatDate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  if (!date || Number.isNaN(d.getTime())) return 'N/A';
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'long' });
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const quarterToStartDate = (quarter, year) => {
  const m = (quarter - 1) * 3 + 1;
  return `${year}-${String(m).padStart(2, '0')}-01`;
};

const quarterToEndDate = (quarter, year) => {
  const endMonth = quarter * 3;
  const lastDay = new Date(year, endMonth, 0).getDate();
  return `${year}-${String(endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
};

const AdminReports = () => {
  const title = 'Advertisement Reports';
  const description = 'Comprehensive advertisement performance and analytics reports';
  const breadcrumbs = [
    { id: '0', name: 'Dashboard', icon: 'home' },
    { id: '1', name: 'Advertisement' },
    { id: '2', name: 'Reports' },
  ];

  // State for filters
  const currentYear = new Date().getFullYear();

  const [adTypeTab, setAdTypeTab] = useState('category');

  const [revenuePeriod, setRevenuePeriod] = useState('quarterly');
  const [revenueYear, setRevenueYear] = useState(currentYear);
  const [revenueQuarter, setRevenueQuarter] = useState(1);
  const [revenueHalf, setRevenueHalf] = useState(1);

  const [tierSalesStartQuarter, setTierSalesStartQuarter] = useState(1);
  const [tierSalesStartYear, setTierSalesStartYear] = useState(currentYear);
  const [tierSalesEndQuarter, setTierSalesEndQuarter] = useState(4);
  const [tierSalesEndYear, setTierSalesEndYear] = useState(currentYear);

  const [expiryDays, setExpiryDays] = useState(30);

  const [advertiserStartQuarter, setAdvertiserStartQuarter] = useState(1);
  const [advertiserStartYear, setAdvertiserStartYear] = useState(currentYear);
  const [advertiserEndQuarter, setAdvertiserEndQuarter] = useState(4);
  const [advertiserEndYear, setAdvertiserEndYear] = useState(currentYear);

  // Product Ad filter state
  const [productAdRevenuePeriod, setProductAdRevenuePeriod] = useState('quarterly');
  const [productAdRevenueYear, setProductAdRevenueYear] = useState(currentYear);
  const [productAdRevenueQuarter, setProductAdRevenueQuarter] = useState(1);
  const [productAdRevenueHalf, setProductAdRevenueHalf] = useState(1);
  const [productAdTierSalesStartQuarter, setProductAdTierSalesStartQuarter] = useState(1);
  const [productAdTierSalesStartYear, setProductAdTierSalesStartYear] = useState(currentYear);
  const [productAdTierSalesEndQuarter, setProductAdTierSalesEndQuarter] = useState(4);
  const [productAdTierSalesEndYear, setProductAdTierSalesEndYear] = useState(currentYear);
  const [productAdExpiryDays, setProductAdExpiryDays] = useState(30);
  const [productAdAdvertiserStartQuarter, setProductAdAdvertiserStartQuarter] = useState(1);
  const [productAdAdvertiserStartYear, setProductAdAdvertiserStartYear] = useState(currentYear);
  const [productAdAdvertiserEndQuarter, setProductAdAdvertiserEndQuarter] = useState(4);
  const [productAdAdvertiserEndYear, setProductAdAdvertiserEndYear] = useState(currentYear);

  // GraphQL Queries
  const revenueQuery = useQuery(GET_ADMIN_REVENUE_REPORT, {
    variables: {
      period: revenuePeriod,
      year: revenueYear,
      quarter: revenuePeriod === 'quarterly' ? revenueQuarter : null,
      half: revenuePeriod === 'half-yearly' ? revenueHalf : null,
    },
    onError: (error) => toast.error(`Revenue Report Error: ${error.message}`),
  });

  const tierSalesQuery = useQuery(GET_ADMIN_TIER_SALES_REPORT, {
    variables: {
      startDate: quarterToStartDate(tierSalesStartQuarter, tierSalesStartYear),
      endDate: quarterToEndDate(tierSalesEndQuarter, tierSalesEndYear),
    },
    onError: (error) => toast.error(`Tier Sales Error: ${error.message}`),
  });

  const slotUtilizationQuery = useQuery(GET_ADMIN_SLOT_UTILIZATION, {
    onError: (error) => toast.error(`Slot Utilization Error: ${error.message}`),
  });

  const pendingApprovalsQuery = useQuery(GET_ADMIN_PENDING_APPROVALS, {
    onError: (error) => toast.error(`Pending Approvals Error: ${error.message}`),
  });

  const expiryQuery = useQuery(GET_ADMIN_EXPIRY_UPCOMING, {
    variables: { days: expiryDays },
    onError: (error) => toast.error(`Expiry Report Error: ${error.message}`),
  });

  const advertiserSpendingQuery = useQuery(GET_ADMIN_ADVERTISER_SPENDING, {
    variables: {
      startDate: quarterToStartDate(advertiserStartQuarter, advertiserStartYear),
      endDate: quarterToEndDate(advertiserEndQuarter, advertiserEndYear),
    },
    onError: (error) => toast.error(`Advertiser Spending Error: ${error.message}`),
  });

  // Product Ad Queries
  const productAdRevenueQuery = useQuery(GET_ADMIN_PRODUCT_AD_REVENUE_REPORT, {
    variables: {
      period: productAdRevenuePeriod,
      year: productAdRevenueYear,
      quarter: productAdRevenuePeriod === 'quarterly' ? productAdRevenueQuarter : null,
      half: productAdRevenuePeriod === 'half-yearly' ? productAdRevenueHalf : null,
    },
    skip: adTypeTab !== 'product',
    onError: (error) => toast.error(`Product Ad Revenue Error: ${error.message}`),
  });

  const productAdTierSalesQuery = useQuery(GET_ADMIN_PRODUCT_AD_TIER_SALES_REPORT, {
    variables: {
      startDate: quarterToStartDate(productAdTierSalesStartQuarter, productAdTierSalesStartYear),
      endDate: quarterToEndDate(productAdTierSalesEndQuarter, productAdTierSalesEndYear),
    },
    skip: adTypeTab !== 'product',
    onError: (error) => toast.error(`Product Ad Tier Sales Error: ${error.message}`),
  });

  const productAdPendingApprovalsQuery = useQuery(GET_ADMIN_PRODUCT_AD_PENDING_APPROVALS, {
    skip: adTypeTab !== 'product',
    onError: (error) => toast.error(`Product Ad Pending Approvals Error: ${error.message}`),
  });

  const productAdExpiryQuery = useQuery(GET_ADMIN_PRODUCT_AD_EXPIRY_UPCOMING, {
    variables: { days: productAdExpiryDays },
    skip: adTypeTab !== 'product',
    onError: (error) => toast.error(`Product Ad Expiry Error: ${error.message}`),
  });

  const productAdAdvertiserSpendingQuery = useQuery(GET_ADMIN_PRODUCT_AD_ADVERTISER_SPENDING, {
    variables: {
      startDate: quarterToStartDate(productAdAdvertiserStartQuarter, productAdAdvertiserStartYear),
      endDate: quarterToEndDate(productAdAdvertiserEndQuarter, productAdAdvertiserEndYear),
    },
    skip: adTypeTab !== 'product',
    onError: (error) => toast.error(`Product Ad Advertiser Spending Error: ${error.message}`),
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
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
          })
          .join(',')
      ),
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
    const style = document.createElement('style');
    style.id = 'report-print-style';
    style.textContent = `
            @media print {
                #nav, .side-menu-container, footer { display: none !important; }
                #contentArea { width: 100% !important; max-width: 100% !important; flex: 0 0 100% !important; }
                .container { max-width: 100% !important; }
            }
        `;
    document.head.appendChild(style);
    window.onafterprint = () => {
      const el = document.getElementById('report-print-style');
      if (el) el.parentNode.removeChild(el);
      window.onafterprint = null;
    };
    window.print();
  };
  const renderQueryResult = (query, errorMessage, contentFn) => {
    if (query.loading)
      return (
        <div className="text-center p-4">
          <Spinner animation="border" size="sm" />
        </div>
      );
    if (query.error) return <div className="alert alert-danger">{errorMessage}</div>;
    return contentFn();
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
                <p className="text-muted small mb-0">Generated on: {formatDate(new Date())}</p>
              </div>

              <div className="d-flex gap-2 mt-3 mt-md-0">
                <Button variant="outline-secondary" size="sm" className="d-flex align-items-center gap-2" onClick={handlePrint}>
                  <PrinterIcon style={{ width: '16px', height: '16px' }} />
                  Print
                </Button>
              </div>
            </div>

            {/* Top-level Ad Type Tab Navigation */}
            <Tab.Container activeKey={adTypeTab} onSelect={(k) => setAdTypeTab(k)}>
              <Nav variant="tabs" className="mb-4 d-print-none">
                <Nav.Item>
                  <Nav.Link eventKey="category">Category Ad Reports</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="product">Product Ad Reports</Nav.Link>
                </Nav.Item>
              </Nav>

              <Tab.Content>
                <Tab.Pane eventKey="category">
                  {/* ==========================================
                1. REVENUE REPORT
                ========================================== */}
                  <div className="mb-5">
                    <h5 className="fw-bold text-dark border-bottom mb-3 pb-2">1. Revenue Report</h5>

                    {/* Filters */}
                    <div className="row g-3 mb-3 d-print-none">
                      <div className="col-md-3">
                        <Form.Label>Period</Form.Label>
                        <Form.Select value={revenuePeriod} onChange={(e) => setRevenuePeriod(e.target.value)} size="sm">
                          <option value="quarterly">Quarterly</option>
                          <option value="half-yearly">Half-Yearly</option>
                          <option value="annual">Annual</option>
                        </Form.Select>
                      </div>
                      <div className="col-md-2">
                        <Form.Label>Year</Form.Label>
                        <Form.Control type="number" value={revenueYear} onChange={(e) => setRevenueYear(parseInt(e.target.value, 10))} size="sm" />
                      </div>
                      {revenuePeriod === 'quarterly' && (
                        <div className="col-md-2">
                          <Form.Label>Quarter</Form.Label>
                          <Form.Select value={revenueQuarter} onChange={(e) => setRevenueQuarter(parseInt(e.target.value, 10))} size="sm">
                            <option value={1}>Q1</option>
                            <option value={2}>Q2</option>
                            <option value={3}>Q3</option>
                            <option value={4}>Q4</option>
                          </Form.Select>
                        </div>
                      )}
                      {revenuePeriod === 'half-yearly' && (
                        <div className="col-md-2">
                          <Form.Label>Half</Form.Label>
                          <Form.Select value={revenueHalf} onChange={(e) => setRevenueHalf(parseInt(e.target.value, 10))} size="sm">
                            <option value={1}>H1 (Jan–Jun)</option>
                            <option value={2}>H2 (Jul–Dec)</option>
                          </Form.Select>
                        </div>
                      )}
                    </div>

                    {renderQueryResult(revenueQuery, 'Error loading revenue report', () => (
                      <>
                        <div className="row g-3 mb-3">
                          <div className="col-md-4">
                            <div className="p-3 bg-light rounded border h-100">
                              <span className="d-block text-muted small text-uppercase">Gross Revenue</span>
                              <span className="d-block h3 fw-bold text-dark mb-0">
                                ₹{revenueQuery.data?.getAdminRevenueReport?.totalRevenue?.toLocaleString() || 0}
                              </span>
                              <small className="text-muted">
                                {revenuePeriod === 'quarterly' && `Q${revenueQuarter} ${revenueYear}`}
                                {revenuePeriod === 'half-yearly' && `H${revenueHalf} ${revenueYear}`}
                                {revenuePeriod === 'annual' && `${revenueYear}`}
                              </small>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="p-3 bg-light rounded border h-100">
                              <span className="d-block text-muted small text-uppercase">Coupon Discount</span>
                              <span className="d-block h3 fw-bold text-danger mb-0">
                                ₹{revenueQuery.data?.getAdminRevenueReport?.totalCouponDiscount?.toLocaleString() || 0}
                              </span>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="p-3 bg-light rounded border h-100">
                              <span className="d-block text-muted small text-uppercase">Net Revenue</span>
                              <span className="d-block h3 fw-bold text-success mb-0">
                                ₹{revenueQuery.data?.getAdminRevenueReport?.totalNetRevenue?.toLocaleString() || 0}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Table bordered hover responsive size="sm">
                          <thead className="table-light">
                            <tr>
                              <th>Tier Name</th>
                              <th className="text-end">Gross Revenue (₹)</th>
                              <th className="text-end">Coupon Discount (₹)</th>
                              <th className="text-end">Net Revenue (₹)</th>
                              <th className="text-center">Ad Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {revenueQuery.data?.getAdminRevenueReport?.breakdown?.map((item, idx) => (
                              <tr key={idx}>
                                <td>{item.tierName}</td>
                                <td className="text-end fw-bold">₹{item.revenue?.toLocaleString()}</td>
                                <td className="text-end text-danger">₹{item.couponDiscount?.toLocaleString()}</td>
                                <td className="text-end text-success fw-bold">₹{item.netRevenue?.toLocaleString()}</td>
                                <td className="text-center">{item.adCount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>

                        <Button
                          variant="link"
                          size="sm"
                          className="d-print-none"
                          onClick={() => exportToCSV(revenueQuery.data?.getAdminRevenueReport?.breakdown || [], 'revenue_report')}
                        >
                          <ArrowDownTrayIcon style={{ width: '14px', height: '14px' }} className="me-1" />
                          Export CSV
                        </Button>
                      </>
                    ))}
                  </div>

                  {/* ==========================================
                2. TIER SALES REPORT
                ========================================== */}
                  <div className="mb-5">
                    <h5 className="fw-bold text-dark border-bottom mb-3 pb-2">2. Sales by Tier</h5>

                    {/* Filters */}
                    <div className="row g-3 mb-3 d-print-none">
                      <div className="col-md-2">
                        <Form.Label>Start Quarter</Form.Label>
                        <Form.Select value={tierSalesStartQuarter} onChange={(e) => setTierSalesStartQuarter(parseInt(e.target.value, 10))} size="sm">
                          <option value={1}>Q1</option>
                          <option value={2}>Q2</option>
                          <option value={3}>Q3</option>
                          <option value={4}>Q4</option>
                        </Form.Select>
                      </div>
                      <div className="col-md-2">
                        <Form.Label>Start Year</Form.Label>
                        <Form.Control
                          type="number"
                          value={tierSalesStartYear}
                          onChange={(e) => setTierSalesStartYear(parseInt(e.target.value, 10))}
                          size="sm"
                        />
                      </div>
                      <div className="col-md-2">
                        <Form.Label>End Quarter</Form.Label>
                        <Form.Select value={tierSalesEndQuarter} onChange={(e) => setTierSalesEndQuarter(parseInt(e.target.value, 10))} size="sm">
                          <option value={1}>Q1</option>
                          <option value={2}>Q2</option>
                          <option value={3}>Q3</option>
                          <option value={4}>Q4</option>
                        </Form.Select>
                      </div>
                      <div className="col-md-2">
                        <Form.Label>End Year</Form.Label>
                        <Form.Control type="number" value={tierSalesEndYear} onChange={(e) => setTierSalesEndYear(parseInt(e.target.value, 10))} size="sm" />
                      </div>
                    </div>

                    {renderQueryResult(tierSalesQuery, 'Error loading tier sales report', () => (
                      <>
                        <Table bordered hover responsive size="sm">
                          <thead className="table-light">
                            <tr>
                              <th>Tier Name</th>
                              <th className="text-center">Total Ads Sold</th>
                              <th className="text-center">Banners</th>
                              <th className="text-center">Stamps</th>
                              <th className="text-end">Gross Revenue (₹)</th>
                              <th className="text-end">Coupon Discount (₹)</th>
                              <th className="text-end">Net Revenue (₹)</th>
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
                                <td className="text-end text-danger">₹{item.couponDiscount?.toLocaleString()}</td>
                                <td className="text-end text-success fw-bold">₹{item.netRevenue?.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>

                        <Button
                          variant="link"
                          size="sm"
                          className="d-print-none"
                          onClick={() => exportToCSV(tierSalesQuery.data?.getAdminTierSalesReport || [], 'tier_sales_report')}
                        >
                          <ArrowDownTrayIcon style={{ width: '14px', height: '14px' }} className="me-1" />
                          Export CSV
                        </Button>
                      </>
                    ))}
                  </div>

                  {/* ==========================================
                3. SLOT UTILIZATION
                ========================================== */}
                  <div className="mb-5">
                    <h5 className="fw-bold text-dark border-bottom mb-3 pb-2">3. Slot Utilization</h5>

                    {renderQueryResult(slotUtilizationQuery, 'Error loading slot utilization', () => (
                      <>
                        <div className="row g-3 mb-3">
                          <div className="col-md-3">
                            <div className="p-3 bg-light rounded border">
                              <span className="d-block text-muted small">Total Slots</span>
                              <span className="d-block h4 fw-bold text-dark mb-0">{slotUtilizationQuery.data?.getAdminSlotUtilization?.totalSlots || 0}</span>
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
                          onClick={() => exportToCSV(slotUtilizationQuery.data?.getAdminSlotUtilization?.tierBreakdown || [], 'slot_utilization_report')}
                        >
                          <ArrowDownTrayIcon style={{ width: '14px', height: '14px' }} className="me-1" />
                          Export CSV
                        </Button>
                      </>
                    ))}
                  </div>

                  {/* ==========================================
                4. PENDING APPROVALS
                ========================================== */}
                  <div className="mb-5">
                    <h5 className="fw-bold text-dark border-bottom mb-3 pb-2">4. Pending Approvals</h5>

                    {renderQueryResult(pendingApprovalsQuery, 'Error loading pending approvals', () => (
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
                                <td>{formatDate(item.requestDate)}</td>
                                <td className="text-center">{item.slotsRequested}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>

                        <Button
                          variant="link"
                          size="sm"
                          className="d-print-none"
                          onClick={() => exportToCSV(pendingApprovalsQuery.data?.getAdminPendingApprovals?.requests || [], 'pending_approvals_report')}
                        >
                          <ArrowDownTrayIcon style={{ width: '14px', height: '14px' }} className="me-1" />
                          Export CSV
                        </Button>
                      </>
                    ))}
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
                        <Form.Control type="number" value={expiryDays} onChange={(e) => setExpiryDays(parseInt(e.target.value, 10))} size="sm" min="1" />
                      </div>
                    </div>

                    {renderQueryResult(expiryQuery, 'Error loading expiring ads', () => (
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
                                <td>{formatDate(item.endDate)}</td>
                                <td className="text-center">
                                  <span className={`badge ${item.remainingDays <= 7 ? 'bg-danger' : 'bg-warning text-dark'}`}>{item.remainingDays} days</span>
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
                          onClick={() => exportToCSV(expiryQuery.data?.getAdminExpiryUpcoming || [], 'expiring_ads_report')}
                        >
                          <ArrowDownTrayIcon style={{ width: '14px', height: '14px' }} className="me-1" />
                          Export CSV
                        </Button>
                      </>
                    ))}
                  </div>

                  {/* ==========================================
                6. ADVERTISER SPENDING
                ========================================== */}
                  <div className="mb-4">
                    <h5 className="fw-bold text-dark border-bottom mb-3 pb-2">6. Advertiser Spending</h5>

                    {/* Filters */}
                    <div className="row g-3 mb-3 d-print-none">
                      <div className="col-md-2">
                        <Form.Label>Start Quarter</Form.Label>
                        <Form.Select value={advertiserStartQuarter} onChange={(e) => setAdvertiserStartQuarter(parseInt(e.target.value, 10))} size="sm">
                          <option value={1}>Q1</option>
                          <option value={2}>Q2</option>
                          <option value={3}>Q3</option>
                          <option value={4}>Q4</option>
                        </Form.Select>
                      </div>
                      <div className="col-md-2">
                        <Form.Label>Start Year</Form.Label>
                        <Form.Control
                          type="number"
                          value={advertiserStartYear}
                          onChange={(e) => setAdvertiserStartYear(parseInt(e.target.value, 10))}
                          size="sm"
                        />
                      </div>
                      <div className="col-md-2">
                        <Form.Label>End Quarter</Form.Label>
                        <Form.Select value={advertiserEndQuarter} onChange={(e) => setAdvertiserEndQuarter(parseInt(e.target.value, 10))} size="sm">
                          <option value={1}>Q1</option>
                          <option value={2}>Q2</option>
                          <option value={3}>Q3</option>
                          <option value={4}>Q4</option>
                        </Form.Select>
                      </div>
                      <div className="col-md-2">
                        <Form.Label>End Year</Form.Label>
                        <Form.Control type="number" value={advertiserEndYear} onChange={(e) => setAdvertiserEndYear(parseInt(e.target.value, 10))} size="sm" />
                      </div>
                    </div>

                    {renderQueryResult(advertiserSpendingQuery, 'Error loading advertiser spending', () => (
                      <>
                        <Table bordered hover responsive size="sm">
                          <thead className="table-light">
                            <tr>
                              <th>Seller Name</th>
                              <th>Email</th>
                              <th className="text-end">Gross Spent (₹)</th>
                              <th className="text-end">Coupon Discount (₹)</th>
                              <th className="text-end">Net Spent (₹)</th>
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
                                <td className="text-end">₹{(item.totalSpent + item.totalCouponDiscount)?.toLocaleString()}</td>
                                <td className="text-end text-danger">₹{item.totalCouponDiscount?.toLocaleString()}</td>
                                <td className="text-end fw-bold text-success">₹{item.totalSpent?.toLocaleString()}</td>
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
                          onClick={() => exportToCSV(advertiserSpendingQuery.data?.getAdminAdvertiserSpending || [], 'advertiser_spending_report')}
                        >
                          <ArrowDownTrayIcon style={{ width: '14px', height: '14px' }} className="me-1" />
                          Export CSV
                        </Button>
                      </>
                    ))}
                  </div>
                </Tab.Pane>

                {/* ==========================================
                    PRODUCT AD REPORTS TAB
                    ========================================== */}
                <Tab.Pane eventKey="product">
                  {/* P1. PRODUCT AD REVENUE REPORT */}
                  <div className="mb-5">
                    <h5 className="fw-bold text-dark border-bottom mb-3 pb-2">1. Product Ad Revenue Report</h5>
                    <div className="row g-3 mb-3 d-print-none">
                      <div className="col-md-3">
                        <Form.Label>Period</Form.Label>
                        <Form.Select value={productAdRevenuePeriod} onChange={(e) => setProductAdRevenuePeriod(e.target.value)} size="sm">
                          <option value="quarterly">Quarterly</option>
                          <option value="half-yearly">Half-Yearly</option>
                          <option value="annual">Annual</option>
                        </Form.Select>
                      </div>
                      <div className="col-md-2">
                        <Form.Label>Year</Form.Label>
                        <Form.Control
                          type="number"
                          value={productAdRevenueYear}
                          onChange={(e) => setProductAdRevenueYear(parseInt(e.target.value, 10))}
                          size="sm"
                        />
                      </div>
                      {productAdRevenuePeriod === 'quarterly' && (
                        <div className="col-md-2">
                          <Form.Label>Quarter</Form.Label>
                          <Form.Select value={productAdRevenueQuarter} onChange={(e) => setProductAdRevenueQuarter(parseInt(e.target.value, 10))} size="sm">
                            <option value={1}>Q1</option>
                            <option value={2}>Q2</option>
                            <option value={3}>Q3</option>
                            <option value={4}>Q4</option>
                          </Form.Select>
                        </div>
                      )}
                      {productAdRevenuePeriod === 'half-yearly' && (
                        <div className="col-md-2">
                          <Form.Label>Half</Form.Label>
                          <Form.Select value={productAdRevenueHalf} onChange={(e) => setProductAdRevenueHalf(parseInt(e.target.value, 10))} size="sm">
                            <option value={1}>H1 (Jan–Jun)</option>
                            <option value={2}>H2 (Jul–Dec)</option>
                          </Form.Select>
                        </div>
                      )}
                    </div>
                    {renderQueryResult(productAdRevenueQuery, 'Error loading product ad revenue report', () => (
                      <>
                        <div className="row g-3 mb-3">
                          <div className="col-md-4">
                            <div className="p-3 bg-light rounded border h-100">
                              <span className="d-block text-muted small text-uppercase">Gross Revenue</span>
                              <span className="d-block h3 fw-bold text-dark mb-0">
                                ₹{productAdRevenueQuery.data?.getAdminProductAdRevenueReport?.totalRevenue?.toLocaleString() || 0}
                              </span>
                              <small className="text-muted">
                                {productAdRevenuePeriod === 'quarterly' && `Q${productAdRevenueQuarter} ${productAdRevenueYear}`}
                                {productAdRevenuePeriod === 'half-yearly' && `H${productAdRevenueHalf} ${productAdRevenueYear}`}
                                {productAdRevenuePeriod === 'annual' && `${productAdRevenueYear}`}
                              </small>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="p-3 bg-light rounded border h-100">
                              <span className="d-block text-muted small text-uppercase">Coupon Discount</span>
                              <span className="d-block h3 fw-bold text-danger mb-0">
                                ₹{productAdRevenueQuery.data?.getAdminProductAdRevenueReport?.totalCouponDiscount?.toLocaleString() || 0}
                              </span>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="p-3 bg-light rounded border h-100">
                              <span className="d-block text-muted small text-uppercase">Net Revenue</span>
                              <span className="d-block h3 fw-bold text-success mb-0">
                                ₹{productAdRevenueQuery.data?.getAdminProductAdRevenueReport?.totalNetRevenue?.toLocaleString() || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Table bordered hover responsive size="sm">
                          <thead className="table-light">
                            <tr>
                              <th>Tier Name</th>
                              <th className="text-end">Gross Revenue (₹)</th>
                              <th className="text-end">Coupon Discount (₹)</th>
                              <th className="text-end">Net Revenue (₹)</th>
                              <th className="text-center">Ad Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productAdRevenueQuery.data?.getAdminProductAdRevenueReport?.breakdown?.map((item, idx) => (
                              <tr key={idx}>
                                <td>{item.tierName}</td>
                                <td className="text-end fw-bold">₹{item.revenue?.toLocaleString()}</td>
                                <td className="text-end text-danger">₹{item.couponDiscount?.toLocaleString()}</td>
                                <td className="text-end text-success fw-bold">₹{item.netRevenue?.toLocaleString()}</td>
                                <td className="text-center">{item.adCount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                        <Button
                          variant="link"
                          size="sm"
                          className="d-print-none"
                          onClick={() => exportToCSV(productAdRevenueQuery.data?.getAdminProductAdRevenueReport?.breakdown || [], 'product_ad_revenue_report')}
                        >
                          <ArrowDownTrayIcon style={{ width: '14px', height: '14px' }} className="me-1" />
                          Export CSV
                        </Button>
                      </>
                    ))}
                  </div>

                  {/* P2. PRODUCT AD TIER SALES REPORT */}
                  <div className="mb-5">
                    <h5 className="fw-bold text-dark border-bottom mb-3 pb-2">2. Product Ad Sales by Tier</h5>
                    <div className="row g-3 mb-3 d-print-none">
                      <div className="col-md-2">
                        <Form.Label>Start Quarter</Form.Label>
                        <Form.Select
                          value={productAdTierSalesStartQuarter}
                          onChange={(e) => setProductAdTierSalesStartQuarter(parseInt(e.target.value, 10))}
                          size="sm"
                        >
                          <option value={1}>Q1</option>
                          <option value={2}>Q2</option>
                          <option value={3}>Q3</option>
                          <option value={4}>Q4</option>
                        </Form.Select>
                      </div>
                      <div className="col-md-2">
                        <Form.Label>Start Year</Form.Label>
                        <Form.Control
                          type="number"
                          value={productAdTierSalesStartYear}
                          onChange={(e) => setProductAdTierSalesStartYear(parseInt(e.target.value, 10))}
                          size="sm"
                        />
                      </div>
                      <div className="col-md-2">
                        <Form.Label>End Quarter</Form.Label>
                        <Form.Select
                          value={productAdTierSalesEndQuarter}
                          onChange={(e) => setProductAdTierSalesEndQuarter(parseInt(e.target.value, 10))}
                          size="sm"
                        >
                          <option value={1}>Q1</option>
                          <option value={2}>Q2</option>
                          <option value={3}>Q3</option>
                          <option value={4}>Q4</option>
                        </Form.Select>
                      </div>
                      <div className="col-md-2">
                        <Form.Label>End Year</Form.Label>
                        <Form.Control
                          type="number"
                          value={productAdTierSalesEndYear}
                          onChange={(e) => setProductAdTierSalesEndYear(parseInt(e.target.value, 10))}
                          size="sm"
                        />
                      </div>
                    </div>
                    {renderQueryResult(productAdTierSalesQuery, 'Error loading product ad tier sales report', () => (
                      <>
                        <Table bordered hover responsive size="sm">
                          <thead className="table-light">
                            <tr>
                              <th>Tier Name</th>
                              <th className="text-center">Total Ads Sold</th>
                              <th className="text-center">Banners</th>
                              <th className="text-center">Stamps</th>
                              <th className="text-end">Gross Revenue (₹)</th>
                              <th className="text-end">Coupon Discount (₹)</th>
                              <th className="text-end">Net Revenue (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productAdTierSalesQuery.data?.getAdminProductAdTierSalesReport?.map((item, idx) => (
                              <tr key={idx}>
                                <td>{item.tierName}</td>
                                <td className="text-center fw-bold">{item.totalAdsSold}</td>
                                <td className="text-center">{item.bannerCount}</td>
                                <td className="text-center">{item.stampCount}</td>
                                <td className="text-end">₹{item.revenue?.toLocaleString()}</td>
                                <td className="text-end text-danger">₹{item.couponDiscount?.toLocaleString()}</td>
                                <td className="text-end text-success fw-bold">₹{item.netRevenue?.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                        <Button
                          variant="link"
                          size="sm"
                          className="d-print-none"
                          onClick={() => exportToCSV(productAdTierSalesQuery.data?.getAdminProductAdTierSalesReport || [], 'product_ad_tier_sales_report')}
                        >
                          <ArrowDownTrayIcon style={{ width: '14px', height: '14px' }} className="me-1" />
                          Export CSV
                        </Button>
                      </>
                    ))}
                  </div>

                  {/* P3. PRODUCT AD PENDING APPROVALS */}
                  <div className="mb-5">
                    <h5 className="fw-bold text-dark border-bottom mb-3 pb-2">3. Product Ad Pending Approvals</h5>
                    {renderQueryResult(productAdPendingApprovalsQuery, 'Error loading pending approvals', () => (
                      <>
                        <div className="alert alert-warning mb-3">
                          <strong>{productAdPendingApprovalsQuery.data?.getAdminProductAdPendingApprovals?.count || 0}</strong> product ad requests pending
                          approval
                        </div>
                        <Table bordered hover responsive size="sm">
                          <thead className="table-light">
                            <tr>
                              <th>Seller Name</th>
                              <th>Email</th>
                              <th>Product</th>
                              <th>Tier</th>
                              <th>Request Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productAdPendingApprovalsQuery.data?.getAdminProductAdPendingApprovals?.requests?.map((item) => (
                              <tr key={item.id}>
                                <td className="fw-bold">{item.sellerName}</td>
                                <td>{item.sellerEmail}</td>
                                <td>{item.productName}</td>
                                <td>{item.tierName}</td>
                                <td>{formatDate(item.requestDate)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                        <Button
                          variant="link"
                          size="sm"
                          className="d-print-none"
                          onClick={() =>
                            exportToCSV(productAdPendingApprovalsQuery.data?.getAdminProductAdPendingApprovals?.requests || [], 'product_ad_pending_approvals')
                          }
                        >
                          <ArrowDownTrayIcon style={{ width: '14px', height: '14px' }} className="me-1" />
                          Export CSV
                        </Button>
                      </>
                    ))}
                  </div>

                  {/* P4. PRODUCT AD EXPIRING ADS */}
                  <div className="mb-5">
                    <h5 className="fw-bold text-dark border-bottom mb-3 pb-2">4. Expiring Product Ads</h5>
                    <div className="row g-3 mb-3 d-print-none">
                      <div className="col-md-3">
                        <Form.Label>Days Ahead</Form.Label>
                        <Form.Control
                          type="number"
                          value={productAdExpiryDays}
                          onChange={(e) => setProductAdExpiryDays(parseInt(e.target.value, 10))}
                          size="sm"
                          min="1"
                        />
                      </div>
                    </div>
                    {renderQueryResult(productAdExpiryQuery, 'Error loading expiring product ads', () => (
                      <>
                        <Table bordered hover responsive size="sm">
                          <thead className="table-light">
                            <tr>
                              <th>Seller Name</th>
                              <th>Product</th>
                              <th>Tier</th>
                              <th>Slot</th>
                              <th>End Date</th>
                              <th className="text-center">Days Remaining</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productAdExpiryQuery.data?.getAdminProductAdExpiryUpcoming?.map((item) => (
                              <tr key={item.id}>
                                <td className="fw-bold">{item.sellerName}</td>
                                <td>{item.productName}</td>
                                <td>{item.tierName}</td>
                                <td>{item.slot}</td>
                                <td>{formatDate(item.endDate)}</td>
                                <td className="text-center">
                                  <span className={`badge ${item.remainingDays <= 7 ? 'bg-danger' : 'bg-warning text-dark'}`}>{item.remainingDays} days</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                        {(!productAdExpiryQuery.data?.getAdminProductAdExpiryUpcoming ||
                          productAdExpiryQuery.data.getAdminProductAdExpiryUpcoming.length === 0) && (
                          <div className="alert alert-info">No product ads expiring in the next {productAdExpiryDays} days</div>
                        )}
                        <Button
                          variant="link"
                          size="sm"
                          className="d-print-none"
                          onClick={() => exportToCSV(productAdExpiryQuery.data?.getAdminProductAdExpiryUpcoming || [], 'expiring_product_ads_report')}
                        >
                          <ArrowDownTrayIcon style={{ width: '14px', height: '14px' }} className="me-1" />
                          Export CSV
                        </Button>
                      </>
                    ))}
                  </div>

                  {/* P5. PRODUCT AD ADVERTISER SPENDING */}
                  <div className="mb-4">
                    <h5 className="fw-bold text-dark border-bottom mb-3 pb-2">5. Product Ad Advertiser Spending</h5>
                    <div className="row g-3 mb-3 d-print-none">
                      <div className="col-md-2">
                        <Form.Label>Start Quarter</Form.Label>
                        <Form.Select
                          value={productAdAdvertiserStartQuarter}
                          onChange={(e) => setProductAdAdvertiserStartQuarter(parseInt(e.target.value, 10))}
                          size="sm"
                        >
                          <option value={1}>Q1</option>
                          <option value={2}>Q2</option>
                          <option value={3}>Q3</option>
                          <option value={4}>Q4</option>
                        </Form.Select>
                      </div>
                      <div className="col-md-2">
                        <Form.Label>Start Year</Form.Label>
                        <Form.Control
                          type="number"
                          value={productAdAdvertiserStartYear}
                          onChange={(e) => setProductAdAdvertiserStartYear(parseInt(e.target.value, 10))}
                          size="sm"
                        />
                      </div>
                      <div className="col-md-2">
                        <Form.Label>End Quarter</Form.Label>
                        <Form.Select
                          value={productAdAdvertiserEndQuarter}
                          onChange={(e) => setProductAdAdvertiserEndQuarter(parseInt(e.target.value, 10))}
                          size="sm"
                        >
                          <option value={1}>Q1</option>
                          <option value={2}>Q2</option>
                          <option value={3}>Q3</option>
                          <option value={4}>Q4</option>
                        </Form.Select>
                      </div>
                      <div className="col-md-2">
                        <Form.Label>End Year</Form.Label>
                        <Form.Control
                          type="number"
                          value={productAdAdvertiserEndYear}
                          onChange={(e) => setProductAdAdvertiserEndYear(parseInt(e.target.value, 10))}
                          size="sm"
                        />
                      </div>
                    </div>
                    {renderQueryResult(productAdAdvertiserSpendingQuery, 'Error loading product ad advertiser spending', () => (
                      <>
                        <Table bordered hover responsive size="sm">
                          <thead className="table-light">
                            <tr>
                              <th>Seller Name</th>
                              <th>Email</th>
                              <th className="text-end">Gross Spent (₹)</th>
                              <th className="text-end">Coupon Discount (₹)</th>
                              <th className="text-end">Net Spent (₹)</th>
                              <th className="text-center">Total Ads</th>
                              <th className="text-center">Active Ads</th>
                              <th className="text-center">Completed Ads</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productAdAdvertiserSpendingQuery.data?.getAdminProductAdAdvertiserSpending?.map((item, idx) => (
                              <tr key={idx}>
                                <td className="fw-bold">{item.sellerName}</td>
                                <td>{item.sellerEmail}</td>
                                <td className="text-end">₹{(item.totalSpent + item.totalCouponDiscount)?.toLocaleString()}</td>
                                <td className="text-end text-danger">₹{item.totalCouponDiscount?.toLocaleString()}</td>
                                <td className="text-end fw-bold text-success">₹{item.totalSpent?.toLocaleString()}</td>
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
                          onClick={() =>
                            exportToCSV(
                              productAdAdvertiserSpendingQuery.data?.getAdminProductAdAdvertiserSpending || [],
                              'product_ad_advertiser_spending_report'
                            )
                          }
                        >
                          <ArrowDownTrayIcon style={{ width: '14px', height: '14px' }} className="me-1" />
                          Export CSV
                        </Button>
                      </>
                    ))}
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminReports;
