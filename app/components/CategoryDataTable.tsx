// "use client"

// import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog"
// import { useCategories, type Category } from "@/hooks/useCategories"
// import { Edit, Trash2 } from "lucide-react"
// import { useState } from "react"

// interface CategoryDataTableProps {
//   categories: Category[]
// }

// export default function CategoryDataTable({ categories }: CategoryDataTableProps) {
//   const { deleteCategory, updateCategory } = useCategories()
//   const [editingId, setEditingId] = useState<string | null>(null)
//   const [editName, setEditName] = useState("")

//   const handleEdit = (id: string, name: string) => {
//     setEditingId(id)
//     setEditName(name)
//   }

//   const handleSave = (id: string) => {
//     updateCategory(id, { name: editName })
//     setEditingId(null)
//   }

//   return (
//     <div className="overflow-x-auto">
//       <table className="w-full text-sm">
//         <thead className="border-b border-border bg-muted">
//           <tr>
//             <th className="text-left py-3 px-4 font-medium">Category Name</th>
//             <th className="text-left py-3 px-4 font-medium">Products Count</th>
//             <th className="text-right py-3 px-4 font-medium">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {categories.length === 0 ? (
//             <tr>
//               <td colSpan={3} className="text-center py-6 text-muted-foreground">
//                 No categories found
//               </td>
//             </tr>
//           ) : (
//             categories.map((category) => (
//               <tr key={category.id} className="border-b border-border hover:bg-muted/50">
//                 <td className="py-3 px-4 font-medium">{category.name}</td>
//                 <td className="py-3 px-4">{category.productCount}</td>
//                 <td className="py-3 px-4 text-right flex justify-end gap-2">
//                   <Dialog>
//                     <DialogTrigger asChild>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         className="gap-1 bg-transparent"
//                         onClick={() => handleEdit(category.id, category.name)}
//                       >
//                         <Edit size={16} />
//                         Edit
//                       </Button>
//                     </DialogTrigger>
//                     <DialogContent>
//                       <DialogHeader>
//                         <DialogTitle>Edit Category</DialogTitle>
//                         <DialogDescription>Update category information</DialogDescription>
//                       </DialogHeader>
//                       <div className="space-y-4">
//                         <input
//                           type="text"
//                           value={editName}
//                           onChange={(e) => setEditName(e.target.value)}
//                           className="w-full px-3 py-2 border rounded-lg"
//                         />
//                         <Button className="w-full" onClick={() => handleSave(category.id)}>
//                           Save Changes
//                         </Button>
//                       </div>
//                     </DialogContent>
//                   </Dialog>

//                   <AlertDialog>
//                     <AlertDialogTrigger asChild>
//                       <Button variant="destructive" size="sm" className="gap-1">
//                         <Trash2 size={16} />
//                         Delete
//                       </Button>
//                     </AlertDialogTrigger>
//                     <AlertDialogContent>
//                       <AlertDialogHeader>
//                         <AlertDialogTitle>Delete Category</AlertDialogTitle>
//                         <AlertDialogDescription>
//                           Are you sure you want to delete "{category.name}"? This action cannot be undone.
//                         </AlertDialogDescription>
//                       </AlertDialogHeader>
//                       <div className="flex gap-2 justify-end">
//                         <AlertDialogCancel>Cancel</AlertDialogCancel>
//                         <AlertDialogAction
//                           onClick={() => deleteCategory(category.id)}
//                           className="bg-red-600 hover:bg-red-700"
//                         >
//                           Delete
//                         </AlertDialogAction>
//                       </div>
//                     </AlertDialogContent>
//                   </AlertDialog>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   )
// }
