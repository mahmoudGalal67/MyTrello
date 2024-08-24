import { useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import CloseButton from "react-bootstrap/CloseButton";

import Cookies from "js-cookie";
import api from "../../apiAuth/auth";

function addList({ setShowFormList, boardId, setboard }) {
  const listTitle = useRef(null);
  const [error, seterror] = useState(null);

  const cookies = Cookies.get("token");

  const addList = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api({
        url: "/lists/create",
        method: "post",
        headers: { Authorization: `Bearer ${cookies}` },
        data: {
          title: listTitle.current.value,
          board_id: boardId,
        },
      });
      setboard((prev) => ({
        ...prev,
        lists_of_the_board: [
          ...prev.lists_of_the_board,
          {
            list_id: data.data.id,
            list_title: data.data.title,
            cards_of_the_list: [],
          },
        ],
      }));
      setShowFormList(false);
      listTitle.current.value = "";
      // window.location.reload();
    } catch (err) {
      console.log(err);
      seterror(err.response?.data?.message);
    }
  };
  return (
    <div className="addListForm">
      <form onSubmit={addList}>
        <input
          type="text"
          ref={listTitle}
          placeholder="Enter list title…"
          required
          autoFocus
        />
        <div>
          <Button type="submit" variant="primary">
            Add list
          </Button>
          <CloseButton onClick={() => setShowFormList(false)} />
        </div>
      </form>
    </div>
  );
}

export default addList;
