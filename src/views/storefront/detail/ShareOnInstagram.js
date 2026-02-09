import React from 'react';

function ShareOnInstagram({ imageUrl, caption }) {
  const handleShareClick = () => {
    const shareUrl = `https://www.instagram.com/share?url=${encodeURIComponent(
      imageUrl
    )}&caption=${encodeURIComponent(caption)}`;

    window.open(shareUrl, '_blank');
  };

  return (
    <button type='button' onClick={handleShareClick}>Share on Instagram</button>
  );
}

export default ShareOnInstagram;