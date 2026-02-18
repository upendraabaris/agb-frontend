import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLazyQuery, gql } from '@apollo/client';
import DOMPurify from 'dompurify';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import { NavLink } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import './style.css';

function PrivacyPolicy() {
  const dispatch = useDispatch();
  const { dataStoreFeatures1 } = useGlobleContext();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);

  // GET SITE CONTENT

  const GET_SITE_CONTENT = gql`
    query GetSiteContent($key: String!) {
      getSiteContent(key: $key) {
        content
        key
        updatedAt
      }
    }
  `;

  const [getContent, { data: dataSiteContent }] = useLazyQuery(GET_SITE_CONTENT);

  useEffect(() => {
    getContent({
      variables: {
        key: 'privacy-policy',
      },
    });
  }, [dataSiteContent, getContent]);

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    <div>
      <style>
        {`.bg_color {
          background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
          color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
        }`}
        {`.font_color {
          color: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
        }`}
        {`
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
        `}
      </style>
      <h1 className="mb-4 p-2 mark text-center rounded">
        <span className="mb-1 fw-bold">Privacy Policy</span>
      </h1>
      <div className="row">
        <div className="col-12 col-md-2 d-none d-md-block">
          <div className="w-100 m-2 pb-2 border-bottom">
            <NavLink to="/privacy_policy" className="fw-bold">
              Privacy Policy
              <span className="float-end">
                {' '}
                <CsLineIcons icon="chevron-right" />{' '}
              </span>
            </NavLink>
          </div>
          <div className="w-100 m-2 pb-2 border-bottom">
            <NavLink to="/shipping_policy" className={({ isActive }) => `fw-bold ${isActive ? 'text-primary bg-light' : 'text-dark'}`}>
              Shipping Policy
              <span className="float-end">
                {' '}
                <CsLineIcons icon="chevron-right" />{' '}
              </span>
            </NavLink>
          </div>
          <div className="w-100 m-2 pb-2 border-bottom">
            <NavLink to="/return_policy" className={({ isActive }) => `fw-bold ${isActive ? 'text-primary bg-light' : 'text-dark'}`}>
              Return Policy
              <span className="float-end">
                {' '}
                <CsLineIcons icon="chevron-right" />{' '}
              </span>
            </NavLink>
          </div>
          <div className="w-100 m-2 pb-2 border-bottom">
            <NavLink to="/cancellation_policy" className={({ isActive }) => `fw-bold ${isActive ? 'text-primary bg-light' : 'text-dark'}`}>
              Cancellation Policy
              <span className="float-end">
                {' '}
                <CsLineIcons icon="chevron-right" />{' '}
              </span>
            </NavLink>
          </div>
          <div className="w-100 m-2 pb-2 border-bottom">
            <NavLink to="/cookie_policy" className={({ isActive }) => `fw-bold ${isActive ? 'text-primary bg-light' : 'text-dark'}`}>
              Cookie Policy
              <span className="float-end">
                {' '}
                <CsLineIcons icon="chevron-right" />{' '}
              </span>
            </NavLink>
          </div>
        </div>

        <div className="col-12 col-md-10">
          {/* eslint-disable-next-line react/no-danger */}
          <div className="p-1">
            Last Updated:{' '}
            {dataSiteContent?.getSiteContent?.updatedAt &&
              new Date(+dataSiteContent.getSiteContent.updatedAt)
                .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                .replace(/ /g, '-')}
          </div>
          {dataSiteContent && (
            <div className="p-1" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dataSiteContent.getSiteContent.content.replace(/<br>/g, '')) }} />
          )}
        </div>
      </div>
      <button className="btn_color fixed-bottom fixed-bottom-custom text-center d-block d-sm-none" onClick={toggleVisibility} type="button">
        View Policy
      </button>
      {isVisible && (
        <div className="fixed-bottom fixed-bottom-custom text-center d-block d-sm-none btn_color">
          <div className="col-12 col-md-2">
            <div className="w-100 m-2 pb-2 border-bottom">
              <NavLink to="/privacy_policy" className="fw-bold text-white">
                {' '}
                Privacy Policy
                <span className="float-end">
                  {' '}
                  <CsLineIcons icon="chevron-right" />{' '}
                </span>
              </NavLink>
            </div>
            <div className="w-100 m-2 pb-2 border-bottom">
              <NavLink to="/shipping_policy" className="fw-bold text-white">
                Shipping Policy
                <span className="float-end">
                  {' '}
                  <CsLineIcons icon="chevron-right" />{' '}
                </span>
              </NavLink>
            </div>
            <div className="w-100 m-2 pb-2 border-bottom">
              <NavLink to="/return_policy" className="fw-bold text-white">
                Return Policy
                <span className="float-end">
                  {' '}
                  <CsLineIcons icon="chevron-right" />{' '}
                </span>
              </NavLink>
            </div>
            <div className="w-100 m-2 pb-2 border-bottom">
              <NavLink to="/cancellation_policy" className="fw-bold text-white">
                Cancellation Policy
                <span className="float-end">
                  {' '}
                  <CsLineIcons icon="chevron-right" />{' '}
                </span>
              </NavLink>
            </div>
            <div className="w-100 m-2 pb-2 border-bottom">
              <NavLink to="/cookie_policy" className="fw-bold text-white">
                Cookie Policy
                <span className="float-end">
                  {' '}
                  <CsLineIcons icon="chevron-right" />{' '}
                </span>
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default PrivacyPolicy;
