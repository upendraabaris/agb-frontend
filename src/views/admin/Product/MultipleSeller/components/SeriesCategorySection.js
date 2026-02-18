import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import AccordionItem21 from './SeriesCategorySection components/AccordionItem21';

function SeriesCategorySection({ setFormData }) {
  const [childComponents, setChildComponents] = useState([]);

  const handleRemove = (index) => {
    setChildComponents((prevChildComponents) => {
      const updatedChildComponents = [...prevChildComponents];
      updatedChildComponents.splice(index, 1);
      return updatedChildComponents;
    });
  };

  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    const newIndex = childComponents.length + 1;
    const newChild = (
      <AccordionItem21
        key={newIndex}
        indexofcat={newIndex}
        handleRemove={handleRemove}
        setFormData={setFormData}
      />
    );
    setChildComponents((prev) => [...prev, newChild]);
    setClickCount((prev) => prev + 1);
  };

  return (
    <div>
      {childComponents}

      <div className="d-flex ms-2 mt-2 mb-2">
        {clickCount === 0 ? (
          <Button onClick={handleClick}>
            Choose Category for Placement
          </Button>
        ) : (
          <Button onClick={handleClick}>
            Choose Another Category for Placement
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="tooltip-top" className="custom-tooltip">
                  In case your product lies in more than one category. (Optional)
                </Tooltip>
              }
            >
              <div className="d-inline-block ms-2">
                <CsLineIcons icon="info-hexagon" size="17" />
              </div>
            </OverlayTrigger>
          </Button>
        )}
      </div>
    </div>
  );
}

export default SeriesCategorySection;
