import React, { useState, useEffect } from "react";
import { auth, database } from "../../firebaseConfig";
import { collection, query, where, addDoc, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useSelector } from "react-redux";
import { serverTimestamp } from "firebase/firestore";

function AddTask() {
  const [title, setTitle] = useState("");
  const [list, setList] = useState([]);
  const [listInput, setListInput] = useState("");
  const [editedItem, setEditedItem] = useState(null);
  const [notes, setNotes] = useState([]);
  const user = useSelector((state) => state?.auth);

  const fetchData = async () => {
    try {
      const uid = user.values.uid;
      const getData = query(
        collection(database, "notes"),
        where("uid", "==", uid)
      );
      const querySnapshot = await getDocs(getData);
      const notesData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const timestamp = data.dateCreated;
        const date = timestamp.toDate();
        const formattedDate = `${date.getFullYear()}-${
          date.getMonth() + 1
        }-${date.getDate()}`;
        const formattedTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        const dateCreated = `${formattedDate} ${formattedTime}`;
        return { ...data, dateCreated };
      });
      setNotes(notesData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name === "status") {
        const updatedList = list.map((item) => {
          return { ...item, status: checked };
        });
        setList(updatedList);
      } else {
        const [inputType, itemId] = name.split("-");
        if (inputType === "status") {
          const updatedList = list.map((item) => {
            if (item.id === itemId) {
              return { ...item, status: checked };
            }
            return item;
          });
          setList(updatedList);
        }
      }
    } else {
      if (name === "listInput") {
        setListInput(value);
      } else {
        const [inputType, itemId] = name.split("-");
        if (inputType === "edit" && value !== "") {
          const updatedList = list.map((item) => {
            if (item.id === itemId) {
              return { ...item, text: value };
            }
            return item;
          });
          setList(updatedList);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(database, "notes"), {
        notes: title,
        uid: user.values.uid,
        dateCreated: serverTimestamp(),
        list: list,
      });
      setTitle("");
      setList([]);
      console.log(docRef);
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  const handleAddListItem = () => {
    if (listInput.trim() !== "") {
      const newItem = {
        id: Date.now().toString(),
        text: listInput,
        status: false,
      };
      setList([...list, newItem]);
      setListInput("");
    }
  };

  const handleSaveChanges = () => {
    setEditedItem(null);
  };

  const handleDeleteItem = (itemId) => {
    const updatedList = list.filter((item) => item.id !== itemId);
    setList(updatedList);
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-3 col-lg-3 col-xs-12 col-sm-12">
          <form onSubmit={handleSubmit}>
            <div className="card">
              <div className="card-header">
                <div className="form-control text-decoration-none bg-gray d-flex align-items-center border-0">
                  <input
                    type="checkbox"
                    name="status"
                    checked={
                      list.length > 0 && list.every((item) => item.status)
                    }
                    onChange={handleInputChange}
                    className="form-check-input"
                    style={{ transform: "scale(1.5)", marginRight: "10px" }}
                  />
                  <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Enter task title"
                    className="flex-grow-1 border-0"
                  />
                </div>
              </div>
              <ul className="card-body list-group d-flex flex-column align-items-center">
                {list.map((item, index) => (
                  <li
                    key={item.id}
                    className="list-group-item list-group-item-action ms-3"
                  >
                    {editedItem === item.id ? (
                      <div className="d-flex align-items-center position-relative">
                        <input
                          type="text"
                          name={`edit-${item.id}`}
                          value={item.text}
                          onChange={handleInputChange}
                          className="form-control"
                        />
                        <button
                          className="btn btn-primary btn-sm position-absolute top-50 end-0 translate-middle-y me-1"
                          onClick={() => handleSaveChanges(item.id)}
                          style={{ transform: "translateY(-50%)" }}
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-between">
                        <span
                          className={
                            item.status ? "text-decoration-line-through" : ""
                          }
                        >
                          {item.text}
                        </span>
                        <div>
                          <label>
                            <input
                              className="form-check-input m-1"
                              type="checkbox"
                              name={`status-${item.id}`}
                              checked={item.status}
                              onChange={handleInputChange}
                            />
                          </label>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setEditedItem(item.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
                <div className="form-control d-flex ms-3 mt-2">
                  <input
                    type="text"
                    name="listInput"
                    value={listInput}
                    onChange={handleInputChange}
                    placeholder="Enter list item"
                    style={{ flex: "1", border: "none" }}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    type="button"
                    onClick={handleAddListItem}
                  >
                    Add
                  </button>
                </div>
                <button className="btn btn-success mt-3" type="submit">
                  Add Task
                </button>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddTask;
