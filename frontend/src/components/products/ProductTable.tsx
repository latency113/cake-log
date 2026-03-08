import React from "react";
import type { Product } from "../../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PackagePlus } from "lucide-react";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit, onDelete }) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-sm border border-dashed py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <PackagePlus className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">
          ยังไม่มีสินค้า
        </h3>
        <p className="max-w-sm text-muted-foreground">
          เมื่อมีการเพิ่มสินค้าใหม่ ข้อมูลจะแสดงที่นี่
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-sm border shadow-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ชื่อสินค้า</TableHead>
            <TableHead>ราคาต่อปอนด์</TableHead>
            <TableHead>วันที่สร้าง</TableHead>
            <TableHead>วันที่อัพเดท</TableHead>
            <TableHead className="text-right">การดำเนินการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium text-foreground">
                {product.name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                ฿{product.price.toLocaleString()}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(product.createdAt ?? "").toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(product.updatedAt ?? "").toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(product)}>
                      แก้ไข
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(product)}
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      ลบ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTable;
