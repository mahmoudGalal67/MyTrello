import "./Workspaces.css";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../../components/navbar/Navbar";
import { Link } from "react-router-dom";
import SideBar from "../../components/sideBar/SideBar";
import Cookies from "js-cookie";
import Spinner from "react-bootstrap/Spinner";
import api from "../../apiAuth/auth";
import { Modal, Button, Form } from "react-bootstrap";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Dropdown } from "react-bootstrap";

function Workspace() {
  const [loading, setLoading] = useState(true);
  const [workSpaces, setworkSpaces] = useState([]);
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editedBoardName, setEditedBoardName] = useState("");
  const [editedBoardPhoto, setEditedBoardPhoto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkspaceId, setEditingWorkspaceId] = useState(null);
  const [editedWorkspaceName, setEditedWorkspaceName] = useState("");
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);

  const cookies = Cookies.get("token");

  useEffect(() => {
    const getWorkSpaces = async () => {
      try {
        const { data } = await api({
          url: "/workspaces/get-workspaces",
          headers: { Authorization: `Bearer ${cookies}` },
        });
        setworkSpaces(data.result);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.log(err);
      }
    };
    getWorkSpaces();
  }, [cookies]);

  // edit and delete board
  const handleEditClick = (board_id, currentBoardName, currentBoardPhoto) => {
    setEditingBoardId(board_id);
    setEditedBoardName(currentBoardName);
    setEditedBoardPhoto(currentBoardPhoto);
    setShowModal(true);
  };

  const handleSaveClick = async (workspace_id, board_id) => {
    try {
      const formData = new FormData();
      formData.append("workspace_id", workspace_id);
      formData.append("name", editedBoardName);
      if (editedBoardPhoto) {
        formData.append("photo", editedBoardPhoto);
      }

      const response = await api({
        url: `/boards/update/${board_id}`,
        method: "POST",
        headers: { Authorization: `Bearer ${cookies}` },
        data: formData,
      });

      setworkSpaces((prevWorkspaces) =>
        prevWorkspaces.map((workspace) =>
          workspace.workspace_id === workspace_id
            ? {
                ...workspace,
                boards_of_the_workspace: workspace.boards_of_the_workspace.map(
                  (board) =>
                    board.board_id === board_id
                      ? {
                          ...board,
                          board_name: editedBoardName,
                          board_background: response.data.board_background,
                        } // Update imageUrl
                      : board
                ),
              }
            : workspace
        )
      );

      setEditingBoardId(null);
      setEditedBoardName("");
      setEditedBoardPhoto(null);
      setShowModal(false);
    } catch (error) {
      console.log("Error updating board name:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingBoardId(null);
    setEditedBoardName("");
    setEditedBoardPhoto(null);
    setShowModal(false);
  };

  const handleDeleteClick = async (workspace_id, board_id) => {
    if (window.confirm("Are you sure you want to delete this board?")) {
      try {
        await api({
          url: `/boards/destroy/${board_id}`,
          method: "DELETE",
          headers: { Authorization: `Bearer ${cookies}` },
        });

        setworkSpaces((prevWorkspaces) =>
          prevWorkspaces.map((workspace) =>
            workspace.workspace_id === workspace_id
              ? {
                  ...workspace,
                  boards_of_the_workspace:
                    workspace.boards_of_the_workspace.filter(
                      (board) => board.board_id !== board_id
                    ),
                }
              : workspace
          )
        );
      } catch (error) {
        console.log("Error deleting board:", error);
      }
    }
  };

  // edit and delete workspace

  const handleSaveWorkspaceClick = async () => {
    try {
      const response = await api({
        url: `/workspaces/update`,
        method: "POST",
        headers: { Authorization: `Bearer ${cookies}` },
        data: { workspace_id: editingWorkspaceId, name: editedWorkspaceName },
      });

      setworkSpaces((prevWorkspaces) =>
        prevWorkspaces.map((workspace) =>
          workspace.workspace_id === editingWorkspaceId
            ? { ...workspace, workspace_name: editedWorkspaceName }
            : workspace
        )
      );

      setEditingWorkspaceId(null);
      setEditedWorkspaceName("");
      setShowWorkspaceModal(false);
    } catch (error) {
      console.log("Error updating workspace name:", error);
    }
  };

  const handleEditWorkspaceClick = (workspace_id, currentWorkspaceName) => {
    setEditingWorkspaceId(workspace_id);
    setEditedWorkspaceName(currentWorkspaceName);
    setShowWorkspaceModal(true);
  };

  const handleDeleteWorkspaceClick = async (workspace_id) => {
    if (window.confirm("Are you sure you want to delete this workspace?")) {
      try {
        await api({
          url: `/workspaces/destroy/${workspace_id}`,
          method: "DELETE",
          headers: { Authorization: `Bearer ${cookies}` },
        });

        setworkSpaces((prevWorkspaces) =>
          prevWorkspaces.filter(
            (workspace) => workspace.workspace_id !== workspace_id
          )
        );
      } catch (error) {
        console.log("Error deleting workspace:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-100 h-100 d-flex justify-content-center align-items-center position-fixed top-0 left-0">
        <Spinner animation="border" role="status" variant="primary" size="md">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="home">
      <Navbar workSpaces={workSpaces} />
      <SideBar />
      <div className="views">
        {workSpaces.map((workspace) => (
          <div className="workspace-item" key={workspace.workspace_id}>
            <div className="d-flex justify-content-between mb-5">
              <div>
                <h2>{workspace.workspace_name}</h2>
              </div>
              <div>
                <Dropdown>
                  <Dropdown.Toggle
                    as="button"
                    className="custom-dropdown-toggle p-0 text-dark no-caret"
                  >
                    <span className="vertical-dots">⋮</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item
                      onClick={() =>
                        handleEditWorkspaceClick(
                          workspace.workspace_id,
                          workspace.workspace_name
                        )
                      }
                    >
                      <i className="fa-regular fa-pen-to-square me-2"></i> Edit
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() =>
                        handleDeleteWorkspaceClick(workspace.workspace_id)
                      }
                      className="text-danger"
                    >
                      <i className="fa-regular fa-trash-can me-2"></i> Delete
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
            <div className="wrapper">
              {workspace.boards_of_the_workspace.map((board) => (
                <div className="board-container" key={board.board_id}>
                  {/* ${board.board_background} */}
                  <div
                    className="card"
                    style={{
                      backgroundImage: `url('photo-1719825718360-7de63c92135f.webp')`,
                    }}
                  >
                    <div className="card-content">
                      <Link
                        className="board-link"
                        to={`board/${workspace.workspace_id}/${board.board_id}`}
                      >
                        <p className="board-name">{board.board_name}</p>
                      </Link>
                      <Button
                        variant="primary"
                        onClick={
                          () =>
                            handleEditClick(
                              board.board_id,
                              board.board_name,
                              board.board_background
                            ) // Pass imageUrl
                        }
                        className="edit-button"
                      >
                        <i className="fa-regular fa-pen-to-square"></i>
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() =>
                          handleDeleteClick(
                            workspace.workspace_id,
                            board.board_id
                          )
                        }
                        className="delete-button ms-2"
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Modal show={showModal} onHide={handleCancelEdit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Board Name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formBoardName">
            <Form.Label>Board Name</Form.Label>
            <Form.Control
              type="text"
              value={editedBoardName}
              onChange={(e) => setEditedBoardName(e.target.value)}
              placeholder="Enter new board name"
            />
          </Form.Group>
          <Form.Group controlId="formBoardPhoto">
            <Form.Label>Board Photo</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => setEditedBoardPhoto(e.target.files[0])}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelEdit}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              handleSaveClick(
                workSpaces.find((ws) =>
                  ws.boards_of_the_workspace.some(
                    (b) => b.board_id === editingBoardId
                  )
                ).workspace_id,
                editingBoardId
              )
            }
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showWorkspaceModal}
        onHide={() => setShowWorkspaceModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Workspace Name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formWorkspaceName">
            <Form.Label>Workspace Name</Form.Label>
            <Form.Control
              type="text"
              value={editedWorkspaceName}
              onChange={(e) => setEditedWorkspaceName(e.target.value)}
              placeholder="Enter new workspace name"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowWorkspaceModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveWorkspaceClick}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Workspace;
