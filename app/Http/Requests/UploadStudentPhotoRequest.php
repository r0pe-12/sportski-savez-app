<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadStudentPhotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('uploadPhoto', $this->route('student'));
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'photo' => ['required', 'image', 'mimes:jpeg,png,webp', 'max:5120'], // 5 MB
        ];
    }
}
