import label from "../../../public/label.svg";
import date from "../../../public/date.svg";
import user from "../../../public/user.svg";
import list from "../../../public/list.svg";
import attach from "../../../public/attach.svg";
import deleteimage from "../../../public/delete.svg";
import deleteDate from "../../../public/deleteDate.svg";

import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";

import ModalImage from "react-modal-image";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Form from "react-bootstrap/Form";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { AuthContext } from "../context/Auth";

import "./CardDetails.css";
import { useEffect, useRef, useState, useContext } from "react";

import Cookies from "js-cookie";
import api from "../../apiAuth/auth";
import { Spinner } from "react-bootstrap";

const CalendarIcon = () => {
  return (
    <div style={{ color: "white" }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 48 48"
      >
        <mask id="ipSApplication0">
          <g fill="white" stroke="white" strokeLinejoin="round" strokeWidth="4">
            <path strokeLinecap="round" d="M40.04 22v20h-32V22"></path>
            <path
              fill="White"
              d="M5.842 13.777C4.312 17.737 7.263 22 11.51 22c3.314 0 6.019-2.686 6.019-6a6 6 0 0 0 6 6h1.018a6 6 0 0 0 6-6c0 3.314 2.706 6 6.02 6c4.248 0 7.201-4.265 5.67-8.228L39.234 6H8.845l-3.003 7.777Z"
            ></path>
          </g>
        </mask>
        <path
          fill="white"
          d="M0 0h48v48H0z"
          mask="url(#ipSApplication0)"
        ></path>
      </svg>
      Date
    </div>
  );
};

function CardDetails({
  onCloseModal,
  open,
  card,
  listId,
  setcardNew,
  onDeleteCard,
  updateCardCoverImage,
}) {
  const toolbarOptions = [
    ["bold", "italic"],
    ["link", "image"],
  ];

  const module = {
    toolbar: toolbarOptions,
  };

  const cookies = Cookies.get("token");

  const { user } = useContext(AuthContext);
  const [coverImage, setCoverImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [editText, seteditText] = useState(false);
  const [cardDetails, setcardDetails] = useState({});
  const [completed, setcompleted] = useState(false);
  const [addItems, setaddItems] = useState({
    title: false,
    desc: false,
    comment: false,
  });
  const newComment = useRef(null);
  const [attachFile, setattachFile] = useState("");

  // cahnges
  const handleDelete = async () => {
    try {
      const response = await api({
        url: `/cards/destroy/${card.card_id}`,
        method: "DELETE",
        headers: { Authorization: `Bearer ${cookies}` },
      });

      if (response.ok || response.status === 204 || response.status === 203) {
        console.log("Card deleted successfully");
        onDeleteCard(card.card_id);
        onCloseModal();
        alert("Card deleted successfully");
      } else {
        console.error("Failed to delete the card. Status:", response.status);
      }
    } catch (error) {
      console.error("An error occurred while deleting the card:", error);
    }
  };

  const handleCoverUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await api.post(
        `/cards/upload-photo/${card.card_id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${cookies}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("Cover photo uploaded successfully");
        setCoverImage(response.data.photo_url);
        alert("Cover image added/changed successfully!");
      } else {
        console.error("Failed to upload cover photo. Status:", response.status);
      }
    } catch (error) {
      console.error(
        "An error occurred while uploading the cover photo:",
        error
      );
    }
  };

  const handleRemoveCover = async () => {
    try {
      await api({
        url: `/cards/delete-photo/${card.card_id}`,
        method: "DELETE",
        headers: { Authorization: `Bearer ${cookies}` },
      });
      console.log("Cover photo removed successfully");
      setCoverImage(null);
      updateCardCoverImage(card.card_id, null);
      onCloseModal();
    } catch (error) {
      console.error("An error occurred while removing the cover photo:", error);
    }
  };

  const handleSaveCover = () => {
    if (coverImage) {
      updateCardCoverImage(card.card_id, coverImage);
      onCloseModal();
    }
  };

  // changes

  const openItem = (name) => {
    setaddItems((prev) => {
      return {
        ...prev,
        [name]: true,
      };
    });
  };
  const closeItem = (name) => {
    setaddItems((prev) => {
      return {
        ...prev,
        [name]: false,
      };
    });
  };

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  const updateDate = async (name, value) => {
    const { user_name, comments, labels, updated_at, created_at, id, ...data } =
      cardDetails;
    setcardDetails((prev) => {
      return {
        ...prev,
        start_time: value,
      };
    });
    try {
      await api({
        url: "/cards/update",
        headers: { Authorization: `Bearer ${cookies}` },
        data: {
          ...data,
          card_id: card.card_id,
          the_list_id: listId,
          start_time: value,
        },
        method: "post",
      });
      setcardDetails((prev) => {
        return {
          ...prev,
          start_time: value,
        };
      });
    } catch (err) {
      console.log(err);
    }
  };

  const updateDetails = (name, value) => {
    setcardDetails((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const updateRequest = async (e) => {
    e.preventDefault();

    const { user_name, comments, labels, updated_at, created_at, id, ...data } =
      cardDetails;
    setcardNew((prev) => ({
      ...prev,
      card_text: cardDetails.text,
    }));
    try {
      const fileData = new FormData();
      if (attachFile) {
        fileData.append("file", attachFile);
        fileData.append("fileName", attachFile.name);
      }
      console.log("dataForm" + fileData);
      await api({
        url: "/cards/update",
        headers: { Authorization: `Bearer ${cookies}` },
        data: {
          ...data,
          card_id: card.card_id,
          the_list_id: listId,
          photo: fileData,
        },
        method: "post",
      });
      closeItem("desc");
    } catch (err) {
      console.log(err);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    setcardDetails((prev) => {
      return {
        ...prev,
        comments: [...prev.comments, { comment: newComment.current.value }],
      };
    });
    closeItem("comment");
    try {
      await api({
        url: "/comments/create",
        headers: { Authorization: `Bearer ${cookies}` },
        data: { card_id: card.card_id, comment: newComment.current.value },
        method: "post",
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (true) {
      const getCardDetails = async () => {
        try {
          const { data } = await api({
            url: `cards/get-card/${card.card_id}`,
            // url: "/cards/get-card/41",
            headers: { Authorization: `Bearer ${cookies}` },
          });
          setcardDetails(data.data);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          console.log(err);
        }
      };
      getCardDetails();
    } else {
      setLoading(false);
    }
  }, [card.card_id]);

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
    <div>
      {" "}
      <Modal classNames="card-modal" open={open} onClose={onCloseModal} center>
        <div className="modal-body">
          {editText ? (
            <form onSubmit={updateRequest}>
              <input
                required
                style={{ width: "60%", marginBottom: "15px" }}
                value={cardDetails.text}
                autoFocus
                onChange={(e) => updateDetails("text", e.target.value)}
                onBlur={() => seteditText(false)}
              />
            </form>
          ) : (
            <h2 onClick={() => seteditText(true)}>{cardDetails.text}</h2>
          )}
          <div className="wrapper">
            <div className="left">
              {cardDetails.start_time && (
                <div className="date-wrapper">
                  <Form.Check
                    type="checkbox"
                    onChange={(e) => setcompleted(e.target.checked)}
                  />
                  <div className="state-wrapper">
                    <DatePicker
                      showTimeSelect={false}
                      showTimeInput
                      dateFormat="MM/dd/yyyy h:mm aa"
                      selected={cardDetails.start_time}
                      onChange={(e) => updateDate("start_time", e)}
                    />
                    {completed ? (
                      <div className="state">Completed</div>
                    ) : (new Date(cardDetails.start_time) - new Date()) /
                        (1000 * 60 * 60 * 24) >
                      1 ? (
                      <div
                        className="state"
                        style={{ background: "transparent" }}
                      ></div>
                    ) : (new Date(cardDetails.start_time) - new Date()) /
                        (1000 * 60 * 60 * 24) >
                      0 ? (
                      <div className="state" style={{ background: "yellow" }}>
                        Soon
                      </div>
                    ) : (
                      <div className="state" style={{ background: "red" }}>
                        Over Date
                      </div>
                    )}
                  </div>
                  <img
                    src={deleteDate}
                    style={{ width: "20px", cursor: "pointer" }}
                    onClick={() => updateDate("start_time", "")}
                    alt=""
                  />
                </div>
              )}
              <div className="description">
                <div className="header">
                  <svg
                    width="24"
                    height="24"
                    role="presentation"
                    focusable="false"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M4 5C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H4ZM4 9C3.44772 9 3 9.44772 3 10C3 10.5523 3.44772 11 4 11H20C20.5523 11 21 10.5523 21 10C21 9.44772 20.5523 9 20 9H4ZM3 14C3 13.4477 3.44772 13 4 13H20C20.5523 13 21 13.4477 21 14C21 14.5523 20.5523 15 20 15H4C3.44772 15 3 14.5523 3 14ZM4 17C3.44772 17 3 17.4477 3 18C3 18.5523 3.44772 19 4 19H14C14.5523 19 15 18.5523 15 18C15 17.4477 14.5523 17 14 17H4Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                  Description
                </div>
                <form onSubmit={updateRequest}>
                  {addItems.desc ? (
                    <>
                      <ReactQuill
                        theme="snow"
                        modules={module}
                        value={cardDetails.description}
                        onChange={(e) => updateDetails("description", e)}
                      />
                      <div className="wrapper">
                        <button type="submit" className="save">
                          Save
                        </button>
                        <button
                          name="desc"
                          onClick={(e) => closeItem(e.target.name)}
                          className="cancel"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : cardDetails.description ? (
                    <>
                      <div
                        onClick={() => openItem("desc")}
                        dangerouslySetInnerHTML={{
                          __html: cardDetails.description,
                        }}
                      />
                    </>
                  ) : (
                    <div className="addDesc" onClick={() => openItem("desc")}>
                      Add Your description
                    </div>
                  )}
                </form>
              </div>
              <div className="comments">
                {!addItems.comment ? (
                  <input
                    style={{ caretColor: "transparent" }}
                    className="comment add-comment"
                    type="text"
                    placeholder="Write a comment…"
                    data-testid="card-back-new-comment-input-skeleton"
                    aria-placeholder="Write a comment…"
                    aria-label="Write a comment"
                    read-only="true"
                    value="Enter your Comment"
                    name="comment"
                    readOnly
                    onClick={(e) => openItem(e.target.name)}
                  ></input>
                ) : (
                  <form onSubmit={addComment} className="add-comments">
                    <textarea
                      className="comment add-comment input"
                      type="text"
                      placeholder="Write a comment…"
                      data-testid="card-back-new-comment-input-skeleton"
                      aria-placeholder="Write a comment…"
                      aria-label="Write a comment"
                      autoFocus
                      ref={newComment}
                      required
                    ></textarea>
                    <div className="wrapper">
                      <button type="submit" className="save">
                        Save
                      </button>
                      <button
                        name="comment"
                        onClick={(e) => closeItem(e.target.name)}
                        className="cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
                <div className="cover-wrapper">
                  {coverImage ? (
                    <div className="cover-image">
                      <img
                        src={coverImage}
                        alt="Cover"
                        style={{
                          maxWidth: "200px",
                          height: "200px",
                          marginBottom: "20px",
                        }}
                      />
                      <br />
                      <button
                        className="remove-cover"
                        onClick={handleRemoveCover}
                      >
                        Remove Cover
                      </button>
                    </div>
                  ) : (
                    <div className="upload-cover">
                      <label htmlFor="cover-upload">
                        <svg
                          width="24"
                          height="24"
                          role="presentation"
                          focusable="false"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5 3C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5ZM5 5H19V19H5V5ZM12 7C9.79086 7 8 8.79086 8 11C8 13.2091 9.79086 15 12 15C14.2091 15 16 13.2091 16 11C16 8.79086 14.2091 7 12 7ZM12 9C13.1046 9 14 9.89543 14 11C14 12.1046 13.1046 13 12 13C10.8954 13 10 12.1046 10 11C10 9.89543 10.8954 9 12 9Z"
                            fill="currentColor"
                          ></path>
                        </svg>
                        Upload Cover
                      </label>
                      <input
                        type="file"
                        id="cover-upload"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        style={{ display: "none" }}
                      />
                    </div>
                  )}
                </div>
                <div className="wrapper">
                  {cardDetails.comments?.map((comment, i) => (
                    <div className="comment-item">
                      <div className="user-info">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <input
                        key={i}
                        className="comment"
                        type="text"
                        placeholder="Write a comment…"
                        data-testid="card-back-new-comment-input-skeleton"
                        aria-placeholder={comment.comment}
                        aria-label="Write a comment"
                        read-only
                        value={comment.comment}
                        style={{ color: "white" }}
                      ></input>
                    </div>
                  ))}
                </div>
              </div>
              {attachFile ? (
                <div className="attachment">
                  <img width="30px" src={attach} alt="" /> Attachment{" "}
                  <div
                    className="iamge-wrapper"
                    style={{
                      width: "100%",
                      height: "200px",
                    }}
                  >
                    <ModalImage
                      small={URL.createObjectURL(attachFile)}
                      large={URL.createObjectURL(attachFile)}
                      alt="Hello World!"
                    />
                    {/*                     
                    <img
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        marginBlock: "18px",
                      }}
                      src={URL.createObjectURL(attachFile)}
                      alt=""
                    /> */}
                  </div>
                </div>
              ) : cardDetails.photo ? (
                <div className="attachment">
                  <img width="30px" src={attach} alt="" /> Attachment{" "}
                  <div className="iamge-wrapper">
                    <img src={cardDetails.photo} alt="" />
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>

            <div className="right">
              <div className="item" onClick={handleSaveCover}>
                <img src={list} alt="Cover" /> Cover Save
              </div>
              <div className="item">
                <input
                  type="file"
                  style={{ display: "none" }}
                  id="attachfile"
                  onChange={(e) => setattachFile(e.target.files[0])}
                />
                <label htmlFor="attachfile">
                  {" "}
                  <img src={attach} alt="" /> Attachment{" "}
                </label>
              </div>
              <div className="item date" style={{ padding: "3px" }}>
                <DatePicker
                  showIcon
                  selected=""
                  onChange={(e) => updateDate("start_time", e)}
                  dateFormat="MM/dd/yyyy h:mm aa"
                  icon={CalendarIcon}
                />
                <span>Date</span>
              </div>

              <div className="item" onClick={handleDelete}>
                <img src={deleteimage} alt="Delete" /> Delete
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CardDetails;
