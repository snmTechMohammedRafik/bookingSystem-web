import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Container,
  Row,
  Col,
  Table,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import closeImg from "../../assets/X.png";
import DeleteIconImg from "../../assets/Icon.png";
import PencnlIconImg from "../../assets/edit-2.png";
import editIMg from "../../assets/editosn.png";
import profileImg from "../../assets/profile.png";
import emailIcon from "../../assets/sms.png";
import phoneIcon from "../../assets/call.jpg";

import "./coustmer.css";
import { useNavigate } from "react-router-dom";

const AddCustomerForm = () => {
  const [showModal, setShowModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [crp, setCrp] = useState(""); // Added CRP state
  const [employees, setEmployees] = useState([]);
  const [selectedCoustmer, setSelectedCoustmer] = useState(null);
  const authTokenUser = localStorage.getItem('auth_token');
  console.log("Selected Employee:", selectedCoustmer);

  const navigate = useNavigate();

  // Fetch customer list on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_URL}/api/v1/store/customer?search=&offset=0&limit=25`,
        {
          headers: {
            Authorization: `Bearer ${authTokenUser}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched customers:", data); // Log the fetched data
        setEmployees(data.data.data); // Adjust based on your API response structure
      } else {
        toast.error("Failed to fetch customers.");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Error fetching customers.");
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhone(value);
  };

  const formatPhoneNumber = (number) => {
    return number.replace(/(\d{2})(?=\d)/g, "$1 ");
  };

  const handleSaveCustomer = async () => {
    if (phone.length !== 8) {
      toast.error("Phone number must be 8 digits.");
      return;
    }

    if (!customerName) {
      toast.error("Customer name is required.");
      return;
    }

    if (!email) {
      toast.error("Email is required.");
      return;
    }

    const req_body = {
      name: customerName,
      phone_number: phone,
      email: email,
      crp: crp, // Include CRP in the request body
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_URL}/api/v1/store/customer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authTokenUser}`,
          },
          body: JSON.stringify(req_body),
        }
      );

      if (response.ok) {
        toast.success("Customer added successfully!");
        fetchCustomers(); // Refresh the customer list
        handleClose();
      } else {
        const errorData = await response.json();
        toast.error(
          `Failed to add customer: ${errorData.message || "Unknown error"}`
        );
        console.error("Failed to add customer:", errorData);
      }
    } catch (error) {
      toast.error("Error adding customer!");
      console.error("Error adding customer:", error);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    resetForm();
  };

  const handelEmployeeClose = () => {
    setShowEmployeeModal(false);
  };

  const handleShowEmploye = (employee) => {
    setSelectedCoustmer(employee); // Set the selected customer details
    setShowEmployeeModal(true); // Open the modal
  };

  const resetForm = () => {
    setPhone("");
    setCustomerName("");
    setEmail("");
    setCrp(""); // Reset CRP field
    setSelectedCoustmer(null);
  };

  const handleEditCustomer = async (employee) => {
    setSelectedCoustmer(employee);
    setPhone(employee.phone_number);
    setCustomerName(employee.name);
    setEmail(employee.email);
    setCrp(employee.crp || ""); // Set CRP from the selected employee

    setShowModal(true);
  };

  const handleUpdateCustomer = async () => {
    if (!selectedCoustmer || !selectedCoustmer.id) {
      toast.error("Customer ID is missing!");
      return;
    }

    const req_body = {
      name: customerName,
      phone_number: phone,
      email: email,
      crp: crp || null, // Send CRP only if provided, otherwise null
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_URL}/api/v1/store/customer?id=${selectedCoustmer.id}`, // Ensure the ID is included here
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authTokenUser}`,
          },
          body: JSON.stringify(req_body),
        }
      );

      if (response.ok) {
        toast.success("Customer updated successfully!");
        handleClose();
        fetchCustomers(); // Refresh the customer list after update
      } else {
        const errorData = await response.json();
        toast.error(
          `Failed to update customer: ${errorData.message || "Unknown error"}`
        );
        console.error("Failed to update customer:", errorData);
      }
    } catch (error) {
      toast.error("Error updating customer!");
      console.error("Error updating customer:", error);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_URL}/api/v1/store/customer?id=${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${authTokenUser}`,
            },
          }
        );

        if (response.ok) {
          toast.success("Customer deleted successfully!");
          fetchCustomers(); // Refresh the customer list
        } else {
          const errorData = await response.json();
          toast.error(
            `Failed to delete customer: ${errorData.message || "Unknown error"}`
          );
          console.error("Failed to delete customer:", errorData);
        }
      } catch (error) {
        toast.error("Error deleting customer!");
        console.error("Error deleting customer:", error);
      }
    }
  };

  return (
    <>
      <Container className="mainEmploye-table">
        <Row className="sumbmain display-flex">
          <Col md={9}>
            <h2 className="main-heading">Customers</h2>
          </Col>
          <Col md={3}>
            <button
              variant="primary"
              className="Opret-medarbejder"
              onClick={() => setShowModal(true)}
            >
              Create customer
            </button>
          </Col>
        </Row>

        <Container className="margin-1">
          <Container className="pl-5 pr-5">
            <div className="table-container">
              <Table bordered hover responsive className="employee-table">
                <thead style={{ borderRadius: "10px" }}>
                  <tr>
                    <th style={{ paddingLeft: "30px" }}>Navn</th>
                    <th style={{ textAlign: "start" }}>Telefon</th>
                    <th style={{ textAlign: "start" }}>Email</th>
                    <th style={{ textAlign: "start" }}>Bookings</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
  {employees.map((employee) => (
    <tr
      key={employee.id}
      onClick={() => handleShowEmploye(employee)} // Trigger handleShowEmploye on row click
      style={{ cursor: "pointer" }} // Change cursor to pointer for better UX
    >
      <td className="first-name" style={{ paddingLeft: "30px" }}>
        {employee.name}
      </td>
      <td style={{ textAlign: "start" }}>
        {`+45 ${employee.phone_number
          .replace("+45", "")
          .replace(/^(\d{2})(\d{2})(\d{2})(\d{2})$/, "$1 $2 $3 $4")}`}
      </td>
      <td style={{ textAlign: "start" }}>{employee.email}</td>
      <td style={{ textAlign: "start" }}>{employee.total_bookings}</td>
      <td className="d-flex justify-content-end">
        <button className="action-button">
          <img
            src={editIMg}
            alt="journal"
            onClick={(e) => {
              e.stopPropagation(); // Prevents row click event
              handleShowEmploye(employee);
            }}
          />
        </button>
        <button
          className="action-button"
          onClick={(e) => {
            e.stopPropagation(); // Prevents row click event
            handleEditCustomer(employee);
          }}
        >
          <img src={PencnlIconImg} alt="Edit" />
        </button>
        <button
          className="action-button"
          onClick={(e) => {
            e.stopPropagation(); // Prevents row click event
            handleDeleteCustomer(employee.id);
          }}
        >
          <img src={DeleteIconImg} alt="Delete" />
        </button>
      </td>
    </tr>
  ))}
</tbody>

              </Table>
            </div>
          </Container>
        </Container>

        <Modal show={showModal} onHide={handleClose} className="ruted">
          <Modal.Header className="d-flex justify-content-between align-items-center coustmer-main-form ">
            <button className="close-button" onClick={handleClose}>
              <img src={closeImg} alt="Close" />
            </button>
            <Modal.Title className="mx-auto">
              {selectedCoustmer ? "Edit Customer" : "Add New Customer"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formCustomerName">
                <Form.Label>
                  <img
                    src={profileImg}
                    alt="profile"
                    style={{ marginRight: "8px" }}
                  />
                  Name
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formPhone" className="phone-group">
                <Form.Label>
                  <img
                    src={phoneIcon}
                    alt="phone"
                    style={{ marginRight: "4px" }}
                  />
                  Phone number
                </Form.Label>
                <div className="phone-input-wrapper">
                  <span className="phone-prefix">+45</span>
                  <Form.Control
  type="tel"
  placeholder="phone number"
  value={formatPhoneNumber(phone)} // Format the phone number for display
  onChange={handlePhoneChange}
  maxLength={11} // 8 digits + 3 spaces = 11
  required
  className="phone-input p-5 pt-0 pb-0"
/>
                </div>
              </Form.Group>

              <Form.Group controlId="formEmail">
                <Form.Label>
                  <img
                    src={emailIcon}
                    alt="email"
                    style={{ marginRight: "4px" }}
                  />
                  Email (optional)
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formCRP">
                <Form.Label>
                  <img
                    src={emailIcon}
                    alt="crp"
                    style={{ marginRight: "4px" }}
                  />
                  CRP (optional)
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="000000-XXXX"
                  value={crp}
                  onChange={(e) => setCrp(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          {selectedCoustmer ? (
            <button className="add-employee" onClick={handleUpdateCustomer}>
              Update Customer
            </button>
          ) : (
            <button
              variant="primary"
              className="add-employee"
              onClick={handleSaveCustomer}
            >
              Add New Customer
            </button>
          )}
          {/* <Modal.Footer className="d-flex justify-content-center">
            
          </Modal.Footer> */}
        </Modal>

        {/* Modal using React Bootstrap */}
        <Modal
          show={showEmployeeModal}
          onHide={handelEmployeeClose}
          centered
          className="main-journal ruted" 
        >
          <Modal.Header className="d-flex justify-content-between align-items-center">
            <button className="close-button" onClick={handelEmployeeClose}>
              <img src={closeImg} alt="Close" />
            </button>
            <Modal.Title
              className="w-100 coustmer-details-main"
              style={{ fontSize: "35px", fontWeight: "400" }}
            >
              Customer details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ marginBottom: "55px",marginTop:"49px",    width: "93%" }}>
            {selectedCoustmer ? (
              <div className="customer-info">
                <div className="info-row">
                  <span>Name</span> <span><strong>{selectedCoustmer.name}</strong></span>
                </div>
                <div className="info-row">
                  <span>Phone number</span>{" "}
                  <strong><span>{selectedCoustmer.phone_number}</span></strong>
                </div>
                <div className="info-row">
                <strong><span>Email:</span> <span>{selectedCoustmer.email}</span></strong>
                </div>
                <div className="info-row">
                  <span>Bookings:</span>{" "}
                  <strong><span>{selectedCoustmer.total_bookings || "N/A"}</span></strong>
                </div>
                <div className="info-row" style={{ borderBottom: "none" }}>
                  <span>Revenue (total):</span>{" "}
                  <strong><span>{selectedCoustmer.revenue || "N/A"} kr.</span></strong>
                </div>
              </div>
            ) : (
              <p>Loading customer details...</p>
            )}
          </Modal.Body>
          <Button
  variant="secondary"
  className="add-coustmer "
  onClick={() => {
    // Navigate to Journal component with customer data
    navigate(`/journal/${selectedCoustmer.id}`, { state: { name: selectedCoustmer.name } });
  }}
>
  Journal
</Button>
          <Button
            variant="secondary"
            className="add-coustmer"
            onClick={() => {
              handelEmployeeClose(); // Close the current modal
              handleEditCustomer(selectedCoustmer); // Open the edit form
            }}
          >
            Edit customer
          </Button>
          <Button
            className="deleat-coustmer"
            variant="danger"
            onClick={() => {
              handleDeleteCustomer(selectedCoustmer.id); // Delete the customer
              handelEmployeeClose(); // Close the modal after deletion
            }}
          >
            Delete customer
          </Button>
          <Modal.Footer></Modal.Footer>
        </Modal>

        <ToastContainer />
      </Container>
    </>
  );
};

export default AddCustomerForm;
