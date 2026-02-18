import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import StoreFeatures from 'globalValue/storeFeatures/StoreFeatures';
import DetailAttributeItem from './PincodeComponents/DetailAttributeItem';

const VarientPicker = ({ setProductDetail, productVariant }) => {  
  const storeFeaturess = StoreFeatures();

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
    extraCharge: '',
    finalPrice: '',
    pincode: [],
    gstType: false,
    price: '',
    priceType: '',
    transportCharge: '',
    unitType: '',
  };

  const initialVariantState = {
    silent_features: '',
    allPincode: true,
    active: false,
    location: [initialLocationState],
  };

  const [formData, setFormData] = useState({
    variant: productVariant,
  });

  const handlePincodeChange = (variantIndex, locationIndex, pincodeValues) => {
    setFormData((prevState) => {
      const updatedLocation = {
        ...prevState.variant[variantIndex].location[locationIndex],
        pincode: pincodeValues,
      };
      const updatedVariant = {
        ...prevState.variant[variantIndex],
        location: prevState.variant[variantIndex].location.map((location, index) => (index === locationIndex ? updatedLocation : location)),
      };
      const updatedForm = {
        ...prevState,
        variant: prevState.variant.map((variant, index) => (index === variantIndex ? updatedVariant : variant)),
      };

      return updatedForm;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProductDetail((prevState) => ({
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

  const handleLocationChange = (event, variantIndex, locationIndex) => {
    const { name, value, checked } = event.target;

    setFormData((prevState) => {
      const updatedLocation = {
        ...prevState.variant[variantIndex].location[locationIndex],
        [name]: name === 'gstType' ? checked : value,
      };

      const updatedVariant = {
        ...prevState.variant[variantIndex],
        location: prevState.variant[variantIndex].location.map((location, index) => (index === locationIndex ? updatedLocation : location)),
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
      <Form onSubmit={handleSubmit}>
        {/* Variants */}
        {formData.variant?.map((variant, variantIndex) => {
          return (
            <div key={variantIndex} className="my-3">  
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
              {/* Location */}
              {variant.location.map((location, locationIndex) => (
                <div key={locationIndex} className="my-3">                 
                  <div className="row">
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <Form.Group controlId={`variant[${variantIndex}].active`}>
                          <Form.Label className="fw-bold text-dark">
                            <Form.Check
                              type="checkbox"
                              name="active"
                              inline
                              value="true"
                              checked={variant.active || ''}
                              onChange={(e) => handleFormChange(e, variantIndex)}
                            />
                            Active
                          </Form.Label>
                        </Form.Group>
                      </div>
                      <div className="row mb-2 col-md-6">
                        <div className=" col-md-10">
                          <Form.Label htmlFor={`variant[${variantIndex}].allPincode`} className="fw-bold text-dark">
                            Available for all Pincode
                          </Form.Label>
                        </div>
                        <div className=" col-md-2">
                          <Form.Check
                            name="allPincode"
                            className="ms-3"
                            id={`variant[${variantIndex}].allPincode`}
                            type="checkbox"
                            inline
                            value="true"
                            disabled={!storeFeaturess?.pincode}
                            checked={variant.allPincode || ''}
                            onChange={(e) => handleFormChange(e, variantIndex)}
                          />
                        </div>
                      </div>
                    </div>
                    {storeFeaturess?.pincode && (
                      <div className="mb-2">
                        <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].pincode`}>
                          <Form.Label className="fw-bold text-dark">Pincode</Form.Label>
                          <DetailAttributeItem
                            onPincodeChange={(pincodeValues) => handlePincodeChange(variantIndex, locationIndex, pincodeValues)}
                            pincodeValues={location.pincode}
                            allpincode={variant.allPincode}
                          />
                        </Form.Group>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        {/* Add variant button */}
        <div className="d-flex justify-content-between float-end">          

          {/* Submit button */}
          <Button className="ms-3" type="submit">
            Save Variants
          </Button>
        </div>
      </Form>
    </>
  );
};

export default VarientPicker;
