import React from 'react';
import Icon from './Icon';
import { iconoServicio } from '../utils/servicios';

const ServicioIcono = ({ nombre, className = '' }) => (
    <Icon name={iconoServicio(nombre)} className={className} />
);

export default ServicioIcono;
