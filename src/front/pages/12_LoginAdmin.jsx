import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import logoBookedUrl from "../assets/img/logo_booked.png"; 

const LogInAdmin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cargando, setCargando] = useState(false);
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    if (store.auth_admin === true) {
        return <Navigate to="/admin_home" />;
    }

    function sendData(e) {
        e.preventDefault();
        setCargando(true);

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "email": email,
                "password": password
            })
        };

        const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
        const urlFinal = `${baseUrl}/api/login_admin`;

        fetch(urlFinal, requestOptions)
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error("Admin login failed");
                }
            })
            .then(data => {
                localStorage.setItem("token_admin", data.access_token);
                localStorage.setItem("horaLoginAdmin", new Date().getTime());
                dispatch({ type: "set_auth_admin", payload: true });
                
                navigate("/admin_home");
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Credenciales de administrador incorrectas. Acceso denegado.");
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
                            <i className="fas fa-server position-absolute opacity-10" style={{ fontSize: '7rem', top: '-15px', left: '-10px' }}></i>

                            <div className="position-relative z-index-1">
                                <img 
                                    src={logoBookedUrl} 
                                    alt="Booked Logo" 
                                    style={{ height: "70px", width: "auto", filter: "brightness(0) invert(1)" }} 
                                    className="mb-4 drop-shadow" 
                                />
                                <h3 className="fw-bold mb-3">Centro de Mando</h3>
                                <p className="small opacity-75 mb-4">
                                    Acceso restringido. Gestiona usuarios, obras, reportes y supervisa la infraestructura de Booked.
                                </p>
                                <hr className="w-25 mx-auto border-white opacity-50 mb-4" />
                                <div className="d-flex align-items-center justify-content-center gap-2 text-warning small fw-bold">
                                    <i className="fas fa-shield-alt"></i> Conexión Segura
                                </div>
                            </div>
                        </div>

                        {/* PANEL DERECHO: Formulario Login */}
                        <div className="col-lg-7 bg-white p-4 p-md-5 d-flex flex-column justify-content-center">
                            <div className="mb-5 pb-2 border-bottom d-flex justify-content-between align-items-end">
                                <div>
                                    <h2 className="fw-bold text-dark h3 mb-1">Sistema Interno</h2>
                                    <span className="text-secondary fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>— Administrador</span>
                                </div>
                                <div className="bg-light rounded-circle p-3 text-dark shadow-sm">
                                    <i className="fas fa-user-shield fa-lg"></i>
                                </div>
                            </div>
                            
                            <form onSubmit={sendData}>
                                <div className="row g-4">
                                    
                                    {/* Input Email */}
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Correo de Administrador</label>
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
                                            <><span className="spinner-border spinner-border-sm text-white me-2" aria-hidden="true"></span> AUTENTICANDO...</>
                                        ) : (
                                            <>INICIAR SESIÓN SEGURA <i className="fas fa-sign-in-alt ms-2"></i></>
                                        )}
                                    </button>
                                </div>

                                {/* Link de Registro para Admin */}
                                <div className="text-center mt-4">
                                    <span className="text-muted small">¿Necesitas acceso administrativo? </span>
                                    <Link to="/signup_admin" className="text-dark fw-bold text-decoration-none small">
                                        Solicitar registro
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LogInAdmin;