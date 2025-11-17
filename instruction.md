import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// POST /api/wishlist -> add product to wishlist for current user
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId } = await request.json();
    if (!productId) return NextResponse.json({ error: "productId is required" }, { status: 400 });

    // Upsert-like: prevent duplicates
    const exists = await prisma.wishlist.findFirst({ where: { userId, productId } });
    if (exists) return NextResponse.json({ message: "Already in wishlist" }, { status: 200 });

    const item = await prisma.wishlist.create({
      data: { userId, productId },
      include: { product: true },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST /api/wishlist error:", error);
    return NextResponse.json({ error: error?.message || "Failed to add to wishlist" }, { status: 500 });
  }
}

// GET /api/wishlist -> list wishlist items for current user
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const items = await prisma.wishlist.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/wishlist error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch wishlist" }, { status: 500 });
  }
}

// DELETE /api/wishlist -> remove a product from wishlist for current user
export async function DELETE(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId } = await request.json();
    if (!productId) return NextResponse.json({ error: "productId is required" }, { status: 400 });

    await prisma.wishlist.deleteMany({ where: { userId, productId } });
    return NextResponse.json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error("DELETE /api/wishlist error:", error);
    return NextResponse.json({ error: error?.message || "Failed to remove from wishlist" }, { status: 500 });
  }
} 