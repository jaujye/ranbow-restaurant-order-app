import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, X, Clock, User, Phone, Package, Hash, 
  TrendingUp, History, Zap
} from 'lucide-react';
import { OrderSearch as OrderSearchType } from '../store/ordersStore';
import { cn } from '../../../shared/utils/cn';

interface OrderSearchProps {
  search: OrderSearchType;
  onSearchChange: (search: Partial<OrderSearchType>) => void;
  onClear: () => void;
  className?: string;
  placeholder?: string;
  showAdvanced?: boolean;
  showHistory?: boolean;
  debounceMs?: number;
}

export function OrderSearch({
  search,
  onSearchChange,
  onClear,
  className,
  placeholder = '搜尋訂單編號、客戶姓名或電話...',
  showAdvanced = true,
  showHistory = true,
  debounceMs = 300
}: OrderSearchProps) {
  const [query, setQuery] = useState(search.query);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('order-search-history');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Update query when search prop changes
  useEffect(() => {
    setQuery(search.query);
  }, [search.query]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (query !== search.query) {
        onSearchChange({ query });
        if (query.trim()) {
          addToHistory(query.trim());
        }
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, search.query, onSearchChange, debounceMs]);

  // Generate suggestions based on query
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const newSuggestions: string[] = [];
    const queryLower = query.toLowerCase();

    // Add search history suggestions
    const historySuggestions = searchHistory
      .filter(item => item.toLowerCase().includes(queryLower) && item !== query)
      .slice(0, 3);
    
    newSuggestions.push(...historySuggestions);

    // Add pattern-based suggestions
    if (/^\d+$/.test(query)) {
      // If query is numeric, suggest it as order number
      newSuggestions.push(`訂單編號: #${query}`);
    } else if (/^09\d{0,8}$/.test(query)) {
      // Taiwan mobile number pattern
      newSuggestions.push(`手機號碼: ${query}`);
    } else if (query.length >= 2) {
      // Name pattern
      newSuggestions.push(`客戶姓名: ${query}`);
    }

    setSuggestions([...new Set(newSuggestions)].slice(0, 5));
  }, [query, searchHistory]);

  // Add to search history
  const addToHistory = (searchTerm: string) => {
    const newHistory = [
      searchTerm,
      ...searchHistory.filter(item => item !== searchTerm)
    ].slice(0, 10); // Keep only 10 most recent searches

    setSearchHistory(newHistory);
    localStorage.setItem('order-search-history', JSON.stringify(newHistory));
  };

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('order-search-history');
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(true);
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    onClear();
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    // Extract actual search term from formatted suggestion
    let searchTerm = suggestion;
    if (suggestion.includes(': ')) {
      searchTerm = suggestion.split(': ')[1];
      if (searchTerm.startsWith('#')) {
        searchTerm = searchTerm.substring(1);
      }
    }

    setQuery(searchTerm);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle field selection change
  const handleFieldsChange = (field: string, checked: boolean) => {
    const currentFields = search.fields || [];
    const newFields = checked
      ? [...currentFields, field as any]
      : currentFields.filter(f => f !== field);

    onSearchChange({ fields: newFields });
  };

  // Search field options
  const searchFields = [
    { key: 'orderNumber', label: '訂單編號', icon: Hash, description: '搜尋訂單編號' },
    { key: 'customerName', label: '客戶姓名', icon: User, description: '搜尋客戶姓名' },
    { key: 'customerPhone', label: '客戶電話', icon: Phone, description: '搜尋聯絡電話' },
    { key: 'items', label: '商品名稱', icon: Package, description: '搜尋訂單中的商品' }
  ];

  // Quick search templates
  const quickSearches = [
    { label: '今日訂單', query: '', description: '搜尋今天的所有訂單' },
    { label: '緊急訂單', query: '緊急', description: '搜尋緊急處理的訂單' },
    { label: '大額訂單', query: '', description: '搜尋金額較高的訂單' }
  ];

  return (
    <div className={cn('relative', className)}>
      {/* Main search input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => {
            // Delay to allow suggestion clicks
            setTimeout(() => {
              setIsFocused(false);
              setShowSuggestions(false);
            }, 200);
          }}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors',
            query && 'pr-20'
          )}
        />

        {/* Action buttons */}
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
          {query && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="清除搜尋"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          {showAdvanced && (
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={cn(
                'p-1 transition-colors',
                isAdvancedOpen 
                  ? 'text-blue-600 hover:text-blue-700'
                  : 'text-gray-400 hover:text-gray-600'
              )}
              title="進階搜尋設定"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search suggestions */}
      {showSuggestions && (isFocused || query) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {/* Current suggestions */}
          {suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                搜尋建議
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {/* Search history */}
          {showHistory && searchHistory.length > 0 && !query && (
            <div className="border-t border-gray-200 py-2">
              <div className="flex items-center justify-between px-3 py-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  搜尋記錄
                </div>
                <button
                  onClick={clearHistory}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  清除記錄
                </button>
              </div>
              {searchHistory.slice(0, 5).map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(item)}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                >
                  <History className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{item}</span>
                </button>
              ))}
            </div>
          )}

          {/* Quick searches */}
          {!query && (
            <div className="border-t border-gray-200 py-2">
              <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                快速搜尋
              </div>
              {quickSearches.map((quickSearch, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(quickSearch.query)}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                >
                  <Zap className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-900">{quickSearch.label}</div>
                    <div className="text-xs text-gray-500">{quickSearch.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Advanced search options */}
      {isAdvancedOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">搜尋範圍</h4>
            <div className="space-y-2">
              {searchFields.map((field) => {
                const Icon = field.icon;
                const isChecked = search.fields?.includes(field.key as any) ?? false;
                
                return (
                  <label key={field.key} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleFieldsChange(field.key, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Icon className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-900">{field.label}</div>
                      <div className="text-xs text-gray-500">{field.description}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Search tips */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">搜尋小技巧</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• 輸入訂單編號（如：12345）快速查找特定訂單</div>
              <div>• 輸入客戶姓名或電話號碼搜尋相關訂單</div>
              <div>• 輸入商品名稱查找包含該商品的訂單</div>
              <div>• 使用空格分隔多個關鍵詞進行組合搜尋</div>
            </div>
          </div>
        </div>
      )}

      {/* Search status indicator */}
      {search.query && (
        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-600">
          <Search className="w-3 h-3" />
          <span>正在搜尋: "{search.query}"</span>
          <span>•</span>
          <span>搜尋範圍: {search.fields?.length || 0} 個欄位</span>
        </div>
      )}
    </div>
  );
}

export default OrderSearch;