import React, { useEffect, useState } from 'react';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import { NavLink, useHistory, useLocation } from 'react-router-dom';
import { Row, Col, Card, Pagination, Spinner, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import PriceComponent from 'views/storefront/home/PriceComponent';
import DiscountBadge from 'views/storefront/home/DiscountBadge';
import TMTPriceComponent from 'views/storefront/home/TMTPriceComponent';
import TMTDiscountBadge from 'views/storefront/home/TMTDiscountBadge';
import TMTSectionFalseDiscount from 'views/storefront/home/TMTSectionFalseDiscount';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

function SearchResult() {
  const history = useHistory();
  const [tempPage, setTempPage] = useState(1);
  const itemsPerPage = 20;
  const [itemLength, setItemLength] = useState(20);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('query');

  useEffect(() => {
    setTempPage(1);
  }, [query]);

  const SEARCH = gql`
    query HomePageSearch($search: String, $page: Int, $itemsPerPage: Int) {
      homePageSearch(search: $search, page: $page, itemsPerPage: $itemsPerPage) {
        id
        variant {
          id
          location {
            id
            pincode
            unitType
            priceType
            price
            gstType
            gstRate
            extraChargeType
            extraCharge
            transportChargeType
            transportCharge
            b2cdiscount
            b2bdiscount
            finalPrice
            mainStock
            displayStock
          }
          variantName
          active
          hsn
          silent_features
          moq
          allPincode
          minimunQty
        }
        seriesvariant {
          id
          serieslocation {
            id
            pincode
            unitType
            priceType
            price
            gstType
            gstRate
            extraChargeType
            extraCharge
            transportChargeType
            transportCharge
            finalPrice
            b2cdiscount
            b2bdiscount
            mainStock
            displayStock
          }
          variantName
          active
          allPincode
          hsn
          silent_features
          moq
        }
        tmtseriesvariant {
          id
          allPincode
          tmtserieslocation {
            id
            pincode
            unitType
            priceType
            price
            gstType
            gstRate
            extraChargeType
            extraCharge
            transportChargeType
            transportCharge
            finalPrice
            b2cdiscount
            b2bdiscount
            sectionDiff
            mainStock
            displayStock
          }
          variantName
          active
          hsn
          silent_features
          moq
        }
        faq {
          id
          question
          answer
        }
        brand_name
        brandCompareCategory
        previewName
        fullName
        thumbnail
        sku
        returnPolicy
        shippingPolicy
        cancellationPolicy
        description
        giftOffer
        section
        sellerNotes
        policy
        identifier
        video
        youtubeLink
        catalogue
        approve
        active
        reject
        rejectReason
        images
        categories
        listingComm
        listingCommType
        fixedComm
        fixedCommType
        shippingComm
        shippingCommType
        productComm
        productCommType
      }
    }
  `;

  const [search, { data: searchData, loading, refetch, error }] = useLazyQuery(SEARCH);

  const handlePrev = async () => {
    window.scroll({ top: 0, behavior: 'smooth' });
    setTempPage(tempPage - 1);
  };

  const handleNext = async () => {
    window.scroll({ top: 0, behavior: 'smooth' });
    setTempPage(tempPage + 1);
  };

  useEffect(() => {
    search({
      variables: {
        search: query?.replace(/_/g, ' '),
        page: tempPage,
        itemsPerPage,
      },
    });

    setItemLength(searchData?.homePageSearch?.length);
  }, [query, search, searchData, tempPage]);

  function handleSelection(event) {
    history.push(`/product/${event.replace(/\s/g, '_').toLowerCase()}`);
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  } 
  
  return (
    <>
      {searchData?.homePageSearch?.length > 0 && (
        <div className="text-center py-0">
          <div className="fw-bold fs-5">Search Results</div>
          <div className="mt-2 text-center">
            <h1 className=" fw-bold d-inline fs-6">{query?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</h1>
            <span className="text-dark small ms-2"> – {searchData.homePageSearch.length} items</span>
          </div>
          <hr className="w-50 mx-auto mb-3" />
        </div>
      )}

      {searchData?.homePageSearch?.length > 0 ? (
        <Row className="g-2 row-cols-2 row-cols-md-3 row-cols-xl-5 row-cols-xxl-7">
          {searchData?.homePageSearch?.map((item) => {
            const activevariant = item?.variant?.find((variant) => variant.active === true);
            return (
              // item?.approve &&
              item?.active && (
                <Col key={item.id}>
                  <Card className="hover-border-primary my-1 border">
                    {item && item?.variant && <DiscountBadge variant={activevariant} name={item?.previewName} />}
                    {item && item?.tmtseriesvariant && <>{item?.section ? <TMTDiscountBadge product={item} /> : <TMTSectionFalseDiscount product={item} />}</>}
                    <Row className="g-0 h-100 border-bottom">
                      <img
                        src={item?.thumbnail || (item?.images && item?.images[0])}
                        alt={item?.previewName}
                        className="  rounded card-img-horizontal h-100 px-1 py-1"
                      />
                      <div>
                        {item?.brandCompareCategory && (
                          <p
                            style={{
                              position: 'absolute',
                              backgroundColor: '#1ea9e8',
                              color: 'white',
                              marginTop: '-24px',
                              marginLeft: '0px',
                              paddingBottom: '0px',
                              fontSize: '14px',
                              borderTopRightRadius: '8px',
                            }}
                            className="px-1 pb-0 mx-1 mb-1"
                          >
                            Compare Brands
                          </p>
                        )}
                      </div>
                    </Row>
                    <Row>
                      <Card.Body className="text-center h-100 py-0 px-2 my-1 mx-1">
                        <div className="card-text mb-0 text-truncate mx-2" style={{ fontWeight: 'bold' }}>
                          {item?.brand_name}
                        </div>
                        <div>
                          <NavLink
                            style={{ fontWeight: 'bold' }}
                            to={`/product/${item?.identifier?.replace(/\s/g, '_').toLowerCase()}`}
                            className="body-link stretched-link d-block my-1 mx-1 py-1 px-1 text-truncate"
                          >
                            {item?.previewName}
                          </NavLink>
                        </div>
                        <div>
                          {item && item?.variant && (
                            <div className="text-truncate my-1 py-0 mx-2 px-1">
                              {activevariant ? <PriceComponent variant={activevariant} name={item?.previewName} /> : 'OUT OF STOCK'}
                              {/* activevariant */}
                            </div>
                          )}
                          {item && item?.tmtseriesvariant && (
                            <div className="text-truncate mx-2">
                              {item && item?.section ? <TMTPriceComponent product={item} /> : <p className="d-inline">VIEW PRICE</p>}
                            </div>
                          )}
                        </div>
                      </Card.Body>
                    </Row>
                  </Card>
                </Col>
              )
            );
          })}
        </Row>
      ) : (
        <div className="text-center border fw-bold p-4 rounded bg-white">
          <div className="mb-3">
            <img src="/no_found_result.png" alt="No results found" className="img-fluid" />
          </div>
          <div className="fs-4 mb-2">Sorry, no search results found!</div>
          <div className="fs-6 mb-4">Check your spelling or try a different search.</div>
        </div>
      )}
      {searchData?.homePageSearch.length > 0 && (
        <div className="d-flex justify-content-center mt-5">
          <Pagination>
            <Pagination.Prev className="shadow" disabled={tempPage === 1} onClick={handlePrev}>
              <CsLineIcons icon="chevron-left" />
            </Pagination.Prev>

            <div className="bg-light text-dark pt-2 px-3 py-1 rounded text-center">Page {tempPage}</div>

            <Pagination.Next className="shadow" disabled={itemLength < itemsPerPage} onClick={handleNext}>
              <CsLineIcons icon="chevron-right" />
            </Pagination.Next>
          </Pagination>
        </div>
      )}
    </>
  );
}

export default SearchResult;
