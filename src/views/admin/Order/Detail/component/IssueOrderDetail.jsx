import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Card } from 'react-bootstrap';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import ItemTraking from './ItemTraking';

const GET_BILL = gql`
  query GetBillByPackedId($packedId: String) {
    getBillByPackedId(packedID: $packedId) {
      id
      billNumber
      createdAt
      accounts_status
      customer_issue_title
      customer_issue
      customer_issue_date
      packedID
    }
  }
`;
const CUSTOMER_ISSUE_RESOLVE = gql`
  mutation CustomerIssueResolve($customerIssueResolveId: ID!) {
    customerIssueResolve(id: $customerIssueResolveId) {
      id
      accounts_status
    }
  }
`;

function Tabbed({ orderDetailData, history }) {
  const [packageIdentifier1, setpackageIdentifier] = useState([]);
  const [billData, setBillData] = useState({});

  const [GetBillByPackedId] = useLazyQuery(GET_BILL, {
    onError: (error) => {
      console.error('GET_BILL', error);
    },
  });

  useEffect(() => {
    const handlepackeditem = () => {
      if (orderDetailData?.getOrder) {
        const { orderProducts } = orderDetailData.getOrder;

        if (orderProducts) {
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
          const groupedProductsArray = Object.values(groupedProducts);
          setpackageIdentifier(groupedProductsArray);
        }
      }
    };
    if (orderDetailData?.getOrder) {
      handlepackeditem();
    }
  }, [orderDetailData]);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const resultsArray = await Promise.all(
          packageIdentifier1.map((pkg) =>
            GetBillByPackedId({
              variables: { packedId: pkg.packageIdentifier },
            }).then((res) => ({
              id: pkg.packageIdentifier,
              data: res?.data?.getBillByPackedId,
            }))
          )
        );

        const resultsObj = resultsArray.reduce((acc, curr) => {
          if (curr.data) acc[curr.id] = curr.data;
          return acc;
        }, {});

        setBillData(resultsObj);
      } catch (err) {
        console.error('Error fetching bill data:', err);
      }
    };

    if (packageIdentifier1.length > 0) {
      fetchBills();
    }
  }, [packageIdentifier1, GetBillByPackedId]);

  const createInvoice = (item2, billno, createdDate) => {
    history.push(`/invoice?orderID=${orderDetailData?.getOrder?.id}`, {
      data: item2,
      billno,
      createdDate,
    });
  };

  const downloadInvoice = async (item1) => {
    const { packageIdentifier } = item1;
    const { data } = await GetBillByPackedId({
      variables: { packedId: packageIdentifier },
    });

    if (data?.getBillByPackedId?.billNumber) {
      createInvoice(item1, data.getBillByPackedId.billNumber, data.getBillByPackedId.createdAt);
    }
  };

  const [CustomerIssueResolve] = useMutation(CUSTOMER_ISSUE_RESOLVE, {
    onCompleted: () => {
      toast.success('Customer issue resolved successfully!');
      setTimeout(() => {
        window.location.href = `/admin/order/issuelist`;
      }, 2000);
    },
    onError: (err) => {
      console.error('CustomerIssueResolve error:', err);
      toast.error('Failed to resolve issue. Please try again.');
    },
  });

  return (
    <>
      {packageIdentifier1.length > 0 &&
        packageIdentifier1.map((pakage, index) => {
          const billInfo = billData[pakage.packageIdentifier];
          return (
            <Row className="g-2 mb-3" key={index}>
              <Col>
                <Card>
                  <div className="h-100 py-0 align-items-center">
                    <Row className="g-0 mb-2">
                      {pakage?.products.length > 0 && (
                        <div className="bg-primary rounded-top">
                          <div className="text-white p-2 float-start">Sold By: {pakage?.products[0].locationId?.sellerId?.companyName}</div>
                          <div className="text-white p-2 float-end">{pakage.products[0].productStatus}</div>
                        </div>
                      )}
                    </Row>

                    {billInfo?.customer_issue && (
                      <div
                        className="p-3 m-3 mb-4 border rounded-3 shadow-sm bg-white d-flex align-items-start justify-content-between"
                        style={{
                          borderLeft: '5px solid #dc3545',
                          background: 'linear-gradient(90deg, #fff5f5 0%, #ffffff 100%)',
                        }}
                      >
                        <div className="d-flex align-items-start">
                          <div
                            className="me-3 d-flex align-items-center justify-content-center rounded-circle"
                            style={{
                              width: '36px',
                              height: '36px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              fontSize: '18px',
                            }}
                          >
                            i
                          </div>
                          <div>
                            <div className="fw-bold text-danger" style={{ fontSize: '14px' }}>
                              Customer Issue: {billInfo.customer_issue_title}
                            </div>
                            <div className="text-dark mt-1" style={{ fontSize: '13px' }}>
                              {billInfo.customer_issue}
                            </div>
                            {billInfo.customer_issue_date && (
                              <div className="text-muted mt-2" style={{ fontSize: '12px', fontStyle: 'italic' }}>
                                Reported on: {billInfo.customer_issue_date}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* ✅ Resolve Button */}
                        <Button
                          variant="success"
                          size="sm"
                          className="fw-semibold"
                          onClick={() => CustomerIssueResolve({ variables: { customerIssueResolveId: billInfo.id } })}
                        >
                          Resolve
                        </Button>
                      </div>
                    )}

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
                                    <div
                                      className="text-truncate"
                                      title={`${cart.productId.brand_name} : ${cart.productId.fullName} ${cart.variantId.variantName}`}
                                    >
                                      {cart.productId.brand_name} : {cart.productId.fullName} {cart.variantId.variantName}
                                    </div>
                                  </Col>
                                  <Col xs="12" className="d-flex flex-column mb-md-0">
                                    <Row className="g-0">
                                      <Col xs="9" className="d-flex flex-row pe-2 align-items-end text-alternate">
                                        <div className="text-dark">
                                          Price : ₹ {((cart.iprice + cart.iextraCharge) * (1 - cart.idiscount / 100)).toFixed(2)}
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
                                        <span className="text-dark">₹ {cart.price.toFixed(2)}</span>
                                      </Col>
                                    </Row>
                                  </Col>
                                </Row>
                              </div>
                            </Col>
                          </Row>
                        ))}
                    </Row>
                    {pakage.products[0].shipped && (
                      <div className="w-100">
                        <div className="text-white p-2  ">
                          <Button onClick={() => downloadInvoice(pakage)} className="btn-link border p-1 btn btn-white btn-primary">
                            Download Invoice
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
          );
        })}
    </>
  );
}

export default withRouter(Tabbed);
