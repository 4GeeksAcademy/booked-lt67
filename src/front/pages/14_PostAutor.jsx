import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const CrearPostAutor = () => {
    const { store } = useGlobalReducer();
    const navigate = useNavigate();
    const [texto, setTexto] = useState("");

    // Definimos la función que se ejecutará al hacer clic en el botón
    const sendData = (e) => {
        e.preventDefault(); 

        const token = localStorage.getItem("token_autor");

        // 1. Limpiamos la URL base
        const base = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

        // 2. Construimos la URL final
        const urlFinal = `${base}/api/postautor`;

        console.log("🔥 URL de disparo (Autor):", urlFinal);

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
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
                navigate("/pagina_autor");
            })
            .catch(error => {
                console.error("Incendio en el fetch de Autor:", error);
            });
    }; 

    
    return (
        <div className="card shadow-sm border-0 mb-4 bg-light">
            <div className="card-body">
                <h5 className="card-title fw-bold text-primary mb-3">Nuevo Post</h5>
                <form onSubmit={sendData}>
                    <div className="mb-3">
                        <textarea
                            className="form-control border-0 shadow-sm"
                            rows="3"
                            placeholder="¿En qué piensas?"
                            value={texto}
                            onChange={(e) => setTexto(e.target.value)}
                            required
                        />
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-outline-secondary px-4" onClick={() => navigate("/pagina_autor")}>
                            Volver al panel
                        </button>
                        <button type="submit" className="btn btn-dark px-4 shadow-sm">
                            Publicar en mi Mural
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}; 

export default CrearPostAutor;