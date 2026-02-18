import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Form, Card } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';

const GET_ACCOUNT_DETAIL = gql`
  query GetAllAccountdetails {
    getAllAccountdetails {
      id
      account_no
      ifsc_code
      account_name
      upi
      phone_no
      bank_name
      qr
      note
      notedmt
      notedmtstates
    }
  }
`;

const UPDATE_ACCOUNT_DETAIL = gql`
  mutation UpdateAccountdetails(
    $qrimage: Upload
    $accountNo: String
    $ifscCode: String
    $accountName: String
    $upi: String
    $phoneNo: String
    $bankName: String
    $qr: String
    $note: String
    $notedmt: String
    $notedmtstates: Boolean
    $updateAccountdetailsId: ID
  ) {
    updateAccountdetails(
      qrimage: $qrimage
      account_no: $accountNo
      ifsc_code: $ifscCode
      note: $note
      notedmt: $notedmt
      notedmtstates: $notedmtstates
      account_name: $accountName
      upi: $upi
      phone_no: $phoneNo
      bank_name: $bankName
      qr: $qr
      id: $updateAccountdetailsId
    ) {
      id
    }
  }
`;

function DetailAccount() {
  const title = 'DMT Account Detail';
  const description = 'DMT Account Detail';

  const dispatch = useDispatch();
  const modules = {
    toolbar: [
      [{ font: [] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const [formData, setFormData] = useState(null);

  const [GetAllAccountdetails, { refetch }] = useLazyQuery(GET_ACCOUNT_DETAIL, {
    onCompleted: (res) => {
      setFormData(res.getAllAccountdetails);
    },
    onError: (error) => {
      console.log('GET_ACCOUNT_DETAIL', error.message);
    },
  });

  useEffect(() => {
    GetAllAccountdetails();
  }, []);

  const [UpdateAccountdetails] = useMutation(UPDATE_ACCOUNT_DETAIL, {
    onCompleted: () => {
      refetch();
      toast.success('DMT Account Detail Updated successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });

  const handleChange = (event, field = null, editorValue = null) => {
    if (editorValue !== null && field) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [field]: editorValue,
        notedmtstates: field === 'notedmt' ? !!editorValue.trim() : prevFormData.notedmtstates,
      }));
    } else {
      const { name, type, value, checked, files } = event.target;

      if (type === 'checkbox') {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: checked, // Ensures boolean value
        }));
      } else if (name === 'qrimage') {
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
    }
  };

  const [formError, setFormError] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.account_no.trim()) {
      errors.account_no = 'Account Number is required !';
    }
    if (!formData.ifsc_code.trim()) {
      errors.ifsc_code = 'IFSC Code is required !';
    }
    if (!formData.account_name.trim()) {
      errors.account_name = 'Account Name is required !';
    }
    if (!formData.bank_name.trim()) {
      errors.bank_name = 'Bank Name is required !';
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
    await UpdateAccountdetails({
      variables: {
        updateAccountdetailsId: formData.id,
        accountNo: formData.account_no,
        ifscCode: formData.ifsc_code,
        accountName: formData.account_name,
        phoneNo: formData.phone_no,
        bankName: formData.bank_name,
        note: formData.note,
        notedmt: formData.notedmt,
        notedmtstates: formData.notedmtstates || false,
        ...formData,
      },
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
            <h1 className="fw-bold text-dark" id="title">
              {title}
            </h1>
          </Col>
          {/* Title End */}
        </Row>
      </div>
      {formData && (
        <Card className="mb-5 shadow-sm">
          <Card.Body>
            <Form onSubmit={submit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold text-dark">
                      Bank Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control type="text" name="bank_name" value={formData.bank_name || ''} onChange={handleChange} />
                    {formError.bank_name && <div className="text-danger small">{formError.bank_name}</div>}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold text-dark">
                      Account Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control type="text" name="account_name" value={formData.account_name || ''} onChange={handleChange} />
                    {formError.account_name && <div className="text-danger small">{formError.account_name}</div>}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold text-dark">
                      Account Number <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control type="text" name="account_no" value={formData.account_no || ''} onChange={handleChange} />
                    {formError.account_no && <div className="text-danger small">{formError.account_no}</div>}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold text-dark">
                      IFSC Code <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control type="text" name="ifsc_code" value={formData.ifsc_code || ''} onChange={handleChange} />
                    {formError.ifsc_code && <div className="text-danger small">{formError.ifsc_code}</div>}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold text-dark">UPI ID</Form.Label>
                    <Form.Control type="text" name="upi" value={formData.upi || ''} onChange={handleChange} />
                    {formError.upi && <div className="text-danger small">{formError.upi}</div>}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold text-dark">Gpay, PhonePe, PayTM Mobile No.</Form.Label>
                    <Form.Control type="text" name="phone_no" value={formData.phone_no || ''} onChange={handleChange} />
                    {formError.phone_no && <div className="text-danger small">{formError.phone_no}</div>}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold text-dark">QR Image</Form.Label>
                    <div className="d-flex align-items-center">
                      <div className="me-3" style={{ height: '100px', width: '100px', overflow: 'hidden' }}>
                        {formData.qr && <img src={formData.qr} className="img-fluid border rounded" alt="QR Code" />}
                      </div>
                      <Form.Control type="file" name="qrimage" onChange={handleChange} />
                    </div>
                    {formError.qrimage && <div className="text-danger small">{formError.qrimage}</div>}
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-bold text-dark">Note</Form.Label>
                    <ReactQuill
                      modules={modules}
                      theme="snow"
                      placeholder="Enter note"
                      value={formData.note || ''}
                      onChange={(content) => handleChange(null, 'note', content)}
                    />
                    {formError.note && <div className="text-danger small">{formError.note}</div>}
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-bold text-dark">Note DMT</Form.Label>
                    <ReactQuill
                      modules={modules}
                      theme="snow"
                      placeholder="Enter note for DMT"
                      value={formData.notedmt || ''}
                      onChange={(content) => handleChange(null, 'notedmt', content)}
                    />
                    {formError.notedmt && <div className="text-danger small">{formError.notedmt}</div>}
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group controlId="notedmtstates">
                    <Form.Check
                      type="checkbox"
                      label="Enable Note DMT"
                      name="notedmtstates"
                      checked={formData.notedmtstates || false}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={12} className="text-center mt-3">
                  <Button type="submit" variant="primary">
                    Save
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      )}
    </>
  );
}
export default DetailAccount;
