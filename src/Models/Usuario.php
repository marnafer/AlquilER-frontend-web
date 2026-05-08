<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Usuario extends Model
{
    use SoftDeletes;

    protected $table = 'usuarios';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'apellido',
        'email',
        'telefono',
        'domicilio',
        'contrasena',
        'rol_id'
    ];

    protected $hidden = ['contrasena', 'deleted_at'];

    public function obtenerTodos()
    {
        return self::select('usuarios.*', 'roles.nombre as rol_nombre')
            ->join('roles', 'usuarios.rol_id', '=', 'roles.id')
            ->whereNull('usuarios.deleted_at')
            ->orderBy('usuarios.id', 'desc')
            ->get();
    }

    public function obtenerPorId($id)
    {
        return self::select('usuarios.*', 'roles.nombre as rol_nombre')
            ->join('roles', 'usuarios.rol_id', '=', 'roles.id')
            ->where('usuarios.id', $id)
            ->whereNull('usuarios.deleted_at')
            ->first();
    }

    public function existePorEmail($email, $excluirId = null)
    {
        $query = self::where('email', $email)->whereNull('deleted_at');

        if ($excluirId) {
            $query->where('id', '!=', $excluirId);
        }

        return $query->exists();
    }

    public function verificarCredenciales($email, $contrasena)
    {
        $usuario = self::where('email', $email)
            ->whereNull('deleted_at')
            ->first();

        if (!$usuario) return false;

        if (!password_verify($contrasena, $usuario->contrasena)) {
            return false;
        }

        return $usuario;
    }
}