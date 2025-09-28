import { NextRequest, NextResponse } from "next/server";
import { db } from "@/common/lib/db";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const order = await db.order.findUnique({
      where: { id: String((await params).id) },
      include: { productDetails: { include: { product: true } }, user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 750]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 700;
    const lineHeight = 20;

    // --- Title ---
    page.drawText("RECEIPT", { x: 240, y, size: 26, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
    y -= 50;

    // --- Order Details Block ---
    const detailsLines = 4;
    const detailsPadding = 20;
    const detailsHeight = detailsLines * lineHeight + detailsPadding;
    const detailsTopY = y;
    const detailsBottomY = y - detailsHeight;

    page.drawRectangle({
      x: 40,
      y: detailsBottomY,
      width: 520,
      height: detailsHeight,
      color: rgb(0.95, 0.95, 0.98),
      borderColor: rgb(0.8, 0.8, 0.9),
      borderWidth: 1,
    });

    let detailsY = detailsTopY - 15;
    page.drawText("Order Details", { x: 50, y: detailsY, size: 14, font: boldFont, color: rgb(0.2,0.2,0.4) });
    detailsY -= lineHeight;
    page.drawText(`Order ID: ${order.id}`, { x: 50, y: detailsY, size: 12, font }); detailsY -= lineHeight;
    page.drawText(`Customer: ${order.user?.name || "Unknown"}`, { x: 50, y: detailsY, size: 12, font }); detailsY -= lineHeight;
    page.drawText(`Email: ${order.user?.email || "N/A"}`, { x: 50, y: detailsY, size: 12, font }); detailsY -= lineHeight;
    page.drawText(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { x: 50, y: detailsY, size: 12, font });

    y = detailsBottomY - 50; // add spacing before table

    // --- Table Header ---
    const tableX = 50;
    const tableWidth = 500;
    const colWidths = [300, 80, 120]; // Product, Qty, Price
    const headerHeight = 30;

    page.drawRectangle({
      x: tableX,
      y: y - headerHeight + 5,
      width: tableWidth,
      height: headerHeight,
      color: rgb(0.9, 0.9, 0.9),
    });

    page.drawText("Products", { x: tableX, y: y + 15, size: 14, font: boldFont, color: rgb(0.2,0.2,0.4) });
    page.drawText("Product", { x: tableX + 10, y: y - 10, size: 12, font: boldFont });
    page.drawText("Qty", { x: tableX + colWidths[0] + 10, y: y - 10, size: 12, font: boldFont });
    page.drawText("Price", { x: tableX + colWidths[0] + colWidths[1] + 10, y: y - 10, size: 12, font: boldFont });
    y -= headerHeight + 5;

    // --- Table Rows ---
    const rowHeight = 22;
    order.productDetails.forEach((item) => {
      page.drawText(item.product.productName ?? '', { x: tableX + 10, y: y - 15, size: 11, font });
      page.drawText(String(item.quantity), { x: tableX + colWidths[0] + 10, y: y - 15, size: 11, font });
      page.drawText(`KES ${item.product.price}`, { x: tableX + colWidths[0] + colWidths[1] + 10, y: y - 15, size: 11, font });
      y -= rowHeight;
    });
    // --- Total Section ---
    y -= 15;
    page.drawRectangle({
      x: tableX,
      y: y - headerHeight + 5,
      width: tableWidth,
      height: headerHeight,
      color: rgb(0.95, 0.95, 0.95),
    });
    page.drawText("Total:", { x: tableX + colWidths[0] + 10, y: y - 10, size: 14, font: boldFont });
    page.drawText(`KES ${order.totalAmount}`, { x: tableX + colWidths[0] + colWidths[1] + 10, y: y - 10, size: 14, font: boldFont });

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=receipt-${order.id}.pdf`,
      },
    });
  } catch (error) {
    console.error("[RECEIPT_ERROR]", error);
    return NextResponse.json({ error: "Failed to generate receipt" }, { status: 500 });
  }
}
