@extends('admin.layouts.app')

@section('panel')
<div class="row">
    <div class="col-lg-12">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">{{ $pageTitle }}</h5>
            </div>
            <div class="card-body">
                <form action="{{ route('admin.game.tasks.store') }}" method="POST">
                    @csrf

                    <div class="form-group">
                        <label>Task Name <span class="text-danger">*</span></label>
                        <input type="text" name="name" class="form-control" required>
                    </div>

                    <div class="form-group">
                        <label>Description <span class="text-danger">*</span></label>
                        <textarea name="description" class="form-control" rows="4" required></textarea>
                    </div>

                    <div class="form-group">
                        <label>Task Type <span class="text-danger">*</span></label>
                        <select name="type" class="form-control" required>
                            <option value="ONE_TIME">One Time</option>
                            <option value="DAILY">Daily</option>
                            <option value="WEEKLY">Weekly</option>
                            <option value="REFERRAL">Referral</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Coin Reward <span class="text-danger">*</span></label>
                        <input type="number" name="coin_reward" class="form-control" min="0" required>
                    </div>

                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="status" value="1" checked>
                            Active
                        </label>
                    </div>

                    <button type="submit" class="btn btn--primary">Create Task</button>
                    <a href="{{ route('admin.game.tasks.index') }}" class="btn btn--secondary">Cancel</a>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
