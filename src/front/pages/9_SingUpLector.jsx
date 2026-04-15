import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import logoBookedUrl from "../assets/img/logo_booked.png";

const SignUpLector = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const { store } = useGlobalReducer();

    // Si ya está logueado, lo mandamos a su panel
    if (store.auth_lector === true) {
        return <Navigate to="/pagina_lector" />;
    }

    function handleContinuar(e) {
        e.preventDefault();
        // Pasamos los datos al siguiente componente sin tocar la base de datos aún
        navigate("/completar_registro_lector", { 
            state: { email, username, password } 
        });
    }

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center py-5" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
            <div className="container">
                <div className="card shadow-lg border-0 rounded-5 overflow-hidden mx-auto" style={{ maxWidth: "950px" }}>
                    <div className="row g-0">
                        
                        {/* PANEL IZQUIERDO */}
                        <div 
                            className="col-lg-4 d-flex flex-column align-items-center justify-content-center p-5 text-center text-white position-relative overflow-hidden"
                            style={{ backgroundColor: "#24b0d9" }} 
                        >
                            <i className="fas fa-book-reader position-absolute opacity-10" style={{ fontSize: '7rem', top: '-15px', left: '-10px' }}></i>

                            <div className="position-relative z-index-1">
                                <img 
                                    src={logoBookedUrl} 
                                    alt="Booked Logo" 
                                    style={{ height: "70px", width: "auto", filter: "brightness(0) invert(1)" }} 
                                    className="mb-4 drop-shadow" 
                                />
                                <h3 className="fw-bold mb-3">Tu ecosistema digital.</h3>
                                <p className="small opacity-75 mb-4">
                                    Únete a miles de lectores para descubrir, reseñar y organizar tu vida literaria en un solo lugar.
                                </p>
                                <hr className="w-25 mx-auto border-white opacity-50 mb-4" />
                                <p className="small mb-0">¿Ya tienes cuenta?</p>
                                <Link to="/login_lector" className="btn btn-outline-light rounded-pill px-4 mt-2 fw-bold shadow-sm">
                                    Inicia Sesión
                                </Link>
                            </div>
                        </div>

                        {/* PANEL DERECHO: Formulario Paso 1 */}
                        <div className="col-lg-8 bg-white p-4 p-md-5 d-flex flex-column justify-content-center">
                            <div className="mb-4 pb-2 border-bottom d-flex justify-content-between align-items-end">
                                <div>
                                    <h2 className="fw-bold text-dark h3 mb-1">Registro de Lector</h2>
                                    <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>— Crea tu cuenta gratuita</span>
                                </div>
                                <span className="badge bg-light text-muted border rounded-pill px-3 py-2">Paso 1 de 2</span>
                            </div>
                            
                            <form onSubmit={handleContinuar}>
                                <div className="row g-3">
                                    {/* Nombre de Usuario */}
                                    <div className="col-md-12 mb-2">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Nombre de Usuario</label>
                                        <div className="input-group shadow-sm rounded-pill overflow-hidden">
                                            <span className="input-group-text bg-light border-0 text-info-booked ps-4"><i className="fas fa-at"></i></span>
                                            <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" className="form-control bg-light border-0 py-2 ps-2" placeholder="ej. lector_fan_99" required />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="col-md-12 mb-2">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Correo Electrónico</label>
                                        <div className="input-group shadow-sm rounded-pill overflow-hidden">
                                            <span className="input-group-text bg-light border-0 text-muted ps-4"><i className="fas fa-envelope"></i></span>
                                            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="form-control bg-light border-0 py-2 ps-2" placeholder="correo@ejemplo.com" required />
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

                                <div className="d-grid mt-3">
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

export default SignUpLector;