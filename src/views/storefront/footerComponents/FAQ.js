import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLazyQuery, gql } from '@apollo/client';
import DOMPurify from 'dompurify';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import './style.css';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import HtmlHead from 'components/html-head/HtmlHead';

function FAQ() {
  const title = 'Frequently Asked Questions';
  const description = 'Frequently Asked Questions';
  const dispatch = useDispatch();
  const { dataStoreFeatures1 } = useGlobleContext();
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
      }
    }
  `;

  const [getContent, { data: dataSiteContent }] = useLazyQuery(GET_SITE_CONTENT);

  useEffect(() => {
    getContent({
      variables: {
        key: 'faq',
      },
    });
  }, [dataSiteContent, getContent]);

  return (
    <>
      <HtmlHead title={title} description={description} />
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
        <>
          <h1 className="Header m-0 bg_color rounded-top p-3  ">
            <span className="border-bottom mb-2">Frequently Asked Questions</span>
          </h1>
          {/* eslint-disable-next-line react/no-danger */}
          {dataSiteContent && (
            <div
              className="p-3 border"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dataSiteContent?.getSiteContent?.content.replace(/<br>/g, '')) }}
            />
          )}
        </>
      </div>
    </>
  );
}
export default FAQ;
