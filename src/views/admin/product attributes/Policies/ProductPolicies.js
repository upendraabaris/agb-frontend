import React, { useEffect, useState, useMemo } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import 'quill/dist/quill.snow.css';
import { useLazyQuery, gql, useMutation, useQuery } from '@apollo/client';
import { toast } from 'react-toastify';
import SubSectionPolicies from './SubSectionPolicies';

function ProductPolicies() {
  const [eventKey, setEventKey] = useState('shipping-policy');

  // GET SITE CONTENT
  const GET_SITE_CONTENT = gql`
    query GetSiteContent($key: String!) {
      getSiteContent(key: $key) {
        content
        key
      }
    }
  `;

  const [getContent, { data: dataSiteContent, refetch }] = useLazyQuery(GET_SITE_CONTENT);

  useEffect(() => {
    getContent({
      variables: {
        key: eventKey,
      },
    });
  }, [dataSiteContent, eventKey]);

  // REACT Quill Themes and Modules
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ font: [] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ script: 'sub' }, { script: 'super' }],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
        ['link', 'image', 'video'],
        ['clean'],
      ],
    }),
    []
  );

  return (
    <>
      <h1>Policies for Product</h1>
      <Tabs justify onSelect={(e) => setEventKey(e)}>
        <Tab eventKey="shipping-policy" title="Shipping Policy">
          {dataSiteContent && (
            <SubSectionPolicies
              eventKey="shipping-policy"
              title="Shipping Policy"
              refetch={refetch}
              data={dataSiteContent.getSiteContent}
              modules={modules}
              theme="snow"
            />
          )}
        </Tab>
        <Tab eventKey="return-policy" title="Return Policy">
          {dataSiteContent && (
            <SubSectionPolicies
              eventKey="return-policy"
              title="Return Policy"
              refetch={refetch}
              data={dataSiteContent.getSiteContent}
              modules={modules}
              theme="snow"
            />
          )}
        </Tab>
        <Tab eventKey="cancellation-policy" title="Cancellation Policy">
          {dataSiteContent && (
            <SubSectionPolicies
              eventKey="cancellation-policy"
              title="Cancellation Policy"
              refetch={refetch}
              data={dataSiteContent.getSiteContent}
              modules={modules}
              theme="snow"
            />
          )}
        </Tab>
      </Tabs>
    </>
  );
}

export default ProductPolicies;
