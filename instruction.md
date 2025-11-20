import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PaymentMethod } from "@prisma/client";

export async function POST(request) {
  try {
    const { userId, has} = getAuth(request)
    
    if(!userId){
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { addressId, items, couponCode, paymentMethod } = await request.json();
    
    if(!addressId || !items || !Array.isArray(items) || !paymentMethod || items.length < 1){
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    let coupon = null;

    if(couponCode){
      coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if(!coupon){
        return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
      }
    }

    // kelompokkan order berdasarkan storeId
    const ordersByStore = new Map()

    for(const item of items){
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      const storeId = product.storeId;
      if(!ordersByStore.has(storeId)){
        ordersByStore.set(storeId, []);
      }
      ordersByStore.get(storeId).push({ ...item, price: product.price });
    }

    let orderIds = [];
    let fullAmount = 0;

    // let isShippingFeeAdded = false;

    // membuat order untuk setiap seller
    for(const [storeId, sellerItems] of ordersByStore.entries()){
      let total = sellerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

      if(couponCode){
        total -= (total * coupon.discount) / 100;
      }

      // if(!isShippingFeeAdded){
      //   total += 15000; // tambahkan ongkir hanya sekali per order
      //   isShippingFeeAdded = true;
      // }

      fullAmount += parseFloat(total.toFixed(2));

      const order = await prisma.order.create({
        data: {
          userId,
          storeId,
          addressId,
          total: parseFloat(total.toFixed(2)),
          paymentMethod,
          isCouponUsed: coupon ? true : false,
          coupon: coupon ? coupon : {},
          orderItems: {
            create: sellerItems.map(item => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price
            }))
          }
        }
      })
      orderIds.push(order.id);
    }

    // kosongkan cart user setelah order
    await prisma.user.update({
      where: { id: userId },
      data: { cart: {} }
    })

    return NextResponse.json({ message: "Order placed successfully"});

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  } 
}

// ambil semua orderan user
export async function GET(request) {
  try {
    const { userId } = getAuth(request)
    const orders = await prisma.order.findMany({
      where: { userId, OR: [
        { paymentMethod: PaymentMethod.COD },
        { paymentMethod: PaymentMethod.BANK_TRANSFER }
      ] },
      include: { 
        orderItems: {include: {product: true}},
        address: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ orders });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}

Invalid `prisma.product.findUnique()` invocation: { where: { id: undefined, ? sku?: String, ? barcode?: String, ? AND?: ProductWhereInput | ProductWhereInput[], ? OR?: ProductWhereInput[], ? NOT?: ProductWhereInput | ProductWhereInput[], ? name?: StringFilter | String, ? description?: StringFilter | String, ? mrp?: FloatFilter | Float, ? price?: FloatFilter | Float, ? images?: StringNullableListFilter, ? categoryId?: StringNullableFilter | String | Null, ? inStock?: BoolFilter | Boolean, ? storeId?: StringFilter | String, ? createdAt?: DateTimeFilter | DateTime, ? updatedAt?: DateTimeFilter | DateTime, ? stock?: IntFilter | Int, ? minStock?: IntNullableFilter | Int | Null, ? weight?: StringNullableFilter | String | Null, ? dimensions?: StringNullableFilter | String | Null, ? model?: StringNullableFilter | String | Null, ? additionalInfo?: StringNullableFilter | String | Null, ? status?: StringFilter | String, ? shippingWeight?: StringNullableFilter | String | Null, ? shippingLength?: StringNullableFilter | String | Null, ? shippingWidth?: StringNullableFilter | String | Null, ? shippingHeight?: StringNullableFilter | String | Null, ? warranty?: StringNullableFilter | String | Null, ? returnPolicy?: StringNullableFilter | String | Null, ? tags?: StringNullableFilter | String | Null, ? metaTitle?: StringNullableFilter | String | Null, ? metaDescription?: StringNullableFilter | String | Null, ? variants?: ProductVariantListRelationFilter, ? store?: StoreScalarRelationFilter | StoreWhereInput, ? category?: CategoryNullableScalarRelationFilter | CategoryWhereInput | Null, ? orderItems?: OrderItemListRelationFilter, ? rating?: RatingListRelationFilter, ? wishlists?: WishlistListRelationFilter } } Argument `where` of type ProductWhereUniqueInput needs at least one of `id`, `sku` or `barcode` arguments. Available options are marked with ?.