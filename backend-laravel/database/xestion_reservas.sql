-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 26-11-2025 a las 11:48:46
-- Versión del servidor: 8.0.43-0ubuntu0.24.04.1
-- Versión de PHP: 8.3.6

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
-- Estructura de tabla para la tabla `Administrador`
--

CREATE TABLE `Administrador` (
  `id_admin` int NOT NULL,
  `usuario_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `Administrador`
--

INSERT INTO `Administrador` (`id_admin`, `usuario_id`) VALUES
(1, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Horario`
--

CREATE TABLE `Horario` (
  `id_horario` int NOT NULL,
  `dia_semana` varchar(15) COLLATE utf8mb4_spanish_ci NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL
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
-- Estructura de tabla para la tabla `Instalacion`
--

CREATE TABLE `Instalacion` (
  `id_instalacion` int NOT NULL,
  `nome` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `capacidade` int NOT NULL,
  `estado` varchar(50) COLLATE utf8mb4_spanish_ci NOT NULL,
  `id_admin` int NOT NULL,
  `id_tipo` int NOT NULL
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
-- Estructura de tabla para la tabla `Reserva`
--

CREATE TABLE `Reserva` (
  `id_reserva` int NOT NULL,
  `data_reserva` date NOT NULL,
  `estado` varchar(50) COLLATE utf8mb4_spanish_ci NOT NULL,
  `id_usuario` int NOT NULL,
  `id_instalacion` int NOT NULL,
  `id_admin` int NOT NULL,
  `id_horario` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `Reserva`
--

INSERT INTO `Reserva` (`id_reserva`, `data_reserva`, `estado`, `id_usuario`, `id_instalacion`, `id_admin`, `id_horario`) VALUES
(1, '2025-01-15', 'Confirmada', 1, 1, 1, 1),
(2, '2025-01-16', 'Pendiente', 2, 3, 1, 2),
(3, '2025-01-20', 'Cancelada', 1, 2, 1, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `RolUsuario`
--

CREATE TABLE `RolUsuario` (
  `id_rol` int NOT NULL,
  `nome_rol` varchar(50) COLLATE utf8mb4_spanish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `RolUsuario`
--

INSERT INTO `RolUsuario` (`id_rol`, `nome_rol`) VALUES
(1, 'Usuario'),
(2, 'Administrador');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `TipoInstalacion`
--

CREATE TABLE `TipoInstalacion` (
  `id_tipo` int NOT NULL,
  `nome_tipo` varchar(50) COLLATE utf8mb4_spanish_ci NOT NULL,
  `descricion` text COLLATE utf8mb4_spanish_ci
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
-- Estructura de tabla para la tabla `Usuario`
--

CREATE TABLE `Usuario` (
  `id_usuario` int NOT NULL,
  `nome` varchar(50) COLLATE utf8mb4_spanish_ci NOT NULL,
  `apelidos` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `correo` varchar(100) COLLATE utf8mb4_spanish_ci NOT NULL,
  `contrasinal` varchar(255) COLLATE utf8mb4_spanish_ci NOT NULL,
  `telefono` varchar(9) COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `id_rol` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `Usuario`
--

INSERT INTO `Usuario` (`id_usuario`, `nome`, `apelidos`, `correo`, `contrasinal`, `telefono`, `id_rol`) VALUES
(1, 'Ana', 'García López', 'ana@example.com', 'hashedpass1', '612345678', 1),
(2, 'Pedro', 'Fernández Soto', 'pedro@example.com', 'hashedpass2', '698765432', 1),
(3, 'Laura', 'Pérez Díaz', 'laura@example.com', 'hashedpass3', '623456789', 2);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `Administrador`
--
ALTER TABLE `Administrador`
  ADD PRIMARY KEY (`id_admin`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `Horario`
--
ALTER TABLE `Horario`
  ADD PRIMARY KEY (`id_horario`);

--
-- Indices de la tabla `Instalacion`
--
ALTER TABLE `Instalacion`
  ADD PRIMARY KEY (`id_instalacion`),
  ADD KEY `id_admin` (`id_admin`),
  ADD KEY `id_tipo` (`id_tipo`);

--
-- Indices de la tabla `Reserva`
--
ALTER TABLE `Reserva`
  ADD PRIMARY KEY (`id_reserva`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_instalacion` (`id_instalacion`),
  ADD KEY `id_admin` (`id_admin`),
  ADD KEY `id_horario` (`id_horario`);

--
-- Indices de la tabla `RolUsuario`
--
ALTER TABLE `RolUsuario`
  ADD PRIMARY KEY (`id_rol`);

--
-- Indices de la tabla `TipoInstalacion`
--
ALTER TABLE `TipoInstalacion`
  ADD PRIMARY KEY (`id_tipo`);

--
-- Indices de la tabla `Usuario`
--
ALTER TABLE `Usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD KEY `id_rol` (`id_rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `Administrador`
--
ALTER TABLE `Administrador`
  MODIFY `id_admin` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `Horario`
--
ALTER TABLE `Horario`
  MODIFY `id_horario` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `Instalacion`
--
ALTER TABLE `Instalacion`
  MODIFY `id_instalacion` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `Reserva`
--
ALTER TABLE `Reserva`
  MODIFY `id_reserva` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `RolUsuario`
--
ALTER TABLE `RolUsuario`
  MODIFY `id_rol` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `TipoInstalacion`
--
ALTER TABLE `TipoInstalacion`
  MODIFY `id_tipo` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `Usuario`
--
ALTER TABLE `Usuario`
  MODIFY `id_usuario` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `Administrador`
--
ALTER TABLE `Administrador`
  ADD CONSTRAINT `Administrador_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario` (`id_usuario`);

--
-- Filtros para la tabla `Instalacion`
--
ALTER TABLE `Instalacion`
  ADD CONSTRAINT `Instalacion_ibfk_1` FOREIGN KEY (`id_admin`) REFERENCES `Administrador` (`id_admin`),
  ADD CONSTRAINT `Instalacion_ibfk_2` FOREIGN KEY (`id_tipo`) REFERENCES `TipoInstalacion` (`id_tipo`);

--
-- Filtros para la tabla `Reserva`
--
ALTER TABLE `Reserva`
  ADD CONSTRAINT `Reserva_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario` (`id_usuario`),
  ADD CONSTRAINT `Reserva_ibfk_2` FOREIGN KEY (`id_instalacion`) REFERENCES `Instalacion` (`id_instalacion`),
  ADD CONSTRAINT `Reserva_ibfk_3` FOREIGN KEY (`id_admin`) REFERENCES `Administrador` (`id_admin`),
  ADD CONSTRAINT `Reserva_ibfk_4` FOREIGN KEY (`id_horario`) REFERENCES `Horario` (`id_horario`);

--
-- Filtros para la tabla `Usuario`
--
ALTER TABLE `Usuario`
  ADD CONSTRAINT `Usuario_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `RolUsuario` (`id_rol`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

ALTER TABLE Usuario
ADD COLUMN foto_perfil VARCHAR(255) AFTER id_rol;
