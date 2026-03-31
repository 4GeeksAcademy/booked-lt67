import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const BotonAgregarLibroExistente = ({ onAddSuccess, librosActuales }) => {
    const { store } = useGlobalReducer();
    const [librosDisponibles, setLibrosDisponibles] = useState([]);
    const [libroId, setLibroId] = useState("");
    const [mensaje, setMensaje] = useState("");

    const lectorId = store.lector_id;
    const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

    useEffect(() => {
        // Obtenemos TODOS los libros de la plataforma
        fetch(`${baseUrl}/api/libro`)
            .then(res => res.json())
            .then(data => {
                // FILTRO: Solo mostrar libros que el lector NO tenga ya en su lista
                const filtrados = data.filter(libro => {
                    return !librosActuales?.some(miLibro => miLibro.id === libro.id);
                });
                setLibrosDisponibles(filtrados);
            })
            .catch(err => console.error("Error al cargar catálogo general:", err));
    }, [librosActuales, baseUrl]);

    const agregarLibro = (e) => {
        e.preventDefault();

        if (!libroId) {
            setMensaje("Selecciona un libro");
            return;
        }

        // Aquí usamos tu endpoint de favoritos como "mis libros" o el que definas para el catálogo
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "lector_id": parseInt(lectorId),
                "libro_id": parseInt(libroId)
            })
        };

        // Nota: Ajusta la URL al endpoint que uses para vincular libro con lector
        fetch(`${baseUrl}/api/favoritos/libros`, requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Error al agregar el libro");
                return response.json();
            })
            .then(() => {
                setMensaje("");
                setLibroId("");
                alert("¡Libro agregado a tu biblioteca!");
                if (onAddSuccess) onAddSuccess(); 
            })
            .catch(error => setMensaje(error.message));
    };

    return (
        <div className="card shadow-sm border-0 mb-4 bg-light">
            <div className="card-body">
                <h6 className="card-title fw-bold">Añadir de la biblioteca general</h6>
                {mensaje && <div className="alert alert-warning py-1 small">{mensaje}</div>}
                <form onSubmit={agregarLibro} className="d-flex gap-2">
                    <select 
                        className="form-select form-select-sm" 
                        value={libroId} 
                        onChange={e => setLibroId(e.target.value)}
                    >
                        <option value="">Buscar libro...</option>
                        {librosDisponibles.map(lib => (
                            <option key={lib.id} value={lib.id}>
                                {lib.nombre} ({lib.nombre_autor})
                            </option>
                        ))}
                    </select>
                    <button type="submit" className="btn btn-success btn-sm">Añadir</button>
                </form>
            </div>
        </div>
    );
};

export default BotonAgregarLibroExistente;