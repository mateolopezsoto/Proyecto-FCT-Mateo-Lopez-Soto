-- phpMyAdmin SQL Dump
-- version 5.2.1
-- Base de datos: `xestion_reservas`

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `xestion_reservas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `RolUsuario`
--

CREATE TABLE `RolUsuario` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nome_rol` varchar(50) COLLATE utf8mb4_spanish_ci NOT NULL,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `RolUsuario`
--

INSERT INTO `RolUsuario` (`id_rol`, `nome_rol`) VALUES
(1, 'Usuario'),
(2, 'Administrador');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Usuario`
--

CREATE TABLE `Usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) COLLATE utf8mb4_spanish_ci NOT NULL,
  `apelidos` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `correo` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `contrasinal` varchar(255) COLLATE utf8mb4_spanish_ci NOT NULL,
  `telefono` varchar(9) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `id_rol` int NOT NULL,
  `foto_perfil` varchar(255) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo`),
  KEY `id_rol` (`id_rol`),
  CONSTRAINT `Usuario_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `RolUsuario` (`id_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `Usuario`
-- (La contraseña es 'password123' hasheada con Bcrypt estándar)
--

INSERT INTO `Usuario` (`id_usuario`, `nome`, `apelidos`, `correo`, `contrasinal`, `telefono`, `id_rol`, `foto_perfil`) VALUES
(1, 'Ana', 'García López', 'ana@example.com', '$2y$12$f4Y9jpaMLhVZ2P3JaxrI9ursBndTyDOeH3hmuUI/Y1QcG3wUoftoO', '612345678', 1, NULL),
(2, 'Pedro', 'Fernández Soto', 'pedro@example.com', '$2y$12$f4Y9jpaMLhVZ2P3JaxrI9ursBndTyDOeH3hmuUI/Y1QcG3wUoftoO', '698765432', 1, NULL),
(3, 'Admin', 'Xestor Reservas', 'admin@example.com', '$2y$12$f4Y9jpaMLhVZ2P3JaxrI9ursBndTyDOeH3hmuUI/Y1QcG3wUoftoO', '623456789', 2, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Administrador`
--

CREATE TABLE `Administrador` (
  `id_admin` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  PRIMARY KEY (`id_admin`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `Administrador_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `Administrador`
--

INSERT INTO `Administrador` (`id_admin`, `usuario_id`) VALUES
(1, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `TipoInstalacion`
--

CREATE TABLE `TipoInstalacion` (
  `id_tipo` int NOT NULL AUTO_INCREMENT,
  `nome_tipo` varchar(50) COLLATE utf8mb4_spanish_ci NOT NULL,
  `descricion` text COLLATE utf8mb4_spanish_ci,
  PRIMARY KEY (`id_tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `TipoInstalacion`
--

INSERT INTO `TipoInstalacion` (`id_tipo`, `nome_tipo`, `descricion`) VALUES
(1, 'Pista de Pádel', 'Pistas exteriores cubertas con cesped artificial'),
(2, 'Piscina', 'Piscina climatizada interior'),
(3, 'Ximnasio', 'Sala equipada con máquinas de musculación e cardio');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Instalacion`
--

CREATE TABLE `Instalacion` (
  `id_instalacion` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `capacidade` int NOT NULL,
  `estado` varchar(50) COLLATE utf8mb4_spanish_ci NOT NULL,
  `id_admin` int NOT NULL,
  `id_tipo` int NOT NULL,
  PRIMARY KEY (`id_instalacion`),
  KEY `id_admin` (`id_admin`),
  KEY `id_tipo` (`id_tipo`),
  CONSTRAINT `Instalacion_ibfk_1` FOREIGN KEY (`id_admin`) REFERENCES `Administrador` (`id_admin`),
  CONSTRAINT `Instalacion_ibfk_2` FOREIGN KEY (`id_tipo`) REFERENCES `TipoInstalacion` (`id_tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `Instalacion`
--

INSERT INTO `Instalacion` (`id_instalacion`, `nome`, `capacidade`, `estado`, `id_admin`, `id_tipo`) VALUES
(1, 'Pista Pádel A', 4, 'Disponible', 1, 1),
(2, 'Piscina Municipal', 50, 'En Mantemento', 1, 2),
(3, 'Ximnasio Central', 30, 'Disponible', 1, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Horario`
--

CREATE TABLE `Horario` (
  `id_horario` int NOT NULL AUTO_INCREMENT,
  `dia_semana` varchar(15) COLLATE utf8mb4_spanish_ci NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  PRIMARY KEY (`id_horario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `Horario`
--

INSERT INTO `Horario` (`id_horario`, `dia_semana`, `hora_inicio`, `hora_fin`) VALUES
(1, 'Luns', '10:00:00', '11:00:00'),
(2, 'Martes', '18:00:00', '19:00:00'),
(3, 'Venres', '16:00:00', '17:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Reserva`
--

CREATE TABLE `Reserva` (
  `id_reserva` int NOT NULL AUTO_INCREMENT,
  `data_reserva` date NOT NULL,
  `estado` varchar(50) COLLATE utf8mb4_spanish_ci NOT NULL,
  `id_usuario` int NOT NULL,
  `id_instalacion` int NOT NULL,
  `id_admin` int NOT NULL,
  `id_horario` int DEFAULT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_reserva`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_instalacion` (`id_instalacion`),
  KEY `id_admin` (`id_admin`),
  KEY `id_horario` (`id_horario`),
  CONSTRAINT `Reserva_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario` (`id_usuario`),
  CONSTRAINT `Reserva_ibfk_2` FOREIGN KEY (`id_instalacion`) REFERENCES `Instalacion` (`id_instalacion`),
  CONSTRAINT `Reserva_ibfk_3` FOREIGN KEY (`id_admin`) REFERENCES `Administrador` (`id_admin`),
  CONSTRAINT `Reserva_ibfk_4` FOREIGN KEY (`id_horario`) REFERENCES `Horario` (`id_horario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `Reserva`
--

INSERT INTO `Reserva` (`id_reserva`, `data_reserva`, `estado`, `id_usuario`, `id_instalacion`, `id_admin`, `id_horario`, `hora_inicio`, `hora_fin`) VALUES
(1, '2025-01-15', 'Confirmada', 1, 1, 1, 1, '10:00:00', '11:00:00'),
(2, '2025-01-16', 'Pendiente', 2, 3, 1, 2, '18:00:00', '19:00:00'),
(3, '2025-01-20', 'Cancelada', 1, 2, 1, 3, '16:00:00', '17:00:00');

-- --------------------------------------------------------

--
-- TABLAS OBLIGATORIAS PARA LARAVEL (Sanctum y Auth)
--

-- Tabla para los tokens de acceso (Sanctum)
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para restablecer contraseñas
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
