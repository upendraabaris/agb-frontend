import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { toast } from 'react-toastify';
import { Spinner, Table, Nav, Tab, Button } from 'react-bootstrap';
import { ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';
import HtmlHead from 'components/html-head/HtmlHead';
import BreadcrumbList from 'components/breadcrumb-list/BreadcrumbList';

// ==========================================
// GraphQL Queries
// ==========================================

const GET_MY_ACTIVE_ADS = gql`
  query GetMyActiveAds {
    getMyActiveAds {
      id
      categoryRequestId
      categoryId
      categoryName
      tierId
      tierName
      slot
      status
      startDate
      endDate
      remainingDays
      durationDays
      media {
        slot
        mobileImageUrl
        desktopImageUrl
        redirectUrl
      }
    }
  }
`;

const GET_MY_PAST_ADS = gql`
  query GetMyPastAds {
    getMyPastAds {
      id
      categoryRequestId
      categoryId
      categoryName
      tierId
      tierName
      slot
      status
      startDate
      endDate
      durationDays
      completedDate
    }
  }
`;

const GET_MY_AD_VALIDITY = gql`
  query GetMyAdValidity {
    getMyAdValidity {
      adId
      categoryRequestId
      categoryName
      slot
      endDate
      remainingDays
      status
      isExpiringSoon
    }
  }
`;

// ==========================================
// Component
// ==========================================

const SellerReports = () => {
    const title = 'My Advertisement Reports';
    const description = 'Track your advertisement campaigns and performance';
    const breadcrumbs = [
        { id: '0', name: 'Dashboard', icon: 'home' },
        { id: '1', name: 'Advertisement' },
        { id: '2', name: 'Reports' }
    ];

    const [activeTab, setActiveTab] = useState('active');

    // GraphQL Queries
    const activeAdsQuery = useQuery(GET_MY_ACTIVE_ADS, {
        onError: (error) => toast.error(`Active Ads Error: ${error.message}`)
    });

    const pastAdsQuery = useQuery(GET_MY_PAST_ADS, {
        onError: (error) => toast.error(`Past Ads Error: ${error.message}`)
    });

    const validityQuery = useQuery(GET_MY_AD_VALIDITY, {
        onError: (error) => toast.error(`Validity Error: ${error.message}`)
    });

    // Export to CSV function
    const exportToCSV = (data, filename) => {
        if (!data || data.length === 0) {
            toast.warning('No data to export');
            return;
        }

        const headers = Object.keys(data[0]).filter(key => typeof data[0][key] !== 'object');
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
                                <h1 className="h3 fw-bold text-dark mb-1">Advertiser Campaign Report</h1>
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

                        {/* Tabbed Interface */}
                        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                            <Nav variant="tabs" className="mb-4 d-print-none">
                                <Nav.Item>
                                    <Nav.Link eventKey="active">Active Ads</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="past">Past Ads</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="validity">Validity Overview</Nav.Link>
                                </Nav.Item>
                            </Nav>

                            <Tab.Content>
                                {/* ==========================================
                    TAB 1: ACTIVE ADS
                    ========================================== */}
                                <Tab.Pane eventKey="active">
                                    <h5 className="fw-bold text-dark border-bottom mb-3 pb-2">Active Advertisements</h5>

                                    {activeAdsQuery.loading && (
                                        <div className="text-center p-4"><Spinner animation="border" size="sm" /></div>
                                    )}
                                    {!activeAdsQuery.loading && activeAdsQuery.error && (
                                        <div className="alert alert-danger">Error loading active ads</div>
                                    )}
                                    {!activeAdsQuery.loading && !activeAdsQuery.error && (
                                        <>
                                            <div className="alert alert-info mb-3">
                                                <strong>{activeAdsQuery.data?.getMyActiveAds?.length || 0}</strong> active advertisement(s)
                                            </div>

                                            <Table bordered hover responsive size="sm">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Category</th>
                                                        <th>Tier</th>
                                                        <th>Slot</th>
                                                        <th>Start Date</th>
                                                        <th>End Date</th>
                                                        <th className="text-center">Duration (Days)</th>
                                                        <th className="text-center">Remaining Days</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {activeAdsQuery.data?.getMyActiveAds?.map((ad) => (
                                                        <tr key={ad.id}>
                                                            <td className="fw-bold">{ad.categoryName}</td>
                                                            <td>{ad.tierName}</td>
                                                            <td><code>{ad.slot}</code></td>
                                                            <td>{new Date(ad.startDate).toLocaleDateString()}</td>
                                                            <td>{new Date(ad.endDate).toLocaleDateString()}</td>
                                                            <td className="text-center">{ad.durationDays}</td>
                                                            <td className="text-center">
                                                                <span className={`badge ${ad.remainingDays <= 7 ? 'bg-warning text-dark' : 'bg-success'}`}>
                                                                    {ad.remainingDays} days
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className="badge bg-success">{ad.status}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>

                                            {(!activeAdsQuery.data?.getMyActiveAds || activeAdsQuery.data.getMyActiveAds.length === 0) && (
                                                <div className="alert alert-info">No active advertisements found</div>
                                            )}

                                            {/* Media Details Section */}
                                            {activeAdsQuery.data?.getMyActiveAds?.some(ad => ad.media) && (
                                                <>
                                                    <h6 className="fw-bold mt-4 mb-3">Media Details</h6>
                                                    <Table bordered responsive size="sm">
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th>Slot</th>
                                                                <th>Mobile Image</th>
                                                                <th>Desktop Image</th>
                                                                <th>Redirect URL</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {activeAdsQuery.data?.getMyActiveAds
                                                                ?.filter(ad => ad.media)
                                                                .map((ad) => (
                                                                    <tr key={ad.id}>
                                                                        <td><code>{ad.media.slot}</code></td>
                                                                        <td className="text-truncate" style={{ maxWidth: '200px' }}>
                                                                            <a href={ad.media.mobileImageUrl} target="_blank" rel="noopener noreferrer" className="text-decoration-none small">
                                                                                {ad.media.mobileImageUrl}
                                                                            </a>
                                                                        </td>
                                                                        <td className="text-truncate" style={{ maxWidth: '200px' }}>
                                                                            <a href={ad.media.desktopImageUrl} target="_blank" rel="noopener noreferrer" className="text-decoration-none small">
                                                                                {ad.media.desktopImageUrl}
                                                                            </a>
                                                                        </td>
                                                                        <td className="text-truncate" style={{ maxWidth: '150px' }}>
                                                                            <small>{ad.media.redirectUrl}</small>
                                                                        </td>
                                                                        {/* <td className="text-truncate" style={{ maxWidth: '150px' }}>
                                                                            <small>{ad.media.desktopRedirectUrl}</small>
                                                                        </td> */}
                                                                    </tr>
                                                                ))}
                                                        </tbody>
                                                    </Table>
                                                </>
                                            )}

                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="d-print-none"
                                                onClick={() => exportToCSV(
                                                    activeAdsQuery.data?.getMyActiveAds || [],
                                                    'active_ads_report'
                                                )}
                                            >
                                                <ArrowDownTrayIcon style={{ width: '14px', height: '14px' }} className="me-1" />
                                                Export CSV
                                            </Button>
                                        </>
                                    )}
                                </Tab.Pane>

                                {/* ==========================================
                    TAB 2: PAST ADS
                    ========================================== */}
                                <Tab.Pane eventKey="past">
                                    <h5 className="fw-bold text-dark border-bottom mb-3 pb-2">Past Advertisements</h5>

                                    {pastAdsQuery.loading && (
                                        <div className="text-center p-4"><Spinner animation="border" size="sm" /></div>
                                    )}
                                    {!pastAdsQuery.loading && pastAdsQuery.error && (
                                        <div className="alert alert-danger">Error loading past ads</div>
                                    )}
                                    {!pastAdsQuery.loading && !pastAdsQuery.error && (
                                        <>
                                            <div className="alert alert-secondary mb-3">
                                                <strong>{pastAdsQuery.data?.getMyPastAds?.length || 0}</strong> past advertisement(s)
                                            </div>

                                            <Table bordered hover responsive size="sm">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Category</th>
                                                        <th>Tier</th>
                                                        <th>Slot</th>
                                                        <th>Start Date</th>
                                                        <th>End Date</th>
                                                        <th className="text-center">Duration (Days)</th>
                                                        <th>Status</th>
                                                        <th>Completed Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pastAdsQuery.data?.getMyPastAds?.map((ad) => (
                                                        <tr key={ad.id}>
                                                            <td className="fw-bold">{ad.categoryName}</td>
                                                            <td>{ad.tierName}</td>
                                                            <td><code>{ad.slot}</code></td>
                                                            <td>{ad.startDate ? new Date(ad.startDate).toLocaleDateString() : 'N/A'}</td>
                                                            <td>{ad.endDate ? new Date(ad.endDate).toLocaleDateString() : 'N/A'}</td>
                                                            <td className="text-center">{ad.durationDays}</td>
                                                            <td>
                                                                <span className={`badge ${ad.status === 'completed' ? 'bg-secondary' : 'bg-danger'}`}>
                                                                    {ad.status}
                                                                </span>
                                                            </td>
                                                            <td>{ad.completedDate ? new Date(ad.completedDate).toLocaleDateString() : 'N/A'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>

                                            {(!pastAdsQuery.data?.getMyPastAds || pastAdsQuery.data.getMyPastAds.length === 0) && (
                                                <div className="alert alert-info">No past advertisements found</div>
                                            )}

                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="d-print-none"
                                                onClick={() => exportToCSV(
                                                    pastAdsQuery.data?.getMyPastAds || [],
                                                    'past_ads_report'
                                                )}
                                            >
                                                <ArrowDownTrayIcon style={{ width: '14px', height: '14px' }} className="me-1" />
                                                Export CSV
                                            </Button>
                                        </>
                                    )}
                                </Tab.Pane>

                                {/* ==========================================
                    TAB 3: VALIDITY OVERVIEW
                    ========================================== */}
                                <Tab.Pane eventKey="validity">
                                    <h5 className="fw-bold text-dark border-bottom mb-3 pb-2">Advertisement Validity Overview</h5>

                                    {validityQuery.loading && (
                                        <div className="text-center p-4"><Spinner animation="border" size="sm" /></div>
                                    )}
                                    {!validityQuery.loading && validityQuery.error && (
                                        <div className="alert alert-danger">Error loading validity information</div>
                                    )}
                                    {!validityQuery.loading && !validityQuery.error && (
                                        <>
                                            {/* Expiring Soon Warning */}
                                            {validityQuery.data?.getMyAdValidity?.some(ad => ad.isExpiringSoon) && (
                                                <div className="alert alert-warning mb-3">
                                                    <strong>⚠️ Warning:</strong> You have{' '}
                                                    <strong>
                                                        {validityQuery.data.getMyAdValidity.filter(ad => ad.isExpiringSoon).length}
                                                    </strong>{' '}
                                                    advertisement(s) expiring within 7 days!
                                                </div>
                                            )}

                                            <Table bordered hover responsive size="sm">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Category</th>
                                                        <th>Slot</th>
                                                        <th>End Date</th>
                                                        <th className="text-center">Remaining Days</th>
                                                        <th>Status</th>
                                                        <th className="text-center">Alert</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {validityQuery.data?.getMyAdValidity?.map((ad) => {
                                                        let badgeClass = 'bg-success';
                                                        if (ad.remainingDays <= 3) { badgeClass = 'bg-danger'; }
                                                        else if (ad.remainingDays <= 7) { badgeClass = 'bg-warning text-dark'; }
                                                        return (
                                                            <tr key={ad.adId} className={ad.isExpiringSoon ? 'table-warning' : ''}>
                                                                <td className="fw-bold">{ad.categoryName}</td>
                                                                <td><code>{ad.slot}</code></td>
                                                                <td>{new Date(ad.endDate).toLocaleDateString()}</td>
                                                                <td className="text-center">
                                                                    <span className={`badge ${badgeClass}`}>
                                                                        {ad.remainingDays} days
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className="badge bg-success">{ad.status}</span>
                                                                </td>
                                                                <td className="text-center">
                                                                    {ad.isExpiringSoon && (
                                                                        <span className="badge bg-warning text-dark">Expiring Soon</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </Table>

                                            {(!validityQuery.data?.getMyAdValidity || validityQuery.data.getMyAdValidity.length === 0) && (
                                                <div className="alert alert-info">No active advertisements to track</div>
                                            )}

                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="d-print-none"
                                                onClick={() => exportToCSV(
                                                    validityQuery.data?.getMyAdValidity || [],
                                                    'ad_validity_report'
                                                )}
                                            >
                                                <ArrowDownTrayIcon style={{ width: '14px', height: '14px' }} className="me-1" />
                                                Export CSV
                                            </Button>
                                        </>
                                    )}
                                </Tab.Pane>
                            </Tab.Content>
                        </Tab.Container>
                    </div>
                </div>
            </div >
        </>
    );
};

export default SellerReports;
