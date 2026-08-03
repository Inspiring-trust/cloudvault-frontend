import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="container">
      <div className="card">
        <h1>CloudVault Dashboard</h1>

        <input type="file" />

        <br /><br />

        <button>Upload File</button>

        <br /><br />

        <h3>Your Files</h3>

        <table width="100%">
          <thead>
            <tr>
              <th>File</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>sample.pdf</td>
              <td>
                <button>Download</button>
              </td>
            </tr>
          </tbody>
        </table>

        <br />

        <Link to="/">
          <button>Logout</button>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;