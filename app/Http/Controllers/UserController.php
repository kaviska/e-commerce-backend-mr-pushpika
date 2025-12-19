<?php

namespace App\Http\Controllers;

use App\Helper\Response;
use App\Models\User;
use App\Enums\UserType;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
       public function index()
    {
        try {
            // Fetch users
            $users = DB::select("
                SELECT 
                    users.id,
                    users.name,
                    users.email,
                    users.mobile,
                    users.user_type,
                    users.email_verified_at,
                    users.created_at,
                    users.updated_at,
                    users.stripe_id,
                    users.pm_type,
                    users.pm_last_four,
                    users.trial_ends_at
                FROM users
            ");
    
            // Fetch addresses
            $addresses = DB::select("
                SELECT 
                    addresses.id AS address_id,
                    addresses.user_id,
                    addresses.country,
                    addresses.region_id,
                    addresses.prefecture_id,
                    addresses.city,
                    addresses.postal_code,
                    addresses.address_line_1,
                    addresses.address_line_2
                FROM addresses
            ");
    
            // Fetch tokens
            $tokens = DB::select("
                SELECT 
                    personal_access_tokens.id AS token_id,
                    personal_access_tokens.tokenable_id AS user_id,
                    personal_access_tokens.name AS token_name,
                    personal_access_tokens.token,
                    personal_access_tokens.abilities,
                    personal_access_tokens.last_used_at,
                    personal_access_tokens.expires_at,
                    personal_access_tokens.created_at AS token_created_at,
                    personal_access_tokens.updated_at AS token_updated_at
                FROM personal_access_tokens
                WHERE personal_access_tokens.tokenable_type = 'App\\Models\\User'
            ");
    
            // Map addresses and tokens to users
            $users = collect($users)->map(function ($user) use ($addresses, $tokens) {
                $user->addresses = collect($addresses)->where('user_id', $user->id)->values();
                $user->tokens = collect($tokens)->where('user_id', $user->id)->values();
                return $user;
            });
    
            return Response::success($users, 'User List', 200);
        } catch (\Throwable $th) {
            Log::error('Error fetching users with addresses and tokens: ', [
                'error' => $th->getMessage(),
                'line' => $th->getLine(),
                'file' => $th->getFile(),
            ]);
            return Response::error('An error occurred while fetching the user.', 500);
        }
    }

   
    public function update(Request $request)
    {
        try {
            //validate the request
            $request->validate([
                'name' => 'required|string|max:255',
                'mobile' => [
                    'required',
                    'string',
                    'max:15',
                    'regex:/^(\+94|0)?\d{9}$|^(\+81|0)?\d{10}$/', // Regex for Sri Lanka and Japan mobile numbers
                ],
            ]);

            //find the user

            $user = $request->user();

            //check database transaction
            DB::beginTransaction();

            //update the user
            $user->name = $request->name;
            $user->mobile = $request->mobile;
            $user->save();

            //commit the transaction
            DB::commit();
            return Response::success($user, 'User updated successfully', 200);
        } catch (\Illuminate\Validation\ValidationException $validationException) {
            Log::error('Validation failed for user data: ', $validationException->errors());
        } catch (Exception $e) {
            // Rollback the transaction if an error occurs
            DB::rollBack();
            Log::error(
                'Error occurred while updating user: ',
                [
                    'error' => $e->getMessage(),
                    'line' => $e->getLine(),
                    'file' => $e->getFile(),
                ]
            );
            return Response::error('An error occurred while updating the user.', 500);
        }


    }

    public function delete(Request $request)
    {
        $validation = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);
        $user = User::find($validation['user_id']);
        if ($user) {
            //delete this user token
            $user->tokens()->delete();
            $user->delete();
            return Response::success(null, 'User deleted successfully', 200);
        } else {
            return Response::error('User not found', 404);
        }
    }

    public function removeUser(Request $request)
    {
        try {
            $request->validate([
                'user_id' => 'required|integer|exists:users,id',
                'device_name' => 'required|string',
            ]);
            //check database transaction
            DB::beginTransaction();
            //find the user
            $user = User::find($request->user_id);
            //send email to the user
            Mail::to($user->email)->send(new \App\Mail\DeleteAccount());
            //find the user
            if ($user) {

                //delete this user
                $user->delete();

                // commit the transaction
                DB::commit();

                //delete this user from the database
                return Response::success(null, 'User deleted successfully', 200);
            } else {
                return Response::error('User not found', 404);
            }
        } catch (\Throwable $th) {
            // Rollback the transaction if an error occurs
            DB::rollBack();
            Log::error(
                'Error occurred while deleting user: ',
                [
                    'error' => $th->getMessage(),
                    'line' => $th->getLine(),
                    'file' => $th->getFile(),
                ]
            );
            return Response::error('An error occurred while deleting the user.', 500);
        }

    }

    public function createAdminUser(Request $request)
    {
        try {
            // Validate the request
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email|max:255',
                'mobile' => [
                    'required',
                    'string',
                    'max:15',
                    'unique:users,mobile',
                    'regex:/^(\+94|0)?\d{9}$|^(\+81|0)?\d{10}$/', // Sri Lanka and Japan mobile numbers
                ],
                'password' => 'required|string|min:8|confirmed',
            ]);

            // Start database transaction
            DB::beginTransaction();

            // Create the user
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'mobile' => $validated['mobile'],
                'password' => Hash::make($validated['password']),
                'user_type' => UserType::ADMIN,
                'email_verified_at' => now(), // Auto-verify admin users
            ]);

            // Assign admin role
            $adminRole = Role::firstOrCreate(['name' => 'admin']);
            $user->assignRole($adminRole);

            // Commit the transaction
            DB::commit();

            return Response::success($user, 'Admin user created successfully', 201);
        } catch (\Illuminate\Validation\ValidationException $validationException) {
            Log::error('Validation failed for admin user creation: ', $validationException->errors());
            return Response::error($validationException->errors(), 'Validation failed', 422);
        } catch (\Throwable $th) {
            // Rollback the transaction if an error occurs
            DB::rollBack();
            Log::error(
                'Error occurred while creating admin user: ',
                [
                    'error' => $th->getMessage(),
                    'line' => $th->getLine(),
                    'file' => $th->getFile(),
                ]
            );
            return Response::error('An error occurred while creating the admin user.', 500);
        }
    }
}
