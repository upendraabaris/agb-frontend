import { React, useState, useEffect } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import HtmlHead from 'components/html-head/HtmlHead';
import { NavLink, useHistory } from 'react-router-dom';
import { Button, Row, Col, Table, Form, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { toast } from 'react-toastify';

const GET_ALL_COUPON = gql`
  query GetAllCouponCodes {
    getAllCouponCodes {
      id
      couponName
      discount
      couponCode
      start
      end
      active
    }
  }
`;

const DELETE = gql`
  mutation DeleteCouponCode($deleteCouponCodeId: ID!) {
    deleteCouponCode(id: $deleteCouponCodeId) {
      couponCode
      couponName
      discount
      start
      end
      active
      id
    }
  }
`;

function CouponList() {
  const title = 'Coupon List';
  const description = 'Ecommerce Coupon List Page';
  const history = useHistory();

  // Delete
  const [deleteModalView, setDeleteModalView] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [deleteTitle, setTitleDelete] = useState('');

  const { error, data, refetch, loading } = useQuery(GET_ALL_COUPON);
  if (error) {
    console.log('ERROR', error.message);
  }

  const [deleteCouponCode, { data: delData }] = useMutation(DELETE, {
    onCompleted: () => {
      toast.success(`${delData.deleteCouponCode.couponName} has been deleted successfully`);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });

  function handleDelete(id, name) {
    setDeleteModalView(true);
    setDeleteId(id);
    setTitleDelete(name);
  }

  const deleteSellerConfirmed = async () => {
    setDeleteModalView(true);

    await deleteCouponCode({
      variables: {
        deleteCouponCodeId: deleteId,
      },
    });
    setDeleteModalView(false);
  };

  function handleClick() {
    history.push(`/admin/coupon`);
  }

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const [year, month, day] = dateStr.split('-');
    const monthName = monthNames[parseInt(month, 10) - 1];
    return `${day}-${monthName}-${year}`;
  };

  return (
    <>
      <HtmlHead title={title} description={description} />

      <div className="page-title-container m-0">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link text-dark pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <span className="align-middle text-dark ms-1">Dashboard</span>
            </NavLink>
          </Col>
          <Col xs="auto" className="d-flex align-items-end justify-content-end mb-2 mb-sm-0 order-sm-3">
            <Button variant="outline-primary" onClick={() => handleClick()} className="btn-icon btn-icon-start ms-0 ms-sm-1 w-100 w-md-auto">
              <span>Add New Coupon</span>
            </Button>
          </Col>
        </Row>
      </div>

      <h1 className="mb-0 pb-0 display-6 pb-4 text-center fw-bold" id="title">
        {title}
      </h1>

      <Table striped bordered hover responsive className="mt-3">
        <thead className="table-light">
          <tr>
            <th>Coupon Name</th>
            <th>Coupon Code</th>
            <th>Discount</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th className="text-center">Status</th>
            <th className="text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {data &&
            data.getAllCouponCodes.map((coupon) => (
              <tr key={coupon.id}>
                <td>{coupon.couponName}</td>
                <td className="fw-bold">{coupon.couponCode}</td>
                <td>{coupon.discount}%</td>
                <td>{formatDate(coupon.start)}</td>
                <td>{formatDate(coupon.end)}</td>

                <td className="text-center">
                  {coupon.active ? <CsLineIcons icon="check" className="text-success" /> : <CsLineIcons icon="close-circle" className="text-danger" />}
                </td>

                <td className="text-center">
                  <OverlayTrigger placement="top" overlay={<Tooltip>Delete</Tooltip>}>
                    <Button variant="outline-danger" size="sm" className="btn-icon btn-icon-only" onClick={() => handleDelete(coupon.id, coupon.couponName)}>
                      <CsLineIcons icon="bin" />
                    </Button>
                  </OverlayTrigger>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
      {loading && (
        <div className="d-flex justify-content-center align-items-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      {/* Delete Blog Modal Starts */}
      <Modal show={deleteModalView} onHide={() => setDeleteModalView(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Coupon Code</Modal.Title>
        </Modal.Header>
        {deleteTitle && (
          <Modal.Body>
            Are you sure you want to delete this Coupon Code: <span className="fw-bold">"{deleteTitle}" </span>?
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="light" onClick={() => setDeleteModalView(false)}>
            No
          </Button>
          <Button variant="primary" onClick={() => deleteSellerConfirmed()}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Delete Blog Modal Ends */}
    </>
  );
}

export default CouponList;
