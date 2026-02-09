import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

const YourComponent = () => {
  const componentRef = useRef();
  const generatePDF = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Invoice',
  });

  const handleDownloadPDF = () => {
    generatePDF();
  };

  return (
    <>
      <div style={{ display: 'none' }}>
        <div className="bg-white fw-bold" ref={componentRef}>
          <div className="p-2 border fw-bold border-dark text-center" style={{border: '1px solid black', color: 'black'}}>PLEASE RECORD A VIDEO WHILE OPENING.</div>
          <div className="p-2 text-center fw-bold" style={{color: 'black'}}>(PARCEL)</div>
          <div className="p-2 fw-bold" style={{color: 'black'}}>
            <span>To, </span>
            <br />
            Mounika <br />
            Flat no 302,C block, Accurate wind chimes, narsingi,
            <br />
            Hyderabad , Telangana , India - 500089
            <br /> Mobile Number - 8897000347
          </div>
          <div className="p-2 fw-bold" style={{color: 'black'}}>
            <span>From, </span>
            ApnaGharMart
            <br />
            ApnaGharMart Bizcorp Pvt Ltd
            <br />
            Flat no 302,C block, Accurate wind chimes, narsingi,
            <br />
            <br />
            Hyderabad , Telangana , India - 500089
            <br />
            Mobile Number - 8897000347
          </div>
        </div>
      </div>
      <button type="button" onClick={handleDownloadPDF}>
        Download PDF
      </button>
    </>
  );
};

export default YourComponent;
