import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Card, Button } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import StoreFeatures from 'globalValue/storeFeatures/StoreFeatures';
import DetailAttributeItem from './PincodeComponents/DetailAttributeItem';

const VarientPicker = ({ setFormData1 }) => {
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

  const initialLocationState = {
    extraCharge: 0,
    finalPrice: '',
    pincode: [],
    price: 0,
    transportCharge: 0,
  };

  const initialVariantState = {
    variantName: '',
    silent_features: '',
    allPincode: true,
    active: true,
    location: [initialLocationState],
  };

  const [formData, setFormData] = useState({
    variant: [initialVariantState],
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormData1((prevState) => ({
      ...prevState,
      variant: formData.variant.map((variant) => ({
        ...variant,
        location: variant.location.map((location) => ({
          ...location,
          price: location.price !== '' ? parseFloat(location.price) : 0.0,
          extraCharge: location.extraCharge !== '' ? parseFloat(location.extraCharge) : 0.0,
          transportCharge: location.transportCharge !== '' ? parseFloat(location.transportCharge) : 0.0,
        })),
      })),
    }));
  };
  const handleFormChange = (event, variantIndex) => {
    const { name, value, type, checked } = event.target;

    const parseditem = ['moq', 'minimunQty'].includes(name);

    if (parseditem) {
      if (name === 'moq') {
        setFormData((prevState) => {
          const updatedVariant = {
            ...prevState.variant[variantIndex],
            [name]: parseFloat(value),
            minimunQty: parseFloat(value) !== 1 ? 1 : 1,
          };
          const updatedForm = {
            ...prevState,
            variant: prevState.variant.map((variant, index) => (index === variantIndex ? updatedVariant : variant)),
          };
          return updatedForm;
        });
      } else {
        setFormData((prevState) => {
          const updatedVariant = {
            ...prevState.variant[variantIndex],
            [name]: parseFloat(value),
          };
          const updatedForm = {
            ...prevState,
            variant: prevState.variant.map((variant, index) => (index === variantIndex ? updatedVariant : variant)),
          };
          return updatedForm;
        });
      }
    } else if (type === 'checkbox') {
      setFormData((prevState) => {
        const updatedVariant = {
          ...prevState.variant[variantIndex],
          [name]: checked,
        };
        const updatedForm = {
          ...prevState,
          variant: prevState.variant.map((variant, index) => (index === variantIndex ? updatedVariant : variant)),
        };
        return updatedForm;
      });
    } else {
      setFormData((prevState) => {
        const updatedVariant = {
          ...prevState.variant[variantIndex],
          [name]: value,
        };
        const updatedForm = {
          ...prevState,
          variant: prevState.variant.map((variant, index) => (index === variantIndex ? updatedVariant : variant)),
        };
        return updatedForm;
      });
    }
  };

  const handleSilentFeaturesChange = (silentdesc, variantIndex) => {
    setFormData((prevState) => {
      const updatedVariant = {
        ...prevState.variant[variantIndex],
        silent_features: silentdesc,
      };
      const updatedForm = {
        ...prevState,
        variant: prevState.variant.map((variant, index) => (index === variantIndex ? updatedVariant : variant)),
      };
      return updatedForm;
    });
  };


  return (
    <>
      <Row>
        <Col xl="12">
          <Card>
            <div className="p-1 mt-2">
              <Form onSubmit={handleSubmit}>
                {/* Variants */}
                {formData.variant.map((variant, variantIndex) => (
                  <div key={variantIndex} className="p-3 pt-1">
                    
                    {/* Variant Name */}
                    <div className="mb-3">
                      <Form.Label className="fw-bold text-dark">Salient Features</Form.Label>
                      <ReactQuill
                        modules={modules}
                        theme="snow"
                        placeholder="Salient Features"
                        value={variant.silent_features || ''}
                        onChange={(silentfeaturesss) => handleSilentFeaturesChange(silentfeaturesss, variantIndex)}
                      />
                    </div>
                  </div>
                ))}

                {/* Add variant button */}
                <div className="d-flex justify-content-between">


                  {/* Submit button */}
                  <Button className="ms-3" type="submit">
                    Save Variant
                  </Button>
                </div>
              </Form>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default VarientPicker;
