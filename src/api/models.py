from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List

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

    libros_fav: Mapped[List["LibrosFavoritos"]] = relationship(back_populates="lector")

    favorites_autor: Mapped[List["Lector_Autores_Favoritos"]] = relationship(back_populates="lector")

    reviews: Mapped[List["Reviews"]] = relationship(back_populates="lector")

    def __repr__(self):
        return f'<Lector: {self.username}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "pais_donde_reside": self.pais_donde_reside,
            # do not serialize the password, its a security breach
        }


class Editorial(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    pais: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)

    libros: Mapped[List["Libro"]] = relationship(back_populates="editorial")

    def __repr__(self):
        return f'<Editorial: {self.nombre}>'

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "pais": self.pais,
            "email": self.email
        }


class Autor(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    apellido: Mapped[str] = mapped_column(String(120), nullable=False)
    pais: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)

    libros: Mapped[List["Libro"]] = relationship(back_populates="autor")

    favorited: Mapped[List["Lector_Autores_Favoritos"]] = relationship(back_populates="autor")

    def __repr__(self):
        return f'<Autor: {self.nombre} {self.apellido}>'

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "pais": self.pais,
            "email": self.email
        }


class Libro(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    genero: Mapped[str] = mapped_column(String(120), nullable=False)

    editorial_id: Mapped[int] = mapped_column(ForeignKey("editorial.id"), nullable=False)
    editorial: Mapped["Editorial"] = relationship(back_populates="libros")
    
    autor_id: Mapped[int] = mapped_column(ForeignKey("autor.id"), nullable=False)
    autor: Mapped["Autor"] = relationship(back_populates="libros")

    libros_fav: Mapped[List["LibrosFavoritos"]] = relationship(back_populates="libro")

    reviews: Mapped[List["Reviews"]] = relationship(back_populates="libro")

    def __repr__(self):
        return f'<Libro: {self.nombre}>'

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "genero": self.genero,
            "autor_id": self.autor_id,
            "editorial_id": self.editorial_id,
            "nombre_autor": f"{self.autor.nombre} {self.autor.apellido}" if self.autor else "Sin autor",
            "nombre_editorial": self.editorial.nombre if self.editorial else "Sin editorial"
        }

class LibrosFavoritos(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    
    lector_id: Mapped[int] = mapped_column(ForeignKey("lector.id"))
    lector: Mapped["Lector"] = relationship(back_populates="libros_fav")

    libro_id: Mapped[int] = mapped_column(ForeignKey("libro.id"), nullable=False)
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

    lector_id: Mapped[int] = mapped_column(ForeignKey("lector.id"), nullable=False)
    autor_id: Mapped[int] = mapped_column(ForeignKey("autor.id"), nullable=False)

    lector: Mapped["Lector"] = relationship(back_populates="favorites_autor")
    autor: Mapped["Autor"] = relationship(back_populates="favorited")

    def serialize(self):
        return {
            "id": self.id,
            "lector_id": self.lector_id,
            "autor_id": self.autor_id,
            "nombre_lector": f"{self.lector.nombre} {self.lector.apellido}" if self.lector else None,
            "nombre_autor": f"{self.autor.nombre} {self.autor.apellido}" if self.autor else None
        }

class Reviews(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    
    lector_id: Mapped[int] = mapped_column(ForeignKey("lector.id"))
    lector: Mapped["Lector"] = relationship(back_populates="reviews")

    libro_id: Mapped[int] = mapped_column(ForeignKey("libro.id"), nullable=False)
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
