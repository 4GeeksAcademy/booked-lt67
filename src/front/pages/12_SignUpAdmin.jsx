import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import logoBookedUrl from "../assets/img/logo_booked.png"; 

const SignUpAdmin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    if (store.auth_admin === true) {
        return <Navigate to="/admin_home" />;
    }

    function sendData(e) {
        e.preventDefault();
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + 'api/signup_admin', requestOptions)
            .then(response => {
                if (response.ok) return response.json();
                throw new Error("Error en el registro");
            })
            .then(data => {
                localStorage.setItem("token_admin", data.access_token);
                dispatch({ type: "set_auth_admin", payload: true });
                navigate("/admin_home");
            })
            .catch(err => alert("Error en el registro administrativo."));
    }

    return (
        <div className="container-fluid min-vh-100 bg-light py-5 d-flex align-items-center">
            <div className="container">
                <div className="card shadow-lg border-0 rounded-4 overflow-hidden mx-auto" style={{ maxWidth: "850px" }}>
                    <div className="row g-0">
                        {/* PANEL IZQUIERDO (Ahora centrado perfectamente al no tener la imagen arriba) */}
                        <div 
                            className="col-lg-4 d-flex flex-column align-items-center justify-content-center p-5 text-center text-white"
                            style={{ backgroundColor: "#212529" }} 
                        >
                            <h3 className="fw-bold mb-2">Panel Interno</h3>
                            <p className="small opacity-75 mb-0">Gestión administrativa de la plataforma Booked.</p>
                        </div>

                        {/* PANEL DERECHO */}
                        <div className="col-lg-8 bg-white p-4 p-md-5">
                            
                            {/* Título y Logo distribuidos a los extremos */}
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-user-shield text-dark me-3 fs-3"></i>
                                    <h2 className="fw-bold text-dark mb-0 h4">Registro Administrativo</h2>
                                </div>
                                
                                {/* Logo en el extremo derecho */}
                                <div style={{ width: "100px" }}>
                                    <img 
                                        src={logoBookedUrl} 
                                        alt="Booked" 
                                        style={{ 
                                            width: "100%", 
                                            height: "auto", 
                                            display: "block"
                                        }} 
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            const parent = e.target.parentElement;
                                            if(!parent.querySelector('.fallback-text')){
                                                parent.innerHTML += '<span class="fw-bold fallback-text fs-5 text-dark">Booked</span>';
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            
                            <form onSubmit={sendData}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-secondary text-uppercase">Email Institucional</label>
                                    <input 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        type="email" 
                                        className="form-control bg-light border-0 rounded-pill py-3 px-4" 
                                        placeholder="admin@booked.com" 
                                        required 
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-secondary text-uppercase">Password</label>
                                    <input 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        type="password" 
                                        className="form-control bg-light border-0 rounded-pill py-3 px-4" 
                                        placeholder="••••••••" 
                                        required 
                                    />
                                </div>

                                <button type="submit" className="btn btn-dark w-100 rounded-pill py-3 fw-bold shadow-sm mb-3">
                                    REGISTRAR ADMINISTRADOR
                                </button>

                                <div className="text-center mt-3">
                                    <span className="text-muted small">¿Ya tienes cuenta? </span>
                                    <Link to="/login_admin" className="text-dark fw-bold text-decoration-none small">
                                        Inicia Sesión
                                    </Link>
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