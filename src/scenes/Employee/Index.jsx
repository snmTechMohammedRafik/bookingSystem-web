import React, { useEffect, useState } from "react";
import {
  Table,
  Modal,
  Form,
  Row,
  Col,
  Container,
  Button,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./EmployeeTable.css"; // Import custom CSS for styling
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import toastify CSS

import callImg from "../../assets/call.jpg";
import lockImg from "../../assets/lock.png";
import closeImg from "../../assets/X.png";
import uploadImg from "../../assets/Group.png";
import PencnlIconImg from "../../assets/edit-2.png";
import DeleteIconImg from "../../assets/Icon.png";

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [journalAccess, setJournalAccess] = useState(false);
  const [role, setRole] = useState("EMPLOYEE"); // Default role
  const [image, setImage] = useState(null);
  const authTokenUser = localStorage.getItem('auth_token');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_URL}/api/v1/store/employee/get`,
        {
          headers: {
            Authorization: `Bearer ${authTokenUser}`,
          },
        }
      );
      const data = await response.json();
      setEmployees(data.data); // Assuming data is an array of employee objects
    } catch (error) {
      toast.error("Error fetching employees!");
      console.error("Error fetching employees:", error);
    }
  };

  const handleShow = (employee) => {
    setEditEmployee(employee);
    setEmployeeId(employee.id); // Assuming employee object has an id field
    setName(employee.name);
    setPhone(employee.phone_number.replace("+45", "")); // Strip +45 for editing
    setAccessCode(employee.access_code); // Set access code for editing
    setJournalAccess(employee.journal_access); // Set journal access for editing
    setRole(employee.role); // Set role for editing
    setImage(null); // Reset image for editing
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    resetForm(); // Reset form fields
  };

  const resetForm = () => {
    setEditEmployee(null);
    setEmployeeId(null);
    setName("");
    setPhone("");
    setAccessCode(""); // Reset access code
    setJournalAccess(false);
    setRole("EMPLOYEE"); // Reset to default role
    setImage(null);
  };

  // Function to handle save action
  const handleSave = async () => {
    // Validate access code length
    if (accessCode.length !== 6) {
      toast.error("Access code must be 6 digits.");
      return;
    }

    // Validate phone number (must be 8 digits and numbers only)
    const phoneNumberRegex = /^[0-9]{8}$/;
    if (!phoneNumberRegex.test(phone)) {
      toast.error("Phone number must be 8 digits.");
      return;
    }

    // Create FormData object
    const formData = new FormData();

    // Create a JSON object for req_body
    const req_body = {
      name,
      phone_number: `+45${phone}`, // Prepend +45 to the phone number
      access_code: accessCode,
      journal_access: journalAccess,
      role,
    };

    // Append the req_body as a JSON string
    formData.append("req_body", JSON.stringify(req_body));

    // Append image if it exists
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_URL}/api/v1/store/employee/${
          employeeId || ""
        }`,
        {
          method: employeeId ? "PATCH" : "POST", // PATCH for updates, POST for new employees
          headers: {
            Authorization: `Bearer ${authTokenUser}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        fetchEmployees(); // Refresh the employee list
        handleClose(); // Close the modal
        toast.success(
          employeeId
            ? "Employee updated successfully!"
            : "Employee added successfully!"
        );
      } else {
        toast.error("Failed to save employee.");
        console.error("Failed to save employee");
      }
    } catch (error) {
      toast.error("Error saving employee!");
      console.error("Error saving employee:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_URL}/api/v1/store/employee/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${authTokenUser}`,
            },
          }
        );

        if (response.ok) {
          fetchEmployees(); // Refresh the employee list
          toast.success("Employee deleted successfully!");
        } else {
          toast.error("Failed to delete employee.");
          console.error("Failed to delete employee");
        }
      } catch (error) {
        toast.error("Error deleting employee!");
        console.error("Error deleting employee:", error);
      }
    }
  };

  const handleCreate = () => {
    setEditEmployee(null); // Reset editEmployee to null for creating a new employee
    resetForm(); // Clear form fields
    setShowModal(true); // Show the modal
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhone(value);
  };

  const formatPhoneNumber = (number) => {
    return number.replace(/(\d{2})(?=\d)/g, "$1 ");
  };

  return (
    <Container className="mainEmploye-table ">
      <>
        <Row className="sumbmain display-flex">
          <Col md={9}>
            <h2 className="main-heading">Medarbejdere</h2>
          </Col>
          <Col md={3}>
            <button
              variant="primary"
              className="Opret-medarbejder"
              onClick={handleCreate}
            >
              Opret medarbejder
            </button>
          </Col>
        </Row>

        <Container className="margin-1 ">
          <Container className="pl-5 pr-5">
            {/* Add a container for scrolling */}

            <div className="table-container">
              <Table bordered hover responsive className="employee-table">
                <thead style={{ borderRadius: "10px" }}>
                  <tr>
                    <th
                      style={{
                        paddingLeft: "30px",
                        // borderRadius: "25px 0px 0px 0px",
                      }}
                    >
                      Navn
                    </th>
                    <th style={{ textAlign: "center" }}>Telefon</th>
                    <th style={{ textAlign: "center" }}>Afdeling</th>
                    <th ></th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id} >
                      <td className="first-name">
                        {employee.image ? (
                          <>
                            <img
                              className="profile-img"
                              src={`${process.env.REACT_APP_IMG_URL}${employee.image}`}
                              style={{
                                width: "40px",
                                marginRight: "10px", // Margin on image
                                height: "40px",
                                marginLeft: "22px", // Image margin-left when present
                              }}
                              alt={employee.name}
                            />
                            <span
                              className="profile-text"
                              style={{ marginLeft: "0px" }} // Name has no margin when image is present
                            >
                              {employee.name}
                            </span>
                          </>
                        ) : (
                          <span
                            className="profile-text"
                            style={{ marginLeft: "22px" }} // 22px margin-left when no image
                          >
                            {employee.name}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {employee.phone_number
                          ? `+45 ${employee.phone_number
                              .replace("+45", "")
                              .replace(
                                /^(\d{2})(\d{2})(\d{2})(\d{2})$/,
                                "$1 $2 $3 $4"
                              )}`
                          : "" // Render an empty string if the phone number is null or empty
                        }
                      </td>

                      <td style={{ textAlign: "center" }}>
                        {employee.department} demo
                      </td>
                      <td className="d-flex justify-content-end">
                        <button
                          className="action-button"
                          onClick={() => handleShow(employee)}
                        >
                          <img src={PencnlIconImg} alt="Edit" />
                        </button>
                        <button
                          className="action-button"
                          onClick={() => handleDelete(employee.id)}
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

        {/* {/ Toast container /} */}
        <ToastContainer />

        {/* {/ Edit/Create Modal /} */}
        <Modal show={showModal} onHide={handleClose} className="add-employee-mainform ruted"
        >
          <Modal.Header className="d-flex justify-content-between">
            <button className="close-button " onClick={handleClose}>
              <img src={closeImg} alt="Close" />
            </button>
            <Modal.Title className="w-100 text-center">
              {editEmployee ? "Edit Employee" : "Add employee"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form >
              {/* {/ Employee Name /} */}
              <Form.Group controlId="formName">
                <Form.Label>Navn</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Employee Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Group>

              {/* {/ Phone Number (without country code) /} */}
              <Form.Group controlId="formPhone">
                <Form.Label>
                  <img src={callImg} style={{ width: "20px" }} alt="Phone" />{" "}
                  Phone Number
                </Form.Label>
                <div className="phone-input-wrapper">
                  <span className="phone-prefix">+45</span>
                  
                <Form.Control
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Phone Number (8 digits)"
                  value={formatPhoneNumber(phone)}
                  onChange={ handlePhoneChange}
                  maxLength={11}
                    required
                    className="phone-input p-5 pt-0 pb-0"
                />

</div>
              </Form.Group>

              {/* {/ Access Code /} */}
              <Form.Group controlId="formAccessCode">
                <Form.Label>
                  <img
                    src={lockImg}
                    style={{ width: "20px" }}
                    alt="Access Code"
                  />{" "}
                  Access Code
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Access code (6 digits)"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  maxLength={6}
                />
              </Form.Group>

              {/* {/ Role /} */}
              {/* <Form.Group controlId="formRole">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="EMPLOYEE">Employee</option>
                </Form.Select>
              </Form.Group> */}

              {/* {/ Journal Access /} */}
              <Form.Group controlId="formJournalAccess" className="mb-3 mt-2">
                <Form.Check
                  type="checkbox"
                  label="Journal Access"
                  checked={journalAccess}
                  onChange={(e) => setJournalAccess(e.target.checked)}
                />
              </Form.Group>

              {/* {/ Profile Image /}
             {/* Image Upload */}
              <Form.Group controlId="formImageUpload">
                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setImage(file);
                    }}
                    id="file-upload"
                    className="d-none" // Hide the default input
                  />
                  <label htmlFor="file-upload" className="image-upload-label">
                    <div className="image-upload-icon">
                      <img src={uploadImg} alt="Upload" />
                    </div>
                    <span>{image ? image.name : `Upload Employee Image`}</span>{" "}
                    {/* Show file name if selected */}
                  </label>
                  <Button
                    variant="secondary"
                    className="upload-button"
                    onClick={() =>
                      document.getElementById("file-upload").click()
                    } // Trigger file input click
                  >
                    Upload
                  </Button>
                </div>
              </Form.Group>
            </Form>
          </Modal.Body>
          <button onClick={handleSave} className="add-employee">
            {editEmployee ? "Update Employee" : "Add Employee"}
          </button>
          <Modal.Footer>
            {/* <button variant="secondary" onClick={handleClose}>
              Close
            </button>
            <button variant="primary" onClick={handleSave}>
              {editEmployee ? "Save Changes" : "Add Employee"}
            </button> */}
          </Modal.Footer>
        </Modal>
      </>
    </Container>
  );
};

export default EmployeeTable;
