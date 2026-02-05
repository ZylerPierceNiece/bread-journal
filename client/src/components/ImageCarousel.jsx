import React, { useState, useEffect } from 'react';

function ImageCarousel({ images, enableLightbox = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Handle single image or array
  const imageArray = Array.isArray(images) && images.length > 0
    ? images
    : images && typeof images === 'string'
      ? [{ url: images, order: 0 }]
      : [];

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === imageArray.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? imageArray.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setCurrentIndex(prev => prev === imageArray.length - 1 ? 0 : prev + 1);
      if (e.key === 'ArrowLeft') setCurrentIndex(prev => prev === 0 ? imageArray.length - 1 : prev - 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, imageArray.length]);

  // Only show carousel controls if there are multiple images
  const showControls = imageArray.length > 1;

  // Don't render if no images
  if (imageArray.length === 0) {
    return null;
  }

  return (
    <>
    <div className="image-carousel">
      <div className="carousel-container">
        <img
          src={imageArray[currentIndex].url}
          alt={`Bread ${currentIndex + 1}`}
          className="carousel-image"
          onClick={enableLightbox ? (e) => { e.stopPropagation(); setLightboxOpen(true); } : undefined}
          style={enableLightbox ? { cursor: 'zoom-in' } : undefined}
        />

        {showControls && (
          <>
            <button
              className="carousel-button prev"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              aria-label="Previous image"
            >
              ‹
            </button>

            <button
              className="carousel-button next"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              aria-label="Next image"
            >
              ›
            </button>

            <div className="carousel-dots">
              {imageArray.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(index);
                  }}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>

    {lightboxOpen && (
      <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
        <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>&times;</button>
        {showControls && (
          <>
            <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); goToPrevious(); }}>‹</button>
            <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); goToNext(); }}>›</button>
          </>
        )}
        <img
          src={imageArray[currentIndex].url}
          alt={`Bread ${currentIndex + 1}`}
          className="lightbox-image"
          onClick={(e) => e.stopPropagation()}
        />
        {showControls && (
          <div className="lightbox-dots">
            {imageArray.map((_, index) => (
              <button
                key={index}
                className={`lightbox-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
              />
            ))}
          </div>
        )}
      </div>
    )}
    </>
  );
}

export default ImageCarousel;
