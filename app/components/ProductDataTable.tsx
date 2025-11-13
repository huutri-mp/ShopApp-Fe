"use client"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useProducts, type Product } from "@/hooks/useProducts"
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"

interface ProductDataTableProps {
  products: Product[]
}

export default function ProductDataTable({ products }: ProductDataTableProps) {
  const { deleteProduct } = useProducts()

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted">
          <tr>
            <th className="text-left py-3 px-4 font-medium">Name</th>
            <th className="text-left py-3 px-4 font-medium">Category</th>
            <th className="text-right py-3 px-4 font-medium">Price</th>
            <th className="text-right py-3 px-4 font-medium">Stock</th>
            <th className="text-center py-3 px-4 font-medium">Rating</th>
            <th className="text-right py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-6 text-muted-foreground">
                No products found
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                <td className="py-3 px-4 font-medium">{product.name}</td>
                <td className="py-3 px-4">{product.category}</td>
                <td className="py-3 px-4 text-right font-semibold text-red-600">${product.price.toFixed(2)}</td>
                <td className="py-3 px-4 text-right">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      product.stock > 10
                        ? "bg-green-100 text-green-800"
                        : product.stock > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-amber-500 font-semibold">{product.rating.toFixed(1)}/5</td>
                <td className="py-3 px-4 text-right flex justify-end gap-2">
                  <Link href={`/dashboard/products/${product.id}/edit`}>
                    <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                      <Edit size={16} />
                      Edit
                    </Button>
                  </Link>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="gap-1">
                        <Trash2 size={16} />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{product.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex gap-2 justify-end">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteProduct(product.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
