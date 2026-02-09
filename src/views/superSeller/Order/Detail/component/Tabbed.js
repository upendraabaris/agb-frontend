import React, { useEffect, useState, useRef } from 'react';
import { Row, Col, Card, Modal } from 'react-bootstrap';
import { gql, useQuery } from '@apollo/client';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';
import { withRouter } from 'react-router-dom';
import ItemTraking from './ItemTraking';
import handlecommission from './handlecommission';

const GET_STORE_FEATURE = gql`
  query GetStoreFeature {
    getStoreFeature {
      storeName
    }
  }
`;

function Tabbed({ orderDetailData, OrderPacked, loading, history }) {
  const [packageIdentifier1, setpackageIdentifier] = useState([]);
  const [shippingAddress1, setShippingAddress] = useState(null);
  const [sellerDetails, setSellerDetails] = useState(null);
  const { data: storeFeatureData } = useQuery(GET_STORE_FEATURE);
  const storeName = storeFeatureData?.getStoreFeature?.storeName || '';

  useEffect(() => {
    if (orderDetailData?.getSingleOrderForseller) {
      const { orderProducts, shippingAddress } = orderDetailData.getSingleOrderForseller;

      if (shippingAddress) setShippingAddress(shippingAddress);
      if (orderProducts.length > 0) {
        const seller = orderProducts[0]?.sellerId || orderProducts[0]?.locationId[0]?.sellerId;
        setSellerDetails({ ...seller, ...JSON.parse(seller.address) });
      }

      const groupedProducts = orderProducts.reduce((acc, product) => {
        const { packageIdentifier } = product;
        if (packageIdentifier) {
          acc[packageIdentifier] = acc[packageIdentifier] || { packageIdentifier, products: [] };
          acc[packageIdentifier].products.push(product);
        }
        return acc;
      }, {});
      setpackageIdentifier(Object.values(groupedProducts));
    }
  }, [orderDetailData]);

  const componentRef = useRef();
  const generatePDF = useReactToPrint({ content: () => componentRef.current, documentTitle: 'Shipping Slip' });

  const [commissionModal, setCommissionModal] = useState(false);
  const [productForCommissions, setProductForCommission] = useState(null);
  const [listingComm1, setListingComm] = useState(0);
  const [productComm1, setProductComm] = useState(0);
  const [shippingComm1, setShippingComm] = useState(0);
  const [fixedComm1, setFixedComm] = useState(0);
  const [packageTotalValue, setpackageTotalValue] = useState(0);
  const [afterCommissionValue, setAfterCommissionValue] = useState(0);
  const [chargesoncommission, setChargesoncommission] = useState({ gst: 0, tds: 0, tcs: 0 });

  const handlecommissionModal = (pkage) => {
    try {
      const { products } = pkage;
      const { totalListingComm, totalProductComm, totalShippingComm, totalFixedComm } = handlecommission(products);
      const calculatedTotalCartValue = products.reduce((total, product) => total + product.price, 0);
      setpackageTotalValue(calculatedTotalCartValue);
      setListingComm(totalListingComm);
      setProductComm(totalProductComm);
      setShippingComm(totalShippingComm);
      setFixedComm(totalFixedComm);

      const totalComission = totalListingComm + totalProductComm + totalShippingComm + totalFixedComm;
      setChargesoncommission({
        gst: totalComission * 0.18,
        tds: totalComission * 0.01,
        tcs: totalComission * 0.01,
      });

      setAfterCommissionValue(calculatedTotalCartValue - (totalComission + chargesoncommission.gst + chargesoncommission.tds + chargesoncommission.tcs));

      setProductForCommission(pkage);
      setCommissionModal(true);
    } catch (error) {
      toast.error(error.message || 'Something went wrong!');
    }
  };

  return (
    <>
      {packageIdentifier1.map((pakage, index) => (
        <Row className="g-2 mb-3" key={index}>
          <Col>
            <Card>
              <div className="h-100 m-2">
                <Row className="g-0">
                  {pakage?.products.length > 0 && (
                    <div className="d-flex justify-content-around bg-primary rounded-top p-2">
                      <div className="text-white col text-start">{pakage?.products[0].locationId?.sellerId?.companyName}</div>
                      <div className="text-white float-end px-2">{pakage.products[0].productStatus}</div>
                    </div>
                  )}
                </Row>
                <ItemTraking tracking={pakage.products[0]} />
              </div>
            </Card>
          </Col>
        </Row>
      ))}
      {commissionModal && productForCommissions && (
        <Modal size="lg" show={commissionModal} onHide={() => setCommissionModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Commission Detail</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <table className="table-bordered border-dark table">
              <thead className="bg-light">
                <tr>
                  <th>Product Name</th>
                  <th className="text-center">Price</th>
                  <th className="text-center">Listing Commission</th>
                  <th className="text-center">Fixed Commission</th>
                  <th className="text-center">Product Commission</th>
                  <th className="text-center">Shipping Fee</th>
                </tr>
              </thead>
              <tbody>
                {productForCommissions.products.map((product, index) => (
                  <tr key={index} className="text-end">
                    <td className="text-start">
                      {product.productId.fullName} {product.variantId.variantName}
                    </td>
                    <td className="text-center">{product.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
}

export default withRouter(Tabbed);
