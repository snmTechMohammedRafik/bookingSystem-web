import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Modal,
  Accordion,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./BookingForm.css";
import clockIMg from "../../assets/clock.png";
import backButton from "../../assets/less.png";
import arrowDown from "../../assets/arrow-down.png";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";

const BookingForm = ({ closeForm, booking, initialData }) => {
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
  const authTokenUser = localStorage.getItem("auth_token");
  console.log("<<<<<", authTokenUser);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerExists, setCustomerExists] = useState(false);
  const [error, setError] = useState("");
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [serviceGroups, setServiceGroups] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalAmount, setTotalAmount] = useState(""); // New state to track total amount
  const [employeeId, setEmployeeId] = useState(
    localStorage.getItem("employee_id")
  ); // Example employee ID
  const [servicePrice, setServicePrice] = useState(0); // Store service price
  const [startTime, setStartTime] = useState(null);
  const [endrtTime, setEndTime] = useState(null);
  const [activeAccordion, setActiveAccordion] = useState(null); // Track active accordion group
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [employees, setEmployees] = useState([]); // State to hold employees
  const [selectedEmployee, setSelectedEmployee] = useState({
    id: 0,
    name: "",
  });
  console.log(">>>>", selectedEmployee);
  const [selctedServiceName, setSelectedServiceName] = useState("");
  // State for selected employee
  const [hasEmployees, setHasEmployees] = useState(false); // New state to track if the selected service has employees

  const openConfirmationModal = () => {
    // setShowConfirmationModal(true);
    setShowTimeSlotModal(false);
    if (!selectedEmployee) {
      toast.error("Please select an employee before confirming.");
      // return;
      setShowServiceModal(false);
      setShowTimeSlotModal(true); // Open the time slot modal only if employees are available
      return;
    } else {
      setShowTimeSlotModal(false);
      setShowConfirmationModal(true);
      return;
    }
  };

  const handleToggleAccordion = (groupId) => {
    setActiveAccordion(activeAccordion === groupId ? null : groupId);
  };

  useEffect(() => {
    // Function to fetch booking times
    const fetchBookingTimes = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_URL}/api/v1/store/schedule`,
          {
            headers: {
              Authorization: `Bearer ${authTokenUser}`,
            },
          }
        );

        // Assuming response contains an array of time slots with 'start' and 'end' properties
        const responseData = response.data.data;
        console.log("????", responseData);

        setStartTime(timeSlots);
      } catch (error) {
        console.error("Error fetching booking times:", error);
      }
    };
  }, []);

  // Function to generate time slots from 9:00 to 16:55 in 5-minute intervals
  const slots = [];
  const generateTimeSlots = () => {
    const slotsByHour = {};
    const slots = [];
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay(); // 0 for Sunday, 1 for Monday, ..., 3 for Wednesday, etc.

    // Set different start and end times based on the day of the week
    let startHour = 9;
    let endHour = 22;

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        if (!(hour === endHour && minute > 55)) {
          // Only allow until the end hour's last 5-minute slot
          const formattedTime = `${hour}:${minute.toString().padStart(2, "0")}`;
          slots.push(formattedTime);
        }
      }
      slotsByHour[hour] = slots;
    }

    return slots;
  };

  const updatedSlots = slots.map((time) => ({
    time,
    selectable: availableTimeSlots.includes(time), // Mark as selectable if time is in availableTimeSlots
  }));

  // console.log(availableTimeSlots);
  // console.log(updatedSlots);

  const timeSlots = generateTimeSlots();

  useEffect(() => {
    if (selectedService) {
      fetchAvailableTimeSlots(selectedService);
    }
  }, [selectedDate, selectedService, selectedEmployee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (customerExists) {
      handleOpenServiceModal();
    } else {
      handleAddCustomer(); // Call handleAddCustomer if customer not found
    }
  };

  const handlePhoneNumberChange = async (e) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value) || value.length > 8) {
      setError("Only numbers are allowed, with a maximum of 6 digits.");
      return;
    }
    setPhoneNumber(value);
    if (value.length === 8) {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_URL}/api/v1/store/booking/customer?phone_no=${value}`,
          {
            headers: {
              Authorization: `Bearer ${authTokenUser}`,
            },
          }
        );
        if (response.data.success && response.data.data) {
          setCustomerName(response.data.data.name);
          setCustomerExists(true);
          setError("");
        } else if (
          response.data.success === false &&
          response.data.msg === "Customer not found"
        ) {
          setCustomerName("");
          setCustomerExists(false);
          setError("Customer not found. Please add the customer.");
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching customer data. Please try again.");
        setCustomerName("");
        setCustomerExists(false);
      }
    } else {
      setCustomerName("");
      setCustomerExists(false);
      setError("");
    }
  };

  const handleAddCustomer = async () => {
    // Trigger backend to add the new customer using the correct field names
    if (!customerName) {
      setError("Please enter a customer name.");
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/api/v1/store/customer`,
        { phone_number: phoneNumber, name: customerName }, // Changed to "phone_number"
        {
          headers: {
            Authorization: `Bearer ${authTokenUser}`,
          },
        }
      );
      if (response.data.success) {
        toast.success(`New customer ${customerName} added successfully.`);
        setCustomerExists(true);
        setError("");

        // Automatically open the service modal after adding the customer
        handleOpenServiceModal();
      } else {
        toast.error("Failed to add the customer. Please try again.");
      }
    } catch (error) {
      console.error("Error adding new customer:", error);
      toast.error("Failed to add the customer. Please try again.");
    }
  };

  // Function to open the service modal
  const handleOpenServiceModal = async () => {
    try {
      const serviceGroupResponse = await axios.get(
        `${process.env.REACT_APP_URL}/api/v1/store/service_group`,
        {
          headers: {
            Authorization: `Bearer ${authTokenUser}`,
          },
        }
      );

      const serviceGroupsData = serviceGroupResponse.data.data;
      setServiceGroups(serviceGroupsData);

      setShowServiceModal(true);
      setShowTimeSlotModal(false); // Ensure time slot modal is closed
    } catch (error) {
      console.error("Error fetching service group data:", error);
      toast.error(
        "Failed to fetch services or service groups. Please try again."
      );
    }
  };

  const fetchAvailableTimeSlots = async (serviceId) => {
    try {
      const response = await axios.get(
        `${
          process.env.REACT_APP_URL
        }/api/v1/store/booking/timings?service_id=${serviceId}&date=${selectedDate.toLocaleDateString(
          "en-CA"
        )}${selectedEmployee.id ? `&employee_id=${selectedEmployee.id}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${authTokenUser}`,
          },
        }
      );

      if (response.data.success) {
        const bookedSlots = response.data.data; // Assume this contains booked slots for the selected date
        const filteredSlots = bookedSlots.map((element) => {
          if (element.startsWith("0")) {
            return element.slice(1);
          } else {
            return element;
          }
        });
        // console.log(">>>>>>>",filteredSlots);
        setAvailableTimeSlots(filteredSlots);
        setShowTimeSlotModal(true);
        setShowServiceModal(false); // Close the previous modal when this opens
      } else {
        setError("Failed to fetch available time slots.");
      }
    } catch (error) {
      console.error("Error fetching time slots:", error);
      setError("Failed to fetch available time slots.");
    }
  };

  // Function to handle service selection
  const handleServiceSelect = (service) => {
    const employeesForService = service.employees || [];

    // If no employees are available for the service, show a toast and do not proceed
    if (employeesForService.length === 0) {
      toast.error(
        "This service is currently unavailable. No employees are available."
      );
      return; // Exit the function, preventing any further action
    }

    // Proceed with selection if employees are available
    setSelectedServiceName(service.name);
    setSelectedService(service.id);
    setServicePrice(service.price);
    setEmployees(employeesForService);
    setShowServiceModal(false);
    setShowTimeSlotModal(true); // Open the time slot modal only if employees are available
  };

  useEffect(() => {
    if (!hasEmployees) {
      setShowTimeSlotModal(false);
    }
  }, [hasEmployees]);

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
  const getSelectedEmployeeName = () => {
    const employee = employees.find((emp) => emp.id === selectedEmployee);
    return employee ? employee.name : "";
  };

  // const splitedate = () =>{
  //   return availableTimeSlots.some(range => {}

  //   )
  // }

  const handleBookingConfirmation = async () => {
    const bookingData = {
      booking_date: selectedDate.toLocaleDateString("en-CA"),
      customer_name: customerName,
      customer_phone_number: phoneNumber,
      employee_id: selectedEmployee.id, // Add selected employee ID here
      service_id: selectedService,
      time_slot: selectedTimeSlots,
      total_amount: servicePrice,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/api/v1/store/booking`,
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${authTokenUser}`,
          },
        }
      );

      if (response.data.success) {
        // Show success toast with backend message
        toast.success(response.data.msg || "Booking confirmed!");

        // Close all modals and form
        setShowServiceModal(false);
        setShowTimeSlotModal(false);
        setShowConfirmationModal(false);
        closeForm(); // Close the form

        // Refresh the page after a short delay to allow toast to be seen
        setTimeout(() => {
          window.location.reload();
        }, 2000); // 2-second delay to allow user to see the success toast
      } else {
        // Show error toast with backend message if booking failed
        toast.error(response.data.msg || "Booking failed. Please try again.");
      }
    } catch (error) {
      // Show error toast with message from backend or a generic error message
      toast.error(error.response?.data?.msg || "Error confirming booking.");
      console.error("Error confirming booking:", error);
    }
  };
  // console.log("slot", selectedTimeSlots);
  // console.log("slotdrerr",availableTimeSlots.findIndex(availableSlot => availableSlot.includes(slots[0])) !== -1);
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
      <ToastContainer /> {/* Add this line */}
      {/* create form  */}
      {/* Main Form */}
      {!showServiceModal && !showTimeSlotModal && !showConfirmationModal && (
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formPhoneNumber">
            <Form.Label>Phone Number</Form.Label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "10px",
                  transform: "translateY(-50%)",
                  fontSize: "24px",
                  color: "black",
                  pointerEvents: "none",
                }}
              >
                +45
              </span>
              <Form.Control
                type="text"
                placeholder="Enter 6-digit phone number"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                maxLength={8}
                style={{ paddingLeft: "50px" }}
              />
            </div>
          </Form.Group>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <Form.Group controlId="formCustomerName">
            <Form.Label>Customer Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={customerExists}
            />
          </Form.Group>

          <div className="d-flex justify-content-center">
            <button
              type="submit"
              className="add-employee employee-1"
              disabled={!phoneNumber}
              style={{ marginBottom: "92px" }}
            >
              {customerExists ? "Book" : "Add New Customer"}
            </button>
          </div>
        </Form>
      )}
      {/* Modal to display service groups and services */}
      <Modal
        show={showServiceModal}
        onHide={() => setShowServiceModal(false)}
        className="mt-5 pt-5 toprt"
      >
        <Modal.Body
          className="mb-5 pb-5"
          style={{
            maxWidth: "96%",
          }}
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
            >
              <img
                src={backButton}
                alt="Back"
                onClick={() => {
                  setShowServiceModal(false);
                }}
              />
            </span>
            <Modal.Title
              style={{
                margin: "0 auto",
                fontWeight: "400",
                fontSize: "35px",
                marginBottom: "2rem",
              }}
            >
              Manual booking
            </Modal.Title>
          </Modal.Header>

          {serviceGroups.length > 0 ? (
            serviceGroups.map((group) => (
              <Card key={group.id} className="accordion-item">
                <Card.Header>
                  <div
                    className="accordion-header"
                    onClick={() => handleToggleAccordion(group.id)}
                    style={{ cursor: "pointer", fontWeight: "bold" }}
                  >
                    {group.group} ({group.services.length} services)
                    <span style={{ float: "right" }}>
                      <img src={arrowDown} />
                    </span>
                  </div>
                </Card.Header>
                <Card.Body
                  className={`accordion-body m-4 ${
                    activeAccordion === group.id ? "open" : "collapsed"
                  }`}
                >
                  {group.services.length > 0 ? (
                    group.services.map((service) => (
                      <div
                        key={service.id}
                        className="service-item"
                        onClick={() => handleServiceSelect(service)}
                        style={{ cursor: "pointer", marginBottom: "10px" }}
                      >
                        <Row className="service-info">
                          <Col md={8}>
                            <strong>{service.name}</strong>
                          </Col>
                          {/* <Col md={1}></Col> */}
                          <Col
                            md={4}
                            style={{
                              textAlign: "end",
                            }}
                          >
                            <span>
                              <img src={clockIMg} />
                              {service.duration_text}
                            </span>
                          </Col>
                        </Row>

                        <p>
                          {service.description || "No description available."}
                        </p>
                        <span>{service.price} $</span>
                      </div>
                    ))
                  ) : (
                    <p>No services found in this group.</p>
                  )}
                </Card.Body>
              </Card>
            ))
          ) : (
            <p>No service groups found.</p>
          )}
        </Modal.Body>
        {/* <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowServiceModal(false)}
          >
            Close
          </Button>
        </Modal.Footer> */}
      </Modal>
      {/* Modal to display available time slots */}
      {/* Modal to display available time slots */}
      <Modal
        show={showTimeSlotModal}
        onHide={() => setShowTimeSlotModal(false)}
        class
        className="totelpot"
      >
        <Modal.Header>
          <button
            className="prev-button"
            style={{ marginLeft: "40px" }}
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
              <Calendar onChange={setSelectedDate} value={selectedDate} />
            </Col>
            <Col md={6} className="time-slot-container">
  <h5>Available Time Slots</h5>
  {availableTimeSlots.length > 0 ? (
    <div className="time-slot-list">
      {Object.entries(groupTimeSlotsByHour(timeSlots)).map(([hour, slots], index) => (
        <div key={index} className="hour-group">
          {/* Hour Label */}
          <div className="hour-label" >
            {hour}
          </div>
          {/* Render each 5-minute slot within the hour */}
          <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "10px" }}>
            {slots.map((slot, slotIndex) => (
              <div
                key={slotIndex}
                className={`time-slot-item ${
                  availableTimeSlots.includes(slot) ? "booked" : ""
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
                    availableTimeSlots.findIndex((availableSlot) =>
                      availableSlot.includes(slot)
                    ) === -1
                      ? "not-allowed"
                      : "pointer",
                  backgroundColor:
                    selectedTimeSlots && selectedTimeSlots.includes(slot)
                      ? "#8B4513" // Brown background for selected slot
                      : availableTimeSlots.findIndex((availableSlot) =>
                          availableSlot.includes(slot)
                        ) === -1
                      ? "#FFC0CB" // Red for unavailable slots
                      : "white", // White for available slots
                  color: selectedTimeSlots.includes(slot) ? "white" : "black",
                }}
              >
                {slot}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p>No available time slots for the selected service.</p>
  )}
</Col>

          </Row>
        </Modal.Body>

        <button className="add-employee" onClick={openConfirmationModal}>
          Confirm Time Slot
        </button>
      </Modal>
      {/* Confirmation Modal */}
      <Modal
        show={showConfirmationModal}
        onHide={() => setShowConfirmationModal(false)}
      >
        <Modal.Header>
          <button
            className="prev-button"
            onClick={() => {
              setShowConfirmationModal(false);
              setShowTimeSlotModal(true); // Reopen the Time Slot Modal
            }}
          >
            <img src={backButton} />
          </button>

          <div className="d-flex w-100 justify-content-center align-items-center">
            <Modal.Title>Booking Details</Modal.Title>
            <br></br>
            <div className="modal-title-3">
              <strong>{customerName}</strong>
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className="bodyteg-1">
          <div className="bodyteg">
            <p style={{ borderBottom: "2px solid #BBB0A4" }}>
              <strong>Date:</strong> {selectedDate.toLocaleDateString()}
            </p>
            <p style={{ borderBottom: "2px solid #BBB0A4" }}>
              <strong>Time Slot:</strong> {selectedTimeSlots}
            </p>
            <p>
              <strong>Employee:</strong> {selectedEmployee.name}
            </p>
          </div>
          <div className="bodyteg">
            <p style={{ borderBottom: "2px solid #BBB0A4" }}>
              <strong>{selctedServiceName}</strong> {selectedService}
            </p>

            <p>
              <strong>Total Amount:</strong> ${servicePrice}
            </p>
          </div>
        </Modal.Body>
        {/* <Button
            variant="secondary"
            onClick={() => setShowConfirmationModal(false)}
          >
            Close
          </Button> */}
        <button className="add-employee" onClick={handleBookingConfirmation}>
          Confirm Booking
        </button>
      </Modal>
    </>
  );
};

export default BookingForm;
