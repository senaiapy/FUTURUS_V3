import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from './text';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
};

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisiblePages = 3,
}) => {
  // Don't render if there's only one page or no pages
  if (totalPages <= 1)
    return null;

  // Calculate visible page range
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i,
    );
  };

  const visiblePages = getVisiblePages();

  const handlePageClick = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <View className="py-4">
      <View className="items-center justify-center">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 6 }}
        >
          {/* INICIO Button - First Page Icon */}
          {showFirstLast && currentPage > 1 && (
            <TouchableOpacity
              onPress={() => handlePageClick(1)}
              className="h-10 w-10 items-center justify-center rounded-lg bg-emerald-600"
              style={{
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
              }}
            >
              <ChevronsLeft size={20} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          )}

          {/* Previous Button - Anterior Icon */}
          {currentPage > 1 && (
            <TouchableOpacity
              onPress={() => handlePageClick(currentPage - 1)}
              className="h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white"
              style={{
                elevation: 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              }}
            >
              <ChevronLeft size={20} color="#374151" strokeWidth={2.5} />
            </TouchableOpacity>
          )}

          {/* Page Numbers */}
          {visiblePages.map(page => (
            <TouchableOpacity
              key={page}
              onPress={() => handlePageClick(page)}
              className={`min-w-[40px] rounded-lg px-3 py-2.5 ${
                page === currentPage
                  ? 'bg-emerald-600'
                  : 'border border-gray-300 bg-white'
              }`}
              style={{
                elevation: page === currentPage ? 2 : 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: page === currentPage ? 0.2 : 0.1,
                shadowRadius: 2,
              }}
            >
              <Text
                className={`text-center text-sm font-medium ${
                  page === currentPage ? 'text-white' : 'text-gray-700'
                }`}
              >
                {page}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Next Button - Siguiente Icon */}
          {currentPage < totalPages && (
            <TouchableOpacity
              onPress={() => handlePageClick(currentPage + 1)}
              className="h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white"
              style={{
                elevation: 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              }}
            >
              <ChevronRight size={20} color="#374151" strokeWidth={2.5} />
            </TouchableOpacity>
          )}

          {/* FINAL Button - Last Page Icon */}
          {showFirstLast && currentPage < totalPages && (
            <TouchableOpacity
              onPress={() => handlePageClick(totalPages)}
              className="h-10 w-10 items-center justify-center rounded-lg bg-emerald-600"
              style={{
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
              }}
            >
              <ChevronsRight size={20} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </View>
  );
};
