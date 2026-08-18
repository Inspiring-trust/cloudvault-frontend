import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import "./Dashboard.css";


function Dashboard() {

    const [selectedFile, setSelectedFile] = useState(null);
    const [files, setFiles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [storageUsed, setStorageUsed] = useState(0);

    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [uploadProgress, setUploadProgress] = useState(0);

    const fileInputRef = useRef(null);

    const STORAGE_LIMIT =
        100 * 1024 * 1024;


    // =========================================================
    // LOAD FILES
    // =========================================================

    const loadFiles = async () => {

        try {

            const response =
                await API.get("/files");

            setFiles(response.data);

        } catch (error) {

            console.log(
                "Get Files Error:",
                error
            );
        }
    };


    // =========================================================
    // LOAD STORAGE
    // =========================================================

    const loadStorage = async () => {

        try {

            const response =
                await API.get("/files/storage");

            setStorageUsed(response.data);

        } catch (error) {

            console.log(
                "Storage Error:",
                error
            );
        }
    };


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        loadFiles();
        loadStorage();

    }, []);


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
            (bytes /
                Math.pow(1024, i)
            ).toFixed(2)
            +
            " "
            +
            sizes[i]
        );
    };


    // =========================================================
    // SELECT FILE
    // =========================================================

    const selectFile = (file) => {

        if (!file) {
            return;
        }

        setSelectedFile(file);

        setMessage("");
        setMessageType("");

        setUploadProgress(0);
    };


    const handleFileChange = (event) => {

        const file =
            event.target.files[0];

        selectFile(file);
    };


    // =========================================================
    // DRAG & DROP
    // =========================================================

    const handleDragOver = (event) => {

        event.preventDefault();
        event.stopPropagation();

        setDragActive(true);
    };


    const handleDragLeave = (event) => {

        event.preventDefault();
        event.stopPropagation();

        setDragActive(false);
    };


    const handleDrop = (event) => {

        event.preventDefault();
        event.stopPropagation();

        setDragActive(false);

        const file =
            event.dataTransfer.files[0];

        selectFile(file);
    };


    const openFileSelector = () => {

        if (fileInputRef.current) {

            fileInputRef.current.click();
        }
    };


    // =========================================================
    // UPLOAD
    // =========================================================

    const handleUpload = async () => {

        if (!selectedFile) {

            setMessage(
                "Please select a file first."
            );

            setMessageType("error");

            return;
        }


        if (
            storageUsed +
            selectedFile.size >
            STORAGE_LIMIT
        ) {

            setMessage(
                "Storage limit exceeded. You do not have enough storage."
            );

            setMessageType("error");

            return;
        }


        try {

            setIsUploading(true);

            setMessage("");
            setMessageType("");

            setUploadProgress(0);


            const token =
                localStorage.getItem("token");


            if (!token) {

                setMessage(
                    "Please login again."
                );

                setMessageType("error");

                return;
            }


            const formData =
                new FormData();

            formData.append(
                "file",
                selectedFile
            );


            await API.post(
                "/files/upload",
                formData,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    },

                    onUploadProgress:
                        (progressEvent) => {

                            if (
                                progressEvent.total
                            ) {

                                const percent =
                                    Math.round(
                                        (
                                            progressEvent.loaded /
                                            progressEvent.total
                                        ) * 100
                                    );

                                setUploadProgress(
                                    percent
                                );
                            }
                        }
                }
            );


            setUploadProgress(100);


            setMessage(
                "File uploaded successfully to CloudVault."
            );

            setMessageType("success");


            setSelectedFile(null);


            if (
                fileInputRef.current
            ) {

                fileInputRef.current.value =
                    "";
            }


            await loadFiles();
            await loadStorage();


        } catch (error) {

            console.log(
                "Upload Error:",
                error
            );


            setMessage(
                error?.response?.data ||
                "File upload failed. Please try again."
            );

            setMessageType("error");

            setUploadProgress(0);


        } finally {

            setIsUploading(false);
        }
    };


    // =========================================================
    // DOWNLOAD
    // =========================================================

    const handleDownload = async (
        id,
        fileName
    ) => {

        try {

            const token =
                localStorage.getItem("token");


            if (!token) {

                alert(
                    "Please login again"
                );

                return;
            }


            const response =
                await API.get(
                    `/files/download/${id}`,
                    {
                        responseType: "blob",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const blob =
                new Blob(
                    [response.data],
                    {
                        type:
                            response.headers[
                                "content-type"
                            ] ||
                            "application/octet-stream"
                    }
                );


            const url =
                window.URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement("a");


            link.href = url;

            link.download =
                fileName ||
                "download";


            document.body.appendChild(
                link
            );

            link.click();

            link.remove();


            window.URL.revokeObjectURL(
                url
            );


        } catch (error) {

            console.log(
                "Download Error:",
                error
            );

            alert(
                "File Download Failed"
            );
        }
    };


    // =========================================================
    // PREVIEW
    // =========================================================

    const handlePreview = async (
        id,
        fileType,
        fileName
    ) => {

        let previewTab = null;

        try {

            const token =
                localStorage.getItem("token");


            if (!token) {

                alert(
                    "Please login again"
                );

                return;
            }


            previewTab =
                window.open(
                    "",
                    "_blank"
                );


            if (!previewTab) {

                alert(
                    "Please allow pop-ups for localhost"
                );

                return;
            }


            previewTab.document.write(`
                <!DOCTYPE html>

                <html>

                <head>

                    <title>
                        CloudVault Preview
                    </title>

                    <style>

                        html,
                        body {

                            margin: 0;
                            padding: 0;

                            width: 100%;
                            height: 100%;

                            background: #111827;

                            font-family:
                                Arial,
                                sans-serif;
                        }


                        body {

                            display: flex;

                            justify-content:
                                center;

                            align-items:
                                center;
                        }


                        img {

                            max-width: 95vw;

                            max-height: 95vh;

                            width: auto;

                            height: auto;

                            object-fit:
                                contain;
                        }


                        iframe {

                            width: 100vw;

                            height: 100vh;

                            border: none;

                            background:
                                white;
                        }


                        .message {

                            color: white;

                            font-size: 18px;

                            text-align:
                                center;

                            padding: 20px;
                        }

                    </style>

                </head>


                <body>

                    <div class="message">

                        Loading preview...

                    </div>

                </body>

                </html>
            `);


            const response =
                await API.get(
                    `/files/preview/${id}`,
                    {
                        responseType: "blob",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            // =====================================================
            // DETERMINE MIME TYPE
            // =====================================================

            let mimeType =
                fileType ||
                response.headers[
                    "content-type"
                ] ||
                "";


            if (
                !mimeType ||
                mimeType ===
                    "application/octet-stream"
            ) {

                const lowerName =
                    (
                        fileName ||
                        ""
                    ).toLowerCase();


                if (
                    lowerName.endsWith(".jpg") ||
                    lowerName.endsWith(".jpeg")
                ) {

                    mimeType =
                        "image/jpeg";

                } else if (
                    lowerName.endsWith(".png")
                ) {

                    mimeType =
                        "image/png";

                } else if (
                    lowerName.endsWith(".gif")
                ) {

                    mimeType =
                        "image/gif";

                } else if (
                    lowerName.endsWith(".webp")
                ) {

                    mimeType =
                        "image/webp";

                } else if (
                    lowerName.endsWith(".svg")
                ) {

                    mimeType =
                        "image/svg+xml";

                } else if (
                    lowerName.endsWith(".pdf")
                ) {

                    mimeType =
                        "application/pdf";

                } else {

                    mimeType =
                        "application/octet-stream";
                }
            }


            // =====================================================
            // CREATE BLOB
            // =====================================================

            const blob =
                new Blob(
                    [response.data],
                    {
                        type: mimeType
                    }
                );


            const url =
                window.URL.createObjectURL(
                    blob
                );


            // =====================================================
            // IMAGE PREVIEW
            // =====================================================

            if (
                mimeType.startsWith(
                    "image/"
                )
            ) {

                previewTab.document.body.innerHTML = `

                    <img
                        src="${url}"
                        alt="CloudVault Preview"
                    />

                `;

                previewTab.document.title =
                    fileName ||
                    "CloudVault Preview";
            }


            // =====================================================
            // PDF PREVIEW
            // =====================================================

            else if (
                mimeType ===
                "application/pdf"
            ) {

                previewTab.document.body.innerHTML = `

                    <iframe
                        src="${url}"
                        title="PDF Preview">
                    </iframe>

                `;

                previewTab.document.title =
                    fileName ||
                    "PDF Preview";
            }


            // =====================================================
            // OTHER FILE TYPES
            // =====================================================

            else {

                previewTab.document.body.innerHTML = `

                    <div class="message">

                        Preview is not available
                        for this file type.

                        <br>
                        <br>

                        ${fileName || ""}

                    </div>

                `;

                previewTab.document.title =
                    "CloudVault Preview";
            }


            setTimeout(() => {

                window.URL.revokeObjectURL(
                    url
                );

            }, 300000);


        } catch (error) {

            console.log(
                "Preview Error:",
                error
            );


            if (previewTab) {

                previewTab.close();
            }


            alert(
                "File Preview Failed"
            );
        }
    };


    // =========================================================
    // SHARE FILE
    // =========================================================

    const handleShare = async (id) => {

        try {

            const token =
                localStorage.getItem("token");


            if (!token) {

                alert(
                    "Please login again."
                );

                return;
            }


            // =====================================================
            // GENERATE SHARE TOKEN
            // =====================================================

            const response =
                await API.post(
                    `/files/share/${id}`,
                    {},
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const shareToken =
                response.data;


            if (
                !shareToken ||
                typeof shareToken !== "string"
            ) {

                throw new Error(
                    "Invalid share token received from server."
                );
            }


            // =====================================================
            // CREATE SHARE LINK
            // =====================================================

            const shareLink =
                `${window.location.protocol}//${window.location.hostname}:8080/api/files/shared/${shareToken}`;


            // =====================================================
            // COPY LINK
            // =====================================================

            try {

                await navigator.clipboard.writeText(
                    shareLink
                );


                alert(
                    "✅ Share link copied successfully!"
                );


            } catch (clipboardError) {

                console.log(
                    "Clipboard Error:",
                    clipboardError
                );


                window.prompt(
                    "Copy this share link:",
                    shareLink
                );
            }


        } catch (error) {

            console.log(
                "Share Error:",
                error
            );


            const serverMessage =
                error?.response?.data;


            alert(
                serverMessage ||
                "❌ File Share Failed"
            );
        }
    };


    // =========================================================
    // DELETE
    // =========================================================

    const handleDelete = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this file?"
            );


        if (!confirmDelete) {

            return;
        }


        try {

            const token =
                localStorage.getItem("token");


            if (!token) {

                alert(
                    "Please login again"
                );

                return;
            }


            await API.delete(
                `/files/${id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            alert(
                "File Deleted Successfully"
            );


            await loadFiles();
            await loadStorage();


        } catch (error) {

            console.log(
                "Delete Error:",
                error
            );

            alert(
                "File Delete Failed"
            );
        }
    };


    // =========================================================
    // SEARCH
    // =========================================================

    const filteredFiles =
        files.filter((file) => {

            const fileName =
                file.fileName ||
                file.filename ||
                file.name ||
                "";


            return fileName
                .toLowerCase()
                .includes(
                    searchTerm.toLowerCase()
                );
        });


    // =========================================================
    // STORAGE
    // =========================================================

    const storagePercentage =
        Math.min(
            (
                storageUsed /
                STORAGE_LIMIT
            ) * 100,
            100
        );


    const remainingStorage =
        Math.max(
            STORAGE_LIMIT -
            storageUsed,
            0
        );


    // =========================================================
    // UI
    // =========================================================

    return (

        <div className="dashboard-page">

            <div className="dashboard-container">


                {/* =====================================================
                    HEADER
                ===================================================== */}

                <div className="dashboard-header">

                    <div className="brand-section">

                        <h1>
                            ☁️ CloudVault
                        </h1>

                        <p>
                            Secure File Storage System
                        </p>

                    </div>


                    <div className="header-actions">

                        <Link
                            to="/profile"
                            style={{
                                textDecoration:
                                    "none"
                            }}
                        >

                            <button
                                className={
                                    "cv-button " +
                                    "profile-button"
                                }
                            >
                                👤 Profile
                            </button>

                        </Link>


                        <Link to="/">

                            <button
                                className={
                                    "cv-button " +
                                    "logout-button"
                                }

                                onClick={() => {

                                    localStorage.removeItem(
                                        "token"
                                    );

                                }}
                            >
                                🚪 Logout
                            </button>

                        </Link>

                    </div>

                </div>


                {/* =====================================================
                    STORAGE
                ===================================================== */}

                <div className="storage-card">

                    <div className="storage-top">

                        <h2 className="storage-title">
                            ☁️ Cloud Storage
                        </h2>


                        <span className="storage-value">

                            {formatFileSize(
                                storageUsed
                            )}

                            {" / "}

                            100 MB

                        </span>

                    </div>


                    <div className="storage-progress">

                        <div
                            className={
                                "storage-progress-bar"
                            }

                            style={{

                                width:
                                    `${storagePercentage}%`,

                                background:
                                    storagePercentage >= 90
                                        ? "#dc2626"
                                        : undefined

                            }}
                        />

                    </div>


                    <div className="storage-info">

                        <span>

                            {storagePercentage.toFixed(
                                1
                            )}

                            {" "}%
                            used

                        </span>


                        <span>

                            {formatFileSize(
                                remainingStorage
                            )}

                            {" "}remaining

                        </span>

                    </div>

                </div>


                {/* =====================================================
                    UPLOAD SECTION
                ===================================================== */}

                <div className="upload-section">

                    <div className="upload-section-header">

                        <div>

                            <h2 className="upload-section-title">
                                📤 Upload Files
                            </h2>

                            <p className="upload-section-description">
                                Upload your files securely to CloudVault.
                            </p>

                        </div>

                    </div>


                    <div
                        className={
                            `upload-drop-zone ${
                                dragActive
                                    ? "drag-active"
                                    : ""
                            }`
                        }

                        onDragOver={
                            handleDragOver
                        }

                        onDragLeave={
                            handleDragLeave
                        }

                        onDrop={
                            handleDrop
                        }

                        onClick={
                            openFileSelector
                        }
                    >

                        <input
                            ref={fileInputRef}
                            id="fileInput"
                            type="file"

                            onChange={
                                handleFileChange
                            }

                            disabled={
                                isUploading
                            }
                        />


                        <div className="upload-icon">
                            ☁️
                        </div>


                        <p className="upload-title">

                            {dragActive
                                ? "Drop your file here"
                                : "Drag & Drop your file here"
                            }

                        </p>


                        <p className="upload-subtitle">

                            or click here to choose a file

                        </p>

                    </div>


                    {/* SELECTED FILE */}

                    {selectedFile && (

                        <div className="selected-file-card">

                            <div className="selected-file-info">

                                <div className="selected-file-icon">
                                    📄
                                </div>


                                <div className="selected-file-details">

                                    <p className="selected-file-name">
                                        {selectedFile.name}
                                    </p>

                                    <p className="selected-file-size">

                                        {formatFileSize(
                                            selectedFile.size
                                        )}

                                    </p>

                                </div>

                            </div>


                            <button
                                className={
                                    "cv-button " +
                                    "upload-button"
                                }

                                onClick={(event) => {

                                    event.stopPropagation();

                                    handleUpload();

                                }}

                                disabled={
                                    isUploading
                                }
                            >

                                {isUploading
                                    ? "⏳ Uploading..."
                                    : "📤 Upload File"
                                }

                            </button>

                        </div>

                    )}


                    {/* UPLOAD PROGRESS */}

                    {isUploading && (

                        <div className="upload-progress-container">

                            <div className="upload-progress-top">

                                <span>
                                    Uploading...
                                </span>

                                <span>
                                    {uploadProgress}%
                                </span>

                            </div>


                            <div className="upload-progress">

                                <div
                                    className={
                                        "upload-progress-bar"
                                    }

                                    style={{
                                        width:
                                            `${uploadProgress}%`
                                    }}
                                />

                            </div>

                        </div>

                    )}


                    {/* MESSAGE */}

                    {message && (

                        <div
                            className={
                                `upload-message ${
                                    messageType
                                }`
                            }
                        >

                            {message}

                        </div>

                    )}

                </div>


                {/* =====================================================
                    TOOLBAR
                ===================================================== */}

                <div className="dashboard-toolbar">

                    <div className="search-box">

                        <input
                            type="text"

                            placeholder="🔍 Search files..."

                            value={
                                searchTerm
                            }

                            onChange={(e) =>
                                setSearchTerm(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                </div>


                {/* =====================================================
                    FILES
                ===================================================== */}

                <div className="files-card">

                    <div className="files-header">

                        <h2>
                            📁 Your Files
                        </h2>

                    </div>


                    {filteredFiles.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                📂
                            </div>


                            <h3>

                                {searchTerm
                                    ? "No matching files"
                                    : "No files uploaded"
                                }

                            </h3>


                            <p>

                                {searchTerm
                                    ? "Try a different search."
                                    : "Upload your first file to CloudVault."
                                }

                            </p>

                        </div>

                    ) : (

                        <div className="files-table-wrapper">

                            <table className="files-table">

                                <thead>

                                    <tr>

                                        <th>
                                            File Name
                                        </th>

                                        <th>
                                            Type
                                        </th>

                                        <th>
                                            Size
                                        </th>

                                        <th>
                                            Uploaded
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredFiles.map(
                                        (file) => {

                                            const fileName =
                                                file.fileName ||
                                                file.filename ||
                                                file.name ||
                                                "Unknown File";


                                            const fileType =
                                                file.fileType ||
                                                "";


                                            const canPreview =
                                                fileType.startsWith(
                                                    "image/"
                                                ) ||

                                                fileType ===
                                                    "application/pdf" ||

                                                /\.(jpg|jpeg|png|gif|webp|pdf)$/i.test(
                                                    fileName
                                                );


                                            return (

                                                <tr
                                                    key={
                                                        file.id
                                                    }
                                                >

                                                    <td>

                                                        <span className="file-name">

                                                            📄 {fileName}

                                                        </span>

                                                    </td>


                                                    <td>

                                                        {fileType ||
                                                            "-"}

                                                    </td>


                                                    <td>

                                                        {formatFileSize(
                                                            file.fileSize
                                                        )}

                                                    </td>


                                                    <td>

                                                        {file.uploadedAt

                                                            ? new Date(
                                                                file.uploadedAt
                                                            ).toLocaleString()

                                                            : "-"
                                                        }

                                                    </td>


                                                    <td>

                                                        <div className="file-actions">


                                                            {/* PREVIEW */}

                                                            {canPreview && (

                                                                <button
                                                                    className={
                                                                        "cv-button " +
                                                                        "preview-button"
                                                                    }

                                                                    onClick={() =>
                                                                        handlePreview(
                                                                            file.id,
                                                                            fileType,
                                                                            fileName
                                                                        )
                                                                    }
                                                                >

                                                                    👁 Preview

                                                                </button>

                                                            )}


                                                            {/* DOWNLOAD */}

                                                            <button
                                                                className={
                                                                    "cv-button " +
                                                                    "download-button"
                                                                }

                                                                onClick={() =>
                                                                    handleDownload(
                                                                        file.id,
                                                                        fileName
                                                                    )
                                                                }
                                                            >

                                                                ⬇ Download

                                                            </button>


                                                            {/* SHARE */}

                                                            <button
                                                                className={
                                                                    "cv-button " +
                                                                    "share-button"
                                                                }

                                                                onClick={() =>
                                                                    handleShare(
                                                                        file.id
                                                                    )
                                                                }
                                                            >

                                                                🔗 Share

                                                            </button>


                                                            {/* DELETE */}

                                                            <button
                                                                className={
                                                                    "cv-button " +
                                                                    "delete-button"
                                                                }

                                                                onClick={() =>
                                                                    handleDelete(
                                                                        file.id
                                                                    )
                                                                }
                                                            >

                                                                🗑 Delete

                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>


                {/* =====================================================
                    FOOTER
                ===================================================== */}

                <div className="dashboard-footer">

                    <span>

                        {files.length} file
                        {files.length !== 1
                            ? "s"
                            : ""
                        }

                        {" • CloudVault"}

                    </span>


                    <Link
                        to="/profile"
                        style={{
                            textDecoration:
                                "none"
                        }}
                    >

                        <button
                            className={
                                "cv-button " +
                                "profile-button"
                            }
                        >

                            👤 My Profile

                        </button>

                    </Link>

                </div>


            </div>

        </div>
    );
}


export default Dashboard;