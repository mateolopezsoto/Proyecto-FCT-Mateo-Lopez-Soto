DROP DATABASE IF EXISTS libreria;

CREATE DATABASE libreria;

USE libreria;

CREATE TABLE colecciones (
	idColeccion INT IDENTITY(1,1) PRIMARY KEY,
	nombre_coleccion varchar(50) NOT NULL
);

CREATE TABLE comics (
	idComic INT IDENTITY(1,1) PRIMARY KEY,
	nombre_comic varchar(50) NOT NULL,
	estado varchar(25) NOT NULL,
	fecha_adquisicion DATE NOT NULL,
	idColeccion INT NOT NULL REFERENCES colecciones(idColeccion)
);

INSERT INTO colecciones (nombre_coleccion) VALUES
	('Marvel'),
	('DC'),
	('Asterix y Obelix');

INSERT INTO comics (nombre_comic, estado, fecha_adquisicion, idColeccion) VALUES
	('Daredevil', 'optimo', '2022/05/12', 1),
	('Ojo de halcon', 'roto', '2020/03/26', 1),
	('Civil war', 'roto', '2020/03/26', 1),
	('Harleen', 'optimo', '2001/11/02', 2),
	('Linea tierra uno', 'optimo', '2007/06/06', 2),
	('Gotham central', 'optimo', '2014/01/14', 2),
	('Asterix el galo', 'optimo', '2022/12/10', 3),
	('La gran travesia', 'roto', '2018/08/20', 3),
	('El adivino', 'roto', '2019/08/20', 3);