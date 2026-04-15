@extends('admin.layouts.app')

@section('panel')
<div class="row">
    <div class="col-lg-12">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">{{ $pageTitle }}</h5>
            </div>
            <div class="card-body">
                <form action="{{ route('admin.game.tasks.update', $task['id']) }}" method="POST">
                    @csrf
                    <input type="hidden" name="_method" value="PUT">

                    <div class="form-group">
                        <label>Task Name <span class="text-danger">*</span></label>
                        <input type="text" name="name" class="form-control" value="{{ $task['name'] }}" required>
                    </div>

                    <div class="form-group">
                        <label>Description <span class="text-danger">*</span></label>
                        <textarea name="description" class="form-control" rows="4" required>{{ $task['description'] }}</textarea>
                    </div>

                    <div class="form-group">
                        <label>Task Type <span class="text-danger">*</span></label>
                        <select name="type" class="form-control" required>
                            <option value="ONE_TIME" {{ $task['type'] == 'ONE_TIME' ? 'selected' : '' }}>One Time</option>
                            <option value="DAILY" {{ $task['type'] == 'DAILY' ? 'selected' : '' }}>Daily</option>
                            <option value="WEEKLY" {{ $task['type'] == 'WEEKLY' ? 'selected' : '' }}>Weekly</option>
                            <option value="REFERRAL" {{ $task['type'] == 'REFERRAL' ? 'selected' : '' }}>Referral</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Coin Reward <span class="text-danger">*</span></label>
                        <input type="number" name="coin_reward" class="form-control" min="0" value="{{ $task['coin_reward'] }}" required>
                    </div>

                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="status" value="1" {{ $task['status'] ? 'checked' : '' }}>
                            Active
                        </label>
                    </div>

                    <button type="submit" class="btn btn--primary">Update Task</button>
                    <a href="{{ route('admin.game.tasks.index') }}" class="btn btn--secondary">Cancel</a>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
