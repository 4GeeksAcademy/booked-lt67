import React, { useState, useEffect } from "react";
import successSound from "../assets/sounds/BookedAudioLogov2.mp3"

const BuscadorGoogleBooks = ({ onLibroAgregado, mode = "normal", defaultValue = "" }) => {
    const [query, setQuery] = useState(defaultValue);
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (defaultValue) setQuery(defaultValue);
    }, [defaultValue]);

    useEffect(() => { 
        
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const timeoutId = setTimeout(() => {
            fetchBooks(query);
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const playSuccess = () => {
        const audio = new Audio(successSound);
        audio.volume = 0.4; // Ajustamos el volumen para que no asuste al usuario
        audio.play().catch(e => console.log("Audio bloqueado por el navegador"));
    };

    const fetchBooks = async (searchTerm) => {
        if (!searchTerm || searchTerm.trim().length < 3) return;

        const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_KEY; // Traemos la llave del .env
        setSearching(true);

        try {

            const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerm)}&maxResults=5&langRestrict=es&key=${apiKey}`;

            const response = await fetch(url);

            if (response.status === 429) {
                console.error("Incluso con API Key, Google pide un respiro.");
                return;
            }

            const data = await response.json();
            setResults(data.items || []);
        } catch (error) {
            console.error("Error en Google API:", error);
        } finally {
            setSearching(false);
        }
    };

    const handleSelect = async (book) => {
        const info = book.volumeInfo;


        const libroParaBackend = {
            nombre: info.title,
            genero: info.categories ? info.categories[0] : "General",
            autores: info.authors || ["Autor Desconocido"],
            nombre_editorial: info.publisher || "Editorial Desconocida",
            google_id: book.id,
            isbn_13: info.industryIdentifiers?.find(id => id.type === "ISBN_13")?.identifier || info.industryIdentifiers?.[0]?.identifier,
            descripcion: info.description || "Sin descripción disponible.",
            image_url: info.imageLinks?.thumbnail?.replace("http://", "https://")
        };

        if (mode === "asistente") {
            playSuccess();
            console.log("Modo asistente: Rellenando formulario...");
            setQuery("");
            setResults([]);
            
            if (onLibroAgregado) {
                onLibroAgregado(libroParaBackend); 
            }
            return; 
        }

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

            const res = await fetch(`${backendUrl}/api/libro_google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(libroParaBackend)
            });

            if (res.ok) {
                const data = await res.json();

                playSuccess();


                setQuery("");
                setResults([]);

                if (onLibroAgregado) {
                    onLibroAgregado(data.id);
                }

                /* // Opcional: puedes dejar el alert, aunque la redirección suele ser suficiente
                console.log("¡Libro procesado con éxito!"); */
            } else {
                const errorData = await res.json();
                console.error("Error del servidor:", errorData.error);
            }
        } catch (error) {
            console.error("Error al guardar en el backend:", error);
        }
    };

    return (
        <div className="position-relative w-100">
            <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0">
                    <i className="fas fa-search text-muted"></i>
                </span>
                <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Busca un Libro..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {searching && (
                <div className="spinner-border spinner-border-sm position-absolute end-0 top-50 translate-middle-y me-2" style={{ zIndex: 2000 }}></div>
            )}

            {results.length > 0 && (
                <ul className="list-group position-absolute w-100 shadow-lg mt-1"
                    style={{
                        zIndex: 9999,         
                        maxHeight: "300px",
                        overflowY: "auto",
                        backgroundColor: "white" 
                    }}>
                    {results.map((book) => (
                        <li
                            key={book.id}
                            className="list-group-item list-group-item-action d-flex align-items-center p-2"
                            style={{ cursor: "pointer", position: "relative", zIndex: 10000 }} 
                            onMouseDown={(e) => {
                                // Truco: A veces onClick falla si el input pierde el foco rápido. 
                                // Usar onMouseDown suele ser más efectivo en buscadores.
                                handleSelect(book);
                            }}
                        >
                            <img
                                src={book.volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://") || "https://via.placeholder.com/35x50"}
                                alt="cover"
                                className="me-2 rounded"
                                style={{ width: "35px", height: "50px", objectFit: "cover" }}
                            />
                            <div className="overflow-hidden">
                                <div className="fw-bold small text-truncate" style={{ maxWidth: "200px" }}>{book.volumeInfo.title}</div>
                                <div className="text-muted" style={{ fontSize: "10px" }}>{book.volumeInfo.authors?.join(", ")}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default BuscadorGoogleBooks;