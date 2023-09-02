import React, { useState, useEffect } from "react";
import { auth, database } from "../../firebaseConfig";
import {
  collection,
  query,
  where,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useSelector } from "react-redux";
import { serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [list, setList] = useState([]);
  const [listInput, setListInput] = useState("");
  const [editedItem, setEditedItem] = useState(null);
  const [notes, setNotes] = useState([]);
  const user = useSelector((state) => state?.auth);

  const fetchData = async () => {
    try {
      const uid = user?.values?.uid;
      if (uid) {
        const getData = query(
          collection(database, "notes"),
          where("uid", "==", uid)
        );
        const querySnapshot = await getDocs(getData);
        const notesData = querySnapshot.docs.map((doc) => {
          const id = doc.id;
          const data = doc.data();
          const timestamp = data.dateCreated;
          // const date = timestamp.toDate();
          // const formattedDate = `${date.getFullYear()}-${
          //   date.getMonth() + 1
          // }-${date.getDate()}`;
          // const formattedTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
          // const dateCreated = `${formattedDate} ${formattedTime}`;
          return { id, ...data, timestamp };
        });
        setNotes(notesData);
      } else {
        console.log("User uid is not defined");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user?.values?.uid) {
      fetchData();
    } else {
      navigate("/login");
    }
  }, [user]);

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

  const handleNotesChange = async (e, id = null, listId) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      const [inputType, itemId] = name.split("-");

      if (inputType === "statusT") {
        const updatedList = notes.map((item) => {
          if (item.id === itemId) {
            const updatedLists = item.list.map((listItem) => {
              return { ...listItem, status: checked };
            });
            return { ...item, list: updatedLists, status: checked };
          }
          return item;
        });
        console.log(updatedList);
        setNotes(updatedList);
      } else if (inputType === "statusL") {
        const updatedList = notes.map((item) => {
          if (item.id === id) {
            const updatedList = item.list.map((listItem) => {
              if (listItem.id === itemId) {
                return { ...listItem, status: checked };
              }
              return listItem;
            });
            const allListItemsChecked = updatedList.every(
              (listItem) => listItem.status
            );
            return { ...item, list: updatedList, status: allListItemsChecked };
          }
          return item;
        });
        console.log(updatedList);

        setNotes(updatedList);
      }
    } else {
      if (name === "listInput") {
        setExistingList(value);
      } else {
        const [inputType, itemId] = name.split("-");
        if (inputType === "edit" && value !== "") {
          const updatedList = notes.map((note) => {
            const updatedNote = { ...note };
            const updatedItems = updatedNote.list.map((item) => {
              if (item.id === itemId) {
                return { ...item, text: value };
              }
              return item;
            });
            updatedNote.list = updatedItems;
            const noteRef = doc(database, "notes", id);
            updateDoc(noteRef, updatedNote)
              .then((res) => {
                console.log("Document successfully updated!", res);
              })
              .catch((error) => {
                console.error("Error updating document: ", error);
              });
            return updatedNote;
          });

          setNotes(updatedList);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const isAllChecked = list.length > 0 && list.every((item) => item.status);
      const docRef = await addDoc(collection(database, "notes"), {
        notes: title,
        uid: user.values.uid,
        dateCreated: serverTimestamp(),
        list: list,
        status: isAllChecked,
        taskId: Date.now().toString() + user.values.uid,
      });
      setTitle("");
      setList([]);
      fetchData();
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

  const [existingList, setExistingList] = useState([]);

  const handleAddListNotes = (e, id = null) => {
    const noteRef = doc(database, "notes", id);
    const filteredNotes = notes.filter((note) => note.id === id);
    if (existingList.trim() !== "") {
      const newItem = {
        id: Date.now().toString(),
        text: existingList,
        status: false,
      };
      const updatedList = [...filteredNotes[0].list, newItem];
      setExistingList([...existingList, newItem]);
      setExistingList("");
      updateDoc(noteRef, {
        list: updatedList,
      });
    }
  };

  const handleSaveChanges = () => {
    setEditedItem(null);
  };

  const handleDeleteItem = async (itemId) => {
    const updatedList = list.filter((item) => item.id !== itemId);
    setList(updatedList);
  };

  const handleDeleteNote = async (itemId) => {
    try {
      await deleteDoc(doc(database, "notes", itemId));
      const updatedList = notes.filter((item) => item.id !== itemId);
      setNotes(updatedList);
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleDeleteList = async (itemId, noteId) => {
    try {
      // console.log(itemId, noteId);
      await updateDoc(doc(database, "notes", noteId));
      // console.log(notes.list);
      const updatedList = notes.list.filter((item) => item.id === itemId);
      // console.log(updateDoc);
      setNotes(updatedList);
    } catch (error) {
      // console.error("Error deleting document: ", error);
    }
  };

  // const handleNoteStatusChange = async (taskId, newStatus) => {
  //   try {
  //     const noteRef = doc(database, "notes", taskId);
  //     await updateDoc(noteRef, {
  //       status: newStatus,
  //     });
  //     console.log("Note status updated successfully!");
  //     const updatedNotes = notes.map((note) => {
  //       if (note.id === taskId) {
  //         return { ...note, status: newStatus };
  //       }
  //       return note;
  //     });
  //     setNotes(updatedNotes);
  //   } catch (error) {
  //     console.error("Error updating note status:", error);
  //   }
  // };

  const handleNoteChange = (noteId, newNote) => {
    const updatedNotes = notes.map((note) => {
      if (note.id === noteId) {
        return { ...note, notes: newNote };
      }
      return note;
    });
    setNotes(updatedNotes);
  };

  const handleSaveButtonClick = async (noteId, newNote) => {
    const noteRef = doc(database, "notes", noteId);
    await updateDoc(noteRef, {
      notes: newNote,
    });
    const updatedNotes = notes.map((note) => {
      if (note.id === noteId) {
        return { ...note, notes: newNote };
      }
      return note;
    });
    setNotes(updatedNotes);
  };

  return (
    <div className="d-flex m-2">
      <div className="col-md-4 col-lg-4 col-xs-12 col-sm-12 m-2">
        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="card-header">
              <div className="form-control d-flex align-items-center border-0">
                <input
                  className="form-check-input ms-0 me-2"
                  type="checkbox"
                  name="status"
                  checked={list.length > 0 && list.every((item) => item.status)}
                  onChange={handleInputChange}
                />
                <input
                  className="form-control form-control-sm border-0"
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Enter task title"
                  style={{ outline: "none" }}
                />
              </div>
            </div>

            <ul className="list-group d-flex flex-column justify-items-center">
              {list.map((item, index) => (
                <li key={item.id} className="card m-2 p-2">
                  {editedItem === item.id ? (
                    <div className="d-flex position-relative">
                      <input
                        className="form-control form-control-sm border-0 w-100"
                        type="text"
                        name={`edit-${item.id}`}
                        value={item.text}
                        onChange={handleInputChange}
                      />
                      <button
                        className="btn btn-primary btn-sm position-absolute top-50 end-0 translate-middle-y"
                        onClick={() => handleSaveChanges(item.id)}
                        style={{ transform: "translateY(-50%)" }}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-between">
                      <div
                        className={
                          item.status ? "text-decoration-line-through" : ""
                        }
                      >
                        <div className="w-100">{item.text}</div>
                      </div>
                      <div
                        className="d-flex justify-content-end ms-5"
                        style={{ width: "30px", height: "30px" }}
                      >
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
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <i className="bi bi-x-square"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
              <div className="card m-2">
                <div className="d-flex position-relative m-2">
                  <input
                    className="form-control form-control-sm border-0 w-100"
                    type="text"
                    name="listInput"
                    value={listInput}
                    onChange={handleInputChange}
                    placeholder="Enter new list item"
                  />
                  <button
                    className="btn btn-primary btn-sm position-absolute top-50 end-0 translate-middle-y"
                    type="button"
                    style={{ transform: "translateY(-50%)" }}
                    onClick={handleAddListItem}
                  >
                    <i className="bi bi-plus-square"></i>
                  </button>
                </div>
              </div>
              <button className="btn btn-success m-3" type="submit">
                Add Task
              </button>
            </ul>
          </div>
        </form>
      </div>
      {notes?.map((note, index) => (
        <div className="col-md-4 col-lg-4 col-xs-12 col-sm-12 m-2" key={index}>
          <div className="card">
            <div className="card-header">
              <div className="form-control d-flex align-items-center border-0">
                <input
                  className="form-check-input m-1"
                  type="checkbox"
                  name={`statusT-${note.id}`}
                  checked={note.status}
                  onChange={handleNotesChange}
                />
                <div className="d-flex position-relative w-100">
                  <input
                    className="form-control form-control-sm border-0 "
                    type="text"
                    name={`edit-${note.id}`}
                    value={note.notes}
                    onChange={(e) => handleNoteChange(note.id, e.target.value)}
                  />
                  <button
                    className="btn btn-primary btn-sm position-absolute top-50 end-0 translate-middle-y"
                    style={{ transform: "translateY(-50%)" }}
                    onClick={() => handleSaveButtonClick(note.id, note.notes)}
                  >
                    Save
                  </button>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  <i className="bi bi-x-square"></i>
                </button>
              </div>
              {note.list.map((item, index) => (
                <li key={item.id} className="card m-2 p-2">
                  {editedItem === item.id ? (
                    <div className="d-flex position-relative">
                      <input
                        className="form-control form-control-sm border-0 w-100"
                        type="text"
                        name={`edit-${item.id}`}
                        value={item.text}
                        onChange={(e) => handleNotesChange(e, note.id, item.id)}
                      />
                      <button
                        className="btn btn-primary btn-sm position-absolute top-50 end-0 translate-middle-y"
                        onClick={() => handleSaveChanges(item.id, note.id)}
                        style={{ transform: "translateY(-50%)" }}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-between">
                      <div
                        className={
                          item.status ? "text-decoration-line-through" : ""
                        }
                      >
                        <div className="w-100">{item.text}</div>
                      </div>
                      <div
                        className="d-flex justify-content-end ms-5"
                        style={{ width: "30px", height: "30px" }}
                      >
                        <label>
                          <input
                            className="form-check-input m-1"
                            type="checkbox"
                            name={`statusL-${item.id}`}
                            checked={item.status}
                            onChange={(e) => handleNotesChange(e, note.id)}
                          />
                        </label>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setEditedItem(item.id)}
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteList([item.id, note.id])}
                        >
                          <i className="bi bi-x-square"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
              <div className="card m-2">
                <div className="d-flex position-relative m-2">
                  <input
                    className="form-control form-control-sm border-0 w-100"
                    type="text"
                    name="listInput"
                    value={existingList}
                    onChange={(e) => handleNotesChange(e, note.id)}
                    placeholder="Enter new list item"
                  />
                  <button
                    className="btn btn-primary btn-sm position-absolute top-50 end-0 translate-middle-y"
                    type="button"
                    onClick={(e) => handleAddListNotes(e, note.id)}
                    style={{ transform: "translateY(-50%)" }}
                  >
                    <i className="bi bi-plus-square"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Home;
