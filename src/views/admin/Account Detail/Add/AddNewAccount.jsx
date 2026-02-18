import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Form, Card } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';

const CREATE_ACCOUNT_DETAIL = gql`
  mutation CreateAccountdetails(
    $accountNo: String
    $ifscCode: String
    $accountName: String
    $upi: String
    $phoneNo: String
    $bankName: String
    $qrimage: Upload
  ) {
    createAccountdetails(
      account_no: $accountNo
      ifsc_code: $ifscCode
      account_name: $accountName
      upi: $upi
      phone_no: $phoneNo
      bank_name: $bankName
      qrimage: $qrimage
    ) {
      id
    }
  }
`;

function AddNewAccount() {
  const title = 'Create Account Detail';
  const description = 'Ecommerce Create Account Detail Page';

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const initialStates = {
    accountNo: '',
    ifscCode: '',
    accountName: '',
    upi: '',
    phoneNo: '',
    bankName: '',
    qrimage: '',
  };
  const [formData, setFormData] = useState(initialStates);

  const [CreateAccountdetails] = useMutation(CREATE_ACCOUNT_DETAIL, {
    onCompleted: () => {
      toast('Account Details Updated successfully!');
      setFormData(initialStates);
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!'); 
    },
  });

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    if (name === 'qrimage') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: files[0],
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  // handle error
  const [formError, setFormError] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.accountNo.trim()) {
      errors.accountNo = 'Account Number is required !';
    }
    if (!formData.ifscCode.trim()) {
      errors.ifscCode = 'ifscCode is required !';
    }
    if (!formData.accountName.trim()) {
      errors.accountName = 'accountName is required !';
    }
    if (!formData.upi.trim()) {
      errors.upi = 'upi is required !';
    }
    if (!formData.phoneNo.trim()) {
      errors.phoneNo = 'phoneNo is required !';
    }
    if (!formData.bankName.trim()) {
      errors.bankName = 'bankName is required !';
    }
    if (!formData.qrimage) {
      errors.qrimage = 'qrimage is required !';
    }
    return errors;
  };
  const submit = async (e) => {
    e.preventDefault();
    const errors = await validateForm();

    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }
    setFormError({});

    await CreateAccountdetails({
      variables: formData,
    });
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Dashboard</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
          </Col>
          {/* Title End */}
        </Row>
      </div>
      <Card className="mb-5">
        <Card.Body>
          <Form onSubmit={submit}>
            <div className="mb-3">
              <Form.Label className="fs-5">Account Number</Form.Label>
              <Form.Control type="text" name="accountNo" value={formData.accountNo || ''} onChange={handleChange} />
              {formError.accountNo && <div className="text-danger">{formError.accountNo}</div>}
            </div>
            <div className="mb-3">
              <Form.Label className="fs-5">Ifsc Code</Form.Label>
              <Form.Control type="text" name="ifscCode" value={formData.ifscCode || ''} onChange={handleChange} />
              {formError.ifscCode && <div className="text-danger">{formError.ifscCode}</div>}
            </div>

            <div className="mb-3">
              <Form.Label className="fs-5">Account Name</Form.Label>
              <Form.Control type="text" name="accountName" value={formData.accountName || ''} onChange={handleChange} />
              {formError.accountName && <div className="text-danger">{formError.accountName}</div>}
            </div>
            <div className="mb-3">
              <Form.Label className="fs-5">UPI ID</Form.Label>
              <Form.Control type="text" name="upi" value={formData.upi || ''} onChange={handleChange} />
              {formError.upi && <div className="text-danger">{formError.upi}</div>}
            </div>
            <div className="mb-3">
              <Form.Label className="fs-5">Phone No</Form.Label>
              <Form.Control type="text" name="phoneNo" value={formData.phoneNo || ''} onChange={handleChange} />
              {formError.phoneNo && <div className="text-danger">{formError.phoneNo}</div>}
            </div>
            <div className="mb-3">
              <Form.Label className="fs-5">Bank Name</Form.Label>
              <Form.Control type="text" name="bankName" value={formData.bankName || ''} onChange={handleChange} />
              {formError.bankName && <div className="text-danger">{formError.bankName}</div>}
            </div>
            <div className="mb-3">
              <Form.Label className="fs-5">QR Image</Form.Label>
              <Form.Control type="file" name="qrimage" onChange={handleChange} />
              {formError.qrimage && <div className="text-danger">{formError.qrimage}</div>}
            </div>
            <Button type="submit">Save</Button>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}
export default AddNewAccount;
