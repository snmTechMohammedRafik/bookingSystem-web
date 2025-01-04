import { useState, useEffect } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import calener from "../../assets/calendar.png";
import employeeImg from "../../assets/Employees.png";
import logo from "../../assets/Group 1261155183.png"; // Logo image
import "./sidebar.css"; // Your custom CSS

const iconMapping = {
  Calendar: (isActive) => (
    <div
      style={{
        padding: "10px",
        borderRadius: "8px",
        backgroundColor: isActive ? "#D9D9D9" : "transparent", // Icon-only background color
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img src={calener} style={{ width: "40px", height: "40px" }} alt="Calendar Icon" />
    </div>
  ),
  Employee: (isActive) => (
    <div
      style={{
        padding: "10px",
        borderRadius: "8px",
        backgroundColor: isActive ? "#D9D9D9" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img src={employeeImg} style={{ width: "40px", height: "40px" }} alt="Employee Icon" />
    </div>
  ),
  coustmer: (isActive) => (
    <div
      style={{
        padding: "10px",
        borderRadius: "8px",
        backgroundColor: isActive ? "#D9D9D9" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img src={employeeImg} style={{ width: "40px", height: "40px" }} alt="Customer Icon" />
    </div>
  ),
};

const Item = ({ title, to, selected, setSelected }) => {
  const isActive = selected === title;

  return (
    <MenuItem
      onClick={() => setSelected(title)}
      icon={iconMapping[title](isActive)}
      style={{
        marginTop: "13px",
      }}
    >
      <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
        <span style={{ display: 'none' }}>{title}</span> {/* Hide the title text */}
      </Link>
    </MenuItem>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const [selected, setSelected] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = location.pathname.split("/")[1];
    setSelected(currentPath.charAt(0).toUpperCase() + currentPath.slice(1));
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <Box className="sidebar">
      <ProSidebar collapsed={true}> {/* Set sidebar to collapsed */}
        <Menu iconShape="square">
          {/* Logo at the top */}
          <MenuItem className="mt-2 mb-5" icon={<img src={logo} alt="Logo" className="logo-img" />} />

          {/* Sidebar menu items */}
          <Box className="menu-box">
            {["Calendar", "Employee", "coustmer"].map((title) => (
              <Item
                key={title}
                title={title}
                to={`/${title.toLowerCase()}`}
                selected={selected}
                setSelected={setSelected}
              />
            ))}
          </Box>

          {/* Logout button */}
          <MenuItem
            onClick={handleLogout}
            icon={<ExitToAppIcon style={{ marginLeft: "30px", marginRight: "30px" }} />}
            className="logout-item"
          >
            <span style={{ display: 'none' }}>Logout</span> {/* Hide Logout text */}
          </MenuItem>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
