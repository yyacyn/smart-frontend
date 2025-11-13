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

Invalid `prisma.order.create()` invocation: { data: { userId: "user_34m1L9XTTchJBBDRaLWqfZfavpp", storeId: "cmhrvolqx0001jv04iub3yrcs", addressId: "cmhxipsjb0001l5046h3rzcox", total: 8888, paymentMethod: "BANK_TRANSFER", ~~~~~~~~~~~~~~~ isCouponUsed: false, coupon: {}, orderItems: { create: [ { productId: "cmhrvssqz0001k304v86fu1zm", quantity: 1, price: 8888 } ] } } } Invalid value for argument `paymentMethod`. Expected PaymentMethod.