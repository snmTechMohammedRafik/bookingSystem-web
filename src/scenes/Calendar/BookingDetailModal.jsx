import React, { useState, useEffect } from "react";
import { Form, Button, Modal, Row, Col } from "react-bootstrap";
import "./BookingDetailModal.css"; // Custom CSS for styling
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./BookingForm.css";
import backButton from "../../assets/less.png";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import vectorImg from "../../assets/Vector.png";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const BookingDetailModal = ({
  booking,
  show,
  onClose,
  refreshBookings,
  closeForm,
  initialData,
}) => {
  useEffect(() => {
    // Set default values from initialData if provided
    if (initialData) {
      setCustomerName(initialData.customerName);
      setPhoneNumber(initialData.phone);
      setSelectedDate(new Date(initialData.date));
      setSelectedService(initialData.serviceId);
      setSelectedEmployee({
        id: initialData.employeeId,
        name: initialData.employeeName,
      });
      setSelectedTimeSlots([initialData.timeSlot]);
      setServicePrice(initialData.price);
    }
  }, [initialData]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerExists, setCustomerExists] = useState(false);
  const [error, setError] = useState("");
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  // const [serviceGroups, setServiceGroups] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  // const [totalAmount, setTotalAmount] = useState(""); // New state to track total amount
  const [employeeId, setEmployeeId] = useState(
    localStorage.getItem("employee_id")
  ); // Example employee ID
  const [servicePrice, setServicePrice] = useState(0); // Store service price
  // const [startTime, setStartTime] = useState(null);
  // const [endrtTime, setEndTime] = useState(null);
  const [activeAccordion, setActiveAccordion] = useState(null); // Track active accordion group
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [employees, setEmployees] = useState([]); // State to hold employees
  const [selectedEmployee, setSelectedEmployee] = useState({
    id: "",
    name: "",
  });
  // console.log(">>>>", booking.created);
  const [selectedDate, setSelectedDate] = useState(
    booking ? new Date(booking.date) : new Date()
  );

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  const confirmCancelBooking = async () => {
    const result = await updateBookingStatus("CANCELLED");
    if (result) {
      setShowCancelConfirmation(false); // Close modal after canceling
    }
  };

  const handleCancelBooking = () => {
    setShowCancelConfirmation(true); // Open cancel confirmation modal
  };

  const handleRescheduleBooking = () => {
    fetchAvailableTimeSlots();
    setShowTimeSlotModal(true);
  };
  const navigate = useNavigate();

  // State for selected employee
  // const [hasEmployees, setHasEmployees] = useState(false); // New state to track if the selected service has employees
  useEffect(() => {
    if (selectedService) {
      fetchAvailableTimeSlots(selectedService);
    }
  }, [selectedDate, selectedService]);

  useEffect(() => {
    if (booking && booking.date) {
      setSelectedDate(new Date(booking.date)); // Set to booking date
      fetchAvailableTimeSlots(booking.date); // Fetch slots for booking date
    }
  }, [booking]);

  useEffect(() => {
    if (booking && booking.employeeId) {
      setSelectedEmployee({
        id: booking.employeeId,
        name: booking.employeeName,
      });
    }
  }, [booking]);

  if (!booking) return null;

  // Formatting Date and Time for display
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  const formatTime = (start, end) =>
    `${new Date(start).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${new Date(end).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

  // Map actual status to display names
  const getDisplayStatus = (status) => {
    switch (status) {
      case "BOOKED":
        return "Pending";
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled";
      case "OFFER_ACCEPTED":
        return "Cancellation offer accepted";
      case "NOSHOW":
        return "Absence from booking";
      case "OFFERED":
        return "Awaiting new customer";
      default:
        return status;
    }
  };

  // API URL and Authorization
  const apiUrl = process.env.REACT_APP_URL;
  const authTokenUser = localStorage.getItem("auth_token");
  const updateBookingStatus = async (status) => {
    if (!booking.id) {
      toast.error("Booking ID is missing");
      return false;
    }

    const payload = { id: booking.id };
    let endpoint = "";

    switch (status) {
      case "COMPLETED":
        endpoint = `${apiUrl}/api/v1/store/booking/complete`;
        break;
      case "CANCELLED":
        endpoint = `${apiUrl}/api/v1/store/booking/cancel`;
        break;
      case "BOOKED":
        endpoint = `${apiUrl}/api/v1/store/booking/pending`;
        break;
      case "NOSHOW":
        endpoint = `${apiUrl}/api/v1/store/booking/noshow`;
        break;
      case "DELETED":
        endpoint = `${apiUrl}/api/v1/store/booking/delete`;
        break;
      case "RESCHEDULED":
        endpoint = `${apiUrl}/api/v1/store/booking/reschedule`;
        payload.booking_date = formatDate(booking.date);
        payload.time_slot = `${formatTime(booking.startTime, booking.endTime)}`;
        payload.employee_id = booking.employeeId;
        payload.total_amount = booking.price;
        break;
      default:
        return false;
    }

    try {
      const response = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${authTokenUser}`,
        },
      });

      if (response.data.success) {
        toast.success(
          response.data.msg || "Booking status updated successfully"
        );
        refreshBookings();
        onClose();
        navigate("/calendar");
        return true;
      } else {
        toast.error(response.data.msg || "Failed to update booking status");
        return false;
      }
    } catch (error) {
      // toast.error(error.response?.data?.msg || "An error occurred while updating booking status.");
      return false;
    }
  };

  // Button handlers
  const handleMarkAsPending = async () => {
    const result = await updateBookingStatus("BOOKED");
    if (result) {
      // Successful toast message already handled in updateBookingStatus
    }
  };

  const handleMarkAsCompleted = async () => {
    const result = await updateBookingStatus("COMPLETED");
    if (result) {
      // Successful toast message already handled in updateBookingStatus
    }
  };

  // const handleCancelBooking = async () => {
  //   const result = await updateBookingStatus("CANCELLED");
  //   if (result) {
  //     // Successful toast message already handled in updateBookingStatus
  //   }
  // };

  const handleAbsenceFromBooking = async () => {
    const result = await updateBookingStatus("NOSHOW");
    if (result) {
      // Successful toast message already handled in updateBookingStatus
    }
  };

  const handleDeleteBooking = () => {
    setShowDeleteConfirmation(true); // Open delete confirmation modal
  };
  const confirmDeleteBooking = async () => {
    const result = await updateBookingStatus("DELETED");
    if (result) {
      setShowDeleteConfirmation(false); // Close modal after deletion
    }
  };

  // const handleRescheduleBooking = () => updateBookingStatus("RESCHEDULED");
  // const handleRescheduleBooking = () => {
  // setShowTimeSlotModal(true); // Open the time slot modal for rescheduling
  //   fetchAvailableTimeSlots(selectedService); // Fetch time slots for the selected service
  // };

  // Render buttons based on status
  const renderActionButtons = () => {
    switch (booking.status) {
      case "BOOKED":
        return (
          <>
            <button className="modal-button" onClick={handleMarkAsCompleted}>
              Mark as completed
            </button>
            <button className="modal-button" onClick={handleCancelBooking}>
              Cancel booking
            </button>
            <button className="modal-button" onClick={handleRescheduleBooking}>
              Reschedule booking
            </button>
            <button className="modal-button" onClick={handleAbsenceFromBooking}>
              Absence from booking
            </button>
            <button className="modal-button" onClick={handleDeleteBooking}>
              Delete booking
            </button>
          </>
        );
      case "CANCELLED":
        return (
          <>
            <button className="modal-button" onClick={handleMarkAsPending}>
              Mark as pending
            </button>
            <button className="modal-button" onClick={handleRescheduleBooking}>
              Reschedule booking
            </button>
            <button className="modal-button" onClick={handleDeleteBooking}>
              Delete booking
            </button>
          </>
        );
      case "COMPLETED":
        return (
          <>
            <button className="modal-button" onClick={handleMarkAsPending}>
              Mark as pending
            </button>
            <button className="modal-button" onClick={handleCancelBooking}>
              Cancel booking
            </button>
            <button className="modal-button" onClick={handleRescheduleBooking}>
              Reschedule booking
            </button>
            <button className="modal-button" onClick={handleAbsenceFromBooking}>
              Absence from booking
            </button>
            <button className="modal-button" onClick={handleDeleteBooking}>
              Delete booking
            </button>
          </>
        );
      case "NOSHOW":
        return (
          <>
            <button className="modal-button" onClick={handleMarkAsPending}>
              Mark as pending
            </button>
            <button className="modal-button" onClick={handleMarkAsCompleted}>
              Mark as completed
            </button>
            <button className="modal-button" onClick={handleCancelBooking}>
              Cancel booking
            </button>
            <button className="modal-button" onClick={handleRescheduleBooking}>
              Reschedule booking
            </button>
            <button className="modal-button" onClick={handleDeleteBooking}>
              Delete booking
            </button>
          </>
        );
      case "RESCHEDULED":
        return (
          <>
            <button className="modal-button" onClick={handleCancelBooking}>
              Cancel booking
            </button>
            <button className="modal-button" onClick={handleRescheduleBooking}>
              Reschedule booking
            </button>
            <button className="modal-button" onClick={handleDeleteBooking}>
              Delete booking
            </button>
          </>
        );
      case "OFFER_ACCEPTED":
        return (
          <>
            <button className="modal-button" onClick={handleMarkAsCompleted}>
              Mark as completed
            </button>
            <button className="modal-button" onClick={handleAbsenceFromBooking}>
              Absence from booking
            </button>
          </>
        );
      case "OFFERED":
        return (
          <>
            <button className="modal-button" onClick={handleCancelBooking}>
              Cancel booking
            </button>
            <button className="modal-button" onClick={handleDeleteBooking}>
              Delete booking
            </button>
          </>
        );
      default:
        return null;
    }
  };

  const fetchAvailableTimeSlots = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/api/v1/store/booking/timings?service_id=${
          booking.serviceId
        }&date=${selectedDate.toLocaleDateString("en-CA")}`,
        {
          headers: {
            Authorization: `Bearer ${authTokenUser}`,
          },
        }
      );

      if (response.data.success) {
        const bookedSlots = response.data.data;
        const filteredSlots = bookedSlots.map((element) =>
          element.startsWith("0") ? element.slice(1) : element
        );

        console.log("Fetched available time slots:", filteredSlots); // Debugging line

        setAvailableTimeSlots(filteredSlots);
        // setShowTimeSlotModal(true);
        setShowServiceModal(false);
      } else {
        setError("Failed to fetch available time slots.");
      }
    } catch (error) {
      console.error("Error fetching time slots:", error);
      setError("Failed to fetch available time slots.");
    }
  };

  const openConfirmationModal = () => {
    // setShowConfirmationModal(true);
    setShowTimeSlotModal(false);
    if (!selectedEmployee) {
      toast.error("Please select an employee before confirming.");
      // return;
      setShowServiceModal(false);
      setShowTimeSlotModal(true); // Open the time slot modal only if employees are available
      return;
    }
    setShowConfirmationModal(true);
  };

  // const handleToggleAccordion = (groupId) => {
  //   setActiveAccordion(activeAccordion === groupId ? null : groupId);
  // };

  // Function to generate time slots from 9:00 to 16:55 in 5-minute intervals
  const slots = [];

  const generateTimeSlots = () => {
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay(); // 0 for Sunday, 1 for Monday, ..., 3 for Wednesday, etc.

    // Set different start and end times based on the day of the week
    let startHour = 9;
    let endHour = 22;

    // if (dayOfWeek === 3) {
    //   // 3 represents Wednesday
    //   startHour = 12; // Start at 12 PM on Wednesdays
    //   endHour = 16; // End at 4 PM (16:55)
    // }

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        if (!(hour === endHour && minute > 55)) {
          // Only allow until the end hour's last 5-minute slot
          const formattedTime = `${hour}:${minute.toString().padStart(2, "0")}`;
          slots.push(formattedTime);
        }
      }
    }

    return slots;
  };

  const updatedSlots = slots.map((time) => ({
    time,
    selectable: availableTimeSlots.includes(time), // Mark as selectable if time is in availableTimeSlots
  }));

  // console.log("updatedSlots",availableTimeSlots);
  // console.log("updatedSlots",updatedSlots);

  const timeSlots = generateTimeSlots();

  // Function to open the service modal

  // Function to handle service selection

  const handleTimeSlotSelect = (selectedTime) => {
    // Find the matching time slot range from availableTimeSlots
    const matchedSlot = availableTimeSlots.find((slot) =>
      slot.startsWith(selectedTime)
    );

    if (matchedSlot) {
      // If the selected time is already in the array, remove it
      setSelectedTimeSlots((prevSelectedSlot) => {
        // alert(prevSelectedSlot.time)
        // Deselect if already selected
        if (
          prevSelectedSlot &&
          prevSelectedSlot !== "" &&
          prevSelectedSlot === matchedSlot
        ) {
          // alert("if")
          return null; // Deselect
        } else {
          // alert("else")
          // Otherwise, select the matched slot
          return matchedSlot;
        }
      });
    }
  };

  // Helper function to get the selected employee's name

  // const splitedate = () =>{
  //   return availableTimeSlots.some(range => {}

  //   )
  // }

  // console.log("slot", selectedTimeSlots);
  // console.log("slotdrerr",availableTimeSlots.findIndex(availableSlot => availableSlot.includes(slots[0])) !== -1);

  const confirmReschedule = async () => {
    const payload = {
      id: booking.id,
      booking_date: selectedDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
      time_slot: selectedTimeSlots, // Use selected time slot
      employee_id: selectedEmployee.id, // Employee ID
      total_amount: booking.price, // Total amount
    };

    const endpoint = `${apiUrl}/api/v1/store/booking/reschedule`;

    try {
      const response = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${authTokenUser}`,
        },
      });
      if (response.data.success) {
        toast.success("Booking rescheduled successfully");
        setShowTimeSlotModal(false); // Close the modal
        onClose();
        refreshBookings(); // Refresh bookings
      } else {
        toast.error("Failed to reschedule booking");
      }
    } catch (error) {
      console.error("Error rescheduling booking:", error);
    }
  };

  console.log("slot", selectedTimeSlots);
  console.log(
    "slotdrerr",
    availableTimeSlots.findIndex((availableSlot) =>
      availableSlot.includes(slots[0])
    ) !== -1
  );
  const formattedDate = moment(booking.created).format("DD/MM-YY (HH:mm)");

  const groupTimeSlotsByHour = (timeSlots) => {
    return timeSlots.reduce((acc, time) => {
      const hour = time.split(":")[0];
      if (!acc[hour]) acc[hour] = [];
      acc[hour].push(time);
      return acc;
    }, {});
  };

  return (
    <>
      <ToastContainer />
      {/* Modal to display available time slots */}
      <Modal
        show={showTimeSlotModal}
        onHide={() => setShowTimeSlotModal(false)}
        className="totelpot sotuot"
      >
        <Modal.Header>
          <button
            className="prev-button"
            onClick={() => {
              setShowTimeSlotModal(false);
              setShowServiceModal(true); // Reopen the Service Modal
            }}
          >
            <img src={backButton} />
          </button>
          <div className="d-flex w-100 justify-content-center align-items-center">
            <Modal.Title
              className="mb-0"
              style={{ margin: "0 auto", fontWeight: "400", fontSize: "35px" }}
            >
              Manual Booking
            </Modal.Title>
          </div>
        </Modal.Header>

        <Modal.Body>
          <Row className="mb-4">
            <Col md={9}></Col>
            <Col md={3}>
              {" "}
              <div className="employee-dropdown ">
                {employees.length > 0 ? (
                  <Form.Group controlId="employeeSelect" className="mb-0">
                    <Form.Control
                      as="select"
                      value={selectedEmployee.id}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const selectedEmployeeObj = employees.find(
                          (emp) => emp.id.toString() === selectedId
                        );
                        const selectedName = selectedEmployeeObj
                          ? selectedEmployeeObj.name
                          : "";

                        setSelectedEmployee({
                          id: selectedId,
                          name: selectedName,
                        }); // Store both id and name correctly
                      }}
                    >
                      <option value="">Any/all</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                ) : (
                  <p className="mb-0">No employees available</p>
                )}
              </div>
            </Col>
          </Row>

          <Row className="doted">
            <Col md={6} className="Bookingcalendar-container">
              {/* <Calendar onChange={setSelectedDate} value={selectedDate} /> */}
              <Calendar
                onChange={(date) => {
                  setSelectedDate(date); // Update the selected date
                  fetchAvailableTimeSlots(selectedService); // Fetch time slots for the new date
                }}
                value={selectedDate} // Set the initial date from `selectedDate`
              />
            </Col>
            <Col md={6} className="time-slot-container">
              <h5>Available Time Slots</h5>
              {availableTimeSlots.length > 0 ? (
                <div className="time-slot-list">
                  {Object.entries(groupTimeSlotsByHour(timeSlots)).map(
                    ([hour, slots], index) => (
                      <div key={index} className="hour-group">
                        {/* Hour Label */}
                        <div className="hour-label">{hour}</div>
                        {/* Render each 5-minute slot within the hour */}
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            marginBottom: "10px",
                          }}
                        >
                          {slots.map((slot, slotIndex) => (
                            <div
                              key={slotIndex}
                              className={`time-slot-item ${
                                availableTimeSlots.includes(slot)
                                  ? "booked"
                                  : ""
                              }`}
                              onClick={() =>
                                availableTimeSlots.includes(slot)
                                  ? null
                                  : handleTimeSlotSelect(slot)
                              }
                              style={{
                                display: "inline-block",
                                width: "calc(16.66% - 10px)", // To fit 6 boxes per row
                                padding: "14px 15px",
                                margin: "5px",
                                border: "1px solid #ccc",
                                borderRadius: "12px",
                                cursor:
                                  availableTimeSlots.findIndex(
                                    (availableSlot) =>
                                      availableSlot.includes(slot)
                                  ) === -1
                                    ? "not-allowed"
                                    : "pointer",
                                backgroundColor:
                                  selectedTimeSlots &&
                                  selectedTimeSlots.includes(slot)
                                    ? "#8B4513" // Brown background for selected slot
                                    : availableTimeSlots.findIndex(
                                        (availableSlot) =>
                                          availableSlot.includes(slot)
                                      ) === -1
                                    ? "#FFC0CB" // Red for unavailable slots
                                    : "white", // White for available slots
                                color: selectedTimeSlots.includes(slot)
                                  ? "white"
                                  : "black",
                              }}
                            >
                              {slot}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p>No available time slots for the selected service.</p>
              )}
            </Col>
          </Row>
        </Modal.Body>

        <button className="add-employee" onClick={confirmReschedule}>
          Confirm Rescheduled Time Slot
        </button>
      </Modal>
      {/* Confirmation Modal */}
      <Modal
        show={show && !showTimeSlotModal}
        onHide={onClose}
        centered
        className="ruted foltpt"
      >
        <Modal.Header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: "38px",
              cursor: "pointer",
              paddingTop: "26px",
              top: "8px",
            }}
            onClick={onClose}
          >
            <img src={vectorImg} alt="Vector" className="img-top" />;
          </span>
          <Modal.Title
            style={{
              margin: "0 auto",
              fontWeight: "400",
              fontSize: "35px",
              marginBottom: "2rem",
            }}
          >
            Booking Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="mb-5">
          <div className="details">
            <p>
              <strong>Name</strong> {booking.name || "N/A"}
            </p>
            <p>
              <strong>Phone nr.</strong> {booking.phone || "N/A"}
            </p>
            <p>
              <strong>Employee</strong> {booking.employee || "N/A"}
            </p>
            <p>
              <strong>Service</strong> {booking.service || "N/A"}
            </p>
            <p>
              <strong>Date</strong> {formatDate(booking.date)}
            </p>
            <p>
              <strong>Time</strong>{" "}
              {formatTime(booking.startTime, booking.endTime)}
            </p>
            <p>
              <strong>Status</strong>{" "}
              <span className={`status.${booking.status.toLowerCase()}`}>
                {getDisplayStatus(booking.status)}
              </span>
            </p>
            <p>
              <strong>Created</strong> {formattedDate}
            </p>
            {/* <p style={{border:"none"}}>
              <strong>Price:</strong> ${booking.price}
            </p> */}
          </div>

          {/* Render the action buttons based on the booking status */}
          <div className="action-buttons">{renderActionButtons()}</div>
        </Modal.Body>
        {/* <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </Modal.Footer> */}
      </Modal>

      <Modal
        show={showDeleteConfirmation}
        onHide={() => setShowDeleteConfirmation(false)}
        centered
        className="confirm-form"
      >
        <Modal.Header closeButton className="justify-content-center">
          <Modal.Title className="modal-title-centered">
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="mb-3">
          <p className="modal-confirmation-text">
            Are you sure you want to delete this booking?
          </p>
          <Row>
            <Col md={6} className="text-center">
              <button
                className="modal-button modal-button-yes"
                onClick={confirmDeleteBooking}
              >
                Yes
              </button>
            </Col>
            <Col md={6} className="text-center">
              <button
                className="modal-button modal-button-no"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                No
              </button>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
      {/* Confirm Cancel Modal */}
      <Modal
        show={showCancelConfirmation}
        onHide={() => setShowCancelConfirmation(false)}
        centered
        className="confirm-form"
      >
        <Modal.Header closeButton className="justify-content-center">
          <Modal.Title className="modal-title-centered">
            Confirm Cancel
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="mb-3">          
          <p className="modal-confirmation-text">
            Are you sure you want to Cancel this booking?
          </p>
          <Row>
            <Col md={6} className="text-center">
              <button
                className="modal-button modal-button-yes"
                onClick={confirmCancelBooking}
              >
                Yes
              </button>
            </Col>
            <Col md={6} className="text-center">
              <button
                className="modal-button modal-button-no"
                onClick={() => setShowCancelConfirmation(false)}
              >
                No
              </button>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default BookingDetailModal;
