<?php

namespace App\Enums;

enum StudentVerificationStatus: string
{
    case Unverified = 'unverified';
    case Pending = 'pending';
    case Verified = 'verified';
    case Mismatched = 'mismatched';
    case Failed = 'failed';
}
