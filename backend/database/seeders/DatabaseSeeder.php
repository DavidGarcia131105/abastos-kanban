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
    $user = User::create([
        'name' => 'Admin',
        'username' => 'admin',
        'email' => 'admin@abastos.com',
        'password' => Hash::make('secret123'),
    ]);

    Task::create([
        'title' => 'Configurar proyecto',
        'description' => 'Docker y entorno base',
        'status' => 'todo',
        'user_id' => $user->id,
    ]);

    Task::create([
        'title' => 'Diseñar tablero',
        'description' => 'Columnas y UI base',
        'status' => 'doing',
        'user_id' => $user->id,
    ]);

    Task::create([
        'title' => 'Preparar deploy',
        'description' => 'Checklist de producción',
        'status' => 'done',
        'user_id' => $user->id,
    ]);
}
}
