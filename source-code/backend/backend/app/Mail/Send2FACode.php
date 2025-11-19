<?php

namespace App\Mail;


use Illuminate\Mail\Mailable;

class Send2FACode extends Mailable
{
    public $otp;

    public function __construct($otp)
    {
        $this->otp = $otp;
    }

    public function build()
    {
        return $this->subject('Your 2FA Verification Code')
                    ->view('emails.2fa-code')
                    ->with(['otp' => $this->otp]);
    }
}
