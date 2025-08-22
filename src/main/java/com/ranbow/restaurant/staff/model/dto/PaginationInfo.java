package com.ranbow.restaurant.staff.model.dto;

/**
 * Pagination Information for API Responses
 * Provides pagination metadata for paginated endpoints
 */
public class PaginationInfo {
    
    private int currentPage;
    private int pageSize;
    private int totalPages;
    private long totalElements;
    private boolean hasNext;
    private boolean hasPrevious;
    private boolean isFirst;
    private boolean isLast;
    
    // Constructors
    public PaginationInfo() {}
    
    public PaginationInfo(int currentPage, int pageSize, long totalElements) {
        this.currentPage = currentPage;
        this.pageSize = pageSize;
        this.totalElements = totalElements;
        calculatePaginationData();
    }
    
    // Calculate pagination metadata
    private void calculatePaginationData() {
        this.totalPages = (int) Math.ceil((double) totalElements / pageSize);
        this.hasNext = currentPage < totalPages - 1;
        this.hasPrevious = currentPage > 0;
        this.isFirst = currentPage == 0;
        this.isLast = currentPage == totalPages - 1 || totalPages == 0;
    }
    
    // Factory method for creating pagination info from Spring Data Page
    public static PaginationInfo fromPage(org.springframework.data.domain.Page<?> page) {
        PaginationInfo info = new PaginationInfo();
        info.currentPage = page.getNumber();
        info.pageSize = page.getSize();
        info.totalPages = page.getTotalPages();
        info.totalElements = page.getTotalElements();
        info.hasNext = page.hasNext();
        info.hasPrevious = page.hasPrevious();
        info.isFirst = page.isFirst();
        info.isLast = page.isLast();
        return info;
    }
    
    // Getters and Setters
    public int getCurrentPage() {
        return currentPage;
    }
    
    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
        calculatePaginationData();
    }
    
    public int getPageSize() {
        return pageSize;
    }
    
    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
        calculatePaginationData();
    }
    
    public int getTotalPages() {
        return totalPages;
    }
    
    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }
    
    public long getTotalElements() {
        return totalElements;
    }
    
    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
        calculatePaginationData();
    }
    
    public boolean isHasNext() {
        return hasNext;
    }
    
    public void setHasNext(boolean hasNext) {
        this.hasNext = hasNext;
    }
    
    public boolean isHasPrevious() {
        return hasPrevious;
    }
    
    public void setHasPrevious(boolean hasPrevious) {
        this.hasPrevious = hasPrevious;
    }
    
    public boolean isFirst() {
        return isFirst;
    }
    
    public void setFirst(boolean first) {
        isFirst = first;
    }
    
    public boolean isLast() {
        return isLast;
    }
    
    public void setLast(boolean last) {
        isLast = last;
    }
    
    @Override
    public String toString() {
        return "PaginationInfo{" +
                "currentPage=" + currentPage +
                ", pageSize=" + pageSize +
                ", totalPages=" + totalPages +
                ", totalElements=" + totalElements +
                ", hasNext=" + hasNext +
                ", hasPrevious=" + hasPrevious +
                '}';
    }
}