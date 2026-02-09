import React, { useState, useEffect } from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';
import { Row, Col, Button, Form, Card } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { NavLink, useHistory } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { stateList } from 'components/stateList/stateList';
import { toast } from 'react-toastify';

const CREATE_STORE_FEATURE = gql`
  mutation CreateStoreFeature(
    $storeName: String
    $key: String
    $solt: String
    $ccKey: String
    $ccSolt: String
    $bgColor: String
    $fontColor: String
    $pincode: Boolean
    $associate: Boolean
    $online: Boolean
    $dmt: Boolean
    $cod: Boolean
    $fixSeries: Boolean
    $customSeries: Boolean
    $storeBusinessName: String
    $storeBusinessAddress: String
    $storeBusinessCity: String
    $storeBusinessState: String
    $storeBusinessPanNo: String
    $storeBusinessGstin: String
    $storeBusinessCinNo: String
    $comBillFormate: String
    $sellerBillFormate: String
    $whatsappAPINo: String
    $dtmHelpVideo: String
    $sellerMasking: Boolean
  ) {
    createStoreFeature(
      storeName: $storeName
      key: $key
      solt: $solt
      ccKey: $ccKey
      ccSolt: $ccSolt
      bgColor: $bgColor
      fontColor: $fontColor
      pincode: $pincode
      associate: $associate
      online: $online
      dmt: $dmt
      cod: $cod
      fixSeries: $fixSeries
      customSeries: $customSeries
      storeBusinessName: $storeBusinessName
      storeBusinessAddress: $storeBusinessAddress
      storeBusinessCity: $storeBusinessCity
      storeBusinessState: $storeBusinessState
      storeBusinessPanNo: $storeBusinessPanNo
      storeBusinessGstin: $storeBusinessGstin
      storeBusinessCinNo: $storeBusinessCinNo
      comBillFormate: $comBillFormate
      sellerBillFormate: $sellerBillFormate
      whatsappAPINo: $whatsappAPINo
      dtmHelpVideo: $dtmHelpVideo
      sellerMasking: $sellerMasking
    ) {
      id
    }
  }
`;
const GET_STORE_FEATURES = gql`
  query GetStoreFeature {
    getStoreFeature {
      storeName
      key
      solt
      pincode
      online
      dmt
      cod
      fixSeries
      associate
      customSeries
      storeBusinessName
      storeBusinessAddress
      storeBusinessCity
      storeBusinessState
      storeBusinessPanNo
      storeBusinessGstin
      storeBusinessCinNo
      comBillFormate
      sellerBillFormate
      ccKey
      ccSolt
      bgColor
      fontColor
      whatsappAPINo
      dtmHelpVideo
      sellerMasking
    }
  }
`;

