import React from 'react';
import moment from 'moment';
import { saveAs } from 'file-saver';
import { Button } from 'react-bootstrap';
import './itemTraking.css';

function ItemTraking({ tracking }) {
  const downloadImage = (imageurl, imagename) => {
    saveAs(imageurl, imagename); // Put your image URL here.
  };

  return (
    <>
      {tracking && (
        <div className="container pb20">
          <div className="row">
            <div className="row justify-content-between mb-3">
              <div className={`order-tracking ${tracking.packed && 'completed'}`}>
                <span className="is-complete" />
                <p>
                  Packed
                  {tracking.packedImage && (
                    <>
                      <br />
                      <span>{moment(parseInt(tracking.packedDate, 10)).format('LL')}</span>
                      <br />
                      <Button variant="link" className="btn btn-link p-0 sh-3" onClick={() => downloadImage(tracking.packedImage, 'Packed Image')}>
                        <span className='small'>Packed Image</span>
                      </Button>
                    </>
                  )}
                </p>
              </div>
              <div className={`order-tracking ${tracking.shipped && 'completed'}`}>
                <span className="is-complete" />
                <p>
                  Shipped
                  <br />
                  {tracking.shippedDate && <span>{moment(parseInt(tracking.shippedDate, 10)).format('LL')}</span>}
                  {tracking.shippedImage && (
                    <>
                      <br />
                      <Button variant="link" className="btn btn-link p-0 sh-3" onClick={() => downloadImage(tracking.shippedImage, 'Shipped Image')}>
                        <span>Shipped Image</span>
                      </Button>                      
                    </>
                  )}
                </p>
              </div>
              <div className={`order-tracking ${tracking.delivered && 'completed'}`}>
                <span className="is-complete" />
                <p>
                  Delivered
                  <br />
                  {tracking.deliveredDate && <span>{moment(parseInt(tracking.deliveredDate, 10)).format('LL')}</span>}
                  <br />
                  {tracking.deliveredImage && (
                    <Button variant="link" className="btn btn-link p-0 sh-3" onClick={() => downloadImage(tracking.deliveredImage, 'Delivered Image')}>
                      Delivered Image
                    </Button>
                  )}
                </p>
              </div>
              <div className={`${tracking.shipped && 'completed'} m-2`}>
                <div className="p-1 rounded border h-100 ">
                  <div className="col-4 pb-1 float-start text-center">
                    {tracking.shippedBy && (
                      <>
                        <spna className="fw-bold">Shipped By:</spna>
                        <span> {tracking.shippedBy}</span>
                      </>
                    )}
                  </div>
                  <div className="col-4 float-start text-center">
                    {tracking.trackingNo && (
                      <>
                        <spna className="fw-bold">Tracking No:</spna>
                        <span> {tracking.trackingNo}</span>
                      </>
                    )}
                  </div>
                  <div className="col-4 float-start text-center">
                    {tracking.trackingUrl && (
                      <>
                        <spna className="fw-bold">Tracking Url: </spna>
                        <span>
                          <a href={tracking.trackingUrl} className="text-underline" target="__top" rel="noreferrer">
                            Click Here
                          </a>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ItemTraking;
