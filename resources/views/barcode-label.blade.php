<!-- filepath: c:\xampp\htdocs\My Project\IY-Mart-BE\resources\views\barcode-label.blade.php -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Barcodes</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }
        .label-sheet {
            width: 100%;
            border-collapse: collapse;
        }
        .label {
            width: 33.33%; /* 3 labels per row */
            height: 100px;
            border: 1px solid #ccc;
            padding: 10px;
            text-align: center;
            vertical-align: top;
            box-sizing: border-box;
        }
        .product-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .product-price {
            font-size: 12px;
            margin-bottom: 10px;
        }
        .barcode img {
            width: 100%;
            height: auto;
        }
    </style>
</head>
<body>
    <table class="label-sheet">
        <tr>
            @for ($i = 0; $i < $barcodeData['quantity']; $i++)
                <td class="label">
                    <div class="product-name">{{ $barcodeData['product_name'] }} {{ $barcodeData['price'] }}
                        @if($barcodeData['price'] != '')
                        &#165;
                        @endif
                        
                    </div>
                    <div class="product-price"></div>
                    <div class="barcode">
                        <img src="data:image/png;base64,{{ $barcode }}" alt="Barcode">
                    </div>
                </td>
                @if (($i + 1) % 3 == 0) <!-- Start a new row after every 3 labels -->
                    </tr><tr>
                @endif
            @endfor
        </tr>
    </table>
</body>
</html>