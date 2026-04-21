import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer";

const NuevaEditorial = () => {
    const { store } = useGlobalReducer()
    const navigate = useNavigate()

    // --- 1. Base limpia para subir imagen y para crear ---
    const API_BASE = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "") + "/api";

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [nombre, setNombre] = useState("")
    const [pais, setPais] = useState("")
    const [imageUrl, setImageUrl] = useState("");

    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }

    useEffect(() => {
        const scriptId = "cloudinary-upload-widget-script";
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://upload-widget.cloudinary.com/global/all.js";
            script.type = "text/javascript";
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!window.cloudinary) {
            alert("El cargador de imágenes aún se está preparando.");
            return;
        }

        // --- 2. FETCH de Cloudinary con URL blindada ---
        try {
            const response = await fetch(`${API_BASE}/upload_image`);
            const data = await response.json();

            const widget = window.cloudinary.createUploadWidget({
                cloudName: data.cloudName,
                apiKey: data.apiKey,
                uploadSignatureTimestamp: data.timestamp,
                uploadSignature: data.signature,
                folder: "libros_portadas",
                cropping: true
            }, (error, result) => {
                if (!error && result && result.event === "success") {
                    console.log("Logo de editorial subido:", result.info.secure_url);
                    setImageUrl(result.info.secure_url);
                }
            });
            widget.open();
        } catch (error) {
            console.error("Error al obtener firma de Cloudinary:", error);
        }
    };

    function sendData(e) {
        e.preventDefault()

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "email": email,
                "password": password,
                "nombre": nombre,
                "pais": pais,
                "image_url": imageUrl
            })
        };

        // --- 3. POST de creación blindado ---
        // Usamos la barra final / porque así lo tenías en el original (Flask style)
        fetch(`${API_BASE}/editorial/`, requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Error al crear la editorial");
                return response.json();
            })
            .then(data => {
                console.log("Editorial creada:", data);
                navigate("/editorial");
            })
            .catch(err => console.error("Error en sendData:", err));
    }

    return (
        <>
            <div className="container mt-5">
                <h2>Registro de Editorial Nueva</h2>
                <form onSubmit={sendData} className="col-md-6">
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" name="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input type="password" name="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Nombre</label>
                        <input type="text" name="nombre" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">País</label>
                        <input type="text" name="pais donde reside" className="form-control" value={pais} onChange={(e) => setPais(e.target.value)} />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Portada del Libro</label>
                        <br />
                        <button type="button" className="btn btn-secondary mb-2" onClick={handleUpload}>
                            {imageUrl ? "Cambiar Imagen" : "Subir Imagen"}
                        </button>
                        {imageUrl && <p className="text-success small">Imagen cargada correctamente ✓</p>}
                    </div>

                    <button type="submit" className="btn btn-primary">Crear Editorial</button>
                </form>
            </div>
        </>
    );
};

export default NuevaEditorial