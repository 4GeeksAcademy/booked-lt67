import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer";

const NuevaEditorial = () => {
    const { store, dispatch } = useGlobalReducer()

    const navigate = useNavigate()

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
                console.log("Logo de editorial subido:", result.info.secure_url);
                setImageUrl(result.info.secure_url);
            }
        });

        widget.open();
    };
    
    function sendData(e){
        e.preventDefault()
        console.log("send data")
        console.log(email, password, nombre, pais)

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
    fetch(import.meta.env.VITE_BACKEND_URL + "api/editorial/", requestOptions)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            navigate("/editorial") 
        ;}) 
    }
    
return (
    <>
        <div className="container mt-5">
            <h2>Registro de Editorial Nueva</h2>
            <form onSubmit={sendData} className="col-md-6">
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)}/>
                </div>

                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" name="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)}/>
                </div>                

                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input type="text" name="nombre" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)}/>
                </div>

                <div className="mb-3">
                    <label className="form-label">País</label>
                    <input type="text" name="pais donde reside" className="form-control" value={pais} onChange={(e) => setPais(e.target.value)}/>
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