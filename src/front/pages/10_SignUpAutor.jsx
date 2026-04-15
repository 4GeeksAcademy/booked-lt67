import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import logoBookedUrl from "../assets/img/logo_booked.png";

const SignUpAutor = () => {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Estados para la lógica de "Reclamar Perfil"
    const [perfilesEncontrados, setPerfilesEncontrados] = useState([]);
    const [autorIdSeleccionado, setAutorIdSeleccionado] = useState(null);

    const { store } = useGlobalReducer();
    const navigate = useNavigate();

    if (store.auth_autor === true) {
        return <Navigate to="/pagina_autor" />;
    }

    const buscarAutorExistente = async () => {
        if (nombre.trim() && apellido.trim()) {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")}/api/autor?nombre=${nombre}&apellido=${apellido}`);
            if (res.ok) {
                const data = await res.json();
                // Buscamos autores que no estén verificados y no tengan email registrado
                const huerfanos = data.filter(a => !a.is_verified && (!a.email || a.email.trim() === ""));
                setPerfilesEncontrados(huerfanos);
            }
        }
    };

    function handleContinuar(e) {
        e.preventDefault();
        
        // Enviamos los datos recolectados al Paso 2
        navigate("/completar_registro_autor", { 
            state: { 
                nombre, 
                apellido, 
                email, 
                password, 
                autorIdSeleccionado 
            } 
        });
    }

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center py-5" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
            <div className="container">
                <div className="card shadow-lg border-0 rounded-5 overflow-hidden mx-auto" style={{ maxWidth: "950px" }}>
                    <div className="row g-0">
                        
                        {/* PANEL IZQUIERDO: Estilo Autor */}
                        <div 
                            className="col-lg-4 d-flex flex-column align-items-center justify-content-center p-5 text-center text-white position-relative overflow-hidden"
                            style={{ backgroundColor: "#24b0d9" }} 
                        >
                            <i className="fas fa-feather-alt position-absolute opacity-10" style={{ fontSize: '7rem', top: '-15px', left: '-10px' }}></i>

                            <div className="position-relative z-index-1">
                                <img 
                                    src={logoBookedUrl} 
                                    alt="Booked Logo" 
                                    style={{ height: "70px", width: "auto", filter: "brightness(0) invert(1)" }} 
                                    className="mb-4 drop-shadow" 
                                />
                                <h3 className="fw-bold mb-3">Tu taller literario.</h3>
                                <p className="small opacity-75 mb-4">
                                    Publica tus obras, gestiona tu bibliografía y conecta directamente con miles de lectores de todo el mundo.
                                </p>
                                <hr className="w-25 mx-auto border-white opacity-50 mb-4" />
                                <p className="small mb-0">¿Ya tienes cuenta de autor?</p>
                                <Link to="/login_autor" className="btn btn-outline-light rounded-pill px-4 mt-2 fw-bold shadow-sm">
                                    Inicia Sesión
                                </Link>
                            </div>
                        </div>

                        {/* PANEL DERECHO: Formulario Paso 1 */}
                        <div className="col-lg-8 bg-white p-4 p-md-5 d-flex flex-column justify-content-center">
                            <div className="mb-4 pb-2 border-bottom d-flex justify-content-between align-items-end">
                                <div>
                                    <h2 className="fw-bold text-dark h3 mb-1">Registro de Autor</h2>
                                    <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>— Construye tu audiencia</span>
                                </div>
                                <span className="badge bg-light text-muted border rounded-pill px-3 py-2">Paso 1 de 2</span>
                            </div>
                            
                            <form onSubmit={handleContinuar}>
                                <div className="row g-3">
                                    
                                    {/* Nombre y Apellido con Búsqueda Automática */}
                                    <div className="col-md-6 mb-2">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Nombre</label>
                                        <div className="input-group shadow-sm rounded-pill overflow-hidden">
                                            <span className="input-group-text bg-light border-0 text-muted ps-3"><i className="fas fa-user"></i></span>
                                            <input value={nombre} onChange={(e) => setNombre(e.target.value)} onBlur={buscarAutorExistente} type="text" className="form-control bg-light border-0 py-2 ps-2" placeholder="Tu nombre real" required />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Apellido</label>
                                        <div className="input-group shadow-sm rounded-pill overflow-hidden">
                                            <input value={apellido} onChange={(e) => setApellido(e.target.value)} onBlur={buscarAutorExistente} type="text" className="form-control bg-light border-0 py-2 px-4" placeholder="Tu apellido" required />
                                        </div>
                                    </div>

                                    {/* --- Lógica de Reclamo de Perfil --- */}
                                    {perfilesEncontrados.length > 0 && !autorIdSeleccionado && (
                                        <div className="col-12 mb-2">
                                            <div className="alert alert-info border-0 rounded-4 shadow-sm">
                                                <p className="small mb-2"><strong><i className="fas fa-search me-2"></i>¿Ya tienes obras en Booked?</strong> Hemos encontrado perfiles similares a tu nombre:</p>
                                                {perfilesEncontrados.map(a => (
                                                    <div key={a.id} className="d-flex justify-content-between align-items-center bg-white p-2 rounded-pill mb-1 px-3 shadow-sm">
                                                        <span className="small fw-bold">{a.nombre} {a.apellido}</span>
                                                        <button type="button" className="btn btn-sm btn-booked-blue rounded-pill px-3 fw-bold" onClick={() => setAutorIdSeleccionado(a.id)}>
                                                            Es mi perfil
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {autorIdSeleccionado && (
                                        <div className="col-12 mb-2">
                                            <div className="alert alert-success border-0 rounded-pill d-flex justify-content-between align-items-center px-4 shadow-sm">
                                                <span className="small fw-bold"><i className="fas fa-check-circle me-2"></i>Perfil vinculado correctamente</span>
                                                <button type="button" className="btn btn-sm btn-link text-danger text-decoration-none p-0 fw-bold" onClick={() => {setAutorIdSeleccionado(null); setPerfilesEncontrados([]);}}>
                                                    Cancelar vinculación
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Email */}
                                    <div className="col-md-12 mb-2 mt-3">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Correo Profesional</label>
                                        <div className="input-group shadow-sm rounded-pill overflow-hidden">
                                            <span className="input-group-text bg-light border-0 text-muted ps-4"><i className="fas fa-envelope"></i></span>
                                            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="form-control bg-light border-0 py-2 ps-2" placeholder="autor@editorial.com" required />
                                        </div>
                                    </div>

                                    {/* Contraseña */}
                                    <div className="col-md-12 mb-4">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Contraseña</label>
                                        <div className="input-group shadow-sm rounded-pill overflow-hidden">
                                            <span className="input-group-text bg-light border-0 text-muted ps-4"><i className="fas fa-lock"></i></span>
                                            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="form-control bg-light border-0 py-2 ps-2" placeholder="••••••••" required minLength="6" />
                                        </div>
                                    </div>
                                </div>

                                <div className="d-grid mt-2">
                                    <button type="submit" className="btn btn-booked-blue btn-lg rounded-pill fw-bold shadow-sm d-flex justify-content-center align-items-center">
                                        CONTINUAR <i className="fas fa-arrow-right ms-2"></i>
                                    </button>
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