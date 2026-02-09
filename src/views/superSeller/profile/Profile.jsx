import { React, useEffect, useState } from 'react';
import { useHistory, NavLink } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import { useLazyQuery, gql, useMutation, useQuery } from '@apollo/client';
import { Button, Modal, Form, Row, Col, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { InfoCircle } from 'react-bootstrap-icons';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';

export const GET_SELLER = gql`
  query GetSeller($getSellerId: ID!) {
    getSeller(id: $getSellerId) {
      id
      user {
        firstName
        lastName
        mobileNo
        email
      }
      superSellerId {
        companyName
      }
      companyName
      bill
      gstin
      pancardNo
      gstinComposition
      fullAddress
      city
      pincode
      companyDescription
      mobileNo
      email
      state
      allotted {
        dealerId
        pincode
        state
      }
      review {
        description
        userRating
        customerName
        ratingDate
      }
      overallrating
      accountHolderName
      accountNumber
      ifscCode
      bankName
      branchName
      upiId
    }
  }
`;

const EDIT_SELLER = gql`
  mutation UpdateSeller(
    $updateSellerId: ID!
    $companyName: String
    $bill: String
    $gstin: String
    $pancardNo: String
    $gstinComposition: Boolean
    $fullAddress: String
    $city: String
    $state: String
    $pincode: String
    $companyDescription: String
    $mobileNo: String
    $email: String
    $whatsAppMobileNo: String
    $whatsAppPermission: Boolean
    $emailPermission: Boolean
    $accountHolderName: String
    $accountNumber: String
    $ifscCode: String
    $bankName: String
    $branchName: String
    $upiId: String
    $sellerMasking: Boolean
  ) {
    updateSeller(
      id: $updateSellerId
      companyName: $companyName
      bill: $bill
      gstin: $gstin
      pancardNo: $pancardNo
      gstinComposition: $gstinComposition
      fullAddress: $fullAddress
      city: $city
      state: $state
      pincode: $pincode
      companyDescription: $companyDescription
      mobileNo: $mobileNo
      email: $email
      whatsAppMobileNo: $whatsAppMobileNo
      whatsAppPermission: $whatsAppPermission
      emailPermission: $emailPermission
      accountHolderName: $accountHolderName
      accountNumber: $accountNumber
      ifscCode: $ifscCode
      bankName: $bankName
      branchName: $branchName
      upiId: $upiId
      sellerMasking: $sellerMasking
    ) {
      companyName
      bill
      gstin
      pancardNo
      gstinComposition
      fullAddress
      city
      state
      pincode
      companyDescription
      mobileNo
      email
      emailPermission
      whatsAppPermission
      whatsAppMobileNo
      accountHolderName
      accountNumber
      ifscCode
      bankName
      branchName
      upiId
      sellerMasking
    }
  }
`;

const GET_USER_DETAIL = gql`
  query GetProfile {
    getProfile {
      id
      seller {
        id
      }
    }
  }
`;

function DetailSeller() {
  const title = 'Business Associate Profile';
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const { data: data1 } = useQuery(GET_USER_DETAIL);
  const sellerId = data1?.getProfile?.seller?.id;
  const id = sellerId;
  const history = useHistory();
  const [editModal, setEditModal] = useState(false);
  const [editBankModal, setEditBankModal] = useState(false);
  const [company, setCompany] = useState('');
  const [desc, setDesc] = useState('');
  const [mail, setMail] = useState('');
  const [phone, setPhone] = useState('');
  const [faddress, setfAddress] = useState('');
  const [citys, setCitys] = useState('');
  const [states, setStates] = useState('');
  const [pincodes, setPincodes] = useState('');
  const [gst, setGST] = useState('');
  const [bil, setBil] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);

  const [GetSeller, { data, refetch }] = useLazyQuery(GET_SELLER, {
    variables: {
      getSellerId: id,
    },
    onCompleted: (response) => {
      console.log('GET_SELLER Response:');
    },
    onError: (error) => {
      console.error('GET_SELLER Error:', error);
    },
  });
  useEffect(() => {
    const fetchData = async () => {
      await GetSeller();
    };
    fetchData();
  }, [GetSeller]);
  const [editSeller, { error: errorEdit, data: dataEdit }] = useMutation(EDIT_SELLER, {
    onCompleted: () => {
      setEditModal(false);
      setEditBankModal(false);
      refetch();
      toast.success(`Details updated successfully!`);
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });
  if (errorEdit) {
    console.log(`EDIT_SELLER : ${errorEdit.message}`);
  }
  const [errors, setErrors] = useState({});

  const handleSave = async () => {
    const newErrors = {};
    if (!accountHolderName.trim()) newErrors.accountHolderName = 'Account Holder Name is required.';
    if (!accountNumber.trim()) newErrors.accountNumber = 'Account Number is required.';
    if (!ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC Code is required';
    } else if (ifscCode.length !== 11) {
      newErrors.ifscCode = 'IFSC Code must be exactly 11 characters';
    }
    if (!bankName.trim()) newErrors.bankName = 'Bank Name is required.';
    if (!branchName.trim()) newErrors.branchName = 'Branch Name is required.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      await editSeller({
        variables: {
          updateSellerId: id,
          companyName: company,
          gstin: gst,
          fullAddress: faddress,
          city: citys,
          state: states,
          pincode: pincodes,
          companyDescription: desc,
          mobileNo: phone,
          email: mail,
          bill: bil,
          accountHolderName,
          accountNumber,
          ifscCode,
          bankName,
          branchName,
          upiId,
        },
      });
    } catch (err) {
      console.error('Error updating seller:', err);
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!company.trim()) newErrors.company = 'BA Name is required.';
    if (!mail.trim()) newErrors.mail = 'Email is required.';
    if (!phone.trim()) newErrors.phone = 'Mobile number is required.';
    if (!gst.trim()) newErrors.gst = 'GST No. is required.';
    if (!faddress.trim()) newErrors.address = 'Address is required.';
    if (!citys.trim()) newErrors.city = 'City is required.';
    if (!pincodes.trim()) newErrors.pincode = 'Pincode is required.';
    if (!states.trim()) newErrors.state = 'State is required.';
    if (!desc.trim()) newErrors.desc = 'BA Description is required.';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      await editSeller({
        variables: {
          updateSellerId: id,
          companyName: company,
          gstin: gst,
          fullAddress: faddress,
          city: citys,
          state: states,
          pincode: pincodes,
          companyDescription: desc,
          mobileNo: phone,
          email: mail,
          bill: bil,
          accountHolderName,
          accountNumber,
          ifscCode,
          bankName,
          branchName,
          upiId,
        },
      });
    } catch (err) {
      console.error('Error updating seller:', err);
    }
  };

  function handleEdit(event, event2, event3, event4, event5, event6, event7, event8, event9, event10) {
    setEditModal(true);
    setCompany(event);
    setDesc(event2);
    setPhone(event3);
    setMail(event4);
    setGST(event5);
    setfAddress(event6);
    setCitys(event7);
    setStates(event8);
    setPincodes(event9);
    setBil(event10);
  }
  function handleBankEdit(event11, event12, event13, event14, event15, event16) {
    setEditBankModal(true);
    setAccountHolderName(event11);
    setAccountNumber(event12);
    setIfscCode(event13);
    setBankName(event14);
    setBranchName(event15);
    setUpiId(event16);
  }

  // Inside your DetailSeller component
  const sellerMaskingValue = data?.getSeller?.sellerMasking || false; // fallback to false
  const [masking, setMasking] = useState(sellerMaskingValue);

  const [updateSellerMasking] = useMutation(EDIT_SELLER, {
    onCompleted: (res) => {
      setMasking(res.updateSeller.sellerMasking);
      toast.success('Seller Masking updated!');
    },
    onError: (err) => {
      console.error('Error updating sellerMasking:', err);
      toast.error('Failed to update sellerMasking.');
    },
  });

  const handleToggleMasking = () => {
    updateSellerMasking({
      variables: {
        updateSellerId: id,
        sellerMasking: !masking, // toggle true/false
      },
    });
  };

  return (
    <>
      <style>
        {`
      .blink-required {
        animation: blink 1s infinite;
        font-size: 1.2rem;
      }

      @keyframes blink {
        0% { opacity: 1; }
        50% { opacity: 0; }
        100% { opacity: 1; }
      }
    `}
      </style>
      {data && (
        <>
          <HtmlHead title={title} />
          <div className="page-title-container mb-2">
            <Row className="align-items-center">
              <Col className="col-auto d-flex align-items-center">
                <NavLink className="text-decoration-none d-flex align-items-center me-2" to="/superSeller/dashboard">
                  <span className="fw-medium text-dark">Dashboard</span>
                </NavLink>
                <span className="text-dark">/</span>
                <NavLink className="text-decoration-none d-flex align-items-center ms-2 me-2" to="/superSeller/profile">
                  <span className="fw-medium text-dark ms-1">Profile</span>
                </NavLink>
              </Col>
            </Row>
          </div>
          <Row className="m-0 mb-3 p-1 rounded bg-white align-items-center">
            <Col md="6">
              <span className="fw-bold fs-5 ps-2 pt-2">{title}</span>
            </Col>
          </Row>
          <Row>
            <Col xl="4">
              <Card className="mb-2 pb-4">
                <Card.Body className="mb-n5 p-3">
                  <div className="d-flex align-items-center flex-column mb-5">
                    <div className="mb-5 d-flex align-items-center flex-column">
                      <div className="sw-6 sh-6 mb-3 d-inline-block bg-primary d-flex justify-content-center align-items-center rounded-xl">
                        <div className="text-white">
                          <CsLineIcons icon="user" />
                        </div>
                      </div>
                      <div className="h5 mb-1 fw-bold">{data.getSeller.companyName}</div>
                      <div className="text-dark">
                        <CsLineIcons icon="pin" className="me-1" />
                        <span className="align-middle">{`${data.getSeller.city}, ${data.getSeller.state}`}</span>
                      </div>
                    </div>
                    <div className="d-flex flex-row justify-content-between w-100 w-sm-50 w-xl-100">
                      <Button
                        variant="outline-primary"
                        className="w-100 me-2"
                        onClick={() => {
                          handleEdit(
                            data.getSeller.companyName,
                            data.getSeller.companyDescription,
                            data.getSeller.mobileNo,
                            data.getSeller.email,
                            data.getSeller.gstin,
                            data.getSeller.fullAddress,
                            data.getSeller.city,
                            data.getSeller.state,
                            data.getSeller.pincode,
                            data.getSeller.bill
                          );
                        }}
                      >
                        Edit BA Info
                      </Button>
                      <Button
                        variant="outline-primary"
                        className="w-100 me-2"
                        onClick={() => {
                          handleBankEdit(
                            data.getSeller.accountHolderName,
                            data.getSeller.accountNumber,
                            data.getSeller.ifscCode,
                            data.getSeller.bankName,
                            data.getSeller.branchName,
                            data.getSeller.upiId
                          );
                        }}
                      >
                        Edit Bank Info
                      </Button>
                    </div>
                  </div>
                  <div className="mb-3 ">
                    <h4 className="mb-2 fs-6 fw-bold text-dark">Profile Details</h4>
                    {[
                      { label: 'User Name', value: `${data.getSeller.user.firstName || 'N/A'} ${data.getSeller.user.lastName || ''}` },
                      { label: 'Mobile Number', value: data.getSeller.user.mobileNo || 'N/A' },
                      { label: 'Email', value: data.getSeller.user.email || 'N/A' },
                    ].map((item, idx) => (
                      <div key={idx} className="mb-1">
                        <strong>{item.label}: </strong> {item.value}
                      </div>
                    ))}
                    <div className="mb-1">
                      <div>
                        <strong>BA Rating:</strong>{' '}
                        {data.getSeller.overallrating ? (
                          <span className="text-warning">
                            {'★'.repeat(Math.floor(data.getSeller.overallrating))}
                            {'☆'.repeat(5 - Math.floor(data.getSeller.overallrating))}
                            <span className="ms-1 text-dark">({data.getSeller.overallrating})</span>
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </div>
                    </div>
                    <div className="mb-1">
                      <Form.Check
                        type="switch"
                        id="sellerMaskingSwitch"
                        label={
                          <div className="d-flex align-items-center gap-2">
                            <span>{masking ? 'DA Name Masking: Yes' : 'DA Name Masking: No'}</span>
                            <OverlayTrigger
                              placement="right"
                              overlay={
                                <Tooltip id="masking-tooltip">
                                  When Dealer Associate Name Masking is enabled, customers will not see the actual names of your Dealer Associate. Instead, each
                                  dealer will be represented by their <b>Dealer ID</b>.
                                </Tooltip>
                              }
                            >
                              <InfoCircle className="text-primary cursor-pointer" />
                            </OverlayTrigger>
                          </div>
                        }
                        checked={masking}
                        onChange={handleToggleMasking}
                      />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xl="8">
              <Card className="mb-1 shadow-sm">
                <Card.Body className="p-4">
                  <h4 className="mb-3 fw-bold text-dark">Business Associate Information</h4>
                  <Row className="gy-3">
                    <Col md={6}>
                      <strong>Business Associate Name:</strong>
                      <div className="text-dark">{data.getSeller.companyName || 'N/A'}</div>
                    </Col>
                    <Col md={6}>
                      <strong>Mobile Number:</strong>
                      <div className="text-dark">{data.getSeller.mobileNo || 'N/A'}</div>
                    </Col>
                    <Col md={6}>
                      <strong>Email:</strong>
                      <div className="text-dark">{data.getSeller.email || 'N/A'}</div>
                    </Col>
                    {data.getSeller.gstin && (
                      <Col md={6}>
                        <strong>GST Number:</strong>
                        <div className="text-dark">
                          {data.getSeller.gstin}
                          {data.getSeller.gstinComposition ? <span className="text-success"> ✅ Composition</span> : ''}
                        </div>
                      </Col>
                    )}
                    {data.getSeller.pancardNo && (
                      <Col md={6}>
                        <strong>PAN Number:</strong>
                        <div className="text-dark">{data.getSeller.pancardNo}</div>
                      </Col>
                    )}
                    <Col md={12}>
                      <strong>Address:</strong>
                      <div className="text-dark">
                        {`${data.getSeller.fullAddress || ''}, ${data.getSeller.city || ''}, ${data.getSeller.state || ''} - ${data.getSeller.pincode || ''}` ||
                          'N/A'}
                      </div>
                    </Col>
                    <Col md={12}>
                      <strong>Business Associate Description:</strong>
                      <div className="text-dark">{data.getSeller.companyDescription || 'No description available.'}</div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="mb-5 shadow-sm">
                <Card.Body className="p-4">
                  <h4 className="mb-3 fw-bold text-dark d-flex align-items-center gap-2">
                    Bank Details
                    {data.getSeller.accountNumber ? (
                      ''
                    ) : (
                      <>
                        <span className="blink-required text-danger small">⚠️</span>
                      </>
                    )}
                  </h4>
                  <Row className="gy-3">
                    <Col md={6}>
                      <strong>Account Holder Name:</strong>
                      <div className="text-dark">{data.getSeller.accountHolderName || 'N/A'}</div>
                    </Col>
                    <Col md={6}>
                      <strong>Account Number:</strong>
                      <div className="text-dark">{data.getSeller.accountNumber || 'N/A'}</div>
                    </Col>
                    <Col md={6}>
                      <strong>IFSC Code:</strong>
                      <div className="text-dark">{data.getSeller.ifscCode || 'N/A'}</div>
                    </Col>
                    <Col md={6}>
                      <strong>Bank Name:</strong>
                      <div className="text-dark">{data.getSeller.bankName || 'N/A'}</div>
                    </Col>
                    <Col md={6}>
                      <strong>Branch Name:</strong>
                      <div className="text-dark">{data.getSeller.branchName || 'N/A'}</div>
                    </Col>
                    <Col md={6}>
                      <strong>UPI ID:</strong>
                      <div className="text-dark">{data.getSeller.upiId || 'N/A'}</div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Modal className="scroll-out-negative" show={editModal} onHide={() => setEditModal(false)} scrollable dialogClassName="modal-lg">
            <Modal.Header closeButton className="pt-3 pb-3">
              <Modal.Title as="h4" className="fw-bold">
                Edit Business Associate Information
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-3 pb-0">
              <OverlayScrollbarsComponent options={{ overflowBehavior: { x: 'hidden', y: 'scroll' } }} className="scroll-track-visible">
                <Form>
                  <div className="row">
                    <div className="mb-2 col-md-6 col-12">
                      <Form.Label className="fw-bold text-dark">
                        Business Associate Name <span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Control readOnly type="text" value={company} onChange={(e) => setCompany(e.target.value)} isInvalid={!!errors.company} />
                      <Form.Control.Feedback type="invalid">{errors.company}</Form.Control.Feedback>
                    </div>

                    <div className="mb-2 col-md-6 col-12">
                      <Form.Label className="fw-bold text-dark">
                        Email <span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Control readOnly type="text" value={mail} onChange={(e) => setMail(e.target.value)} isInvalid={!!errors.mail} />
                      <Form.Control.Feedback type="invalid">{errors.mail}</Form.Control.Feedback>
                    </div>

                    <div className="mb-2 col-md-6 col-12">
                      <Form.Label className="fw-bold text-dark">
                        Mobile no. <span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        readOnly
                        onKeyDown={(e) => {
                          if (e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete' && (e.key < '0' || e.key > '9')) {
                            e.preventDefault();
                          }
                        }}
                        maxLength="10"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        isInvalid={!!errors.phone}
                      />
                      <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                    </div>

                    <div className="mb-2 col-md-6 col-12">
                      <Form.Label className="fw-bold text-dark">
                        GST No. <span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        readOnly
                        onKeyPress={(e) => {
                          const { key } = e;
                          if (!/^[0-9a-zA-Z]*$/.test(key)) {
                            e.preventDefault();
                          }
                        }}
                        name="gst"
                        maxLength="15"
                        value={gst}
                        onChange={(e) => setGST(e.target.value)}
                        isInvalid={!!errors.gst}
                      />
                      <Form.Control.Feedback type="invalid">{errors.gst}</Form.Control.Feedback>
                    </div>

                    <div className="mb-2 col-md-6 col-12">
                      <Form.Label className="fw-bold text-dark">
                        Address <span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Control type="text" name="address" value={faddress} onChange={(e) => setfAddress(e.target.value)} isInvalid={!!errors.address} />
                      <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                    </div>

                    <div className="mb-2 col-md-6 col-12">
                      <Form.Label className="fw-bold text-dark">
                        City <span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Control type="text" name="city" value={citys} onChange={(e) => setCitys(e.target.value)} isInvalid={!!errors.city} />
                      <Form.Control.Feedback type="invalid">{errors.city}</Form.Control.Feedback>
                    </div>

                    <div className="mb-2 col-md-6 col-12">
                      <Form.Label className="fw-bold text-dark">
                        Pincode <span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        onKeyDown={(e) => {
                          if (e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete' && (e.key < '0' || e.key > '9')) {
                            e.preventDefault();
                          }
                        }}
                        maxLength="6"
                        name="pincode"
                        value={pincodes}
                        onChange={(e) => setPincodes(e.target.value)}
                        isInvalid={!!errors.pincode}
                      />
                      <Form.Control.Feedback type="invalid">{errors.pincode}</Form.Control.Feedback>
                    </div>

                    <div className="mb-2 col-md-6 col-12">
                      <Form.Label className="fw-bold text-dark">
                        State <span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Select
                        name="state"
                        value={states}
                        onChange={(e) => setStates(e.target.value)}
                        aria-label="Default select example"
                        isInvalid={!!errors.state}
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
                      <Form.Control.Feedback type="invalid">{errors.state}</Form.Control.Feedback>
                    </div>

                    <div className="mb-2">
                      <Form.Label className="fw-bold text-dark">
                        Business Associate Description <span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Control type="text" as="textarea" value={desc} onChange={(e) => setDesc(e.target.value)} isInvalid={!!errors.desc} />
                      <Form.Control.Feedback type="invalid">{errors.desc}</Form.Control.Feedback>
                    </div>
                  </div>
                </Form>
              </OverlayScrollbarsComponent>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-2">
              <Button variant="primary" className="btn-icon btn-icon-start" type="button" onClick={() => handleSubmit()}>
                <span>Save</span>
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal className="scroll-out-negative" show={editBankModal} onHide={() => setEditBankModal(false)} scrollable dialogClassName="modal-lg">
            <Modal.Header closeButton className="pt-3 pb-3">
              <Modal.Title as="h4" className="fw-bold">
                Edit Bank Information
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-3 pb-0">
              <OverlayScrollbarsComponent options={{ overflowBehavior: { x: 'hidden', y: 'scroll' } }} className="scroll-track-visible">
                <Form>
                  <div className="row">
                    <div className="mb-2 col-md-6 col-12">
                      <Form.Label className="fw-bold text-dark">
                        Account Holder Name <span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="accountHolderName"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        isInvalid={!!errors.accountHolderName}
                      />
                      <Form.Control.Feedback type="invalid">{errors.accountHolderName}</Form.Control.Feedback>
                    </div>
                    <div className="mb-2 col-md-6 col-12">
                      <Form.Label className="fw-bold text-dark">
                        Account Number <span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="accountNumber"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        isInvalid={!!errors.accountNumber}
                      />
                      <Form.Control.Feedback type="invalid">{errors.accountNumber}</Form.Control.Feedback>
                    </div>
                    <div className="mb-2 col-md-6 col-12">
                      <Form.Label className="fw-bold text-dark">
                        IFSC Code <span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="ifscCode"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value)}
                        isInvalid={!!errors.ifscCode}
                        maxLength={12}
                      />
                      <Form.Control.Feedback type="invalid">{errors.ifscCode}</Form.Control.Feedback>
                    </div>
                    <div className="mb-2 col-md-6 col-12">
                      <Form.Label className="fw-bold text-dark">
                        Bank Name <span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Control type="text" name="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} isInvalid={!!errors.bankName} />
                      <Form.Control.Feedback type="invalid">{errors.bankName}</Form.Control.Feedback>
                    </div>
                    <div className="mb-2 col-md-6 col-12">
                      <Form.Label className="fw-bold text-dark">
                        Branch Name <span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="branchName"
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        isInvalid={!!errors.branchName}
                      />
                      <Form.Control.Feedback type="invalid">{errors.branchName}</Form.Control.Feedback>
                    </div>
                    <div className="mb-2 col-md-6 col-12">
                      <Form.Label className="fw-bold text-dark">UPI ID</Form.Label>
                      <Form.Control type="text" name="upiId" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                    </div>
                  </div>
                </Form>
              </OverlayScrollbarsComponent>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-2">
              <Button variant="primary" className="btn-icon btn-icon-start" type="button" onClick={() => handleSave()}>
                <span>Save</span>
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </>
  );
}
export default DetailSeller;
