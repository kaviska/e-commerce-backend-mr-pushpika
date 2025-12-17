<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //create permissions
        $permissions = [
            'admin-permission',
            'staff-permission',
        ];

        //assign all permissions to admin role
        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        //create roles
        $roles = [
            'admin',
        ];

        //assign all permissions to admin role
        foreach ($roles as $role) {
            $role = Role::create(['name' => $role]);
        }

        //assign permissions to roles
        Role::find(1)->givePermissionTo(Permission::all());

        //assign permissions to roles
        $admin = User::find(1);
        $admin->assignRole('admin');
    }
}
