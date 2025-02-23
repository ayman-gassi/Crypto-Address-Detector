
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface TransactionsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const TransactionsPagination = ({ currentPage, totalPages, onPageChange }: TransactionsPaginationProps) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || // תמיד הצג את העמוד הראשון
        i === totalPages || // תמיד הצג את העמוד האחרון
        (i >= currentPage - 2 && i <= currentPage + 2) // הצג 2 עמודים לפני ואחרי העמוד הנוכחי
      ) {
        pages.push(i);
      } else if (
        (i === currentPage - 3 && currentPage > 4) || // הוסף נקודות אחרי העמוד הראשון
        (i === currentPage + 3 && currentPage < totalPages - 3) // הוסף נקודות לפני העמוד האחרון
      ) {
        pages.push('...');
      }
    }
    return pages.filter((page, index, array) => 
      page === '...' ? array[index - 1] !== '...' : true
    );
  };

  return (
    <Pagination className="my-4">
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious onClick={() => onPageChange(currentPage - 1)} />
          </PaginationItem>
        )}
        
        {getPageNumbers().map((page, index) => (
          <PaginationItem key={index}>
            {page === '...' ? (
              <span className="px-4 py-2">...</span>
            ) : (
              <PaginationLink
                onClick={() => onPageChange(Number(page))}
                isActive={page === currentPage}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext onClick={() => onPageChange(currentPage + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

export default TransactionsPagination;
