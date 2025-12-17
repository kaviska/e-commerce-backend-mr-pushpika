<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Helper\Response;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        // config

        try {
            //code...
            $LATEST_PRODUCT_DAYS = 7;
            $DEFAULT_LIMIT = 10;
            $DEFAULT_OFFSET = 0;

            $request->validate([
                'id' => 'integer|exists:products,id',
                'search' => 'string|nullable',
                'name' => 'string|exists:products,name',
                'slug' => 'string|exists:products,slug',

                'category_id' => 'integer|exists:categories,id',
                'category_ids' => 'array',
                'category_ids.*' => 'integer|exists:categories,id',

                'variation_option_ids' => 'array',
                'variation_option_ids.*' => 'integer|exists:variation_options,id',

                'brand_id' => 'integer|exists:brands,id',
                'brand_ids' => 'array',
                'brand_ids.*' => 'integer|exists:brands,id',

                'taxonomy' => 'string',
                'taxonomy_ids' => 'array',
                'taxonomy_ids.*' => 'integer|exists:taxonomies,id',

                'web_price_min' => 'integer',
                'web_price_max' => 'integer',
                'pos_price_min' => 'integer',
                'pos_price_max' => 'integer',

                'in_stock' => 'boolean',
                'out_of_stock' => 'boolean',

                'has_web_discount' => 'boolean',
                'has_pos_discount' => 'boolean',

                'newly_arrived' => 'boolean',
                'best_selling' => 'boolean',
                'suggested' => 'boolean',

                'limit' => 'integer|min:0',
                'offset' => 'integer|min:0',
                'sortBy' => 'string|in:web_price_high_low,web_price_low_high,pos_price_high_low,pos_price_low_high,web_discount_high_low,web_discount_low_high,pos_discount_high_low,pos_discount_low_high,name_a_z,name_z_a,added_date_new_old,added_date_old_new',

                "with" => "string|in:category,brand,taxonomies,stocks,all,none,product",
            ]);

            $withQuery = [];
            $withMap = [
                "category" => ["category"],
                "brand" => ["brand"],
                "taxonomies" => ["taxonomies"],
                "product" => ["category", "brand", "taxonomies"],
                "stocks" => ["stocks.variationStocks", "stocks.variationStocks.variationOption", "stocks.variationStocks.variationOption.variation"],
                "all" => ["category", "brand", "taxonomies", "stocks.variationStocks", "stocks.variationStocks.variationOption", "stocks.variationStocks.variationOption.variation"],
                "none" => [],
            ];

            if ($request->has('with')) {
                $withQuery = $withMap[$request->with];
            } else {
                $withQuery = $withMap["all"];
            }


            $products = Product::query()
                ->with($withQuery)
                ->whereHas('stocks', function ($query) {
                    $query->whereRaw('quantity - reserved_quantity > 1');
                })
                ->get()
                ->map(function ($product) {
                    if (isset($product->stocks)) {
                        $filteredStocks = [];

                        foreach ($product->stocks as $stock) {
                            if (!isset($stock->variationStocks) || $stock->variationStocks->isEmpty()) {
                                continue;
                            }

                            $variationOptionId = $stock->variationStocks[0]->variation_option_id ?? null;
                            $isDuplicate = false;

                            foreach ($filteredStocks as $filteredStock) {
                                if (
                                    $filteredStock->variationStocks[0]->variation_option_id ==
                                    $variationOptionId
                                ) {
                                    $isDuplicate = true;
                                    break;
                                }
                            }

                            if (!$isDuplicate) {
                                $filteredStocks[] = $stock;
                            }
                        }

                        $product->setRelation('stocks', collect($filteredStocks));
                    }

                    return $product;
                });

            // Fetch a product by id
            if ($request->has('id')) {
                $product = $products->where('id', $request->id)->first();
                return Response::success($product, 'Successfully fetched product by id');
            }
            if ($request->has('all-products')) {
                $products = Product::with('category', 'brand')->get();
                return Response::success($products, 'Successfully fetched all products');
            }


            if ($request->has('name')) {
                $filteredProducts = $products->filter(function ($product) use ($request) {
                    return stripos($product->name, $request->name) !== false;
                });

                return Response::success($filteredProducts->values()->toArray(), 'Successfully fetched products by name');
            }

            // Fetch products by slug
            if ($request->has('slug')) {
                $filteredProducts = $products->filter(function ($product) use ($request) {
                    return stripos($product->slug, $request->slug) !== false;
                });

                return Response::success($filteredProducts->values()->toArray(), 'Successfully fetched products by slug');
            }
            // Fetch products by category id
            if ($request->has('category_id')) {
                $products = $products->filter(function ($product) use ($request) {
                    return $product->category_id == $request->category_id;
                });
            }


            // Fetch products by category ids
            if ($request->has('category_ids') && count($request->category_ids) > 0) {
                $products = $products->filter(function ($product) use ($request) {
                    return in_array($product->category_id, $request->category_ids);
                });
            }

            // Fetch products by brand id
            if ($request->has('brand_id')) {
                $products = $products->filter(function ($product) use ($request) {
                    return $product->brand_id == $request->brand_id;
                });
            }

            // Fetch products by brand ids
            if ($request->has('brand_ids') && count($request->brand_ids) > 0) {
                $products = $products->filter(function ($product) use ($request) {
                    return in_array($product->brand_id, $request->brand_ids);
                });
            }

            // Fetch products by taxonomy
            if ($request->has('taxonomy')) {
                $taxonomyWords = explode(' ', $request->taxonomy);
                $products = $products->filter(function ($product) use ($taxonomyWords) {
                    foreach ($taxonomyWords as $word) {
                        if ($product->taxonomies->contains('name', 'like', "%$word%")) {
                            return true;
                        }
                    }
                    return false;
                });
            }

            // Fetch products by taxonomy ids
            if ($request->has('taxonomy_ids') && count($request->taxonomy_ids) > 0) {
                $products = $products->filter(function ($product) use ($request) {
                    return $product->taxonomies->pluck('id')->intersect($request->taxonomy_ids)->isNotEmpty();
                });
            }

            // Fetch products by query
            if ($request->has('search')) {
                $words = explode(' ', $request->search);
                $products = $products->filter(function ($product) use ($words) {
                    foreach ($words as $word) {
                        if (
                            stripos($product->name, $word) !== false ||
                            stripos($product->description, $word) !== false ||
                            $product->category && stripos($product->category->name, $word) !== false ||
                            $product->brand && stripos($product->brand->name, $word) !== false ||
                            $product->taxonomies->contains('name', 'like', "%$word%")
                        ) {
                            return true;
                        }
                    }
                    return false;
                });
            }

            // Fetch products by variation option ids
            if ($request->has('variation_option_ids') && count($request->variation_option_ids) > 0) {
                $products = $products->filter(function ($product) use ($request) {
                    return $product->stocks->pluck('variationStocks.*.variation_option_id')->flatten()->intersect($request->variation_option_ids)->isNotEmpty();
                });
            }

            // Fetch products by web price
            if ($request->has('web_price_min') && $request->has('web_price_max')) {
                $products = $products->filter(function ($product) use ($request) {
                    return $product->stocks->contains(function ($stock) use ($request) {
                        return $stock->web_price >= $request->web_price_min && $stock->web_price <= $request->web_price_max;
                    });
                });
            }

            // Fetch products by pos price
            if ($request->has('pos_price_min') && $request->has('pos_price_max')) {
                $products = $products->filter(function ($product) use ($request) {
                    return $product->stocks->contains(function ($stock) use ($request) {
                        return $stock->pos_price >= $request->pos_price_min && $stock->pos_price <= $request->pos_price_max;
                    });
                });
            }

            // In-stock filter
            if ($request->has('in_stock') && $request->in_stock) {
                $products = $products->filter(function ($product) {
                    return $product->stocks->contains(function ($stock) {
                        return $stock->quantity - $stock->reserved_quantity > 0;
                    });
                });
            }

            // Out-of-stock filter
            if ($request->has('out_of_stock') && $request->out_of_stock) {
                $products = $products->filter(function ($product) {
                    return !$product->stocks->contains(function ($stock) {
                        return $stock->quantity - $stock->reserved_quantity > 0;
                    });
                });
            }

            // Has web discount filter
            if ($request->has('has_web_discount') && $request->has_web_discount) {
                $products = $products->filter(function ($product) {
                    return $product->stocks->contains(function ($stock) {
                        return $stock->web_discount > 0;
                    });
                });
            }

            // Has pos discount filter
            if ($request->has('has_pos_discount') && $request->has_pos_discount) {
                $products = $products->filter(function ($product) {
                    return $product->stocks->contains(function ($stock) {
                        return $stock->pos_discount > 0;
                    });
                });
            }

            // Newly arrived filter
            if ($request->has('newly_arrived') && $request->newly_arrived) {
                $products = $products->sortByDesc('created_at')->take(10);
            }

            // Suggested filter
            if ($request->has('suggested') && $request->suggested) {
                $suggestedIds = $products->random(6)->pluck('id');
                $products = $products->filter(function ($product) use ($suggestedIds) {
                    return $suggestedIds->contains($product->id);
                });
            }

            // Best-selling filter
            if ($request->has('best_selling') && $request->best_selling) {
                $productIds = OrderItem::groupBy('product_id')
                    ->orderByRaw('SUM(unit_quantity) DESC')
                    ->limit(6)
                    ->pluck('product_id');
                $products = $products->filter(function ($product) use ($productIds) {
                    return $productIds->contains($product->id);
                });
            }

            // sorting
            if ($request->has('sortBy')) {
                // by price
                $sortBy = $request->sortBy ?? "name_z_a";

                if ($sortBy == "web_price_high_low") {
                    $products->whereHas('stocks', function ($query) use ($request) {
                        $query->orderBy('web_price', "desc");
                    });
                }

                if ($sortBy == "web_price_low_high") {
                    $products->whereHas('stocks', function ($query) use ($request) {
                        $query->orderBy('web_price', "asc");
                    });
                }

                if ($sortBy == "pos_price_high_low") {
                    $products->whereHas('stocks', function ($query) use ($request) {
                        $query->orderBy('pos_price', "desc");
                    });
                }

                if ($sortBy == "pos_price_low_high") {
                    $products->whereHas('stocks', function ($query) use ($request) {
                        $query->orderBy('pos_price', "asc");
                    });
                }

                if ($sortBy == "web_discount_high_low") {
                    $products->whereHas('stocks', function ($query) use ($request) {
                        $query->orderBy('web_discount', "desc");
                    });
                }

                if ($sortBy == "web_discount_low_high") {
                    $products->whereHas('stocks', function ($query) use ($request) {
                        $query->orderBy('web_discount', "asc");
                    });
                }
                $products->whereHas('stocks', function ($query) use ($request) {
                    $query->orderBy('web_price', ($request->sort_by_web_price ?? "high_low") ? "asc" : "desc");
                });

                if ($sortBy == "pos_discount_high_low") {
                    $products->whereHas('stocks', function ($query) use ($request) {
                        $query->orderBy('pos_discount', "desc");
                    });
                }

                if ($sortBy == "pos_discount_low_high") {
                    $products->whereHas('stocks', function ($query) use ($request) {
                        $query->orderBy('pos_discount', "asc");
                    });
                }

                if ($sortBy == "name_a_z") {
                    $products->orderBy('name', "asc");
                }

                if ($sortBy == "name_z_a") {
                    $products->orderBy('name', "desc");
                }

                if ($sortBy == "added_date_new_old") {
                    $products->orderBy('created_at', "desc");
                }

                if ($sortBy == "added_date_old_new") {
                    $products->orderBy('created_at', "asc");
                }
            }

            // Fetch all products
                       $response = $products->values()->toArray(); // Ensure the collection is converted to a plain array
            
            return Response::success($response, "Successfully fetched " . count($response) . " products");
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                'status' => 'error',
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:products,name',
            'slug' => 'string|max:255|unique:products,slug',
            'description' => 'required|string|max:512',
            'category_id' => 'required|integer|exists:categories,id',
            'brand_id' => 'required|integer|exists:brands,id',
            'primary_image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',

            'web_availability' => 'string|max:255',
        ]);

        // validate image 
        if (!$request->hasFile('primary_image')) {
            return Response::error("Image is required");
        }

        $slug = $validated['slug'] ?? Str::slug($validated['name']);

        try {
            // save image to storage
            $imageFile = $request->file('primary_image');
            $fileName = $slug . '.' . $imageFile->extension();
            $imageFile = Storage::disk('products')->putFileAs('/', $imageFile, $fileName);

            // save product in DB
            $product = new Product();
            $product->name = $validated['name'];
            $product->slug = $slug;
            $product->description = $validated['description'];
            $product->category_id = (int) $validated['category_id'];
            $product->brand_id = (int) $validated['brand_id'];
            $product->primary_image = "storage/images/products/$imageFile";

            $product->web_availability = $validated['web_availability'] ?? null;
            $product->save();

            return Response::success($product, 'Product created successfully');
        } catch (\Exception $e) {
            return Response::error($e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'id' => 'required|integer|exists:products,id',
            'name' => 'string|max:255|unique:products,name',
            'slug' => 'string|max:255|unique:products,slug',
            'description' => 'string|max:512',
            'category_id' => 'integer|exists:categories,id',
            'brand_id' => 'integer|exists:brands,id',
            'primary_image' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $product = Product::find($validated['id']);

        if ($request->has('name')) {
            $product->name = $request->name;
        }

        if ($request->has('slug')) {
            $product->slug = $request->slug;
        }

        if ($request->has('description')) {
            $product->description = $request->description;
        }

        if ($request->has('category_id')) {
            $product->category_id = (int) $request->category_id;
        }

        if ($request->has('brand_id')) {
            $product->brand_id = (int) $request->brand_id;
        }

        if ($request->hasFile('primary_image')) {

            // delete old image
            $oldImage = $product->primary_image; // ex: storage/images/products/slug.jpg
            $fileName = basename($oldImage);
            if (Storage::disk('products')->delete($fileName)) {
                Log::info("Old image deleted successfully");
            }

            // save new image
            $imageFile = $request->file('primary_image');
            $fileName = $product->slug . '.' . $imageFile->extension();
            $imageFile = Storage::disk('products')->putFileAs('/', $imageFile, $fileName);
            $product->primary_image = "storage/images/products/$imageFile";
        }

        $product->save();

        return Response::success($product, 'Product updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer|exists:products,id',
        ]);

        $product = Product::find($validated['id']);
        $product->delete();
        return Response::success($product, 'Product deleted successfully');
    }





    public function multipleStockHandler()
    {
        // Load all products with their stocks and variation stocks
        $products = Product::with('stocks.variationStocks')->get();

        // Filter products that have stocks with the same variation_option_id
        $filteredProducts = $products->filter(function ($product) {
            $variationOptionIds = [];

            foreach ($product->stocks as $stock) {
                foreach ($stock->variationStocks as $variationStock) {
                    $variationOptionIds[] = $variationStock->variation_option_id;
                }
            }

            // Check if there are duplicate variation_option_ids
            return count($variationOptionIds) !== count(array_unique($variationOptionIds));
        });

        //return $filteredProducts;

        // Further filter products where the first stock's quantity is less than 13
        $finalFilteredProducts = $filteredProducts->filter(function ($product) {
            return $product->stocks->isNotEmpty() && $product->stocks->first()->quantity < 5;
        });



        // Process each product in the final filtered list
        $finalFilteredProducts->each(function ($product) {
            $stocks = $product->stocks;

            if ($stocks->count() > 1) {
                // Get the first stock and its quantity
                $firstStock = $stocks->first();
                $firstStockQuantity = $firstStock->quantity;

                // Get the second stock
                $secondStock = $stocks->get(1);

                // Add the first stock's quantity to the second stock's quantity
                $secondStock->quantity += $firstStockQuantity;
                $secondStock->save();

                // Delete the first stock
                $firstStock->delete();
            }
        });

        return response()->json(['message' => 'Stocks updated successfully'], 200);
    }

    public function tempProduct()
    {
        try {
            // Load all products with their stocks and variation stocks
            $products = Product::with('stocks.variationStocks')
                ->whereHas('stocks', function ($query) {
                    $query->whereRaw('quantity - reserved_quantity > 1');
                })->get();

            // Filter and process the products
            $filteredProducts = $products->map(function ($product) {
                if (isset($product->stocks)) {
                    $filteredStocks = [];

                    foreach ($product->stocks as $stock) {
                        if (!isset($stock->variationStocks) || $stock->variationStocks->isEmpty()) {
                            continue;
                        }

                        $variationOptionId = $stock->variationStocks[0]->variation_option_id ?? null;
                        $isDuplicate = false;

                        foreach ($filteredStocks as $filteredStock) {
                            if (
                                $filteredStock->variationStocks[0]->variation_option_id ==
                                $variationOptionId
                            ) {
                                $isDuplicate = true;
                                break;
                            }
                        }

                        if (!$isDuplicate) {
                            $filteredStocks[] = $stock;
                        }
                    }

                    $product->setRelation('stocks', collect($filteredStocks));
                }

                return $product->toArray(); // Convert product to array
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Successfully fetched ' . $filteredProducts->count() . ' products',
                'data' => $filteredProducts->toArray() // Convert collection to array
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    // public function tempProduct(Request $request)
    // {
    //     $withQuery = [];
    //     $withMap = [
    //         "category" => ["category"],
    //         "brand" => ["brand"],
    //         "taxonomies" => ["taxonomies"],
    //         "product" => ["category", "brand", "taxonomies"],
    //         "stocks" => [
    //             "stocks.variationStocks",
    //             "stocks.variationStocks.variationOption",
    //             "stocks.variationStocks.variationOption.variation"
    //         ],
    //         "all" => [
    //             "category",
    //             "brand",
    //             "taxonomies",
    //             "stocks.variationStocks",
    //             "stocks.variationStocks.variationOption",
    //             "stocks.variationStocks.variationOption.variation"
    //         ],
    //         "none" => [],
    //     ];

    //     if ($request->has('with') && isset($withMap[$request->with])) {
    //         $withQuery = $withMap[$request->with];
    //     } else {
    //         $withQuery = $withMap["all"];
    //     }

    //     $products = Product::all();

    //     try {
    //         $filteredProducts = $products->get()->map(function ($product) {
    //             if (isset($product->stocks)) {
    //                 $filteredStocks = [];

    //                 foreach ($product->stocks as $stock) {
    //                     if (!isset($stock->variationStocks) || $stock->variationStocks->isEmpty()) {
    //                         continue;
    //                     }

    //                     $variationOptionId = $stock->variationStocks[0]->variation_option_id ?? null;
    //                     $isDuplicate = false;

    //                     foreach ($filteredStocks as $filteredStock) {
    //                         if (
    //                             $filteredStock->variationStocks[0]->variation_option_id ==
    //                             $variationOptionId
    //                         ) {
    //                             $isDuplicate = true;
    //                             break;
    //                         }
    //                     }

    //                     if (!$isDuplicate) {
    //                         $filteredStocks[] = $stock;
    //                     }
    //                 }

    //                 $product->setRelation('stocks', collect($filteredStocks));
    //             }

    //             return $product->toArray(); // Convert product to array
    //         });

    //         return response()->json([
    //             'status' => 'success',
    //             'message' => 'Successfully fetched ' . $filteredProducts->count() . ' products',
    //             'data' => $filteredProducts->toArray() // Convert collection to array
    //         ]);
    //     } catch (\Throwable $th) {
    //         return response()->json([
    //             'status' => 'error',
    //             'message' => $th->getMessage(),
    //         ], 500);
    //     }
    // }
}
