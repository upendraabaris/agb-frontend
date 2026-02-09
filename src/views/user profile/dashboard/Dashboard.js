import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentUser } from 'auth/authSlice';
import { toast } from 'react-toastify';
import { gql, useMutation, useQuery } from '@apollo/client';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import HtmlHead from 'components/html-head/HtmlHead';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { Row, Col, Button, Card, Form, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import { Link } from 'react-router-dom';

const EDIT_ADDRESS = gql`
  mutation UpdateAddress(
    $updateAddressId: ID!
    $addressLine1: String!
    $city: String!
    $state: String!
    $postalCode: String!
    $country: String!
    $firstName: String
    $lastName: String
    $mobileNo: String
    $addressLine2: String
    $altrMobileNo: String
    $businessName: String
    $gstin: String
  ) {
    updateAddress(
      id: $updateAddressId
      addressLine1: $addressLine1
      city: $city
      state: $state
      postalCode: $postalCode
      country: $country
      firstName: $firstName
      lastName: $lastName
      mobileNo: $mobileNo
      addressLine2: $addressLine2
      altrMobileNo: $altrMobileNo
      businessName: $businessName
      gstin: $gstin
    ) {
      addressLine1
      addressLine2
      city
      country
      id
      postalCode
      state
      altrMobileNo
      businessName
      gstin
    }
  }
`;

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($changePasswordId: ID!, $oldPassword: String!, $newPassword: String!) {
    changePassword(id: $changePasswordId, oldPassword: $oldPassword, newPassword: $newPassword) {
      lastName
      id
      firstName
    }
  }
`;

const GET_USER_DETAIL = gql`
  query GetProfile {
    getProfile {
      id
      firstName
      lastName
      email
      mobileNo
      password
      role
      profilepic
      addresses {
        id
        firstName
        lastName
        mobileNo
        addressLine1
        addressLine2
        city
        state
        postalCode
        country
        altrMobileNo
        businessName
        gstin
      }
      seller {
        id
        companyName
        gstin
        pancardNo
        gstinComposition
        address
        companyDescription
        mobileNo
        email
      }
    }
  }
`;

const EDIT_USER_PROFILE = gql`
  mutation Profileedit($firstName: String, $lastName: String, $email: String, $mobileNo: String, $file: Upload) {
    profileedit(firstName: $firstName, lastName: $lastName, email: $email, mobileNo: $mobileNo, file: $file) {
      id
      firstName
      lastName
      email
      profilepic
      mobileNo
      role
      seller {
        companyName
        gstin
        address
        mobileNo
        email
      }
    }
  }
`;

const CREATE_ADDRESS = gql`
  mutation CreateAddress(
    $addressLine1: String!
    $city: String!
    $state: String!
    $postalCode: String!
    $country: String!
    $addressLine2: String
    $firstName: String
    $lastName: String
    $mobileNo: String
    $altrMobileNo: String
    $businessName: String
    $gstin: String
  ) {
    createAddress(
      addressLine1: $addressLine1
      city: $city
      state: $state
      postalCode: $postalCode
      country: $country
      addressLine2: $addressLine2
      firstName: $firstName
      lastName: $lastName
      mobileNo: $mobileNo
      altrMobileNo: $altrMobileNo
      businessName: $businessName
      gstin: $gstin
    ) {
      id
      addressLine1
      addressLine2
      city
      state
      postalCode
      country
      altrMobileNo
      businessName
      gstin
    }
  }
`;

const DELETE_ADDRESS = gql`
  mutation DeleteAddress($deleteAddressId: ID!) {
    deleteAddress(id: $deleteAddressId) {
      id
      addressLine1
      addressLine2
      city
      state
      postalCode
      country
    }
  }
`;

function Dashboard() {
  const title = 'User Profile';
  const description = 'Ecommerce User Profile Page';
  const dispatch = useDispatch();
  const { dataStoreFeatures1 } = useGlobleContext();
  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);

  const [editModal, setEditModal] = useState(false);
  const [fName, setfName] = useState('');
  const [lName, setlName] = useState('');
  const [mail, setMail] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState(null);
  const [newimage, setNewimage] = useState(null);
  const [addressModal, setAddressModal] = useState(false);
  const [editAddressModal, setEditAddressModal] = useState(false);
  const [firstNameEdit, setfirstNameEdit] = useState('');
  const [lastNameEdit, setlastNameEdit] = useState('');
  const [mobileNoEdit, setmobileNoEdit] = useState('');
  const [altrMobileNoEdit, setaltrMobileNoEdit] = useState('');
  const [businessNameEdit, setbusinessNameEdit] = useState('');
  const [gstinEdit, setgstinEdit] = useState('');
  const [addressID, setAddressID] = useState('');
  const [address1Edit, setAddress1Edit] = useState('');
  const [address2Edit, setAddress2Edit] = useState('');
  const [cityEdit, setCityEdit] = useState('');
  const [stateEdit, setStateEdit] = useState('');
  const [countryEdit, setCountryEdit] = useState('India');
  const [postalEdit, setPostalEdit] = useState('');
  const [deleteModalView, setDeleteModalView] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [passwordModal, setPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [getChangedPassword, { loading }] = useMutation(CHANGE_PASSWORD, {
    onCompleted: () => {
      setPasswordModal(false);
      toast.success('Password updated successfully.');
      setOldPassword('');
      setNewPassword('');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
      console.error('CREATE_EMAIL_TEMPLETE', err);
    },
  });

  const { data, refetch } = useQuery(GET_USER_DETAIL);

  const [addressofSeller, setAddressofSeller] = useState(null);
  useEffect(() => {
    function isJsonString(str) {
      try {
        JSON.parse(str);
      } catch (e) {
        return false;
      }
      return true;
    }

    if (data?.getProfile?.seller) {
      if (isJsonString(data?.getProfile?.seller.address)) {
        const address1 = data?.getProfile?.seller?.address;
        if (address1) {
          setAddressofSeller(JSON.parse(address1));
        }
      }
    }
  }, [data]);

  async function handleUpdatePassword(e) {
    e.preventDefault();
    await getChangedPassword({
      variables: {
        changePasswordId: data?.getProfile?.id,
        oldPassword,
        newPassword,
      },
    });
  }

  const [editError, setEditError] = useState({});
  const [editUser, { error: errorEdit, data: dataEdit }] = useMutation(EDIT_USER_PROFILE, {
    onCompleted: () => {
      toast.success(`${dataEdit.profileedit.firstName} profile successfully updated`);
      setEditModal(false);
      dispatch(setCurrentUser(dataEdit.profileedit));
      refetch();
    },
    onError: () => {
      toast.error(errorEdit.message || 'Something went wrong!');
    },
  });

  function handleEditValues(ID, firstname, lastname, mobileno, mails, dp) {
    setEditModal(true);
    setfName(firstname);
    setlName(lastname);
    setPhone(mobileno);
    setMail(mails);
    setImage(dp);
  }

  const validateForm = () => {
    const errors = {};

    if (!fName.trim()) {
      errors.fName = 'First Name is required.';
    }
    if (!lName.trim()) {
      errors.lName = 'Last Name is required.';
    }
    if (!phone.trim()) {
      errors.phone = 'Mobile no. is required.';
    }
    if (!mail.trim()) {
      errors.mail = 'Email is required.';
    }
    return errors;
  };

  async function handleSave(e) {
    e.preventDefault();
    const errors = await validateForm();

    if (Object.keys(errors).length > 0) {
      setEditError(errors);
      return;
    }
    setEditError({});

    if (newimage) {
      await editUser({
        variables: {
          firstName: fName,
          lastName: lName,
          mobileNo: phone,
          email: mail,
          file: newimage,
        },
      });
    } else {
      await editUser({
        variables: {
          firstName: fName,
          lastName: lName,
          mobileNo: phone,
          email: mail,
        },
      });
    }
  }

  const [submitAddress, { error: errorADD }] = useMutation(CREATE_ADDRESS, {
    onCompleted: () => {
      toast.success(`New address has been added.`);
      refetch();
    },
    onError: () => {
      toast.error(errorADD.message || 'Something went wrong!');
    },
  });

  const onSubmit = (values, { resetForm }) => {
    submitAddress({
      variables: {
        addressLine1: values.address,
        addressLine2: values.address2,
        postalCode: values.pincode,
        ...values,
      },
    });

    setTimeout(() => {
      resetForm({ values: '' });
    }, 10);

    setAddressModal(false);
  };

  const phoneRegExp = /^(\+91)?(-)?\s*?(91)?\s*?(\d{3})-?\s*?(\d{3})-?\s*?(\d{4})$/;
  const pincodeRegExp = /^[0-9]*$/;
  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required.'),
    lastName: Yup.string().required('Last Name is required.'),
    mobileNo: Yup.string().matches(phoneRegExp, 'mobile No is not valid').required('Mobile Number is required.'),
    address: Yup.string().required('Address (House No., Colony Name) is required.'),
    address2: Yup.string().required('Address (Street No., Area, Landmark) is required.'),
    city: Yup.string().required('City is required.'),
    pincode: Yup.string().matches(pincodeRegExp, 'Pincode is not valid').required('Pincode is required.'),
    state: Yup.string().required('State is required.'),
    country: Yup.string().required('Country is required.'),
    gstin: Yup.string().length(15, 'GST No. must be exactly 15 characters'),
  });

  const initialValues = {
    address: '',
    address2: '',
    city: '',
    pincode: '',
    state: '',
    country: 'India',
    firstName: '',
    lastName: '',
    mobileNo: '',
    altrMobileNo: '',
    businessName: '',
    gstin: '',
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  const [editAddress, { error: errEditAdd }] = useMutation(EDIT_ADDRESS, {
    onCompleted: () => {
      toast.success(`Address successfully updated`);
      refetch();
      setEditAddressModal(false);
    },
    onError: () => {
      toast.error(errEditAdd.message || 'Something went wrong!');
    },
  });

  function handleEditAddress(ID, add1, add2, CT, postal, stateAdd, countryAdd, fname, lname, mNo, altmNo, busName, gst) {
    setEditAddressModal(true);
    setAddressID(ID);
    setAddress1Edit(add1);
    setAddress2Edit(add2);
    setCityEdit(CT);
    setPostalEdit(postal);
    setStateEdit(stateAdd);
    setCountryEdit(countryAdd);
    setfirstNameEdit(fname);
    setlastNameEdit(lname);
    setmobileNoEdit(mNo);
    setaltrMobileNoEdit(altmNo);
    setbusinessNameEdit(busName);
    setgstinEdit(gst);
  }

  const validateaddressForm = () => {
    const errors1 = {};
    if (!firstNameEdit.trim()) {
      errors1.firstNameEdit = 'First Name is required.';
    }
    if (!lastNameEdit.trim()) {
      errors1.lastNameEdit = 'Last Name is required.';
    }
    if (!mobileNoEdit.trim()) {
      errors1.mobileNoEdit = 'Mobile No is required.';
    }
    if (!address1Edit.trim()) {
      errors1.address1Edit = 'Address (House No., Colony Name) is required.';
    }
    if (!address2Edit.trim()) {
      errors1.address2Edit = 'Address (Street No., Area, Landmark) 2 is required.';
    }
    if (!cityEdit.trim()) {
      errors1.cityEdit = 'City is required.';
    }
    if (!postalEdit.trim()) {
      errors1.postalEdit = 'Postal is required.';
    }
    if (!stateEdit.trim()) {
      errors1.stateEdit = 'State is required.';
    }
    if (!countryEdit.trim()) {
      errors1.countryEdit = 'Country is required.';
    }
    return errors1;
  };

  const [addresserror, setAddresserror] = useState({});
  async function handleSaveAddressEdit(e) {
    e.preventDefault();
    const errors2 = await validateaddressForm();
    if (Object.keys(errors2).length > 0) {
      setAddresserror(errors2);
      return;
    }
    setAddresserror({});

    await editAddress({
      variables: {
        updateAddressId: addressID,
        addressLine1: address1Edit,
        addressLine2: address2Edit,
        city: cityEdit,
        state: stateEdit,
        postalCode: postalEdit,
        country: countryEdit,
        firstName: firstNameEdit,
        lastName: lastNameEdit,
        mobileNo: mobileNoEdit,
        altrMobileNo: altrMobileNoEdit,
        businessName: businessNameEdit,
        gstin: gstinEdit,
      },
    });
  }

  const [deleteAddress, { error: errorDel }] = useMutation(DELETE_ADDRESS, {
    onCompleted: () => {
      toast.error(`Address successfully deleted`);
      refetch();
    },
    onError: () => {
      toast.error(errorDel.message || 'Something went wrong!');
    },
  });

  const handleDeleteAddress = async (ID) => {
    setDeleteId(ID);
    setDeleteModalView(true);
  };
  const deleteAddressConfirmed = async () => {
    await deleteAddress({
      variables: {
        deleteAddressId: deleteId,
      },
    });
    setDeleteModalView(false);
  };
  const { city } = values;

  return (
    <>
      <HtmlHead title={title} description={description} />
      <style>
        {`.bg_color {
          background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
          color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
        }`}
        {`.font_color {
          color: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
        }`}
        {`
          .btn_color {
            background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
            color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
            transition: background 0.3s ease;
            padding: 10px 30px;
            border: none;
            cursor: pointer;            
          }
          .btn_color:hover {
            background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
            filter: brightness(80%);       
          }
        `}
      </style>
      {data && data.getProfile && (
        <Row>
          <Col xl="4" lg="4" md="6" sm="6" xs="12">
            <div className="text-center fw-bold py-2 bg_color rounded">Your Info</div>
            <Card className="mb-5 shadow-sm border-0">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <img
                    src={data.getProfile.profilepic || '/img/profile/profile-11.webp'}
                    alt="Profile"
                    className="rounded-circle shadow mb-3"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                  <h5 className="fw-semibold mb-1">
                    {data.getProfile.firstName} {data.getProfile.lastName}
                  </h5>
                  {data.getProfile.addresses.length > 0 && (
                    <div className="text-dark small d-flex justify-content-center align-items-center">
                      <CsLineIcons icon="pin" size="16" className="me-1" />
                      {data.getProfile.addresses[0].city}, {data.getProfile.addresses[0].country}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h6 className="text-uppercase fw-bold mb-3 text-primary">Profile Information</h6>
                  <div className="d-flex align-items-center mb-2">
                    <CsLineIcons icon="user" size="17" className="me-2 text-primary" />
                    <span className="text-dark">
                      {data.getProfile.firstName} {data.getProfile.lastName}
                    </span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <CsLineIcons icon="phone" size="17" className="me-2 text-primary" />
                    <span className="text-dark">{data.getProfile.mobileNo}</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <CsLineIcons icon="email" size="17" className="me-2 text-primary" />
                    <span className="text-dark">{data.getProfile.email}</span>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="d-grid gap-2">
                  <Button
                    variant="outline-primary"
                    onClick={() =>
                      handleEditValues(
                        data.getProfile.id,
                        data.getProfile.firstName,
                        data.getProfile.lastName,
                        data.getProfile.mobileNo,
                        data.getProfile.email,
                        data.getProfile.profilepic
                      )
                    }
                  >
                    <CsLineIcons icon="edit" className="me-2" />
                    Edit Profile
                  </Button>
                  <Link to="/user/orders" className="btn btn-outline-info d-flex align-items-center justify-content-center">
                    <CsLineIcons icon="cart" className="me-2" />
                    My Orders
                  </Link>
                  <Link to="/wishlist" className="btn btn-outline-warning d-flex align-items-center justify-content-center">
                    <CsLineIcons icon="heart" className="me-2" />
                    My Wishlist
                  </Link>
                  <Button variant="outline-success" onClick={() => setAddressModal(true)}>
                    <CsLineIcons icon="plus" className="me-2" />
                    Add Address
                  </Button>
                  <Button variant="outline-danger" onClick={() => setPasswordModal(true)}>
                    <CsLineIcons icon="lock-off" className="me-2" />
                    Reset Password
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Modal show={addressModal} onHide={() => setAddressModal(false)} size="lg" centered backdrop="static">
            <Modal.Header closeButton className="p-3">
              <h5 className="fw-bold m-0">Add Address</h5>
            </Modal.Header>
            <Modal.Body>
              <form id="sellerForm" className="tooltip-end-bottom" onSubmit={handleSubmit}>
                <div className="container">
                  <div className="row">
                    <div className="col-12 col-md-6 mb-3 form-group tooltip-end-top">
                      <Form.Label htmlFor="userEditFirstName">
                        <span className="text-dark">
                          First Name <span className="text-danger">*</span>
                        </span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        autoComplete="firstName"
                        name="firstName"
                        onChange={handleChange}
                        placeholder="Enter First Name"
                        value={values.firstName}
                        className="bg-white border"
                      />
                      {errors.firstName && touched.firstName && <div className="d-block text-danger p-1">{errors.firstName}</div>}
                    </div>
                    <div className="col-12 col-md-6 mb-3 form-group tooltip-end-top">
                      <Form.Label htmlFor="userEditFirstName">
                        <span className="text-dark">
                          Last Name <span className="text-danger">*</span>
                        </span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        autoComplete="lastName"
                        name="lastName"
                        onChange={handleChange}
                        placeholder="Enter Last Name"
                        value={values.lastName}
                        className="bg-white border"
                      />
                      {errors.lastName && touched.lastName && <div className="d-block text-danger p-1">{errors.lastName}</div>}
                    </div>

                    <div className="col-12 col-md-6 mb-3 form-group tooltip-end-top">
                      <Form.Label htmlFor="userEditFirstName">
                        <span className="text-dark">
                          Mobile No. <span className="text-danger">*</span>
                        </span>
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        autoComplete="mobileNo"
                        name="mobileNo"
                        maxLength="10"
                        className="bg-white border"
                        onKeyDown={(e) => {
                          if (e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && (e.key < '0' || e.key > '9')) {
                            e.preventDefault();
                          }
                        }}
                        onChange={handleChange}
                        placeholder="Enter Mobile No."
                        value={values.mobileNo}
                      />
                      {errors.mobileNo && touched.mobileNo && <div className="d-block text-danger p-1">{errors.mobileNo}</div>}
                    </div>
                    <div className="col-12 col-md-6 mb-3 form-group tooltip-end-top">
                      <Form.Label htmlFor="userEditFirstName">
                        <span className="text-dark">Alternate Mobile No.</span>
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        autoComplete="altrMobileNo"
                        name="altrMobileNo"
                        maxLength="10"
                        className="bg-white border"
                        onKeyDown={(e) => {
                          if (e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && (e.key < '0' || e.key > '9')) {
                            e.preventDefault();
                          }
                        }}
                        onChange={handleChange}
                        placeholder="Enter Alternate Mobile No."
                        value={values.altrMobileNo}
                      />
                      {errors.altrMobileNo && touched.altrMobileNo && <div className="d-block text-danger p-1">{errors.altrMobileNo}</div>}
                    </div>
                    <div className="col-12 col-md-6 mb-3 form-group tooltip-end-top">
                      <Form.Label htmlFor="userEditFirstName">
                        <span className="text-dark">
                          Address (House No., Colony Name) <span className="text-danger">*</span>
                        </span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        autoComplete="street-address"
                        name="address"
                        className="bg-white border"
                        onChange={handleChange}
                        placeholder="Enter Address (House No., Colony Name) "
                        value={values.address}
                      />
                      {errors.address && touched.address && <div className="d-block text-danger p-1">{errors.address}</div>}
                    </div>
                    <div className="col-12 col-md-6 mb-3 form-group tooltip-end-top">
                      <Form.Label htmlFor="userEditFirstName">
                        <span className="text-dark">
                          Address (Street No., Area, Landmark) <span className="text-danger">*</span>
                        </span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        className="bg-white border"
                        name="address2"
                        onChange={handleChange}
                        placeholder="Enter Address (Street No., Area, Landmark)"
                        value={values.address2}
                      />
                      {errors.address2 && touched.address2 && <div className="d-block text-danger p-1">{errors.address2}</div>}
                    </div>
                    <div className="col-12 col-md-6 mb-3 form-group tooltip-end-top">
                      <Form.Label htmlFor="userEditFirstName">
                        <span className="text-dark">
                          City <span className="text-danger">*</span>
                        </span>
                      </Form.Label>

                      <Form.Control
                        type="text"
                        className="bg-white border"
                        name="city"
                        onChange={(e) => {
                          const { value } = e.target; // <-- destructuring e.target
                          if (/^[a-zA-Z\s]*$/.test(value)) {
                            handleChange(e);
                          }
                        }}
                        placeholder="Enter City"
                        value={city}
                      />
                      {errors.city && touched.city && <div className="d-block text-danger p-1">{errors.city}</div>}
                    </div>
                    <div className="col-12 col-md-6 mb-3 form-group tooltip-end-top">
                      <Form.Label htmlFor="userEditFirstName">
                        <span className="text-dark">
                          State <span className="text-danger">*</span>
                        </span>
                      </Form.Label>
                      <Form.Select name="state" value={values.state} onChange={handleChange} aria-label="Default select example">
                        <option>Select State</option>
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
                      {/* <Form.Control type="text" name="state" onChange={handleChange} placeholder="Enter State" value={values.state} />
                      {errors.state && touched.state && <div className="d-block invalid-tooltip">{errors.state}</div>} */}
                    </div>
                    <div className="col-12 col-md-6 mb-3 form-group tooltip-end-top">
                      <Form.Label htmlFor="userEditFirstName">
                        <span className="text-dark">
                          Pincode <span className="text-danger">*</span>
                        </span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        maxLength="6"
                        className="bg-white border"
                        onKeyDown={(e) => {
                          if (e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && (e.key < '0' || e.key > '9')) {
                            e.preventDefault();
                          }
                        }}
                        name="pincode"
                        onChange={handleChange}
                        placeholder="Enter Pincode"
                        value={values.pincode}
                      />
                      {errors.pincode && touched.pincode && <div className="d-block text-danger p-1">{errors.pincode}</div>}
                    </div>
                    <div className="col-12 col-md-6 mb-3 form-group tooltip-end-top">
                      <Form.Label htmlFor="userEditFirstName">
                        <span className="text-dark">Country</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        className="bg-white border"
                        name="country"
                        onChange={handleChange}
                        placeholder="Enter Country"
                        value={values.country}
                        disabled
                      />
                      {errors.country && touched.country && <div className="d-block text-danger p-1">{errors.country}</div>}
                    </div>
                    <div className="col-12 col-md-6 mb-3 form-group tooltip-end-top">
                      <Form.Label htmlFor="userEditFirstName">
                        <span className="text-dark">Business Name</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        autoComplete="businessName"
                        name="businessName"
                        onChange={handleChange}
                        placeholder="Enter Business Name"
                        value={values.businessName}
                        className="bg-white border"
                      />
                      {errors.businessName && touched.businessName && <div className="d-block text-danger p-1">{errors.businessName}</div>}
                    </div>
                    <div className="col-12 col-md-6 mb-3 form-group tooltip-end-top">
                      <Form.Label htmlFor="userEditFirstName">
                        <span className="text-dark">GST No.</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        autoComplete="gstin"
                        name="gstin"
                        onChange={handleChange}
                        placeholder="Enter GST No."
                        value={values.gstin}
                        className="bg-white border"
                        maxLength={15}
                      />
                      {errors.gstin && touched.gstin && <div className="d-block text-danger p-1">{errors.gstin}</div>}
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Button onClick={() => setAddressModal(false)} className="btn-icon me-2 bg-danger">
                    Cancel
                  </Button>
                  <Button className="btn-icon btn-icon-start bg_color" type="submit">
                    Submit Address
                  </Button>
                </div>
              </form>
            </Modal.Body>
          </Modal>

          <Col xl="8" lg="8" md="6" sm="6" xs="12">
            {data.getProfile.addresses.length > 0 ? (
              <div className="text-center fw-bold py-1 bg_color pt-2 pb-2 rounded"> All Address</div>
            ) : (
              // <h2 className="small-title bg-primary rounded-top text-white p-2">ALL ADDRESS </h2>
              <>
                {!addressModal && (
                  <div className="border bg-white p-6 rounded text-center">
                    No Address Listed.
                    <Button className="ps-2" variant="link" onClick={() => setAddressModal(true)}>
                      Add Address
                    </Button>
                  </div>
                )}
              </>
            )}
            {data.getProfile.addresses
              .slice(0)
              .reverse()
              .map((address, index) => (
                <Card key={address.id} className="mb-2">
                  <Card.Body className=" p-3">
                    <Row>
                      <Col lg="10">
                        <div className="mb-0">
                          <div className="text-md text-dark mb-2">Address {index + 1}</div>
                          <div>
                            {address.firstName} {address.lastName}
                          </div>
                          <div>
                            {address.addressLine1}, {address.addressLine2},{address.city}, {address.state}, {address.postalCode} - {address.country}
                          </div>
                          <div>
                            {address.mobileNo}
                            {address.altrMobileNo && <span>, {address.altrMobileNo}</span>}
                          </div>
                          {address.businessName && <div>Business Name: {address.businessName}</div>}
                          {address.gstin && <div>GST No.: {address.gstin}</div>}
                          {/* <div>Business Name: {address.businessName}, GST No.:  {address.gstin}</div> */}
                        </div>
                      </Col>
                      <Col lg="2">
                        <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-top">Edit</Tooltip>}>
                          <Button
                            onClick={() =>
                              handleEditAddress(
                                address.id,
                                address.addressLine1,
                                address.addressLine2,
                                address.city,
                                address.postalCode,
                                address.state,
                                address.country,
                                address.firstName,
                                address.lastName,
                                address.mobileNo,
                                address.altrMobileNo,
                                address.businessName,
                                address.gstin
                              )
                            }
                            className="col-1 mb-2 me-2 btn-icon btn-icon-only btn_color"
                          >
                            <CsLineIcons icon="edit-square" />
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-top">Delete</Tooltip>}>
                          <Button onClick={() => handleDeleteAddress(address.id)} className="col-1 mb-2 me-2 btn-icon btn-icon-only bg-danger">
                            <CsLineIcons icon="bin" />
                          </Button>
                        </OverlayTrigger>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
          </Col>
        </Row>
      )}

      {data && data.getProfile && (
        <Modal show={editModal} onHide={() => setEditModal(false)} size="lg" centered backdrop="static">
          <Modal.Header closeButton className="p-3">
            <h5 className="fw-bold m-0">Edit Profile Detail</h5>
          </Modal.Header>
          <Modal.Body className="p-3">
            <Form onSubmit={(e) => handleSave(e)}>
              <div className="row">
                <div className="mb-3 col-12 col-md-6">
                  <Form.Label htmlFor="userEditFirstName">
                    <span className="text-dark"> First Name </span>
                    <span className="text-danger"> * </span>
                  </Form.Label>
                  <Form.Control id="userEditFirstName" type="text" value={fName} onChange={(e) => setfName(e.target.value)} />
                  {editError.fName && <div className="mt-1 text-danger">{editError.fName}</div>}
                </div>
                <div className="mb-3 col-12 col-md-6">
                  <Form.Label htmlFor="userEditLastName">
                    <span className="text-dark"> Last Name </span>
                    <span className="text-danger"> * </span>
                  </Form.Label>
                  <Form.Control id="userEditLastName" type="text" value={lName} onChange={(e) => setlName(e.target.value)} />
                  {editError.lName && <div className="mt-1 text-danger">{editError.lName}</div>}
                </div>
                <div className="mb-3 col-12 col-md-6">
                  <Form.Label htmlFor="userEditMail">
                    <span className="text-dark"> Email </span>
                    <span className="text-danger"> * </span>
                  </Form.Label>
                  <Form.Control id="userEditMail" type="email" value={mail} onChange={(e) => setMail(e.target.value)} />
                  {editError.mail && <div className="mt-1 text-danger">{editError.mail}</div>}
                </div>
                <div className="mb-3 col-12 col-md-6">
                  <Form.Label htmlFor="userEditPhone">
                    <span className="text-dark"> Mobile Number </span>
                    <span className="text-danger"> * </span>
                  </Form.Label>
                  <Form.Control
                    id="userEditPhone"
                    type="tel"
                    value={phone}
                    maxLength="10"
                    onKeyDown={(e) => {
                      if (e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && (e.key < '0' || e.key > '9')) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  {editError.phone && <div className="mt-1 text-danger">{editError.phone}</div>}
                </div>
                <div className="mb-3 col-12 col-md-6">
                  <Form.Label htmlFor="userEditPicture" className="text-dark">
                    {' '}
                    Profile Picture
                  </Form.Label>
                  <Form.Control
                    id="userEditPicture"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file && ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                        setNewimage(file);
                      } else {
                        alert('Only .jpg, .jpeg, or .png files are allowed');
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
                <div className="mb-3 col-12 col-md-6">
                  {' '}
                  <img style={{ height: '70px', width: '70px', borderRadius: '35px' }} className="mx-2 my-2 " src={image} alt="dp" />
                </div>
                <div className="d-flex justify-content-center">
                  <Button variant="danger" className="btn-icon ms-1" onClick={() => setEditModal(false)}>
                    <span>Cancel</span>
                  </Button>
                  <Button variant="primary" className="btn-icon mx-1 btn-icon-start" type="submit">
                    <span>Save</span>
                  </Button>
                </div>{' '}
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}

      <Modal show={editAddressModal} onHide={() => setEditAddressModal(false)} size="lg" centered backdrop="static">
        <Modal.Header closeButton className="p-3">
          <h5 className="fw-bold m-0">Edit Address</h5>
        </Modal.Header>
        <Modal.Body className="p-3">
          <Form
            onSubmit={(e) => {
              handleSaveAddressEdit(e);
            }}
          >
            <div className="row">
              <div className="mb-3 col-12 col-md-6">
                <Form.Label htmlFor="firstName">
                  <span className="text-dark fw-bold"> First Name </span> <span className="text-danger"> * </span>
                </Form.Label>
                <Form.Control id="firstName" type="text" value={firstNameEdit || ''} onChange={(e) => setfirstNameEdit(e.target.value)} />
                {addresserror.firstNameEdit && <div className="mt-1 text-danger">{addresserror.firstNameEdit}</div>}
              </div>
              <div className="mb-3 col-12 col-md-6">
                <Form.Label htmlFor="lastName">
                  <span className="text-dark fw-bold"> Last Name </span> <span className="text-danger"> * </span>
                </Form.Label>
                <Form.Control id="lastName" type="text" value={lastNameEdit || ''} onChange={(e) => setlastNameEdit(e.target.value)} />
                {addresserror.lastNameEdit && <div className="mt-1 text-danger">{addresserror.lastNameEdit}</div>}
              </div>
              <div className="mb-3 col-12 col-md-6">
                <Form.Label htmlFor="mobileNo">
                  <span className="text-dark fw-bold">Mobile No.</span> <span className="text-danger"> * </span>
                </Form.Label>
                <Form.Control
                  id="mobileNo"
                  type="tel"
                  maxLength="10"
                  onKeyDown={(e) => {
                    if (e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && (e.key < '0' || e.key > '9')) {
                      e.preventDefault();
                    }
                  }}
                  value={mobileNoEdit || ''}
                  onChange={(e) => setmobileNoEdit(e.target.value)}
                />
                {addresserror.mobileNoEdit && <div className="mt-1 text-danger">{addresserror.mobileNoEdit}</div>}
              </div>
              <div className="mb-3 col-12 col-md-6">
                <Form.Label htmlFor="altrMobileNo">
                  <span className="text-dark fw-bold">Alternate Mobile No.</span>{' '}
                </Form.Label>
                <Form.Control
                  id="altrMobileNo"
                  type="tel"
                  maxLength="10"
                  onKeyDown={(e) => {
                    if (e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && (e.key < '0' || e.key > '9')) {
                      e.preventDefault();
                    }
                  }}
                  value={altrMobileNoEdit || ''}
                  onChange={(e) => setaltrMobileNoEdit(e.target.value)}
                />
                {addresserror.altrMobileNoEdit && <div className="mt-1 text-danger">{addresserror.altrMobileNoEdit}</div>}
              </div>
              <div className="mb-3 col-12 col-md-6">
                <Form.Label htmlFor="useradd1">
                  <span className="text-dark fw-bold">Address (House No., Colony Name)</span> <span className="text-danger"> * </span>
                </Form.Label>
                <Form.Control id="useradd1" type="text" value={address1Edit || ''} onChange={(e) => setAddress1Edit(e.target.value)} />
                {addresserror.address1Edit && <div className="mt-1 text-danger">{addresserror.address1Edit}</div>}
              </div>
              <div className="mb-3 col-12 col-md-6">
                <Form.Label htmlFor="useradd2">
                  <span className="text-dark fw-bold">Address (Street No., Area, Landmark)</span> <span className="text-danger"> * </span>
                </Form.Label>
                <Form.Control id="useradd2" type="text" value={address2Edit || ''} onChange={(e) => setAddress2Edit(e.target.value)} />
                {addresserror.address2Edit && <div className="mt-1 text-danger">{addresserror.address2Edit}</div>}
              </div>
              <div className="mb-3 col-12 col-md-6">
                <Form.Label htmlFor="userEditMail">
                  <span className="text-dark fw-bold">City</span> <span className="text-danger"> * </span>
                </Form.Label>
                <Form.Control
                  id="userEditMail"
                  type="text"
                  value={cityEdit || ''}
                  onChange={(e) => {
                    const { value } = e.target;
                    if (/^[a-zA-Z\s]*$/.test(value)) {
                      setCityEdit(value);
                    }
                  }}
                />
                {addresserror.cityEdit && <div className="mt-1 text-danger">{addresserror.cityEdit}</div>}
              </div>
              <div className="mb-3 col-12 col-md-6">
                <Form.Label htmlFor="userEditState">
                  <span className="text-dark fw-bold">State</span> <span className="text-danger"> * </span>
                </Form.Label>
                <Form.Select
                  name="state"
                  id="userEditState"
                  value={stateEdit || ''}
                  onChange={(e) => setStateEdit(e.target.value)}
                  aria-label="Default select example"
                >
                  <option>Select State</option>
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
                {addresserror.stateEdit && <div className="mt-1 text-danger">{addresserror.stateEdit}</div>}
              </div>
              <div className="mb-3 col-12 col-md-6">
                <Form.Label htmlFor="userEditPhone">
                  <span className="text-dark fw-bold">Pincode</span> <span className="text-danger"> * </span>
                </Form.Label>
                <Form.Control
                  id="userEditPhone"
                  type="text"
                  maxLength="6"
                  onKeyDown={(e) => {
                    if (e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && (e.key < '0' || e.key > '9')) {
                      e.preventDefault();
                    }
                  }}
                  value={postalEdit || ''}
                  onChange={(e) => setPostalEdit(e.target.value)}
                />
                {addresserror.postalEdit && <div className="mt-1 text-danger">{addresserror.postalEdit}</div>}
              </div>
              <div className="mb-3 col-12 col-md-6">
                <Form.Label htmlFor="usercountryEdit">Country</Form.Label>
                <Form.Control id="usercountryEdit" type="text" value={countryEdit || ''} onChange={(e) => setCountryEdit(e.target.value)} disabled />
                {addresserror.countryEdit && <div className="mt-1 text-danger">{addresserror.countryEdit}</div>}
              </div>
              <div className="mb-3 col-12 col-md-6">
                <Form.Label htmlFor="businessName">
                  <span className="text-dark fw-bold">Business Name</span>{' '}
                </Form.Label>
                <Form.Control id="businessName" type="text" value={businessNameEdit || ''} onChange={(e) => setbusinessNameEdit(e.target.value)} />
                {addresserror.businessNameEdit && <div className="mt-1 text-danger">{addresserror.businessNameEdit}</div>}
              </div>
              <div className="mb-3 col-12 col-md-6">
                <Form.Label htmlFor="gstin">
                  <span className="text-dark fw-bold">GST No.</span>{' '}
                </Form.Label>
                <Form.Control id="gstin" type="text" value={gstinEdit || ''} onChange={(e) => setgstinEdit(e.target.value)} minLength={15} maxLength={15} />
                {addresserror.gstinEdit && <div className="mt-1 text-danger">{addresserror.gstinEdit}</div>}
              </div>
              <div className="d-flex justify-content-center">
                <Button variant="danger" className="btn-icon ms-1" onClick={() => setEditAddressModal(false)}>
                  <span>Cancel</span>
                </Button>
                <Button className="btn-icon mx-1 btn-icon-start bg_color" type="submit">
                  <span>Save</span>
                </Button>
              </div>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      {/* Edit Address Modal End */}

      {/* Delete Address Modal Starts */}
      <Modal show={deleteModalView} onHide={() => setDeleteModalView(false)}>
        <Modal.Header closeButton className="p-3">
          <h5 className="fw-bold m-0">Delete Addres</h5>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete Address?</Modal.Body>
        <Modal.Footer>
          <Button className="bg-danger" onClick={() => setDeleteModalView(false)}>
            No
          </Button>
          <Button className="btn_color" onClick={() => deleteAddressConfirmed()}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Delete Address Modal Ends */}

      {/* Change Password Modal Start */}
      {data && data.getProfile && (
        <Modal className="modal-right scroll-out-negative" show={passwordModal} onHide={() => setPasswordModal(false)} scrollable dialogClassName="full">
          <Modal.Header closeButton>
            <Modal.Title as="h5" className="fw-bold">
              Change Password
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <OverlayScrollbarsComponent options={{ overflowBehavior: { x: 'hidden', y: 'scroll' } }} className="scroll-track-visible">
              <Form onSubmit={(e) => handleUpdatePassword(e)}>
                <div className="mb-3">
                  <Form.Label htmlFor="oldPassword" className="text-dark">
                    Current Password
                  </Form.Label>
                  <Form.Control id="oldPassword" minLength={6} required type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                </div>
                <div className="mb-3">
                  <Form.Label htmlFor="newPassword" className="text-dark">
                    New Password
                  </Form.Label>
                  <Form.Control id="newPassword" minLength={6} required type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>

                <div className="d-flex justify-content-around">
                  <Button variant="danger" className="btn-icon" onClick={() => setPasswordModal(false)}>
                    <span> Back</span>
                  </Button>
                  {loading ? (
                    <Button className="btn-icon btn-icon-start btn_color">
                      <span>Loading </span>
                    </Button>
                  ) : (
                    <Button className="btn-icon btn-icon-start btn_color" type="submit">
                      <span>Update Password</span>
                    </Button>
                  )}
                </div>
              </Form>
            </OverlayScrollbarsComponent>
          </Modal.Body>
        </Modal>
      )}
      {/* Change Password Modal End */}
    </>
  );
}

export default Dashboard;
