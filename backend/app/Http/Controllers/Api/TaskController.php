<?php


namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    public function index(Request $request)
    {
       return Task::where('user_id', $request->user()->id)
       ->orderBy('created_at','desc')
       ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:255'],
            'status' => ['required', Rule::in(['todo', 'doing', 'done'])],
        ]);

        $data['user_id'] = $request->user()->id;

        $task = Task::create($data);

        return response()->json($task, 201);
    }

    public function update(Request $request, Task $task)
    {
       if($task->user_id !== $request->user()->id) {
           return response()->json(['message' => 'No autorizado'], 403);
       }

       $data = $request->validate([
           'title' => ['sometimes', 'string', 'max:255'],
           'description' => ['sometimes', 'nullable', 'string', 'max:255'],
           'status' => ['sometimes', Rule::in(['todo', 'doing', 'done'])],
       ]);

       $task->update($data);

       return response()->json($task);
   }

   public function destroy(Request $request, Task $task)
   {
    if($task->user_id !== $request->user()->id){
        return response()->json(['message' => 'No autorizado'], 403);
    }

    $task->delete();

    return response()->json(['message' => 'Tarea eliminada' ]);
   }
}
