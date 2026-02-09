import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLazyQuery, gql } from '@apollo/client';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import DOMPurify from 'dompurify';
import './style.css';
import HtmlHead from 'components/html-head/HtmlHead';

const GET_SITE_CONTENT = gql`
  query GetSiteContent($key: String!) {
    getSiteContent(key: $key) {
      content
      key
      updatedAt
    }
  }
`;

function PrivacyPolicy() {
  const title = 'User Policies';
  const description = 'User Policies: All of our policies regarding privacy, shipping, return and cancellation';
  const dispatch = useDispatch();
  const { dataStoreFeatures1 } = useGlobleContext();
  const [activeSection, setActiveSection] = useState('section1');
  const [businessAssociateContent, setBusinessAssociateContent] = useState('');
  const [sellerAssociateContent, setSellerAssociateContent] = useState('');
  const [serviceProviderAssociateContent, setServiceProviderAssociateContent] = useState('');
  const [tradeAssociateContent, setTradeAssociateContent] = useState('');
  const [tncContent, setTncContent] = useState('');
  const [privacyUpdatedAt, setPrivacyUpdatedAt] = useState('');
  const [shippingUpdatedAt, setShippingUpdatedAt] = useState('');
  const [returnUpdatedAt, setReturnUpdatedAt] = useState('');
  const [cancellationUpdatedAt, setCancellationUpdatedAt] = useState('');
  const [tncUpdatedAt, setTncUpdatedAt] = useState('');
  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
  }, [dispatch]);
  const [getPrivacyPolicy] = useLazyQuery(GET_SITE_CONTENT, {
    onCompleted: (data) => {
      if (data?.getSiteContent?.key === 'privacy-policy') {
        setBusinessAssociateContent(data.getSiteContent.content);
        const formattedDate = new Date(Number(data.getSiteContent.updatedAt)).toLocaleDateString();
        setPrivacyUpdatedAt(formattedDate);
      }
    },
  });
  const [getShippingPolicy] = useLazyQuery(GET_SITE_CONTENT, {
    onCompleted: (data) => {
      if (data?.getSiteContent?.key === 'shipping') {
        setSellerAssociateContent(data.getSiteContent.content);
        const formattedDate = new Date(Number(data.getSiteContent.updatedAt)).toLocaleDateString();
        setShippingUpdatedAt(formattedDate);
      }
    },
  });
  const [getReturnPolicy] = useLazyQuery(GET_SITE_CONTENT, {
    onCompleted: (data) => {
      if (data?.getSiteContent?.key === 'return') {
        setServiceProviderAssociateContent(data.getSiteContent.content);
        const formattedDate = new Date(Number(data.getSiteContent.updatedAt)).toLocaleDateString();
        setReturnUpdatedAt(formattedDate);
      }
    },
  });
  const [getCancellationPolicy] = useLazyQuery(GET_SITE_CONTENT, {
    onCompleted: (data) => {
      if (data?.getSiteContent?.key === 'cancellation') {
        setTradeAssociateContent(data.getSiteContent.content);
        const formattedDate = new Date(Number(data.getSiteContent.updatedAt)).toLocaleDateString();
        setCancellationUpdatedAt(formattedDate);
      }
    },
  });
  const [getTncContent] = useLazyQuery(GET_SITE_CONTENT, {
    onCompleted: (data) => {
      if (data?.getSiteContent?.key === 't&c') {
        setTncContent(data.getSiteContent.content);
        const formattedDate = new Date(Number(data.getSiteContent.updatedAt)).toLocaleDateString();
        setTncUpdatedAt(formattedDate);
      }
    },
  });
  useEffect(() => {
    getPrivacyPolicy({ variables: { key: 'privacy-policy' } });
    getShippingPolicy({ variables: { key: 'shipping' } });
    getReturnPolicy({ variables: { key: 'return' } });
    getCancellationPolicy({ variables: { key: 'cancellation' } });
    getTncContent({ variables: { key: 't&c' } });
  }, [getPrivacyPolicy, getShippingPolicy, getReturnPolicy, getCancellationPolicy, getTncContent]);
  const tabContent = {
    section1: (
      <>
        <p className="updated-at">Last Updated: {privacyUpdatedAt}</p>
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(businessAssociateContent) }} />
        {/* <a href="/business_associate" rel="noopener noreferrer">Learn more</a> */}
      </>
    ),
    section2: (
      <>
        <p className="updated-at">Last Updated: {shippingUpdatedAt}</p>
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(sellerAssociateContent) }} />
        {/* <a href="/seller_associate" rel="noopener noreferrer">Learn more</a> */}
      </>
    ),
    section3: (
      <>
        <p className="updated-at">Last Updated: {returnUpdatedAt}</p>
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(serviceProviderAssociateContent) }} />
        {/* <a href="/service_provider_associate" rel="noopener noreferrer">Learn more</a> */}
      </>
    ),
    section4: (
      <>
        <p className="updated-at">Last Updated: {cancellationUpdatedAt}</p>
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tradeAssociateContent) }} />
        {/* <a href="/trade_associate" rel="noopener noreferrer">Learn more</a> */}
      </>
    ),
    section5: (
      <>
        <p className="updated-at">Last Updated: {tncUpdatedAt}</p>
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tncContent) }} />
      </>
    ),
  };
  const tabNames = {
    section1: 'General Privacy Policy',
    section2: 'General Shipping Policy',
    section3: 'General Return Policy',
    section4: 'General Cancellation Policy',
    section5: 'Cookie Policy',
  };
  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="bg-white">
        <style>
          {`
          .bg_color {
            background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
            color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
          }
          .font_color {
            color: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
          }
          .btn_color {
            background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
            color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
            transition: background 0.3s ease;
            padding: 10px 30px;
            border: none;
            cursor: pointer;
          }
          .btn_color:hover {
            background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
            filter: brightness(80%);
          }
            
          .custom-background {
            background-image: url('/img/advertisement/5.png');
            background-size: cover;
            background-position: center;
            width: 100%;
            height: 200px;
            display: flex;
            align-items: center; 
            justify-content: center;
          }
          .Header {
            display: block;
          }
          .Header h1, .Header div {
              display: block;
              width: 100%;
          }

          @media (max-width: 768px) {
            .tab-container {
              display: none;
            }
            .accordion-container {
              display: block;
            }
          }
          @media (min-width: 769px) {
            .tab-container {
              display: block;
            }
            .accordion-container {
              display: none;
            }
          }
        `}
        </style>
        <div className="Header text-white mb-2 p-2 text-center rounded custom-background">
          <h1 className="mb-1 fw-bold fs-1 pt-6">User Policies</h1>
          <div className="w-100 fs-6 pt-2">All of our policies regarding privacy, shipping, return and cancellation</div>
        </div>

        <div className="container">
          {/* Tab Container for PC */}
          <div className="tab-container tab-container-width p-2 pb-4">
            <ul className="nav nav-tabs" role="tablist">
              {Object.keys(tabContent).map((tabKey) => (
                <li className="nav-item border rounded" key={tabKey}>
                  <a
                    className={`nav-link text-center p-3 fs-6 fw-bold ${activeSection === tabKey ? 'active bg-dark' : ''}`}
                    onClick={() => setActiveSection(tabKey)}
                    style={{ cursor: 'pointer' }}
                  >
                    {tabNames[tabKey]}
                  </a>
                </li>
              ))}
            </ul>
            <div className="tab-content border p-2">
              {Object.keys(tabContent).map((tabKey) => (
                <div key={tabKey} className={`tab-pane fade ${activeSection === tabKey ? 'show active' : ''}`}>
                  {/* <div>Last updated: {data?.getSiteContent?.updatedAt}</div> */}
                  <div className="p-1">{tabContent[tabKey]}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="accordion-container">
            <div className="accordion" id="accordionExample">
              {Object.keys(tabContent).map((tabKey) => (
                <div className="accordion-item" key={tabKey}>
                  <h2 className="accordion-header" id={`heading-${tabKey}`}>
                    <button
                      className={`accordion-button fw-bold fs-6 ${activeSection === tabKey ? 'bg-dark' : 'collapsed'}`}
                      type="button"
                      onClick={() => toggleSection(tabKey)}
                      aria-expanded={activeSection === tabKey}
                      aria-controls={`collapse-${tabKey}`}
                    >
                      {tabNames[tabKey]}
                    </button>
                  </h2>
                  <div
                    id={`collapse-${tabKey}`}
                    className={`accordion-collapse collapse ${activeSection === tabKey ? 'show' : ''}`}
                    aria-labelledby={`heading-${tabKey}`}
                    data-bs-parent="#accordionExample"
                  >
                    <div className="accordion-body border-top border-bottom p-2 ps-4 px-4">{tabContent[tabKey]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PrivacyPolicy;
