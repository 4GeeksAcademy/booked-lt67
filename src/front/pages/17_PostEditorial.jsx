import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const PostEditorial = () => {
    const navigate = useNavigate();
    const [editorialId, setEditorialId] = useState("");
    const [editoriales, setEditoriales] = useState([]);
    const [texto, setTexto] = useState("");

    useEffect(() => {
        // GET Blindado para cargar las editoriales
        const base = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
        fetch(`${base}/api/editorial`)
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

        // --- LA SOLUCIÓN QUE FUNCIONÓ EN AUTOR ---
        const base = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
        const urlFinal = `${base}/api/posteditorial`;

        console.log("🚀 Disparando POST Editorial a:", urlFinal);

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "editorial_id": parseInt(editorialId),
                "texto": texto,
            })
        };

        fetch(urlFinal, requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Error en el servidor");
                return response.json();
            })
            .then(data => {
                console.log("Post creado con éxito:", data);
                navigate("/pagina_editorial"); 
            })
            .catch(error => {
                console.error("Fallo en el POST Editorial:", error);
            });
    }

    return (
        <div className="container mt-5">
            <div className="card shadow p-4 rounded-4 border-0 bg-white">
                <h2 className="fw-bold text-dark mb-4">Crear Post de Editorial</h2>
                <form onSubmit={sendData} className="col-md-8 mx-auto">
                    <div className="mb-3">
                        <label className="form-label fw-bold">Selecciona tu Editorial</label>
                        <select 
                            className="form-select border-0 bg-light shadow-sm" 
                            value={editorialId} 
                            onChange={(e) => setEditorialId(e.target.value)}
                            required
                        >
                            <option value="">-- Elige una opción --</option>
                            {editoriales.map(ed => (
                                <option key={ed.id} value={ed.id}>
                                    {ed.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold">Contenido del Anuncio</label>
                        <textarea 
                            className="form-control border-0 bg-light shadow-sm" 
                            rows="5"
                            placeholder="Novedades de la editorial..."
                            value={texto} 
                            onChange={(e) => setTexto(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                        <Link to="/pagina_editorial" className="btn btn-outline-secondary px-4 rounded-pill">
                            Cancelar
                        </Link>
                        <button type="submit" className="btn btn-info-booked text-white px-4 rounded-pill shadow-sm">
                            Publicar Ahora
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostEditorial;