import { Link, Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import React, { useState } from "react";
import logoBookedUrl from "../assets/img/logo_booked.png"; // Importamos el logo

const LogInLector = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { store, dispatch } = useGlobalReducer();

    if (store.auth_lector === true) {
        return <Navigate to="/pagina_lector" />;
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

        fetch(import.meta.env.VITE_BACKEND_URL + 'api/login_lector', requestOptions)
            .then(response => {
                if (!response.ok) {
                    alert("Email o contraseña incorrectos");
                    throw new Error("Login failed");
                }
                return response.json();
            })
            .then(data => {
                localStorage.setItem("token_lector", data.access_token);
                localStorage.setItem("lector_id", data.lector_id);
                localStorage.setItem("horaLoginLector", new Date().getTime());

                dispatch({
                    type: "set_auth_lector",
                    payload: {
                        auth: true,
                        id: data.lector_id,
                        nombre: data.nombre
                    }
                });
            })
            .catch(error => console.error("Error:", error));
    }

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: "450px", width: "100%" }}>
                <div className="card-body p-5">
                    {/* Sección del Logo y Encabezado */}
                    <div className="text-center mb-4">
                        <img 
                            src={logoBookedUrl} 
                            alt="Booked Logo" 
                            style={{ height: "80px", width: "auto" }} 
                            className="mb-3"
                        />
                        <h2 className="fw-bold text-dark">¡Hola Lector!</h2>
                        <p className="text-muted">Ingresa a tu cuenta para continuar</p>
                    </div>

                    <form onSubmit={sendData}>
                        {/* Input Email */}
                        <div className="mb-4">
                            <label className="form-label fw-bold text-secondary small text-uppercase">Correo Electrónico</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 rounded-start-pill text-muted">
                                    <i className="fas fa-envelope"></i>
                                </span>
                                <input 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    type="email" 
                                    className="form-control border-start-0 rounded-end-pill py-2 shadow-none" 
                                    placeholder="ejemplo@correo.com"
                                    required 
                                />
                            </div>
                        </div>

                        {/* Input Password */}
                        <div className="mb-4">
                            <label className="form-label fw-bold text-secondary small text-uppercase">Contraseña</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 rounded-start-pill text-muted">
                                    <i className="fas fa-lock"></i>
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
                            className="btn btn-primary w-100 rounded-pill py-2 fw-bold shadow-sm mb-3 mt-2"
                            style={{ letterSpacing: "0.5px" }}
                        >
                            INGRESAR
                        </button>

                        {/* Link de Registro */}
                        <div className="text-center mt-4">
                            <span className="text-muted small">¿No tienes cuenta? </span>
                            <Link to="/signup_lector" className="text-primary fw-bold text-decoration-none small">
                                Regístrate aquí
                            </Link>
                        </div>
                    </form>
                </div>
                
                {/* Decoración inferior */}
                <div className="bg-primary py-2 w-100 opacity-75"></div>
            </div>
        </div>
    );
}

export default LogInLector;