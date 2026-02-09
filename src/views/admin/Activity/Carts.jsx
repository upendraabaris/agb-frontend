import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Row, Col, Card, Spinner, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import moment from 'moment';

const GET_ALL_CARTS = gql`
  query GetAllCarts($search: String, $limit: Int, $offset: Int) {
    getAllCarts(search: $search, limit: $limit, offset: $offset) {
      id
      userId {
        firstName
        mobileNo
        email
      }
      cartProducts {
        productId {
          fullName
          brand_name
        }
        variantId {
          variantName
        }
      }
      updatedAt
    }
  }
`;

function ListCarts() {
  const title = 'Add to Carts';
  const description = 'Display all cart data with user details';

  const LIMIT = 20;  
  const [offset, setOffset] = useState(0);
  const [allCarts, setAllCarts] = useState([]);

  const { loading, error, data, fetchMore } = useQuery(GET_ALL_CARTS, {
    variables: { search: '', limit: LIMIT, offset: 0 },
    onCompleted: (d) => {
      if (d?.getAllCarts) setAllCarts(d.getAllCarts);
    },
  });

  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = () => {
    setLoadingMore(true);
    fetchMore({
      variables: { search: '', limit: LIMIT, offset: allCarts.length },
    })
      .then((res) => {
        setAllCarts((prev) => [...prev, ...res.data.getAllCarts]);
      })
      .finally(() => {
        setLoadingMore(false);
      });
  };

  if (loading && allCarts.length === 0)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  if (error) return <div>Error fetching carts: {error.message}</div>;

  return (
    <>
      <HtmlHead title={title} description={description} />

      <div className="page-title-container m-0">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <button type="button" className="muted-link pb-1 d-inline-block bg-transparent border-0" onClick={() => window.history.back()}>
              <span className="text-dark ms-1">Back</span>
            </button>
          </Col>
        </Row>
      </div>

      <Row className="m-0 mb-1 p-1 rounded bg-white align-items-center">
        <Col md="12">
          <h5 className="fw-bold fs-5 ps-2 pt-2">{title}</h5>
        </Col>
      </Row>

      <Col md="12" className="d-flex mt-2 mb-2 justify-content-end align-items-center flex-wrap">
        {[
          { label: 'Add to Carts', path: '/admin/activity/carts' },
          { label: 'Wishlists', path: '/admin/activity/wishlists' },
          { label: 'Contact Enquiries', path: '/admin/activity/contact' },
          { label: 'Product Enquiries', path: '/admin/activity/product' },
          { label: 'Bulk Product Enquiries', path: '/admin/activity/bulk_product' },
          { label: 'Cart Enquiries', path: '/admin/activity/cart_enquiries' },
          { label: 'Subscriptions', path: '/admin/activity/subscriptions' },
        ].map((nav) => (
          <React.Fragment key={nav.path}>
            <NavLink to={nav.path} className={({ isActive }) => `text-decoration-none text-dark p-0 ${isActive ? 'fw-bold text-dark' : ''}`}>
              {nav.label}
            </NavLink>
            <span className="align-middle text-small ms-1 me-1">|</span>
          </React.Fragment>
        ))}
      </Col>

      <div className="row m-0 p-2 bg-white border rounded">
        <div className="float-start col-3">
          <div className="text-dark fw-bold">User Details</div>
        </div>
        <div className="float-start col-6">
          <div className="text-dark fw-bold">Products</div>
        </div>
        <div className="float-start col-3">
          <div className="text-dark fw-bold">Date</div>
        </div>
      </div>

      {allCarts.map((cart) => (
        <CartUserRow key={cart.id} cart={cart} />
      ))}

      {allCarts.length % LIMIT === 0 && allCarts.length > 0 && (
        <Row className="justify-content-center mt-3">
          <Col xs="auto">
            <Button onClick={loadMore} disabled={loadingMore} className="d-flex align-items-center justify-content-center">
              {loadingMore ? (
                <>
                  <Spinner animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </Col>
        </Row>
      )}
    </>
  );
}

function CartUserRow({ cart }) {
  const user = cart.userId;

  return (
    <Card className="mb-1 single-line-card">
      <div className="p-3 d-flex justify-content-between">
        <div className="col-3">
          {user ? (
            <>
              <div>{user.firstName}</div>
              <div>{user.mobileNo}</div>
              <div>{user.email}</div>
            </>
          ) : (
            <span className="text-muted">Unknown User</span>
          )}
        </div>

        <div className="col-6">
          {cart.cartProducts?.length ? (
            cart.cartProducts.map((cp, i) => (
              <div key={i}>
                {i + 1}. {cp.productId?.fullName}
                {cp.productId?.brand_name && ` (${cp.productId.brand_name})`}
                {cp.variantId?.variantName && ` - ${cp.variantId.variantName}`}
              </div>
            ))
          ) : (
            <div className="text-muted">No products</div>
          )}
        </div>

        <div className="col-3">{moment(+cart.updatedAt).format('DD-MMM-YYYY')}</div>
      </div>
    </Card>
  );
}

export default ListCarts;
