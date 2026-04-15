@extends('admin.layouts.master')
@section('content')
<div class="login-main"
    style="background-image: url('{{ asset('assets/admin/images/login.jpg') }}')">
    <div class="container custom-container">
        <div class="row justify-content-center">
            <div class="col-xxl-5 col-xl-5 col-lg-6 col-md-8 col-sm-11">
                <div class="login-area">
                    <div class="login-wrapper">
                        <div class="login-wrapper__top">
                            <h3 class="title text-white">@lang('2FA Verification')</h3>
                            <p class="text-white">@lang('Please enter the verification code from your Google Authenticator app.')</p>
                        </div>
                        <div class="login-wrapper__body">
                            <form action="{{ route('admin.twofactor.verify.submit') }}" method="POST"
                                class="cmn-form mt-30 login-form">
                                @csrf
                                <div class="form-group">
                                    <label>@lang('Google Authenticator Code')</label>
                                    <input type="text" class="form-control" name="code" required autofocus>
                                </div>
                                <button type="submit" class="btn cmn-btn w-100">@lang('VERIFY')</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
