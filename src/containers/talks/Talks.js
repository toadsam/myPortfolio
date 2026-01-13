import React, {useContext, useEffect, useState} from "react";
import {createPortal} from "react-dom";
import "./Talks.scss";
import TalkCard from "../../components/talkCard/TalkCard";
import {talkSection} from "../../portfolio";
import {Fade} from "react-reveal";
import StyleContext from "../../contexts/StyleContext";

export default function Talks() {
  const {isDark} = useContext(StyleContext);
  const [activeValue, setActiveValue] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [viewerImage, setViewerImage] = useState(null);
  const [viewerClosing, setViewerClosing] = useState(false);

  useEffect(() => {
    if (!activeValue || isPaused) {
      return;
    }
    const timer = setInterval(() => {
      setCurrentIndex(prev =>
        (prev + 1) % (activeValue.images?.length || 1)
      );
    }, 4000);
    return () => clearInterval(timer);
  }, [activeValue, isPaused]);

  const openLightbox = value => {
    setActiveValue(value);
    setCurrentIndex(0);
    setIsClosing(false);
  };

  const closeLightbox = () => {
    setIsClosing(true);
    setTimeout(() => {
      setActiveValue(null);
      setCurrentIndex(0);
      setIsClosing(false);
    }, 260);
  };

  const openViewer = image => {
    setViewerImage(image);
    setViewerClosing(false);
  };

  const closeViewer = () => {
    setViewerClosing(true);
    setTimeout(() => {
      setViewerImage(null);
      setViewerClosing(false);
    }, 220);
  };

  const getPrevIndex = () => {
    if (!activeValue?.images?.length) {
      return 0;
    }
    return (
      (currentIndex - 1 + activeValue.images.length) %
      activeValue.images.length
    );
  };

  const getNextIndex = () => {
    if (!activeValue?.images?.length) {
      return 0;
    }
    return (currentIndex + 1) % activeValue.images.length;
  };

  const handlePrev = () => {
    if (!activeValue?.images?.length) {
      return;
    }
    setCurrentIndex(getPrevIndex());
  };

  const handleNext = () => {
    if (!activeValue?.images?.length) {
      return;
    }
    setCurrentIndex(getNextIndex());
  };

  const handleTouchStart = event => {
    setTouchStart(event.touches[0].clientX);
  };

  const handleTouchEnd = event => {
    if (touchStart == null) {
      return;
    }
    const endX = event.changedTouches[0].clientX;
    const delta = endX - touchStart;
    if (Math.abs(delta) > 50) {
      if (delta > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
    setTouchStart(null);
  };

  if (!talkSection.display) {
    return null;
  }
  return (
    <Fade bottom duration={1000} distance="20px">
      <div className="main" id="talks">
        <div className="talk-header">
          <h1 className="talk-header-title">{talkSection.title}</h1>
          <p
            className={
              isDark
                ? "dark-mode talk-header-subtitle"
                : "subTitle talk-header-subtitle"
            }
          >
            {talkSection.subtitle}
          </p>
          <div className="values-cards-grid">
            {talkSection.values.map((value, i) => (
              <TalkCard
                key={value.key}
                value={value}
                isDark={isDark}
                onOpen={() => openLightbox(value)}
                style={{animationDelay: `${i * 140}ms`}}
              />
            ))}
          </div>
        </div>
        {activeValue && typeof document !== "undefined"
          ? createPortal(
              <div
                className={`values-lightbox-overlay${
                  isClosing ? " closing" : ""
                }`}
                role="presentation"
                onClick={closeLightbox}
              >
                <div
                  className={`values-lightbox${isClosing ? " closing" : ""}`}
                  role="dialog"
                  aria-modal="true"
                  aria-label={activeValue.key}
                  onClick={event => event.stopPropagation()}
                >
                  <button
                    className="values-lightbox-close"
                    type="button"
                    onClick={closeLightbox}
                  >
                    ×
                  </button>
                  <div
                    className="values-lightbox-slider"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div className="values-lightbox-carousel">
                      <button
                        className="values-lightbox-image-wrap side"
                        type="button"
                        onClick={() => openViewer(activeValue.images[getPrevIndex()])}
                      >
                        <img
                          className="values-lightbox-image"
                          src={activeValue.images[getPrevIndex()]}
                          alt={`${activeValue.key} preview`}
                        />
                      </button>
                      <button
                        key={currentIndex}
                        className="values-lightbox-image-wrap active"
                        type="button"
                        onClick={() => openViewer(activeValue.images[currentIndex])}
                      >
                        <img
                          className="values-lightbox-image"
                          src={activeValue.images[currentIndex]}
                          alt={activeValue.key}
                        />
                      </button>
                      <button
                        className="values-lightbox-image-wrap side"
                        type="button"
                        onClick={() => openViewer(activeValue.images[getNextIndex()])}
                      >
                        <img
                          className="values-lightbox-image"
                          src={activeValue.images[getNextIndex()]}
                          alt={`${activeValue.key} preview`}
                        />
                      </button>
                    </div>
                    <div className="values-lightbox-dots">
                      {activeValue.images.map((_, index) => (
                        <button
                          key={index}
                          className={`values-lightbox-dot${
                            index === currentIndex ? " active" : ""
                          }`}
                          type="button"
                          onClick={() => setCurrentIndex(index)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="values-lightbox-text">
                    <h3 className="values-lightbox-title">
                      {activeValue.key}
                    </h3>
                    <div className="values-lightbox-description">
                      {activeValue.description.map((line, index) => (
                        <p
                          key={index}
                          style={{animationDelay: `${index * 120}ms`}}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )
          : null}
        {viewerImage && typeof document !== "undefined"
          ? createPortal(
              <div
                className={`values-viewer-overlay${
                  viewerClosing ? " closing" : ""
                }`}
                role="presentation"
                onClick={closeViewer}
              >
                <div
                  className={`values-viewer${
                    viewerClosing ? " closing" : ""
                  }`}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Image viewer"
                  onClick={event => event.stopPropagation()}
                >
                  <button
                    className="values-viewer-close"
                    type="button"
                    onClick={closeViewer}
                  >
                    ×
                  </button>
                  <img src={viewerImage} alt="Full view" />
                </div>
              </div>,
              document.body
            )
          : null}
      </div>
    </Fade>
  );
}
