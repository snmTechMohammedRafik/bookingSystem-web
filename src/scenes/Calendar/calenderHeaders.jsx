import React from "react";
import moment from "moment";

const CustomDateHeader = ({ date }) => {
  const dayName = moment(date).format("dddd"); // Full day name (e.g., "Mandag")
  const dayDate = moment(date).format("DD/MM"); // Date and month (e.g., "28/04")

  console.log("Date format:", dayName); // This should print the full day name in Norwegian

  return (
    <div style={{ textAlign: "center", fontSize: "14px" }}>
      <div style={{ fontWeight: "bold" }}>{dayName}</div> {/* Full day name */}
      <div>{dayDate}</div> {/* Date and month */}
    </div>
  );
};

export default CustomDateHeader;
