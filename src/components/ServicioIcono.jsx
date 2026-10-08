import React from 'react';
import { MdPropaneTank, MdBalcony, MdLocalParking, MdYard } from 'react-icons/md';
import { TbTemperaturePlus } from 'react-icons/tb';
import { iconoServicio } from '../utils/servicios';

const REACT_ICONOS = {
    'gas envasado': MdPropaneTank,
    'balcon': MdBalcony,
    'agua caliente': TbTemperaturePlus,
    'estacionamiento abierto': MdLocalParking,
    'patio interno': MdYard,
};

const normalizar = (texto) => (texto || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const ServicioIcono = ({ nombre, className = '' }) => {
    const ReactIcon = REACT_ICONOS[normalizar(nombre)];
    if (ReactIcon) return <ReactIcon className={className} aria-hidden="true" />;
    return <i className={`fas ${iconoServicio(nombre)} ${className}`.trim()}></i>;
};

export default ServicioIcono;