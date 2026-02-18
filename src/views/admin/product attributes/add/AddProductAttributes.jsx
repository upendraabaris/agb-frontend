import React, { useEffect, useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { Row, Col, Button, Dropdown, Form, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { NavLink } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { useDispatch } from 'react-redux';
import { useQuery, gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import GstTypeAttributes from './components/gstType/GstTypeAttributes';
import UnitTypeAttributes from './components/unitType/UnitTypeAttributes';
import FinalPriceType from './components/finalPriceType/FinalPriceType';
import PriceType from './components/priceType/PriceType';
import ExtraChargeType from './components/extraChargeType/ExtraChargeType';
import TransportChargeType from './components/transportChargeType/TransportChargeType';

function AddProductAttributes() {
  const title = 'Product Attributes';
  const description = 'Ecommerce Products Attributes Page';
  const [key, setKey] = useState('gst');
  const [modalView, setModalview] = useState(false); // hide and show modal
  const [attributeId, setAttributeId] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const GET_ALL_PRODUCT_ATTRIBUTE = gql`
    query GetAllProductAttributes {
      getAllProductAttributes {
        id
      }
    }
  `;

  const CREATE_PRODUCT_ATTRIBUTE = gql`
    mutation CreateProductAttribute {
      createProductAttribute {
        id
      }
    }
  `;

  const { error, data, refetch } = useQuery(GET_ALL_PRODUCT_ATTRIBUTE, {
    onCompleted: () => {
      if (data.getAllProductAttributes.length > 0) {
        setAttributeId(data.getAllProductAttributes[0].id);
      }
    },
  });
  if (error) {
    toast.error(error.message || 'Something went wrong!'); 
  }

  const [CreateProductAttribute] = useMutation(CREATE_PRODUCT_ATTRIBUTE, {
    onCompleted: () => {
      toast.success('Product Attributes created successfull!');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!'); 
    },
  });

  const addProductAttribute = async () => {
    if (data.getAllProductAttributes.length < 1) {
      await CreateProductAttribute();
      refetch();
    } else { 
      setModalview(true);
    }
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Dashboard</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
          </Col>
          {/* Title End */}

          {/* Top Buttons Start */}
          <Col xs="12" sm="auto" className="d-flex align-items-end justify-content-end mb-2 mb-sm-0 order-sm-3">
            <Button variant="outline-primary" className="btn-icon btn-icon-start ms-0 ms-sm-1 w-100 w-md-auto" onClick={addProductAttribute}>
              <CsLineIcons icon="plus" /> <span>{title}</span>
            </Button>
          </Col>
          {/* Top Buttons End */}
        </Row>
      </div>

      {/* <Row className="mb-3">
        <Col md="5" lg="3" xxl="2" className="mb-1">
          {/* Search Start */}
       {/*    <div className="d-inline-block float-md-start me-1 mb-1 search-input-container w-100 shadow bg-foreground">
            <Form.Control type="text" placeholder="Search" />
            <span className="search-magnifier-icon">
              <CsLineIcons icon="search" />
            </span>
            <span className="search-delete-icon d-none">
              <CsLineIcons icon="close" />
            </span>
          </div>
        </Col> */}
        {/* Search End */}
    {/*   </Row> */}

      {/* List Header Start */}
      {attributeId ? (
        <Tabs id="controlled-tab-example" activeKey={key} onSelect={(k) => setKey(k)} className="mb-3 mt-4" justify>
          <Tab eventKey="gst" title="Add Gst">
            <GstTypeAttributes attributeId={attributeId} />
          </Tab>
          <Tab eventKey="unitType" title="Add Unit Type">
            <UnitTypeAttributes attributeId={attributeId} />
          </Tab>
          <Tab eventKey="priceType" title="Add Price Type">
            <PriceType attributeId={attributeId} />
          </Tab>
          <Tab eventKey="extraCharge" title="Add Extra Charge">
            <ExtraChargeType attributeId={attributeId} />
          </Tab>
          <Tab eventKey="transportCharge" title="Add Transport Charge">
            <TransportChargeType attributeId={attributeId} />
          </Tab>
          <Tab eventKey="finalPrice" title="Add Final Price">
            <FinalPriceType attributeId={attributeId} />
          </Tab>
        </Tabs>
      ) : (
        ''
      )}
      <Modal show={modalView} onHide={() => setModalview(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Alert</Modal.Title>
        </Modal.Header>
        {modalView && <Modal.Body>Product Attributes already exists!</Modal.Body>}
        <Modal.Footer>
          <Button variant="primary" onClick={() => setModalview(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AddProductAttributes;
