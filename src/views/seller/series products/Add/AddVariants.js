import React, { useState, useEffect } from 'react';
import { NavLink, useParams, withRouter } from 'react-router-dom';
import { Row, Col, Button, Card, Form } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { toast } from 'react-toastify';
import VarientPicker from './VarientPicker';

function AddVariants({ history }) {
  const title = 'Add Variant to Series Product';
  const description = 'Ecommerce Add Varient Page';
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const { seriesproductid } = useParams();

  const GET_SERIES_PRODUCT = gql`
    query GetSeriesProduct($getSeriesProductId: ID) {
      getSeriesProduct(id: $getSeriesProductId) {
        id
        brand_name
        previewName
        fullName
        description
        thumbnail
      }
    }
  `;

  const ADD_VARIENT = gql`
    mutation AddSeriesVariant($seriesvariant: [SeriesVariantInput], $addSeriesVariantId: ID) {
      addSeriesVariant(seriesvariant: $seriesvariant, id: $addSeriesVariantId) {
        id
      }
    }
  `;

  const [GetSeriesProduct, { error, data }] = useLazyQuery(GET_SERIES_PRODUCT, {
    variables: {
      getSeriesProductId: seriesproductid,
    },
  });

  if (error) {
    console.log(`GET_SERIES_PRODUCT!!! : ${error.message}`);
  }
  useEffect(() => {
    GetSeriesProduct();
    // eslint-disable-next-line
  }, [seriesproductid]);

  const [formData, setFormData] = useState({
    addSeriesVariantId: seriesproductid,
    seriesvariant: [],
  });

  const [AddSeriesVariant] = useMutation(ADD_VARIENT, {
    onCompleted: (res) => {
      toast.success('Variant Added Successfully !');
      // console.log('res', res);
      setTimeout(() => {
        history.push('/seller/series/list');
      }, 2000);
    },
    onError: (err) => {
      toast.error(err.message || 'Something Went Wrong !'); 
    },
  });

  async function handleProduct() {
    if (formData.seriesvariant.length) {
      await AddSeriesVariant({
        variables: formData,
      });
    } else {
      toast.error('Enter the Details to Submit !');
    }
  }

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-2">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to={`/seller/series/variant_list/${seriesproductid}`}>
              <span className="text-dark ms-1">Add Existing Variant</span>
            </NavLink>
          </Col>
        </Row>
      </div>
      <h1 className="mb-0 display-4 fw-bold bg-white rounded p-2 mb-2 text-center border" id="title">
        {title}
      </h1>

      <Row>
        <Col xl="12">
          {data?.getSeriesProduct && (
            <Card className="border mb-3">
              <div className="mark">
                <div className=" fw-bold ps-4 p-1 fs-6">Basic Details</div>{' '}
              </div>
              <Card.Body>
                <Form>
                  <div className="mb-3">
                    <Form.Label className="fw-bold text-dark">Product Full Name</Form.Label>
                    <Form.Control type="text" readOnly defaultValue={data.getSeriesProduct.fullName} />
                  </div>
                  <Row>
                    <Col xs={12} md={6} className="mb-3">
                      <Form.Label className="fw-bold text-dark">Product Preview Name</Form.Label>
                      <Form.Control type="text" readOnly defaultValue={data.getSeriesProduct.previewName} />
                    </Col>
                    <Col xs={12} md={6} className="mb-3">
                      <Form.Label className="fw-bold text-dark">Brand Name</Form.Label>
                      <Form.Control type="text" readOnly defaultValue={data.getSeriesProduct.brand_name} />
                    </Col>
                  </Row>
                  <div className="mb-3">
                    <Form.Label className="fw-bold text-dark">Product Preview Image</Form.Label>
                    {data.getSeriesProduct.thumbnail ? (
                      <div
                        style={{
                          height: '120px',
                          width: '120px',
                          border: '1px solid #ddd',
                          padding: '4px',
                          borderRadius: '8px',
                        }}
                      >
                        <img src={data.getSeriesProduct.thumbnail} alt="Product" className="img-fluid h-100 w-100 object-fit-contain" />
                      </div>
                    ) : (
                      <div className="text-muted">No image available</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <Form.Label className="fw-bold text-dark">Description</Form.Label>
                    <div className="form-control bg-light" dangerouslySetInnerHTML={{ __html: data.getSeriesProduct.description }} />
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}
          <VarientPicker setFormData1={setFormData} />
          <div className="d-flex justify-content-start mt-4">
            <Button onClick={() => handleProduct()}>Submit</Button>
          </div>
        </Col>
      </Row>
    </>
  );
}

export default withRouter(AddVariants);
