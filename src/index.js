// ======================================================================
// APPLICATION ENTRY POINT
// ----------------------------------------------------------------------
// This file bootstraps the complete React application.
// Responsibilities:
//  - Initialize Apollo Client (HTTP + Upload + WebSocket)
//  - Configure authentication headers
//  - Setup Redux & Persisted state
//  - Register global providers (Cart, Theme, Language, OAuth)
//  - Configure routing & layout handling
// ======================================================================

// ======================================================================
// CORE REACT IMPORTS
// ======================================================================
import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from 'reportWebVitals.js';

// ======================================================================
// APOLLO CLIENT SETUP (GraphQL)
// ======================================================================
import { createUploadLink } from 'apollo-upload-client';
import { ApolloClient, split, InMemoryCache, ApolloProvider, ApolloLink, Observable } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { onError } from '@apollo/client/link/error';
import { fromPromise } from '@apollo/client/link/utils';

// ======================================================================
// REDUX STATE MANAGEMENT
// ======================================================================
import { Provider } from 'react-redux';
import { PersistGate } from 'reduxjs-toolkit-persist/integration/react';
import { store, persistedStore } from 'store.js';
import { logoutUser } from 'auth/authSlice';

// ======================================================================
// HTML HEAD MANAGEMENT (SEO / META TAGS)
// ======================================================================
import { Helmet } from 'react-helmet';
import { REACT_HELMET_PROPS } from 'config.js';

// ======================================================================
// GOOGLE AUTH (OAuth)
// ======================================================================
import { GoogleOAuthProvider } from '@react-oauth/google';

// ======================================================================
// MULTI-LANGUAGE SUPPORT
// ======================================================================
import LangProvider from 'lang/LangProvider';

// ======================================================================
// ROUTING
// ======================================================================
import { BrowserRouter as Router } from 'react-router-dom';
import RouteIdentifier from 'routing/components/RouteIdentifier';
import Loading from 'components/loading/Loading';

// ======================================================================
// ROUTE DEFINITIONS
// ======================================================================
import { getLayoutlessRoutes } from 'routing/helper';
import defaultRoutes from 'routing/default-routes';
import routesAndMenuItems from 'routes.js';

// ======================================================================
// TOAST NOTIFICATIONS
// ======================================================================
import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ======================================================================
// APPLICATION CONTEXT PROVIDERS
// ======================================================================
import { CartProvider } from 'context/cartItems/CartContext';
import { AppProvider } from 'context/styleColor/ColorContext';

const ACCESS_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';

const VERIFY_ACCESS_TOKEN_QUERY = `
  query VerifyAccessToken($token: String) {
    verifyAccessToken(token: $token)
  }
`;

const REFRESH_ACCESS_TOKEN_MUTATION = `
  mutation RefreshAccessToken($refreshToken: String!) {
    refreshAccessToken(refreshToken: $refreshToken) {
      token
      refreshToken
      user {
        id
      }
    }
  }
`;

const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

const decodeTokenPayload = (token) => {
  if (!token) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
};

const isTokenExpired = (token) => {
  const payload = decodeTokenPayload(token);
  if (!payload || typeof payload.exp !== 'number') {
    return false;
  }

  return Date.now() >= payload.exp * 1000;
};

const setTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

const hasInvalidSignature = (errors = []) =>
  errors.some(
    (error) =>
      error?.extensions?.code === 'INTERNAL_SERVER_ERROR' &&
      Array.isArray(error?.extensions?.stacktrace) &&
      error.extensions.stacktrace.some((line) => line.includes('Error: invalid signature'))
  );

const fetchGraphQL = async (query, variables) => {
  const response = await fetch(process.env.REACT_APP_SERVER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  return response.json();
};

const verifyAccessToken = async (token) => {
  if (!token) {
    return true;
  }

  try {
    const json = await fetchGraphQL(VERIFY_ACCESS_TOKEN_QUERY, { token });
    return Boolean(json?.data?.verifyAccessToken);
  } catch (error) {
    return true;
  }
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    return { shouldLogout: false };
  }

  const json = await fetchGraphQL(REFRESH_ACCESS_TOKEN_MUTATION, { refreshToken });

  if (json?.errors?.length) {
    return { shouldLogout: hasInvalidSignature(json.errors) };
  }

  const payload = json?.data?.refreshAccessToken;
  if (payload?.token) {
    setTokens(payload.token, payload.refreshToken);
    return { token: payload.token, refreshToken: payload.refreshToken };
  }

  return { shouldLogout: false };
};

