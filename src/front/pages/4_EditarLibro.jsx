import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Libro from "./4_Libro";

const EditarLibro = () => {
    const { theId } = useParams();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState("");
    const [genero, setGenero] = useState("");
    const [autorId, setAutorId] = useState("");
    const [editorialId, setEditorialId] = useState("");

    const [imageUrl, setImageUrl] = useState("");

    const [autores, setAutores] = useState([]); 
    const [editoriales, setEditoriales] = useState([]);


    useEffect(() => {

        const scriptId = "cloudinary-upload-widget-script";
            if (!document.getElementById(scriptId)) {
                const script = document.createElement("script");
                script.id = scriptId;
                script.src = "https://upload-widget.cloudinary.com/global/all.js";
                script.async = true;
                document.body.appendChild(script);
            }

        fetch(import.meta.env.VITE_BACKEND_URL + "api/libro/" + theId)
            .then(response => {
                return response.json();
            })
            .then(data => {

                setNombre(data.nombre);
                setGenero(data.genero);
                setAutorId(data.autor_id || "");
                setEditorialId(data.editorial_id || "");
                setImageUrl(data.image_url || "");
            })

        fetch(`${import.meta.env.VITE_BACKEND_URL}api/autor`)
            .then(res => res.json())
            .then(data => setAutores(data));

        fetch(`${import.meta.env.VITE_BACKEND_URL}api/editorial`)
            .then(res => res.json())
            .then(data => setEditoriales(data));

    }, [theId]);

    const handleUpload = async (e) => {
        e.preventDefault();
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + "api/sign-upload");
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

        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "nombre": nombre,
                "genero": genero,
                "autor_id": autorId,
                "editorial_id": editorialId,
                "image_url": imageUrl
            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/libro/" + theId, requestOptions)
            .then(response => {
                if (response.status === 409) {
                    throw new Error("Ese nombre o genero ya está en uso por otro lector");
                }
                if (response.ok) {
                    alert("¡Libro actualizado con éxito!");
                    navigate("/libro");
                }
            })
    };

    return (
        <div className="container mt-5">
            <h2>Editar libro: {nombre}</h2>
            <form onSubmit={updateData} className="col-md-6 border p-4 shadow-sm">

                <div className="mb-3 text-center">
                    {imageUrl && (
                        <img 
                            src={imageUrl} 
                            alt="Portada" 
                            style={{ width: "150px", marginBottom: "10px", borderRadius: "5px" }} 
                        />
                    )}
                    <br />
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleUpload}>
                        {imageUrl ? "Cambiar Portada" : "Subir Portada"}
                    </button>
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
            </form>
        </div>
    );
};

export default EditarLibro;