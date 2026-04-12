import { Link, Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import React, { useState } from "react";
import logoBookedUrl from "../assets/img/logo_booked.png"; // Importamos el logo

const LogInAdmin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { store, dispatch } = useGlobalReducer();

    if (store.auth_admin === true) {
        return <Navigate to="/admin_home" />;
    }

    function sendData(e) {
        e.preventDefault();

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "email": email,
                "password": password
            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + 'api/login_admin', requestOptions)
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    alert("Credenciales de administrador incorrectas");
                    throw new Error("Admin login failed");
                }
            })
            .then(data => {
                localStorage.setItem("token_admin", data.access_token);
                localStorage.setItem("horaLoginAdmin", new Date().getTime());
                dispatch({ type: "set_auth_admin", payload: true });
            })
            .catch(error => console.error("Error:", error));
    }

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: "450px", width: "100%" }}>
                <div className="card-body p-5">
                    {/* Sección del Logo y Encabezado de Admin */}
                    <div className="text-center mb-4">
                        <img 
                            src={logoBookedUrl} 
                            alt="Booked Logo" 
                            style={{ height: "80px", width: "auto" }} 
                            className="mb-3"
                        />
                        <h2 className="fw-bold text-dark">Panel de Control</h2>
                        <p className="text-muted">Acceso exclusivo para administradores</p>
                    </div>

                    <form onSubmit={sendData}>
                        {/* Input Email */}
                        <div className="mb-4">
                            <label className="form-label fw-bold text-secondary small text-uppercase">Correo Administrativo</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 rounded-start-pill text-muted">
                                    <i className="fas fa-user-shield"></i>
                                </span>
                                <input 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    type="email" 
                                    className="form-control border-start-0 rounded-end-pill py-2 shadow-none" 
                                    placeholder="admin@booked.com"
                                    required 
                                />
                            </div>
                        </div>

                        {/* Input Password */}
                        <div className="mb-4">
                            <label className="form-label fw-bold text-secondary small text-uppercase">Contraseña</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 rounded-start-pill text-muted">
                                    <i className="fas fa-key"></i>
                                </span>
                                <input 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    type="password" 
                                    className="form-control border-start-0 rounded-end-pill py-2 shadow-none" 
                                    placeholder="••••••••"
                                    required 
                                />
                            </div>
                        </div>

                        {/* Botón de Ingreso */}
                        <button 
                            type="submit" 
                            className="btn btn-dark w-100 rounded-pill py-2 fw-bold shadow-sm mb-3 mt-2"
                            style={{ letterSpacing: "0.5px" }}
                        >
                            ACCEDER AL SISTEMA
                        </button>

                        {/* Link de Registro (si aplica para admin) */}
                        <div className="text-center mt-4">
                            <span className="text-muted small">¿Necesitas una cuenta? </span>
                            <Link to="/signup_admin" className="text-dark fw-bold text-decoration-none small">
                                Solicitar registro
                            </Link>
                        </div>
                    </form>
                </div>
                
                {/* Decoración inferior (color oscuro para distinguir que es Admin) */}
                <div className="bg-dark py-2 w-100 opacity-75"></div>
            </div>
        </div>
    );
}

export default LogInAdmin;