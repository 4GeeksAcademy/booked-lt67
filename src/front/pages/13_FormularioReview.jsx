import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const FormularioReview = () => {
    const { theId } = useParams();
    const navigate = useNavigate();
    const { store } = useGlobalReducer();
    const [db, setDb] = useState({ libro: null, reviews: [], edit: null });
    const url = `${import.meta.env.VITE_BACKEND_URL}/api/reviews`;

    const getData = async () => {
        const [l, r] = await Promise.all([
            fetch(`${url.replace('reviews', 'libro')}/${theId}`).then(res => res.json()),
            fetch(url).then(res => res.json())
        ]);
        setDb({ ...db, libro: l, reviews: r.filter(i => i.libro?.id == theId).sort((a,b) => a.lector_id == store.lector_id ? -1 : b.id - a.id) });
    };

    useEffect(() => { getData() }, [theId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const body = { texto: fd.get("texto"), puntuacion: parseInt(fd.get("puntuacion")), lector_id: store.lector_id, libro_id: theId };
        
        await fetch(db.edit ? `${url}/${db.edit.id}` : url, {
            method: db.edit ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        setDb({ ...db, edit: null });
        e.target.reset();
        getData();
    };

    const del = async (id) => { if(confirm("¿Borrar?")) { await fetch(`${url}/${id}`, { method: "DELETE" }); getData(); }};

    if (!db.libro) return <p>Cargando...</p>;

    return (
        <div className="container mt-4">
            <button onClick={() => navigate(-1)} className="btn btn-sm btn-light mb-3">← Volver</button>
            <div className="row">
                <div className="col-md-5 card p-3 shadow-sm">
                    <h4>{db.libro.nombre}</h4>
                    <form onSubmit={handleSubmit} key={db.edit?.id}>
                        <textarea name="texto" className="form-control mb-2" defaultValue={db.edit?.texto} required placeholder="Tu opinión..." />
                        <div className="d-flex gap-2">
                            <input name="puntuacion" type="number" className="form-control w-25" defaultValue={db.edit?.puntuacion || 5} min="0" max="10" />
                            <button className={`btn w-100 ${db.edit ? "btn-warning" : "btn-primary"}`}>{db.edit ? "Editar" : "Publicar"}</button>
                        </div>
                        {db.edit && <button type="button" className="btn btn-link btn-sm w-100" onClick={() => setDb({...db, edit: null})}>Cancelar</button>}
                    </form>
                </div>
                <div className="col-md-7">
                    {db.reviews.map(r => (
                        <div key={r.id} className="p-2 border-bottom d-flex justify-content-between align-items-start">
                            <div>
                                <strong>{r.nombre_lector}</strong> <span className="badge bg-warning text-dark">{r.puntuacion}</span>
                                <p className="small text-muted mb-0">{r.texto}</p>
                            </div>
                            {r.lector_id == store.lector_id && (
                                <div>
                                    <button className="btn btn-sm text-primary" onClick={() => setDb({...db, edit: r})}><i className="fas fa-edit"/></button>
                                    <button className="btn btn-sm text-danger" onClick={() => del(r.id)}><i className="fas fa-trash"/></button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FormularioReview;