import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { NavLink, useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useWindowSize } from 'hooks/useWindowSize';
import { toast } from 'react-toastify';
import { Row, Col, Button, Dropdown, Card, Modal, Tooltip, OverlayTrigger } from 'react-bootstrap';
import 'bootstrap/js/dist/carousel';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import CategoryMenuContent from './components/CategoryMenuContent';
import CategoryMenuMobileScreen from './components/CategoryMenuMobileScreen';
import './style.css';
import DiscountBadge from '../home/DiscountBadge';
import PriceComponent from '../home/PriceComponent';
import TMTDiscountBadge from '../home/TMTDiscountBadge';
import TMTPriceComponent from '../home/TMTPriceComponent';
import TMTSectionFalseDiscount from '../home/TMTSectionFalseDiscount';
import FilterMenuContent from './components/FilterMenuContent';

const GET_SUBCATEGORIESBYNAME = gql`
  query GetCategoryByName($name: String!) {
    getCategoryByName(name: $name) {
      id
      name
      description
      sliderImage
      image
      order
      parent {
        id
        name
        description
        sliderImage
        image
        order
        parent {
          id
          name
          description
          sliderImage
          image
          order
          parent {
            id
            name
            description
            sliderImage
            image
            order
          }
        }
      }
      children {
        id
        name
        description
        sliderImage
        image
        order
        children {
          id
          name
          description
          sliderImage
          image
          order
        }
      }
    }
  }
`;

export const GETPRODUCTBYCATEGORYNAME = gql`
  query GetProductByCat($categoryName: String, $sortBy: String, $discountPercentage: Float, $minPrice: Float, $maxPrice: Float) {
    getProductByCat(category_name: $categoryName, sortBy: $sortBy, discountPercentage: $discountPercentage, minPrice: $minPrice, maxPrice: $maxPrice) {
      identifier
      id
      brand_name
      categories
      images
      previewName
      fullName
      thumbnail
      variant {
        variantName
        active
        hsn
        silent_features
        moq
        allPincode
        minimunQty
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
      }
    }
  }
`;

export const SERIES_PRODUCT_BY_CATEGORY_NAME = gql`
  query GetSeriesProductByCat($categoryName: String, $sortBy: String, $discountPercentage: Float, $minPrice: Float, $maxPrice: Float) {
    getSeriesProductByCat(category_name: $categoryName, sortBy: $sortBy, discountPercentage: $discountPercentage, minPrice: $minPrice, maxPrice: $maxPrice) {
      id
      brand_name
      previewName
      fullName
      thumbnail
      identifier
      images
      seriesvariant {
        serieslocation {
          price
        }
      }
    }
  }
`;

export const GETTMTBYCATEGORYNAME = gql`
  query GetTMTSeriesProductByCat($maxPrice: Float, $minPrice: Float, $discountPercentage: Float, $sortBy: String, $categoryName: String) {
    getTMTSeriesProductByCat(maxPrice: $maxPrice, minPrice: $minPrice, discountPercentage: $discountPercentage, sortBy: $sortBy, category_name: $categoryName) {
      id
      brand_name
      fullName
      identifier
      images
      previewName
      thumbnail
      section
      brandCompareCategory
      tmtseriesvariant {
        id
        allPincode
        variantName
        active
        hsn
        silent_features
        moq
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
      }
    }
  }
`;

export const GETSUPERSELLERBYCATEGORYNAME = gql`
  query GetSuperSellerProductByCat($categoryName: String, $sortBy: String, $discountPercentage: Float, $minPrice: Float, $maxPrice: Float) {
    getSuperSellerProductByCat(
      category_name: $categoryName
      sortBy: $sortBy
      discountPercentage: $discountPercentage
      minPrice: $minPrice
      maxPrice: $maxPrice
    ) {
      brand_name
      seriesType
      id
      superSellerId
      approve
      previewName
      fullName
      identifier
      thumbnail
      images
      active
      catalogue
      supervariant {
        id
        variantName
        status
        superlocation {
          id
          price
        }
      }
    }
  }
`;

// Default ads query
const GET_ALL_DEFAULT_ADS = gql`
  query GetAllDefaultAds {
    getAllDefaultAds {
      id
      ad_type
      slot_position
      slot_name
      mobile_image_url
      desktop_image_url
      redirect_url
      title
      is_active
    }
  }
`;

export const GET_APPROVED_ADS_BY_CATEGORY = gql`
  query GetApprovedAdsByCategory($categoryName: String) {
    getApprovedAdsByCategory(categoryName: $categoryName) {
      id
      sellerName
      sellerEmail
      categoryId
      categoryName
      medias {
        id
        slot
        media_type
        mobile_image_url
        desktop_image_url
        redirect_url
      }
      durations {
        id
        slot
        duration_days
        start_date
        end_date
        status
      }
      createdAt
    }
  }
`;

function getSortLabel(sortBy) {
  switch (sortBy) {
    case 'asc':
      return 'A to Z';
    case 'desc':
      return 'Z to A';
    case '':
    default:
      return 'Default';
  }
}

const getMultipleRandom = (arr, num) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
};

