import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Row, Col, Card, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { NavLink } from 'react-router-dom';

const GET_MY_ADS = gql`
  query GetMyAds {
    getMyAds {
      id
      category_id
      categoryName
      tier_id
      status
      createdAt
      updatedAt
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
    }
  }
`;

const MyAds = () => {
  const title = 'My Advertisements';
  const description = 'View and manage your submitted advertisements';

  const { data, loading, error, refetch } = useQuery(GET_MY_ADS);

  if (error) {
    toast.error(error.message || 'Failed to fetch ads');
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg='warning'>Pending Review</Badge>;
      case 'approved':
        return <Badge bg='success'>Approved</Badge>;
      case 'rejected':
        return <Badge bg='danger'>Rejected</Badge>;
      default:
        return <Badge bg='secondary'>{status}</Badge>;
    }
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className='container-xl'>
        <Row className='mb-3'>
          <Col>
            <div className='page-title-container'>
              <h1 className='mb-0 pb-0 display-4'>{title}</h1>
              <div className='text-muted fs-base'>{description}</div>
            </div>
          </Col>
          <Col className='text-end'>
            <NavLink to='/seller/advertisement/add' className='btn btn-primary'>
              <CsLineIcons icon='plus' className='me-2' />
              Submit New Ad
            </NavLink>
          </Col>
        </Row>

        <Card>
          <Card.Body>
            {loading && (
              <div className='text-center'>
                <Spinner animation='border' role='status' />
              </div>
            )}
            {!loading && (!data?.getMyAds || data.getMyAds.length === 0) && (
              <Alert variant='info' className='mb-0'>
                <CsLineIcons icon='info' className='me-2' />
                No advertisements submitted yet.{' '}
                <NavLink to='/seller/advertisement/add'>
                  Submit your first advertisement
                </NavLink>
              </Alert>
            )}
            {!loading && data?.getMyAds && data.getMyAds.length > 0 && (
              <div className='table-responsive'>
                <Table hover>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Submitted On</th>
                      <th>Mobile Image</th>
                      <th>Desktop Image</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.getMyAds.map((ad) => (
                      <tr key={ad.id}>
                        <td className='fw-bold'>{ad.categoryName}</td>
                        <td>{getStatusBadge(ad.status)}</td>
                        <td>
                          <small className='text-muted'>
                            {new Date(ad.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </small>
                        </td>
                        <td>
                          {ad.medias && ad.medias.length > 0 && ad.medias[0].mobile_image_url ? (
                            <img
                              src={ad.medias[0].mobile_image_url}
                              alt='Mobile'
                              style={{
                                maxWidth: '50px',
                                maxHeight: '50px',
                                cursor: 'pointer',
                              }}
                              className='rounded'
                              data-bs-toggle='modal'
                              data-bs-target={`#mobileModal${ad.id}`}
                            />
                          ) : (
                            <span className='text-muted'>-</span>
                          )}
                        </td>
                        <td>
                          {ad.medias && ad.medias.length > 0 && ad.medias[0].desktop_image_url ? (
                            <img
                              src={ad.medias[0].desktop_image_url}
                              alt='Desktop'
                              style={{
                                maxWidth: '50px',
                                maxHeight: '50px',
                                cursor: 'pointer',
                              }}
                              className='rounded'
                              data-bs-toggle='modal'
                              data-bs-target={`#desktopModal${ad.id}`}
                            />
                          ) : (
                            <span className='text-muted'>-</span>
                          )}
                        </td>
                        <td>
                          <NavLink
                            to={`/seller/advertisement/detail/${ad.id}`}
                            className='btn btn-sm btn-outline-primary'
                          >
                            <CsLineIcons icon='eye' className='me-1' />
                            View
                          </NavLink>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default MyAds;
