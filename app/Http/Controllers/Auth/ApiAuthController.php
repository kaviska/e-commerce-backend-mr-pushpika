<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserType;
use App\Helper\Otp;
use App\Helper\Response;
use App\Http\Controllers\Controller;
use App\Jobs\DeleteUnverifiedUser;
use App\Mail\OtpSender;
use App\Models\User;
use App\Notifications\Test;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class ApiAuthController extends Controller
{
    /**
     * Register a new user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        try {
            // Validation remains the same...
            $fields = $request->validate([
                'name' => 'required|string',
                'email' => 'required|string|email|unique:users,email,NULL,id,user_type,' . UserType::REGISTERED->value,
                'mobile' => [
                    'nullable',
                    'string',
                    'regex:/^(\+94|0)?\d{9}$|^(\+81|0)?\d{10}$/'
                ],
                'password' => 'required|string|confirmed',
                'password_confirmation' => 'required|string',
                'device_name' => 'required|string',
            ]);
        } catch (ValidationException $e) {
            Log::error($e->getMessage());
            return Response::error($e->getMessage(), null);
        }

        try {
            DB::beginTransaction();

            // First check if a user with this email already exists
            $existingUser = User::where('email', $fields['email'])->first();

            if ($existingUser) {
                // If user exists and is already registered, return error
                if ($existingUser->user_type === UserType::REGISTERED->value) {
                    return Response::error('Email is already registered', null);
                }

                // If user exists but is a guest, update their details
                $existingUser->update([
                    'name' => $fields['name'],
                    'mobile' => $fields['mobile'],
                    'password' => bcrypt($fields['password']),
                    'user_type' => UserType::REGISTERED,
                ]);

                $user = $existingUser;
            } else {
                // Create a new user if no user exists with this email
                $user = User::create([
                    'name' => $fields['name'],
                    'email' => $fields['email'],
                    'mobile' => $fields['mobile'],
                    'password' => bcrypt($fields['password']),
                    'user_type' => UserType::REGISTERED,
                ]);
            }

            // Generate and send OTP
            $this->sendOtp($user);

            // Schedule job to delete unverified user
            DeleteUnverifiedUser::dispatch($user->id)->delay(now()->addMinutes(5));

            // Check for existing tokens with the same device name
            if ($user->tokens()->where('name', $fields['device_name'])->exists()) {
                $user->tokens()->where('name', $fields['device_name'])->delete();
            }

            // Generate API token
            $token = $user->createToken($fields['device_name'])->plainTextToken;

            // Commit transaction
            DB::commit();

            return Response::success(
                [
                    'user' => $user,
                    'token' => $token
                ],
                'User created successfully',
                200
            );
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error($th->getMessage());
            return Response::error('Something went wrong', null, 500);
        }
    }

    /**
     * Generate and send OTP
     *
     * @param User $user
     */
    private function sendOtp(User $user)
    {
        $otp = (new Otp())->generate();
        $user->update(['otp' => $otp]);
        Mail::to($user->email)->send(new OtpSender($otp));
    }


    /**
     * Login user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */

    public function login(Request $request)
    {
        try {
            //validate request
            $fields = $request->validate([
                'email' => 'required|string|email',
                'password' => 'required|string',
                'device_name' => 'required|string'
            ]);
        } catch (ValidationException $validationException) {
            Log::error($validationException->getMessage());
            return Response::error(
                $validationException->getMessage(),
                null,
                $validationException->status
            );
        }

        try {
            //check email
            $user = User::where('email', $fields['email'])->first();

            //check password
            if (!$user || !Hash::check($fields['password'], $user->password)) {
                return Response::error(
                    'Invalid credentials',
                    null,
                    401
                );
            }

            //check if user is verified
            if (!$user->email_verified_at) {
                return Response::error(
                    'User not verified',
                    null,
                    401
                );
            }

            // first check if the have any existing token
            if ($user->tokens()->where('name', $fields['device_name'])->exists()) {
                $user->tokens()->where('name', $fields['device_name'])->delete();
            }

            //generate token
            $token = $user->createToken(
                $fields['device_name'],
            )->plainTextToken;


            // $user->notify(new Test());

            return Response::success(
                [
                    'user' => $user,
                    'token' => $token
                ],
                'User logged in successfully',
                200
            );
        } catch (\Throwable $th) {
            Log::error($th->getMessage());
            return Response::error(
                $th->getMessage(),
                null,
                500
            );
        }
    }

    /**
     * Logout user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        try {
            //revoke token
            $request->user()->currentAccessToken()->delete();
            return Response::success(
                null,
                'User logged out successfully',
                200
            );
        } catch (\Throwable $th) {
            Log::error($th->getMessage());
            return Response::error(
                $th->getMessage(),
                null,
                500
            );
        }
    }
    /**
     * Verify OTP
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */

    public function verifyOtp(Request $request)
    {
        try {
            //validate request
            $fields = $request->validate([
                'otp' => 'required|numeric',
            ]);
        } catch (ValidationException $validationException) {
            Log::error($validationException->getMessage());
            return Response::error(
                $validationException->getMessage(),
                null,
                $validationException->status
            );
        }

        try {
            DB::beginTransaction();
            //check otp
            $user = User::where('otp', $fields['otp'])->first();

            if (!$user) {
                return Response::error(
                    'Invalid OTP',
                    null,
                    401
                );
            }

            //update user
            $user->otp = null;
            $user->save();

            //verify email
            $user->email_verified_at = now();
            $user->save();

            //commit transaction
            DB::commit();
            return Response::success(
                $user,
                'OTP verified successfully',
                200
            );
        } catch (\Throwable $th) {
            Log::error($th->getMessage());
            DB::rollBack();
            return Response::error(
                $th->getMessage(),
                null,
                500
            );
        }
    }

    /**
     * Resend OTP
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resendOtp(Request $request, User $user)
    {
        try {
            //check token
            $token = $request->bearerToken();

            //check token
            if (!$token) {
                return Response::error(
                    'Invalid token',
                    null,
                    401
                );
            }

            //open database transaction
            DB::beginTransaction();

            //find token in the database
            $accessToken = PersonalAccessToken::findToken($token);

            if (!$accessToken) {
                return Response::error(
                    'Invalid token',
                    null,
                    401
                );
            }
            //find user
            $user = $accessToken->tokenable()->first();

            //generate otp
            $Otp = new Otp();
            $otp = $Otp->generate();

            //store otp
            $user->otp = $otp;
            $user->save();

            //send otp
            Mail::to($user->email)->send(new OtpSender($otp));

            //commit transaction
            DB::commit();

            //return response
            return Response::success(
                $user,
                'OTP sent successfully',
                200
            );
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error($th->getMessage());
            return Response::error(
                $th->getMessage(),
                null,
                500
            );
        }
    }

    /**
     * Check user is logged in
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function isLogin(Request $request, User $user)
    {
        try {
            //check token
            $token = $request->bearerToken();

            //check token
            if (!$token) {
                return Response::error(
                    'Invalid token',
                    null,
                    401
                );
            }

            //open database transaction
            DB::beginTransaction();

            //find token in the database
            $accessToken = PersonalAccessToken::findToken($token);

            if (!$accessToken) {
                return Response::error(
                    'User not found',
                    null,
                    401
                );
            }
            //find user
            $user = $accessToken->tokenable()->first();

            //commit transaction
            DB::commit();

            //return response
            return Response::success(
                $user,
                'User is logged in',
                200
            );
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error($th->getMessage());
            return Response::error(
                $th->getMessage(),
                null,
                500
            );
        }
    }

    /**
     * Create guest user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function guestUser(Request $request)
    {
        try {
            //validate request
            $filed = $request->validate([
                'name' => 'required|string',
                'email' => 'required|string|email|unique:users,email',
                'mobile' => [
                    'required',
                    'string',
                    'regex:/^(\+94|0)?\d{9}$|^(\+81|0)?\d{10}$/'
                ],
            ]);
        } catch (ValidationException $validationException) {
            //log error
            Log::error($validationException->getMessage());
            return Response::error(
                $validationException->getMessage(),
                null,
                $validationException->status
            );
        }

        try {

            //generate unique id
            $uniqueId = uniqid();

            //create guest password
            $password = bcrypt($uniqueId);

            //open database transaction
            DB::beginTransaction();

            //create user
            $user = User::create([
                'name' => $filed['name'],
                'email' => $filed['email'],
                'mobile' => $filed['mobile'],
                'user_type' => UserType::GUEST,
                'password' => $password,
            ]);

            //commit transaction
            DB::commit();
            //return response
            return Response::success(
                $user,
                'Guest user created successfully',
                200
            );
        } catch (\Throwable $th) {
            //rollback transaction
            DB::rollBack();
            //log error
            Log::error($th->getMessage());
            return Response::error(
                $th->getMessage(),
                null,
                500
            );
        }
    }

    /**
     * Forgot password
     */
    public function forgotPassword(Request $request)
    {
        try {
            //validate request
            $fields = $request->validate([
                'email' => 'required|string|email|exists:users,email',
                'device_name' => 'required|string',
            ]);
        } catch (ValidationException $validationException) {
            Log::error($validationException->getMessage());
            return Response::error(
                $validationException->getMessage(),
                null,
                $validationException->status
            );
        }

        try {
            //open database transaction
            DB::beginTransaction();

            //find user
            $user = User::where('email', $fields['email'])->first();

            //check user
            if (!$user) {
                return Response::error(
                    'User not found',
                    null,
                    401
                );
            }

            //generate otp
            $otp = (new Otp())->generate();

            //store otp
            $user->otp = $otp;
            $user->save();

            //send otp
            Mail::to($user->email)->send(new OtpSender($otp));

            // first check if the have any existing token
            if ($user->tokens()->where('name', $fields['device_name'])->exists()) {
                $user->tokens()->where('name', $fields['device_name'])->delete();
            }

            //generate token
            $token = $user->createToken(
                $fields['device_name'],
            )->plainTextToken;

            //commit transaction
            DB::commit();

            //return response
            return Response::success(
                [
                    'user' => $user,
                    'token' => $token
                ],
                'OTP sent successfully',
                200
            );
        } catch (\Throwable $th) {
            //rollback transaction
            DB::rollBack();
            //log error
            Log::error($th->getMessage());
            return Response::error(
                $th->getMessage(),
                null,
                500
            );
        }
    }
    /**
     * Reset password
     */
    public function resetPassword(Request $request)
    {
        try {
            //validate request
            $fields = $request->validate([
                'email' => 'required|string|email|exists:users,email',
                'password' => 'required|string|confirmed',
                'password_confirmation' => 'required|string',
            ]);
        } catch (ValidationException $validationException) {
            Log::error($validationException->getMessage());
            return Response::error(
                $validationException->getMessage(),
                null,
                $validationException->status
            );
        }

        try {
            //open database transaction
            DB::beginTransaction();

            //find user
            $user = User::where('email', $fields['email'])->first();

            //check user
            if (!$user) {
                return Response::error(
                    'User not found',
                    null,
                    401
                );
            }

            //store password
            $user->password = bcrypt($fields['password']);
            $user->save();

            //commit transaction
            DB::commit();

            //return response
            return Response::success(
                null,
                'Password reset successfully',
                200
            );
        } catch (\Throwable $th) {
            //rollback transaction
            DB::rollBack();
            //log error
            Log::error($th->getMessage());
            return Response::error(
                $th->getMessage(),
                null,
                500
            );
        }
    }

    /**
     * Change password current user password
     */
    public function changePassword(Request $request)
    {
        $validatedFiled = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|confirmed',
            'new_password_confirmation' => 'required|string',
        ]);
        //get the current user
        $requestUser = $request->user();
        //check if the current password is correct
        if (!Hash::check($validatedFiled['current_password'], $requestUser->password)) {
            return Response::error(
                'Current password is incorrect',
                null,
                401
            );
        }
        //open database transaction
        DB::beginTransaction();
        try {
            //update password
            $requestUser->password = bcrypt($validatedFiled['new_password']);
            $requestUser->save();

            //commit transaction
            DB::commit();
            return Response::success(
                null,
                'Password changed successfully',
                200
            );
        } catch (\Throwable $th) {
            //rollback transaction
            DB::rollBack();
            Log::error($th->getMessage());
            return Response::error(
                $th->getMessage(),
                null,
                500
            );
        }
    }

    /**
     * check user data has been changed
     */
    public function checkUserData(Request $request)
    {

        Log::info($request->all());

        //find user using the user id
        $user = User::find($request->input('user.id'));
        //check if the user is not found
        if (!$user) {
            return Response::error(
                'User not found',
                null,
                401
            );
        }
        //check if the user data has been changed (only name and mobile)
        if($user->name === $request->input('user.name') && $user->mobile === $request->input('user.mobile')){
            return Response::success(
                null,
                'User data has not been changed',
                200
            );
        }
        //check if the user data has been changed, send the user data
        return Response::success(
            [
                'user' => $user
            ],
            'User data has been changed',
            200
        );
    }
}
