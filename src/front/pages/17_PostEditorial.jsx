import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer"; // Importamos el reducer por si acaso

const PostEditorial = () => {
    const { store } = useGlobalReducer();
    const navigate = useNavigate();
    const [texto, setTexto] = useState("");
    const [editoriales, setEditoriales] = useState([]);
    const [editorialId, setEditorialId] = useState("");

    // Efecto para cargar la lista de editoriales (usando la misma lógica de URL)
    useEffect(() => {
        const base = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
        fetch(`${base}/api/editorial`)
            .then(response => response.json())
            .then(data => setEditoriales(data))
            .catch(error => console.error("Error cargando editoriales:", error));
    }, []);

    const sendData = (e) => {
        e.preventDefault();

        if (!editorialId) {
            alert("Error: Por favor selecciona una editorial");
            return;
        }

        // 1. Limpiamos la URL base (quita la barra si existe) - EXACTAMENTE IGUAL QUE AUTOR
        const base = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

        // 2. Construimos la URL final con la ruta de EDITORIAL
        const urlFinal = `${base}/api/posteditorial`; 

        console.log("🔥 URL de disparo (Editorial):", urlFinal);

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "editorial_id": parseInt(editorialId), // Usamos editorial_id
                "texto": texto,
            })
        };

        fetch(urlFinal, requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Error en el servidor");
                return response.json();
            })
            .then(data => {
                console.log("Publicado con éxito:", data);
                navigate("/pagina_editorial"); // Volvemos a la página de editorial
            })
            .catch(error => {
                console.error("Incendio en el fetch de Editorial:", error);
            });
    };

    return (
        <div className="card shadow-sm border-0 mb-4 bg-light">
            <div className="card-body">
                <h5 className="card-title fw-bold text-info-booked mb-3">Nuevo Post de Editorial</h5>
                <form onSubmit={sendData}>
                    {/* Select de Editoriales */}
                    <div className="mb-3">
                        <select 
                            className="form-select border-0 shadow-sm"
                            value={editorialId}
                            onChange={(e) => setEditorialId(e.target.value)}
                            required
                        >
                            <option value="">Selecciona tu Editorial...</option>
                            {editoriales.map(ed => (
                                <option key={ed.id} value={ed.id}>{ed.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <textarea 
                            className="form-control border-0 shadow-sm" 
                            rows="4" 
                            placeholder="Anuncios, lanzamientos o noticias..." 
                            value={texto} 
                            onChange={(e) => setTexto(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-outline-secondary px-4" onClick={() => navigate("/pagina_editorial")}>
                            Volver al panel
                        </button>
                        <button type="submit" className="btn btn-info-booked text-white px-4 shadow-sm">
                            Publicar Anuncio
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostEditorial;