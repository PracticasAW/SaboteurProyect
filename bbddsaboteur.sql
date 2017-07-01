-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 01-07-2017 a las 12:08:40
-- Versión del servidor: 10.1.16-MariaDB
-- Versión de PHP: 5.6.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bbddsaboteur`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cartas_tablero`
--

CREATE TABLE `cartas_tablero` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_partida` int(10) UNSIGNED NOT NULL,
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `num_carta` varchar(15) NOT NULL,
  `coor_X` int(10) UNSIGNED NOT NULL,
  `coor_Y` int(10) UNSIGNED NOT NULL,
  `pepita` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cartas_usuario`
--

CREATE TABLE `cartas_usuario` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `id_partida` int(10) UNSIGNED NOT NULL,
  `num_carta` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comentarios`
--

CREATE TABLE `comentarios` (
  `id` int(11) NOT NULL,
  `id_partida` int(11) UNSIGNED NOT NULL,
  `id_usuario` int(11) UNSIGNED NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `comentario` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jugadores`
--

CREATE TABLE `jugadores` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_partida` int(10) UNSIGNED NOT NULL,
  `id_jugador` int(10) UNSIGNED NOT NULL,
  `roll` varchar(20) DEFAULT NULL,
  `pico` varchar(10) DEFAULT 'ok'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `partidas`
--

CREATE TABLE `partidas` (
  `id` int(10) UNSIGNED NOT NULL,
  `nombre` varchar(45) NOT NULL,
  `fecha_creacion` date NOT NULL,
  `turno` int(10) UNSIGNED DEFAULT NULL,
  `creador` int(10) UNSIGNED NOT NULL,
  `num_jugadores_maximos` int(10) UNSIGNED NOT NULL,
  `ganador` int(10) UNSIGNED DEFAULT NULL,
  `estado` enum('ACTIVA','ESPERA','TERMINADA') NOT NULL,
  `mov_restantes` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(10) UNSIGNED NOT NULL,
  `nick` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `nombre_completo` varchar(45) NOT NULL,
  `sexo` enum('HOMBRE','MUJER') NOT NULL,
  `foto` blob,
  `fecha_nacimiento` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cartas_tablero`
--
ALTER TABLE `cartas_tablero`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_cartas_partida` (`id_partida`),
  ADD KEY `FK_cartas_usuario` (`id_usuario`);

--
-- Indices de la tabla `cartas_usuario`
--
ALTER TABLE `cartas_usuario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_usuario_usuario` (`id_usuario`),
  ADD KEY `FK_partida_partida` (`id_partida`);

--
-- Indices de la tabla `comentarios`
--
ALTER TABLE `comentarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_coment_partida` (`id_partida`),
  ADD KEY `FK_coment_usuario` (`id_usuario`);

--
-- Indices de la tabla `jugadores`
--
ALTER TABLE `jugadores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`,`id_partida`,`id_jugador`),
  ADD UNIQUE KEY `id_partida` (`id_partida`,`id_jugador`),
  ADD KEY `FK_jugadores_partida` (`id_partida`),
  ADD KEY `FK_jugador_usuario` (`id_jugador`);

--
-- Indices de la tabla `partidas`
--
ALTER TABLE `partidas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD KEY `FK_turno_usuario` (`turno`),
  ADD KEY `FK_creador_usuario` (`creador`),
  ADD KEY `FK_ganador_usuario` (`ganador`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nick` (`nick`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cartas_tablero`
--
ALTER TABLE `cartas_tablero`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=200;
--
-- AUTO_INCREMENT de la tabla `cartas_usuario`
--
ALTER TABLE `cartas_usuario`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=447;
--
-- AUTO_INCREMENT de la tabla `comentarios`
--
ALTER TABLE `comentarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;
--
-- AUTO_INCREMENT de la tabla `jugadores`
--
ALTER TABLE `jugadores`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;
--
-- AUTO_INCREMENT de la tabla `partidas`
--
ALTER TABLE `partidas`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;
--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cartas_tablero`
--
ALTER TABLE `cartas_tablero`
  ADD CONSTRAINT `FK_cartas_partida` FOREIGN KEY (`id_partida`) REFERENCES `partidas` (`id`),
  ADD CONSTRAINT `FK_cartas_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `cartas_usuario`
--
ALTER TABLE `cartas_usuario`
  ADD CONSTRAINT `FK_partida_partida` FOREIGN KEY (`id_partida`) REFERENCES `partidas` (`id`),
  ADD CONSTRAINT `FK_usuario_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `comentarios`
--
ALTER TABLE `comentarios`
  ADD CONSTRAINT `FK_coment_partida` FOREIGN KEY (`id_partida`) REFERENCES `partidas` (`id`),
  ADD CONSTRAINT `FK_coment_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `jugadores`
--
ALTER TABLE `jugadores`
  ADD CONSTRAINT `FK_jugador_usuario` FOREIGN KEY (`id_jugador`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `FK_jugadores_partida` FOREIGN KEY (`id_partida`) REFERENCES `partidas` (`id`);

--
-- Filtros para la tabla `partidas`
--
ALTER TABLE `partidas`
  ADD CONSTRAINT `FK_creador_usuario` FOREIGN KEY (`creador`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `FK_ganador_usuario` FOREIGN KEY (`ganador`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `FK_turno_usuario` FOREIGN KEY (`turno`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