const SubcategoryL2 = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const { dataStoreFeatures1 } = useGlobleContext();
  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);

  const [title, setTitle] = useState('Category');
  const [category, setcategories] = useState([]);
  const description = 'Subcategory2 Page';

  const setCategory = useCallback(async (categorydetail) => {
    if (categorydetail) {
      setcategories([categorydetail.name]);
      if (categorydetail?.parent) {
        const { parent } = categorydetail;
        await setcategories((prev) => [parent.name, ...prev]);
        if (parent.parent) {
          await setcategories((prev) => [parent.parent.name, ...prev]);
          if (parent.parent.parent) {
            await setcategories((prev) => [parent.parent.parent.name, ...prev]);
          }
        }
      }
    }
  }, []);
  
  // Get Category List
  const [GetCategoryByName, { data }] = useLazyQuery(
    GET_SUBCATEGORIESBYNAME,
    { variables: { name: params.categoryname.replace(/_/g, ' ') } },
    {
      onCompleted: (result) => {
        setTitle(result.getCategoryByName.name); 
      },
      onError(error) {
        toast.error(error.message || 'Something went wrong!');
        console.error('GET_SUBCATEGORIESBYNAME', error);
      },
    }
  );
  const [getCategorySliderImage, { data: categorySliderImageData }] = useLazyQuery(GET_SUBCATEGORIESBYNAME);
  useEffect(() => {
    if (params) {
      GetCategoryByName();
      getCategorySliderImage({ variables: { name: params.categoryname.replace(/_/g, ' ') } });
    }
  }, [GetCategoryByName, getCategorySliderImage, params]);

  useEffect(() => {
    if (data && data.getCategoryByName) {
      setCategory(data.getCategoryByName);
      setCategory(data.getCategorySliderImage);
    }
  }, [data, setCategory]);

  const [products, setProducts] = useState([]);

  const productsFilterValue = {
    categoryName: params.categoryname.replace(/_/g, ' '),
    sortBy: '',
    discountPercentage: '',
    minPrice: '',
    maxPrice: '',
  };

  const [productFilters, setProductFilters] = useState(productsFilterValue);
  const [GetProductByCategoryName, { data: dataProd, loading }] = useLazyQuery(GETPRODUCTBYCATEGORYNAME, {
    variables: {
      categoryName: params.categoryname.replace(/_/g, ' '),
    },
    onCompleted(res) {
      // const randomProducts = getMultipleRandom(res?.getProductByCat, 8);
      setProducts(res?.getProductByCat);
    },

    onError(error) {
      toast.error(error.message || 'Something went wrong!');
    },
  });
  useEffect(() => {
    GetProductByCategoryName();
  }, [GetProductByCategoryName, params]);

  const [seriesProducts, setSeriesProducts] = useState([]);
  const [GetSeriesProductByCategoryName, { data: dataSeriesProd, loading: loadingseries }] = useLazyQuery(SERIES_PRODUCT_BY_CATEGORY_NAME, {
    variables: { categoryName: params.categoryname.replace(/_/g, ' ') },
    onCompleted(res) {
      // const randomProducts = getMultipleRandom(res?.getSeriesProductByCat, 8);
      setSeriesProducts(res?.getSeriesProductByCat);
    },
    onError(error) {
      toast.error(error.message || 'Something went wrong!');
      console.error('SERIES_PRODUCT_BY_CATEGORY_NAME', error);
    },
  });
  useEffect(() => {
    GetSeriesProductByCategoryName();
    // eslint-disable-next-line
  }, [params]);

  // TMT BY CATEGORY NAME
  const [tmtSeriesProducts, setTmtSeriesProducts] = useState([]);
  const [GetTMTByCategoryName, { data: dataTMTProd, loading: loadingtmt }] = useLazyQuery(GETTMTBYCATEGORYNAME, {
    variables: { categoryName: params.categoryname.replace(/_/g, ' ') },
    onCompleted(res) {
      setTmtSeriesProducts(res?.getTMTSeriesProductByCat);
    },
    onError(error) {
      toast.error(error.message || 'Something went wrong!');
      console.error('GET_TMT_BY_CATEGORY_NAME', error);
    },
  });
  useEffect(() => {
    GetTMTByCategoryName();
    // eslint-disable-next-line
  }, [params]);

  // SUPER SELLER PRODUCTS BY CATEGORY
  const [superSellerProducts, setSuperSellerProducts] = useState([]);
  const [getSuperSellerByCategory, { data: dataSuperSeller, loading: loadingSuperSeller }] = useLazyQuery(GETSUPERSELLERBYCATEGORYNAME, {
    variables: { categoryName: params.categoryname.replace(/_/g, ' ') },
    onCompleted(res) {
      setSuperSellerProducts(res?.getSuperSellerProductByCat || []);
    },
    onError(error) {
      toast.error(error.message || 'Something went wrong!');
      console.error('GET_SUPER_SELLER_BY_CATEGORY_NAME', error);
    },
  });

  useEffect(() => {
    getSuperSellerByCategory();
    // eslint-disable-next-line
  }, [params]);

  // APPROVED ADS BY CATEGORY
  const [approvedAds, setApprovedAds] = useState([]);
  const [getApprovedAds, { data: dataApprovedAds, loading: loadingAds }] = useLazyQuery(GET_APPROVED_ADS_BY_CATEGORY, {
    onCompleted(res) {
      console.log('[GET_APPROVED_ADS_BY_CATEGORY] response:', res);
      setApprovedAds(res?.getApprovedAdsByCategory || []);
    },
    onError(error) {
      toast.error(error.message || 'Something went wrong!');
      console.error('GET_APPROVED_ADS_BY_CATEGORY', error);
    },
  });

  // DEFAULT ADS
  const [defaultAds, setDefaultAds] = useState([]);
  const [defaultAdsLoaded, setDefaultAdsLoaded] = useState(false);
  const [getDefaultAds] = useLazyQuery(GET_ALL_DEFAULT_ADS, {
    fetchPolicy: 'network-only',
    onCompleted(res) {
      console.log('[GET_ALL_DEFAULT_ADS] response:', res);
      setDefaultAds((res?.getAllDefaultAds || []).filter(ad => ad.is_active));
      setDefaultAdsLoaded(true);
    },
    onError(error) {
      console.error('GET_ALL_DEFAULT_ADS', error);
      setDefaultAdsLoaded(true); // Mark loaded even on error so UI doesn't wait forever
    },
  });

  // Fetch default ads on mount
  useEffect(() => {
    getDefaultAds();
    // eslint-disable-next-line
  }, []);

  // Prepare stamp ads (flatten all medias with slot containing 'stamp')
  const stampAds = useMemo(() => {
    // Build paid stamp ads indexed by slot position
    const paidStamps = {};
    if (approvedAds && approvedAds.length > 0) {
      approvedAds.forEach((ad) => {
        (ad.medias || []).forEach((m) => {
          if (m.slot && m.slot.toLowerCase().includes('stamp')) {
            paidStamps[m.slot] = { ...m, ad, source: 'paid' };
          }
        });
      });
    }
    // Fill all 4 stamp slots: paid first, then default fallback
    const result = [];
    [1, 2, 3, 4].forEach(pos => {
      const slotName = `stamp_${pos}`;
      if (paidStamps[slotName]) {
        result.push(paidStamps[slotName]);
      } else {
        const fallback = defaultAds.find(d => d.ad_type === 'stamp' && d.slot_position === pos);
        if (fallback) {
          result.push({
            slot: slotName,
            mobile_image_url: fallback.mobile_image_url,
            desktop_image_url: fallback.desktop_image_url,
            redirect_url: fallback.redirect_url || '',
            ad: { id: fallback.id, sellerName: fallback.title || 'Default Ad' },
            source: 'default',
          });
        }
      }
    });
    return result;
  }, [approvedAds, defaultAds]);

  // Prepare banner ads (flatten all medias with slot containing 'banner')
  const bannerAds = useMemo(() => {
    // Build paid banner ads indexed by slot position
    const paidBanners = {};
    if (approvedAds && approvedAds.length > 0) {
      approvedAds.forEach((ad) => {
        (ad.medias || []).forEach((m) => {
          if (m.slot && m.slot.toLowerCase().includes('banner')) {
            paidBanners[m.slot] = { ...m, ad, source: 'paid' };
          }
        });
      });
    }
    // Fill all 4 banner slots: paid first, then default fallback
    const result = [];
    [1, 2, 3, 4].forEach(pos => {
      const slotName = `banner_${pos}`;
      if (paidBanners[slotName]) {
        result.push(paidBanners[slotName]);
      } else {
        const fallback = defaultAds.find(d => d.ad_type === 'banner' && d.slot_position === pos);
        if (fallback) {
          result.push({
            slot: slotName,
            mobile_image_url: fallback.mobile_image_url,
            desktop_image_url: fallback.desktop_image_url,
            redirect_url: fallback.redirect_url || '',
            ad: { id: fallback.id, sellerName: fallback.title || 'Default Ad' },
            source: 'default',
          });
        }
      }
    });
    return result;
  }, [approvedAds, defaultAds]);

    // Ensure Bootstrap carousel instances are initialized after ads render
    useEffect(() => {
      if (typeof window === 'undefined') return undefined;
      if (!defaultAdsLoaded) return undefined; // Wait for default ads to load before initializing carousel
      const bs = window.bootstrap;
      if (!bs) return undefined;

      const initCarousel = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        // make sure first item is active
        const items = el.querySelectorAll('.carousel-item');
        items.forEach((it, idx) => it.classList.toggle('active', idx === 0));
        try {
          // Dispose existing instance and re-create to avoid stale state
          const existing = bs.Carousel.getInstance(el);
          if (existing) existing.dispose();
          // eslint-disable-next-line no-new
          new bs.Carousel(el, { interval: 5000, ride: 'carousel' });
        } catch (e) {
          // ignore initialization errors
        }
      };

      if (bannerAds && bannerAds.length > 0) {
        // Small timeout to let React render the DOM before carousel init
        const timer = setTimeout(() => {
          initCarousel('approvedAdsCarousel');
          initCarousel('categoryTopAdsCarousel');
        }, 100);
        return () => clearTimeout(timer);
      }
      return undefined;
    }, [approvedAds, bannerAds, defaultAdsLoaded]);

  // When category data is available, fetch approved ads by categoryId
  useEffect(() => {
    const catName = params.categoryname.replace(/_/g, ' ');
    // Query backend by categoryName (server expects name-based matching)
    if (data && data.getCategoryByName) {
      const name = data.getCategoryByName.name || catName;
      getApprovedAds({ variables: { categoryName: name } });
      return;
    }

    // Fallback to params-based categoryName when category data isn't loaded yet
    if (catName) {
      getApprovedAds({ variables: { categoryName: catName } });
    }
    // eslint-disable-next-line
  }, [params, data, getApprovedAds]);

  const { themeValues } = useSelector((state) => state.settings);
  const lgBreakpoint = parseInt(themeValues.lg.replace('px', ''), 10);
  const { width } = useWindowSize();
  const [isLgScreen, setIsLgScreen] = useState(false);
  const [isOpenCategoryModal, setIsOpenCategoryModal] = useState(false);
  const [isOpenFiltersModal, setIsOpenFiltersModal] = useState(false);

  useEffect(() => {
    if (width) {
      if (width >= lgBreakpoint) {
        if (!isLgScreen) setIsLgScreen(true);
        if (isOpenCategoryModal) setIsOpenCategoryModal(false);
        if (isOpenFiltersModal) setIsOpenFiltersModal(false);
      } else if (isLgScreen) setIsLgScreen(false);
    }
    return () => {};
    // eslint-disable-next-line
  }, [width]);

  const handleSelect = async (sortBy) => {
    setProductFilters((prev) => ({
      ...prev,
      sortBy,
    }));

    await GetProductByCategoryName({
      variables: {
        ...productFilters,
        sortBy,
        minPrice: parseFloat(productFilters.minPrice),
        maxPrice: parseFloat(productFilters.maxPrice),
        discountPercentage: parseFloat(productFilters.discountPercentage),
      },
    });
    await GetSeriesProductByCategoryName({
      variables: {
        ...productFilters,
        sortBy,
        minPrice: parseFloat(productFilters.minPrice),
        maxPrice: parseFloat(productFilters.maxPrice),
        discountPercentage: parseFloat(productFilters.discountPercentage),
      },
    });
    await GetTMTByCategoryName({
      variables: {
        ...productFilters,
        sortBy,
        minPrice: parseFloat(productFilters.minPrice),
        maxPrice: parseFloat(productFilters.maxPrice),
        discountPercentage: parseFloat(productFilters.discountPercentage),
      },
    });
  };

  return (
    <>
      <HtmlHead title={params.categoryname.replaceAll('_', ' ').toUpperCase()} description={data?.getCategoryByName?.description} />
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
        .hover-border-color:hover {
          border: 1px solid ${dataStoreFeatures1?.getStoreFeature?.bgColor} !important;
          color: ${dataStoreFeatures1?.getStoreFeature?.bgColor} !important;
        }
        `}
        {`
        .hover-font-color:hover {          
          color: ${dataStoreFeatures1?.getStoreFeature?.bgColor} !important;
        }
        `}
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
      </style>

      <aside>
        {/* APPROVED ADS CAROUSEL - TOP OF CATEGORY PAGE */}
        {!loadingAds && defaultAdsLoaded && bannerAds && bannerAds.length > 0 && (
          <div id="categoryTopAdsCarousel" className="carousel slide mb-3 rounded border" data-bs-ride="carousel">
            <div className="carousel-inner rounded">
              {bannerAds.map((item, index) => {
                const adImage = width < 768 ? item.mobile_image_url : item.desktop_image_url;
                const adUrl = item.redirect_url;
                return (
                  <div 
                    key={`${item.ad?.id}-${item.slot}-${index}`} 
                    className={`carousel-item ${index === 0 ? 'active' : ''}`}
                  >
                    <a 
                      href={adUrl || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none', display: 'block' }}
                    >
                      <img
                        src={adImage}
                        alt={`Ad from ${item.ad?.sellerName}`}
                        className="d-block w-100 rounded"
                        style={{ objectFit: 'cover', height: '280px' }}
                      />
                      {item.source !== 'default' && (
                        <div className="carousel-caption d-none d-md-block">
                          <h4 className="text-white fw-bold">{item.ad?.sellerName}</h4>
                        </div>
                      )}
                    </a>
                  </div>
                );
              })}
            </div>
            {bannerAds.length > 1 && (
              <>
                <button 
                  className="carousel-control-prev" 
                  type="button" 
                  data-bs-target="#categoryTopAdsCarousel" 
                  data-bs-slide="prev"
                >
                  <span className="carousel-control-prev-icon" aria-hidden="true" />
                  <span className="visually-hidden">Previous</span>
                </button>
                <button 
                  className="carousel-control-next" 
                  type="button" 
                  data-bs-target="#categoryTopAdsCarousel" 
                  data-bs-slide="next"
                >
                  <span className="carousel-control-next-icon" aria-hidden="true" />
                  <span className="visually-hidden">Next</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* CATEGORY SLIDER IMAGE - FALLBACK WHEN NO BANNER ADS */}
        {!loadingAds && defaultAdsLoaded && (!bannerAds || bannerAds.length === 0) && categorySliderImageData?.getCategoryByName?.sliderImage && (
          <div className="container-fluid px-0 rounded border mb-3">
            {/* <img src={categorySliderImageData.getCategoryByName.sliderImage} className="d-block w-100 rounded" alt="Slider Image" /> */}
            <img src={categorySliderImageData.getCategoryByName.sliderImage} className="d-block w-100 rounded" alt="" />
          </div>
        )}
      </aside>

      <Row>
        <div className="col-12 pt-2 pb-2">
          <div className=" align-items-center">
            <NavLink to="/">
              <span className="ms-1 fw-bold font_black">Home</span>
            </NavLink>
            {category?.map((cat, index) => (
              <NavLink to={`/category/${cat.replace(/\s/g, '_').toLowerCase()}`} key={index} className="ps-2">
                <span className="me-1 text-black"> / </span>
                <span className="align-middle  ms-1 fw-bold font_black"> {cat}</span>
              </NavLink>
            ))}
          </div>
        </div>
        <div className="d-block d-md-none w-100 bg-white rounded mb-3">{data && <CategoryMenuMobileScreen subcatValue={data} />}</div>
        <Col xs="12" className="col-2 d-flex align-items-end justify-content-end mb-2 mb-sm-0 order-sm-3 rounded bg-white">
          <div className="d-flex justify-content-around">
            <Button className="btn-icon btn-icon-only ms-1 btn_color d-inline-block d-lg-none" onClick={() => setIsOpenFiltersModal(true)}>
              <CsLineIcons icon="filter" />
            </Button>
          </div>
          <Dropdown onSelect={handleSelect} className="ms-1 d-block d-md-none w-100" align="end">
            <Dropdown.Toggle className="w-100 w-md-auto btn_color">Sort By: {getSortLabel(productFilters.sortBy)}</Dropdown.Toggle>
            <Dropdown.Menu align="end" className="w-100 w-md-auto">
              <Dropdown.Item eventKey="">Default</Dropdown.Item>
              <Dropdown.Item eventKey="asc">A to Z</Dropdown.Item>
              <Dropdown.Item eventKey="desc">Z to A</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>
      <Row>
        {isLgScreen && (
          <Col lg="4" xl="3" className="d-none d-lg-block">
            <Card className="mb-1 mt-3">
              <Card.Body className="pb-2 p-3">
                <div className="fs-6 fw-bolder pb-2 mb-3 border-bottom font_black">Categories</div>
                {data && <CategoryMenuContent subcatValue={data} />}
              </Card.Body>
            </Card>

            <Card className="mb-1">
              <Card.Body className="p-3">
                <FilterMenuContent
                  GetSeriesProductByCategoryName={GetSeriesProductByCategoryName}
                  productFilters={productFilters}
                  GetProductByCategoryName={GetProductByCategoryName}
                  setProductFilters={setProductFilters}
                  GetTMTByCategoryName={GetTMTByCategoryName}
                />
              </Card.Body>
            </Card>
          </Col>
        )}
        <Col lg="8" xl="9" className="mt-3 bg-white pt-3 rounded">
          <div className="d-flex bg-white rounded border justify-content-between align-items-center">
            <h1 className="fw-bold ps-2 pt-2 fs-5 text-center w-100">
              <span className=" font_black">{params.categoryname.replaceAll('_', ' ').toUpperCase()}</span>
            </h1>
            <Dropdown onSelect={handleSelect} className="ms-1 d-none d-md-block" align="end">
              <Dropdown.Toggle className="w-100 w-md-auto btn_color">Sort By: {getSortLabel(productFilters.sortBy)}</Dropdown.Toggle>
              <Dropdown.Menu align="end" className="w-100 w-md-auto">
                <Dropdown.Item eventKey="">Default</Dropdown.Item>
                <Dropdown.Item eventKey="asc">A to Z</Dropdown.Item>
                <Dropdown.Item eventKey="desc">Z to A</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          
          
          
          {/* Old card-based ads code (commented out) */}
          {false && approvedAds && approvedAds.length > 0 && (
            <Row className="my-3 g-2 mx-0">
              <div className="w-100 mb-2">
                <h6 className="font_black fw-bold ps-2">Featured Offers</h6>
              </div>
              {approvedAds.map((ad) => (
                <Col key={ad.id} xs="12" sm="6" md="4" lg="3" className="mb-3">
                  <Card className="h-100 hover-border-color border overflow-hidden">
                    {ad.medias && ad.medias.length > 0 && (
                      <a 
                        href={ad.medias[0]?.redirect_url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none', display: 'block' }}
                      >
                        <img
                          src={ad.medias[0]?.mobile_image_url || ad.medias[0]?.desktop_image_url}
                          alt={`Ad from ${ad.sellerName}`}
                          className="card-img-top w-100"
                          style={{ objectFit: 'cover', height: isLgScreen ? '200px' : '140px' }}
                        />
                      </a>
                    )}
                    <Card.Body className="p-2">
                      <div className="small text-muted mb-1">
                        <OverlayTrigger
                          delay={{ show: 500, hide: 0 }}
                          placement="top"
                          overlay={<Tooltip id="tooltip-seller">{ad.sellerName}</Tooltip>}
                        >
                          <span className="text-truncate d-block">{ad.sellerName}</span>
                        </OverlayTrigger>
                      </div>
                      <div className="text-center mt-2">
                        <a 
                          href={ad.medias[0]?.redirect_url || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-sm btn_color"
                        >
                          View Offer
                        </a>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* eslint-disable-next-line no-nested-ternary */}
          {loading || loadingseries || loadingtmt ? (
            <Card className=" px-4 py-5 mb-3">
              <div className="text-center mx-2 my-4 d-flex flex-column align-items-center">
                <div>
                  Loading
                  <img
                    src="https://media4.giphy.com/media/zbffVPJSvkHvQ5zt09/giphy.gif?cid=6c09b952snqts8kdyw6hxvharka9b6j51y7vnxl3cvhxfh7t&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=s"
                    alt="Loading..."
                    className="loading-gif"
                    width="20"
                    height="20"
                  />
                </div>
              </div>
            </Card>
          ) : dataProd?.getProductByCat?.length > 0 ||
            dataSeriesProd?.getSeriesProductByCat?.length > 0 ||
            dataSuperSeller?.getSuperSellerProductByCat?.length > 0 ||
            dataTMTProd?.getTMTSeriesProductByCat?.length > 0 ? (
            <>
              <Row className="my-2 g-2 row-cols-2 row-cols-md-3 row-cols-xl-4 row-cols-xxl-7">
                {dataTMTProd?.getTMTSeriesProductByCat?.length > 0 &&
                  tmtSeriesProducts.map(
                    (items, index) =>
                      index < 8 &&
                      items.tmtseriesvariant?.length > 0 && (
                        <Col key={items.id} className="my-2">
                          <Card className="hover-border-color border ">
                            {items && items?.section ? <TMTDiscountBadge product={items} /> : <TMTSectionFalseDiscount product={items} />}
                            <Row className="g-0 border-bottom">
                              <img
                                src={items.thumbnail || (items.images && items.images[0])}
                                alt={items.previewName}
                                className="card-img-horizontal h-100 px-1 py-1"
                              />
                              <div>
                                {items?.brandCompareCategory && (
                                  <p
                                    style={{
                                      position: 'absolute',
                                      color: 'white',
                                      marginTop: '-24px',
                                      marginLeft: '0px',
                                      paddingBottom: '0px',
                                      fontSize: '14px',
                                      fontWeight: 'bold',
                                      borderTopRightRadius: '8px',
                                    }}
                                    className="px-1 pb-0 mx-1 mb-1 bg_color"
                                  >
                                    {' '}
                                    Compare Brands{' '}
                                  </p>
                                )}{' '}
                              </div>
                            </Row>
                            <Row>
                              <Card.Body className="text-center h-100 py-0 px-2 my-1 mx-1">
                                <div className="card-text mb-0 text-truncate mx-2 px-1 font_black">{items.brand_name}</div>
                                <div>
                                  <OverlayTrigger
                                    delay={{ show: 1000, hide: 0 }}
                                    placement="top"
                                    overlay={<Tooltip id="tooltip-top">{items.fullName}</Tooltip>}
                                  >
                                    <NavLink
                                      to={`/product/${items.identifier?.replace(/\s/g, '_').toLowerCase()}`}
                                      className=" stretched-link font_black fw-bold hover-font-color d-block my-1 mx-2 py-0 px-0 text-truncate"
                                    >
                                      {items.previewName}
                                    </NavLink>
                                  </OverlayTrigger>
                                </div>
                                <div>
                                  <div className=" text-truncate px-2 my-1 py-0 mx-1 px-1">
                                    {items && items?.section ? <TMTPriceComponent product={items} /> : <p className="d-inline">VIEW PRICE</p>}
                                  </div>
                                </div>
                              </Card.Body>
                            </Row>
                          </Card>
                        </Col>
                      )
                  )}
              </Row>
              {dataTMTProd?.getTMTSeriesProductByCat?.length > 8 && (
                <div className="d-flex justify-content-center mb-1 mt-2">
                  <NavLink to={`/category/${params.categoryname}/tmt/`} className="btn btn_color">
                    {' '}
                    View All
                  </NavLink>
                </div>
              )}
              <Row className="my-2 g-2 row-cols-2 row-cols-md-3 row-cols-xl-4 row-cols-xxl-7">
                {dataSeriesProd?.getSeriesProductByCat?.length > 0 &&
                  seriesProducts.map(
                    (items, index) =>
                      index < 8 &&
                      items.seriesvariant?.length > 0 && (
                        <Col key={items.id} className="my-2">
                          <Card className="hover-border-color border">
                            <Row className="g-0 border-bottom">
                              <img
                                src={items.thumbnail || (items.images && items.images[0])}
                                alt={items.previewName}
                                className="card-img-horizontal h-100 px-1 py-1"
                              />
                            </Row>
                            <Row>
                              <Card.Body className="text-center h-100 py-0 px-2 my-1 mx-1">
                                <div className="card-text mb-0 text-truncate mx-2 px-1 font_black fw-bold">
                                  {' '}
                                  {items.brand_name}
                                  {'  '}
                                </div>
                                <div>
                                  <OverlayTrigger
                                    delay={{ show: 1000, hide: 0 }}
                                    placement="top"
                                    overlay={<Tooltip id="tooltip-top">{items.fullName}</Tooltip>}
                                  >
                                    <NavLink
                                      style={{ fontWeight: 'bold' }}
                                      to={`/product/${items.identifier?.replace(/\s/g, '_').toLowerCase()}`}
                                      className="body-link stretched-link d-block my-1 mx-1 py-0 px-0 mt-0 text-truncate"
                                    >
                                      {items.previewName}
                                    </NavLink>
                                  </OverlayTrigger>
                                </div>
                                <div>
                                  <div className="d-inline card-text my-1 mx-1 py-1 px-1">
                                    <div className="d-inline" style={{ fontWeight: 'bold' }}>
                                      VIEW PRICE
                                    </div>
                                  </div>
                                </div>
                              </Card.Body>
                            </Row>
                          </Card>
                        </Col>
                      )
                  )}
              </Row>
              {dataSeriesProd?.getSeriesProductByCat?.length > 8 && (
                <div className="d-flex justify-content-center mb-1 mt-2">
                  <NavLink to={`/category/${params.categoryname}/series/`} className="btn btn_color">
                    {' '}
                    View All
                  </NavLink>
                </div>
              )}
              <Row className="my-2 g-2 row-cols-2 row-cols-md-3 row-cols-xl-4 row-cols-xxl-7">
                {dataSuperSeller?.getSuperSellerProductByCat?.length > 0 &&
                  superSellerProducts.map(
                    (items, index) =>
                      index < 8 &&
                      items.supervariant?.length > 0 && (
                        <Col key={items.id} className="my-2">
                          <Card className="hover-border-color border">
                            <Row className="g-0 border-bottom">
                              <img
                                src={items.thumbnail || (items.images && items.images[0])}
                                alt={items.previewName}
                                className="card-img-horizontal h-100 px-1 py-1"
                              />
                              <div>
                                <p
                                  style={{
                                    position: 'absolute',
                                    color: 'white',
                                    marginTop: '-24px',
                                    marginLeft: '0px',
                                    paddingBottom: '0px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    borderTopRightRadius: '8px',
                                  }}
                                  className="px-1 pb-0 mx-1 mb-1 bg_color"
                                >
                                  {' '}
                                  Product Offered by Company{' '}
                                </p>{' '}
                              </div>
                            </Row>
                            <Row>
                              <Card.Body className="text-center h-100 py-0 px-2 my-1 mx-1">
                                <div className="card-text mb-0 text-truncate mx-2 px-1 font_black fw-bold">
                                  {' '}
                                  {items.brand_name}
                                  {'  '}
                                </div>
                                <div>
                                  <OverlayTrigger
                                    delay={{ show: 1000, hide: 0 }}
                                    placement="top"
                                    overlay={<Tooltip id="tooltip-top">{items.fullName}</Tooltip>}
                                  >
                                    <NavLink
                                      style={{ fontWeight: 'bold' }}
                                      to={`/product/${items.identifier?.replace(/\s/g, '_').toLowerCase()}`}
                                      className="body-link stretched-link d-block my-1 mx-1 py-0 px-0 mt-0 text-truncate"
                                    >
                                      {items.previewName}
                                    </NavLink>
                                  </OverlayTrigger>
                                </div>
                                <div>
                                  <div className="d-inline card-text my-1 mx-1 py-1 px-1">
                                    <div className="d-inline" style={{ fontWeight: 'bold' }}>
                                      VIEW PRICE
                                    </div>
                                  </div>
                                </div>
                              </Card.Body>
                            </Row>
                          </Card>
                        </Col>
                      )
                  )}
              </Row>
              {dataSuperSeller?.getSuperSellerProductByCat?.length > 8 && (
                <div className="d-flex justify-content-center mb-1 mt-2">
                  <NavLink to={`/category/${params.categoryname}/series/`} className="btn btn_color">
                    {' '}
                    View All
                  </NavLink>
                </div>
              )}
              <Row className="mb-2 g-2 row-cols-2 row-cols-md-3 row-cols-xl-4 row-cols-xxl-7">
                {dataProd?.getProductByCat?.length > 0 &&
                  products.map(
                    (items, index) =>
                      index < 20 && (
                        <Col key={items.id} className="my-2">
                          <Card className="hover-border-color border">
                            <DiscountBadge variant={items.variant[0]} name={items.previewName} />
                            <Row className="g-0 border-bottom">
                              <img
                                src={items.thumbnail || (items.images && items.images[0])}
                                alt={items.previewName}
                                className="card-img-horizontal h-100 px-1 py-1"
                              />
                            </Row>
                            <Row>
                              <Card.Body className="text-center h-100 py-0 px-2 my-1 mx-1">
                                <div className="card-text mb-0 text-truncate mx-2 px-1 font_black fw-bold fw-bold">{items.brand_name}</div>
                                <div>
                                  <OverlayTrigger
                                    delay={{ show: 1000, hide: 0 }}
                                    placement="top"
                                    overlay={<Tooltip id="tooltip-top">{items.fullName}</Tooltip>}
                                  >
                                    <NavLink
                                      style={{ fontWeight: 'bold' }}
                                      to={`/product/${items.identifier?.replace(/\s/g, '_').toLowerCase()}`}
                                      className=" stretched-link font_black hover-font-color d-block my-1 mx-2 py-0 px-0 text-truncate"
                                    >
                                      {items.previewName}
                                    </NavLink>
                                  </OverlayTrigger>
                                </div>
                                <div>
                                  {items.variant?.length > 0 && (
                                    <div className="card-text text-center my-1 mx-2 py-0 px-0 text-truncate">
                                      <PriceComponent variant={items.variant[0]} name={items.previewName} />
                                    </div>
                                  )}
                                </div>
                              </Card.Body>
                            </Row>
                          </Card>
                        </Col>
                      )
                  )}
              </Row>
              {dataProd?.getProductByCat?.length > 20 && (
                <div className="d-flex justify-content-center mb-1 mt-2">
                  <NavLink to={`/category/${params.categoryname}/single/`} className="btn btn_color">
                    {' '}
                    View All
                  </NavLink>
                </div>
              )}
            </>
          ) : (
            <Card className="border px-4 py-5 mb-3 mt-1">
              <img src="/img/logo/error_not_found.svg" alt="No Products Available" className="w-4 h-4 mx-auto mb-3" width="120px;" />
              <h3 className="text-center mx-2 my-4 fw-bold">Sorry, no products are available in this category.</h3>
            </Card>
          )}
        </Col>
      </Row>

      {/* STAMP ADS SLOT (replaces old advertisement cards) */}
      <aside>
        <Row className="g-4 mt-2 mark pb-4">
          {stampAds && stampAds.length > 0 ? (
            stampAds.slice(0, 4).map((item, index) => {
              const img = width < 768 ? item.mobile_image_url || item.desktop_image_url : item.desktop_image_url || item.mobile_image_url;
              const url = item.redirect_url;
              return (
                <Col sm="6" lg="3" key={`${item.ad?.id}-${item.slot}-${index}`}>
                  <Card className="w-100 hover-img-scale-up">
                    <a href={url || '#'} target="_blank" rel="noopener noreferrer">
                      <img src={img || '/img/advertisement/c1.jpeg'} className="img-fluid img_1 scale" alt="stamp ad"/>
                    </a>
                  </Card>
                </Col>
              );
            })
          ) : (
            <>
              <Col sm="6" lg="3">
                <Card className="w-100  hover-img-scale-up">
                  <a href="https://www.apnagharmart.com/">
                    <img src="/img/advertisement/c1.jpeg" className="img-fluid img_1 h-100 scale" alt="card image" />
                  </a>
                </Card>
              </Col>
              <Col sm="6" lg="3">
                <Card className="w-100 hover-img-scale-up">
                  <a href="https://apnagharbanao.in/category/sanitary_items">
                    <img src="/img/advertisement/c2.jpg" className="img-fluid  img_1 h-100 scale" alt="card image" />
                  </a>
                </Card>
              </Col>
              <Col sm="6" lg="3">
                <Card className="w-100 hover-img-scale-up">
                  <a href="https://www.apnagharmart.com">
                    <img src="/img/advertisement/c3.jpg" className="img-fluid img_1 h-100 scale" alt="card image" />
                  </a>
                </Card>
              </Col>
              <Col sm="6" lg="3">
                <Card className="w-100  hover-img-scale-up">
                  <a href="/contact_us">
                    <img src="/img/advertisement/c4.jpg" className="img-fluid  img_1 h-100 scale" alt="card image" />
                  </a>
                </Card>
              </Col>
            </>
          )}
        </Row>
      </aside>

      {/* ADVERTISEMENT SLOT  END */}
      {/* Category Modal Start */}
      {!isLgScreen && (
        <Modal className="modal-left" show={isOpenCategoryModal} onHide={() => setIsOpenCategoryModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title as="h5" className="fw-bold text_black fs-6">
              Category
            </Modal.Title>
          </Modal.Header>
          <Modal.Body onClick={() => setIsOpenCategoryModal(false)}>{data && <CategoryMenuContent subcatValue={data} />}</Modal.Body>
        </Modal>
      )}
      {/* Category Modal End */}

      {/* Filters Modal Start */}
      {!isLgScreen && (
        <Modal className="modal-left" show={isOpenFiltersModal} onHide={() => setIsOpenFiltersModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title as="h5" className="fw-bold text_black fs-6">
              Filters
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FilterMenuContent
              setIsOpenFiltersModal={setIsOpenFiltersModal}
              productFilters={productFilters}
              GetProductByCategoryName={GetProductByCategoryName}
              setProductFilters={setProductFilters}
              GetSeriesProductByCategoryName={GetSeriesProductByCategoryName}
              GetTMTByCategoryName={GetTMTByCategoryName}
            />
          </Modal.Body>
        </Modal>
      )}
      {/* Filters Modal End */}
 

      <div className="p-3 mt-4 shadow-lg bg-white rounded">
        <h2 className="fw-bold text-dark border-bottom pb-2 mb-3 fs-6">{params.categoryname.replaceAll('_', ' ').toUpperCase()}</h2>
        <ul className="list-unstyled text-dark m-0">
          <li className="mb-2">            
            {data?.getCategoryByName?.description || 'No description available'}
          </li>
        </ul>
      </div> 
    </>
  );
};

export default SubcategoryL2;
