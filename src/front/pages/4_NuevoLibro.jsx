import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer";

const NuevoLibro = () => {
    const navigate = useNavigate();

    // --- 1. Definimos la base limpia para los 4 fetches de este archivo ---
    const API_BASE = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "") + "/api";

    const [nombre, setNombre] = useState("");
    const [genero, setGenero] = useState("");
    const [autorId, setAutorId] = useState("");
    const [editorialId, setEditorialId] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    const [autores, setAutores] = useState([]);
    const [editoriales, setEditoriales] = useState([]);
    const { store } = useGlobalReducer();
                
    if (!store.auth_admin) { return <Navigate to="/login_admin" />; }

    useEffect(() => {
        const scriptId = "cloudinary-upload-widget-script";
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://upload-widget.cloudinary.com/global/all.js";
            script.type = "text/javascript";
            script.async = true;
            script.onload = () => console.log("Cloudinary Widget cargado");
            document.body.appendChild(script);
        }

        // --- 2. GET Autores (Select) blindado ---
        fetch(`${API_BASE}/autor`)
            .then(res => res.json())
            .then(data => setAutores(data))
            .catch(err => console.error("Error autores:", err));

        // --- 3. GET Editoriales (Select) blindado ---
        fetch(`${API_BASE}/editorial`)
            .then(res => res.json())
            .then(data => setEditoriales(data))
            .catch(err => console.error("Error editoriales:", err));
            
    }, [API_BASE]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!window.cloudinary) {
            alert("El cargador aún se está preparando.");
            return;
        }

        // --- 4. Firma de Cloudinary blindada ---
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
                    setImageUrl(result.info.secure_url);
                }
            });
            widget.open();
        } catch (error) {
            console.error("Error Cloudinary:", error);
        }
    };

    function sendData(e) {
        e.preventDefault();
        
        if (!autorId || !editorialId) {
            alert("Por favor, selecciona un autor y una editorial.");
            return;
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "nombre": nombre,
                "genero": genero,
                "autor_id": parseInt(autorId), 
                "editorial_id": parseInt(editorialId),
                "image_url": imageUrl
            })
        };

        // --- 5. POST Final blindado ---
        fetch(`${API_BASE}/libro`, requestOptions)
            .then(response => {
                if (response.ok) return response.json();
                throw new Error("Error al crear el libro");
            })
            .then(data => {
                alert("¡Libro agregado exitosamente!");
                navigate("/libro");
            })
            .catch(err => alert(err.message));
    }
    
    return (
        <>
            <div className="container mt-5">
                <h2>Registro de Libro Nuevo</h2>
                <form onSubmit={sendData} className="col-md-6">
                    <div className="mb-3">
                        <label className="form-label">Nombre</label>
                        <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Genero</label>
                        <input type="text" className="form-control" value={genero} onChange={(e) => setGenero(e.target.value)} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Autor</label>
                        <select className="form-select" value={autorId} onChange={(e) => setAutorId(e.target.value)}>
                            <option value="">Selecciona un Autor</option>
                            {autores.map(a => <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>)}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Editorial</label>
                        <select className="form-select" value={editorialId} onChange={(e) => setEditorialId(e.target.value)}>
                            <option value="">Selecciona una editorial</option>
                            {editoriales.map(ed => <option key={ed.id} value={ed.id}>{ed.nombre}</option>)}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Portada del Libro</label>
                        <br />
                        <button type="button" className="btn btn-secondary mb-2" onClick={handleUpload}>
                            {imageUrl ? "Cambiar Imagen" : "Subir Imagen"}
                        </button>
                        {imageUrl && <p className="text-success small">Imagen cargada correctamente ✓</p>}
                    </div>

                    <button type="submit" className="btn btn-primary">Agregar Libro</button>
                </form>
            </div>
        </>
    );
};

export default NuevoLibro