import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NuevoLibro = () => {

    const navigate = useNavigate()

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
            script.type = "text/javascript";
            script.async = true;
            script.onload = () => console.log("Cloudinary Widget cargado con éxito");
            document.body.appendChild(script);
    }

        fetch(import.meta.env.VITE_BACKEND_URL + "api/autor")
            .then(res => res.json())
            .then(data => setAutores(data))
            

        fetch(import.meta.env.VITE_BACKEND_URL + "api/editorial")
            .then(res => res.json())
            .then(data => setEditoriales(data))
            
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!window.cloudinary) {
            alert("El cargador de imágenes aún se está preparando. Intenta de nuevo en 2 segundos.");
            return;
        }

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
                console.log("Imagen subida con éxito:", result.info.secure_url);
                setImageUrl(result.info.secure_url);
            }
        });

        widget.open();
    };

    function sendData(e) {
        e.preventDefault()
        
        console.log("send data")
        console.log(nombre, genero, autorId, editorialId)

        if (!autorId || !editorialId) {
        alert("Por favor, selecciona un autor y una editorial de la lista.");
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
                "image_url":imageUrl
            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/libro", requestOptions)
            .then(response => {
                if (response.ok) return response.json();
                throw new Error("Error al crear el libro");
            })
            .then(data => {
                alert("¡Libro agregado exitosamente!");
                navigate("/libro");
            })
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