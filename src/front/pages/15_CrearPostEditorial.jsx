import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const CrearPostEditorial = () => {

    const navigate = useNavigate();

    const [editorialId, setEditorialId] = useState("");
    const [editoriales, setEditoriales] = useState([]);
    const [texto, setTexto] = useState(""); // Corregido: inicializado como string vacío, no array

    useEffect(() => {
        // Limpiamos la URL para el GET inicial
        const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
        fetch(`${baseUrl}/api/editorial`)
            .then(response => response.json())
            .then(data => setEditoriales(data))
            .catch(error => console.error("Error cargando editoriales:", error));
    }, []);

    function sendData(e) {
        e.preventDefault();

        if (!editorialId) {
            alert("Por favor selecciona una editorial");
            return;
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "editorial_id": parseInt(editorialId),
                "texto": texto,
            })
        };

        // --- SOLUCIÓN BLINDADA ---
        // 1. Tomamos la URL y le quitamos cualquier barra al final con un Regex
        const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
        
        // 2. Construimos la ruta manualmente poniendo nosotros la barra
        const urlFinal = `${baseUrl}/api/posteditorial`;

        fetch(urlFinal, requestOptions)
            .then(response => {
                if (response.ok) return response.json();
                throw new Error("Error en el servidor");
            })
            .then(data => {
                console.log("Post creado:", data);
                navigate("/pagina_editorial"); // Asegúrate de que esta ruta sea la correcta en tu App
            })
            .catch(error => console.error("Error al publicar:", error));
    }

    return (
        <div className="container mt-5">
            <h2>Crear Post</h2>
            <form onSubmit={sendData} className="col-md-6">

                <div className="mb-3">
                    <label className="form-label">Editorial</label>
                    <select className="form-control" value={editorialId} onChange={(e) => setEditorialId(e.target.value)}>
                        <option value="">Selecciona una Editorial</option>
                        {editoriales.map(l => (
                            <option key={l.id} value={l.id}>
                                {l.nombre}
                            </option>
                        ))}
                    </select>
                </div>


                <div className="mb-3">
                    <label className="form-label">Texto</label>
                    <textarea type="text" className="form-control" value={texto} onChange={(e) => setTexto(e.target.value)} required />
                </div>


                <button type="submit" className="btn btn-primary">Crear Post</button>
            </form>
            <div className="d-flex justify-content-center">
                <Link to={"/pagina_editorial/"} className="m-3 btn btn-sm btn-outline-primary">Volver al Dashboard</Link>
            </div>
        </div>
    );
};

export default CrearPostEditorial;