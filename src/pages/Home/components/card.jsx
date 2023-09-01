import React from "react";

function Card({ notes }) {
  return (
    <div className="col-md-4 col-lg-4 col-xs-12 col-sm-12">
      {notes.map((note) => (
        <div className="card mt-3">
          <div className="asd" key={note.id}>
            <div className="card mb-3">
              <div className="card-header">{note.notes}</div>
              {note.list.map((item, index) => (
                <ul className="card-body list-group d-flex flex-column align-items-center">
                  <li key={index} className="list-group-item">
                    {item.text}
                  </li>
                </ul>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Card;
