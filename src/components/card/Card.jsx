import React, { useState, useEffect } from "react";
import "./card.css";
import CardDetails from "../CardDetails/CardDetails";
import api from "../../apiAuth/auth";

import Cookies from "js-cookie";

function Card({ card, onCardDelete, listId }) {
  const [open, setOpen] = useState(false);

  const cookies = Cookies.get("token");

  const onOpenModal = () => setOpen(true);
  const onCloseModal = () => setOpen(false);

  const handleDeleteCard = (id) => {
    onCardDelete(id);
    onCloseModal();
  };

  const [cardDetails, setcardDetails] = useState({});

  useEffect(() => {
    const fetchcarddetails = async () => {
      try {
        const { data } = await api({
          url: `cards/get-card/${card.card_id}`,
          headers: { Authorization: `Bearer ${cookies}` },
        });
        setcardDetails(data.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchcarddetails();
  }, [card.card_id]);

  return (
    <>
      <div className="item" onClick={onOpenModal}>
        {cardDetails.end_time && (
          <div
            className="cover-image"
            style={{
              backgroundColor: cardDetails.end_time,
            }}
          ></div>
        )}
        <div className="title">{cardDetails.text}</div>
      </div>
      <CardDetails
        onCloseModal={onCloseModal}
        listId={listId}
        open={open}
        cardDetails={cardDetails}
        setcardDetails={setcardDetails}
        onDeleteCard={handleDeleteCard}
      />
    </>
  );
}

export default Card;
