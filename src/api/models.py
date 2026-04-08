from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from typing import List
import os

db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            # do not serialize the password, its a security breach
        }


class Lector(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    username: Mapped[str] = mapped_column(String(120), nullable=False)
    nombre: Mapped[str] = mapped_column(String(120),  nullable=False)
    apellido: Mapped[str] = mapped_column(String(120), nullable=False)
    pais_donde_reside: Mapped[str] = mapped_column(String(120), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)
    foto_url: Mapped[str] = mapped_column(String(500), nullable=True)

    latitud: Mapped[float] = mapped_column(db.Float, nullable=True)
    longitud: Mapped[float] = mapped_column(db.Float, nullable=True)

    libros_fav: Mapped[List["LibrosFavoritos"]
                       ] = relationship(back_populates="lector")

    favorites_autor: Mapped[List["Lector_Autores_Favoritos"]] = relationship(
        back_populates="lector")

    siguiendo: Mapped[List["Seguidor"]] = relationship(
        "Seguidor", foreign_keys="Seguidor.lector_id", back_populates="lector_que_sigue", cascade="all, delete-orphan")

    seguidores: Mapped[List["Seguidor"]] = relationship(
        "Seguidor", foreign_keys="Seguidor.seguido_id", back_populates="lector_seguido", cascade="all, delete-orphan")

    reviews: Mapped[List["Reviews"]] = relationship(back_populates="lector")

    def __repr__(self):
        return f'<Lector: {self.username}>'

    def serialize(self):

        foto_final = self.foto_url

        if self.foto_url:
            if not self.foto_url.startswith("http"):
                base_url = os.getenv("VITE_BACKEND_URL", "").rstrip("/")
                foto_final = f"{base_url}/{self.foto_url.lstrip('/')}"

        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "pais_donde_reside": self.pais_donde_reside,

            "latitud": self.latitud,
            "longitud": self.longitud,

            "foto_url": foto_final,

            "siguiendo": [s.serialize_as_siguiendo() for s in self.siguiendo],
            "seguidores": [f.serialize_as_seguidor() for f in self.seguidores]
            # do not serialize the password, its a security breach
        }


class Editorial(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre = db.Column(db.String(120), unique=True, nullable=False)
    pais: Mapped[str] = mapped_column(String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password = db.Column(db.String(80), unique=False, nullable=True)
    is_active = db.Column(db.Boolean(), default=True)

    image_url = mapped_column(String(255), nullable=True)

    libros: Mapped[List["Libro"]] = relationship(back_populates="editorial")
    posts: Mapped[List["PostEditorial"]] = relationship(
        back_populates="editorial")

    def __repr__(self):
        return f'<Editorial: {self.nombre}>'

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "pais": self.pais,
            "email": self.email,
            "image_url": self.image_url
        }


class Autor(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    apellido: Mapped[str] = mapped_column(String(120), nullable=False)
    pais: Mapped[str] = mapped_column(String(120), nullable=True)
    email = db.Column(db.String(120), unique=True,
                      nullable=True)  # Permitir nulo
    password = db.Column(db.String(80), unique=False,
                         nullable=True)  # Permitir nulo
    # Para saber si es reclamado
    is_verified = db.Column(db.Boolean(), default=False)
    foto_url = db.Column(db.String(500), nullable=True)

    libros: Mapped[List["Libro"]] = relationship(back_populates="autor")

    favorited: Mapped[List["Lector_Autores_Favoritos"]
                      ] = relationship(back_populates="autor")

    posts: Mapped[List["PostAutor"]] = relationship(back_populates="autor")

    def __repr__(self):
        return f'<Autor: {self.nombre} {self.apellido}>'

    def serialize(self):

        foto_final = self.foto_url

        if self.foto_url:
            if not self.foto_url.startswith("http"):
                base_url = os.getenv("VITE_BACKEND_URL", "").rstrip("/")
                foto_final = f"{base_url}/{self.foto_url.lstrip('/')}"

        return {
            "id": self.id,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "pais": self.pais,
            "email": self.email,
            "foto": foto_final
        }


class Libro(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(500), nullable=False)
    genero: Mapped[str] = mapped_column(String(120), nullable=False)
    google_id: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=True)
    isbn_13: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=True)
    descripcion: Mapped[str] = mapped_column(db.Text, nullable=True)

    editorial_id: Mapped[int] = mapped_column(
        ForeignKey("editorial.id"), nullable=False)
    editorial: Mapped["Editorial"] = relationship(back_populates="libros")

    image_url = mapped_column(String(500), nullable=True)

    autor_id: Mapped[int] = mapped_column(
        ForeignKey("autor.id"), nullable=False)
    autor: Mapped["Autor"] = relationship(back_populates="libros")

    libros_fav: Mapped[List["LibrosFavoritos"]
                       ] = relationship(back_populates="libro")

    reviews: Mapped[List["Reviews"]] = relationship(back_populates="libro")

    def __repr__(self):
        return f'<Libro: {self.nombre}>'

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "genero": self.genero,
            "google_id": self.google_id,
            "isbn_13": self.isbn_13,
            "descripcion": self.descripcion,
            "autor_id": self.autor_id,
            "editorial_id": self.editorial_id,
            "nombre_autor": f"{self.autor.nombre} {self.autor.apellido}" if self.autor else "Sin autor",
            "nombre_editorial": self.editorial.nombre if self.editorial else "Sin editorial",
            "image_url": self.image_url
        }


