import React, { useState, useEffect } from 'react';
import { NavLink, withRouter, useParams } from 'react-router-dom';
import { Row, Col, Button, Card, Table } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useLazyQuery, gql, useQuery } from '@apollo/client';
import { toast } from 'react-toastify';

function ExistingVariantList({ history }) {
  const title = 'Existing variant List';
  const description = 'Ecommerce Series product Existing variant List Page';
  const { seriesproductid } = useParams();
  const dispatch = useDispatch();
  const [productdetail, setProductDetail] = useState(null);

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const GET_SERIES_VARIANTS = gql`    
    query GetSeriesVariantByForSeller($productId: ID) {
    getSeriesVariantByForSeller(productId: $productId) {
    id    
    variantName
    active
    allPincode
    hsn
    silent_features
    moq
    serieslocation {
        id
        price
        mainStock
        sellerId 
        {
          id
        }
      }}}
   `;

  const { data, refetch } = useQuery(GET_SERIES_VARIANTS, {
    variables: {
      productId: seriesproductid,
    },
    onError: (error) => {
      toast.error(error.message || 'Something went Wrong!');
      if (error.message === 'jwt expired') {
        setTimeout(() => {
          history.push('/login');
        }, 2000);
      } else {
        console.log(`GET_SERIES_VARIANTS!!! : ${error}`);
      }
    },
  });
  useEffect(() => {
    if (seriesproductid) {
      refetch();
    }
    // eslint-disable-next-line
  }, [seriesproductid]);

  useEffect(() => {
    if (data && data.getSeriesVariantByForSeller) {
      setProductDetail(data.getSeriesVariantByForSeller);
    }
  }, [data]);

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-2">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/seller/series/list">
             <span className="text-dark ms-1">Series Products List</span>
            </NavLink>

          </Col>
          <Row className="align-items-center bg-white p-2 rounded m-0">
            <Col xs={12} md={6} className="text-start">
              <h1 className="mb-0 pb-0 display-4 fw-bold" id="title">{title}</h1>
            </Col>
            <Col xs={12} md={6} className="d-flex align-items-end justify-content-end mb-2 mb-sm-0 order-sm-3">
              <Button variant="outline-primary" onClick={() => { history.push(`/seller/series/add_variant/${seriesproductid}`); }} className="btn-icon btn-icon-start ms-0 ms-sm-1 w-100 w-md-auto">
                <span>Add New Variant</span>
              </Button>
            </Col>
          </Row>

        </Row>
      </div>
      <Card className="mb-2">
        <Row className="g-0 h-100 sh-lg-9 position-relative">
          <Col>
            <Row className="g-0 h-100 align-items-center">
              <Col>
                <Table bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Variant Name</th>
                      <th>Price</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productdetail && productdetail.length > 0 ? (
                      productdetail.map((variant, index) => {
                        const price =
                          variant.serieslocation &&
                            Array.isArray(variant.serieslocation) &&
                            variant.serieslocation.length > 0
                            ? variant.serieslocation[0].price
                            : "Price not available";
                        const mainStock =
                          variant.serieslocation &&
                            Array.isArray(variant.serieslocation) &&
                            variant.serieslocation.length > 0
                            ? variant.serieslocation[0].mainStock
                            : "Stock not available";
                        return (
                          <tr key={index}>
                            <td>
                              <NavLink
                                to={`/seller/series/variant_list/${seriesproductid}/location_list/${variant.id}`}
                                className="text-decoration-none text-dark" >
                                {variant.variantName}
                              </NavLink>
                            </td>
                            <td>{price}</td>
                            <td>{mainStock}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center">
                          <NavLink to={`/seller/series/add_variant/${seriesproductid}`}>Nothing to list! Click to Add New Variant</NavLink>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    </>
  );
}
export default withRouter(ExistingVariantList);
