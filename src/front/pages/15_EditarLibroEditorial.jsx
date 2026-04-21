import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link  } from "react-router-dom";

const EditarLibroEditorial = () => {
    const { theId } = useParams();
    const navigate = useNavigate();

    // --- 1. Blindaje de la base de la API ---
    const API_BASE = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "") + "/api";

    const [nombre, setNombre] = useState("");
    const [genero, setGenero] = useState("");
    const [autorId, setAutorId] = useState("");
    const [editorialId, setEditorialId] = useState("");
    const [imageUrl, setImageUrl] = useState(""); 
    const [originalData, setOriginalData] = useState(null);
    const [autores, setAutores] = useState([]);

    useEffect(() => {
        // Cargar Script de Cloudinary
        const scriptId = "cloudinary-upload-widget-script";
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://upload-widget.cloudinary.com/global/all.js";
            script.async = true;
            document.body.appendChild(script);
        }

        // --- 2. GET Libro por ID blindado ---
        fetch(`${API_BASE}/libro/${theId}`)
            .then(response => {
                if (!response.ok) throw new Error("No se pudo cargar el libro");
                return response.json();
            })
            .then(data => {
                const libroData = {
                    nombre: data.nombre || "",
                    genero: data.genero || "",
                    autor_id: data.autor?.id || "",
                    editorial_id: data.editorial?.id || "",
                    image_url: data.image_url || "" 
                };

                setNombre(libroData.nombre);
                setGenero(libroData.genero);
                setAutorId(libroData.autor_id);
                setEditorialId(libroData.editorial_id);
                setImageUrl(libroData.image_url);
                setOriginalData(libroData);
            })
            .catch(err => console.error(err));

        // --- 3. GET Autores blindado ---
        fetch(`${API_BASE}/autor`)
            .then(res => res.json())
            .then(data => setAutores(data))
            .catch(err => console.error(err));

    }, [theId, API_BASE]);

    const handleUpload = async (e) => {
        e.preventDefault();
        
        // --- 4. GET Firma Cloudinary blindado ---
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
            console.error("Error con Cloudinary:", error);
        }
    };

    const updateData = (e) => {
        e.preventDefault();
        if (!originalData) return;

        const hasChanged = 
            nombre !== originalData.nombre ||
            genero !== originalData.genero ||
            Number(autorId) !== Number(originalData.autor_id) ||
            imageUrl !== originalData.image_url;

        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "nombre": nombre,
                "genero": genero,
                "autor_id": parseInt(autorId),
                "editorial_id": parseInt(editorialId),
                "image_url": imageUrl 
            })
        };

        // --- 5. PUT Actualizar Libro blindado ---
        fetch(`${API_BASE}/libro/${theId}`, requestOptions)
            .then(response => {
                if (response.ok) {
                    if (hasChanged) alert("¡Libro actualizado con éxito!");
                    navigate("/pagina_editorial");
                } else {
                    throw new Error("Error al actualizar");
                }
            })
            .catch(error => alert(error.message));
    };

    return (
        <div className="container mt-5">
            <h2>Editar libro: {nombre}</h2>
            <form onSubmit={updateData} className="col-md-6 border p-4 shadow-sm">
                
                {/* Sección de Imagen */}
                <div className="mb-3 text-center">
                    {imageUrl && <img src={imageUrl} alt="Portada" style={{ width: "120px", borderRadius: "5px", marginBottom: "10px" }}/>}
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
                    <label className="form-label">Género</label>
                    <input type="text" className="form-control" value={genero} onChange={(e) => setGenero(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Autor</label>
                    <select className="form-select" value={autorId} onChange={(e) => setAutorId(e.target.value)}>
                        <option value="">Selecciona un autor</option>
                        {autores.map(a => <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>)}
                    </select>
                </div>
                <button type="submit" className="btn btn-success">Actualizar Libro</button>
            </form>
            <div className="d-flex justify-content-center">
                <Link to={"/pagina_editorial/"} className="m-3 btn btn-sm btn-outline-primary">Volver al Dashboard</Link>
            </div>
        </div>
    );
};

export default EditarLibroEditorial;