const isUnauthorizedError = (graphQLErrors, networkError) => {
  if (networkError && networkError.statusCode === 401) {
    return true;
  }

  return (graphQLErrors || []).some(
    (error) => error?.extensions?.code === 'UNAUTHENTICATED' || /unauthorized/i.test(error?.message || '')
  );
};

let refreshPromise = null;
const refreshTokens = async (refreshToken) => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken(refreshToken);
  }

  const result = await refreshPromise;
  refreshPromise = null;
  return result;
};

const authLink = setContext(async (operation, { headers }) => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  let tokenToUse = accessToken;

  if (accessToken && isTokenExpired(accessToken)) {
    if (!refreshToken) {
      store.dispatch(logoutUser());
      tokenToUse = null;
    } else {
      const refreshResult = await refreshTokens(refreshToken);
      if (refreshResult?.shouldLogout) {
        store.dispatch(logoutUser());
        tokenToUse = null;
      } else if (refreshResult?.token) {
        tokenToUse = refreshResult.token;
      }
    }
  }

  return {
    headers: {
      ...headers,
      authorization: tokenToUse ? `Bearer ${tokenToUse}` : '',
      // Required for file upload preflight handling
      'apollo-require-preflight': 'true',
    },
  };
});

// ======================================================================
// APOLLO HTTP UPLOAD LINK
// ======================================================================
const uploadLink = createUploadLink({
  uri: process.env.REACT_APP_SERVER_URL,
});

// ======================================================================
// APOLLO WEBSOCKET LINK (SUBSCRIPTIONS)
// ======================================================================
const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.REACT_APP_SUBSCRIPTION_URL,
  })
);

// ======================================================================
// LINK SPLITTING (HTTP vs WEBSOCKET)
// ======================================================================
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  uploadLink
);

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (!isUnauthorizedError(graphQLErrors, networkError)) {
    return undefined;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return Observable.of();
  }

  return fromPromise(refreshTokens(refreshToken)).flatMap((result) => {
    if (result?.shouldLogout) {
      store.dispatch(logoutUser());
      return Observable.of();
    }

    if (result?.token) {
      operation.setContext(({ headers = {} }) => ({
        headers: {
          ...headers,
          authorization: `Bearer ${result.token}`,
        },
      }));
      return forward(operation);
    }

    return Observable.of();
  });
});

// ======================================================================
// APOLLO CLIENT INSTANCE
// ======================================================================
const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, splitLink]),
  cache: new InMemoryCache(),
});

// ======================================================================
// MAIN APPLICATION COMPONENT
// ======================================================================
const Main = () => {
  // Memoized layoutless routes to avoid unnecessary recalculations
  const layoutlessRoutes = useMemo(() => getLayoutlessRoutes({ data: routesAndMenuItems }), []);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <CartProvider>
          <ApolloProvider client={client}>
            <AppProvider>
              <PersistGate loading={null} persistor={persistedStore}>
                <Helmet {...REACT_HELMET_PROPS} />
                <ToastContainer transition={Slide} newestOnTop autoClose={2000} />
                <Router basename={process.env.REACT_APP_BASENAME}>
                  <LangProvider>
                    <RouteIdentifier routes={[...layoutlessRoutes, ...defaultRoutes]} fallback={<Loading />} />
                  </LangProvider>
                </Router>
              </PersistGate>
            </AppProvider>
          </ApolloProvider>
        </CartProvider>
      </Provider>
    </GoogleOAuthProvider>
  );
};

// ======================================================================
// APPLICATION BOOTSTRAP
// ======================================================================
ReactDOM.render(<Main />, document.getElementById('root'));

// ======================================================================
// PERFORMANCE MONITORING
// ----------------------------------------------------------------------
// Can be hooked to analytics or logging services
// ======================================================================
reportWebVitals();
