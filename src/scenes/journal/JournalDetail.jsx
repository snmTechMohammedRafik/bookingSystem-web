import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import "./JournalDetail.css"; // Add your CSS file if needed

const JournalDetail = () => {
  const { journalId } = useParams(); // Get journal ID from the URL
  const [journalDetails, setJournalDetails] = useState(null); // State to hold journal details
  const authTokenUser = localStorage.getItem("auth_token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchJournalDetails();
  }, [journalId]);

  // Fetch journal details using the journal ID
  const fetchJournalDetails = () => {
    const logEventUrl = `${process.env.REACT_APP_URL}/api/v1/store/journal/${journalId}`;

    axios
      .get(logEventUrl, {
        headers: {
          Authorization: `Bearer ${authTokenUser}`,
        },
      })
      .then((response) => {
        if (response.data.success) {
          setJournalDetails(response.data.data);
        } else {
          toast.error("Failed to load journal details.");
          navigate("/journal");
        }
      })
      .catch((error) => {
        console.error("Error fetching journal details:", error);
        toast.error("Failed to load journal details.");
        navigate("/journal");
      });
  };

  return (
    <Container className="journal-detail-container">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick draggable pauseOnHover />
      
      {journalDetails ? (
        <Row className="journal-detail">
          <Col md={12}>
            <h2>Journal Details</h2>
            <div className="journal-box">
              <div className="journal-header">
                <h4>Employee: {journalDetails.employee_name}</h4>
                <h4>Journal ID: {journalDetails.id}</h4>
                <h4>Created on: {new Date(journalDetails.journal_datetime).toLocaleString()}</h4>
              </div>
              <div className="journal-content">
                <h5>Journal Entry:</h5>
                <p>{journalDetails.journal_entry}</p>
              </div>
              {journalDetails.attachments && journalDetails.attachments.length > 0 && (
                <div className="journal-files">
                  <h5>Attached Files:</h5>
                  {journalDetails.attachments.map((file, index) => (
                    <a key={index} href={file.file_url} target="_blank" rel="noopener noreferrer">
                      {file.file_name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Col>
        </Row>
      ) : (
        <p>Loading journal details...</p>
      )}
    </Container>
  );
};

export default JournalDetail;


