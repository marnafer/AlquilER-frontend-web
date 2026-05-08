<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // Para usar el deleted_at

class Propiedad extends Model
{
    use SoftDeletes; // Habilita el borrado logico de la BD

    // 1. Nombre de la tabla (si no es el plural en ingl�s, hay que aclararlo)
    protected $table = 'propiedades';

    // 2. Campos que permitimoss que se llenen (Mass Assignment)
    // Esto es por seguridad, para que el sanitizador y el modelo trabajen juntos
    protected $fillable = [
    'titulo', 'descripcion', 'precio', 'expensas', 'direccion', 
    'cantidad_ambientes', 'cantidad_dormitorios', 'cantidad_banos', 
    'capacidad', 'disponible', 'categoria_id', 'localidad_id',
    'usuario_id'
    ];

    // 3. Desactivamos los timestamps autom�ticos si no ten�s 'created_at' y 'updated_at'
    public $timestamps = false; 
    
    // Indicamos que use deleted_at para el Soft Delete
    protected $dates = ['deleted_at'];
}