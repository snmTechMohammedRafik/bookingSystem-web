import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Form, Button, Container } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditJournal = () => {
  const { journalId } = useParams(); // Get journal ID from URL
  const [postText, setPostText] = useState("");
  const [journalDate, setJournalDate] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]); // State for selected files
  const [existingAttachments, setExistingAttachments] = useState([]); // State to hold existing files
  const authTokenUser = localStorage.getItem("auth_token");

  useEffect(() => {
    fetchJournalDetail();
  }, [journalId]);

  const fetchJournalDetail = () => {
    axios
      .get(`${process.env.REACT_APP_URL}/api/v1/store/journal/${journalId}`, {
        headers: {
          Authorization: `Bearer ${authTokenUser}`,
        },
      })
      .then((response) => {
        const data = response.data.data;
        if (data) {
          console.log("Fetched journal data:", data);
          setPostText(data.journal_entry);
          setJournalDate(data.journal_datetime.split("T")[0]);
          setExistingAttachments(data.attachments || []);
        } else {
          console.warn("No journal details returned from API.");
        }
      })
      .catch((error) => {
        console.error("Error fetching journal detail:", error);
        toast.error("Failed to load journal details.");
      });
  };
  

  const handleFileChange = (e) => {
    setAttachedFiles(e.target.files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append(
      "req_body",
      JSON.stringify({
        journal_entry: postText,
        journal_datetime: journalDate,
      })
    );
  
    // Only add files if they exist and are valid
    Array.from(attachedFiles).forEach((file) => {
      formData.append("attachments", file);
    });
  
    axios
      .patch(
        `${process.env.REACT_APP_URL}/api/v1/store/journal/${journalId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authTokenUser}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        toast.success(response.data.message || "Journal updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating journal:", error);
        toast.error("Error updating journal entry.");
      });
  };
  

  return (
    <Container>
      <ToastContainer position="top-right" autoClose={5000} />
      <h2>Edit Journal Entry</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="journalDate" className="mb-3">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            value={journalDate}
            onChange={(e) => setJournalDate(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="postText" className="mb-3">
          <Form.Label>Entry</Form.Label>
          <Form.Control
            as="textarea"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            rows={5}
            required
          />
        </Form.Group>

        {/* Display existing attachments */}
        <Form.Group className="mb-3">
          <Form.Label>Existing Attachments</Form.Label>
          {existingAttachments.length > 0 ? (
            existingAttachments.map((file) => (
              <p key={file.id}>
                <a
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
        </Form.Group>

        {/* New file upload */}
        <Form.Group controlId="attachedFiles" className="mb-3">
          <Form.Label>Attach New Files</Form.Label>
          <Form.Control type="file" multiple onChange={handleFileChange} />
        </Form.Group>

        <Button type="submit">Update Entry</Button>
      </Form>
    </Container>
  );
};

export default EditJournal;
