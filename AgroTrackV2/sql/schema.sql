-- ========================================
-- SCHEMA DE BASE DE DATOS AGROTRACK
-- ========================================
-- Script SQL para crear la base de datos y la tabla de contactos
-- Ejecutar este script en MySQL para configurar la base de datos

-- Crear la base de datos (si no existe)
CREATE DATABASE IF NOT EXISTS agrotrack;

-- Usar la base de datos
USE agrotrack;

-- Crear la tabla de contactos

CREATE TABLE IF NOT EXISTS contactos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

