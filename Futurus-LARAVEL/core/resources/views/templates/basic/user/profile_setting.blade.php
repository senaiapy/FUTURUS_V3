@extends('Template::layouts.master')
@section('content')
    <div class="dashboard-inner">
        <div class="mb-4">
            <h3 class="mb-2">@lang('Profile')</h3>
        </div>

        <div class="card custom--card">
            <div class="card-body">
                <form class="register" method="post" enctype="multipart/form-data">
                    @csrf

                    <div class="auth-user-pic">
                        <img class="auth-user-pic__thumb" src="{{ getImage(getFilePath('userProfile') . '/' . auth()->user()->image ?? '', getFileSize('userProfile')) }}" alt="img">
                        <div class="auth-user-pic__btns">
                            <input class="d-none" type="file" name="image" id="auth-user-pic" accept=".png,.jpg,.jpeg">
                            <label class="btn btn--sm btn--base" for="auth-user-pic">@lang('Change picture')</label>
                        </div>
                    </div>

                    <div class="row">
                        <div class="form-group col-sm-6">
                            <label class="form-label">@lang('First Name')</label>
                            <input type="text" class="form-control form--control" name="firstname" value="{{ $user->firstname }}" required>
                        </div>
                        <div class="form-group col-sm-6">
                            <label class="form-label">@lang('Last Name')</label>
                            <input type="text" class="form-control form--control" name="lastname" value="{{ $user->lastname }}" required>
                        </div>
                    </div>
                    <div class="row">
                        <div class="form-group col-sm-6">
                            <label class="form-label">@lang('E-mail Address')</label>
                            <input class="form-control form--control" value="{{ $user->email }}" readonly>
                        </div>
                        <div class="form-group col-sm-6">
                            <label class="form-label">@lang('Mobile Number')</label>
                            <input class="form-control form--control" value="{{ $user->mobile }}" readonly>
                        </div>
                    </div>
                    <div class="row">
                        <div class="form-group col-sm-6">
                            <label class="form-label">@lang('Address')</label>
                            <input type="text" class="form-control form--control" name="address" value="{{ $user->address }}">
                        </div>
                        <div class="form-group col-sm-6">
                            <label class="form-label">@lang('State')</label>
                            <input type="text" class="form-control form--control" name="state" value="{{ $user->state }}">
                        </div>
                    </div>


                    <div class="row">
                        <div class="form-group col-sm-4">
                            <label class="form-label">@lang('Zip Code')</label>
                            <input type="text" class="form-control form--control" name="zip" value="{{ $user->zip }}">
                        </div>

                        <div class="form-group col-sm-4">
                            <label class="form-label">@lang('City')</label>
                            <input type="text" class="form-control form--control" name="city" value="{{ $user->city }}">
                        </div>

                        <div class="form-group col-sm-4">
                            <label class="form-label">@lang('Country')</label>
                            <input class="form-control form--control" value="{{ $user->country_name }}" disabled>
                        </div>

                    </div>

                    <div class="form-group mt-3">
                        <button type="submit" class="btn btn--base w-100">@lang('Submit')</button>
                    </div>
                </form>
            </div>
        </div>


    </div>
@endsection


@push('style')
    <style>
        .auth-user-pic {
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -ms-flex-wrap: wrap;
            flex-wrap: wrap;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            gap: 12px 24px;
            margin-bottom: 24px;
        }

        @media screen and (max-width: 575px) {
            .auth-user-pic {
                -webkit-box-orient: vertical;
                -webkit-box-direction: normal;
                -ms-flex-direction: column;
                flex-direction: column;
                margin-bottom: 16px;
            }
        }

        .auth-user-pic__thumb {
            --size: 80px;
            width: var(--size);
            height: var(--size);
            border-radius: 50%;
            display: block;
            -o-object-fit: cover;
            object-fit: cover;
            -ms-flex-negative: 0;
            flex-shrink: 0;
            border: 1px solid hsl(var(--base)/.15)
        }

        .auth-user-pic__btns {
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -ms-flex-wrap: wrap;
            flex-wrap: wrap;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            gap: 12px;
        }
    </style>
@endpush

@push('script')
    <script>
        (function($) {
            "use strict";
            let inputField = $("#auth-user-pic");
            let uploadImg = $(".auth-user-pic__thumb");


            inputField.on("change", function() {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function() {
                        const result = reader.result;
                        uploadImg.attr("src", result);
                    };
                    reader.readAsDataURL(file);
                }
            });

        })(jQuery)
    </script>
@endpush
