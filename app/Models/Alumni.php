<?php

namespace App\Models;
class Alumni
{
    public $member_id;
    public $fname;
    public $lname;
    public $username;
    public $role_id;
    public $mobile_number;
    public $batch_year;
    public $password_hash;

    public function __construct(array $data = [])
    {
        $this->member_id = $data['member_id'] ?? null;
        $this->fname = $data['fname'] ?? '';
        $this->lname = $data['lname'] ?? '';
        $this->username = $data['username'] ?? '';
        $this->role_id = $data['role_id'] ?? null;
        $this->mobile_number = $data['mobile_number'] ?? '';
        $this->batch_year = $data['batch_year'] ?? '';
        $this->password_hash = $data['password_hash'] ?? '';
    }
}
