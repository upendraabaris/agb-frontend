import React, { useEffect, useState } from 'react';
import 'quill/dist/quill.bubble.css';
import { toast } from 'react-toastify';
import { NavLink, useParams } from 'react-router-dom';
import { Row, Col, Form, Card, Spinner, Tooltip, OverlayTrigger } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import HtmlHead from 'components/html-head/HtmlHead';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const CREATE_SELLER = gql`
  mutation UpgradeUserToSeller(
    $userId: ID!
    $companyName: String!
    $bill: String!
    $gstin: String
    $pancardNo: String
    $gstinComposition: Boolean
    $companyDescription: String!
    $mobileNo: String!
    $email: String!
    $enquiryAssociate: Boolean!
    $businessAssociate: Boolean!
    $serviceAssociate: Boolean!
    $sellerAssociate: Boolean!
    $emailPermission: Boolean!
    $whatsAppPermission: Boolean!
    $whatsAppMobileNo: String!
    $fullAddress: String!
    $city: String!
    $state: String!
    $pincode: String!
    $status: Boolean!
    $bastatus: Boolean!
  ) {
    upgradeUserToSeller(
      userId: $userId
      companyName: $companyName
      bill: $bill
      gstin: $gstin
      pancardNo: $pancardNo
      gstinComposition: $gstinComposition
      companyDescription: $companyDescription
      mobileNo: $mobileNo
      email: $email
      enquiryAssociate: $enquiryAssociate
      businessAssociate: $businessAssociate
      serviceAssociate: $serviceAssociate
      sellerAssociate: $sellerAssociate
      emailPermission: $emailPermission
      whatsAppPermission: $whatsAppPermission
      whatsAppMobileNo: $whatsAppMobileNo
      fullAddress: $fullAddress
      city: $city
      state: $state
      pincode: $pincode
      status: $status
      bastatus: $bastatus
    ) {
      companyName
      email
    }
  }
`;

const GET_USER = gql`
  query GetUser($getUserId: ID!) {
    getUser(id: $getUserId) {
      id
      firstName
      email
    }
  }
`;

