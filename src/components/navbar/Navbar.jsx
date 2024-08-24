import { useEffect, useState, useContext, useRef } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Cookies from "js-cookie";
import api from "../../apiAuth/auth";
import { AuthContext } from "../context/Auth";
import "./navbar.css";
import Dropdown from "react-bootstrap/Dropdown";
import { useNavigate } from "react-router-dom";

function NavBar({ workSpaces }) {
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const { user, dispatch } = useContext(AuthContext);
  const workspaceTitle = useRef(null);
  const boardTitle = useRef(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  // const [assignedUsers, setAssignedUsers] = useState([]);
  const navigate = useNavigate();

  const location = useLocation();
  const path = location.pathname;
  const pathName = path.split("/")[1];

  const cookies = Cookies.get("token");
  const { workspaceId, boardId } = useParams();
  console.log("Board ID from params:", boardId);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users/get-users", {
          headers: { Authorization: `Bearer ${cookies}` },
        });
        setUsers(data.data);
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.message);
      }
    };

    fetchUsers();
  }, [cookies]);

  const addBoard = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api({
        url: "/boards/create",
        method: "post",
        headers: { Authorization: `Bearer ${cookies}` },
        data: {
          name: boardTitle.current.value,
          workspace_id: workspaceId,
          photo: "",
        },
      });
      window.location.reload();
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message);
    }
  };

  const addWorkspace = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api({
        url: "/workspaces/create",
        method: "post",
        headers: { Authorization: `Bearer ${cookies}` },
        data: { name: workspaceTitle.current.value },
      });
      window.location.reload();
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message);
    }
  };

  const handleUserClick = async (userId) => {
    try {
      console.log("Assigning user:", userId, "to board:", boardId);

      await api.post(
        "/boards/assign-user-to-board",
        {
          board_id: boardId,
          user_id: [userId],
        },
        {
          headers: { Authorization: `Bearer ${cookies}` },
        }
      );
      alert("User successfully assigned to the board!");
    } catch (err) {
      console.error("API error:", err);
      const responseMessage = err.response?.data?.message;
      const errorMessage = responseMessage || "An unexpected error occurred";

      if (err.response?.status === 422) {
        if (responseMessage.includes("already a member")) {
          alert("This user is already a member of this board.");
        } else {
          setError(`Validation Error: ${errorMessage}`);
        }
      } else if (err.response?.status === 400) {
        setError(`Bad Request: ${errorMessage}`);
      } else {
        setError(errorMessage);
      }
    }
  };

  //  Toggle user assignment
  //   const fetchAssignedUsers = async () => {
  //     try {
  // Assign users endpoint
  //       const { data } = await api.get(``, {
  //         headers: { Authorization: `Bearer ${cookies}` },
  //       });
  //       setAssignedUsers(data.data);
  //     } catch (err) {
  //       console.log(err);
  //       setError(err.response?.data?.message);
  //     }
  //   };

  //   if (boardId) {
  //     fetchAssignedUsers();
  //   }
  //   fetchUsers();
  // }, [cookies, boardId]);

  // const handleUserClick = async (userId) => {
  //   try {
  //     if (assignedUsers.some(user => user.id === userId)) {
  //       // User is already assigned, so remove them
  //       await api.post(
  //         "/boards/remove-user-from-board",
  //         {
  //           board_id: boardId,
  //           user_id: userId,
  //         },
  //         {
  //           headers: { Authorization: `Bearer ${cookies}` },
  //         }
  //       );
  //       setAssignedUsers(assignedUsers.filter(user => user.id !== userId));
  //       alert("User successfully removed from the board!");
  //     } else {
  //       // User is not assigned, so add them
  //       await api.post(
  //         "/boards/assign-user-to-board",
  //         {
  //           board_id: boardId,
  //           user_id: [userId],
  //         },
  //         {
  //           headers: { Authorization: `Bearer ${cookies}` },
  //         }
  //       );
  //       setAssignedUsers([...assignedUsers, { id: userId }]); // Update state with new user
  //       alert("User successfully assigned to the board!");
  //     }
  //   } catch (err) {
  //     console.error("API error:", err);
  //     const responseMessage = err.response?.data?.message;
  //     const errorMessage = responseMessage || "An unexpected error occurred";

  //     if (err.response?.status === 422) {
  //       if (responseMessage.includes("already a member")) {
  //         alert("This user is already a member of this board.");
  //       } else {
  //         setError(`Validation Error: ${errorMessage}`);
  //       }
  //     } else if (err.response?.status === 400) {
  //       setError(`Bad Request: ${errorMessage}`);
  //     } else {
  //       setError(errorMessage);
  //     }
  //   }
  // };
  const handleLogout = async () => {
    try {
      await api.post(
        "/logout",
        {},
        {
          headers: { Authorization: `Bearer ${cookies}` },
        }
      );
      Cookies.remove("token");
      dispatch({ type: "logout" });

      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err.message || "Unknown error");
      setError(err.response?.data?.message || "Failed to log out.");
    }
  };

  return (
    <Navbar expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            src="/logo.gif"
            style={{
              backgroundColor: "#0B5ED7",
              width: "80px",
              height: "30px",
              objectFit: "contain",
              borderRadius: "5px",
            }}
            alt=""
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />

        <Navbar.Collapse id="navbarScroll">
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: "100px" }}
            navbarScroll
          >
            {pathName === "" ? (
              <NavDropdown title="Workspaces" id="navbarScrollingDropdown">
                {workSpaces.map((workspace) => (
                  <NavDropdown.Item
                    key={workspace.workspace_id}
                    as={Link}
                    to={`/workspace/${workspace.workspace_id}`}
                  >
                    {workspace.workspace_name}
                  </NavDropdown.Item>
                ))}
              </NavDropdown>
            ) : (
              ""
            )}

            {pathName === "board" && (
              <NavDropdown
                title="Invite Board Members"
                id="navbarScrollingDropdown"
              >
                {users.map((user) => (
                  <NavDropdown.Item
                    key={user.id}
                    onClick={() => handleUserClick(user.id)}
                  >
                    {user.name}
                  </NavDropdown.Item>
                ))}
              </NavDropdown>
            )}
            {pathName !== "board" && pathName !== "workspace" ? (
              <NavDropdown
                title="Create Workspace"
                id="navbarScrollingDropdown"
                className="create"
              >
                <form className="container" onSubmit={addWorkspace}>
                  <h2>Workspace</h2>
                  <div className="input-wrapper">
                    <label htmlFor="">Workspace title *</label>
                    <input ref={workspaceTitle} type="text" required />
                  </div>
                  <Button type="submit" variant="primary">
                    Create Workspace
                  </Button>
                  {error && <span className="err">{error}</span>}
                </form>
              </NavDropdown>
            ) : (
              <NavDropdown
                title="Create Board"
                id="navbarScrollingDropdown"
                className="create"
              >
                <form className="container" onSubmit={addBoard}>
                  <h2>Board</h2>
                  <div className="input-wrapper">
                    <label htmlFor="">Board title *</label>
                    <input ref={boardTitle} type="text" required />
                  </div>
                  <Button type="submit" variant="primary">
                    Create Board
                  </Button>
                </form>
              </NavDropdown>
            )}
          </Nav>
          <Form className="d-flex">
            <Form.Control
              type="search"
              placeholder="Search"
              className="me-2"
              aria-label="Search"
            />
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle
                  className="user-name no-caret"
                  id="dropdown-basic"
                >
                  {user.name.charAt(0).toUpperCase()}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Link to="/login">
                <img
                  src="/avatar.jpg"
                  alt=""
                  style={{ width: "40px", height: "40px" }}
                />
              </Link>
            )}
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
