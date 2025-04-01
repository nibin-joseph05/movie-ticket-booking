package com.movieticketbooking.movieflix.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.movieticketbooking.movieflix.models.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TicketService {

    @Value("${app.base.url}")
    private String baseUrl;

    // Colors
    private static final BaseColor PRIMARY_COLOR = new BaseColor(229, 9, 20); // MovieFlix red
    private static final BaseColor SECONDARY_COLOR = new BaseColor(30, 30, 46); // Dark background
    private static final BaseColor TEXT_COLOR = new BaseColor(255, 255, 255); // White text

    public byte[] generateTicketPdf(Booking booking, Showtime showtime,
                                    List<BookedSeat> seats, List<FoodOrder> foodOrders,
                                    Map<String, Object> movieDetails,
                                    Map<String, Object> theaterDetails) throws DocumentException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate()); // Landscape orientation

        PdfWriter writer = PdfWriter.getInstance(document, outputStream);
        document.open();

        // Add custom header/footer
        writer.setPageEvent(new CustomPdfPageEventHelper());

        addTicketContent(document, booking, showtime, seats, foodOrders, movieDetails, theaterDetails);
        document.close();

        return outputStream.toByteArray();
    }

    private void addTicketContent(Document document, Booking booking, Showtime showtime,
                                  List<BookedSeat> seats, List<FoodOrder> foodOrders,
                                  Map<String, Object> movieDetails,
                                  Map<String, Object> theaterDetails) throws DocumentException {
        try {
            // Create a table for the main layout (2 columns)
            PdfPTable mainTable = new PdfPTable(2);
            mainTable.setWidthPercentage(100);
            mainTable.setSpacingBefore(20f);
            mainTable.setSpacingAfter(20f);

            // Left column - Movie details
            PdfPCell leftCell = new PdfPCell();
            leftCell.setBorder(Rectangle.NO_BORDER);
            leftCell.setPadding(20);
            leftCell.setBackgroundColor(SECONDARY_COLOR);

            // Movie poster
            String posterPath = movieDetails != null ? getSafeString(movieDetails.get("poster_path")) : "";
            Image moviePoster = getMoviePoster(posterPath);
            moviePoster.scaleToFit(200, 300);
            leftCell.addElement(moviePoster);

            // Movie title
            String movieTitleStr = movieDetails != null ?
                    getSafeString(movieDetails.get("title"), "Unknown Movie") : "Unknown Movie";
            Font movieTitleFont = new Font(Font.FontFamily.HELVETICA, 24, Font.BOLD, TEXT_COLOR);
            Paragraph movieTitle = new Paragraph(movieTitleStr, movieTitleFont);
            movieTitle.setAlignment(Element.ALIGN_CENTER);
            movieTitle.setSpacingAfter(10f);
            leftCell.addElement(movieTitle);

            // Movie details table
            PdfPTable movieDetailsTable = new PdfPTable(2);
            movieDetailsTable.setWidthPercentage(100);
            movieDetailsTable.setSpacingBefore(10f);

            // Handle genre formatting
            String genreText = "Not specified";
            if (movieDetails != null && movieDetails.get("genres") != null) {
                try {
                    List<Map<String, Object>> genres = (List<Map<String, Object>>) movieDetails.get("genres");
                    genreText = genres.stream()
                            .map(g -> g.get("name").toString())
                            .collect(Collectors.joining(", "));
                } catch (Exception e) {
                    genreText = getSafeString(movieDetails.get("genres"));
                }
            }

            addDetailRow(movieDetailsTable, "Genre:", genreText);
            addDetailRow(movieDetailsTable, "Rating:",
                    movieDetails != null ? getSafeString(movieDetails.get("vote_average"), "N/A") + "/10" : "N/A");
            addDetailRow(movieDetailsTable, "Duration:",
                    movieDetails != null ? getSafeString(movieDetails.get("runtime"), "Not specified") + " min" : "Not specified");
            addDetailRow(movieDetailsTable, "Language:",
                    movieDetails != null ? getLanguageName(getSafeString(movieDetails.get("original_language"))) : "English");

            leftCell.addElement(movieDetailsTable);
            mainTable.addCell(leftCell);

            // Right column - Booking details
            PdfPCell rightCell = new PdfPCell();
            rightCell.setBorder(Rectangle.NO_BORDER);
            rightCell.setPadding(20);
            rightCell.setBackgroundColor(new BaseColor(18, 18, 29));

            // Ticket header
            Font ticketHeaderFont = new Font(Font.FontFamily.HELVETICA, 20, Font.BOLD, PRIMARY_COLOR);
            Paragraph ticketHeader = new Paragraph("E-TICKET", ticketHeaderFont);
            ticketHeader.setAlignment(Element.ALIGN_CENTER);
            ticketHeader.setSpacingAfter(15f);
            rightCell.addElement(ticketHeader);

            // Booking reference
            Font refFont = new Font(Font.FontFamily.COURIER, 12, Font.BOLD, TEXT_COLOR);
            Paragraph bookingRef = new Paragraph("Booking #: " + booking.getBookingReference(), refFont);
            bookingRef.setAlignment(Element.ALIGN_CENTER);
            bookingRef.setSpacingAfter(20f);
            rightCell.addElement(bookingRef);

            // Showtime details
            PdfPTable showtimeTable = new PdfPTable(2);
            showtimeTable.setWidthPercentage(100);
            showtimeTable.setSpacingBefore(10f);

            // Handle theater name and address
            String theaterName = theaterDetails != null ?
                    extractTheaterName(theaterDetails) : "Unknown Theater";
            String theaterAddress = theaterDetails != null ?
                    getSafeString(theaterDetails.get("formattedAddress"), "Address not available") : "Address not available";

            addDetailRow(showtimeTable, "Theater:", theaterName);
            addDetailRow(showtimeTable, "Address:", theaterAddress);
            addDetailRow(showtimeTable, "Date:", showtime != null ? showtime.getDate().toString() : "Not specified");
            addDetailRow(showtimeTable, "Time:", showtime != null ? showtime.getTime() : "Not specified");

            rightCell.addElement(showtimeTable);

            // Seats section
            // In the addTicketContent method, modify the seats section like this:

// Seats section
            if (seats != null && !seats.isEmpty()) {
                Font sectionFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, PRIMARY_COLOR);
                Paragraph seatsHeader = new Paragraph("Your Seats", sectionFont);
                seatsHeader.setSpacingBefore(20f);
                seatsHeader.setSpacingAfter(10f);
                rightCell.addElement(seatsHeader);

                // Calculate total seats price
                double seatsTotal = seats.stream().mapToDouble(BookedSeat::getPrice).sum();

                // Create seats table - adjust columns based on seat count
                int seatsPerRow = Math.min(4, seats.size()); // Max 4 seats per row
                PdfPTable seatsTable = new PdfPTable(seatsPerRow);
                seatsTable.setWidthPercentage(100);
                seatsTable.setSpacingBefore(10f);

                for (BookedSeat seat : seats) {
                    if (seat.getSeatNumber() != null && !seat.getSeatNumber().isEmpty()) {
                        PdfPCell seatCell = new PdfPCell(new Phrase(seat.getSeatNumber(),
                                new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, TEXT_COLOR)));
                        seatCell.setBorder(Rectangle.NO_BORDER);
                        seatCell.setBackgroundColor(PRIMARY_COLOR);
                        seatCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                        seatCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                        seatCell.setFixedHeight(30f);
                        seatCell.setPadding(5f);
                        seatsTable.addCell(seatCell);
                    }
                }

                // Add the seats table only if it has cells
                if (seatsTable.getRows().size() > 0) {
                    rightCell.addElement(seatsTable);

                    // Add seats total price
                    Font priceFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, TEXT_COLOR);
                    Paragraph seatsTotalPara = new Paragraph("Seats Total: ₹" + String.format("%.2f", seatsTotal), priceFont);
                    seatsTotalPara.setSpacingBefore(10f);
                    seatsTotalPara.setAlignment(Element.ALIGN_RIGHT);
                    rightCell.addElement(seatsTotalPara);
                }
            }

            // Food items if any
            if (foodOrders != null && !foodOrders.isEmpty()) {
                Font sectionFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, PRIMARY_COLOR);
                Paragraph foodHeader = new Paragraph("Food & Beverages", sectionFont);
                foodHeader.setSpacingBefore(20f);
                foodHeader.setSpacingAfter(10f);
                rightCell.addElement(foodHeader);

                PdfPTable foodTable = new PdfPTable(2);
                foodTable.setWidthPercentage(100);
                foodTable.setWidths(new float[]{3, 1});
                foodTable.setSpacingBefore(10f);

                double foodTotal = 0;
                for (FoodOrder food : foodOrders) {
                    String foodName = food.getFoodItem() != null ? food.getFoodItem().getName() : "Unknown Item";
                    double itemPrice = food.getPriceAtOrder() != null ? food.getPriceAtOrder() : 0;
                    String price = food.getQuantity() + " x ₹" + String.format("%.2f", itemPrice);
                    addFoodRow(foodTable, foodName, price);
                    foodTotal += itemPrice * food.getQuantity();
                }
                rightCell.addElement(foodTable);

                // Add food total price
                Font priceFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, TEXT_COLOR);
                Paragraph foodTotalPara = new Paragraph("Food Total: ₹" + String.format("%.2f", foodTotal), priceFont);
                foodTotalPara.setSpacingBefore(10f);
                foodTotalPara.setAlignment(Element.ALIGN_RIGHT);
                rightCell.addElement(foodTotalPara);
            }

            // Add grand total if we have both seats and food
            if ((seats != null && !seats.isEmpty()) || (foodOrders != null && !foodOrders.isEmpty())) {
                double seatsTotal = seats != null ? seats.stream().mapToDouble(BookedSeat::getPrice).sum() : 0;
                double foodTotal = foodOrders != null ?
                        foodOrders.stream().mapToDouble(f -> f.getPriceAtOrder() * f.getQuantity()).sum() : 0;
                double grandTotal = seatsTotal + foodTotal;

                Font totalFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, PRIMARY_COLOR);
                Paragraph grandTotalPara = new Paragraph("Grand Total: ₹" + String.format("%.2f", grandTotal), totalFont);
                grandTotalPara.setSpacingBefore(15f);
                grandTotalPara.setAlignment(Element.ALIGN_RIGHT);
                rightCell.addElement(grandTotalPara);
            }

            // QR Code
            Font sectionFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, PRIMARY_COLOR);
            Paragraph qrHeader = new Paragraph("Scan at Theater", sectionFont);
            qrHeader.setSpacingBefore(20f);
            qrHeader.setSpacingAfter(10f);
            rightCell.addElement(qrHeader);

            String qrCodeUrl = baseUrl + "/verify-ticket?ref=" + booking.getBookingReference();
            BarcodeQRCode qrCode = new BarcodeQRCode(qrCodeUrl, 150, 150, null);
            Image qrCodeImage = qrCode.getImage();
            qrCodeImage.setAlignment(Element.ALIGN_CENTER);
            rightCell.addElement(qrCodeImage);

            // Terms and conditions
            Paragraph terms = new Paragraph(
                    "Terms: This ticket is non-refundable. Please arrive 30 minutes before showtime.",
                    new Font(Font.FontFamily.HELVETICA, 8, Font.NORMAL, TEXT_COLOR));
            terms.setSpacingBefore(15f);
            rightCell.addElement(terms);

            mainTable.addCell(rightCell);
            document.add(mainTable);

        } catch (Exception e) {
            throw new DocumentException("Error generating ticket content", e);
        }
    }

    private String extractTheaterName(Map<String, Object> theaterDetails) {
        if (theaterDetails == null) {
            return "Unknown Theater";
        }

        // Try different ways to get theater name
        if (theaterDetails.get("displayName") != null) {
            if (theaterDetails.get("displayName") instanceof Map) {
                return ((Map<String, Object>) theaterDetails.get("displayName")).get("text").toString();
            }
            return theaterDetails.get("displayName").toString();
        }
        if (theaterDetails.get("name") != null) {
            return theaterDetails.get("name").toString();
        }
        return "Unknown Theater";
    }

    private String getLanguageName(String languageCode) {
        // Simple language code to name mapping
        switch (languageCode.toLowerCase()) {
            case "en": return "English";
            case "hi": return "Hindi";
            case "ml": return "Malayalam";
            case "ta": return "Tamil";
            case "te": return "Telugu";
            case "kn": return "Kannada";
            default: return languageCode;
        }
    }

    private String getSafeString(Object value) {
        return getSafeString(value, "");
    }

    private String getSafeString(Object value, String defaultValue) {
        return value != null ? value.toString() : defaultValue;
    }

    private Image getMoviePoster(String posterPath) throws Exception {
        try {
            if (posterPath == null || posterPath.isEmpty()) {
                return getDefaultPoster();
            }

            URL posterUrl = new URL("https://image.tmdb.org/t/p/w500" + posterPath);
            Image image = Image.getInstance(posterUrl);
            image.scaleToFit(200, 300);
            return image;
        } catch (Exception e) {
            return getDefaultPoster();
        }
    }

    private Image getDefaultPoster() throws Exception {
        try {
            // First try to load the default poster from resources
            return Image.getInstance(getClass().getResource("/static/images/default-poster.jpg"));
        } catch (Exception e) {
            // Create a blank image with some placeholder content
            int width = 200;
            int height = 300;

            // Create a temporary PDF document to draw on
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(new Rectangle(width, height));
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            document.open();

            // Draw a background rectangle
            PdfContentByte canvas = writer.getDirectContent();
            canvas.setColorFill(new BaseColor(50, 50, 50)); // Dark gray background
            canvas.rectangle(0, 0, width, height);
            canvas.fill();

            // Add placeholder text
            Font font = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, BaseColor.WHITE);
            Phrase phrase = new Phrase("No Poster Available", font);
            ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
                    phrase,
                    width / 2, height / 2, 0);

            document.close();

            // Create an image from the PDF content
            return Image.getInstance(baos.toByteArray());
        }
    }

    private void addDetailRow(PdfPTable table, String label, String value) {
        Font labelFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, PRIMARY_COLOR);
        Font valueFont = new Font(Font.FontFamily.HELVETICA, 12, Font.NORMAL, TEXT_COLOR);

        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPaddingBottom(5f);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPaddingBottom(5f);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addFoodRow(PdfPTable table, String item, String price) {
        Font itemFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, TEXT_COLOR);
        Font priceFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, TEXT_COLOR);

        PdfPCell itemCell = new PdfPCell(new Phrase(item, itemFont));
        itemCell.setBorder(Rectangle.NO_BORDER);
        itemCell.setPaddingBottom(5f);

        PdfPCell priceCell = new PdfPCell(new Phrase(price, priceFont));
        priceCell.setBorder(Rectangle.NO_BORDER);
        priceCell.setPaddingBottom(5f);
        priceCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        table.addCell(itemCell);
        table.addCell(priceCell);
    }

    // Helper class for header/footer
    private class CustomPdfPageEventHelper extends PdfPageEventHelper {
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            try {
                PdfContentByte canvas = writer.getDirectContent();

                // Add header (without logo)
                canvas.saveState();
                canvas.setColorFill(PRIMARY_COLOR);
                canvas.rectangle(0, document.top() + 10, document.getPageSize().getWidth(), 30);
                canvas.fill();
                canvas.restoreState();

                // Add footer
                canvas.saveState();
                canvas.setColorFill(SECONDARY_COLOR);
                canvas.rectangle(0, 0, document.getPageSize().getWidth(), 30);
                canvas.fill();
                canvas.restoreState();

                // Add footer text
                ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
                        new Phrase("Thank you for choosing MovieFlix",
                                new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, TEXT_COLOR)),
                        document.getPageSize().getWidth() / 2, 15, 0);

            } catch (Exception e) {
                // Ignore errors
            }
        }
    }
}