function AddSeller() {
  const title = 'Add New Associate';
  const description = 'Add New Associate';
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);
  const { id } = useParams();

  const [createSeller, { loading, error, data }] = useMutation(CREATE_SELLER, {
    onCompleted: () => {
      toast.success(`Associate has been successfully added`);
      setTimeout(() => {
        window.location.href = `/admin/user/detail/${id}`;
      }, 2000);
    },
    onError: (sellerError) => {
      toast.error(sellerError.message || 'Something went wrong!');
    },
  });
  const [getUserQuery, { data: user1 }] = useLazyQuery(GET_USER);
  useEffect(() => {
    if (id) {
      getUserQuery({ variables: { getUserId: id } });
    }
  }, [id, getUserQuery]);

  const onSubmit = async (values, { resetForm }) => {
    const {
      company,
      desc,
      email,
      gst,
      pancard,
      composition,
      phone,
      fullAddress,
      city,
      state,
      pincode,
      enquiryAssociate,
      businessAssociate,
      serviceAssociate,
      sellerAssociate,
      whatsAppPermission,
      emailPermission,
      whatsAppMobileNo,
    } = values;

    const bills = company.substring(0, 4).toUpperCase();

    await createSeller({
      variables: {
        userId: id,
        companyName: company,
        bill: bills,
        gstin: gst,
        pancardNo: pancard,
        gstinComposition: composition,
        fullAddress,
        city,
        state,
        pincode,
        companyDescription: desc,
        mobileNo: phone,
        email,
        whatsAppMobileNo,
        enquiryAssociate,
        businessAssociate,
        serviceAssociate,
        sellerAssociate,
        emailPermission,
        whatsAppPermission,
        bastatus: false,
        status: true,
      },
    });
  };

  const phoneRegExp = /^(\+91)?(-)?\s*?(91)?\s*?(\d{3})-?\s*?(\d{3})-?\s*?(\d{4})$/;
  const validationSchema = Yup.object().shape({
    company: Yup.string().required('Firm name is required'),
    desc: Yup.string().required('Firm description is required'),
    email: Yup.string().email('Must be a valid email').required('Firm email is required'),
    phone: Yup.string().matches(phoneRegExp, 'Phone number is not valid').required('Phone number is required'),
    fullAddress: Yup.string().required('Address is required'),
    city: Yup.string().required('City name is required'),
    pincode: Yup.string().required('Pincode is required'),
    state: Yup.string().required('State is required'),
    enquiryAssociate: Yup.boolean(),
    businessAssociate: Yup.boolean(),
    serviceAssociate: Yup.boolean(),
    sellerAssociate: Yup.boolean(),
    whatsAppPermission: Yup.boolean(),
    emailPermission: Yup.boolean(),
    whatsAppMobileNo: Yup.string().matches(phoneRegExp, 'WhatsApp number is not valid'),
  });
  const initialValues = {
    company: '',
    desc: '',
    email: '',
    gst: '',
    pancard: '',
    composition: false,
    phone: '',
    fullAddress: '',
    city: '',
    pincode: '',
    state: '',
    enquiryAssociate: false,
    businessAssociate: false,
    serviceAssociate: false,
    sellerAssociate: false,
    whatsAppPermission: false,
    emailPermission: false,
    whatsAppMobileNo: '',
    status: true,
    bastatus: false,
  };
  const formik = useFormik({ initialValues, validationSchema, onSubmit });
  const { handleSubmit, handleChange, values, touched, errors } = formik;
  const [selectedOption, setSelectedOption] = useState('gst');

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-2">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <span className="align-middle text-dark ms-1">Dashboard</span>
            </NavLink>
            <span className="text-dark ps-2"> / </span>
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/user/list">
              <span className="align-middle text-dark ms-1">User List</span>
            </NavLink>
            <span className="text-dark ps-2"> / </span>
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to={`/admin/user/detail/${id}`}>
              <span className="align-middle text-dark ms-1">User Detail</span>
            </NavLink>
            <span className="text-dark ps-2"> / </span>
            <span className="align-middle text-dark ms-1"> {title} </span>
          </Col>
        </Row>
      </div>
      <Row className="m-0 mb-2 p-1 rounded bg-white align-items-center">
        <Col md="12">
          <span className="fw-bold fs-5 ps-2 pt-2">{title} </span>
        </Col>
      </Row>
      <Row>
        <Col xl="12">
          <Card className="mb-5">
            <Card.Body>
              <form id="sellerForm" className="tooltip-end-bottom" onSubmit={handleSubmit}>
                <div className="container">
                  <div className="row">
                    <div className="col-12 col-md-6 mb-1">
                      <div className="fw-bold p-1">
                        User Name <span className="text-danger"> *</span>
                      </div>
                      <div className="bg-white border ps-3 rounded py-2 bg-light">{user1?.getUser?.firstName || 'N/A'}</div>
                    </div>
                    <div className="col-12 col-md-6 mb-1">
                      <div className="fw-bold p-1">
                        User Email <span className="text-danger"> *</span>
                      </div>
                      <div className="bg-white border ps-3 rounded py-2 bg-light">{user1?.getUser?.email || 'N/A'}</div>
                    </div>
                    <div className="col-12 col-md-6 mb-1">
                      <div className="fw-bold p-1">
                        Firm Name <span className="text-danger"> *</span>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id="firm-desc-tooltip">Enter the official registered name of your firm / business.</Tooltip>}
                        >
                          <span className="ms-1 text-dark" style={{ cursor: 'pointer' }}>
                            <CsLineIcons icon="info-hexagon" size={14} />
                          </span>
                        </OverlayTrigger>
                      </div>
                      <Form.Control
                        type="text"
                        name="company"
                        placeholder="Enter firm name"
                        value={values.company}
                        onChange={handleChange}
                        className="bg-white border ps-3 rounded"
                      />
                      {errors.company && touched.company && <div className="d-block text-danger">{errors.company}</div>}
                    </div>
                    <div className="col-12 col-md-6 mb-1">
                      <div className="fw-bold p-1">
                        Firm Email <span className="text-danger"> *</span>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id="firm-desc-tooltip">Enter an active email address to receive updates and notifications.</Tooltip>}
                        >
                          <span className="ms-1 text-dark" style={{ cursor: 'pointer' }}>
                            <CsLineIcons icon="info-hexagon" size={14} />
                          </span>
                        </OverlayTrigger>
                      </div>
                      <Form.Control
                        type="text"
                        name="email"
                        placeholder="Enter firm email"
                        value={values.email}
                        onChange={handleChange}
                        className="bg-white border ps-3 rounded"
                      />
                      {errors.email && touched.email && <div className="d-block text-danger">{errors.email}</div>}
                    </div>
                    <div className="col-12 col-md-6 mb-1">
                      {['gst', 'pancard'].map((type) => (
                        <div key={type} className="form-check d-inline-block me-3">
                          <input
                            type="radio"
                            className="form-check-input"
                            id={type}
                            name="idType"
                            value={type}
                            checked={selectedOption === type}
                            onChange={() => setSelectedOption(type)}
                          />
                          <label className="form-check-label" htmlFor={type}>
                            {type === 'gst' ? 'GST' : 'PAN (Unregistered Firm)'}
                          </label>
                        </div>
                      ))}
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id="firm-desc-tooltip">Enter your valid GST / PAN number for verification and billing purposes.</Tooltip>}
                      >
                        <span className="ms-1 text-dark" style={{ cursor: 'pointer' }}>
                          <CsLineIcons icon="info-hexagon" size={14} />
                        </span>
                      </OverlayTrigger>
                      {selectedOption && (
                        <div>
                          <Form.Control
                            type="text"
                            name={selectedOption}
                            maxLength={selectedOption === 'pancard' ? '10' : '15'}
                            onChange={handleChange}
                            placeholder={`Enter ${selectedOption} number`}
                            value={values[selectedOption]}
                            className="bg-white ps-3 border rounded"
                            onKeyPress={(e) => !/^[0-9a-zA-Z]*$/.test(e.key) && e.preventDefault()}
                          />
                          {errors[selectedOption] && touched[selectedOption] && <div className="d-block text-danger">{errors[selectedOption]}</div>}
                          {selectedOption === 'gst' && (
                            <div className="form-check mt-2">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id="composition"
                                name="composition"
                                checked={values.composition}
                                onChange={handleChange}
                              />
                              <label className="form-check-label" htmlFor="composition">
                                Composition
                              </label>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="col-12 col-md-6 mb-1">
                      <div className="fw-bold p-1">
                        Mobile Number <span className="text-danger"> *</span>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id="firm-desc-tooltip">Enter an active mobile number for important communication.</Tooltip>}
                        >
                          <span className="ms-1 text-dark" style={{ cursor: 'pointer' }}>
                            <CsLineIcons icon="info-hexagon" size={14} />
                          </span>
                        </OverlayTrigger>
                      </div>
                      <Form.Control
                        type="tel"
                        onKeyDown={(e) => {
                          if (e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete' && (e.key < '0' || e.key > '9')) {
                            e.preventDefault();
                          }
                        }}
                        maxLength="10"
                        name="phone"
                        onChange={handleChange}
                        value={values.phone}
                        placeholder="Mobile No"
                        className="bg-white ps-3 border rounded"
                      />
                      {errors.phone && touched.phone && <div className="d-block text-danger">{errors.phone}</div>}
                    </div>
                    <div className="col-12 col-md-6 mb-1">
                      <div className="fw-bold p-1">
                        Firm Address <span className="text-danger"> *</span>
                        <OverlayTrigger placement="top" overlay={<Tooltip id="firm-desc-tooltip">Enter the complete business address of your firm.</Tooltip>}>
                          <span className="ms-1 text-dark" style={{ cursor: 'pointer' }}>
                            <CsLineIcons icon="info-hexagon" size={14} />
                          </span>
                        </OverlayTrigger>
                      </div>{' '}
                      <Form.Control
                        type="text"
                        autoComplete="street-address"
                        name="fullAddress"
                        onChange={handleChange}
                        placeholder="Enter House No, Colony name..."
                        value={values.fullAddress}
                        className="bg-white border rounded"
                      />
                      {errors.fullAddress && touched.fullAddress && <div className="d-block text-danger">{errors.fullAddress}</div>}
                    </div>
                    <div className="col-12 col-md-6 mb-1">
                      <div className="fw-bold p-1">
                        City <span className="text-danger"> *</span>
                        <OverlayTrigger placement="top" overlay={<Tooltip id="firm-desc-tooltip">Enter the city where your firm is located.</Tooltip>}>
                          <span className="ms-1 text-dark" style={{ cursor: 'pointer' }}>
                            <CsLineIcons icon="info-hexagon" size={14} />
                          </span>
                        </OverlayTrigger>
                      </div>{' '}
                      <Form.Control
                        type="text"
                        name="city"
                        onChange={handleChange}
                        placeholder="Enter City"
                        value={values.city}
                        className="bg-white ps-3 border rounded"
                      />
                      {errors.city && touched.city && <div className="d-block text-danger">{errors.city}</div>}
                    </div>
                    <div className="col-12 col-md-6 mb-1">
                      <div className="fw-bold p-1">
                        Pincode <span className="text-danger"> *</span>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id="firm-desc-tooltip">Enter the 6-digit pincode of your business location.</Tooltip>}
                        >
                          <span className="ms-1 text-dark" style={{ cursor: 'pointer' }}>
                            <CsLineIcons icon="info-hexagon" size={14} />
                          </span>
                        </OverlayTrigger>
                      </div>{' '}
                      <Form.Control
                        type="text"
                        name="pincode"
                        onKeyDown={(e) => {
                          if (e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete' && (e.key < '0' || e.key > '9')) {
                            e.preventDefault();
                          }
                        }}
                        maxLength="6"
                        onChange={handleChange}
                        placeholder="Enter Pincode"
                        value={values.pincode}
                        className="bg-white ps-3 border rounded"
                      />
                      {errors.pincode && touched.pincode && <div className="d-block text-danger">{errors.pincode}</div>}
                    </div>
                    <div className="col-12 col-md-6 mb-1">
                      <div className="fw-bold p-1">
                        State <span className="text-danger"> *</span>
                        <OverlayTrigger placement="top" overlay={<Tooltip id="firm-desc-tooltip">Select the state where your firm is registered.</Tooltip>}>
                          <span className="ms-1 text-dark" style={{ cursor: 'pointer' }}>
                            <CsLineIcons icon="info-hexagon" size={14} />
                          </span>
                        </OverlayTrigger>
                      </div>
                      <Form.Select
                        name="state"
                        onChange={handleChange}
                        value={values.state}
                        aria-label="Default select example"
                        className="bg-white border rounded"
                      >
                        <option hidden>Select State</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                        <option value="Assam">Assam</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Chandigarh">Chandigarh</option>
                        <option value="Chhattisgarh">Chhattisgarh</option>
                        <option value="Dadar and Nagar Haveli">Dadar and Nagar Haveli</option>
                        <option value="Daman and Diu">Daman and Diu</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Lakshadweep">Lakshadweep</option>
                        <option value="Puducherry">Puducherry</option>
                        <option value="Goa">Goa</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                        <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Manipur">Manipur</option>
                        <option value="Meghalaya">Meghalaya</option>
                        <option value="Mizoram">Mizoram</option>
                        <option value="Nagaland">Nagaland</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Sikkim">Sikkim</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Tripura">Tripura</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="West Bengal">West Bengal</option>
                      </Form.Select>
                      {errors.state && touched.state && <div className="d-block text-danger">{errors.state}</div>}
                    </div>
                    <div className="col-12 col-md-6 mb-1">
                      <div className="fw-bold p-1">WhatsApp Number</div>
                      <Form.Control
                        type="tel"
                        onKeyDown={(e) => {
                          if (e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete' && (e.key < '0' || e.key > '9')) {
                            e.preventDefault();
                          }
                        }}
                        maxLength="10"
                        name="whatsAppMobileNo"
                        onChange={handleChange}
                        value={values.whatsAppMobileNo}
                        placeholder="Enter WhatsApp Number"
                        className="bg-white ps-3 m-0 border rounded"
                      />
                      {errors.whatsAppMobileNo && touched.whatsAppMobileNo && <div className="d-block text-danger">{errors.whatsAppMobileNo}</div>}
                    </div>
                    <div className="col-12 mb-1">
                      <div className="fw-bold p-1">
                        Firm Description <span className="text-danger"> *</span>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id="firm-desc-tooltip">Briefly describe your business activities and experience.</Tooltip>}
                        >
                          <span className="ms-1 text-dark" style={{ cursor: 'pointer' }}>
                            <CsLineIcons icon="info-hexagon" size={14} />
                          </span>
                        </OverlayTrigger>
                      </div>
                      <Form.Control
                        type="text"
                        name="desc"
                        as="textarea"
                        onChange={handleChange}
                        placeholder="Enter firm description"
                        value={values.desc}
                        className="bg-white ps-3 border rounded"
                      />
                      {errors.desc && touched.desc && <div className="d-block text-danger">{errors.desc}</div>}
                    </div>
                    <div className="ps-3 px-3">
                      <div className="border rounded p-3">
                        <div className="row">
                          <div className="fw-bold w-100 pb-2 fs-6">
                            Select Associate <span className="text-danger">*</span>
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip id="firm-desc-tooltip">Select the associate role(s) relevant to your business.</Tooltip>}
                            >
                              <span className="ms-1 text-dark" style={{ cursor: 'pointer' }}>
                                <CsLineIcons icon="info-hexagon" size={14} />
                              </span>
                            </OverlayTrigger>
                          </div>
                          <div className="col-12 col-md-3 mb-1">
                            <div className="d-flex align-items-center">
                              <Form.Check
                                type="checkbox"
                                name="enquiryAssociate"
                                label="Enquiry Associate"
                                checked={values.enquiryAssociate}
                                onChange={handleChange}
                                className="bg-white"
                              />
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="firm-desc-tooltip">Handles customer queries and incoming leads, ensuring timely and accurate responses.</Tooltip>
                                }
                              >
                                <span className="ms-1 text-dark" style={{ cursor: 'pointer' }}>
                                  <CsLineIcons icon="info-hexagon" size={14} />
                                </span>
                              </OverlayTrigger>
                            </div>{' '}
                          </div>
                          {/* <div className="col-12 col-md-3 mb-1">
                            <Form.Check
                              type="checkbox"
                              name="serviceAssociate"
                              label="Service Associate"
                              checked={values.serviceAssociate}
                              onChange={handleChange}
                              className="bg-white"
                            />
                          </div> */}
                          <div className="col-12 col-md-3 mb-1">
                            <div className="d-flex align-items-center">
                              <Form.Check
                                type="checkbox"
                                name="sellerAssociate"
                                label="Seller Associate"
                                checked={values.sellerAssociate}
                                onChange={handleChange}
                                className="bg-white"
                              />
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="firm-desc-tooltip">
                                    Manages products, inventory, listings, and order processing to maintain smooth operations.
                                  </Tooltip>
                                }
                              >
                                <span className="ms-1 text-dark" style={{ cursor: 'pointer' }}>
                                  <CsLineIcons icon="info-hexagon" size={14} />
                                </span>
                              </OverlayTrigger>
                            </div>
                          </div>
                          <div className="col-12 col-md-3 mb-1">
                            <div className="d-flex align-items-center">
                              <Form.Check
                                type="checkbox"
                                name="businessAssociate"
                                label="Business Associate"
                                checked={values.businessAssociate}
                                onChange={handleChange}
                                className="me-2"
                              />
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="firm-desc-tooltip">
                                    The Business Associate primarily manages product listings, listing processing, and price management. They bring orders from
                                    their dealers, and the dealers fulfill these orders. This role is suitable for businesses operating at a manufacturing or
                                    large company level, where multiple dealers operate under them.
                                  </Tooltip>
                                }
                              >
                                <span className="text-dark" style={{ cursor: 'pointer' }}>
                                  <CsLineIcons icon="info-hexagon" size={14} />
                                </span>
                              </OverlayTrigger>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {values.enquiryAssociate && (
                      <div className="ps-3 px-3 mt-3">
                        <div className="border rounded p-3">
                          <div className="row">
                            <div className="fw-bold w-100 pb-2 fs-6">Premium Plan</div>
                            <div className="col-12 col-md-3 mb-1">
                              <div className="d-flex align-items-center">
                                <Form.Check
                                  type="checkbox"
                                  name="whatsAppPermission"
                                  label="WhatsApp Permission"
                                  checked={values.whatsAppPermission}
                                  onChange={handleChange}
                                  className="bg-white"
                                />
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id="firm-desc-tooltip">
                                      Allows the system to send notifications, updates, and customer enquiry leads instantly via WhatsApp when you are selected
                                      as an Enquiry Associate.
                                    </Tooltip>
                                  }
                                >
                                  <span className="ms-1 text-dark" style={{ cursor: 'pointer' }}>
                                    <CsLineIcons icon="info-hexagon" size={14} />
                                  </span>
                                </OverlayTrigger>
                              </div>{' '}
                            </div>
                            <div className="col-12 col-md-3 mb-1">
                              <div className="d-flex align-items-center">
                                <Form.Check
                                  type="checkbox"
                                  name="emailPermission"
                                  label="Email Permission"
                                  checked={values.emailPermission}
                                  onChange={handleChange}
                                  className="bg-white"
                                />
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id="firm-desc-tooltip">
                                      Allows the system to send notifications, updates, and customer enquiry leads instantly via email when you are selected as
                                      an Enquiry Associate.
                                    </Tooltip>
                                  }
                                >
                                  <span className="ms-1 text-dark" style={{ cursor: 'pointer' }}>
                                    <CsLineIcons icon="info-hexagon" size={14} />
                                  </span>
                                </OverlayTrigger>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="mt-2 text-end w-100">
                      <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Submit'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
export default AddSeller;
