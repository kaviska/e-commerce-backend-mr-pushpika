<?php

namespace App\Jobs;

use App\Enums\UserType;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log as FacadesLog;

class DeleteUnverifiedUser implements ShouldQueue
{
    use Queueable;

    private $user_id;

    /**
     * Create a new job instance.
     */
    public function __construct($user_id)
    {
        $this->user_id = $user_id;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $user = User::where('id', $this->user_id)->first(); // Fetch the user

        if ($user) {
            FacadesLog::info('Checking if user is unverified with id: ' . $user->id);

            // Check if email_verified_at column is null
            if ($user->email_verified_at === null) {
                FacadesLog::info('Deleting unverified user with id: ' . $user->id);
                $user->delete();
            }
        } else {
            FacadesLog::info('User not found with id: ' . $this->user_id);
        }
    }
}
