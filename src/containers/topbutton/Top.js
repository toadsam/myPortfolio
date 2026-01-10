import React, {useEffect} from "react";
import "./Top.scss";

export default function Top() {
  function TopEvent() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  }
  // When the user scrolls down 20px from the top of the document, show the button
  function scrollFunction() {
    const button = document.getElementById("topButton");
    if (!button) {
      return;
    }
    if (
      document.body.scrollTop > 20 ||
      document.documentElement.scrollTop > 20
    ) {
      button.style.visibility = "visible";
    } else {
      button.style.visibility = "hidden";
    }
  }
  useEffect(() => {
    const handleScroll = () => scrollFunction();
    window.addEventListener("scroll", handleScroll);
    scrollFunction();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // When the user clicks on the button, scroll to the top of the document
  return (
    <button onClick={TopEvent} id="topButton" title="Go to top">
      <i className="fas fa-hand-point-up" aria-hidden="true"></i>
    </button>
  );
}
