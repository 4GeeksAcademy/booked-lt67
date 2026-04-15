import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import logoBookedUrl from "../assets/img/logo_booked.png";

const SignUpEditorial = () => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Estados para reclamar perfil
    const [sugerencia, setSugerencia] = useState(null);
    const [reclamarId, setReclamarId] = useState(null);

    const { store } = useGlobalReducer();
    const navigate = useNavigate();

    if (store.auth_editorial === true) {
        return <Navigate to="/pagina_editorial" />;
    }

    const buscarEditorialExistente = async (valor) => {
        if (valor.length < 3) {
            setSugerencia(null);
            return;
        }
        try {
            const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")}/api/buscar_editorial?nombre=${valor}`);
            if (resp.ok) {
                const data = await resp.json(); 
                const huerfanas = data.filter(e => !e.is_verified && (!e.email || e.email.trim() === ""));
                if (huerfanas.length > 0) {
                    setSugerencia(huerfanas[0]);
                } else {
                    setSugerencia(null);
                }
            }
        } catch (err) { 
            console.error("Error buscando editorial:", err); 
        }
    };

    function handleContinuar(e) {
        e.preventDefault();
        
        navigate("/completar_registro_editorial", { 
            state: { 
                nombre, 
                email, 
                password, 
                reclamarId 
            } 
        });
    }

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center py-5" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
            <div className="container">
                <div className="card shadow-lg border-0 rounded-5 overflow-hidden mx-auto" style={{ maxWidth: "950px" }}>
                    <div className="row g-0">
                        
                        {/* PANEL IZQUIERDO: Estilo Editorial */}
                        <div 
                            className="col-lg-4 d-flex flex-column align-items-center justify-content-center p-5 text-center text-white position-relative overflow-hidden"
                            style={{ backgroundColor: "#24b0d9" }} 
                        >
                            <i className="fas fa-university position-absolute opacity-10" style={{ fontSize: '7rem', top: '-15px', left: '-10px' }}></i>

                            <div className="position-relative z-index-1">
                                <img 
                                    src={logoBookedUrl} 
                                    alt="Booked Logo" 
                                    style={{ height: "70px", width: "auto", filter: "brightness(0) invert(1)" }} 
                                    className="mb-4 drop-shadow" 
                                />
                                <h3 className="fw-bold mb-3">Portal Editorial.</h3>
                                <p className="small opacity-75 mb-4">
                                    Conecta tu catálogo con miles de lectores, analiza el impacto global de tus publicaciones y crea comunidad.
                                </p>
                                <hr className="w-25 mx-auto border-white opacity-50 mb-4" />
                                <p className="small mb-0">¿Ya gestionas una cuenta?</p>
                                <Link to="/login_editorial" className="btn btn-outline-light rounded-pill px-4 mt-2 fw-bold shadow-sm">
                                    Inicia Sesión
                                </Link>
                            </div>
                        </div>

                        {/* PANEL DERECHO: Formulario Paso 1 */}
                        <div className="col-lg-8 bg-white p-4 p-md-5 d-flex flex-column justify-content-center">
                            <div className="mb-4 pb-2 border-bottom d-flex justify-content-between align-items-end">
                                <div>
                                    <h2 className="fw-bold text-dark h3 mb-1">Registro de Editorial</h2>
                                    <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>— Expande tu alcance</span>
                                </div>
                                <span className="badge bg-light text-muted border rounded-pill px-3 py-2">Paso 1 de 2</span>
                            </div>
                            
                            <form onSubmit={handleContinuar}>
                                <div className="row g-3">
                                    
                                    {/* Nombre de la Editorial con Búsqueda Automática */}
                                    <div className="col-md-12 mb-2">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Nombre Comercial de la Editorial</label>
                                        <div className="input-group shadow-sm rounded-pill overflow-hidden">
                                            <span className="input-group-text bg-light border-0 text-muted ps-4"><i className="fas fa-building"></i></span>
                                            <input 
                                                value={nombre} 
                                                onChange={(e) => {
                                                    setNombre(e.target.value);
                                                    buscarEditorialExistente(e.target.value);
                                                }} 
                                                type="text" className="form-control bg-light border-0 py-2 ps-2" 
                                                placeholder="Ej. Ediciones Booked" required 
                                            />
                                        </div>
                                    </div>

                                    {/* --- Lógica de Reclamo de Perfil --- */}
                                    {sugerencia && !reclamarId && (
                                        <div className="col-12 mb-2">
                                            <div className="alert alert-info border-0 rounded-4 shadow-sm animate__animated animate__fadeIn">
                                                <p className="small mb-2"><strong><i className="fas fa-search me-2"></i>¿Es esta tu editorial?</strong> Tenemos obras registradas bajo este nombre:</p>
                                                <div className="d-flex justify-content-between align-items-center bg-white p-2 rounded-pill px-3 shadow-sm">
                                                    <span className="small fw-bold">{sugerencia.nombre}</span>
                                                    <button type="button" className="btn btn-sm btn-booked-blue rounded-pill px-3 fw-bold" onClick={() => {
                                                        setNombre(sugerencia.nombre);
                                                        setReclamarId(sugerencia.id);
                                                        setSugerencia(null);
                                                    }}>
                                                        Sí, reclamar perfil
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {reclamarId && (
                                        <div className="col-12 mb-2">
                                            <div className="alert alert-success border-0 rounded-pill d-flex justify-content-between align-items-center px-4 shadow-sm">
                                                <span className="small fw-bold"><i className="fas fa-check-circle me-2"></i>Perfil vinculado correctamente</span>
                                                <button type="button" className="btn btn-sm btn-link text-danger text-decoration-none p-0 fw-bold" onClick={() => {setReclamarId(null); setSugerencia(null);}}>
                                                    Cancelar vinculación
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Email */}
                                    <div className="col-md-12 mb-2 mt-3">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Correo Corporativo</label>
                                        <div className="input-group shadow-sm rounded-pill overflow-hidden">
                                            <span className="input-group-text bg-light border-0 text-muted ps-4"><i className="fas fa-envelope"></i></span>
                                            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="form-control bg-light border-0 py-2 ps-2" placeholder="contacto@editorial.com" required />
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

export default SignUpEditorial;