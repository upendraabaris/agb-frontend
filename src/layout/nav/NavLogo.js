import React, { useEffect, useState } from 'react';
import { gql, useMutation, useQuery, useLazyQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { DEFAULT_PATHS } from 'config.js';

export const GET_SITE_LOGO = gql`
  query GetAds($key: String!) {
    getAds(key: $key) {
      images
    }
  }
`;

const GET_STORE_FEATURE = gql`
  query GetStoreFeature {
    getStoreFeature {
      storeName
    }
  }
`;

const NavLogo = () => {
  const [navlogoImage, setNavlogoImage] = useState(null);
  const [faviconImage, setFaviconImage] = useState(null);

  const [GetAds, { data: navlogoData }] = useLazyQuery(GET_SITE_LOGO, {
    onError: (err) => {
      console.log('GET_SITE_LOGO', err);
    },
  });

  const [GetFavicon, { data: faviconData }] = useLazyQuery(GET_SITE_LOGO, {
    onError: (err) => {
      console.log('GET_SITE_FAVICON', err);
    },
  });

  useEffect(() => {
    GetAds({
      variables: {
        key: 'navlogo',
      },
    });
    GetFavicon({
      variables: {
        key: 'favicon',
      },
    });
  }, []);

  useEffect(() => {
    if (navlogoData && navlogoData.getAds) {
      setNavlogoImage(navlogoData.getAds.images);
    }
  }, [navlogoData]);

  useEffect(() => {
    if (faviconData && faviconData.getAds) {
      setFaviconImage(faviconData.getAds.images);
    }
  }, [faviconData]);

  useEffect(() => {
    if (!faviconImage) return;

    const resources = [
      { tag: 'link', attributes: { rel: 'apple-touch-icon-precomposed', sizes: '152x152', href: faviconImage } },
      { tag: 'link', attributes: { rel: 'icon', type: 'image/png', href: faviconImage, sizes: '196x196' } },
      { tag: 'meta', attributes: { name: 'application-name', content: '&nbsp;' } },
      { tag: 'meta', attributes: { name: 'msapplication-TileColor', content: '#FFFFFF' } },
      { tag: 'meta', attributes: { name: 'msapplication-TileImage', content: faviconImage } },
      { tag: 'meta', attributes: { name: 'msapplication-square70x70logo', content: faviconImage } },
      { tag: 'meta', attributes: { name: 'msapplication-square150x150logo', content: faviconImage } },
      { tag: 'meta', attributes: { name: 'msapplication-wide310x150logo', content: faviconImage } },
      { tag: 'meta', attributes: { name: 'msapplication-square310x310logo', content: faviconImage } },
    ];

    resources.forEach((resource) => {
      const element = document.createElement(resource.tag);
      Object.keys(resource.attributes).forEach((key) => element.setAttribute(key, resource.attributes[key]));
      document.head.appendChild(element);
    });
  }, [faviconImage]);

  const { loading, error, data: storeFeatureData } = useQuery(GET_STORE_FEATURE);
  let storeName = '';
  if (storeFeatureData && storeFeatureData.getStoreFeature) {
    storeName = storeFeatureData.getStoreFeature.storeName;
  }

  return (
    // <div className="logo position-relative">
    //   {navlogoImage && (
    //     <Link to={DEFAULT_PATHS.APP} className="w-100 ps-2">
    //       <img src={navlogoImage} alt={storeName} className="rounded" />
    //     </Link>
    //   )}
    // </div>
    <div className="logo position-relative" style={{ maxWidth: '150px' }}>
      {navlogoImage && (
        <Link to={DEFAULT_PATHS.APP} className="w-100 ps-2">
          <img src={navlogoImage} alt={storeName} className="img-fluid" style={{ maxHeight: '60px', objectFit: 'contain' }} />
        </Link>
      )}
    </div>
  );
};

export default React.memo(NavLogo);
