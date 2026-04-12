import useGlobalReducer from "../hooks/useGlobalReducer";
import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import logoBookedUrl from "../assets/img/logo_booked.png";

const SignUpAutor = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [pais, setPais] = useState('');
    const [perfilesEncontrados, setPerfilesEncontrados] = useState([]);
    const [autorIdSeleccionado, setAutorIdSeleccionado] = useState(null);

    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    if (store.auth_autor === true) {
        return <Navigate to="/pagina_autor" />;
    }

    const buscarAutorExistente = async () => {
        if (nombre.trim() && apellido.trim()) {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/autor?nombre=${nombre}&apellido=${apellido}`);
            if (res.ok) {
                const data = await res.json();
                const huérfanos = data.filter(a => !a.is_verified && (a.email === null || a.email === ""));
                setPerfilesEncontrados(huérfanos);
            }
        }
    };

    function sendData(e) {
        e.preventDefault();
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "email": email,
                "password": password,
                "nombre": nombre,
                "apellido": apellido,
                "pais": pais,
                "reclamar_id": autorIdSeleccionado
            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + 'api/signup_autor', requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Error en el registro");
                return response.json();
            })
            .then(data => {
                localStorage.setItem("autor_id", data.autor_id);
                localStorage.setItem("token_autor", data.access_token);
                localStorage.setItem("nombre_autor", data.nombre);
                localStorage.setItem("horaLoginAutor", new Date().getTime());

                dispatch({ 
                    type: "set_auth_autor", 
                    payload: { auth: true, id: data.autor_id, nombre: data.nombre } 
                }); 
                navigate("/pagina_autor");
            })
            .catch(err => {
                console.error("Error:", err);
                alert("Hubo un error al procesar el registro");
            });
    }

    return (
        <div className="container-fluid min-vh-100 bg-light py-5 d-flex align-items-center">
            <div className="container">
                <div className="card shadow-lg border-0 rounded-4 overflow-hidden mx-auto" style={{ maxWidth: "850px" }}>
                    <div className="row g-0">
                        {/* Panel Izquierdo: Estilo Autor */}
                        <div 
                            className="col-lg-4 d-flex flex-column align-items-center justify-content-center p-5 text-center"
                            style={{ backgroundColor: "#eaf2ff" }}
                        >
                            <img src={logoBookedUrl} alt="Logo" style={{ height: "90px" }} className="mb-4" />
                            <h3 className="fw-bold text-primary">Espacio para Autores</h3>
                            <p className="small text-muted">Publica tus obras, gestiona tu bibliografía y llega a miles de lectores.</p>
                        </div>

                        {/* Panel Derecho: Formulario */}
                        <div className="col-lg-8 bg-white p-4 p-md-5">
                            <h2 className="fw-bold text-dark mb-4 h3">Registro de Autor</h2>
                            
                            <form onSubmit={sendData}>
                                <div className="row">
                                    {/* Nombre y Apellido */}
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small fw-bold text-secondary text-uppercase">Nombre</label>
                                        <input value={nombre} onChange={(e) => setNombre(e.target.value)} type="text" className="form-control bg-light border-0 rounded-pill py-2 px-3" placeholder="Tu nombre" required />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small fw-bold text-secondary text-uppercase">Apellido</label>
                                        <input 
                                            value={apellido} 
                                            onChange={(e) => setApellido(e.target.value)} 
                                            onBlur={buscarAutorExistente}
                                            type="text" className="form-control bg-light border-0 rounded-pill py-2 px-3" placeholder="Tu apellido" required 
                                        />
                                    </div>

                                    {/* --- Lógica de Reclamo de Perfil (Estilizada) --- */}
                                    {perfilesEncontrados.length > 0 && !autorIdSeleccionado && (
                                        <div className="col-12 mb-3">
                                            <div className="alert alert-info border-0 rounded-4 shadow-sm animate__animated animate__fadeIn">
                                                <p className="small mb-2"><strong>¿Ya tienes obras en Booked?</strong> Hemos encontrado estos perfiles similares:</p>
                                                {perfilesEncontrados.map(a => (
                                                    <div key={a.id} className="d-flex justify-content-between align-items-center bg-white p-2 rounded-pill mb-1 px-3 border">
                                                        <span className="small fw-bold">{a.nombre} {a.apellido}</span>
                                                        <button type="button" className="btn btn-sm btn-primary rounded-pill px-3" onClick={() => setAutorIdSeleccionado(a.id)}>
                                                            Es mi perfil
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {autorIdSeleccionado && (
                                        <div className="col-12 mb-3">
                                            <div className="alert alert-success border-0 rounded-4 d-flex justify-content-between align-items-center px-4 shadow-sm">
                                                <span className="small"><i className="fas fa-check-circle me-2"></i>Perfil vinculado correctamente</span>
                                                <button type="button" className="btn btn-sm btn-link text-danger text-decoration-none fw-bold" onClick={() => {setAutorIdSeleccionado(null); setPerfilesEncontrados([]);}}>
                                                    Cambiar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {/* ------------------------------------------- */}

                                    <div className="col-md-12 mb-3">
                                        <label className="form-label small fw-bold text-secondary text-uppercase">País</label>
                                        <input value={pais} onChange={(e) => setPais(e.target.value)} type="text" className="form-control bg-light border-0 rounded-pill py-2 px-3" placeholder="España, México, etc." required />
                                    </div>

                                    <div className="col-md-12 mb-3">
                                        <label className="form-label small fw-bold text-secondary text-uppercase">Email Profesional</label>
                                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="form-control bg-light border-0 rounded-pill py-2 px-3" placeholder="autor@ejemplo.com" required />
                                    </div>

                                    <div className="col-md-12 mb-4">
                                        <label className="form-label small fw-bold text-secondary text-uppercase">Contraseña</label>
                                        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="form-control bg-light border-0 rounded-pill py-2 px-3" placeholder="••••••••" required />
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary w-100 rounded-pill py-2 fw-bold shadow-sm mb-3 mt-2">
                                    REGISTRARME COMO AUTOR
                                </button>

                                <div className="text-center">
                                    <span className="text-muted small">¿Ya tienes cuenta de autor? </span>
                                    <Link to="/login_autor" className="text-primary fw-bold text-decoration-none small">Inicia Sesión</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpAutor;