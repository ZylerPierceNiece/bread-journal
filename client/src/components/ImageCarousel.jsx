import React, { useState } from 'react';

function ImageCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle single image or array
  const imageArray = Array.isArray(images) ? images : [{ url: images, order: 0 }];

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

  // Only show carousel controls if there are multiple images
  const showControls = imageArray.length > 1;

  return (
    <div className="image-carousel">
      <div className="carousel-container">
        <img
          src={imageArray[currentIndex].url}
          alt={`Bread ${currentIndex + 1}`}
          className="carousel-image"
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
  );
}

export default ImageCarousel;
