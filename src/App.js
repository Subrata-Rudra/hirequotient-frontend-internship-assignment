import "./App.css";
import axios from "axios";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faSearch } from "@fortawesome/free-solid-svg-icons";

function App() {
  const [localData, setLocalData] = useState([]);
  const [data, setData] = useState([]);
  function fetchData() {
    axios
      .get(
        "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
      )
      .then((response) => {
        localStorage.setItem("userData", JSON.stringify(response.data));
      })
      .catch((err) => {
        console.error(`Error is fetching data from server: ${err}`);
      });
  }
  useEffect(() => {
    fetchData();
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setLocalData(parsedData);
        setData(parsedData);
      } catch (err) {
        console.error(`Error parsing stored data: ${err}`);
      }
    } else {
      fetchData();
    }
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [allboxChecked, setAllboxChecked] = useState(false);
  const [initialRenderBoxChecked, setInitialRenderBoxChecked] = useState(true);
  const [initialRenderSelectedRows, setInitialRenderSelectedRows] =
    useState(true);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [searchText, setSearchText] = useState("");
  const recordsPerPage = 10;
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = data.slice(firstIndex, lastIndex);
  const npage = Math.ceil(data.length / recordsPerPage);
  const nums = [...Array(npage + 1).keys()].slice(1);

  function prevPage() {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }
  function nextPage() {
    if (currentPage < npage) {
      setCurrentPage(currentPage + 1);
    }
  }
  function changeCurrentPage(p_id) {
    setCurrentPage(p_id);
  }
  function firstPage() {
    setCurrentPage(1);
  }
  function lastPage() {
    setCurrentPage(npage);
  }

  const handleCheckboxChange = (id) => {
    setSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows.includes(id)) {
        return prevSelectedRows.filter((rowId) => rowId !== id);
      } else {
        return [...prevSelectedRows, id];
      }
    });
  };

  const handleCheckAllBoxChange = () => {
    setAllboxChecked(!allboxChecked);
  };

  const handleEdit = (id) => {
    setEditId(id);
    data.map((d) => {
      if (d.id === id) {
        setName(d.name);
        setEmail(d.email);
        setRole(d.role);
      }
    });
  };

  const handleSave = (id) => {
    data.map((d) => {
      if (d.id === id) {
        d.name = name;
        d.email = email;
        d.role = role;
      }
    });
    setEditId(null);
  };

  const deleteOneRow = (id) => {
    setData((prevData) => prevData.filter((row) => row.id !== id));
  };

  const deleteManyRows = () => {
    setData((prevData) => {
      const newData = prevData.filter((row) => !selectedRows.includes(row.id));
      return newData;
    });
    setAllboxChecked(false);
    setSelectedRows([]);
  };

  const handleSearch = async () => {
    if (searchText !== "") {
      const searchResult = data.filter((row) => {
        const isNameIncluded = row.name.toLowerCase().includes(searchText);
        const isEmailIncluded = row.email.toLowerCase().includes(searchText);
        const isRoleIncluded = row.role.toLowerCase().includes(searchText);

        return isNameIncluded || isEmailIncluded || isRoleIncluded;
      });
      const sortedResult = searchResult.sort(
        (a, b) => parseInt(a.id) - parseInt(b.id)
      );
      setData(sortedResult);
    } else {
      const sortedResult = localData.sort(
        (a, b) => parseInt(a.id) - parseInt(b.id)
      );
      setData(sortedResult);
    }
  };

  const resetData = () => {
    setSearchText("");
    const sortedResult = localData.sort(
      (a, b) => parseInt(a.id) - parseInt(b.id)
    );
    setData(sortedResult);
  };

  useEffect(() => {
    if (initialRenderBoxChecked) {
      // This is to prevent the initial triggering of this useEffect
      setInitialRenderBoxChecked(false);
      return;
    }
    if (allboxChecked === true) {
      const rows = [];
      records.map((d) => {
        rows.push(d.id);
      });
      setSelectedRows(rows);
    } else {
      setSelectedRows([]);
    }
  }, [allboxChecked]);

  useEffect(() => {
    if (initialRenderSelectedRows) {
      // This is to prevent the initial triggering of this useEffect
      setInitialRenderSelectedRows(false);
      return;
    }
  }, [selectedRows]);

  return (
    <div className="App">
      <h1>Admin Dashboard</h1>
      <div style={{ display: "flex", flexDirection: "row", marginBottom: "1rem" }}>
        <input
          className="form-control"
          type="text"
          placeholder="Search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value.toLowerCase())}
          style={{ width: "30%" }}
        ></input>
        <button
          onClick={handleSearch}
          className="btn bg-transparent"
          style={{ border: "2px solid grey", marginLeft: ".3rem" }}
        >
          <FontAwesomeIcon icon={faSearch}></FontAwesomeIcon>
        </button>
        <button
          onClick={resetData}
          className="btn btn-danger"
          style={{ marginLeft: ".5rem" }}
        >
          Clear Search
        </button>
      </div>
      <div>
        <table className="table table-hover table-bordered">
          <thead>
            <tr>
              <td>
                <input
                  type="checkbox"
                  checked={allboxChecked}
                  onChange={handleCheckAllBoxChange}
                />
              </td>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          {data.length > 0 ? (
            <tbody>
              {records.map((d, i) => (
                <tr
                  key={i}
                  className={selectedRows.includes(d.id) ? "grayish-bg" : ""}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(d.id)}
                      onChange={() => handleCheckboxChange(d.id)}
                    />
                  </td>
                  <td>{d.name}</td>
                  <td>{d.email}</td>
                  <td>{d.role}</td>
                  <td>
                    {editId === d.id ? (
                      <>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                        <input
                          type="text"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          placeholder="Select role"
                        >
                          <option value="member">member</option>
                          <option value="admin">admin</option>
                        </select>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleSave(d.id)}
                        >
                          Save
                        </button>
                      </>
                    ) : (
                      <button
                        className="border-0 bg-transparent"
                        onClick={() => handleEdit(d.id)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    )}{" "}
                    <button
                      className="border-0 bg-transparent"
                      onClick={() => deleteOneRow(d.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          ) : (
            <>No Data To Show</>
          )}
        </table>
        <nav>
          <ul className="pagination">
            <li className="page-item">
              <a
                id="first-page"
                href="#"
                className="page-link"
                onClick={firstPage}
              >
                First
              </a>
            </li>
            <li className="page-item">
              <a
                id="prev-page"
                href="#"
                className="page-link"
                onClick={prevPage}
              >
                Prev
              </a>
            </li>
            {nums.map((n, i) => (
              <li
                className={`page-item ${currentPage === n ? "active" : ""}`}
                key={i}
              >
                <a
                  href="#"
                  className="page-link"
                  onClick={() => changeCurrentPage(n)}
                >
                  {n}
                </a>
              </li>
            ))}
            <li className="page-item">
              <a
                id="next-page"
                href="#"
                className="page-link"
                onClick={nextPage}
              >
                Next
              </a>
            </li>
            <li className="page-item">
              <a
                id="last-page"
                href="#"
                className="page-link"
                onClick={lastPage}
              >
                Last
              </a>
            </li>
          </ul>
        </nav>
        {selectedRows.length ? (
          <button className="btn btn-danger" onClick={deleteManyRows}>
            Delete Selected Rows
          </button>
        ) : (
          <></>
        )}
        <div>
          {selectedRows.length} of {recordsPerPage} row(s) selected
        </div>
      </div>
    </div>
  );
}

export default App;