const Chart = () => {
  const title = 'Master Admin Dashboard';
  const description = 'Master Admin Dashboard Page';
  const dispatch = useDispatch();
  const history = useHistory();
  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);
  const allStatesList = stateList();
  const initialState = {
    storeName: '',
    key: '',
    solt: '',
    pincode: false,
    online: false,
    dmt: false,
    cod: false,
    associate: false,
    fixSeries: false,
    customSeries: false,
    storeBusinessName: '',
    storeBusinessAddress: '',
    storeBusinessCity: '',
    storeBusinessState: '',
    storeBusinessPanNo: '',
    storeBusinessGstin: '',
    storeBusinessCinNo: '',
    comBillFormate: '',
    sellerBillFormate: '',
    ccKey: '',
    ccSolt: '',
    bgColor: '',
    fontColor: '',
    whatsappAPINo: '',
    dtmHelpVideo: '',
    sellerMasking: false,
  };
  const [formData, setFormData] = useState(initialState);
  const { refetch } = useQuery(GET_STORE_FEATURES, {
    onCompleted: (res) => {
      setFormData({
        ...res?.getStoreFeature,
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Something went wrong!');
      if (error.message === 'Authorization header is missing' || error.message === 'jwt expired') {
        history.push('/login');
      }
      console.log('GET_STORE_FEATURES', error);
    },
  });
  useEffect(() => {
    refetch();
  }, []);
  const [CreateStoreFeature] = useMutation(CREATE_STORE_FEATURE, {
    onCompleted: () => {
      toast.success('Data updated successfully!');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Something Went Wrong !');
      if (error.message === 'Authorization header is missing' || error.message === 'jwt expired') {
        history.push('/login');
      } 
    },
  });
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    let truncatedValue = newValue;
    if (name === 'sellerBillFormate') {
      truncatedValue = newValue.slice(0, 3);
    }
    if (name === 'comBillFormate') {
      truncatedValue = newValue.slice(0, 12);
    }
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: truncatedValue,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    await CreateStoreFeature({
      variables: formData,
    });
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <style>
        {`.bg_color {
          background: ${formData.bgColor};
          color: ${formData.fontColor};
        }`}
        {`.font_color {
          color: ${formData.fontColor};
        }`}
        {`
          .btn_color {
            background: ${formData.bgColor};
            color: ${formData.fontColor};
            transition: background 0.3s ease;
            padding: 10px 30px;
            border: none;
            cursor: pointer;            
          }
          .btn_color:hover {
            background: ${formData.bgColor};
            filter: brightness(80%);       
          }
        `}
      </style>
      <div className="page-title-container m-0">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto bg_color bg_color w-100 p-3 rounded fw-bold">
            <h1 className="mb-0 pb-0 fw-bold bg_color display-6 " id="title">
              Master Admin
            </h1>
          </Col>
        </Row>
      </div>
      <div className="bg-white p-3">
        <Form onSubmit={handleSubmit} className="p-3">
          {/* Website Info */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-light border-0 border-bottom d-flex align-items-center py-3 px-3">
              <div className="border-start border-4 border-primary ps-3">
                <h5 className="mb-0 fw-semibold text-dark fw-bold">Website Information</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label className="text-dark fw-bold">Website Name</Form.Label>
                  <Form.Control required type="text" name="storeName" value={formData.storeName || ''} onChange={handleChange} />
                </Col>
                <Col md={6}>
                  <Form.Label className="text-dark fw-bold">Store Business Name</Form.Label>
                  <Form.Control required type="text" name="storeBusinessName" value={formData.storeBusinessName || ''} onChange={handleChange} />
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Label className="text-dark fw-bold">Address</Form.Label>
                  <Form.Control required type="text" name="storeBusinessAddress" value={formData.storeBusinessAddress || ''} onChange={handleChange} />
                </Col>
                <Col md={3}>
                  <Form.Label className="text-dark fw-bold">City</Form.Label>
                  <Form.Control required type="text" name="storeBusinessCity" value={formData.storeBusinessCity || ''} onChange={handleChange} />
                </Col>
                <Col md={3}>
                  <Form.Label className="text-dark fw-bold">State</Form.Label>
                  <Form.Select name="storeBusinessState" value={formData.storeBusinessState} onChange={handleChange} required>
                    <option value="">Select State</option>
                    {allStatesList.map((state, index) => (
                      <option value={state.value} key={index}>
                        {state.displayValue}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Business Info */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-light border-0 border-bottom d-flex align-items-center py-3 px-3">
              <div className="border-start border-4 border-primary ps-3">
                <h5 className="mb-0 fw-semibold text-dark fw-bold">Business Details</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Label className="text-dark fw-bold">PAN No.</Form.Label>
                  <Form.Control type="text" name="storeBusinessPanNo" value={formData.storeBusinessPanNo || ''} onChange={handleChange} />
                </Col>
                <Col md={4}>
                  <Form.Label className="text-dark fw-bold">GST No.</Form.Label>
                  <Form.Control type="text" name="storeBusinessGstin" value={formData.storeBusinessGstin || ''} onChange={handleChange} />
                </Col>
                <Col md={4}>
                  <Form.Label className="text-dark fw-bold">CIN No.</Form.Label>
                  <Form.Control type="text" name="storeBusinessCinNo" value={formData.storeBusinessCinNo || ''} onChange={handleChange} />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Billing Section */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-light border-0 border-bottom d-flex align-items-center py-3 px-3">
              <div className="border-start border-4 border-primary ps-3">
                <h5 className="mb-0 fw-semibold text-dark fw-bold">Billing Format</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Label className="text-dark fw-bold">Seller Bill Format (SELL/23-24/SSO/0001)</Form.Label>
                  <Form.Control
                    type="text"
                    name="sellerBillFormate"
                    maxLength={3}
                    placeholder="3 characters only"
                    value={formData.sellerBillFormate || ''}
                    onChange={handleChange}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="text-dark fw-bold">Commission Bill Format (MYSOL/2425/0001)</Form.Label>
                  <Form.Control
                    type="text"
                    name="comBillFormate"
                    maxLength={12}
                    placeholder="12 characters only"
                    value={formData.comBillFormate || ''}
                    onChange={handleChange}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Payment Settings */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-light border-0 border-bottom d-flex align-items-center py-3 px-3">
              <div className="border-start border-4 border-primary ps-3">
                <h5 className="mb-0 fw-semibold text-dark fw-bold">Payment Gateway Settings</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Label className="text-dark fw-bold">PayUMoney Key</Form.Label>
                  <Form.Control type="text" name="key" value={formData.key || ''} onChange={handleChange} />
                </Col>
                <Col md={6}>
                  <Form.Label className="text-dark fw-bold">PayUMoney Salt</Form.Label>
                  <Form.Control type="text" name="solt" value={formData.solt || ''} onChange={handleChange} />
                </Col>
              </Row>

              <Row className="mt-3">
                <Col md={6}>
                  <Form.Label className="text-dark fw-bold">CC Avenue Key</Form.Label>
                  <Form.Control type="text" name="ccKey" value={formData.ccKey || ''} onChange={handleChange} />
                </Col>
                <Col md={6}>
                  <Form.Label className="text-dark fw-bold">CC Avenue Salt</Form.Label>
                  <Form.Control type="text" name="ccSolt" value={formData.ccSolt || ''} onChange={handleChange} />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Design Section */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-light border-0 border-bottom d-flex align-items-center py-3 px-3">
              <div className="border-start border-4 border-primary ps-3">
                <h5 className="mb-0 fw-semibold text-dark fw-bold">Design Settings</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Label className="text-dark fw-bold">Background Color</Form.Label>
                  <Form.Control type="color" name="bgColor" value={formData.bgColor || '#ffffff'} onChange={handleChange} />
                </Col>
                <Col md={6}>
                  <Form.Label className="text-dark fw-bold">Font Color</Form.Label>
                  <Form.Control type="color" name="fontColor" value={formData.fontColor || '#000000'} onChange={handleChange} />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Toggles */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-light border-0 border-bottom d-flex align-items-center py-3 px-3">
              <div className="border-start border-4 border-primary ps-3">
                <h5 className="mb-0 fw-semibold text-dark fw-bold">Enable/Disable Options</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                {[
                  { key: 'online', label: 'Online Order' },
                  { key: 'dmt', label: 'DMT Order' },
                  { key: 'cod', label: 'Cash on Delivery (COD)' },
                  { key: 'pincode', label: 'Enable Pincode Check' },
                  { key: 'associate', label: 'Associate Program' },
                  { key: 'fixSeries', label: 'Fixed Series' },
                  { key: 'customSeries', label: 'Custom Series' },
                  // { key: 'sellerMasking', label: 'Seller Masking' },
                ].map(({ key, label }) => (
                  <Col md={3} className="mb-2" key={key}>
                    <Form.Check type="switch" id={key} label={label} name={key} checked={formData[key] || false} onChange={handleChange} />
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          <div className="text-end">
            <Button variant="primary" type="submit" className="px-4 py-2 rounded-pill">
              Save Settings
            </Button>
          </div>
        </Form>
        {/* <Form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="fw-bold text-dark" htmlFor="storeName">
                Website Name
              </Form.Label>
            </div>
            <div className="col-6">
              <Form.Control id="storeName" required type="text" name="storeName" value={formData.storeName || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="fw-bold text-dark" htmlFor="key">
                PayUMoney Key
              </Form.Label>
            </div>
            <div className="col-6">
              <Form.Control id="key" type="text" name="key" value={formData.key || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="fw-bold text-dark" htmlFor="solt">
                PayUMoney Solt
              </Form.Label>
            </div>
            <div className="col-6">
              <Form.Control id="solt" type="text" name="solt" value={formData.solt || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="fw-bold text-dark" htmlFor="ccKey">
                CC Avenue Key
              </Form.Label>
            </div>
            <div className="col-6">
              <Form.Control id="ccKey" type="text" name="ccKey" value={formData.ccKey || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="fw-bold text-dark" htmlFor="ccSolt">
                CC Avenue Solt
              </Form.Label>
            </div>
            <div className="col-6">
              <Form.Control id="ccSolt" type="text" name="ccSolt" value={formData.ccSolt || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="fw-bold text-dark" htmlFor="online">
                Online
              </Form.Label>
            </div>
            <div className="col-6">
              <Form.Check name="online" type="checkbox" inline id="online" checked={formData.online || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="fw-bold text-dark" htmlFor="dmt">
                DMT
              </Form.Label>
            </div>
            <div className="col-6">
              <Form.Check name="dmt" type="checkbox" inline id="dmt" checked={formData.dmt || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="fw-bold text-dark" htmlFor="cod">
                COD
              </Form.Label>
            </div>
            <div className="col-6">
              <Form.Check name="cod" type="checkbox" inline id="cod" checked={formData.cod || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="fw-bold text-dark" htmlFor="pincode">
                Pincode
              </Form.Label>
            </div>
            <div className="col-6">
              <Form.Check name="pincode" type="checkbox" inline id="pincode" checked={formData.pincode || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="fw-bold text-dark" htmlFor="associate">
                Quick Links Associate{' '}
              </Form.Label>
            </div>
            <div className="col-6">
              <Form.Check name="associate" type="checkbox" inline id="associate" checked={formData.associate || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="fw-bold text-dark" htmlFor="fixSeries">
                Fix Series Product
              </Form.Label>
            </div>
            <div className="col-6">
              <Form.Check name="fixSeries" type="checkbox" inline id="fixSeries" checked={formData.fixSeries || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="fw-bold text-dark" htmlFor="customSeries">
                Custom Series Product
              </Form.Label>
            </div>
            <div className="col-6">
              <Form.Check name="customSeries" type="checkbox" inline id="customSeries" checked={formData.customSeries || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="fw-bold text-dark" htmlFor="storeBusinessName">
                Store Business Name
              </Form.Label>
            </div>
            <div className="col-6">
              <Form.Control
                id="storeBusinessName"
                required
                type="text"
                name="storeBusinessName"
                value={formData.storeBusinessName || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="fw-bold text-dark" htmlFor="storeBusinessAddress">
                Address
              </Form.Label>
            </div>
            <div className="col-6">
              <Form.Control
                id="storeBusinessAddress"
                required
                type="text"
                name="storeBusinessAddress"
                value={formData.storeBusinessAddress || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="fw-bold text-dark" htmlFor="storeBusinessCity">
                City
              </Form.Label>
            </div>
            <div className="col-6">
              <Form.Control
                id="storeBusinessCity"
                required
                type="text"
                name="storeBusinessCity"
                value={formData.storeBusinessCity || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="fw-bold text-dark" htmlFor="storeBusinessState">
                State
              </Form.Label>
            </div>
            <div className="col-6">
              <Form.Select name="storeBusinessState" onChange={handleChange} value={formData.storeBusinessState} aria-label="Default select example">
                <option value="" hidden>
                  Select State
                </option>
                {allStatesList.map((state, index) => (
                  <option value={state.value} key={index}>
                    {state.displayValue}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="fw-bold text-dark" htmlFor="storeBusinessPanNo">
                PAN No.
              </Form.Label>
            </div>
            <div className="col-6">
              <Form.Control
                id="storeBusinessPanNo"
                required
                type="text"
                name="storeBusinessPanNo"
                value={formData.storeBusinessPanNo || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="fw-bold text-dark" htmlFor="storeBusinessGstin">
                GST No.
              </Form.Label>
            </div>
            <div className="col-6">
              <Form.Control
                id="storeBusinessGstin"
                required
                type="text"
                name="storeBusinessGstin"
                value={formData.storeBusinessGstin || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="fw-bold text-dark" htmlFor="storeBusinessCinNo">
                CIN No.
              </Form.Label>
            </div>
            <div className="col-6">
              <Form.Control id="storeBusinessCinNo" type="text" name="storeBusinessCinNo" value={formData.storeBusinessCinNo || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="fw-bold text-dark" htmlFor="whatsappAPINo">
                WhatsApp API No.
              </Form.Label>
            </div>
            <div className="col-6">
              <Form.Control id="whatsappAPINo" type="text" name="whatsappAPINo" value={formData.whatsappAPINo || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="text-dark fw-bold" htmlFor="dtmHelpVideo">
                DTM Help Video
              </Form.Label>
            </div>
            <div className="col-6">
              <Form.Control id="dtmHelpVideo" type="text" name="dtmHelpVideo" value={formData.dtmHelpVideo || ''} onChange={handleChange} />
            </div>
          </div>
          <h5 className="text-dark mt-4 border-bottom pb-2 fw-bold">Billing</h5>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-dark">
                  Seller Bill Format <span className="small">(SELL/23-24/SSO/0001)</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="sellerBillFormate"
                  value={formData.sellerBillFormate || ''}
                  onChange={handleChange}
                  required
                  maxLength={3}
                  placeholder="Only 3 characters"
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-dark">
                  Commission Bill Format <span className="small">(MYSOL/2425/0001)</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="comBillFormate"
                  value={formData.comBillFormate || ''}
                  onChange={handleChange}
                  required
                  maxLength={12}
                  placeholder="Only 12 characters"
                />
              </Form.Group>
            </div>
          </div> 
          <h5 className="text-dark fw-bold mt-4 border-bottom pb-2">Design</h5>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-dark">Background Color</Form.Label>
                <Form.Control type="color" name="bgColor" value={formData.bgColor || '#ffffff'} onChange={handleChange} />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-dark">Font Color</Form.Label>
                <Form.Control type="color" name="fontColor" value={formData.fontColor || '#000000'} onChange={handleChange} />
              </Form.Group>
            </div>
          </div>
          <div className="row mb-3 border-top pt-4">
            <div className="col-12 text-end">
              <Button className="ms-3 btn_color" type="submit">
                Save
              </Button>
            </div>
          </div>
        </Form> */}
      </div>
    </>
  );
};

export default Chart;
