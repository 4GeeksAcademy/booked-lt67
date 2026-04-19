import React, { useEffect } from 'react';

const InfoPage = ({ title, icon, children, subtitle }) => {
    // Scroll al inicio al cargar la página
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="container py-5 mt-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    {/* Header de la página */}
                    <div className="text-center mb-5">
                        <div className="bg-light d-inline-block p-4 rounded-circle text-info-booked mb-3 shadow-sm">
                            <i className={`fas ${icon} fa-3x`}></i>
                        </div>
                        <h1 className="fw-bold text-dark">{title}</h1>
                        <p className="text-muted lead">{subtitle}</p>
                        <hr className="w-25 mx-auto border-info-booked border-2 opacity-50" />
                    </div>

                    {/* Contenido */}
                    <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border mb-5">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoPage;