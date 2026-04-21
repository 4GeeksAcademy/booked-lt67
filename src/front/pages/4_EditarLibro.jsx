import React, { useEffect, useState } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const EditarLibro = () => {
    const { theId } = useParams();
    const navigate = useNavigate();

    // --- 1. Definimos la base limpia para los 5 fetches de este archivo ---
    const API_BASE = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "") + "/api";

    const [nombre, setNombre] = useState("");
    const [genero, setGenero] = useState("");
    const [autorId, setAutorId] = useState("");
    const [editorialId, setEditorialId] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [originalData, setOriginalData] = useState(null);

    const [autores, setAutores] = useState([]); 
    const [editoriales, setEditoriales] = useState([]);

    const { store } = useGlobalReducer();
            
    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }

    useEffect(() => {
        const scriptId = "cloudinary-upload-widget-script";
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://upload-widget.cloudinary.com/global/all.js";
            script.async = true;
            document.body.appendChild(script);
        }

        // --- 2. GET Datos del Libro ---
        fetch(`${API_BASE}/libro/${theId}`)
            .then(response => response.json())
            .then(data => {
                const libroData = {
                    nombre: data.nombre || "",
                    genero: data.genero || "",
                    autor_id: data.autor_id || "",
                    editorial_id: data.editorial_id || "",
                    image_url: data.image_url || ""
                };
                setNombre(libroData.nombre);
                setGenero(libroData.genero);
                setAutorId(libroData.autor_id);
                setEditorialId(libroData.editorial_id);
                setImageUrl(libroData.image_url);
                setOriginalData(libroData);
            });

        // --- 3. GET Autores (Para el Select) ---
        fetch(`${API_BASE}/autor`)
            .then(res => res.json())
            .then(data => setAutores(data))
            .catch(err => console.error("Error cargando autores:", err));

        // --- 4. GET Editoriales (Para el Select) ---
        fetch(`${API_BASE}/editorial`)
            .then(res => res.json())
            .then(data => setEditoriales(data))
            .catch(err => console.error("Error cargando editoriales:", err));

    }, [theId, API_BASE]);

    const handleUpload = async (e) => {
        e.preventDefault();
        // --- 5. Firma de Cloudinary ---
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
    };

    const updateData = (e) => {
        e.preventDefault();

        const hasChanged = 
            nombre !== originalData?.nombre ||
            genero !== originalData?.genero ||
            autorId !== originalData?.autor_id ||
            editorialId !== originalData?.editorial_id ||
            imageUrl !== originalData?.image_url;

        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "nombre": nombre,
                "genero": genero ,
                "autor_id": autorId,
                "editorial_id": editorialId,
                "image_url": imageUrl
            })
        };

        // --- 6. PUT Final ---
        fetch(`${API_BASE}/libro/${theId}`, requestOptions)
            .then(response => {
                if (response.status === 409) {
                    throw new Error("Ese nombre ya está en uso");
                }
                if (response.ok) {
                    if (hasChanged) {
                        alert("¡Libro actualizado con éxito!");
                    }
                    navigate("/libro");
                }
            })
            .catch(err => alert(err.message));
    };

    return (
        <div className="container mt-5">
            <h2>Editar libro: {nombre}</h2>
            <form onSubmit={updateData} className="col-md-6 border p-4 shadow-sm">

                <div className="mb-3 text-center">
                    {imageUrl && (
                        <img src={imageUrl} alt="Portada" style={{ width: "150px", marginBottom: "10px", borderRadius: "5px" }}/>
                    )}
                    <br />
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleUpload}>
                        {imageUrl ? "Cambiar Portada" : "Subir Portada"}
                    </button>

                    {imageUrl && (
                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setImageUrl("")}>
                            Eliminar Imagen
                        </button>
                    )}

                </div>

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
                        <option value="">Selecciona un autor</option>
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

                <button type="submit" className="btn btn-success me-2">Actualizar Libro</button>

                <div className="mt-4">
                     <button onClick={() => navigate(-1)} className="btn btn-secondary">
                        <i className="fas fa-arrow-left me-2"></i>Volver
                    </button>
                </div>

            </form>
        </div>
    );
};

export default EditarLibro;