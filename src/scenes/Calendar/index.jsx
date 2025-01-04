import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Calendar.css";
import greaterImg from "../../assets/greter.png";
import lessImg from "../../assets/less.png";
import closeImg from "../../assets/X.png";
import BookingForm from "./BookingForm";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import "moment/locale/nb"; // Import Norwegian Bokmål locale
import CustomDateHeader from "./calenderHeaders"; // Import the custom date header
import BookingDetailModal from "./BookingDetailModal";

moment.locale("nb"); // Set the global locale to Norwegian Bokmål
moment.updateLocale("nb", { week: { dow: 1 } }); // Ensure the week starts on Monday
const localizer = momentLocalizer(moment);
const authTokenUser = localStorage.getItem("auth_token");

const CustomCalendar = () => {
  const [showForm, setShowForm] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [employeeId, setEmployeeId] = useState(
    localStorage.getItem("employee_id")
  );
  const [view, setView] = useState("week");
  const [employees, setEmployees] = useState([]);
  const [showAllEmployeesCalendar, setShowAllEmployeesCalendar] =
    useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleEventClick = (event) => {
    console.log("Event details:", event); // Debug log to confirm event details

    setSelectedBooking({
      id: event.id,
      name: event.customerName,
      phone: event.customerPhone,
      employee: event.employeeName,
      service: `${event.serviceDuration} ${event.title}`,
      date: event.start,
      startTime: event.start,
      endTime: event.end,
      status: event.status,
      created: event.createdDate,
      price: event.servicePrice,
      serviceId: event.serviceId || "Not Available", // Handle undefined serviceId
      employeeId: event.employeeId || "Not Available", // Handle undefined employeeId
    });
  };

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchEmployees();
  }, [selectedDate, view, employeeId]);

  const fetchBookings = async () => {
    const startOfWeek = moment(selectedDate)
      .startOf("week")
      .format("YYYY-MM-DD");
    const endOfWeek = moment(selectedDate).endOf("week").format("YYYY-MM-DD");

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/api/v1/store/booking`,
        {
          params: {
            date: startOfWeek,
            to_date: endOfWeek,
            limit: 100,
            offset: 0,
            booking_type: "All",
            filter_equipment_bookings: false,
            employee_id: employeeId,
          },
          headers: {
            Authorization: `Bearer ${authTokenUser}`,
          },
        }
      );

      if (response.data.success) {
        const bookings = response.data.data.map((booking) => ({
          id: booking.id,
          title: booking.booking_details.service_name,
          start: moment(booking.booking_datetime_start).toDate(),
          end: moment(booking.booking_datetime_end).toDate(),
          status: booking.status,
          resourceId: booking.employee_id,
          customerName: booking.booking_details.customer_name,
          customerPhone: booking.booking_details.customer_phone_number,
          employeeName: booking.booking_details.employee_name,
          serviceDuration: booking.booking_details.duration_text,
          createdDate: booking.created_at,
          servicePrice: booking.booking_details.price,
          serviceType: booking.booking_details.service_type,
          serviceId: booking.service_id, // Now correctly retrieving serviceId
          employeeId: booking.employee_id,
        }));
        setEvents(bookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const fetchEmployees = () => {
    const storedEmployees = JSON.parse(localStorage.getItem("employees"));
    if (storedEmployees) setEmployees(storedEmployees);
  };

  const openForm = () => setShowForm(true);
  const closeForm = () => setShowForm(false);

  const scrollToTime = new Date();
  scrollToTime.setHours(
    scrollToTime.getHours() - 1,
    scrollToTime.getMinutes() - 30
  );

  const handleEmployeeSelection = (id) => {
    setEmployeeId(id);
    setShowAllEmployeesCalendar(id === "");
  };

  const formats = {
    dayFormat: (date, culture, localizer) => {
      if (employeeId === "") {
        return employees
          .map((employee) => employee.name || "No Name")
          .join("\n");
      } else {
        return (
          localizer.format(date, "dddd", culture).charAt(0).toUpperCase() +
          localizer.format(date, "dddd", culture).slice(1) +
          `\n${localizer.format(date, "DD/MM", culture)}`
        );
      }
    },
  };

  const fetchEmployeeData = () => {
    const storedEmployees = JSON.parse(localStorage.getItem("employees"));
    if (storedEmployees) {
      const employeeResources = storedEmployees
        .filter((employee) => employee.role === "EMPLOYEE")
        .map((employee) => ({
          id: employee.id,
          title: employee.name || "Unnamed Employee",
        }));
      setEmployees(employeeResources);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const [currentTimeLinePosition, setCurrentTimeLinePosition] = useState(0);

  // Calculate the top position for the current time line
  useEffect(() => {
    const updateCurrentTimeLinePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const position = ((hours * 60 + minutes) / (24 * 60)) * 100; // Position in percentage
      setCurrentTimeLinePosition(position);
    };

    updateCurrentTimeLinePosition();
    const interval = setInterval(updateCurrentTimeLinePosition, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const refreshBookings = () => {
    fetchBookings();
  };
  const isToday = moment(selectedDate).isSame(new Date(), "day");
  useEffect(() => {
    fetchBookings(); // Fetch bookings when the component mounts
  }, []);

  return (
    <div className="calendar-wrapper" style={{ backgroundColor: "#f0f8ff" }}>
      <Calendar
        localizer={localizer}
        formats={formats}
        events={events}
        view={showAllEmployeesCalendar ? "day" : view}
        date={selectedDate}
        onNavigate={(date) => setSelectedDate(date)}
        onView={(newView) => setView(newView)}
        onSelectEvent={handleEventClick}
        defaultDate={new Date()}
        scrollToTime={scrollToTime}
        style={{ height: "100vh", backgroundColor: "#FFFFFF" }}
        step={15}
        timeslots={4}
        eventPropGetter={(event) => {
          const currentTime = new Date();
          let backgroundColor = "#3174ad";

          if (
            event.status === "BOOKED " ||
            event.status === "Awaiting new customer"
          ) {
            backgroundColor = "#E19957";
          } else if (
            event.status === "CANCELLED" ||
            event.status === "Cancelled by customer"
          ) {
            backgroundColor = "#C74141";
          } else if (event.status === "COMPLETED") {
            backgroundColor = "#367B3D";
          } else if (event.status === "BOOKED") {
            backgroundColor = "#E19957";
          } else if (
            event.status === "OFFERED" ||
            event.status === "Awaiting new customer"
          ) {
            backgroundColor = "#367B3D";
          } else if (
            event.status === "Cancellation offer accepted" ||
            event.status === "OFFER_ACCEPTED"
          ) {
            backgroundColor = "#447BCD";
          } else if (
            event.status === "Absence from booking NOSHOW " ||
            event.status === "NOSHOW"
          ) {
            backgroundColor = "#A36437";
          } else if (currentTime >= event.start && currentTime <= event.end) {
            backgroundColor = "#A79C92";
          }

          return {
            style: {
              backgroundColor,
              borderRadius: "5px",
              color: "white",
            },
          };
        }}
        components={{
          toolbar: (props) => (
            <CustomToolbar
              {...props}
              openForm={openForm}
              setView={setView}
              employeeId={employeeId}
              setEmployeeId={handleEmployeeSelection}
              showAllEmployeesCalendar={showAllEmployeesCalendar}
              isToday={isToday}
            />
          ),
          timeSlotWrapper: ({ children }) => (
            <div className="time-slot-wrapper">
              {children}
              {/* Current time line across all days */}
              <div
                className="current-time-line"
                style={{
                  position: "absolute",
                  top: `${currentTimeLinePosition}%`,
                  left: 0,
                  right: 0,
                  height: "2px",
                  backgroundColor: "#ff0000",
                  zIndex: 1,
                }}
              />
            </div>
          ),
        }}
        resources={
          showAllEmployeesCalendar
            ? employees.map((employee) => ({
                id: employee.id,
                title: employee.name || "Unnamed Employee",
              }))
            : null
        }
        resourceIdAccessor="id"
        resourceTitleAccessor="title"
        messages={{
          next: "Neste",
          previous: "Forrige",
          today: "I dag",
          month: "Måned",
          week: "Uke",
          day: "Dag",
          agenda: "Agenda",
          date: "Dato",
          time: "Tid",
          event: "Hendelse",
          allDay: "Hele dagen",
        }}
      />

      <BookingDetailModal
        booking={selectedBooking}
        show={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        refreshBookings={refreshBookings} // Pass refreshBookings as a prop
      />

      <Modal show={showForm} onHide={closeForm} centered>
        <Modal.Header className="d-flex justify-content-center">
          <Button
            variant="link"
            onClick={closeForm}
            className="position-absolute start-0 ms-2"
          >
            <img src={closeImg} alt="Close" />
          </Button>
          <Modal.Title>Add New Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <BookingForm closeForm={closeForm} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

const CustomToolbar = ({
  label,
  onNavigate,
  openForm,
  setView,
  employeeId,
  setEmployeeId,
  showAllEmployeesCalendar,
  isToday,
}) => {
  const [selectedLocation, setSelectedLocation] = useState("Select Location");
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const role = localStorage.getItem("employee_role");

  useEffect(() => {
    const storedEmployees = JSON.parse(localStorage.getItem("employees"));
    const storedLocations = JSON.parse(localStorage.getItem("locations"));
    if (storedEmployees) setEmployees(storedEmployees);
    if (storedLocations) setLocations(storedLocations);
  }, []);

  const handleToday = () => onNavigate("DATE", new Date());

  return (
    <div className="toolbar-container">
      <div className="right-section">
        <div className="lot">
          {role === "ADMIN" && (
            <div className="dropdown-container">
              <select
                className="dropdown"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="Select Location">Select Location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.name}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="lot">
          <div className="toolbar">
            <button
              onClick={() => onNavigate("PREV")}
              className="rotated-button"
            >
              <img src={lessImg} alt="Less" />
            </button>
            <button
              onClick={handleToday}
              className="today-button"
              style={{
                backgroundColor: isToday ? "#ffffff" : "#A19D99",
                color: isToday ? "#000000" : "#ffffff",
              }}
            >
              I dag
            </button>
            <span className="toolbar-label">{label}</span>
            <button
              onClick={() => onNavigate("NEXT")}
              className="rotated-button"
            >
              <img src={greaterImg} alt="Greater" />
            </button>
          </div>

          {role === "ADMIN" && (
            <div className="dropdown-container">
              <select
                className="dropdown"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              >
                <option value="">All Employees</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button onClick={openForm} className="new-booking-button">
            New Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomCalendar;
