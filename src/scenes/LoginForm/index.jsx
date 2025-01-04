import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./LoginForm.css";
import { Row } from "react-bootstrap";
import locImg from "../../assets/lock.jpg";
import phoneImg from "../../assets/call.jpg";
import tickImg from "../../assets/Vector (1).png";
import { useNavigate } from "react-router-dom";
import eyeOpen from "../../assets/Hide.jpg";
import eyeClosed from "../../assets/Hide.jpg";
import loginImg from "../../assets/Group 1261155183.png";

const LoginFlow = () => {
  const [step, setStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [passcode, setPasscode] = useState(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);

  const [locations, setLocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState([]);

  const handleLogin = async () => {
    try {
      const sanitizedPhone = phone.replace(/\s/g, "");
      const response = await axios.post(
        "https://api.fiind.app/api/v1/store/auth/login",
        {
          country_code: "+45",
          phone_number: sanitizedPhone,
          password: password,
          fcm_token: "ABC",
        }
      );

      const { success, data } = response.data;
      if (success) {
        const locationData = data.map((location) => ({
          name: location.profile.name,
          email: location.profile.email,
          image: location.profile.profile_image
            ? `${location.image_base_url}${location.profile.profile_image}`
            : "/default-profile.jpg",
          employees: location.profile.employees.map((employee) => ({
            ...employee,
            image: employee.profile_image
              ? `${location.image_base_url}${employee.profile_image}`
              : null,


            })),
            schedules: location.profile.schedules.map((schedule) => ({
              ...schedule,
            })),
            is_active : location. is_active
        }));

        setLocations(locationData);
        setLoginData(data);
        setStep(2);
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  const handleSelectLocation = (index) => {
    setSelectedLocation(index);
    setEmployees(locations[index].employees);

    const selectedLocationToken = loginData[index].access_token;
    localStorage.setItem("auth_token", selectedLocationToken);
  };

  const handleSelectEmployee = (index) => {
    setSelectedEmployee(index);
  };

  const handleNext = () => {
    const combinedPasscode = passcode.join(""); // Joining passcode array into a single string

    if (step === 2 && selectedLocation !== null) {
      setStep(3);
    } else if (step === 3 && selectedEmployee !== null) {
      setStep(4);
    } else if (step === 4 && combinedPasscode.length === 6) {
      const employee = employees[selectedEmployee]; // Getting selected employee data

      if (!employee) {
        toast.error("Please select an employee."); // Alert if no employee is selected
        return;
      }

      if (employee.access_code === combinedPasscode) {
        // Validate only the access code
        toast.success("Access Granted!"); // Success notification

        console.log(`Selected Employee ID: ${employee.id} ${employee.role}`); // Logging employee ID
        localStorage.setItem("employee_role", employee.role); // Store selected employee ID
        localStorage.setItem("employee_id", employee.id); // Store selected employee ID
        localStorage.setItem("employees", JSON.stringify(employees)); // Store the full employees list
        navigate("/calendar"); // Redirect to calendar page
      } else {
        console.log("Passcode entered:", combinedPasscode);
        console.log("Expected passcode:", employee.access_code);

        toast.error("Invalid passcode."); // Error notification if access code is incorrect
      }
    }
  };

  const handlePasscodeChange = (e, index) => {
    const newPasscode = [...passcode];
    newPasscode[index] = e.target.value.slice(-1);
    setPasscode(newPasscode);

    if (e.target.value && index < passcode.length - 1) {
      document.getElementById(`passcode-${index + 1}`).focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && !passcode[index] && index > 0) {
      document.getElementById(`passcode-${index - 1}`).focus();
    }
  };

  const handlePhoneInput = (e) => {
    let input = e.target.value.replace(/\D/g, "");
    input = input.slice(0, 8);
    input = input.replace(/(\d{2})(?=\d)/g, "$1 ");
    setPhone(input);
  };

  return (
    <div className="main-contianer" style={{backgroundClip:"#b5a393",    height: "100vh"}}>
      <img
        src={loginImg}
        alt="Login"
        className="login-img"
      />
      <div className="main-login">
        <ToastContainer />
        {step === 1 && (
          <div className="step active">
            <h2>Log ind</h2>
            <div className="mainform-row">
              <span className="label">
                <img src={phoneImg} alt="Profile" /> Indtast telefonnummer
              </span>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    top: "51%",
                    left: "28px",
                    transform: "translateY(-50%)",
                    fontSize: "24px",
                    color: "#888",
                    pointerEvents: "none",
                    fontWeight:"500",
                    color:"#000000"
                  }}
                >
                  +45
                </span>
                <input
                  type="tel"
                  placeholder="30 60 00 37"
                  value={phone}
                  onChange={handlePhoneInput}
                  style={{
                    fontSize: "24px",
                    paddingLeft: "74px",
                    width: "100%",
                  }}
                />
              </div>
            </div>
            <Row className="mainform-row">
              <span className="label"  style={{
                   marginTop:"23px"
                  }}>
                <img src={locImg} alt="Profile" /> Adgangskode
              </span>
              <div style={{ position: "relative", width: "100%", padding:"0px" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Adgangskode"
                  value={password.replace(/\s/g, "")}
                  onChange={(e) =>
                    setPassword(e.target.value.replace(/\s/g, ""))
                  }
                  style={{
                    fontSize: "24px",
                    padding: "28px",
                    width: "100%",
                    textAlign: "left",
                  }}
                />
                <img
                  src={showPassword ? eyeOpen : eyeClosed}
                  alt="Toggle Password Visibility"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: "absolute",
                    right: "28px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    width: "24px",
                    height: "24px",
                  }}
                />
              </div>
            </Row>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <button className="add-employee aploy" onClick={handleLogin}>
                Log ind
              </button>
              <span
                style={{
                  color: "#6F6F6F",
                  fontSize: "22px",
                  fontWeight: "400",
                  marginBottom: "15px",
                }}
              >
                Glemt adgangskode Log
              </span>
            </div>
          </div>
        )}
        {step === 2 && (
         <div className="step active ">
             <div className="step3">
         <h2 style={{marginTop:"16px"}}>Choose Department</h2>
         {locations.map((location, index) => (
  <div
    key={index}
    className={`select-item ${
      selectedLocation === index ? "selected" : ""
    } ${location.is_active ? "" : "inactive"}`} // Add 'inactive' class if not active
    onClick={() => location.is_active && handleSelectLocation(index)} // Only select if active
    style={{ position: "relative", cursor: location.is_active ? "pointer" : "not-allowed" }} // Add 'not-allowed' cursor for inactive
  >
    <img src={location.image} alt="Profile" />
    <div className="dote">
      <div>{location.name}</div>
      <small>{location.email}</small>
    </div>
    {location.is_active && selectedLocation === index && (
      <img
        src={tickImg}
        alt="Selected"
        style={{
          position: "absolute",
          top: "25px",
          right: "10px",
          width: "20px",
          height: "20px",
        }}
      />
    )}
  </div>
))}
         </div>
         <button
           className="button"
           disabled={selectedLocation === null}
           onClick={handleNext}
         >
           Next
         </button>
       </div>
       
        )}
        {step === 3 && (
          <div className="step active">
                    <div className="step3">
                    <h2 style={{marginTop:"16px"}}>Choose Employee</h2>
            {employees.map((employee, index) => (
              <div
                key={index}
                className={`select-item ${
                  selectedEmployee === index ? "selected" : ""
                }`}
                onClick={() => handleSelectEmployee(index)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {employee.image ? (
                  <div
                    style={{
                      backgroundImage: `url(${loginData[selectedLocation].image_base_url}${employee.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      marginRight: "10px",
                    }}
                  ></div>
                ) : null}
                <div style={{ marginLeft: employee.image ? "0" : "34px" }}>
                  {employee.name}
                </div>
                {selectedEmployee === index && (
                  <img
                    src={tickImg}
                    alt="Selected"
                    style={{
                      marginLeft: "auto",
                      width: "20px",
                      height: "20px",
                    }}
                  />
                )}
              </div>
            ))}
            </div>
            <button
              className="button"
              disabled={selectedEmployee === null}
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        )}
        {step === 4 && (
          <div className="step active pading">
            <h2 style={{marginBottom:"82px"}}>Insert Passcode</h2>
            {selectedEmployee !== null && (
              <p>
                Enter the six-digit passcode for{" "}
                {employees[selectedEmployee].name}
              </p>
            )}
            <div
              style={{ display: "flex", justifyContent: "center", gap: "10px" }}
            >
              {passcode.map((digit, index) => (
                <input
                  key={index}
                  id={`passcode-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handlePasscodeChange(e, index)}
                  onKeyDown={(e) => handleBackspace(e, index)}
                  style={{
                    width: "75px",
                    height: "75px",
                    fontSize: "24px",
                    textAlign: "center",
                    marginTop: "33px",
                    marginBottom: "50px",
                    border:"1px solid #A79C92",
                    boxShadow:"0px 4px 4px 0px #00000040"
                  }}
                />
              ))}
            </div>
            {/* <button
            className="button"
            style={{ marginTop: "50px" }}
            onClick={handleBack}
          >
           <img src={backImg} alt="Back" />
          </button> */}
            <button
              className="button"
              onClick={handleNext}
              disabled={passcode.join("").length < 6}
              style={{
                marginBottom: "50px",
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginFlow;
