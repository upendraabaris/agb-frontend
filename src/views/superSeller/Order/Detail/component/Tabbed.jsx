import React, { useEffect, useState } from 'react';
import { OverlayTrigger, Tooltip, Row, Col, Button, Card } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { gql, useLazyQuery } from '@apollo/client';
import { withRouter } from 'react-router-dom';
import ItemTraking from './ItemTraking';

const GET_BILL = gql`
  query GetBillByPackedId($packedId: String) {
    getBillByPackedId(packedID: $packedId) {
      id
      billNumber
      createdAt
    }
  }
`;

function Tabbed({ orderDetailData, history }) {
  const [packageIdentifier1, setpackageIdentifier] = useState([]);

  useEffect(() => {
    const handlepackeditem = async () => {
      if (orderDetailData?.getOrder) {
        const { orderProducts } = orderDetailData.getOrder;

        if (orderProducts) {
          // Group products by packageIdentifier
          const groupedProducts = orderProducts.reduce((acc, product) => {
            const { packageIdentifier } = product;

            if (packageIdentifier) {
              if (!acc[packageIdentifier]) {
                acc[packageIdentifier] = { packageIdentifier, products: [] };
              }

              acc[packageIdentifier].products.push(product);
            }

            return acc;
          }, {});

          // Convert the object into an array of objects
          const groupedProductsArray = Object.values(groupedProducts);

          setpackageIdentifier(groupedProductsArray);
        }
      }
    };

    if (orderDetailData?.getOrder) {
      handlepackeditem();
    }
  }, [orderDetailData]);

  const [GetBillByPackedId] = useLazyQuery(GET_BILL, {
    onError: (error) => {
      console.error('GET_BILL', error);
    },
  });

  const createInvoice = (item2, billno, createdDate) => {
    history.push(`/invoiceRes?orderID=${orderDetailData?.getOrder?.id}`, {
      data: item2,
      billno,
      createdDate,
    });
  };

  const downloadInvoice = async (item1) => {
    const { packageIdentifier } = item1;

    const { data } = await GetBillByPackedId({
      variables: {
        packedId: packageIdentifier,
      },
    });

    if (data?.getBillByPackedId?.billNumber) {
      createInvoice(item1, data.getBillByPackedId.billNumber, data.getBillByPackedId.createdAt);
    }
  };

  return (
    <>
      {packageIdentifier1.length > 0 &&
        packageIdentifier1.map((pakage, index) => (
          <Row className="g-2 mb-3" key={index}>
            <Col>
              <Card>
                <div className="h-100 py-0 align-items-center">
                  <Row className="g-0 mb-4">
                    {pakage?.products.length > 0 && (
                      <div className="bg-primary rounded-top">
                        <div className="text-white p-2 float-start">Sold By: {pakage?.products[0].locationId?.sellerId?.companyName}</div>

                        <div className="text-white p-2 float-end">{pakage.products[0].productStatus}</div>
                      </div>
                    )}
                    {pakage.products[0].delivered && (
                      <div className="w-100">
                        <div className="text-white p-2 float-end">
                          <Button
                            onClick={() => downloadInvoice(pakage)}
                            className="btn-link border p-1 btn btn-white  btn btn-primary btn btn-primary btn btn-primary"
                          >
                            Download Invoice
                          </Button>
                        </div>
                      </div>
                    )}
                  </Row>

                  <ItemTraking tracking={pakage.products[0]} />
                  <Row className="g-0 p-2">
                    {pakage?.products.length > 0 &&
                      pakage.products.map((cart, index1) => (
                        <Row key={index1} className="g-0 mb-3">
                          <Col xs="auto">
                            <img
                              src={cart.productId.thumbnail || (cart.productId.images.length > 0 && cart.productId.images[0])}
                              className="card-img border p-1 rounded-md sw-10"
                              alt="thumb"
                            />
                          </Col>
                          <Col>
                            <div className="ps-4 pt-0 pb-0 pe-0 h-100">
                              <Row className="g-0 h-100 align-items-start align-content-center">
                                <Col xs="12" className="d-flex flex-column">
                                  <div>
                                    {cart.productId.brand_name} : {cart.productId.fullName} {cart.variantId.variantName}
                                  </div>
                                </Col>
                                <Col xs="12" className="d-flex flex-column mb-md-0 pt-1">
                                  <Row className="g-0">
                                    <Col xs="9" className="d-flex flex-row pe-2 align-items-end text-alternate">
                                      <div className="small">
                                        {' '}
                                        Price : ₹ {cart.iprice}
                                        {cart.iextraChargeType === '0' ? (
                                          <span>
                                            {' '}
                                            {' | '} {cart.iextraChargeType} : {cart.iextraCharge}
                                          </span>
                                        ) : null}
                                        <br />
                                        {cart.itransportChargeType} : {cart.itransportCharge} <br />
                                        Qty : {cart.quantity}
                                      </div>
                                    </Col>
                                    <Col xs="3" className="d-flex flex-row align-items-end justify-content-end text-alternate">
                                      <span>
                                        <span className="text-small">₹ </span>
                                        {cart.price}
                                      </span>
                                    </Col>
                                  </Row>
                                </Col>
                              </Row>
                            </div>
                          </Col>
                        </Row>
                      ))}
                  </Row>
                </div>
              </Card>
            </Col>
          </Row>
        ))}
    </>
  );
}

export default withRouter(Tabbed);