class LibrosFavoritos(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)

    lector_id: Mapped[int] = mapped_column(ForeignKey("lector.id"))
    lector: Mapped["Lector"] = relationship(back_populates="libros_fav")

    libro_id: Mapped[int] = mapped_column(
        ForeignKey("libro.id"), nullable=False)
    libro: Mapped["Libro"] = relationship(back_populates="libros_fav")

    def serialize(self):
        return {
            "id": self.id,
            "lector_id": self.lector_id,
            "libro": self.libro.serialize() if self.libro else None
            # do not serialize the password, its a security breach
        }


class Lector_Autores_Favoritos(db.Model):

    id: Mapped[int] = mapped_column(primary_key=True)

    lector_id: Mapped[int] = mapped_column(
        ForeignKey("lector.id"), nullable=False)
    autor_id: Mapped[int] = mapped_column(
        ForeignKey("autor.id"), nullable=False)

    lector: Mapped["Lector"] = relationship(back_populates="favorites_autor")
    autor: Mapped["Autor"] = relationship(back_populates="favorited")

    def serialize(self):
        return {
            "id": self.id,
            "lector_id": self.lector_id,
            "username": self.lector.username,
            "autor_id": self.autor_id,
            "nombre_lector": f"{self.lector.nombre} {self.lector.apellido}" if self.lector else None,
            "nombre_autor": f"{self.autor.nombre} {self.autor.apellido}" if self.autor else None
        }


class Seguidor(db.Model):

    id: Mapped[int] = mapped_column(primary_key=True)

    lector_id: Mapped[int] = mapped_column(
        ForeignKey("lector.id"), nullable=False)
    seguido_id: Mapped[int] = mapped_column(
        ForeignKey("lector.id"), nullable=False)

    __table_args__ = (db.UniqueConstraint(
        'lector_id', 'seguido_id', name='_lector_seguido_uc'),)

    lector_que_sigue: Mapped["Lector"] = relationship(
        "Lector", foreign_keys=[lector_id], back_populates="siguiendo")
    lector_seguido: Mapped["Lector"] = relationship(
        "Lector", foreign_keys=[seguido_id], back_populates="seguidores")

    def serialize(self):
        return {
            "id": self.id,
            "lector_id": self.lector_id,
            "seguidor_id": self.lector_id,
            "seguido_id": self.seguido_id
        }

    def serialize_as_siguiendo(self):
        return {
            "relacion_id": self.id,
            "seguido_id": self.seguido_id,
            "nombre_seguido": self.lector_seguido.nombre
        }

    def serialize_as_seguidor(self):
        return {
            "relacion_id": self.id,
            "seguidor_id": self.lector_id,
            "nombre_seguidor": self.lector_que_sigue.nombre
        }


class Reviews(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)

    lector_id: Mapped[int] = mapped_column(ForeignKey("lector.id"))
    lector: Mapped["Lector"] = relationship(back_populates="reviews")

    libro_id: Mapped[int] = mapped_column(
        ForeignKey("libro.id"), nullable=False)
    libro: Mapped["Libro"] = relationship(back_populates="reviews")

    texto: Mapped[str] = mapped_column(String(120), nullable=False)
    puntuacion: Mapped[int] = mapped_column(nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "lector_id": self.lector_id,
            "nombre_lector": f"{self.lector.nombre} {self.lector.apellido}" if self.lector else None,
            "libro": self.libro.serialize() if self.libro else None,
            "texto": self.texto,
            "puntuacion": self.puntuacion
        }


class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)
    is_active = db.Column(db.Boolean(), unique=False,
                          nullable=False, default=True)

    def __repr__(self):
        return f'<Admin {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,

        }


class LecturaActual(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    lector_id: Mapped[int] = mapped_column(
        ForeignKey("lector.id"), nullable=False)
    libro_id: Mapped[int] = mapped_column(
        ForeignKey("libro.id"), nullable=False)

    # Relaciones
    libro: Mapped["Libro"] = relationship()

    def serialize(self):
        return {
            "id": self.id,
            "libro": self.libro.serialize() if self.libro else None
        }


class PostEditorial(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)

    editorial_id: Mapped[int] = mapped_column(ForeignKey("editorial.id"))
    editorial: Mapped["Editorial"] = relationship(back_populates="posts")

    texto: Mapped[str] = mapped_column(db.Text, nullable=False)

    fecha: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc))

    def serialize(self):
        return {
            "id": self.id,
            "editorial_id": self.editorial_id,
            "nombre_editorial": f"{self.editorial.nombre}" if self.editorial else None,
            "texto": self.texto,
            "fecha": self.fecha.strftime("%d-%m-%Y %H:%M") if self.fecha else None
        }


class PostAutor(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)

    autor_id: Mapped[int] = mapped_column(ForeignKey("autor.id"))
    autor: Mapped["Autor"] = relationship(back_populates="posts")

    texto: Mapped[str] = mapped_column(db.Text, nullable=False)
    fecha: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc))

    def serialize(self):
        return {
            "id": self.id,
            "autor_id": self.autor_id,
            "nombre_autor": f"{self.autor.nombre} {self.autor.apellido}" if self.autor else None,
            "texto": self.texto,
            "fecha": self.fecha.strftime("%d-%m-%Y %H:%M")
        }
