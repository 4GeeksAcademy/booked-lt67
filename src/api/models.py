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
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)

    libros: Mapped[List["Libro"]] = relationship(back_populates="editorial")

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
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)

    libros: Mapped[List["Libro"]] = relationship(back_populates="autor")

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
