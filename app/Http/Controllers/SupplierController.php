<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use App\Helper\Response;
use Illuminate\Support\Facades\DB;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        //
        if($request->has('id')){
            $supplier=Supplier::find($request->id);
            return Response::success($supplier, "Supplier fetched successfully");
        }

        $supplier=Supplier::all();
        return Response::success($supplier, "Supplier fetched successfully");

    }

  

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
       try {
        //code...
         //code...

         $request->validate([
          
            'name' => 'required|string',
            'email' => 'required|email|unique:suppliers,email',
            'mobile' => 'string|unique:suppliers,mobile',
            'address' => 'string|nullable',
            'bank_name' => 'string|nullable',
            'bank_account_number' => 'string|unique:suppliers,bank_account_numbe|nullable',

        ]);
        DB::beginTransaction();
        
        $supplier= new Supplier();
        $supplier->name=$request->name;
        $supplier->email=$request->email;
        $supplier->mobile=$request->mobile;
        $supplier->address=$request->address;
        $supplier->bank_name=$request->bank_name;
        $supplier->bank_account_number=$request->bank_account_number;
        $supplier->save();
        DB::commit();
        return Response::success($supplier, "Supplier created successfully");

       } catch (\Throwable $th) {
        //throw $th;
        DB::rollBack();
        return Response::error($th->getMessage(), "Supplier creation failed");
       }



    }

    /**
     * Display the specified resource.
     */
    public function show(Supplier $supplier)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Supplier $supplier)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        //
        try {
            //code...
            $request->validate([
                'id'=>'required',
                'name' => 'required|string',
                'email' => 'required|email|',
                'mobile' => 'string|nullable',
                'address' => 'string|nullable',
                'bank_name' => 'string|nullable',
                'bank_account_number' => 'string|nullable',
    
            ]);

            DB::beginTransaction();

            $supplier=Supplier::find($request->id);
            $supplier->name=$request->name;
            $supplier->email=$request->email;
            $supplier->mobile=$request->mobile;
            $supplier->address=$request->address;
            $supplier->bank_name=$request->bank_name;
            $supplier->bank_account_number=$request->bank_account_number;

            $supplier->save();
            DB::commit();

            return Response::success($supplier, "Supplier updated successfully");



        } catch (\Throwable $th) {
            //throw $th;
            DB::rollBack();
            return Response::error($th->getMessage(), "Supplier update failed");
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        try {
            // Validate the request to accept either a single ID or an array of IDs
            $request->validate([
                'id' => 'required|min:1', // Ensure it's an array with at least one element
               
            ]);
    
            // Retrieve the IDs from the request
            $id = $request->id;
            $deletedSuppliers = Supplier::where('id', $id)->delete();

            
            
          
    
            return Response::success($deletedSuppliers, "Supplier(s) deleted successfully");
        } catch (\Throwable $th) {
            return Response::error($th->getMessage(), 'Supplier deletion failed');
        }
    }
}
