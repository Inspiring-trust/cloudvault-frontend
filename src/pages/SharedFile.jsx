import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";

function SharedFile() {

  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [contentType, setContentType] = useState("");
  const [fileName, setFileName] = useState("Shared File");


  useEffect(() => {

    const loadSharedFile = async () => {

      try {

        setLoading(true);
        setError("");

        const response =
          await API.get(
            `/files/shared/${token}`,
            {
              responseType: "blob"
            }
          );

        const type =
          response.headers[
            "content-type"
          ] ||
          "application/octet-stream";

        const blob =
          new Blob(
            [response.data],
            {
              type: type
            }
          );

        const url =
          window.URL.createObjectURL(
            blob
          );

        setFileUrl(url);
        setContentType(type);

        const disposition =
          response.headers[
            "content-disposition"
          ];

        if (disposition) {

          const match =
            disposition.match(
              /filename="?([^"]+)"?/i
            );

          if (match && match[1]) {

            setFileName(
              match[1]
            );
          }
        }

      } catch (error) {

        console.log(
          "Shared File Error:",
          error
        );

        setError(
          "This share link is invalid or the file is no longer available."
        );

      } finally {

        setLoading(false);
      }
    };


    if (token) {

      loadSharedFile();

    } else {

      setError(
        "Invalid share link."
      );

      setLoading(false);
    }


    return () => {

      if (fileUrl) {

        window.URL.revokeObjectURL(
          fileUrl
        );
      }

    };

  }, [token]);


  // =========================================================
  // DOWNLOAD SHARED FILE
  // =========================================================

  const handleDownload = () => {

    if (!fileUrl) {

      return;
    }

    const link =
      document.createElement("a");

    link.href = fileUrl;

    link.download =
      fileName ||
      "download";

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();
  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial"
        }}
      >

        <div>

          <h2>
            Loading shared file...
          </h2>

          <p>
            Please wait.
          </p>

        </div>

      </div>
    );
  }


  // =========================================================
  // ERROR
  // =========================================================

  if (error) {

    return (

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial"
        }}
      >

        <div
          style={{
            textAlign: "center",
            padding: "30px",
            border: "1px solid #ddd",
            borderRadius: "12px",
            maxWidth: "450px"
          }}
        >

          <h1>
            ⚠️
          </h1>

          <h2>
            File Not Available
          </h2>

          <p>
            {error}
          </p>

        </div>

      </div>
    );
  }


  // =========================================================
  // SHARED FILE PAGE
  // =========================================================

  return (

    <div
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        fontFamily: "Arial",
        background: "#f5f7fa"
      }}
    >

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "white",
          padding: "30px",
          borderRadius: "16px",
          boxShadow:
            "0 4px 20px rgba(0,0,0,0.08)"
        }}
      >

        <h1
          style={{
            textAlign: "center"
          }}
        >
          ☁️ CloudVault
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#666"
          }}
        >
          Shared File
        </p>


        <hr />


        <h2>
          📄 {fileName}
        </h2>


        {/* IMAGE PREVIEW */}

        {contentType.startsWith(
          "image/"
        ) && (

          <div
            style={{
              textAlign: "center",
              marginTop: "25px"
            }}
          >

            <img
              src={fileUrl}
              alt={fileName}
              style={{
                maxWidth: "100%",
                maxHeight: "600px",
                borderRadius: "10px"
              }}
            />

          </div>

        )}


        {/* PDF PREVIEW */}

        {contentType ===
          "application/pdf" && (

          <iframe
            src={fileUrl}
            title={fileName}
            style={{
              width: "100%",
              height: "650px",
              border: "none",
              marginTop: "20px",
              borderRadius: "10px"
            }}
          />

        )}


        {/* OTHER FILE */}

        {!contentType.startsWith(
          "image/"
        ) &&
          contentType !==
            "application/pdf" && (

          <div
            style={{
              textAlign: "center",
              padding: "50px 20px"
            }}
          >

            <div
              style={{
                fontSize: "60px"
              }}
            >
              📄
            </div>

            <p>
              Preview is not available
              for this file type.
            </p>

          </div>

        )}


        <div
          style={{
            textAlign: "center",
            marginTop: "30px"
          }}
        >

          <button
            onClick={
              handleDownload
            }
            style={{
              padding:
                "12px 25px",
              border: "none",
              borderRadius:
                "8px",
              cursor:
                "pointer",
              fontSize:
                "16px"
            }}
          >
            ⬇️ Download File
          </button>

        </div>


        <p
          style={{
            textAlign: "center",
            marginTop: "25px",
            color: "#777",
            fontSize: "14px"
          }}
        >
          Shared securely by CloudVault
        </p>

      </div>

    </div>
  );
}

export default SharedFile;