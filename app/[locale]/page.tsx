"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/data/useCategories";
import {
  useProductSearch,
  type ProductResponse,
} from "@/hooks/data/useProducts";
import { Link } from "@/i18n/routing";
import ProductCard from "../components/ProductCard";
import LanguageSwitcher from "../components/LanguageSwitcher";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function Home() {
  const t = useTranslations();
  const { categories } = useCategories(0, 8);
  const cats = categories?.data?.items ?? [];

  const featuredQuery = useProductSearch({ isFeatured: true, size: 8 });
  const featured = React.useMemo<ProductResponse[]>(() => {
    const d: any = featuredQuery.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.items)) return d.items;
    return [];
  }, [featuredQuery.data]);

  return (
    <main className="min-h-screen bg-background">
      <section className="bg-gradient-to-b from-secondary to-background py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground text-balance leading-tight">
              {t("home.title", {
                defaultValue: "Cutting-edge technology for your digital life",
              })}
            </h1>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed">
              {t("home.subtitle", {
                defaultValue:
                  "Discover the latest gadgets, devices, and accessories from the world's leading tech brands. Stay ahead with innovation.",
              })}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Link href="/products">
                  {t("hero.shopNow", { defaultValue: "Shop Now" })}
                </Link>
              </Button>
              <Button
                variant="outline"
                className="text-foreground border-foreground/20 bg-transparent"
                onClick={() => {
                  document
                    .getElementById("categories")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {t("home.exploreCategories", {
                  defaultValue: "Explore Categories",
                })}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-12">
            {t("home.shopByCategory", { defaultValue: "Shop by Category" })}
          </h2>

          <Carousel className="w-full">
            <CarouselContent className="ml-0 gap-4">
              {cats.map((category) => (
                <CarouselItem
                  key={category.id}
                  className="basis-auto md:basis-1/2 lg:basis-1/4 pl-0"
                >
                  <Link
                    href={`/products?categoryId=${category.id}`}
                    className="group cursor-pointer overflow-hidden rounded-lg block"
                  >
                    <div className="relative bg-muted h-64 md:h-72 overflow-hidden">
                      <div className="relative bg-muted h-64 md:h-72 overflow-hidden">
                        <img
                          src={`/images/categories/${category.slug}.png`}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <h3 className="text-xl font-serif font-semibold text-foreground">
                        {category.name}
                      </h3>
                      <span className="text-accent">→</span>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                {t("home.featuredTitle", { defaultValue: "Featured Products" })}
              </h2>
              <p className="text-foreground/60 mt-2">
                {t("home.featuredSubtitle", {
                  defaultValue: "Best sellers and latest releases",
                })}
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="text-foreground border-foreground/20 w-fit bg-transparent"
            >
              <Link href="/products">
                {t("home.viewAllProducts", {
                  defaultValue: "View All Products",
                })}
              </Link>
            </Button>
          </div>

          <Carousel className="w-full">
            <CarouselContent className="ml-0 gap-4">
              {featured.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="basis-auto md:basis-1/2 lg:basis-1/4 pl-0"
                >
                  <ProductCard product={product as any} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="bg-muted h-96 rounded-lg overflow-hidden">
              <img
                src={`/images/our-mission.png`}
                alt="Our story"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                {t("home.missionTitle", { defaultValue: "Our Mission" })}
              </h2>
              <p className="text-foreground/70 leading-relaxed">
                {t("home.missionContent1", {
                  defaultValue:
                    "We're dedicated to bringing the latest technology innovations to tech enthusiasts and professionals. Our carefully curated selection features products from trusted brands worldwide.",
                })}
              </p>
              <p className="text-foreground/70 leading-relaxed">
                {t("home.missionContent2", {
                  defaultValue:
                    "Every product is tested for quality and performance, ensuring you get the best tech for your needs. We believe technology should be accessible, reliable, and transformative.",
                })}
              </p>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {t("home.learnAboutUs", { defaultValue: "Learn About Us" })}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* <section className="py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-serif font-bold">
            Stay Tech-Savvy
          </h2>
          <p className="text-primary-foreground/80">
            Subscribe for exclusive deals, tech reviews, product launches, and
            expert buying guides delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-white/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <Button className="bg-white hover:bg-white/90 text-primary">
              Subscribe
            </Button>
          </div>
        </div>
      </section> */}
    </main>
  );
}
