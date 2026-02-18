import React, { useEffect, useState } from 'react';
import { Row, Col, Table, Button, Dropdown, Form, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { NavLink } from 'react-router-dom';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { useDispatch } from 'react-redux';
import { useQuery, gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

function AddProductClass() {
  const title = 'Product Class';
  const description = 'Products Class';
  const [modalView, setModalview] = useState(false);
  const [attributeId, setAttributeId] = useState('');
  const dispatch = useDispatch();
  const [updateModalView, setUpdateModalView] = useState(false);
  const [updateProductId, setUpdateProductId] = useState('');
  const [updateProductClassName, setUpdateProductClassName] = useState('');
  const [updateProductClassDescription, setUpdateProductClassDescription] = useState('');
  const [updateListingCommission, setUpdateListingCommission] = useState(0);
  const [updateListingType, setUpdateListingType] = useState('');
  const [updateProductCommission, setUpdateProductCommission] = useState(0);
  const [updateProductType, setUpdateProductType] = useState('');
  const [updateFixedCommission, setUpdateFixedCommission] = useState(0);
  const [updateFixedType, setUpdateFixedType] = useState('');
  const [updateShippingCommission, setUpdateShippingCommission] = useState(0);
  const [updateShippingType, setUpdateShippingType] = useState('');
  const [updateSpecialStatus, setUpdateSpecialStatus] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState('');

  const CREATE_PRODUCT_CLASS = gql`
    mutation CreateProductClass(
      $productClassName: String
      $productClassDescription: String
      $code: String
      $listingCommission: Float
      $listingType: String
      $productCommission: Float
      $productType: String
      $fixedCommission: Float
      $fixedType: String
      $shippingCommission: Float
      $shippingType: String
      $specialStatus: Boolean
    ) {
      createProductClass(
        productClassName: $productClassName
        productClassDescription: $productClassDescription
        code: $code
        listingCommission: $listingCommission
        listingType: $listingType
        productCommission: $productCommission
        productType: $productType
        fixedCommission: $fixedCommission
        fixedType: $fixedType
        shippingCommission: $shippingCommission
        shippingType: $shippingType
        specialStatus: $specialStatus
      ) {
        id
        productClassName
        productClassDescription
        code
        listingCommission
        listingType
        productCommission
        productType
        fixedCommission
        fixedType
        shippingCommission
        shippingType
        specialStatus
      }
    }
  `;
  const ALL_PRODUCT_CLASS = gql`
    query GetAllProductClass {
      getAllProductClass {
        id
        productClassName
        productClassDescription
        code
        listingCommission
        listingType
        productCommission
        productType
        fixedCommission
        fixedType
        shippingCommission
        shippingType
        specialStatus
      }
    }
  `;
  const UPDATE_PRODUCT_CLASS = gql`
    mutation UpdateProductClass(
      $updateProductClassId: ID!
      $productClassName: String
      $productClassDescription: String
      $code: String
      $listingCommission: Float
      $listingType: String
      $productCommission: Float
      $productType: String
      $fixedCommission: Float
      $fixedType: String
      $shippingCommission: Float
      $shippingType: String
      $specialStatus: Boolean
    ) {
      updateProductClass(
        id: $updateProductClassId
        productClassName: $productClassName
        productClassDescription: $productClassDescription
        code: $code
        listingCommission: $listingCommission
        listingType: $listingType
        productCommission: $productCommission
        productType: $productType
        fixedCommission: $fixedCommission
        fixedType: $fixedType
        shippingCommission: $shippingCommission
        shippingType: $shippingType
        specialStatus: $specialStatus
      ) {
        id
        productClassName
        productClassDescription
        code
        listingCommission
        listingType
        productCommission
        productType
        fixedCommission
        fixedType
        shippingCommission
        shippingType
        specialStatus
      }
    }
  `;
  const DELETE_PRODUCT_CLASS = gql`
    mutation DeleteProductClass($deleteProductClassId: ID!) {
      deleteProductClass(id: $deleteProductClassId) {
        id
      }
    }
  `;

  const [productClassName, setProductClassName] = useState('');
  const [productClassDescription, setProductClassDescription] = useState('');
  const [listingCommission, setListingCommission] = useState(0);
  const [listingType, setListingType] = useState('');
  const [productCommission, setProductCommission] = useState(0);
  const [productType, setProductType] = useState('');
  const [fixedCommission, setFixedCommission] = useState(0);
  const [fixedType, setFixedType] = useState('');
  const [shippingCommission, setShippingCommission] = useState(0);
  const [shippingType, setShippingType] = useState('');
  const [specialStatus, setSpecialStatus] = useState(false);

  const [createProductClass, { loading, error }] = useMutation(CREATE_PRODUCT_CLASS, {
    refetchQueries: [{ query: ALL_PRODUCT_CLASS }],
    onCompleted: () => {
      toast.success('Product Class created successfully!');
      setProductClassName('');
      setProductClassDescription('');
      setListingCommission(0);
      setListingType('');
      setProductCommission(0);
      setProductType('');
      setFixedCommission(0);
      setFixedType('');
      setShippingCommission(0);
      setShippingType('');
      setSpecialStatus(false);
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    },
  });

  const [updateProductClass, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_PRODUCT_CLASS, {
    onCompleted: () => {
      toast.success('Product Class updated successfully!');
      setUpdateModalView(false);
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    },
  });

  const [deleteProductClass] = useMutation(DELETE_PRODUCT_CLASS, {
    refetchQueries: [{ query: ALL_PRODUCT_CLASS }],
    onCompleted: () => {
      toast.success('Product Class deleted successfully!');
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    },
  });

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    createProductClass({
      variables: {
        productClassName,
        productClassDescription,
        listingCommission: parseFloat(listingCommission),
        listingType: 'fix',
        productCommission: parseFloat(productCommission),
        productType: 'percentage',
        fixedCommission: parseFloat(fixedCommission),
        fixedType: 'fix',
        shippingCommission: parseFloat(shippingCommission),
        shippingType: 'percentage',
        specialStatus,
      },
    });
  };
  const handleUpdateModalOpen = (productClass) => {
    setUpdateModalView(true);
    setUpdateProductId(productClass.id);
    setUpdateProductClassName(productClass.productClassName);
    setUpdateProductClassDescription(productClass.productClassDescription);
    setUpdateListingCommission(productClass.listingCommission);
    setUpdateListingType(productClass.listingType);
    setUpdateProductCommission(productClass.productCommission);
    setUpdateProductType(productClass.productType);
    setUpdateFixedCommission(productClass.fixedCommission);
    setUpdateFixedType(productClass.fixedType);
    setUpdateShippingCommission(productClass.shippingCommission);
    setUpdateShippingType(productClass.shippingType);
    setUpdateSpecialStatus(productClass.specialStatus);
  };
  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    updateProductClass({
      variables: {
        updateProductClassId: updateProductId,
        productClassName: updateProductClassName,
        productClassDescription: updateProductClassDescription,
        listingCommission: parseFloat(updateListingCommission),
        listingType: 'fix',
        productCommission: parseFloat(updateProductCommission),
        productType: 'percentage',
        fixedCommission: parseFloat(updateFixedCommission),
        fixedType: 'fix',
        shippingCommission: parseFloat(updateShippingCommission),
        shippingType: 'percentage',
        specialStatus: updateSpecialStatus,
      },
    });
  };
  const handleShowDeleteModal = (id) => {
    setDeleteProductId(id);
    setShowDeleteModal(true);
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteProductId('');
  };
  const handleDeleteProductClass = () => {
    deleteProductClass({
      variables: { deleteProductClassId: deleteProductId },
      refetchQueries: [{ query: ALL_PRODUCT_CLASS }],
    });
    handleCloseDeleteModal();
  };
  const { data } = useQuery(ALL_PRODUCT_CLASS);
  if (loading) return <p>Loading...</p>;
  if (error) {
    toast.error(`Error: ${error.message}`);
    return <p>Error: {error.message}</p>;
  }
  if (!data || !data.getAllProductClass || data.getAllProductClass.length === 0) {
    return <p>Loading data. Please wait...</p>;
  }

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container m-0">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <span className="align-middle text-small ms-1 text-dark">Dashboard</span>
            </NavLink>
          </Col>
        </Row>
      </div>
      <div className="border rounded bg-white p-3 mb-2 ">
        <h2 className="mb-3 pb-0 display-6 text-center fw-bold text-dark">Product Class List</h2>
        <Table bordered hover className="align-middle ">
          <thead className="table-light">
            <tr>
              <th className="text-nowrap">Class Code</th>
              <th className="text-nowrap">Class Name</th>
              <th className="text-center text-nowrap">
                Sale Commission Fee <br />
                <small className="text-muted">(Order amount)</small>
              </th>
              <th className="text-center text-nowrap">
                Listing Fee <br />
                <small className="text-muted">(Qty based)</small>
              </th>
              <th className="text-center text-nowrap">
                Fixed Closing Fee <br />
                <small className="text-muted">(Fixed per order)</small>
              </th>
              <th className="text-center text-nowrap">
                Shipping Fee <br />
                <small className="text-muted">(Qty based)</small>
              </th>
              <th className="text-center text-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.getAllProductClass
              .slice()
              .sort((a, b) => a.productClassName.localeCompare(b.productClassName))
              .map((productClass) => (
                <tr key={productClass.id}>
                  <td>
                    {productClass.code} {productClass.specialStatus && <span>✅ Special</span>}
                  </td>
                  <td>
                    <strong>{productClass.productClassName}</strong>
                    <OverlayTrigger placement="top" overlay={<Tooltip id={`edit-tooltip-${productClass.id}`}>{productClass.productClassDescription}</Tooltip>}>
                      <Button
                        variant="transparent"
                        className="ms-2 p-0 border-0 bg-transparent shadow-none"
                        onClick={() => handleUpdateModalOpen(productClass)}
                      >
                        <CsLineIcons icon="eye" className="text-primary" size="17" />
                      </Button>
                    </OverlayTrigger>
                  </td>
                  <td className="text-center">
                    {productClass.productType === 'fix' ? <>₹{productClass.productCommission}</> : <>{productClass.productCommission}%</>}
                  </td>
                  <td className="text-center">
                    {productClass.listingType === 'fix' ? <>₹{productClass.listingCommission}</> : <>{productClass.listingCommission}%</>}
                  </td>
                  <td className="text-center">
                    {productClass.fixedType === 'fix' ? <>₹{productClass.fixedCommission}</> : <>{productClass.fixedCommission}%</>}
                  </td>
                  <td className="text-center">
                    {productClass.shippingType === 'fix' ? <>₹{productClass.shippingCommission}</> : <>{productClass.shippingCommission}%</>}
                  </td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <OverlayTrigger placement="top" overlay={<Tooltip id={`edit-tooltip-${productClass.id}`}>Edit</Tooltip>}>
                        <Button
                          variant="foreground-alternate"
                          className="ms-2 p-0 border-0 bg-transparent shadow-none btn btn-transparent"
                          onClick={() => handleUpdateModalOpen(productClass)}
                        >
                          <CsLineIcons icon="edit-square" className="text-primary" size="17" />
                        </Button>
                      </OverlayTrigger>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </div>
      <div className="border rounded bg-white p-3">
        <h2 className="mb-3 pb-0 display-6 text-center fw-bold text-dark">Add Product Class</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="productClassName" className="m-1">
            <Form.Label className="fw-bold text-dark">
              Product Class Name <span className="text-danger"> *</span>
            </Form.Label>
            <Form.Control type="text" value={productClassName} onChange={(e) => setProductClassName(e.target.value)} required />
            <Form.Check type="checkbox" label="Special Status" checked={specialStatus} onChange={(e) => setSpecialStatus(e.target.checked)} />
          </Form.Group>
          <Form.Group controlId="productClassDescription" className="m-1">
            <Form.Label className="fw-bold text-dark">
              Product Class Description <span className="text-danger"> *</span>
            </Form.Label>
            <Form.Control type="text" value={productClassDescription} onChange={(e) => setProductClassDescription(e.target.value)} required />
          </Form.Group>
          <div className="m-1">
            <div className="col-md-6 p-1 float-start">
              <Form.Group controlId="productType">
                <Form.Label className="fw-bold text-dark">Sale Commission Fee Type</Form.Label>
                <Form.Select value="percentage" disabled>
                  <option value="percentage">Percentage (%)</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-6 p-1 float-start">
              <Form.Group controlId="productCommission">
                <Form.Label className="fw-bold text-dark">
                  Value <span className="text-danger"> *</span>
                </Form.Label>
                <Form.Control type="number" value={productCommission} onChange={(e) => setProductCommission(e.target.value)} required />
              </Form.Group>
            </div>
          </div>
          <div className="m-1">
            <div className="col-md-6 p-1 float-start">
              <Form.Group controlId="listingType">
                <Form.Label className="fw-bold text-dark">Listing Fee Type</Form.Label>
                <Form.Select value="fix" disabled>
                  <option value="fix">Fix Rs.</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-6 p-1 float-start">
              <Form.Group controlId="listingCommission">
                <Form.Label className="fw-bold text-dark">
                  Value <span className="text-danger"> *</span>
                </Form.Label>
                <Form.Control type="number" value={listingCommission} onChange={(e) => setListingCommission(e.target.value)} required />
              </Form.Group>
            </div>
          </div>
          <div className="m-1">
            <div className="col-md-6 p-1 float-start">
              <Form.Group controlId="fixedType">
                <Form.Label className="fw-bold text-dark">Fixed Closing Fee Type</Form.Label>
                <Form.Select value="fix" disabled>
                  <option value="fix">Fix Rs.</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-6 p-1 float-start">
              <Form.Group controlId="fixedCommission">
                <Form.Label className="fw-bold text-dark">
                  Value <span className="text-danger"> *</span>
                </Form.Label>
                <Form.Control type="number" value={fixedCommission} onChange={(e) => setFixedCommission(e.target.value)} required />
              </Form.Group>
            </div>
          </div>
          <div className="m-1">
            <div className="col-md-6 p-1 float-start">
              <Form.Group controlId="shippingType">
                <Form.Label className="fw-bold text-dark">Shipping Fee Type</Form.Label>
                <Form.Select value="percentage" disabled>
                  <option value="percentage">Percentage (%)</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-6 p-1 float-start">
              <Form.Group controlId="shippingCommission">
                <Form.Label className="fw-bold text-dark">
                  Value <span className="text-danger"> *</span>
                </Form.Label>
                <Form.Control type="number" value={shippingCommission} onChange={(e) => setShippingCommission(e.target.value)} required />
              </Form.Group>
            </div>
          </div>

          <div className="text-center">
            <Button variant="primary" type="submit" disabled={loading} className="m-2">
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
            {error && <p className="text-danger mt-3">Error: {error.message}</p>}
          </div>
        </Form>
      </div>
      {/* Update Product Class Modal */}
      <Modal show={updateModalView} onHide={() => setUpdateModalView(false)}>
        <Modal.Header className="p-3" closeButton>
          <Modal.Title className="text-dark fw-bold">Edit Product Class</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          <Form onSubmit={handleUpdateSubmit}>
            {/* Form inputs for updating product class */}
            <Form.Group controlId="updateProductClassName" className="m-1">
              <Form.Label className="fw-bold text-dark">
                Product Class Name <span className="text-danger"> *</span>
              </Form.Label>
              <Form.Control type="text" value={updateProductClassName} onChange={(e) => setUpdateProductClassName(e.target.value)} required />
              <Form.Check type="checkbox" label="Special Status" checked={updateSpecialStatus} onChange={(e) => setUpdateSpecialStatus(e.target.checked)} />
            </Form.Group>
            <Form.Group controlId="updateProductClassDescription" className="m-1">
              <Form.Label className="fw-bold text-dark">
                Product Class Description <span className="text-danger"> *</span>
              </Form.Label>
              <Form.Control type="text" value={updateProductClassDescription} onChange={(e) => setUpdateProductClassDescription(e.target.value)} required />
            </Form.Group>
            <div className="m-1">
              <div className="col-md-6 p-1 float-start">
                <Form.Group controlId="updateProductType">
                  <Form.Label className="fw-bold text-dark">Sale Commission Fee Type</Form.Label>
                  <Form.Select value="percentage" disabled>
                    <option value="percentage">Percentage (%)</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6 p-1 float-start">
                <Form.Group controlId="updateProductCommission">
                  <Form.Label className="fw-bold text-dark">
                    Value <span className="text-danger"> *</span>
                  </Form.Label>
                  <Form.Control type="number" value={updateProductCommission} onChange={(e) => setUpdateProductCommission(e.target.value)} required />
                </Form.Group>
              </div>
            </div>
            <div className="m-1">
              <div className="col-md-6 p-1 float-start">
                <Form.Group controlId="updateListingType">
                  <Form.Label className="fw-bold text-dark">Listing Fee Type</Form.Label>
                  <Form.Select value="fix" disabled>
                    <option value="fix">Rs.</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6 p-1 float-start">
                <Form.Group controlId="updateListingCommission">
                  <Form.Label className="fw-bold text-dark">
                    Value <span className="text-danger"> *</span>
                  </Form.Label>
                  <Form.Control type="number" value={updateListingCommission} onChange={(e) => setUpdateListingCommission(e.target.value)} required />
                </Form.Group>
              </div>
            </div>
            <div className="m-1">
              <div className="col-md-6 p-1 float-start">
                <Form.Group controlId="updateFixedType">
                  <Form.Label className="fw-bold text-dark">Fixed Closing Fee Type</Form.Label>
                  <Form.Select value="fix" disabled>
                    <option value="fix">Rs.</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6 p-1 float-start">
                <Form.Group controlId="updateFixedCommission">
                  <Form.Label className="fw-bold">Value</Form.Label>
                  <Form.Control type="number" value={updateFixedCommission} onChange={(e) => setUpdateFixedCommission(e.target.value)} required />
                </Form.Group>
              </div>
            </div>
            <div className="m-1">
              <div className="col-md-6 p-1 float-start">
                <Form.Group controlId="updateShippingType">
                  <Form.Label className="fw-bold text-dark">Shipping Fee Type</Form.Label>
                  <Form.Select value="percentage" disabled>
                    <option value="percentage">Percentage (%)</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6 p-1 float-start">
                <Form.Group controlId="updateShippingCommission">
                  <Form.Label className="fw-bold text-dark">
                    Value <span className="text-danger"> *</span>
                  </Form.Label>
                  <Form.Control type="number" value={updateShippingCommission} onChange={(e) => setUpdateShippingCommission(e.target.value)} required />
                </Form.Group>
              </div>
            </div>
            <div className="text-center">
              <Button variant="primary" type="submit" disabled={updateLoading} className="m-2">
                {updateLoading ? 'Updating...' : 'Update'}
              </Button>
              {updateError && <p className="text-danger mt-3">Error: {updateError.message}</p>}
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      {/* Delete Product Class Model */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header className="p-3" closeButton>
          <Modal.Title>Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">Are you sure you want to delete this PRODUCT CLASS?</Modal.Body>
        <Modal.Footer className="p-3">
          <Button variant="light" onClick={handleCloseDeleteModal}>
            No
          </Button>
          <Button variant="danger" onClick={handleDeleteProductClass}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
export default AddProductClass;
