<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin Abastos',
                'username' => 'admin',
                'email' => 'admin@abastos.com',
                'password' => 'secret123',
            ],
            [
                'name' => 'David Garcia',
                'username' => 'david',
                'email' => 'david@abastos.com',
                'password' => 'secret123',
            ],
            [
                'name' => 'Carlos Ruiz',
                'username' => 'carlos',
                'email' => 'carlos@abastos.com',
                'password' => 'secret123',
            ],
        ];

        $tasksByUser = [
            'admin@abastos.com' => [
                ['title' => 'Configurar entorno', 'description' => 'Docker, .env y dependencias', 'status' => 'todo'],
                ['title' => 'Diseñar login', 'description' => 'Pantalla responsive con validaciones', 'status' => 'doing'],
                ['title' => 'Integrar API auth', 'description' => 'Conectar login con Sanctum', 'status' => 'done'],
                ['title' => 'Crear tablero base', 'description' => 'Render columnas To Do, Doing, Done', 'status' => 'doing'],
                ['title' => 'Documentar endpoints', 'description' => 'Resumen para Postman y README', 'status' => 'todo'],
                ['title' => 'Preparar despliegue', 'description' => 'Checklist para entorno productivo', 'status' => 'done'],
            ],
            'david@abastos.com' => [
                ['title' => 'Revisar backlog', 'description' => 'Priorizar tareas del sprint actual', 'status' => 'todo'],
                ['title' => 'Actualizar estilos board', 'description' => 'Mejorar tarjetas y botones', 'status' => 'doing'],
                ['title' => 'Agregar modal eliminar', 'description' => 'Confirmacion antes de borrar', 'status' => 'done'],
                ['title' => 'Validar filtros', 'description' => 'Buscar por titulo y descripcion', 'status' => 'doing'],
                ['title' => 'Ajustar mobile', 'description' => 'Corregir layout en pantallas pequenas', 'status' => 'todo'],
            ],
            'carlos@abastos.com' => [
                ['title' => 'Crear pruebas API', 'description' => 'Flujo login, me y logout', 'status' => 'todo'],
                ['title' => 'Agregar seed extra', 'description' => 'Datos iniciales para demo', 'status' => 'done'],
                ['title' => 'Refactor Board.jsx', 'description' => 'Reducir duplicacion en columnas', 'status' => 'doing'],
                ['title' => 'Escribir README', 'description' => 'Guia de ejecucion y pruebas', 'status' => 'todo'],
            ],
        ];

        foreach ($users as $userData) {
            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'username' => $userData['username'],
                    'password' => Hash::make($userData['password']),
                ]
            );

            $userTasks = $tasksByUser[$user->email] ?? [];

            foreach ($userTasks as $taskData) {
                Task::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'title' => $taskData['title'],
                    ],
                    [
                        'description' => $taskData['description'],
                        'status' => $taskData['status'],
                    ]
                );
            }
        }
    }
}
