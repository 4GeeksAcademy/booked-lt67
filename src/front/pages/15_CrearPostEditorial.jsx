import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const CrearPostEditorial = () => {
    const navigate = useNavigate();

    const [editorialId, setEditorialId] = useState("");
    const [editoriales, setEditoriales] = useState([]);
    const [texto, setTexto] = useState("");

    useEffect(() => {
        // --- GET BLINDADO ---
        const base = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
        const urlGet = `${base}/api/editorial`;
        
        fetch(urlGet)
            .then(response => {
                if (!response.ok) throw new Error("Error al cargar editoriales");
                return response.json();
            })
            .then(data => setEditoriales(data))
            .catch(error => console.error("Error inicial:", error));
    }, []);

    function sendData(e) {
        e.preventDefault();

        if (!editorialId) {
            alert("Por favor selecciona una editorial");
            return;
        }

        // --- POST BLINDADO ---
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
                if (!response.ok) throw new Error("Error en el servidor al crear post");
                return response.json();
            })
            .then(data => {
                console.log("Post creado con éxito:", data);
                // Ajustamos la navegación según lo que necesites
                navigate("/pagina_editorial"); 
            })
            .catch(error => {
                console.error("Fallo total en el POST:", error);
                alert("No se pudo publicar. Revisa la consola para más detalles.");
            });
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

