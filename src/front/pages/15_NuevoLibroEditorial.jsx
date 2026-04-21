import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import BuscadorGoogleBooks from "../components/23_BuscadorGoogleBooks";

const NuevoLibroEditorial = () => {
    const { theId } = useParams();
    const navigate = useNavigate();

    // --- 1. Blindaje de la base de la API ---
    const API_BASE = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "") + "/api";

    const [nombre, setNombre] = useState("");
    const [genero, setGenero] = useState("");
    const [autorId, setAutorId] = useState("");
    const [autores, setAutores] = useState([]);
    const [nombreEditorial, setNombreEditorial] = useState("");
    const [autorGoogle, setAutorGoogle] = useState("");
    const [descripcion, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [googleId, setGoogleId] = useState("");

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

        // --- 2. GET Autores blindado ---
        fetch(`${API_BASE}/autor`)
            .then(res => res.json())
            .then(data => setAutores(data))
            .catch(err => console.error("Error cargando autores:", err));

        // --- 3. GET Editorial blindado ---
        fetch(`${API_BASE}/editorial/${theId}`)
            .then(res => res.json())
            .then(data => setNombreEditorial(data.nombre))
            .catch(err => console.error("Error cargando editorial:", err));

    }, [theId, API_BASE]);

    const rellenarFormulario = (datosLibro) => {
        setNombre(datosLibro.nombre || "");
        setGenero(datosLibro.genero || "");
        setDescription(datosLibro.descripcion || ""); // OJO: Verifica si usas 'description' o 'descripcion' en el estado
        setImageUrl(datosLibro.image_url || "");
        setGoogleId(datosLibro.google_id || "");

        if (datosLibro.autores && datosLibro.autores.length > 0) {
            setAutorGoogle(datosLibro.autores[0]);
        }

        alert("¡Datos importados de Google! Por favor, selecciona el Autor oficial de la lista si existe.");
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!window.cloudinary) {
            alert("El cargador de imágenes aún se está preparando.");
            return;
        }

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
            console.error("Error al conectar con Cloudinary:", error);
        }
    };

    function sendData(e) {
        e.preventDefault();

        if (!autorId && !autorGoogle) {
            alert("Por favor, selecciona un autor o usa el buscador de Google");
            return;
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "nombre": nombre,
                "genero": genero,
                "autor_id": autorId || null, 
                "nombre_autor_google": autorGoogle, 
                "editorial_id": parseInt(theId),
                "google_id": googleId,
                "image_url": imageUrl,
                "descripcion": descripcion
            })
        };
        

        // --- 5. POST Libro blindado ---
        fetch(`${API_BASE}/libro`, requestOptions)
            .then(response => {
                if (response.ok) return response.json();
                throw new Error("Error al crear el libro");
            })
            .then(data => {
                alert("¡Libro agregado exitosamente!");
                navigate("/pagina_editorial");
            })
            .catch(err => alert(err.message));
    }

    return (
        <>
            <div className="container mt-5">
                <h2>Registro de Libro Nuevo para {nombreEditorial}</h2>
                <div className="card p-3 mb-4 bg-light border-primary">
                    <label className="fw-bold mb-2">🔎 ¿Está en Google Books? Ahórrate escribir:</label>
                    <BuscadorGoogleBooks onLibroAgregado={rellenarFormulario} mode="asistente" />
                    <small className="text-muted mt-2">Al seleccionar un libro, el formulario de abajo se llenará solo.</small>
                </div>


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
            <div className="d-flex justify-content-center">
                <Link to={"/pagina_editorial/"} className="m-3 btn btn-sm btn-outline-primary">Volver al Dashboard</Link>
            </div>
        </>
    );
};

export default NuevoLibroEditorial