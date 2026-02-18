import { useGlobleContext } from 'context/styleColor/ColorContext';
import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';

const FilterMenuContent = ({
  setIsOpenFiltersModal,
  GetTMTByCategoryName,
  GetSeriesProductByCategoryName,
  productFilters,
  setProductFilters,
  GetProductByCategoryName,
}) => {
  // const initialPrice = {
  //   minPrice: '',
  //   maxPrice: '',
  // };

  // const [price, setprice] = useState(initialPrice);
  const { dataStoreFeatures1 } = useGlobleContext();
  const handlePrice = (e) => {
    const { name, value } = e.target;

    setProductFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const clearAll = async () => {
    const selectedRadio = document.querySelector('input[name="discountRadios"]:checked');
    if (selectedRadio) {
      selectedRadio.checked = false;
    }
    // setprice(initialPrice);

    setProductFilters((prev) => ({
      ...prev,
      discountPercentage: '',
      minPrice: '',
      maxPrice: '',
    }));

    if (GetProductByCategoryName) {
      await GetProductByCategoryName()
    }
    else if (GetSeriesProductByCategoryName) {
      await GetSeriesProductByCategoryName()
    }
    else if (GetTMTByCategoryName) {
      await GetTMTByCategoryName()
    }
  };

  const onsubmit = async (e) => {
    e.preventDefault();

    const selectedDiscount = document.querySelector('input[name="discountRadios"]:checked');
    if (selectedDiscount) {
      const discountValue = selectedDiscount.value;
      setProductFilters((prev) => ({
        ...prev,
        // ...price,
        discountPercentage: discountValue,
      }));

      if (GetProductByCategoryName) {
        await GetProductByCategoryName({
          variables: {
            ...productFilters,
            minPrice: parseFloat(productFilters.minPrice),
            maxPrice: parseFloat(productFilters.maxPrice),
            discountPercentage: parseFloat(discountValue),
          },
        });
      } else if (GetSeriesProductByCategoryName) {
        await GetSeriesProductByCategoryName({
          variables: {
            ...productFilters,
            minPrice: parseFloat(productFilters.minPrice),
            maxPrice: parseFloat(productFilters.maxPrice),
            discountPercentage: parseFloat(discountValue),
          },
        });
      } else if (GetTMTByCategoryName) {
        await GetTMTByCategoryName({
          variables: {
            ...productFilters,
            minPrice: parseFloat(productFilters.minPrice),
            maxPrice: parseFloat(productFilters.maxPrice),
            discountPercentage: parseFloat(discountValue),
          },
        });
      }
    } else {
      setProductFilters((prev) => ({
        ...prev,
        // ...price,
      }));

      await GetProductByCategoryName({
        variables: {
          ...productFilters,
          discountPercentage: null,
          minPrice: parseFloat(productFilters.minPrice),
          maxPrice: parseFloat(productFilters.maxPrice),
        },
      });

      await GetSeriesProductByCategoryName({
        variables: {
          ...productFilters,
          minPrice: parseFloat(productFilters.minPrice),
          maxPrice: parseFloat(productFilters.maxPrice),
          discountPercentage: null,
        },
      });
      await GetTMTByCategoryName({
        variables: {
          ...productFilters,
          minPrice: parseFloat(productFilters.minPrice),
          maxPrice: parseFloat(productFilters.maxPrice),
          discountPercentage: null,
        },
      });
    }

    setIsOpenFiltersModal(false);
  };

  useEffect(() => {
    const selectedRadio = document.querySelector(`input[name="discountRadios"][value="${productFilters.discountPercentage}"]`);
    if (selectedRadio) {
      selectedRadio.checked = true;
    }
  }, [productFilters.discountPercentage]);

  return (
    <>
      <Form className="mb-5" onSubmit={onsubmit}>
        <style>
          {`.bg_color {
         background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
         color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
       }`}
          {`.font_color {
         color: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
       }`}
          {`.font_black {
         color: black;
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
          {`
         .btn_color_border {
           background: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
           color: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
           transition: background 0.3s ease;
           padding: 10px 30px;
           border: 1px solid ${dataStoreFeatures1?.getStoreFeature?.bgColor};;
           cursor: pointer;            
         }
         .btn_color_border:hover {
           background: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
           color: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
           filter: brightness(80%);       
         } 
       `}
        </style>
        <div className='fs-6 fw-bold pb-2 mb-2 border-bottom font_black d-none d-md-block'>Filters</div>       
        <p className="fw-bold mb-2 font_black">Discount</p>
        <Form.Check type="radio" value={10} label="10% or more" id="discountRadio5" name="discountRadios" className="ms-3" />
        <Form.Check type="radio" value={20} label="20% or more" id="discountRadio4" name="discountRadios" className="ms-3" />
        <Form.Check type="radio" value={30} label="30% or more" id="discountRadio3" name="discountRadios" className="ms-3" />
        <Form.Check type="radio" value={40} label="40% or more" id="discountRadio2" name="discountRadios" className="ms-3" />
        <Form.Check type="radio" value={50} label="50% or more" id="discountRadio1" name="discountRadios" className="ms-3" />
        <p className="fw-bold mb-2 pt-3 border-top mt-3 font_black">Price Range</p>
        <Row className="g-1 mb-3 ms-3">
          <Col>
            <Form.Control
              onChange={handlePrice}
              type="text"
              onKeyDown={(e) => {
                if (e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete' && (e.key < '0' || e.key > '9')) {
                  e.preventDefault();
                }
              }}
              name="minPrice"
              value={productFilters.minPrice}
              placeholder="Min"
            />
          </Col>
          <Col>
            <Form.Control
              onChange={handlePrice}
              type="tel"
              onKeyDown={(e) => {
                if (e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete' && (e.key < '0' || e.key > '9')) {
                  e.preventDefault();
                }
              }}
              maxLength="10"
              name="maxPrice"
              value={productFilters.maxPrice}
              placeholder="Max"
            />
          </Col>
        </Row>
        <div className="d-flex flex-row justify-content-between w-100 w-sm-50 w-xl-100">
          <Button onClick={clearAll} className="w-100 me-2 btn_color_border text-dark">
            Clear
          </Button>
          <Button type="submit" className="w-100 me-2 btn_color">
            Filter
          </Button>
        </div>
      </Form>
    </>
  );
};
export default FilterMenuContent;