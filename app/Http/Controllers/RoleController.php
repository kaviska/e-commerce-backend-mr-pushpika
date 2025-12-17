<?php

namespace App\Http\Controllers;

use App\Helper\Response;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $roles = Role::all();
        foreach ($roles as $role) {
            $role->permissions = $role->getPermissionNames();
        }

        return Response::success($roles, 'Roles retrieved successfully', 200);
    }

    /**
     * Store a newly created role and permission in storage.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'role_name' => 'required|string',
            'role_permissions' => 'required|array'
        ]);

        try {
            //open database transaction 
            DB::beginTransaction();

            //check if role already exists
            if (Role::where('name', $validatedData['role_name'])->exists()) {
                //rollback the transaction
                return Response::error('Role already exists', '', 400);
            }
            //create the role
            $roleName = Role::create(['name' => $validatedData['role_name']]);
            //assign permissions to the role
            $roleName->givePermissionTo($validatedData['role_permissions']);
            //commit the transaction
            DB::commit();
            return Response::success($roleName, 'Role created successfully', 200);
        } catch (\Throwable $th) {
            //rollback the transaction
            DB::rollBack();
            Log::error($th->getMessage());
            return Response::error('An error occurred while creating the role', '', 500);
        }
    }

    /**
     * Update the specified role in storage.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        try {
            //validate the request
            $validatedData = $request->validate([
                'role_id' => 'required',
                'role_name' => 'required|string',
                'role_permissions' => 'required|array'
            ]);
        } catch (\Throwable $th) {
            Log::error($th->getMessage());
            return Response::error('An error occurred while validating the request', '', 400);
        }

        //get the role
        $role = Role::find($validatedData['role_id'])->first();
        if (!$role) {
            return Response::error('Role not found', '', 404);
        }

        try {
            //open database transaction
            DB::beginTransaction();
            //update the role
            $role->update(['name' => $validatedData['role_name']]);
            //sync the permissions
            $role->syncPermissions($validatedData['role_permissions']);
            //commit the transaction
            DB::commit();
            return Response::success($role, 'Role updated successfully', 200);
        } catch (\Throwable $th) {
            //rollback the transaction
            DB::rollBack();
            Log::error($th->getMessage());
            return Response::error('An error occurred while updating the role', '', 500);
        }
    }

    /**
     * Remove the specified role from storage.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request)
    {
        //validate the request
        $validatedData = $request->validate([
            'role_id' => 'required'
        ]);

        //get the role
        $role = Role::find($validatedData['role_id'])->first();
        if (!$role) {
            return Response::error('Role not found', '', 404);
        }

        try {
            //open database transaction
            DB::beginTransaction();
            //delete the role
            $role->delete();
            //commit the transaction
            DB::commit();
            return Response::success([], 'Role deleted successfully', 200);
        } catch (\Throwable $th) {
            //rollback the transaction
            DB::rollBack();
            Log::error($th->getMessage());
            return Response::error('An error occurred while deleting the role', '', 500);
        }
    }

    /**
     * Assign role to user
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function assignToUser(Request $request)
    {
        //validate the request
        $validatedData = $request->validate([
            'user_id' => 'required',
            'roles' => 'required|array'
        ]);

        try {
            DB::beginTransaction();
            //check if role already assigned to user
            $user = User::find($validatedData['user_id']);
            Log::info($user);
            if ($user->hasRole($validatedData['roles'])) {
                //rollback the transaction
                return Response::error('Role already assigned to user', '', 400);
            }
            //assign role to user
            $user->assignRole($validatedData['roles']);
            DB::commit();
            return Response::success([], 'Role assigned to user successfully', 200);
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error($th->getMessage());
            return Response::error('An error occurred while assigning role to user', '', 500);
        }
    }

    /**
     * Revoke role from user
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function revokeFromUser(Request $request)
    {
        //validate the request
        $validatedData = $request->validate([
            'user_id' => 'required',
            'roles' => 'required|array'
        ]);

        try {
            DB::beginTransaction();
            //check if role already assigned to user
            $user = User::find($validatedData['user_id']);
            if (!$user->hasRole($validatedData['roles'])) {
                //rollback the transaction
                DB::rollBack();
                return Response::error('Role not assigned to user', '', 400);
            }
            //revoke role from user
            $user->syncRoles($validatedData['roles']);
            DB::commit();
            return Response::success([], 'Role revoked from user successfully', 200);
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error($th->getMessage());
            return Response::error('An error occurred while revoking role from user', '', 500);
        }
    }

    /**
     * revoke single role from user
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */

    public function revokeFromUserSingleRole(Request $request)
    {
        //validate the request
        $validatedData = $request->validate([
            'user_id' => 'required',
            'role' => 'required'
        ]);

        try {
            DB::beginTransaction();
            //check if role already assigned to user
            $user = User::find($validatedData['user_id'])->first();
            if (!$user->hasRole($validatedData['role'])) {
                //rollback the transaction
                DB::rollBack();
                return Response::error('Role not assigned to user', '', 400);
            }
            //revoke role from user
            $user->removeRole($validatedData['role']);
            DB::commit();
            return Response::success([], 'Role revoked from user successfully', 200);
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error($th->getMessage());
            return Response::error('An error occurred while revoking role from user', '', 500);
        }
    }
}
