import React, { useEffect, useState } from 'react';
import { gql, useMutation, useQuery, useLazyQuery } from '@apollo/client';
import { GET_SITE_LOGO } from 'layout/nav/NavLogo';

function GetData() {
  const [getimage, setGetimage] = useState(null);

  const [GetAds, { data }] = useLazyQuery(GET_SITE_LOGO, {
    onError: (err) => {
      console.log('GET_SITE_LOGO', err);
    },
  });

  useEffect(() => {
    GetAds({
      variables: {
        key: 'navlogo',
      },
    });
  }, [GetAds]);

  useEffect(() => {
    if (data && data.getAds) {
      setGetimage(data.getAds.images);
    }
  }, [data]);

  return { getimage };
}

export default GetData;
