import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

function Profile() {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [storageUsed, setStorageUsed] = useState(0);
  const [fileCount, setFileCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Change Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const STORAGE_LIMIT =
    100 * 1024 * 1024;


  // =========================================================
  // FORMAT FILE SIZE
  // =========================================================

  const formatFileSize = (bytes) => {

    if (!bytes || bytes === 0) {
      return "0 Bytes";
    }

    const sizes = [
      "Bytes",
      "KB",
      "MB",
      "GB"
    ];

    const i =
      Math.floor(
        Math.log(bytes) /
        Math.log(1024)
      );

    return (
      (
        bytes /
        Math.pow(1024, i)
      ).toFixed(2) +
      " " +
      sizes[i]
    );
  };


  // =========================================================
  // LOAD PROFILE
  // =========================================================

  const loadProfile = async () => {

    try {

      const token =
        localStorage.getItem("token");

      if (!token) {

        navigate("/");

        return;
      }


      const authConfig = {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      };


      const profileResponse =
        await API.get(
          "/users/profile",
          authConfig
        );


      const filesResponse =
        await API.get(
          "/files",
          authConfig
        );


      const storageResponse =
        await API.get(
          "/files/storage",
          authConfig
        );


      setUser(
        profileResponse.data
      );


      setFileCount(
        filesResponse.data.length
      );


      setStorageUsed(
        storageResponse.data
      );


    } catch (error) {

      console.log(
        "Profile Error:",
        error
      );


      if (
        error.response &&
        error.response.status === 401
      ) {

        localStorage.removeItem(
          "token"
        );

        navigate("/");

        return;
      }


      setError(
        "Unable to load profile."
      );

    } finally {

      setLoading(false);
    }
  };


  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {

    loadProfile();

  }, []);


  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  const handleChangePassword = async (event) => {

    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");


    // Current password check

    if (!currentPassword.trim()) {

      setPasswordError(
        "Please enter your current password."
      );

      return;
    }


    // New password check

    if (!newPassword.trim()) {

      setPasswordError(
        "Please enter a new password."
      );

      return;
    }


    // Minimum length

    if (newPassword.length < 6) {

      setPasswordError(
        "New password must be at least 6 characters."
      );

      return;
    }


    // Confirm password

    if (
      newPassword !==
      confirmPassword
    ) {

      setPasswordError(
        "New password and confirm password do not match."
      );

      return;
    }


    // Same password

    if (
      currentPassword ===
      newPassword
    ) {

      setPasswordError(
        "New password must be different from current password."
      );

      return;
    }


    try {

      setPasswordLoading(true);


      const token =
        localStorage.getItem("token");


      if (!token) {

        navigate("/");

        return;
      }


      await API.put(
        "/users/change-password",
        {
          currentPassword:
            currentPassword,

          newPassword:
            newPassword
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );


      setPasswordMessage(
        "Password changed successfully."
      );


      // Clear form

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");


    } catch (error) {

      console.log(
        "Change Password Error:",
        error
      );


      if (
        error.response &&
        error.response.data
      ) {

        setPasswordError(
          typeof error.response.data ===
            "string"
            ? error.response.data
            : "Unable to change password."
        );

      } else {

        setPasswordError(
          "Unable to change password."
        );
      }

    } finally {

      setPasswordLoading(false);
    }
  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="container">

        <div className="card">

          <h2>
            Loading Profile...
          </h2>

        </div>

      </div>
    );
  }


  // =========================================================
  // ERROR
  // =========================================================

  if (error) {

    return (

      <div className="container">

        <div className="card">

          <h2>
            Profile Error
          </h2>

          <p>
            {error}
          </p>


          <Link to="/dashboard">

            <button>
              Back to Dashboard
            </button>

          </Link>

        </div>

      </div>
    );
  }


  // =========================================================
  // STORAGE
  // =========================================================

  const remainingStorage =
    Math.max(
      STORAGE_LIMIT -
        storageUsed,
      0
    );


  const storagePercentage =
    Math.min(
      (
        storageUsed /
        STORAGE_LIMIT
      ) * 100,
      100
    );


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="container">

      <div
        className="card"
        style={{
          maxWidth: "700px",
          margin: "30px auto"
        }}
      >


        {/* =====================================================
            PROFILE HEADER
        ===================================================== */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "30px"
          }}
        >

          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              background: "#03AED2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 15px",
              fontSize: "42px"
            }}
          >
            👤
          </div>


          <h1>
            My Profile
          </h1>


          <p>
            CloudVault Account
          </p>

        </div>


        {/* =====================================================
            ACCOUNT INFORMATION
        ===================================================== */}

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px"
          }}
        >

          <h2>
            Account Information
          </h2>


          <div
            style={{
              marginTop: "20px"
            }}
          >

            <p>
              <strong>
                Name
              </strong>
            </p>

            <p>
              {user?.name || "-"}
            </p>

          </div>


          <div
            style={{
              marginTop: "15px"
            }}
          >

            <p>
              <strong>
                Email
              </strong>
            </p>

            <p>
              {user?.email || "-"}
            </p>

          </div>

        </div>


        {/* =====================================================
            STORAGE INFORMATION
        ===================================================== */}

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px"
          }}
        >

          <h2>
            Storage
          </h2>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap: "15px",
              marginTop: "20px"
            }}
          >


            <div
              style={{
                padding: "15px",
                background: "#f8fafc",
                borderRadius: "10px",
                textAlign: "center"
              }}
            >

              <h3>
                📁
              </h3>

              <strong>
                {fileCount}
              </strong>

              <p>
                Files
              </p>

            </div>


            <div
              style={{
                padding: "15px",
                background: "#f8fafc",
                borderRadius: "10px",
                textAlign: "center"
              }}
            >

              <h3>
                💾
              </h3>

              <strong>
                {formatFileSize(
                  storageUsed
                )}
              </strong>

              <p>
                Used
              </p>

            </div>


            <div
              style={{
                padding: "15px",
                background: "#f8fafc",
                borderRadius: "10px",
                textAlign: "center"
              }}
            >

              <h3>
                ☁️
              </h3>

              <strong>
                {formatFileSize(
                  remainingStorage
                )}
              </strong>

              <p>
                Remaining
              </p>

            </div>

          </div>


          {/* STORAGE PROGRESS */}

          <div
            style={{
              marginTop: "25px"
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginBottom: "8px"
              }}
            >

              <span>
                Storage Used
              </span>

              <span>
                {storagePercentage.toFixed(
                  1
                )}
                %
              </span>

            </div>


            <div
              style={{
                width: "100%",
                height: "12px",
                background: "#e5e7eb",
                borderRadius: "10px",
                overflow: "hidden"
              }}
            >

              <div
                style={{
                  width:
                    `${storagePercentage}%`,
                  height: "100%",
                  background:
                    storagePercentage >= 90
                      ? "#dc2626"
                      : "#03AED2",
                  transition:
                    "width 0.3s ease"
                }}
              />

            </div>


            <p
              style={{
                fontSize: "14px",
                color: "#666"
              }}
            >
              {formatFileSize(
                storageUsed
              )}{" "}
              of 100 MB used
            </p>

          </div>

        </div>


        {/* =====================================================
            CHANGE PASSWORD
        ===================================================== */}

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px"
          }}
        >

          <h2>
            🔐 Change Password
          </h2>


          <p
            style={{
              color: "#666",
              fontSize: "14px"
            }}
          >
            Update your CloudVault account password.
          </p>


          <form
            onSubmit={
              handleChangePassword
            }
          >


            {/* CURRENT PASSWORD */}

            <div
              style={{
                marginTop: "20px"
              }}
            >

              <label>
                <strong>
                  Current Password
                </strong>
              </label>


              <input
                type="password"
                value={
                  currentPassword
                }
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value
                  )
                }
                placeholder="Enter current password"
                autoComplete="current-password"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px",
                  marginTop: "8px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius: "8px"
                }}
              />

            </div>


            {/* NEW PASSWORD */}

            <div
              style={{
                marginTop: "15px"
              }}
            >

              <label>
                <strong>
                  New Password
                </strong>
              </label>


              <input
                type="password"
                value={
                  newPassword
                }
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                placeholder="Enter new password"
                autoComplete="new-password"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px",
                  marginTop: "8px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius: "8px"
                }}
              />

            </div>


            {/* CONFIRM PASSWORD */}

            <div
              style={{
                marginTop: "15px"
              }}
            >

              <label>
                <strong>
                  Confirm New Password
                </strong>
              </label>


              <input
                type="password"
                value={
                  confirmPassword
                }
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Confirm new password"
                autoComplete="new-password"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px",
                  marginTop: "8px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius: "8px"
                }}
              />

            </div>


            {/* ERROR */}

            {passwordError && (

              <div
                style={{
                  marginTop: "15px",
                  padding: "10px",
                  borderRadius: "8px",
                  background: "#fef2f2",
                  color: "#dc2626"
                }}
              >
                {passwordError}
              </div>

            )}


            {/* SUCCESS */}

            {passwordMessage && (

              <div
                style={{
                  marginTop: "15px",
                  padding: "10px",
                  borderRadius: "8px",
                  background: "#ecfdf5",
                  color: "#047857"
                }}
              >
                {passwordMessage}
              </div>

            )}


            {/* CHANGE PASSWORD BUTTON */}

            <button
              type="submit"
              disabled={
                passwordLoading
              }
              style={{
                marginTop: "20px",
                width: "100%",
                padding: "12px",
                border: "none",
                borderRadius: "8px",
                background:
                  passwordLoading
                    ? "#94a3b8"
                    : "#03AED2",
                color: "white",
                fontSize: "15px",
                fontWeight: "600",
                cursor:
                  passwordLoading
                    ? "not-allowed"
                    : "pointer"
              }}
            >

              {passwordLoading
                ? "Changing Password..."
                : "🔐 Change Password"}

            </button>

          </form>

        </div>


        {/* =====================================================
            BACK TO DASHBOARD
        ===================================================== */}

        <div
          style={{
            textAlign: "center",
            marginTop: "25px"
          }}
        >

          <Link to="/dashboard">

            <button>
              ← Back to Dashboard
            </button>

          </Link>

        </div>

      </div>

    </div>
  );
}

export default Profile;