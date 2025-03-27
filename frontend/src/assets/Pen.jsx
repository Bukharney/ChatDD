import * as React from "react";

const Pen = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="27"
    height="27"
    fill="none"
    viewBox="0 0 27 27"
    className={className}
  >
    <path
      stroke="#929292"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M14.812 18.136h4.798"
      opacity="0.4"
    ></path>
    <path
      stroke="#929292"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M14.176 6.892c.555-.707 1.45-.67 2.158-.115l1.046.82c.707.554.958 1.415.404 2.123l-6.238 7.957a1.11 1.11 0 0 1-.865.428l-2.406.03-.545-2.343c-.077-.33 0-.675.209-.943z"
      clipRule="evenodd"
    ></path>
    <path
      stroke="#929292"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="m13.008 8.382 3.607 2.828"
      opacity="0.4"
    ></path>
    <path
      stroke="#929292"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M19.205 1H7.587C3.538 1 1 3.867 1 7.924V18.87c0 4.057 2.526 6.924 6.587 6.924h11.617c4.062 0 6.59-2.867 6.59-6.924V7.924C25.794 3.867 23.266 1 19.205 1"
      clipRule="evenodd"
    ></path>
  </svg>
);

export default Pen;
