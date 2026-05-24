import React, { useEffect, useState, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import ComentariosPost from "../components/ComentariosPost";

const FeedLectores = () => {
    const { store } = useGlobalReducer();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [texto, setTexto] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [postExpandido, setPostExpandido] = useState(null);

    const api = `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")}/api`;

    const cargar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${api}/postlector`);
            if (res.ok) setPosts(await res.json());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    const publicar = async (e) => {
        e.preventDefault();
        if (!texto.trim()) return;
        setEnviando(true);
        try {
            const res = await fetch(`${api}/postlector`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lector_id: store.lector_id, texto: texto.trim() })
            });
            if (res.ok) {
                setTexto("");
                cargar();
            }
        } finally {
            setEnviando(false);
        }
    };

    const eliminar = async (id) => {
        if (!window.confirm("¿Eliminar esta publicación?")) return;
        await fetch(`${api}/postlector/${id}`, { method: "DELETE" });
        cargar();
    };

    if (!store.auth_lector) return <Navigate to="/login_lector" />;

    return (
        <div className="min-vh-100 py-5" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
            <div className="container">
                <div className="text-center mb-5 mt-3">
                    <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— Comunidad Lectora</span>
                    <h1 className="display-5 fw-bold text-dark mt-2 mb-3">Feed de Lectores</h1>
                    <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
                        Comparte tus pensamientos, recomendaciones y reflexiones literarias con la comunidad.
                    </p>
                </div>

                <div className="row justify-content-center">
                    <div className="col-lg-7">

                        <div className="card shadow-sm border-0 rounded-4 mb-5 bg-white p-4">
                            <div className="d-flex align-items-center mb-3 gap-3">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${store.nombre_lector}&background=24b0d9&color=fff&size=48`}
                                    className="rounded-circle"
                                    style={{ width: "48px", height: "48px", objectFit: "cover" }}
                                    alt="Tu foto"
                                />
                                <span className="fw-bold text-dark">{store.nombre_lector}</span>
                            </div>
                            <form onSubmit={publicar}>
                                <textarea
                                    className="form-control border-0 bg-light rounded-3 mb-3"
                                    rows={3}
                                    placeholder="¿Qué estás leyendo? ¿Qué quieres compartir con la comunidad?"
                                    value={texto}
                                    onChange={e => setTexto(e.target.value)}
                                    maxLength={1000}
                                    disabled={enviando}
                                />
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="small text-muted">{texto.length}/1000</span>
                                    <button
                                        type="submit"
                                        className="btn btn-booked-blue rounded-pill px-4"
                                        disabled={!texto.trim() || enviando}
                                    >
                                        {enviando ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span>Publicando...</>
                                        ) : (
                                            <><i className="fas fa-pen me-2"></i>Publicar</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-info-booked"></div>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center bg-white p-5 rounded-5 shadow-sm border-0">
                                <i className="fas fa-book-open fa-3x mb-3 text-info-booked opacity-50"></i>
                                <h4 className="fw-bold text-dark">Sin publicaciones aún</h4>
                                <p className="text-muted mb-0">¡Sé el primero en compartir algo con la comunidad!</p>
                            </div>
                        ) : (
                            posts.map(post => (
                                <div key={post.id} className="card shadow-sm border-0 rounded-4 mb-4 bg-white overflow-hidden">
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                                            <Link to={`/perfil_lector/${post.lector_id}`} className="text-decoration-none">
                                                <img
                                                    src={post.foto_lector || `https://ui-avatars.com/api/?name=${post.username_lector}&background=24b0d9&color=fff&size=48`}
                                                    className="rounded-circle shadow-sm border me-3"
                                                    style={{ width: "48px", height: "48px", objectFit: "cover" }}
                                                    alt={post.username_lector}
                                                />
                                            </Link>
                                            <div className="flex-grow-1">
                                                <Link to={`/perfil_lector/${post.lector_id}`} className="text-decoration-none">
                                                    <h6 className="fw-bold mb-0 text-dark">{post.nombre_lector}</h6>
                                                </Link>
                                                <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                    <i className="far fa-clock me-1 text-info-booked"></i>{post.fecha}
                                                </small>
                                            </div>
                                            <div className="ms-auto d-flex align-items-center gap-2">
                                                <span className="badge bg-info-booked text-white rounded-pill px-3 py-2 small">Lector</span>
                                                {store.auth_lector && Number(store.lector_id) === post.lector_id && (
                                                    <button
                                                        className="btn btn-sm text-danger rounded-circle"
                                                        onClick={() => eliminar(post.id)}
                                                        title="Eliminar post"
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <p className="card-text text-dark mb-3" style={{ whiteSpace: 'pre-wrap', fontSize: '1.05rem', lineHeight: '1.6' }}>
                                            {post.texto}
                                        </p>

                                        <button
                                            className="btn btn-sm btn-outline-secondary rounded-pill px-3 mb-2"
                                            onClick={() => setPostExpandido(postExpandido === post.id ? null : post.id)}
                                        >
                                            <i className="fas fa-comment me-2"></i>
                                            {post.total_comentarios} comentario{post.total_comentarios !== 1 ? "s" : ""}
                                        </button>

                                        {postExpandido === post.id && (
                                            <ComentariosPost tipo="lector" postId={post.id} />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedLectores;
