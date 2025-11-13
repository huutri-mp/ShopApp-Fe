"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useProducts } from "@/hooks/useProducts"
// import { useUsers } from "@/hooks/useUsers"
// import { useCategories } from "@/hooks/useCategories"
import { Plus, Package, DollarSign, Users, Grid2X2 } from "lucide-react"
import ProductDataTable from "@/app/components/ProductDataTable"
// import UserDataTable from "@/app/components/UserDataTable"
// import CategoryDataTable from "@/app/components/CategoryDataTable"

export default function DashboardPage() {
  const { products } = useProducts()
  // const { users } = useUsers()
  // const { categories } = useCategories()
  const [searchTerm, setSearchTerm] = useState("")

  const totalRevenue = products.reduce((sum, p) => sum + p.price * (p.stock || 0), 0)
  const totalProducts = products.length
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0)
  const averageRating = (products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage products, users, and categories</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button className="gap-2">
            <Plus size={20} />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Total Revenue
              <DollarSign className="w-4 h-4 text-red-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total inventory value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Total Products
              <Package className="w-4 h-4 text-red-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">Active products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Total Users
              <Users className="w-4 h-4 text-red-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold">{users.length}</div> */}
            <p className="text-xs text-muted-foreground mt-1">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Categories
              <Grid2X2 className="w-4 h-4 text-red-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold">{categories.length}</div> */}
            <p className="text-xs text-muted-foreground mt-1">Product categories</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Management Dashboard</CardTitle>
          <CardDescription>Manage products, users, and categories</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Link href="/dashboard/products/new">
                  <Button className="ml-4 gap-2">
                    <Plus size={20} />
                    Add Product
                  </Button>
                </Link>
              </div>
              <ProductDataTable
                products={products.filter(
                  (p) =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.category.toLowerCase().includes(searchTerm.toLowerCase()),
                )}
              />
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              {/* <UserDataTable users={users} /> */}
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-4">
              <div className="flex justify-end">
                <Button className="gap-2">
                  <Plus size={20} />
                  Add Category
                </Button>
              </div>
              {/* <CategoryDataTable categories={categories} /> */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
