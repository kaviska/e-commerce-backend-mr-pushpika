<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserType;
use App\Helper\Response;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

class AdminAuthController extends Controller
{
    /**
     * Handle login for API using Sanctum
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        try {
            //code...
            $credentials = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
                'device_name' => 'required|string',
            ]);
    
            $user = User::where('email', $credentials['email'])->first();
    
            if (!$user || !Hash::check($credentials['password'], $user->password)) {
                return Response::error('Invalid credentials', 401);
            }
    
            // Revoke existing tokens for the same device
            $user->tokens()->where('name', $credentials['device_name'])->delete();
    
            // Generate a new token
            $token = $user->createToken($credentials['device_name'])->plainTextToken;
    
            return Response::success([
                'user' => $user,
                'token' => $token,
            ], 'Login successful', 200);
        } catch (\Throwable $th) {
            //throw $th;
            return Response::error($th->getMessage(),'An error occurred during login', 500);
        }
       
    }

    /**
     * Handle logout for API using Sanctum
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        // Revoke the current access token
        $user->currentAccessToken()->delete();

        return Response::success(null, 'Logout successful', 200);
    }

    /**
     * Check if user is logged in
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function isLogin(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return Response::error('User is not logged in', 401);
        }

        return Response::success($user, 'User is logged in', 200);
    }

    /**
     * Register a new admin user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'mobile' => 'required|string',
            'device_name' => 'required|string',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'mobile' => $request->mobile,
            'user_type' => UserType::ADMIN,
        ]);

        // Generate a token for the new user
        $token = $user->createToken($request->device_name)->plainTextToken;

        return Response::success([
            'user' => $user,
            'token' => $token,
        ], 'Admin user created successfully', 201);
    }

    public function load(Request $request)
    {
       //load all admin if id presented load that admin
       if($request->has('id')){
            $user = User::find($request->id);
            if (!$user) {
                return Response::error('User not found', 404);
            }
            return Response::success($user, 'User loaded successfully', 200);
        }else{
            $users = User::where('user_type', UserType::ADMIN)->get();
            return Response::success($users, 'Users loaded successfully', 200);
        }
    }
    public function delete(Request $request)
    {
        //delete user
        $user = User::find($request->id);
        if (!$user) {
            return Response::error('User not found', 404);
        }
        $user->delete();
        return Response::success(null, 'User deleted successfully', 200);
    }
}