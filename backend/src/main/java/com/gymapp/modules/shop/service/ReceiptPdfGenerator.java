package com.gymapp.modules.shop.service;

import com.gymapp.modules.shop.ShopOrder;
import com.gymapp.modules.shop.entity.OrderItem;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Slf4j
@Service
public class ReceiptPdfGenerator {

    private static final float RECEIPT_WIDTH  = 226.77f;
    private static final float RECEIPT_HEIGHT = 700f;
    private static final BaseColor GOLD       = new BaseColor(245, 158, 11);
    private static final BaseColor DARK       = new BaseColor(8, 13, 22);
    private static final BaseColor MUTED      = new BaseColor(100, 116, 139);
    private static final BaseColor WHITE_BG   = new BaseColor(255, 255, 255);
    private static final BaseColor ROW_BG     = new BaseColor(248, 250, 252);

    private static final Font TITLE_FONT  = new Font(Font.FontFamily.HELVETICA, 9,  Font.BOLD,   GOLD);
    private static final Font LABEL_FONT  = new Font(Font.FontFamily.HELVETICA, 7,  Font.BOLD,   MUTED);
    private static final Font VALUE_FONT  = new Font(Font.FontFamily.HELVETICA, 7,  Font.NORMAL, DARK);
    private static final Font HEAD_FONT   = new Font(Font.FontFamily.HELVETICA, 6,  Font.BOLD,   GOLD);
    private static final Font CELL_FONT   = new Font(Font.FontFamily.HELVETICA, 6,  Font.NORMAL, DARK);
    private static final Font TOTAL_FONT  = new Font(Font.FontFamily.HELVETICA, 9,  Font.BOLD,   GOLD);
    private static final Font FOOTER_FONT = new Font(Font.FontFamily.HELVETICA, 6,  Font.ITALIC, MUTED);

    private static final NumberFormat FMT;
    static {
        FMT = NumberFormat.getInstance(Locale.US);
        FMT.setGroupingUsed(true);
    }

    public byte[] generate(ShopOrder order) throws Exception {
        Rectangle receiptSize = new Rectangle(RECEIPT_WIDTH, RECEIPT_HEIGHT);
        Document doc = new Document(receiptSize, 8, 8, 10, 10);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter.getInstance(doc, baos);
        doc.open();

        // ── Gym name ──────────────────────────────────────────
        Paragraph gymName = new Paragraph("POWERHOUSE GYM", TITLE_FONT);
        gymName.setAlignment(Element.ALIGN_CENTER);
        doc.add(gymName);

        Paragraph subTitle = new Paragraph("SHOP RECEIPT", LABEL_FONT);
        subTitle.setAlignment(Element.ALIGN_CENTER);
        subTitle.setSpacingAfter(6);
        doc.add(subTitle);

        addDivider(doc);

        // ── Order meta ────────────────────────────────────────
        addInfoRow(doc, "Order #", order.getOrderNumber());
        addInfoRow(doc, "Date",
            order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        addInfoRow(doc, "Payment", order.getPaymentMethod().name());
        if (order.getCreatedBy() != null) addInfoRow(doc, "Cashier", order.getCreatedBy());

        addDivider(doc);

        // ── Items table ───────────────────────────────────────
        Paragraph itemsHeader = new Paragraph("ITEMS", HEAD_FONT);
        itemsHeader.setSpacingAfter(3);
        doc.add(itemsHeader);

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{4f, 1f, 2f, 2f});
        addTableHeader(table, "Item");
        addTableHeader(table, "Qty");
        addTableHeader(table, "Price");
        addTableHeader(table, "Total");

        boolean alt = false;
        for (OrderItem item : order.getItems()) {
            BaseColor bg = alt ? ROW_BG : WHITE_BG;
            addTableCell(table, truncate(item.getProductName(), 22), bg, Element.ALIGN_LEFT);
            addTableCell(table, String.valueOf(item.getQuantity()), bg, Element.ALIGN_CENTER);
            addTableCell(table, fmt(item.getUnitPriceLkr()), bg, Element.ALIGN_RIGHT);
            addTableCell(table, fmt(item.getTotalLkr()), bg, Element.ALIGN_RIGHT);
            alt = !alt;
        }
        doc.add(table);

        addDivider(doc);

        // ── Totals ─────────────────────────────────────────────
        addInfoRow(doc, "Subtotal", fmt(order.getSubtotalLkr()));
        if (order.getDiscountLkr() != null && order.getDiscountLkr() > 0)
            addInfoRow(doc, "Discount", "- " + fmt(order.getDiscountLkr()));
        if (order.getTaxLkr() != null && order.getTaxLkr() > 0)
            addInfoRow(doc, "Tax", fmt(order.getTaxLkr()));

        addDivider(doc);

        Paragraph total = new Paragraph("TOTAL  " + fmt(order.getTotalLkr()), TOTAL_FONT);
        total.setAlignment(Element.ALIGN_CENTER);
        total.setSpacingBefore(3);
        total.setSpacingAfter(4);
        doc.add(total);

        addDivider(doc);

        Paragraph thanks = new Paragraph("Thank you for your purchase!", FOOTER_FONT);
        thanks.setAlignment(Element.ALIGN_CENTER);
        thanks.setSpacingBefore(6);
        doc.add(thanks);

        doc.close();
        return baos.toByteArray();
    }

    private void addDivider(Document doc) throws DocumentException {
        Paragraph p = new Paragraph("- - - - - - - - - - - - - - - - - - - - - - -", FOOTER_FONT);
        p.setAlignment(Element.ALIGN_CENTER);
        p.setSpacingBefore(3);
        p.setSpacingAfter(3);
        doc.add(p);
    }

    private void addInfoRow(Document doc, String label, String value) throws DocumentException {
        PdfPTable row = new PdfPTable(2);
        row.setWidthPercentage(100);
        row.setWidths(new float[]{1f, 1.5f});
        row.setSpacingAfter(1);
        PdfPCell l = new PdfPCell(new Phrase(label, LABEL_FONT));
        l.setBorder(Rectangle.NO_BORDER);
        l.setPadding(2);
        row.addCell(l);
        PdfPCell v = new PdfPCell(new Phrase(value, VALUE_FONT));
        v.setBorder(Rectangle.NO_BORDER);
        v.setPadding(2);
        v.setHorizontalAlignment(Element.ALIGN_RIGHT);
        row.addCell(v);
        doc.add(row);
    }

    private void addTableHeader(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, HEAD_FONT));
        cell.setBackgroundColor(DARK);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(3);
        cell.setHorizontalAlignment(text.equals("Item") ? Element.ALIGN_LEFT : Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private void addTableCell(PdfPTable table, String text, BaseColor bg, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text, CELL_FONT));
        cell.setBackgroundColor(bg);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(3);
        cell.setHorizontalAlignment(align);
        table.addCell(cell);
    }

    private String fmt(Long lkr) {
        if (lkr == null) return "Rs. 0";
        return "Rs. " + FMT.format(lkr);
    }

    private String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() > max ? s.substring(0, max - 1) + "." : s;
    }
}
