import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import logoBookedUrl from "../assets/img/logo_booked.png"; 

const LogInAutor = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    // Redirección si ya está autenticado como autor
    if (store.auth_autor === true) {
        return <Navigate to="/pagina_autor" />;
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

        // CORRECCIÓN: Limpiamos la URL base para evitar errores de barras invertidas y redirecciones fantasmas
        const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
        const urlFinal = `${baseUrl}/api/login_autor`;

        fetch(urlFinal, requestOptions)
            .then(response => {
                if (!response.ok) {
                    // Si tira 401 o cualquier error, lanzamos la excepción para ir al catch
                    throw new Error("Error en el login");
                }
                return response.json();
            })
            .then(data => {
                // Guardar en LocalStorage
                localStorage.setItem("autor_id", data.autor_id);
                localStorage.setItem("token_autor", data.access_token);
                localStorage.setItem("nombre_autor", data.nombre);
                localStorage.setItem("horaLoginAutor", new Date().getTime());

                // Actualizar estado global
                dispatch({
                    type: "set_auth_autor",
                    payload: {
                        auth: true,
                        id: data.autor_id,
                        nombre: data.nombre
                    }
                });
                
                navigate("/pagina_autor");
            })
            .catch(error => {
                console.error("Error detallado:", error);
                alert("Email o contraseña incorrectos. Por favor, verifica tus datos.");
            });
    }

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: "450px", width: "100%" }}>
                <div className="card-body p-5">
                    
                    {/* Sección del Logo y Encabezado Personalizado para Autor */}
                    <div className="text-center mb-4">
                        <img 
                            src={logoBookedUrl} 
                            alt="Booked Logo" 
                            style={{ height: "80px", width: "auto" }} 
                            className="mb-3"
                        />
                        <h2 className="fw-bold text-dark">Panel de Autor</h2>
                        <p className="text-muted">Gestiona tus obras y conecta con tus lectores</p>
                    </div>

                    <form onSubmit={sendData}>
                        {/* Input Email */}
                        <div className="mb-4">
                            <label className="form-label fw-bold text-secondary small text-uppercase">Correo Profesional</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 rounded-start-pill text-muted">
                                    <i className="fas fa-envelope"></i>
                                </span>
                                <input 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    type="email" 
                                    className="form-control border-start-0 rounded-end-pill py-2 shadow-none" 
                                    placeholder="autor@ejemplo.com"
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
                            INGRESAR AL PANEL
                        </button>

                        {/* Link de Registro */}
                        <div className="text-center mt-4">
                            <span className="text-muted small">¿Eres un autor nuevo? </span>
                            <Link to="/signup_autor" className="text-primary fw-bold text-decoration-none small">
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

export default LogInAutor;