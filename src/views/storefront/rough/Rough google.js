import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
// eslint-disable-next-line import/no-extraneous-dependencies
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

function Rough() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => console.log('Login Failed:', error),
  });

  const logOut = () => {
    googleLogout();
    setProfile(null);
  };

  useEffect(() => {
    if (user) {
      axios
        .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            Accept: 'application/json',
          },
        })
        .then((res) => {
          setProfile(res.data);
        })
        .catch((err) => console.log(err));
    }
  }, [user]); 

  return (
    <>
      <Row>
        <Card.Body>
          <Row className="h-100">
            <Col xs="6" md="3" className="pe-0 d-flex align-items-center">
              {profile ? (
                <div>
                  <img src={profile.picture} alt="user image" />
                  <h3>User Logged in</h3>
                  <p>Name: {profile.name}</p>
                  <p>Email: {profile.email}</p>
                  <br />
                  <br />
                  <button type="button" onClick={logOut}>
                    Log out
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => login()}>
                  Sign in with Google 🚀{' '}
                </button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Row>
    </>
  );
}

export default Rough;
