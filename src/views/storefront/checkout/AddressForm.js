import React from 'react';
import { withRouter } from 'react-router-dom';
import { Card, Button, Form } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { gql, useMutation } from '@apollo/client';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { toast } from 'react-toastify';
import { useGlobleContext } from 'context/styleColor/ColorContext';

const AddressForm = ({ refetchAddress, type, setAddNewBillingAddress, setBillingAddress, setAddNewShippingAddress, setShippingAddress }) => {
  
  const CREATE_ADDRESS = gql`
    mutation CreateAddress(
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
      createAddress(
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
  const { dataStoreFeatures1 } = useGlobleContext();
  const [CreateAddress] = useMutation(CREATE_ADDRESS, {
    onCompleted: (res) => {
      toast.success(`Address submitted successfully.`);
      refetchAddress();
      if (type === 'Shipping') {
        setAddNewShippingAddress(false);
        setShippingAddress({ ...res?.createAddress });
      }
      if (type === 'Billing') {
        setAddNewBillingAddress(false);
        setBillingAddress({ ...res?.createAddress });
      }
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });

  const phoneRegExp = /^(\+91)?(-)?\s*?(91)?\s*?(\d{3})-?\s*?(\d{3})-?\s*?(\d{4})$/;
  const pincodeRegExp = /^[0-9]*$/;

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('Enter firstName'),
    lastName: Yup.string().required('Enter lastName'),
    mobileNo: Yup.string().matches(phoneRegExp, 'Mobile No. is not valid').required('Enter Mobile No.'),
    address: Yup.string().required('Enter Address'),
    address2: Yup.string().required('Enter Landmark'),
    city: Yup.string().required('Enter your City name'),
    pincode: Yup.string().matches(pincodeRegExp, 'Pincode is not valid').required('Enter Pincode'),
    state: Yup.string().required('Enter your state'),
    country: Yup.string().required('Country Name is required'),
    gstin: Yup.string()
      .length(15, 'GST Number must be exactly 15 characters'),
  });

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      mobileNo: '',
      address: '',
      address2: '',
      city: '',
      pincode: '',
      state: '',
      country: 'India',
      altrMobileNo: '',
      businessName: '',
      gstin: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      await CreateAddress({
        variables: {
          addressLine1: values.address,
          addressLine2: values.address2,
          postalCode: values.pincode,
          ...values,
        },
      });
      resetForm();
    },
  });

  const initialValues = {
    firstName: '',
    lastName: '',
    mobileNo: '',
    address: '',
    address2: '',
    city: '',
    pincode: '',
    state: '',
    country: 'India',
    altrMobileNo: '',
    businessName: '',
    gstin: '',
  };

  // const formik = useFormik({ initialValues, validationSchema, onSubmit });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  return (
    <>
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
      <Card className="mb-5 mt-2">
        <div>
          {/* <div className="text-center fw-bold py-1 bg-dark text-white pt-2 pb-2 rounded">{`Add ${type} Address`} </div> */}
          <div className="p-3">
            <form id="checkoutnewAddress" className="tooltip-end-bottom" onSubmit={handleSubmit}>
              <div className="row">
                <div className="mb-1 col-12 col-md-6 filled form-group tooltip-end-top">
                  <Form.Control
                    type="text"
                    autoComplete="first-name"
                    name="firstName"
                    onChange={handleChange}
                    placeholder="First Name"
                    value={values.firstName}
                    className="border bg-white ps-3"
                  />
                  {errors.firstName && touched.firstName && <div className="d-block text-danger p-1">First name is required</div>}
                </div>
                <div className="mb-1 col-12 col-md-6 filled form-group tooltip-end-top">
                  <Form.Control
                    type="text"
                    autoComplete="last-name"
                    name="lastName"
                    onChange={handleChange}
                    placeholder="Last Name"
                    value={values.lastName}
                    className="border bg-white ps-3"
                  />
                  {errors.lastName && touched.lastName && <div className="d-block text-danger p-1">Last name is required</div>}
                </div>
              </div>
              <div className="row">
                <div className="mb-1 col-12 col-md-6 filled form-group tooltip-end-top">
                  <Form.Control
                    type="text"
                    autoComplete="mobile-no"
                    name="mobileNo"
                    onKeyDown={(e) => {
                      if (e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete' && (e.key < '0' || e.key > '9')) {
                        e.preventDefault();
                      }
                    }}
                    maxLength={10}
                    onChange={handleChange}
                    placeholder="Mobile Number"
                    value={values.mobileNo}
                    className="border bg-white ps-3"
                  />
                  {errors.mobileNo && touched.mobileNo && <div className="d-block text-danger p-1">Mobile number is required</div>}
                </div>
                <div className="mb-1 col-12 col-md-6 filled form-group tooltip-end-top">
                  <Form.Control
                    type="text"
                    autoComplete="altr-mobile-no"
                    name="altrMobileNo"
                    onKeyDown={(e) => {
                      if (e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete' && (e.key < '0' || e.key > '9')) {
                        e.preventDefault();
                      }
                    }}
                    maxLength={10}
                    onChange={handleChange}
                    placeholder="Alternate Mobile Number"
                    value={values.altrMobileNo}
                    className="border bg-white ps-3"
                  />
                  {errors.altrMobileNo && touched.altrMobileNo && <div className="d-block text-danger p-1">Alternate mobile number is required</div>}
                </div>
              </div>
              <div className="mb-1 filled form-group tooltip-end-top">
                <Form.Control
                  type="text"
                  autoComplete="street-address"
                  name="address"
                  onChange={handleChange}
                  placeholder="Address"
                  value={values.address}
                  className="border bg-white ps-3"
                />
                {errors.address && touched.address && <div className="d-block text-danger p-1">Address is required</div>}
              </div>
              <div className="mb-1 filled form-group tooltip-end-top">
                <Form.Control
                  type="text"
                  className="border bg-white ps-3"
                  name="address2"
                  onChange={handleChange}
                  placeholder="Area, Landmark"
                  value={values.address2}
                />
                {errors.address2 && touched.address2 && <div className="d-block text-danger p-1">Area, Landmark is required</div>}
              </div>

              <div className="row">
                <div className="mb-1 filled col-6 form-group tooltip-end-top">
                  <Form.Control type="text" name="city" className="border bg-white ps-3" onChange={handleChange} placeholder="City" value={values.city} />
                  {errors.city && touched.city && <div className="d-block text-danger p-1">City is required</div>}
                </div>
                <div className="mb-1 filled col-6 form-group tooltip-end-top">
                  <Form.Select name="state" onChange={handleChange} value={values.state} aria-label="Default select example" className='h-100'>
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
                    <option value="Other">Other</option>
                  </Form.Select>
                  {errors.state && touched.state && <div className="d-block text-danger p-1">State is required</div>}
                </div>
              </div>
              <div className="row">
                <div className="mb-1 filled col-6 form-group tooltip-end-top">
                  <Form.Control type="text" name="country" disabled onChange={handleChange} placeholder="Country" value={values.country} />
                  {errors.country && touched.country && <div className="d-block text-danger p-1">{errors.country}</div>}
                </div>
                <div className="mb-1 filled col-6 form-group tooltip-end-top">
                  <Form.Control
                    type="text"
                    name="pincode"
                    onKeyDown={(e) => {
                      if (e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && (e.key < '0' || e.key > '9')) {
                        e.preventDefault();
                      }
                    }}
                    maxLength={6}
                    onChange={handleChange}
                    placeholder="Pin Code"
                    value={values.pincode}
                    className="bg-white border ps-3"
                  />
                  {errors.pincode && touched.pincode && <div className="d-block text-danger">Pincode is required</div>}
                </div>
              </div>
              <div className="row">
                <div className="mb-1 col-12 col-md-6 filled form-group tooltip-end-top">
                  <Form.Control
                    type="text"
                    autoComplete="business-name"
                    name="businessName"
                    onChange={handleChange}
                    placeholder="Business Name"
                    value={values.businessName}
                    className="border bg-white ps-3"
                  />
                  {errors.businessName && touched.businessName && <div className="d-block text-danger p-1">Business name is required</div>}
                </div>
                <div className="mb-1 col-12 col-md-6 filled form-group tooltip-end-top">
                  <Form.Control
                    type="text"
                    autoComplete="gstin"
                    name="gstin"
                    onChange={handleChange}
                    placeholder="GST Number"
                    value={values.gstin}
                    className="border bg-white ps-3"
                    minLength={15}
                    maxLength={15}
                  />
                  {errors.gstin && touched.gstin && <div className="d-block text-danger p-1">{errors.gstin}</div>}
                </div>
              </div>
              <div className="text-center">
                <Button className="btn-icon btn-icon-start btn_color" type="submit">
                  Submit Address
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Card>
    </>
  );
};

export default withRouter(AddressForm);
