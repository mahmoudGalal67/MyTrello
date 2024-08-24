import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";

import Cookies from "js-cookie";

import "./SideBar.css";
import { Link, useParams } from "react-router-dom";
import api from "../../apiAuth/auth";
import Spinner from "react-bootstrap/esm/Spinner";

function SideBar() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [loading, setLoading] = useState(true);
  const [workSpace, setworkSpace] = useState(null);

  const { workspaceId } = useParams();

  const cookies = Cookies.get("token");
  useEffect(() => {
    if (workspaceId) {
      const getWorkSpace = async () => {
        try {
          const { data } = await api({
            url: `workspaces/get-workspace/${workspaceId}`,
            // Authorization: `Bearer ${cookies?.token}`,
            headers: { Authorization: `Bearer ${cookies}` },
          });
          setworkSpace(data.result);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          console.log(err);
        }
      };
      getWorkSpace();
    } else {
      setLoading(false);
    }
  }, [workspaceId]);

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
    <>
      <Button className="sideNav-link" variant="primary" onClick={handleShow}>
        <img src="/rightArrow.svg" alt="" />
      </Button>

      <div className="side-bar"></div>
      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          {workSpace && (
            <Offcanvas.Title>
              <img src="/photo-1675981004510-4ec798f42006.jpg" alt="" />
              {workSpace.workspace_name}
            </Offcanvas.Title>
          )}
        </Offcanvas.Header>
        <Offcanvas.Body>
          <a href="#" className="board-item">
            <span>Members</span>
          </a>
          <a href="#" className="board-item">
            <span>Table</span>
          </a>
          <a href="#" className="board-item">
            <span>Calender</span>
          </a>
          {workSpace && <h2>Your Boards</h2>}
          {workSpace &&
            workSpace.boards_of_the_workspace.map((board) => (
              <Link
                key={board.board_id}
                to={`/board/${workSpace.workspace_id}/${board.board_id}`}
                className="board-item"
                onClick={handleClose}
              >
                <img src="/photo-1675981004510-4ec798f42006.jpg" alt="" />
                <span>{board.board_name} </span>
              </Link>
            ))}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default SideBar;
