import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const EditarEditorial = () => {
    const { theId } = useParams();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pais, setPais] = useState("");

    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => {

        const scriptId = "cloudinary-upload-widget-script";
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://upload-widget.cloudinary.com/global/all.js";
            script.async = true;
            document.body.appendChild(script);
        }

        fetch(import.meta.env.VITE_BACKEND_URL + "api/editorial/" + theId)
            .then(response => response.json())
            .then(data => {
            setEmail(data.email || "");
            setPassword(data.password || "");
            setNombre(data.nombre || "");
            setPais(data.pais || "");
            setImageUrl(data.image_url || "");
        });
    }, [theId]);

    const handleUpload = async (e) => {
        e.preventDefault();
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + "api/upload_image");
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
                "email": email,
                "password": password,
                "nombre": nombre,
                "pais": pais,
                "image_url": imageUrl                
            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/editorial/" + theId, requestOptions)
            .then(response => {
                if (response.status === 409) {
                throw new Error("Ese username o email ya está en uso por otra editorial");
            }
                if (response.ok) {
                    alert("¡Editorial actualizado con éxito!");
                    navigate("/editorial"); 
                }
            })
    };

    return (
        <div className="container mt-5">
            <h2>Editar Editorial #{theId}</h2>
            <form onSubmit={updateData} className="col-md-6 border p-4 shadow-sm">

                <div className="mb-3 text-center">
                    {imageUrl && (
                        <img src={imageUrl} alt="Portada" style={{ width: "150px", marginBottom: "10px", borderRadius: "5px" }}/>
                    )}
                    <br />
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleUpload}>
                        {imageUrl ? "Cambiar Portada" : "Subir Portada"}
                    </button>
                </div>

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="text" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">País</label>
                    <input type="text" className="form-control" value={pais} onChange={(e) => setPais(e.target.value)} />
                </div>

                <button type="submit" className="btn btn-success me-2">Actualizar Editorial</button>
            </form>
        </div>
    );
};

export default EditarEditorial;