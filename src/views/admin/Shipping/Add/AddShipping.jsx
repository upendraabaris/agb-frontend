import { React, useState, useEffect } from 'react';
import { useMutation, gql } from '@apollo/client';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { Row, Col, Form, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';

function AddShipping() {
  const title = 'Add Shipping';
  const description = 'Ecommerce Add Shipping Page';
  const [api, setApi] = useState('');
  const [url, setURL] = useState('');
  const [desc, setDesc] = useState('');
  const [company, setCompany] = useState('');

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const CREATE_SHIPPING = gql`
    mutation Mutation($shippingCompany: String!, $url: String!, $description: String!, $api: String!) {
      createShipping(shipping_company: $shippingCompany, url: $url, description: $description, api: $api) {
        description
        api
        id
        shipping_company
        url
      }
    }
  `;

  const [createShipping, { loading, error, data }] = useMutation(CREATE_SHIPPING, {
    variables: {
      shippingCompany: company,
      url,
      description: desc,
      api,
    },
  });
  if (loading) {
    console.log(`Loading: ${loading}`);
  }
  if (error) {
    console.log(`Error!!! : ${error.message}`);
  }
  if (data) {
    const entry = data;
    console.log(entry);
  }

  function handleSubmit() {
    
     if(company && url && desc && api !== '')
    {
      createShipping();
      setApi('');
      setURL('');
      setDesc('');
      setCompany('');
      toast.success("Shipping Created");   
      
     
    }else if(company || url || desc || api === '')
    {  
      toast.error("All fields are required");   
    }
    
  }

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/shipping/list">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Shipping List</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
          </Col>
          {/* Title End */}
        </Row>
      </div>
      <Row>
        <Col xl="8">
          {/* Product Info Start */}
          <h2 className="small-title">{title}</h2>
        </Col>
      </Row>
      <Card className="mb-5">
        <Card.Body>
          <div className="mb-3 filled form-group tooltip-end-top">
            <CsLineIcons icon="building-large" />
            <Form.Control type="text" name="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" />
          </div>
          <div className="mb-3 filled form-group tooltip-end-top">
            <CsLineIcons icon="link" />
            <Form.Control type="text" name="url" value={url} onChange={(e) => setURL(e.target.value)} placeholder="URL" />
          </div>
          <div className="mb-3 filled form-group tooltip-end-top">
            <CsLineIcons icon="align-left" />
            <Form.Control type="text" name="desc" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" />
          </div>
          <div className="mb-3 filled form-group tooltip-end-top">
            <CsLineIcons icon="database" />
            <Form.Control type="text" name="api" value={api} onChange={(e) => setApi(e.target.value)} placeholder="API" />
          </div>
          <div className="text-center">
            <button className="btn btn-primary btn-lg" type="button" onClick={() => handleSubmit()}>
              Save
            </button>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}
export default AddShipping;
