package com.gymapp.modules.billing;

import com.gymapp.modules.billing.dto.InvoiceDTO;
import com.gymapp.modules.billing.dto.PaymentItemDTO;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.itextpdf.text.pdf.draw.LineSeparator;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Component
public class InvoicePdfGenerator {

    private static final Font TITLE_FONT   = new Font(Font.FontFamily.HELVETICA, 22, Font.BOLD,   new BaseColor(30, 41, 59));
    private static final Font HEADER_FONT  = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD,   BaseColor.WHITE);
    private static final Font BODY_FONT    = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, new BaseColor(51, 65, 85));
    private static final Font SMALL_FONT   = new Font(Font.FontFamily.HELVETICA,  8, Font.NORMAL, new BaseColor(100,116,139));
    private static final Font BOLD_FONT    = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD,   new BaseColor(30, 41, 59));
    private static final Font TOTAL_FONT   = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD,   new BaseColor(16, 185, 129));
    private static final BaseColor ACCENT  = new BaseColor(16, 185, 129);
    private static final BaseColor HEADER_BG = new BaseColor(30, 41, 59);
    private static final BaseColor ROW_ALT = new BaseColor(248, 250, 252);

    public byte[] generate(InvoiceDTO inv) throws Exception {
        Document doc = new Document(PageSize.A4, 40, 40, 50, 50);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = PdfWriter.getInstance(doc, baos);
        doc.open();

        addHeader(doc, inv);
        addDivider(doc);
        addBillingInfo(doc, inv);
        doc.add(Chunk.NEWLINE);
        addItemsTable(doc, inv);
        doc.add(Chunk.NEWLINE);
        addTotalsTable(doc, inv);
        doc.add(Chunk.NEWLINE);
        if (inv.notes() != null)    addNotes(doc, "Notes", inv.notes());
        if (inv.footerText() != null) addNotes(doc, "Terms", inv.footerText());
        addFooter(doc);

        doc.close();
        return baos.toByteArray();
    }

    private void addHeader(Document doc, InvoiceDTO inv) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1.5f, 1f});

        PdfPCell left = new PdfPCell();
        left.setBorder(Rectangle.NO_BORDER);
        left.setPaddingBottom(10);

        String gymName = inv.gymName() != null ? inv.gymName() : "PowerHouse Gym";
        Paragraph gymTitle = new Paragraph(gymName, TITLE_FONT);
        left.addElement(gymTitle);

        if (inv.gymAddress() != null) {
            left.addElement(new Paragraph(inv.gymAddress(), SMALL_FONT));
        }
        if (inv.gymPhone() != null) {
            left.addElement(new Paragraph(inv.gymPhone(), SMALL_FONT));
        }
        if (inv.gymTaxNo() != null) {
            left.addElement(new Paragraph("Tax Reg: " + inv.gymTaxNo(), SMALL_FONT));
        }
        table.addCell(left);

        PdfPCell right = new PdfPCell();
        right.setBorder(Rectangle.NO_BORDER);
        right.setHorizontalAlignment(Element.ALIGN_RIGHT);
        right.setPaddingBottom(10);

        Paragraph invLabel = new Paragraph("INVOICE", new Font(Font.FontFamily.HELVETICA, 20, Font.BOLD, ACCENT));
        invLabel.setAlignment(Element.ALIGN_RIGHT);
        right.addElement(invLabel);

        right.addElement(new Paragraph("# " + inv.invoiceNumber(),
                new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, new BaseColor(30, 41, 59))));

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy");
        right.addElement(new Paragraph("Issued: " + inv.issuedAt().format(fmt), SMALL_FONT));
        if (inv.dueDate() != null) {
            right.addElement(new Paragraph("Due: " + inv.dueDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy")), SMALL_FONT));
        }
        table.addCell(right);

        doc.add(table);
    }

    private void addDivider(Document doc) throws DocumentException {
        LineSeparator ls = new LineSeparator();
        ls.setLineWidth(1f);
        ls.setLineColor(ACCENT);
        doc.add(new Paragraph("\n"));
        doc.add(new Chunk(ls));
        doc.add(new Paragraph("\n"));
    }

    private void addBillingInfo(Document doc, InvoiceDTO inv) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1f, 1f});

        PdfPCell billTo = new PdfPCell();
        billTo.setBorder(Rectangle.NO_BORDER);
        billTo.addElement(new Paragraph("BILL TO", new Font(Font.FontFamily.HELVETICA, 8, Font.BOLD, new BaseColor(148,163,184))));
        if (inv.memberName() != null) billTo.addElement(new Paragraph(inv.memberName(), BOLD_FONT));
        if (inv.memberPhone() != null) billTo.addElement(new Paragraph(inv.memberPhone(), SMALL_FONT));
        if (inv.memberNic() != null)   billTo.addElement(new Paragraph("NIC: " + inv.memberNic(), SMALL_FONT));
        if (inv.memberAddress() != null) billTo.addElement(new Paragraph(inv.memberAddress(), SMALL_FONT));
        table.addCell(billTo);

        PdfPCell blank = new PdfPCell();
        blank.setBorder(Rectangle.NO_BORDER);
        table.addCell(blank);

        doc.add(table);
    }

    private void addItemsTable(Document doc, InvoiceDTO inv) throws DocumentException {
        if (inv.items() == null || inv.items().isEmpty()) return;

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{4f, 1f, 1.5f, 1.5f});

        for (String header : new String[]{"Description", "Qty", "Unit Price (LKR)", "Total (LKR)"}) {
            PdfPCell cell = new PdfPCell(new Phrase(header, HEADER_FONT));
            cell.setBackgroundColor(HEADER_BG);
            cell.setPadding(8);
            cell.setBorder(Rectangle.NO_BORDER);
            cell.setHorizontalAlignment(header.equals("Description") ? Element.ALIGN_LEFT : Element.ALIGN_RIGHT);
            table.addCell(cell);
        }

        boolean alt = false;
        for (PaymentItemDTO item : inv.items()) {
            BaseColor bg = alt ? ROW_ALT : BaseColor.WHITE;
            addRow(table, item.description(), bg, Element.ALIGN_LEFT, BODY_FONT);
            addRow(table, String.valueOf(item.quantity()), bg, Element.ALIGN_RIGHT, BODY_FONT);
            addRow(table, formatAmount(item.unitPriceLkr()), bg, Element.ALIGN_RIGHT, BODY_FONT);
            addRow(table, formatAmount(item.totalLkr()), bg, Element.ALIGN_RIGHT, BODY_FONT);
            alt = !alt;
        }
        doc.add(table);
    }

    private void addRow(PdfPTable table, String text, BaseColor bg, int align, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setPadding(7);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(align);
        table.addCell(cell);
    }

    private void addTotalsTable(Document doc, InvoiceDTO inv) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(40);
        table.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.setWidths(new float[]{1.5f, 1f});

        addTotalRow(table, "Subtotal", formatAmount(inv.subtotalLkr()), false);
        if (inv.discountLkr() != null && inv.discountLkr() > 0) {
            addTotalRow(table, "Discount", "- " + formatAmount(inv.discountLkr()), false);
        }
        if (inv.taxLkr() != null && inv.taxLkr() > 0) {
            addTotalRow(table, "Tax", formatAmount(inv.taxLkr()), false);
        }

        PdfPCell divCell = new PdfPCell();
        divCell.setColspan(2);
        divCell.setFixedHeight(1f);
        divCell.setBackgroundColor(ACCENT);
        divCell.setBorder(Rectangle.NO_BORDER);
        table.addCell(divCell);

        addTotalRow(table, "TOTAL (LKR)", formatAmount(inv.totalLkr()), true);
        doc.add(table);
    }

    private void addTotalRow(PdfPTable table, String label, String value, boolean isTotal) {
        Font labelFont = isTotal ? new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, HEADER_BG) : SMALL_FONT;
        Font valueFont = isTotal ? TOTAL_FONT : BODY_FONT;

        PdfPCell lCell = new PdfPCell(new Phrase(label, labelFont));
        lCell.setBorder(Rectangle.NO_BORDER);
        lCell.setPadding(5);
        lCell.setHorizontalAlignment(Element.ALIGN_LEFT);
        table.addCell(lCell);

        PdfPCell vCell = new PdfPCell(new Phrase(value, valueFont));
        vCell.setBorder(Rectangle.NO_BORDER);
        vCell.setPadding(5);
        vCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(vCell);
    }

    private void addNotes(Document doc, String title, String text) throws DocumentException {
        doc.add(new Paragraph(title + ":", BOLD_FONT));
        doc.add(new Paragraph(text, SMALL_FONT));
        doc.add(Chunk.NEWLINE);
    }

    private void addFooter(Document doc) throws DocumentException {
        doc.add(new Paragraph("\n"));
        Paragraph footer = new Paragraph("Generated by PowerHouse Gym Management System", SMALL_FONT);
        footer.setAlignment(Element.ALIGN_CENTER);
        doc.add(footer);
    }

    private String formatAmount(Long amount) {
        if (amount == null) return "0.00";
        return String.format("%,.2f", amount / 100.0);
    }
}
