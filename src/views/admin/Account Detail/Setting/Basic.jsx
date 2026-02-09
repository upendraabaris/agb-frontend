import React, { useState, useEffect } from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';
import { Row, Col, Button, Form, Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
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
      associate
      online
      dmt
      cod
      fixSeries
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
    }
  }
`;

const Chart = () => {
  const title = 'Website Setting!';
  const description = 'Website Setting!';
  const dispatch = useDispatch();
  const history = useHistory();
  const [loading, setLoading] = useState(false); // Added loading state

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
    associate: false,
    online: false,
    dmt: false,
    cod: false,
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
    },
  });
  useEffect(() => {
    refetch();
  }, []);

  const [CreateStoreFeature] = useMutation(CREATE_STORE_FEATURE, {
    onCompleted: () => {
      toast.success('Store feature updated successfully !');
      refetch();
      setLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Something Went Wrong !');
      if (error.message === 'Authorization header is missing' || error.message === 'jwt expired') {
        history.push('/login');
      } 
      setLoading(false);
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    let truncatedValue = newValue;

    // Limit sellerBillFormate to 4 characters
    if (name === 'sellerBillFormate') {
      truncatedValue = newValue.slice(0, 3);
    }

    // Limit comBillFormate to 8 characters
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
    setLoading(true);
    await CreateStoreFeature({
      variables: formData,
    });
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container m-0">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto bg-dark w-100 p-3 rounded fw-bold">
            <h1 className="mb-0 pb-0 fw-bold display-4 fs-6" id="title">
              Portal Admin
            </h1>
          </Col>
        </Row>
      </div>
      <div className="bg-white p-3">
        <Form onSubmit={handleSubmit}>
          <div className="border rounded mb-1">
            <div className="fw-bold rounded-top bg-info p-2">Website Name</div>
            <div className="p-2">
              <div className="row mb-3">
                <div className="col-6">
                  <Form.Label className="text-dark fw-bold" htmlFor="storeName">
                    Website Name
                  </Form.Label>
                </div>
                <div className="col-6">
                  <Form.Control id="storeName" type="text" required name="storeName" value={formData.storeName || ''} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>
          <div className="border rounded mb-1">
            <div className="fw-bold rounded-top bg-info p-2">Website Business Information</div>
            <div className="p-2">
              <div className="row mb-3">
                <div className="col-6">
                  <Form.Label className="text-dark fw-bold" htmlFor="storeBusinessName">
                    Website Business Name
                  </Form.Label>
                </div>
                <div className="col-6">
                  <Form.Control
                    id="storeBusinessName"
                    type="text"
                    required
                    name="storeBusinessName"
                    value={formData.storeBusinessName || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-6">
                  <Form.Label className="text-dark fw-bold" htmlFor="storeBusinessAddress">
                    Address
                  </Form.Label>
                </div>
                <div className="col-6">
                  <Form.Control
                    id="storeBusinessAddress"
                    type="text"
                    as="textarea"
                    required
                    name="storeBusinessAddress"
                    value={formData.storeBusinessAddress || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-6">
                  <Form.Label className="text-dark fw-bold" htmlFor="storeBusinessCity">
                    City
                  </Form.Label>
                </div>
                <div className="col-6">
                  <Form.Control
                    id="storeBusinessCity"
                    type="text"
                    required
                    name="storeBusinessCity"
                    value={formData.storeBusinessCity || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-6">
                  <Form.Label className="text-dark fw-bold" htmlFor="storeBusinessState">
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
                  <Form.Label className="text-dark fw-bold" htmlFor="storeBusinessPanNo">
                    PAN No.
                  </Form.Label>
                </div>
                <div className="col-6">
                  <Form.Control
                    id="storeBusinessPanNo"
                    type="text"
                    required
                    name="storeBusinessPanNo"
                    value={formData.storeBusinessPanNo || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-6">
                  <Form.Label className="text-dark fw-bold" htmlFor="storeBusinessGstin">
                    GST No.
                  </Form.Label>
                </div>
                <div className="col-6">
                  <Form.Control
                    id="storeBusinessGstin"
                    type="text"
                    required
                    name="storeBusinessGstin"
                    value={formData.storeBusinessGstin || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-6">
                  <Form.Label className="text-dark fw-bold" htmlFor="storeBusinessCinNo">
                    CIN No.
                  </Form.Label>
                </div>
                <div className="col-6">
                  <Form.Control
                    id="storeBusinessCinNo"
                    type="text"
                    name="storeBusinessCinNo"
                    value={formData.storeBusinessCinNo || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-6">
                  <Form.Label className="text-dark fw-bold" htmlFor="whatsappAPINo">
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
                  {formData.dtmHelpVideo && (
                    <div className="border rounded mb-1">
                      <div className="p-2">
                        <div className="ratio ratio-16x9">
                          <iframe
                            src={formData.dtmHelpVideo}
                            title="Website Setting Tutorial"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="border rounded mb-1">
            <div className="fw-bold rounded-top bg-info p-2">Bill Format Information</div>
            <div className="p-2">
              <div className="row mb-3">
                <div className="col-6">
                  <Form.Label className="text-dark fw-bold" htmlFor="sellerBillFormate">
                    Seller Bill Format{' '}
                  </Form.Label>
                  <div className="small">(Example: SELL/23-24/{formData.sellerBillFormate}/0001)</div>
                </div>
                <div className="col-6">
                  <Form.Control
                    id="sellerBillFormate"
                    type="text"
                    required
                    name="sellerBillFormate"
                    value={formData.sellerBillFormate || ''}
                    onChange={handleChange}
                  />
                  <div className="small">(Only 3 characters allow)</div>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-6">
                  <Form.Label className="text-dark fw-bold" htmlFor="comBillFormate">
                    Commission Bill Format
                  </Form.Label>
                  <div className="small">(Example: {formData.comBillFormate}/0001)</div>
                </div>
                <div className="col-6">
                  <Form.Control id="comBillFormate" required type="text" name="comBillFormate" value={formData.comBillFormate || ''} onChange={handleChange} />
                  <div className="small">(Only 12 characters allow)</div>
                </div>
              </div>
            </div>
          </div>
          <div className="border rounded mb-1">
            <div className="fw-bold rounded-top bg-info p-2">Payment Methods</div>
            <div className="p-2">
              <>
                <div className="row mb-3">
                  <div className="col-6">
                    <Form.Label className="text-dark fw-bold" htmlFor="online">
                      Online
                    </Form.Label>
                  </div>
                  <div className="col-6">
                    <Form.Check name="online" type="checkbox" inline id="online" checked={formData.online || false} onChange={handleChange} />
                  </div>
                </div>

                {formData.online && (
                  <>
                    <div className="p-2 border mb-2 rounded">
                      <div className="text-dark fw-bold pb-3 text-end">"Activate payment gateway: Enter key and salt for seamless transactions."</div>
                      <div className="row mb-3">
                        <div className="col-6">
                          <Form.Label className="text-dark fw-bold" htmlFor="key">
                            PayUmoney Key
                          </Form.Label>
                        </div>
                        <div className="col-6">
                          <Form.Control id="key" type="text" name="key" value={formData.key || ''} onChange={handleChange} />
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-6">
                          <Form.Label className="text-dark fw-bold" htmlFor="solt">
                            PayUmoney Solt
                          </Form.Label>
                        </div>
                        <div className="col-6">
                          <Form.Control id="solt" type="text" name="solt" value={formData.solt || ''} onChange={handleChange} />
                        </div>
                      </div>
                      {/* CC Avenue */}
                      <div className="row mb-3">
                        <div className="col-6">
                          <Form.Label className="text-dark fw-bold" htmlFor="ccKey">
                            CC Anenue Key
                          </Form.Label>
                        </div>
                        <div className="col-6">
                          <Form.Control id="ccKey" type="text" name="ccKey" value={formData.ccKey || ''} onChange={handleChange} />
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-6">
                          <Form.Label className="text-dark fw-bold" htmlFor="ccSolt">
                            CC Avenue Solt
                          </Form.Label>
                        </div>
                        <div className="col-6">
                          <Form.Control id="ccSolt" type="text" name="ccSolt" value={formData.ccSolt || ''} onChange={handleChange} />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
              <div className="row mb-3">
                <div className="col-6">
                  <Form.Label className="text-dark fw-bold" htmlFor="dmt">
                    DMT
                  </Form.Label>
                </div>
                <div className="col-6">
                  <Form.Check name="dmt" type="checkbox" inline id="dmt" checked={formData.dmt || false} onChange={handleChange} />
                  <>{formData.dmt && <a href="/admin/account/detail">Edit Bank Details</a>}</>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-6">
                  <Form.Label className="text-dark fw-bold" htmlFor="cod">
                    COD
                  </Form.Label>
                </div>
                <div className="col-6">
                  <Form.Check name="cod" type="checkbox" inline id="cod" checked={formData.cod || ''} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          <div className="border rounded mb-1">
            <div className="fw-bold rounded-top bg-info p-2">Website Theme Color</div>
            <div className="p-2">
              <div className="row mb-3">
                <div className="col-6">
                  <Form.Label className="text-dark fw-bold" htmlFor="bgColor">
                    BG Color{' '}
                  </Form.Label>
                </div>
                <div className="col-6">
                  <Form.Control id="bgColor" type="text" required name="bgColor" value={formData.bgColor || ''} onChange={handleChange} />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-6">
                  <Form.Label className="text-dark fw-bold" htmlFor="fontColor">
                    Font Color
                  </Form.Label>
                </div>
                <div className="col-6">
                  <Form.Control id="fontColor" required type="text" name="fontColor" value={formData.fontColor || ''} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>
          <div className="row mb-3 col-3 mx-2 float-end">
            <div className="col-3 w-100">
              {loading ? (
                <div className="text-center mb-3">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : (
                <Button className="ms-3 w-100" type="submit">
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              )}
            </div>
          </div>
          <Form.Check name="pincode" hidden type="checkbox" inline id="pincode" checked={formData.pincode || ''} onChange={handleChange} />
          <Form.Check name="associate" hidden type="checkbox" inline id="associate" checked={formData.associate || ''} onChange={handleChange} />
          <Form.Check name="fixSeries" hidden type="checkbox" inline id="fixSeries" checked={formData.fixSeries || ''} onChange={handleChange} />
          <Form.Check name="customSeries" hidden type="checkbox" inline id="customSeries" checked={formData.customSeries || ''} onChange={handleChange} />
        </Form>
      </div>
    </>
  );
};

export default Chart;
