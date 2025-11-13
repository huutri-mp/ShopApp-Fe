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
// import { useUsers, type User } from "@/hooks/useUsers"
// import { Edit, Trash2 } from "lucide-react"

// interface UserDataTableProps {
//   users: User[]
// }

// export default function UserDataTable({ users }: UserDataTableProps) {
//   const { deleteUser } = useUsers()

//   return (
//     <div className="overflow-x-auto">
//       <table className="w-full text-sm">
//         <thead className="border-b border-border bg-muted">
//           <tr>
//             <th className="text-left py-3 px-4 font-medium">Name</th>
//             <th className="text-left py-3 px-4 font-medium">Email</th>
//             <th className="text-left py-3 px-4 font-medium">Role</th>
//             <th className="text-left py-3 px-4 font-medium">Joined</th>
//             <th className="text-right py-3 px-4 font-medium">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.length === 0 ? (
//             <tr>
//               <td colSpan={5} className="text-center py-6 text-muted-foreground">
//                 No users found
//               </td>
//             </tr>
//           ) : (
//             users.map((user) => (
//               <tr key={user.id} className="border-b border-border hover:bg-muted/50">
//                 <td className="py-3 px-4 font-medium">{user.name}</td>
//                 <td className="py-3 px-4">{user.email}</td>
//                 <td className="py-3 px-4">
//                   <span
//                     className={`px-2 py-1 rounded text-xs font-medium ${
//                       user.role === "admin" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
//                     }`}
//                   >
//                     {user.role}
//                   </span>
//                 </td>
//                 <td className="py-3 px-4">{user.joinedDate}</td>
//                 <td className="py-3 px-4 text-right flex justify-end gap-2">
//                   <Dialog>
//                     <DialogTrigger asChild>
//                       <Button variant="outline" size="sm" className="gap-1 bg-transparent">
//                         <Edit size={16} />
//                         Edit
//                       </Button>
//                     </DialogTrigger>
//                     <DialogContent>
//                       <DialogHeader>
//                         <DialogTitle>Edit User</DialogTitle>
//                         <DialogDescription>Modify user information</DialogDescription>
//                       </DialogHeader>
//                       <div className="space-y-4">
//                         <input type="text" placeholder={user.name} className="w-full px-3 py-2 border rounded-lg" />
//                         <input type="email" placeholder={user.email} className="w-full px-3 py-2 border rounded-lg" />
//                         <Button className="w-full">Save Changes</Button>
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
//                         <AlertDialogTitle>Delete User</AlertDialogTitle>
//                         <AlertDialogDescription>
//                           Are you sure you want to delete "{user.name}"? This action cannot be undone.
//                         </AlertDialogDescription>
//                       </AlertDialogHeader>
//                       <div className="flex gap-2 justify-end">
//                         <AlertDialogCancel>Cancel</AlertDialogCancel>
//                         <AlertDialogAction onClick={() => deleteUser(user.id)} className="bg-red-600 hover:bg-red-700">
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
