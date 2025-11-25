import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import imageKit from '@/configs/imageKit';

// Public endpoint to submit a customer report/complaint
export async function POST(request) {
  try {
    // Determine content type: support JSON body or multipart/form-data with files
    const contentType = request.headers.get('content-type') || '';

    let payload = null;
    let attachmentsUrls = [];

    if (contentType.includes('multipart/form-data')) {
      // parse form data (files + fields)
      const formData = await request.formData();
      payload = Object.fromEntries(formData.entries());

      // attachments may be sent as `attachments` fields (multiple) or `images`
      const files = formData.getAll('attachments').length ? formData.getAll('attachments') : formData.getAll('images');

      if (files && files.length) {
        attachmentsUrls = await Promise.all(files.map(async (file) => {
          try {
            const buffer = Buffer.from(await file.arrayBuffer());
            const response = await imageKit.upload({
              file: buffer,
              fileName: file.name || `report-${Date.now()}`,
              folder: 'reports',
            });

            const url = imageKit.url({
              path: response.filePath,
              transformation: [
                { quality: 'auto' },
                { format: 'webp' },
                { height: '1024' }
              ]
            });

            return url;
          } catch (uploadErr) {
            console.error('ImageKit upload failed for report attachment:', uploadErr);
            return null;
          }
        }));

        // filter out failed uploads
        attachmentsUrls = attachmentsUrls.filter(Boolean);
      }
    } else {
      // JSON body
      payload = await request.json();
      attachmentsUrls = Array.isArray(payload.attachments) ? payload.attachments : [];
    }

    // Require authenticated reporter; store reporterId (reference to User)
    const { userId } = getAuth(request);
    if (!userId) return NextResponse.json({ error: 'Authentication required to submit report' }, { status: 401 });

    // Infer reportType and populate target fields. Require productId or storeId (enum only PRODUCT/STORE)
    let targetId = '';
    let inferredType = null;

    if (payload.productId) {
      const product = await prisma.product.findUnique({ where: { id: payload.productId } });
      if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      inferredType = 'PRODUCT';
      targetId = product.id;
    } else if (payload.storeId) {
      const store = await prisma.store.findUnique({ where: { id: payload.storeId } });
      if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });
      inferredType = 'STORE';
      targetId = store.id;
    } else {
      return NextResponse.json({ error: 'report must target a productId or storeId' }, { status: 400 });
    }

    // minimal validation: require core fields
    const required = ['subject', 'message'];
    for (const k of required) {
      if (!payload[k]) return NextResponse.json({ error: `Missing field ${k}` }, { status: 400 });
    }

    // reporterId is taken from Clerk auth
    const reporterId = userId;

    // suggestedPriority (optional) from user: accept values low/medium/high/urgent (case-insensitive)
    let suggestedPriority = null;
    if (payload.suggestedPriority) {
      const up = String(payload.suggestedPriority).toUpperCase();
      if (['LOW','MEDIUM','HIGH','URGENT'].includes(up)) suggestedPriority = up;
    }

    // Determine initial priority: prefer suggestedPriority if present, otherwise MEDIUM
    const initialPriority = suggestedPriority || 'MEDIUM';

    const created = await prisma.report.create({ data: {
      reporterId,
      // reportType is Prisma enum: PRODUCT | STORE
      reportType: inferredType,
      targetId,
      subject: payload.subject,
      message: payload.message,
      suggestedPriority: suggestedPriority,
      priority: initialPriority,
      // status is an enum ReportStatus - public submissions always start as NEW
      status: 'NEW',
      category: payload.category || null,
      attachments: attachmentsUrls,
    } });

    return NextResponse.json({ report: created }, { status: 201 });
  } catch (error) {
    console.error('POST /api/reports error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create report' }, { status: 500 });
  }
}