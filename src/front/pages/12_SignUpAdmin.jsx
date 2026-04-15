import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import logoBookedUrl from "../assets/img/logo_booked.png"; 

const SignUpAdmin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    if (store.auth_admin === true) {
        return <Navigate to="/admin_home" />;
    }

    function sendData(e) {
        e.preventDefault();
        setCargando(true);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        };

        const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

        fetch(`${baseUrl}/api/signup_admin`, requestOptions)
            .then(response => {
                if (response.ok) return response.json();
                throw new Error("Error en el registro");
            })
            .then(data => {
                localStorage.setItem("token_admin", data.access_token);
                dispatch({ type: "set_auth_admin", payload: true });
                alert("¡Registro administrativo completado con éxito!");
                navigate("/admin_home");
            })
            .catch(err => {
                alert("Error en el registro administrativo.");
                setCargando(false);
            });
    }

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center py-5" style={{ backgroundColor: '#f4f5f5' }}>
            <div className="container">
                <div className="card shadow-lg border-0 rounded-5 overflow-hidden mx-auto" style={{ maxWidth: "950px" }}>
                    <div className="row g-0">
                        
                        {/* PANEL IZQUIERDO: Bienvenida Admin (Oscuro) */}
                        <div 
                            className="col-lg-5 d-flex flex-column align-items-center justify-content-center p-5 text-center text-white position-relative overflow-hidden"
                            style={{ backgroundColor: "#212529" }} // Oscuro/Negro
                        >
                            <i className="fas fa-network-wired position-absolute opacity-10" style={{ fontSize: '7rem', top: '-15px', left: '-10px' }}></i>

                            <div className="position-relative z-index-1">
                                <img 
                                    src={logoBookedUrl} 
                                    alt="Booked Logo" 
                                    style={{ height: "70px", width: "auto", filter: "brightness(0) invert(1)" }} 
                                    className="mb-4 drop-shadow" 
                                />
                                <h3 className="fw-bold mb-3">Infraestructura Booked</h3>
                                <p className="small opacity-75 mb-4">
                                    Estás solicitando acceso al sistema de gestión global. Este perfil permite administrar autores, editoriales, reportes y la base de datos de la comunidad.
                                </p>
                                <hr className="w-25 mx-auto border-white opacity-50 mb-4" />
                                <p className="small mb-0">¿Ya posees credenciales?</p>
                                <Link to="/login_admin" className="btn btn-outline-light rounded-pill px-4 mt-2 fw-bold shadow-sm">
                                    Iniciar Sesión
                                </Link>
                            </div>
                        </div>

                        {/* PANEL DERECHO: Formulario Registro Admin */}
                        <div className="col-lg-7 bg-white p-4 p-md-5 d-flex flex-column justify-content-center">
                            <div className="mb-5 pb-2 border-bottom d-flex justify-content-between align-items-end">
                                <div>
                                    <h2 className="fw-bold text-dark h3 mb-1">Registro de Sistema</h2>
                                    <span className="text-secondary fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>— Alta de Administrador</span>
                                </div>
                                <div className="bg-light rounded-circle p-3 text-dark shadow-sm">
                                    <i className="fas fa-id-badge fa-lg"></i>
                                </div>
                            </div>
                            
                            <form onSubmit={sendData}>
                                <div className="row g-4">
                                    
                                    {/* Input Email */}
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Correo Electrónico Autorizado</label>
                                        <div className="input-group shadow-sm rounded-pill overflow-hidden border border-light">
                                            <span className="input-group-text bg-light border-0 text-dark ps-4"><i className="fas fa-envelope"></i></span>
                                            <input 
                                                value={email} 
                                                onChange={(e) => setEmail(e.target.value)} 
                                                type="email" 
                                                className="form-control bg-light border-0 py-3 ps-2 text-dark" 
                                                placeholder="admin@booked.com" 
                                                required 
                                            />
                                        </div>
                                    </div>

                                    {/* Input Password */}
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Contraseña de Seguridad</label>
                                        <div className="input-group shadow-sm rounded-pill overflow-hidden border border-light">
                                            <span className="input-group-text bg-light border-0 text-dark ps-4"><i className="fas fa-lock"></i></span>
                                            <input 
                                                value={password} 
                                                onChange={(e) => setPassword(e.target.value)} 
                                                type="password" 
                                                className="form-control bg-light border-0 py-3 ps-2 text-dark" 
                                                placeholder="••••••••" 
                                                minLength="6"
                                                required 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="d-grid mt-5">
                                    <button 
                                        type="submit" 
                                        className="btn btn-dark btn-lg rounded-pill fw-bold shadow-sm d-flex justify-content-center align-items-center py-3"
                                        disabled={cargando}
                                    >
                                        {cargando ? (
                                            <><span className="spinner-border spinner-border-sm text-white me-2" aria-hidden="true"></span> GENERANDO ACCESO...</>
                                        ) : (
                                            <>CREAR CREDENCIALES <i className="fas fa-shield-alt ms-2"></i></>
                                        )}
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

export default SignUpAdmin;