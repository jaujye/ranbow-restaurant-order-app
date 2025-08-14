package com.ranbow.restaurant.api;

import com.ranbow.restaurant.services.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reports")
@CrossOrigin(origins = "*")
public class ReportController {
    
    @Autowired
    private ReportService reportService;
    
    @GetMapping("/daily")
    public ResponseEntity<?> getDailyReport() {
        try {
            ReportService.DailyReport report = reportService.generateDailyReport();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error generating daily report: " + e.getMessage());
        }
    }
    
    @GetMapping("/daily/formatted")
    public ResponseEntity<String> getDailyReportFormatted() {
        try {
            ReportService.DailyReport report = reportService.generateDailyReport();
            String formattedReport = reportService.formatDailyReportAsString(report);
            return ResponseEntity.ok(formattedReport);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error generating daily report: " + e.getMessage());
        }
    }
    
    @GetMapping("/system-overview")
    public ResponseEntity<?> getSystemOverview() {
        try {
            ReportService.SystemOverviewReport report = reportService.generateSystemOverview();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error generating system overview: " + e.getMessage());
        }
    }
    
    @GetMapping("/system-overview/formatted")
    public ResponseEntity<String> getSystemOverviewFormatted() {
        try {
            ReportService.SystemOverviewReport report = reportService.generateSystemOverview();
            String formattedReport = reportService.formatSystemOverviewAsString(report);
            return ResponseEntity.ok(formattedReport);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error generating system overview: " + e.getMessage());
        }
    }
}