import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./scenes/global/Sidebar";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import CustomCalendar from "./scenes/Calendar";
import EmployeeTable from "./scenes/Employee/Index";
import AddCustomerForm from "./scenes/Coustmer";
import JournalBox from "./scenes/journal";
import JournalDetail from "./scenes/journal/JournalDetail";
import Journal from "./scenes/journal";
import EditJournal from "./scenes/journal/EditJournal";
import LoginFlow from "./scenes/LoginForm";

// phone_number: '67867867',
//       password: '12345678',
function App() {
  const [theme, colorMode] = useMode();
  const location = useLocation();

  // const getPageName = (pathname) => {
  //   switch (pathname.toLowerCase()) {
  //     case "/dashboard":
  //       return "DASHBOARD";
  //     case "/inquiry":
  //       return "INQUIRY";
  //     case "/role":
  //       return "ROLE";
  //     case "/product":
  //       return "PRODUCT";
  //     case "/user":
  //       return "USER";
  //     case "/consumer":
  //       return "CONSUMER";
  //     case "/consultant":
  //       return "CONSULTANT";
  //     case "/genralfollowup":
  //       return "GENRAL FOLLOW UP";
  //     case "/forgotpassword":
  //       return "FORGOT PASSWORD";
  //     case "/otpvalidate":
  //       return "OTP VALIDATE";
  //     case "/newpassword":
  //       return "NEW PASSWORD";
  //     default:
  //       return "LOGIN";
  //   }
  // };

  // Hide only the Topbar for certain routes like "/inquiry/:id"
  const shouldHideTopbar = location.pathname.startsWith("/inquiry/");

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          {/* Sidebar remains collapsed on all pages */}
          {location.pathname !== "/" && (
            <Sidebar className="collapsed" /> 
          )}
          <main className={`content ${location.pathname !== "/" ? "shifted" : ""}`}>
            <Routes>
              <Route path="/" element={<LoginFlow />} />
              <Route path="/calendar" element={<CustomCalendar />} />
              <Route path="/employee" element={<EmployeeTable />} />
              <Route path="/coustmer" element={<AddCustomerForm />} />
              <Route path="/journal/:id" element={<Journal />} />
              <Route path="/journal/:journalId" element={<JournalDetail />} />
              <Route path="/journal/edit/:journalId" element={<EditJournal />} />
              <Route path="/test" element={<JournalBox />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
