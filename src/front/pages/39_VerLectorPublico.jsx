import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import CajaComentarios from "../components/45_CajaComentarios";

const VerLectorPublico = () => {
    const { theId } = useParams();
    const { store } = useGlobalReducer();
    const navigate = useNavigate();
    const [db, setDb] = useState({
        lector: null,
        reviews: [],
        leyendo: [],
        posts: [],
        siguiendo: false,
        loading: true
    });


    const apiBase = `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")}/api`;

    const loadData = useCallback(async () => {
        try {
            // 1. Usamos los endpoints que sí funcionan en PaginaLector
            const [resLector, resReviews, resLeyendo, resPosts] = await Promise.all([
                fetch(`${apiBase}/lector/${theId}`).then(r => r.ok ? r.json() : null),
                fetch(`${apiBase}/reviews`).then(r => r.ok ? r.json() : []),
                fetch(`${apiBase}/lector/${theId}/leyendo`).then(r => r.ok ? r.json() : []),
                fetch(`${apiBase}/postlector/lector/${theId}`).then(r => r.ok ? r.json() : [])
            ]);

            if (!resLector) {
                console.error("No se encontró el lector");
                setDb(prev => ({ ...prev, loading: false }));
                return;
            }

            // 2. Filtramos las reviews manualmente (igual que en PaginaLector)
            // Buscamos las que pertenezcan al ID del perfil que visitamos
            const reviewsDelPerfil = resReviews.filter(rev =>
                Number(rev.lector_id) === Number(theId)
            );

            // 3. Verificamos si el usuario logueado sigue a este perfil
            let loSigo = false;
            if (store.auth_lector && store.lector_id) {
                // Obtenemos la data del que está navegando para ver su lista de 'siguiendo'
                const usuarioLogueado = await fetch(`${apiBase}/lector/${store.lector_id}`).then(r => r.json());
                loSigo = usuarioLogueado.siguiendo?.some(s => Number(s.seguido_id) === Number(theId)) || false;
            }

            setDb({
                lector: resLector,
                reviews: reviewsDelPerfil,
                leyendo: resLeyendo || [],
                posts: resPosts || [],
                siguiendo: loSigo,
                loading: false
            });

        } catch (error) {
            console.error("Error cargando perfil:", error);
            setDb(prev => ({ ...prev, loading: false }));
        }
    }, [theId, store.lector_id, store.auth_lector, apiBase]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleFollow = async () => {
        if (!store.auth_lector) return navigate("/login_lector");

        // Obtenemos data fresca del usuario logueado para tener el relacion_id correcto
        const usuarioLogueado = await fetch(`${apiBase}/lector/${store.lector_id}`).then(r => r.json());
        const relacionExistente = usuarioLogueado.siguiendo.find(s => s.seguido_id === parseInt(theId));

        if (relacionExistente) {
            // DELETE usando tu endpoint unfollow/<id>
            const res = await fetch(`${apiBase}/unfollow/${relacionExistente.relacion_id}`, { method: "DELETE" });
            if (res.ok) setDb(prev => ({ ...prev, siguiendo: false }));
        } else {
            // POST usando tu endpoint follow
            const res = await fetch(`${apiBase}/follow`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ seguidor_id: store.lector_id, seguido_id: parseInt(theId) })
            });
            if (res.ok) setDb(prev => ({ ...prev, siguiendo: true }));
        }
    };

    if (db.loading) return (
        <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
            <div className="spinner-border text-info-booked mb-3" style={{ width: '3rem', height: '3rem' }}></div>
            <h5 className="text-muted fw-bold">Consultando los estantes de {theId}...</h5>
        </div>
    );

    const { lector } = db;
    const nombreCompleto = `${lector?.nombre || "Lector"} ${lector?.apellido || ""}`;
    const fotoUrl = lector?.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&background=24b0d9&color=fff&size=200`;

    return (
        <div className="container-fluid min-vh-100 py-5" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
            <div className="container">
                <div className="card shadow-lg border-0 rounded-5 overflow-hidden mx-auto" style={{ maxWidth: "900px" }}>

                    <div className="bg-info-booked position-relative" style={{ height: "120px", width: "100%" }}>
                        <i className="fas fa-user-alt position-absolute text-white opacity-25" style={{ fontSize: "6rem", right: "30px", top: "10px" }}></i>
                    </div>

                    <div className="card-body p-4 p-md-5 pt-0">
                        <div className="row align-items-end mb-4" style={{ marginTop: "-45px" }}>
                            <div className="col-md-auto text-center text-md-start">
                                <img
                                    src={fotoUrl}
                                    alt={nombreCompleto}
                                    className="rounded-circle shadow bg-white p-1"
                                    style={{ width: "150px", height: "150px", objectFit: "cover", border: "5px solid white" }}
                                />
                            </div>
                            <div className="col text-center text-md-start mt-3">
                                <h2 className="fw-bold mb-0 text-dark">{nombreCompleto}</h2>
                                <p className="text-muted mb-0">@{lector?.username} • <i className="fas fa-map-marker-alt me-1"></i>{lector?.pais_donde_reside || "Comunidad Booked"}</p>
                            </div>
                            <div className="col-md-auto mt-4 mt-md-0 text-center">
                                <div className="d-flex gap-2 justify-content-center">
                                    <button
                                        onClick={handleFollow}
                                        className={`btn rounded-pill px-4 fw-bold shadow-sm transition-all ${db.siguiendo ? "btn-outline-secondary" : "btn-booked-blue"}`}
                                    >
                                        <i className={`fas fa-${db.siguiendo ? "user-check" : "user-plus"} me-2`}></i>
                                        {db.siguiendo ? "Siguiendo" : "Seguir"}
                                    </button>
                                    <button
                                        className="btn btn-light border rounded-circle shadow-sm text-info-booked hover-up"
                                        title="Enviar Mensaje Directo"
                                        style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}
                                        onClick={() => {
                                            if (db.lector) {
                                                navigate("/pagina_lector", {
                                                    state: {
                                                        abrirChatCon: {
                                                            id: db.lector.id,
                                                            nombre: `${db.lector.nombre} ${db.lector.apellido || ""}`
                                                        }
                                                    }
                                                });
                                            }
                                        }}
                                    >
                                        {/* Cambiamos el paper-plane por una burbuja de chat moderna */}
                                        <i className="fas fa-comment-dots" style={{ fontSize: '1.2rem' }}></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Estadísticas */}
                        <div className="row g-3 mb-4">
                            {[
                                { label: "Siguiendo", valor: lector?.total_siguiendo ?? 0, icon: "fa-user-friends" },
                                { label: "Seguidores", valor: lector?.total_seguidores ?? 0, icon: "fa-users" },
                                { label: "Publicaciones", valor: db.posts.length, icon: "fa-pen" },
                                { label: "Reseñas", valor: db.reviews.length, icon: "fa-star" }
                            ].map(s => (
                                <div key={s.label} className="col-6 col-md-3">
                                    <div className="text-center bg-light rounded-3 p-3 border">
                                        <i className={`fas ${s.icon} text-info-booked mb-1`}></i>
                                        <p className="fw-bold fs-5 mb-0">{s.valor}</p>
                                        <small className="text-muted">{s.label}</small>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Biografía */}
                        {lector?.biografia && (
                            <div className="mb-4 p-3 bg-light rounded-3 border">
                                <h6 className="fw-bold text-uppercase small text-info-booked mb-2" style={{ letterSpacing: '1px' }}>— Sobre este lector</h6>
                                <p className="text-dark mb-0" style={{ lineHeight: '1.6' }}>{lector.biografia}</p>
                            </div>
                        )}

                        {/* Géneros favoritos */}
                        {lector?.generos_favoritos && (
                            <div className="mb-4">
                                <h6 className="fw-bold text-uppercase small text-info-booked mb-2" style={{ letterSpacing: '1px' }}>— Géneros favoritos</h6>
                                <div className="d-flex flex-wrap gap-2">
                                    {lector.generos_favoritos.split(",").map((g, i) => (
                                        <span key={i} className="badge badge-booked rounded-pill px-3 py-2">{g.trim()}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="row g-4">
                            <div className="col-lg-4">
                                <h6 className="fw-bold text-uppercase small text-info-booked mb-3" style={{ letterSpacing: '1px' }}>— Lecturas</h6>
                                <div className="bg-light rounded-4 p-3 border shadow-sm h-100">
                                    {db.leyendo.length > 0 ? db.leyendo.map(item => (
                                        <Link to={`/ver_libro/${item.libro?.id || item.libro_id}`} key={item.id} className="text-decoration-none">
                                            <div className="d-flex align-items-center mb-3 p-2 bg-white rounded-3 shadow-sm hover-up">
                                                <img src={item.libro?.image_url || "https://via.placeholder.com/40x60"} width="40" className="rounded shadow-sm me-3" alt="cover" />
                                                <div className="overflow-hidden">
                                                    <p className="small fw-bold text-dark mb-0 text-truncate">{item.libro?.nombre || "Libro"}</p>
                                                    <div className="progress mt-1" style={{ height: '4px' }}>
                                                        <div className="progress-bar bg-info-booked" style={{ width: '45%' }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    )) : <div className="text-center py-4"><i className="fas fa-ghost text-muted mb-2"></i><p className="small text-muted mb-0">Sin libros activos</p></div>}
                                </div>
                            </div>

                            <div className="col-lg-8">
                                <h6 className="fw-bold text-uppercase small text-info-booked mb-3" style={{ letterSpacing: '1px' }}>— Reseñas del Lector</h6>
                                <div className="row g-3">
                                    {db.reviews.length > 0 ? db.reviews.slice(0, 4).map(rev => (
                                        <div key={rev.id} className="col-12">
                                            <div className="card border-0 bg-white shadow-sm rounded-4 p-3 border-start border-info-booked border-4">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="small fw-bold text-dark">{rev.libro?.nombre}</span>
                                                    <span className="badge rounded-pill bg-warning text-dark small">
                                                        <i className="fas fa-star me-1"></i>{rev.puntuacion}/10
                                                    </span>
                                                </div>
                                                <p className="small text-muted fst-italic mb-0">"{rev.texto}"</p>
                                            </div>
                                        </div>
                                    )) : <p className="text-muted text-center py-5">Este lector prefiere disfrutar los libros en silencio.</p>}
                                </div>
                                <div className="row mt-5">
                                    <div className="col-12">
                                        <h6 className="fw-bold text-uppercase small text-info-booked mb-4" style={{ letterSpacing: '1px' }}>
                                            — Pensamientos y Publicaciones
                                        </h6>

                                        {db.posts.length === 0 ? (
                                            <div className="text-center bg-light p-5 rounded-4 border" style={{ borderStyle: 'dashed !important' }}>
                                                <i className="fas fa-feather-alt fa-2x mb-3 text-muted opacity-50"></i>
                                                <p className="text-muted small mb-0">Este lector aún no ha compartido publicaciones en su muro.</p>
                                            </div>
                                        ) : (
                                            <div className="d-flex flex-column gap-4">
                                                {db.posts.map((post) => {
                                                    // Evaluamos dinámicamente quién está navegando la app desde el store
                                                    const tipoUsuarioLogueado = store.editorial_id ? "editorial"
                                                        : store.autor_id ? "autor"
                                                            : "lector";

                                                    return (
                                                        <div key={post.id} className="card shadow-sm border-0 rounded-4 bg-white overflow-hidden">
                                                            <div className="card-body p-4">

                                                                {/* Encabezado interno de la publicación */}
                                                                <div className="d-flex align-items-center mb-3 pb-2 border-bottom">
                                                                    <img
                                                                        src={fotoUrl}
                                                                        alt={nombreCompleto}
                                                                        className="rounded-circle shadow-sm me-3"
                                                                        style={{ width: "42px", height: "42px", objectFit: "cover" }}
                                                                    />
                                                                    <div>
                                                                        <h6 className="fw-bold mb-0 text-dark small">{nombreCompleto}</h6>
                                                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                                            <i className="far fa-clock me-1 text-info-booked"></i> {post.fecha || "Reciente"}
                                                                        </small>
                                                                    </div>
                                                                </div>

                                                                {/* Cuerpo de la publicación */}
                                                                <p className="card-text text-dark" style={{ whiteSpace: 'pre-wrap', fontSize: '1rem', lineHeight: '1.5' }}>
                                                                    {post.texto}
                                                                </p>

                                                                {/* 🎮 CAJA DE COMENTARIOS ADAPTADA A ESTA VISTA */}
                                                                <CajaComentarios
                                                                    postId={post.id}
                                                                    tipoPost="lector" // Fijo "lector" porque estamos en el muro público de un Lector
                                                                    tipoUsuarioActual={tipoUsuarioLogueado} // Dinámico según quién esté logueado
                                                                />

                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 pt-3 border-top d-flex justify-content-between align-items-center">
                            <button className="btn btn-sm btn-light rounded-pill px-4 border text-muted" onClick={() => navigate(-1)}>
                                <i className="fas fa-chevron-left me-2"></i> Volver
                            </button>
                            <span className="text-muted small">Miembro de Booked Ecosystem</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerLectorPublico;