import React, { useEffect, useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { NavLink, withRouter } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import { Row, Col, Button, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

const GET_ALL_SELLERS = gql`
  query GetAllSellerForSuperSeller {
    getAllSellerForSuperSeller {
      id
      companyName
      gstin
      mobileNo
      email
      allotted {
        baId
        dastatus
      }
    }
  }
`;

function AddNewProduct({ history }) {
  const title = 'Add Dealer Associate Product';
  const description = 'Add Dealer Associate Product';
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);

  const [getAllSellers, { loading, data, error, refetch }] = useLazyQuery(GET_ALL_SELLERS, {
    fetchPolicy: 'network-only',
  });

  const [show, setShow] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);

  useEffect(() => {
    getAllSellers();
  }, [getAllSellers]);

  const handleClose = () => setShow(false);
  const handleShow = (seller) => {
    history.push(`/superSeller/seller/detail/${seller.id}`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching data</p>;

  const formatAddress = (seller) => {
    const { address, address2, city, pincode, state } = seller;
    const addressComponents = [address, address2, city, state, pincode];
    return addressComponents.filter((component) => component).join(', ');
  };

  const currentBaId = currentUser?.seller?.id;

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-2">
        <Row className="g-0">
          <Col className="col-6 mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/superSeller/dashboard">
              <span className="align-middle text-dark ms-1">Dashboard</span>
            </NavLink>
            <span className="text-dark text-small ps-2"> / </span>
            <span className="align-middle text-dark ms-1">Dealer Associate List</span>
          </Col>
          <Col className="col-6 text-end">
            <NavLink className="btn btn-link border border-primary rounded" to="/superSeller/seller/add">
              Add Dealer Associate
            </NavLink>
          </Col>
        </Row>
      </div>

      <div className="seller-list-container">
        <Row>
          <Col>
            <h2 className="mb-2 p-2 bg-white fw-bold text-center">Dealer Associate List</h2>
            <div className="bg-white p-2 table-responsive">
              <table className="table-bordered table-striped w-100">
                <thead className="thead-light">
                  <tr>
                    <th className="col-3 p-2 ps-3">DA Name</th>
                    <th className="col-3 ps-2">Email</th>
                    <th className="col-2 ps-2">Mobile No</th>
                    <th className="col-2 ps-2">GST No</th>
                    <th className="col-2 ps-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data && data.getAllSellerForSuperSeller.length > 0 ? (
                    data.getAllSellerForSuperSeller.map((seller) => (
                      <tr key={seller.id}>
                        <td>
                          <Button variant="link" onClick={() => handleShow(seller)} className="ml-3">
                            {seller.companyName}
                          </Button>
                        </td>
                        <td className="ps-2">{seller.email}</td>
                        <td className="ps-2">{seller.mobileNo}</td>
                        <td className="ps-2">{seller.gstin}</td>
                        <td className="ps-2 text-center fw-bold">
                          {seller.allotted?.some((item) => item.baId === currentBaId && item.dastatus === true) ? (
                            <span className="text-success">Approved</span>
                          ) : (
                            <span className="text-warning">Under Review</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center fw-bold p-4">
                        DA Not Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Col>
        </Row>
      </div>

      {/* Modal for displaying seller details */}
      <Modal show={show} onHide={handleClose} centered backdrop="static" size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-dark">DA Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 bg-light rounded">
          {selectedSeller && (
            <div className="dealer-info card border-0 shadow-sm p-4">
              <h3 className="fw-bold text-dark mb-4">{selectedSeller.companyName}</h3>
              <ul className="list-unstyled">
                <li className="mb-3">
                  <strong className="text-dark">📍 Address:</strong>
                  <span className="text-dark ms-2">
                    {selectedSeller.fullAddress}, {selectedSeller.city}, {selectedSeller.state} - {selectedSeller.pincode}
                  </span>
                </li>
                <li className="mb-3">
                  <strong className="text-dark">📞 Mobile No:</strong>
                  <span className="text-dark ms-2">{selectedSeller.mobileNo}</span>
                </li>
                <li className="mb-3">
                  <strong className="text-dark">📧 Email:</strong>
                  <span className="text-dark ms-2">{selectedSeller.email}</span>
                </li>
                <li className="mb-3">
                  <strong className="text-dark">🆔 GSTIN:</strong>
                  <span className="text-dark ms-2">{selectedSeller.gstin}</span>
                </li>
                <li className="mb-3">
                  <strong className="text-dark">📄 Description:</strong>
                  <span className="text-dark ms-2">{selectedSeller.companyDescription}</span>
                </li>
              </ul>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-primary" className="w-100 fw-bold py-2" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default withRouter(AddNewProduct);
