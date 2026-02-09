import React, { useEffect, useState } from 'react';
import { useLazyQuery, gql } from '@apollo/client';
import DOMPurify from 'dompurify';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import './style.css';
import { useGlobleContext } from 'context/styleColor/ColorContext';

const GET_SITE_CONTENT = gql`
  query GetSiteContent($key: String!) {
    getSiteContent(key: $key) {
      content
      key
    }
  }
`;

function AboutUs() {
  const dispatch = useDispatch();
  const { dataStoreFeatures1 } = useGlobleContext();
  // const [value1, setValue1] = useState(0);
  // const [value2, setValue2] = useState(0);

  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);
  const [getContent, { data: dataSiteContent }] = useLazyQuery(GET_SITE_CONTENT);
  useEffect(() => {
    getContent({
      variables: {
        key: 'about-us',
      },
    });
  }, [dataSiteContent, getContent]);

  return (
    <div>
      <style>
        {`          
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
        <h1 className="mb-1 fw-bold fs-1 pt-6">About Us</h1>
        <div className="w-100 fs-6 pt-2">We deliver top-quality products with a focus on satisfaction.</div>
      </div>
      <div className="container">
        <div className="tab-container tab-container-width p-2 pb-4">
          <>
            {/* eslint-disable-next-line react/no-danger */}
            {dataSiteContent && (
              <div
                className="p-3 border"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dataSiteContent?.getSiteContent?.content.replace(/<br>/g, '')) }}
              />
            )}
          </>
        </div>
        <div className="accordion-container">
          <div className="accordion">
            <>
              {/* eslint-disable-next-line react/no-danger */}
              {dataSiteContent && (
                <div
                  className="p-3 border"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dataSiteContent?.getSiteContent?.content.replace(/<br>/g, '')) }}
                />
              )}
            </>
          </div>
        </div> 
        {/* <div className="tab-container tab-container-width p-2 pb-4">
          <input
            type="number"
            value={value1}
            onChange={(e) => setValue1(Number(e.target.value))}
            className="form-control mb-2"
            placeholder="Enter first number"
          />
          <input
            type="number"
            value={value2}
            onChange={(e) => setValue2(Number(e.target.value))}
            className="form-control mb-2"
            placeholder="Enter second number"
          />
          <div className="fw-bold">Sum: {value1 + value2}</div>
        </div> */}
      </div>
    </div>
  );
}
export default AboutUs;
