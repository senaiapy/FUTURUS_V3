@extends('admin.layouts.app')
@section('panel')
    <div class="row">
        <div class="col-lg-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title">{{ $pageTitle }}</h5>
                    <div class="card-tools">
                        <a href="{{ route('admin.game.tasks.create') }}" class="btn btn--primary btn--sm">
                            <i class="las la-plus"></i> Create New Task
                        </a>
                    </div>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive--sm table-responsive">
                        <table class="table--light style--two table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Coin Reward</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($tasks as $task)
                                    <tr>
                                        <td>{{ $task['id'] }}</td>
                                        <td>{{ $task['name'] }}</td>
                                        <td>{{ $task['type'] }}</td>
                                        <td>
                                            <span class="badge badge--success">+{{ number_format($task['coin_reward']) }} Coins</span>
                                        </td>
                                        <td>
                                            @if($task['status'] == 1)
                                                <span class="badge badge--success">Active</span>
                                            @else
                                                <span class="badge badge--danger">Inactive</span>
                                            @endif
                                        </td>
                                        <td>{{ \Carbon\Carbon::parse($task['created_at'])->format('M d, Y') }}</td>
                                        <td>
                                            <div class="button--group">
                                                <a href="{{ route('admin.game.tasks.edit', $task['id']) }}" class="btn btn--sm btn-outline--primary">
                                                    <i class="la la-pencil"></i> Edit
                                                </a>
                                                <button type="button" class="btn btn--sm btn-outline--success" onclick="toggleStatus({{ $task['id'] }})">
                                                    <i class="la la-toggle-on"></i> Toggle
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td class="text-muted text-center" colspan="100%">No tasks found</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function toggleStatus(taskId) {
            if (confirm('Are you sure you want to toggle the status of this task?')) {
                fetch("{{ route('admin.game.tasks.status', ':id') }}".replace(':id', taskId), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.type === 'success') {
                        location.reload();
                    }
                });
            }
        }
    </script>
@endsection
