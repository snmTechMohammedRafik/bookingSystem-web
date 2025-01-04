import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Form, Button, Row, Col, Container, Table } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import logImg from "../../assets/Book.png";
import printIcon from "../../assets/Icon (1).png";
import editIcon from "../../assets/Iconedit.png";
import backIcon from "../../assets/Vector.png";
import closeIcon from "../../assets/X.png";
import uploadIcon from "../../assets/upload.png";
import pinIcon from "../../assets/pinIcon.png";
import "react-toastify/dist/ReactToastify.css";
import "./Journal.css";

import jsPDF from "jspdf";
import "jspdf-autotable";

const Journal = () => {
  const { id } = useParams();
  const location = useLocation();
  const [journalData, setJournalData] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [postText, setPostText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [selectedJournalId, setSelectedJournalId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showingLogs, setShowingLogs] = useState(false);
  const [journalDetails, setJournalDetails] = useState(null); // State for journal details
  const navigate = useNavigate();
  const authTokenUser = localStorage.getItem("auth_token");
  const [employeeId, setEmployeeId] = useState(
    localStorage.getItem("employee_id")
  );
  const formatTodayDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [journalDate, setJournalDate] = useState(formatTodayDate());

  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensures month is numeric and two-digit
    const year = date.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    setJournalDate(formattedDate);
  };

  console.log("journalDetails:", journalDetails);
  console.log("attachedFiles:", attachedFiles);

  useEffect(() => {
    fetchJournalData();
  }, [id, authTokenUser]);

  const fetchJournalData = () => {
    axios
      .get(
        `${process.env.REACT_APP_URL}/api/v1/store/journal?outlet_customer_id=${id}`,
        {
          headers: {
            Authorization: `Bearer ${authTokenUser}`,
          },
        }
      )
      .then((response) => {
        // console.log(response.data.data);
        setJournalData(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching journal data:", error);
      });
  };

  const handleJournalClick = (journalId) => {
    const logEventUrl = `${process.env.REACT_APP_URL}/api/v1/store/journal/${journalId}`;

    axios
      .get(logEventUrl, {
        headers: {
          Authorization: `Bearer ${authTokenUser}`,
        },
      })
      .then((response) => {
        if (response.data.success) {
          setJournalDetails(response.data.data); // Set journal details, including attachments
          setAttachedFiles(response.data.data.attachments || []); // Store existing attachments in state
        } else {
          toast.error("Failed to load journal details.");
        }
      })
      .catch((error) => {
        console.error("Error fetching journal details:", error);
        toast.error("Failed to load journal details.");
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Add JSON string for req_body
    const reqBody = {
      employee_id: employeeId,
      journal_datetime: formatForApi(journalDate), // Ensure this is in YYYY-MM-DD format
      journal_entry: postText,
      outlet_customer_id: id,
    };
    formData.append("req_body", JSON.stringify(reqBody));

    // Add each file under "attachments" as individual entries
    attachedFiles.forEach((file) => {
      formData.append("attachments", file);
    });

    // Set up the API request
    const apiEndpoint = selectedJournalId
      ? `${process.env.REACT_APP_URL}/api/v1/store/journal/${selectedJournalId}`
      : `${process.env.REACT_APP_URL}/api/v1/store/journal`;

    const apiMethod = selectedJournalId ? "patch" : "post";

    axios({
      method: apiMethod,
      url: apiEndpoint,
      data: formData,
      headers: {
        Authorization: `Bearer ${authTokenUser}`,
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => {
        toast.success(
          response.data.message || "Journal entry saved successfully!"
        );
        fetchJournalData();
        resetForm();
      })
      .catch((error) => {
        console.error("Error saving journal data:", error);
        toast.error("Error saving journal entry!");
      });
  };

  const formatForApi = (dateString) => {
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
  };

  const resetForm = () => {
    setPostText("");
    setJournalDate(formatTodayDate()); // Reset to today’s date
    setAttachedFiles([]);
    setSelectedJournalId(null);
    setIsCreating(false);
    setJournalDetails(null);
  };

  const handleLogClick = () => {
    setShowingLogs(true);
    const logUrl = `${process.env.REACT_APP_URL}/api/v1/store/journal/logs/${id}`;
    axios
      .get(logUrl, {
        headers: {
          Authorization: `Bearer ${authTokenUser}`,
        },
      })
      .then((response) => {
        setLogs(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching logs:", error);
        toast.error("Failed to fetch logs.");
      });
  };

  const handleBackClick = () => {
    if (journalDetails === null) {
      // If journalDetails is already null, refresh the page
      window.location.reload();
    } else {
      // If journalDetails is not null, reset it
      setJournalDetails(null);
    }
  };

  const handleBackClickToJournal = () => {
    navigate(`/coustmer`);
  };

  const handleBackClickToCoustomer = () => {
    navigate(`/coustmer`);
  };

  const handleEditClick = () => {
    if (journalDetails) {
      setJournalDetails(null); // Close the details view
      setIsCreating(true); // Open the form in edit mode
      setSelectedJournalId(journalDetails.id); // Set the ID of the journal being edited
      setPostText(journalDetails.journal_entry); // Pre-fill journal entry text
      setJournalDate(formatJournalDate(journalDetails.journal_datetime)); // Format the date if necessary
    } else {
      toast.error("Journal details are not loaded. Cannot edit.");
    }
  };

  const formatJournalDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handlePrintClick = (journalId) => {
    const printUrl = `${process.env.REACT_APP_URL}/api/v1/store/journal/pdf/${journalId}`;
    console.log("Requesting PDF download from URL:", printUrl);

    axios
      .get(printUrl, {
        headers: {
          Authorization: `Bearer ${authTokenUser}`,
        },
        responseType: "blob", // Important for downloading files
      })
      .then((response) => {
        console.log("Response data:", response);
        console.log("Blob data:", response.data);

        const url = window.URL.createObjectURL(new Blob([response.data]));
        console.log("Generated download URL:", url);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Journal_${journalId}.pdf`); // File name for download
        document.body.appendChild(link);
        link.click();
        link.remove();

        toast.success("PDF downloaded successfully.");
      })
      .catch((error) => {
        console.error("Error downloading PDF:", error);

        // Log additional information if available
        if (error.response) {
          console.error("Error response data:", error.response.data);
          console.error("Error response status:", error.response.status);
          console.error("Error response headers:", error.response.headers);
        } else if (error.request) {
          console.error("Error request data:", error.request);
        } else {
          console.error("General error message:", error.message);
        }

        toast.error("Failed to download PDF.");
      });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    // Update attachedFiles with the selected files and avoid duplicates
    setAttachedFiles((prevFiles) => {
      const newFiles = files.filter(
        (newFile) =>
          !prevFiles.some((prevFile) => prevFile.name === newFile.name)
      );
      return [...prevFiles, ...newFiles]; // Append only non-duplicate files
    });

    // Log files for debugging
    // console.log("Files selected:", files);
  };

  const limitWords = (text) => {
    // Add null or undefined check
    if (!text) {
      return "";
    }
    return text.length > 30 ? text.slice(0, 30) + ".." : text;
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        draggable
        pauseOnHover
      />

      <Container className="mainEmploye-table">
        <Row className="sumbmain display-flex">
          <Col
            md={9}
            className="sumbmain display-flex-1"
            style={{ display: "flex", alignItems: "center", gap: "37px" }}
          >
            {journalDetails === null && !isCreating ? (
              // Show alternate button when in Journal List View
              <button
                onClick={handleBackClickToJournal}
                style={{ background: "none", border: "none" }}
              >
                <img src={closeIcon} alt="Close" />
              </button>
            ) : (
              // Show back button when in detail or edit view
              <button
                onClick={handleBackClick}
                style={{ background: "none", border: "none" }}
              >
                <img src={backIcon} alt="Back" />
              </button>
            )}

            <h2 className="main-heading">
              {location.state?.name || "Customer"}
            </h2>
          </Col>
          <Col md={3} className="sumbmain display-flex-2">
            <Button
              variant="primary"
              className="Opret-medarbejder"
              onClick={() => setIsCreating(true)}
            >
              Create Journal
            </Button>
          </Col>
        </Row>

        <Container className="margin-1">
          {/* Display journal details */}
          {journalDetails ? (
            // Journal Detail View
            <Container className="pl-5 pr-5">
              <div className="table-container Journal-1">
                <Table bordered hover responsive className="employee-table">
                  <thead>
                    <tr
                      style={{
                        justifyContent: "space-between",
                      }}
                    >
                      {/* Journal - Align to the left */}
                      <th
                        style={{
                          paddingLeft: "30px",
                          flex: 1,
                          textAlign: "left",
                        }}
                      >
                        Journal
                      </th>

                      {/* Buttons - Align to the right */}
                      <th
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "10px", // Add space between the buttons if needed
                          flex: 1,
                          paddingRight: "98px",
                        }}
                      >
                        <button
                          onClick={handleEditClick}
                          style={{
                            background: "none",
                            border: "none",
                            marginRight: "54px",
                          }}
                        >
                          <img src={editIcon} alt="Edit" />
                        </button>
                        <button
                          onClick={() => handlePrintClick(journalDetails.id)}
                          style={{ background: "none", border: "none" }}
                        >
                          <img src={printIcon} alt="Print" />
                        </button>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <div className="jornal-body-details">
                      <div className="jornal-body-content">
                        <p>
                          <strong>Written by: </strong>
                          <span>{journalDetails.employee_name}</span>
                        </p>
                        <p>
                          <strong>Date: </strong>
                          {new Date(
                            journalDetails.journal_datetime
                          ).toLocaleString()}
                        </p>
                        <p>
                          <strong>Client: </strong>
                          {journalDetails.customer_name}
                        </p>
                        <p>
                          <strong>CPR: </strong>
                          {journalDetails.customer_cpr || "null"}
                        </p>
                        <hr />
                        <p>{journalDetails.journal_entry}</p>
                        <hr />
                        <div className="attached-files">
  <span>
    Attached files: <strong>{journalDetails.attachments ? journalDetails.attachments.length : 0}</strong>
  </span>
  {journalDetails.attachments && journalDetails.attachments.length > 0 ? (
    journalDetails.attachments.map((file, index) => (
      <p key={file.id}>
        <img src={pinIcon} alt="Pin" className="m-2" />
        <a
          style={{ color: "black", textDecoration: "none" }}
          href={`${process.env.REACT_APP_URL}/${file.attachment}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {file.attachment_name}
        </a>
      </p>
    ))
  ) : (
    <p>No files attached.</p>
  )}
</div>


                      </div>
                    </div>
                  </tbody>
                </Table>
              </div>
            </Container>
          ) : isCreating ? (
            // Create/Edit Journal Form
            <Container className="pl-5 pr-5">
              <div className="table-container">
                <Table bordered hover responsive className="employee-table">
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: "30px" }}>
                        {selectedJournalId ? "Edit Journal " : "Add Journal "}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <Form
                          onSubmit={handleSubmit}
                          className="journal-form-creat"
                          style={{
                            padding: "10px 66px 10px 41px",
                          }}
                        >
                          <Form.Group controlId="postText" className="mb-3">
                            <span
                              style={{
                                fontSize: "25px",
                                fontWeight: "700",
                              }}
                            >
                              post
                            </span>
                            <Form.Control
                              as="textarea"
                              placeholder="Write here..."
                              style={{
                                width: "100%",
                                height: "200px",
                                borderRadius: "12px",
                                border: "1px solid #ced4da",
                                marginTop: "10px",
                                fontSize: "25px",
                                fontWeight: "400",
                              }}
                              value={postText}
                              onChange={(e) => setPostText(e.target.value)}
                            />
                          </Form.Group>
                          <Row
                            style={{ marginTop: "10px", marginBottom: "20px" }}
                          >
                            {/* Date Picker Button */}

                            <Col md={4}>
                              <Form.Group
                                controlId="attachedFiles"
                                className="mb-3"
                              >
                                <Form.Label
                                  style={{
                                    fontSize: "25px",
                                    color: "#545454",
                                    fontWeight: "700",
                                  }}
                                >
                                  Upload files & pictures
                                </Form.Label>
                                <button
                                  type="button" // Add this line to prevent form submission
                                  onClick={() =>
                                    document.getElementById("fileInput").click()
                                  }
                                  className="file-attatchment"
                                >
                                  <img
                                    src={uploadIcon}
                                    alt="Attach"
                                    style={{ marginRight: "37px" }}
                                  />
                                  {attachedFiles.length > 0
                                    ? `${attachedFiles.length} file(s) selected`
                                    : "Upload here"}
                                </button>
                                <Form.Control
                                  id="fileInput"
                                  type="file"
                                  multiple
                                  style={{ display: "none" }} // Hidden file input
                                  onChange={handleFileSelect}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}></Col>

                            <Col md={2}>
                              <Form.Group className="mb-3 date-journal">
                                <Form.Label
                                  style={{
                                    fontSize: "25px",
                                    color: "#000000",
                                    fontWeight: "700",
                                  }}
                                >
                                  Date
                                </Form.Label>
                                <Form.Control
                                  type="date"
                                  value={journalDate
                                    .split("-")
                                    .reverse()
                                    .join("-")} // Converts DD-MM-YYYY to YYYY-MM-DD for input
                                  onChange={(e) => handleDateChange(e)} // Update date format on change
                                  className="date-input-journal"
                                />
                              </Form.Group>
                            </Col>

                            {/* File Upload Button */}
                          </Row>
                          {/* Display selected file names */}
                          <div className="show-selected-files ">
                            <span>
                              Attached files:{" "}
                              <strong>{attachedFiles.length}</strong>
                            </span>
                            {attachedFiles.length > 0 ? (
                              <div>
                                {attachedFiles.map((file, index) => (
                                  <div key={index}>
                                    <img
                                      src={pinIcon}
                                      alt="Attach"
                                      style={{
                                        width: "16px",
                                        marginRight: "8px",
                                      }}
                                    />
                                    {file.name}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p>No files selected</p>
                            )}
                          </div>

                          <div className="text-center">
                            <button type="submit" className="save-btn-journal ">
                              {selectedJournalId
                                ? "Update Journal "
                                : "Add Journal "}
                            </button>
                          </div>
                        </Form>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Container>  
          ) : showingLogs ? (
             // Journal Logs View with Back button
             <Container className="pl-5 pr-5 journal-list">
             <div className="table-container Journal-Logs-1">
               <Table bordered hover responsive className="employee-table">
                 <thead>
                   <tr>
                     <th>Journal Logs</th>
                   </tr>
                 </thead>
                 <tbody className="journal-logs-tableBody">
                   <tr>
                     <td>
                       <div className="log-box-wrapper">
                         <div className="log-box-scrollable">
                           {logs.length > 0 ? (
                             logs.map((log) => (
                               <div key={log.id} className="log-entry">
                                 <div className="log-header">
                                   <p style={{ marginTop: "20px" }}>
                                     <strong>Journal ID: </strong>
                                     {log.journal_id}
                                   </p>
                                   <p>
                                     <strong>Status: </strong>
                                     {log.event}
                                   </p>
                                   <p>
                                     <strong>Date: </strong>
                                     {log.created_at}
                                   </p>
                                   <p>
                                     <strong>Employee: </strong>
                                     {log.employee_name}
                                   </p>
                                   <p>{log.log_datetime}</p>
                                   <br />
                                 </div>
                                 <hr />
                                 <div className="log-message-content">
                                   <p>{log.log_message}</p>
                                 </div>
                               </div>
                             ))
                           ) : (
                             <div>No logs found</div>
                           )}
                         </div>
                       </div>
                     </td>
                   </tr>
                 </tbody>
               </Table>
             </div>
           </Container>
          ) : (
            // Journal List View
            <div className="table-container Journal-1">
              <Table bordered hover responsive className="employee-table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: "30px" }}>Journal</th>{" "}
                    {/* Header for Journal */}
                    <th></th> {/* Empty header cell to maintain alignment */}
                    <th style={{ textAlign: "right", paddingRight: "98px" }}>
                      {" "}
                      {/* Align the image to the right */}
                      <img
                        src={logImg}
                        alt="Log"
                        className="log-img"
                        onClick={handleLogClick}
                      />
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {journalData.map((entry) => (
                    <div
                      key={entry.id}
                      className="journal-box"
                      onClick={() => handleJournalClick(entry.id)}
                    >
                      <div className="journal-header d-flex justify-content-between">
                        <span className="employee-name">
                          {limitWords(entry.employee_name) || "Employee name"}
                        </span>
                        <span className="entry-date">
                          {entry.journal_datetime.split("T")[0]}
                        </span>
                      </div>
                      <div className="entry-content">
                        {limitWords(entry.journal_entry)}
                        {/* {entry.journal_entry || "No notes available"} */}
                      </div>
                    </div>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Container>
      </Container>
    </>
  );
};

export default Journal;
